function KMLParser() {
	// Create x2js instance with default config
    var x2js = new X2JS();
	
 	// Available options
    var x2jsOptionsSample = new X2JS({
    	// Escaping XML characters. Default is true from v1.1.0+
    	escapeMode : true, 				
    	// XML attributes prefix. Default is "_"
    	attributePrefix : "_",
    	// Array access form (none|property). Use property if you want X2JS generate additional property <element>_asArray to access in array form any element
    	// Default is none from v1.1.0+
    	arrayAccessForm : "none"
    });

	this.doc = arguments[0].childNodes[0].childNodes[1];
	this.json = x2js.xml2json(arguments[0]);
	this.categoryName;
	this.categoryText;
	this.categoryColor;
	this.link;
	this.image;

	this.Locations = [];
	this.Areas = [];

	this.foundStyles = [];

	this.parseKML();
}


//top level function to parse the KML
KMLParser.prototype.parseKML = function() {
	//get the category folder
	var folder = this.json.kml.Document.Folder;

	this.categoryName = folder.name;
	var result = this.extractLinkText((folder.description.__cdata === undefined) ? folder.description : folder.description.toString());
	this.categoryText = result[1];
	this.link = result[0];
	result = this.extractSrcFromImage(this.categoryText);
	this.categoryColor = result[0].split("//")[1];
	this.categoryText = result[1];

	result = this.parseAllObjects(folder);

	this.Locations = result[0];
	this.Areas = result[1];

	//determine 
}


//this function will parse all of the placemarks according to whether they are a marker or a polygon
KMLParser.prototype.parseAllObjects = function(folder) {
	var placemarks = folder.Placemark;
	var folders = folder.Folder;

	var placemarkContainer = [];
	var polygonContainer = [];

	//if there are points
	if (placemarks !== undefined) {
		for (var i = 0, len = placemarks.length; i < len; i++) {
			placemarkContainer.push(this.parsePlacemark(placemarks[i]));
		}
	}
	//if there are polygons
	if (folders !== undefined) {
		for (var i = 0, len = folders.length; i < len; i++) {
			polygonContainer.push(this.parsePolygon(folders[i]));
		}
	}

	return [placemarkContainer, polygonContainer];
}


//parses all of the polygons
KMLParser.prototype.parsePolygon = function(folder) {
	var polygonFolder = {};
	polygonFolder.name = folder.name;
	polygonFolder.polygons = [];

	if (folder.Placemark instanceof Array) {
		//get all of the individual polygons
		for (var i = 0, len = folder.Placemark.length; i < len; i++) {
			var polygon = folder.Placemark[i];
			var style = this.getColors(polygon.styleUrl);
			polygonFolder.polygons.push({
				name: polygon.name,
				description: polygon.description,
				coordinates: this.parseLatLng(polygon.Polygon.outerBoundaryIs.LinearRing.coordinates),
				lineColor: style[0],
				polyColor: style[1]
			});
		}
	} else {
		var polygon = folder.Placemark;
		var style = this.getColors(polygon.styleUrl);
		polygonFolder.polygons.push({
			name: polygon.name,
				description: polygon.description,
				coordinates: this.parseLatLng(polygon.Polygon.outerBoundaryIs.LinearRing.coordinates),
				lineColor: style[0],
				polyColor: style[1]
		});
	}

	return polygonFolder;
}


//parses all of the points
KMLParser.prototype.parsePlacemark = function(placemark) {
	var placemarkHolder = {};
	placemarkHolder.name = placemark.name;
	var result = this.extractLinkText((placemark.description.__cdata === undefined) ? placemark.description : placemark.description.toString());
	placemarkHolder.link = result[0];
	placemarkHolder.description = result[1];
	result = this.extractSrcFromImage(placemarkHolder.description);
	placemarkHolder.image = result[0];
	placemarkHolder.description = result[1];
	result = this.extractHours(placemarkHolder.description);
	placemarkHolder.hours = result[0];
	placemarkHolder.description = result[1];
	placemarkHolder.coordinates = this.parseLatLng(placemark.Point.coordinates);
	placemarkHolder.icon = this.getIcon(placemark.styleUrl);

	return placemarkHolder;
}


