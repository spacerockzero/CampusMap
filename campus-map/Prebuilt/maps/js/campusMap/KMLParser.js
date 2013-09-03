function KMLParser() {
	this.doc = arguments[0].childNodes[0].childNodes[1];
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
	var folder = this.doc.getElementsByTagName("Folder")[0];

	this.categoryName = folder.getElementsByTagName("name")[0].textContent;
	var description = folder.getElementsByTagName("description")[0];
	var result = this.extractLinkText((description === undefined) ? "" : description.textContent);
	this.categoryText = result[1];
	this.link = result[0];
	result = this.extractSrcFromImage(this.categoryText);
	this.categoryColor = result[0].split("//")[1];
	this.categoryText = result[1];

	result = this.parseAllObjects(folder);

	this.Locations = result[0];
	this.Areas = result[1];
	//we don't need the xml document anymore
	this.doc = null;
}


//this function will parse all of the placemarks according to whether they are a marker or a polygon
KMLParser.prototype.parseAllObjects = function(folder) {
	var folders = folder.getElementsByTagName("Folder");

	var placemarkContainer = [];
	var polygonContainer = [];

	//if there are polygons 
	//we want to do the Folders first because there are Placemark
	//tags in Folders and we don't want them to be mistaken for
	//markers
	if (folders !== undefined) {
		while (folders.length) {
			polygonContainer.push(this.parsePolygon(folders[0]));
		}
	}


	var placemarks = folder.getElementsByTagName("Placemark");

	//if there are points
	if (placemarks !== undefined) {
		for (var i = 0, len = placemarks.length; i < len; i++) {
			placemarkContainer.push(this.parsePlacemark(placemarks[i]));
		}
	}

	return [placemarkContainer, polygonContainer];
}


//parses all of the polygons
KMLParser.prototype.parsePolygon = function(folder) {
	var polygonFolder = {};
	polygonFolder.name = folder.getElementsByTagName("name")[0].textContent;
	polygonFolder.code = this.extractCode(folder.getElementsByTagName("description")[0].textContent)[0];
	polygonFolder.polygons = [];

	var placemarks = folder.getElementsByTagName("Placemark");
	//get all of the individual polygons
	for (var i = 0, len = placemarks.length; i < len; i++) {
		var polygon = placemarks[i];
		var style = this.getColors(polygon.getElementsByTagName("styleUrl")[0].textContent);
		var description = polygon.getElementsByTagName("description")[0];
		polygonFolder.polygons.push({
			name: polygon.getElementsByTagName("name")[0].textContent,
			description: (description) ? description.textContent : "",
			coordinates: this.parseLatLng(polygon.getElementsByTagName("coordinates")[0].textContent),
			lineColor: style[0],
			polyColor: style[1]
		});
	}

	folder.remove();

	return polygonFolder;
}


//parses all of the points
KMLParser.prototype.parsePlacemark = function(placemark) {
	var placemarkHolder = {};
	placemarkHolder.name = placemark.getElementsByTagName("name")[0].textContent;
	var description = placemark.getElementsByTagName("description")[0];
	var result = this.extractLinkText((description) ? description.textContent : "");
	placemarkHolder.link = result[0];
	placemarkHolder.description = result[1];
	result = this.extractSrcFromImage(placemarkHolder.description);
	placemarkHolder.image = result[0];
	placemarkHolder.description = result[1];
	result = this.extractHours(placemarkHolder.description);
	placemarkHolder.hours = result[0];
	placemarkHolder.description = result[1];
	result = this.extractCode(placemarkHolder.description);
	placemarkHolder.code = result[0];
	placemarkHolder.description = result[1];	
	placemarkHolder.coordinates = this.parseLatLng(placemark.getElementsByTagName("coordinates")[0].textContent);
	placemarkHolder.icon = this.getIcon(placemark.getElementsByTagName("styleUrl")[0].textContent);

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
			anchor = string.substr(stringAnchorStart, stringAnchorEnd - stringAnchorStart);
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
			image = string.substr(stringImageStart, stringImageEnd - stringImageStart);
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
			hours = string.substr(hoursStartTag + 7, hoursEndTag - (hoursStartTag + 7));
			string = string.substr(0, hoursStartTag) + string.substr(hoursEndTag + 8);
		}
	}

	return [hours, string];
}
//this function wll extract the hours from the string
KMLParser.prototype.extractCode = function(string) {
	var code = "";
	if (string !== undefined) {
		var codeStartTag = string.indexOf("<code>");
		if (codeStartTag !== -1) {
			var codeEndTag = string.indexOf("</code>");
			code = string.substr(codeStartTag + 6, codeEndTag - (codeStartTag + 6));
			string = string.substr(0, codeStartTag) + string.substr(codeEndTag + 7);
		}
	}

	return [code, string];
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