//this function will take a string of latitudes and longitudes and parse them into an array of just latitudes and longitudes
//Google Earth outputs the Lat, Lng, and what I'm assuming is altitude but it's always zero so it has to get rid of the zero too
KMLParser.prototype.parseLatLng = function(string) {
	var latlngs = [];
	var strings = string.replace('\n', '').trim().split(' ');
	for (var i = 0, len = strings.length; i < len; i++) {
		var split = strings[i].split(',');
		//put the latitude first and then the longitude
		latlngs.push([split[1], split[0]]);
	}
	return latlngs;
}

//this function will extract the url from the link in any string
KMLParser.prototype.extractLinkText = function(string) {
	var anchor = "";
	if (string !== undefined) {
		var stringAnchorStart = string.indexOf("<a");
		if (stringAnchorStart !== -1) {
			var stringAnchorEnd = string.indexOf("</a>") + 4;
			anchor = string.substr(stringAnchorStart, stringAnchorEnd);
			endAnchorPos = anchor.indexOf('>') + 1;
			anchor = anchor.substr(endAnchorPos, anchor.length - 4 - endAnchorPos);
			string = string.substr(0, stringAnchorStart) + string.substr(stringAnchorEnd);
		}
	}

	return [anchor, string];
}


//this function will extract the src from the image in any string
KMLParser.prototype.extractSrcFromImage = function(string) {
	var image = "";
	if (string !== undefined) {
		var stringImageStart = string.indexOf("<img");
		if (stringImageStart !== -1) {
			var stringImageEnd = string.indexOf("/>") + 2;
			image = string.substr(stringImageStart, stringImageEnd);
			srcStartPos = image.indexOf('src=') + 5;
			image = image.substr(srcStartPos, image.length - srcStartPos - 3);
			string = string.substr(0, stringImageStart) + string.substr(stringImageEnd);
		}
	}

	return [image, string];
}


//this function wll extract the hours from the string
KMLParser.prototype.extractHours = function(string) {
	var hours = "";
	if (string !== undefined) {
		var hoursStartTag = string.indexOf("<hours>");
		if (hoursStartTag !== -1) {
			var hoursEndTag = string.indexOf("</hours>");
			var hours = string.substr(hoursStartTag + 7, hoursEndTag);
			string = string.substr(0, hoursStartTag) + string.substr(hoursEndTag + 8);
		}
	}

	return [hours, string];
}


//these functions below are for getting the icon styles
KMLParser.prototype.getIcon = function(id) {
	var icon = "";
	if (this.foundStyles[id]) {
		icon = this.foundStyles[id];
	} else {
		icon = this.doc.querySelector("[id='" + this.doc.querySelector("[id='" + id.substr(1) + "']").getElementsByTagName("styleUrl")[0].innerHTML.substr(1) + "']").querySelector("href").innerHTML;
		this.foundStyles[id] = icon;
	}
	return icon;
}

KMLParser.prototype.getColors = function(id) {
	var lineColor = "";
	var polyColor = "";
	var style = [];
	if (this.foundStyles[id]) {
		style = this.foundStyles[id];
	} else {
		var styles = this.doc.querySelector("[id='" + this.doc.querySelector("[id='" + id.substr(1) + "']").getElementsByTagName("styleUrl")[0].innerHTML.substr(1) + "']");
		var lineColor = (styles.querySelector("LineStyle")) ? styles.querySelector("LineStyle color").innerHTML.substr(2) : "FFFFF";
		var polyColor = (styles.querySelector("PolyStyle")) ? styles.querySelector("PolyStyle color").innerHTML.substr(2) : "FFFFF";
		style = ['#' + lineColor, '#' + polyColor];
		this.foundStyles[id] = style;
	}
	return style;
}


