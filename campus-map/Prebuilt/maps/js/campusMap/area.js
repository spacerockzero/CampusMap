/*************************************************************************
* the area class definition for use for polygons
*
* Parameters:
* name - string - the name of the polygon for use in the right menu
* code - string - the unique code for use in referencing this object
* contains - string - descriptive text for the polygon, used in the info window when someone clicks on the rendered
*					  polygon on the map
* borderColor - string - a color for use on the border of the polygon
* fillColor - string - a color for use to fill the polygon
* map - url - an absolute path to the location of the KML file that defines this polygon
* polygon - object - a google maps polygon object for this object
* elementID - string - the id of the HTML element used in the menu to represent this object
* globals - object literal - an object containing the window and document objects {win: window, doc: document}
* state - int - represents whether the polygon is being shown or not, 0 no, 1 yes
* hidden - bool - for use in the search function to know if this Area object matches the search criteria and should be rendered or not
*/
function Area() {
	this.name = arguments[0],
	this.code = arguments[1],
	this.contains = arguments[2],
	this.borderColor = arguments[3],
	this.fillColor = arguments[4],
	this.map = arguments[5],
	this.polygon,
	this.elementID = this.code + "_poly",
	this.globals = arguments[6];
	this.state = 0,
	this.hidden = false;

	//create the google maps polygon for use with this object
	this.createPolygon();
}


//builds a DOM object and it's HTML for this Area object for use in the right menu
Area.prototype.buildAreaDOM = function() {
	var element = this.globals.doc.createElement("a");
	element.className = "object polygon";
	element.id = this.elementID;
	element.setAttribute('href', '#' + this.code);
	element.innerHTML = '<div class="polygon_key" id="poly_' + this.name + '" style="border-color:' + this.borderColor + '; background-color:' + this.fillColor + '"><span>&nbsp;</span></div>';
    element.innerHTML += '<div class="object_name polygon">' + this.name + '</div>';

    return element;
}


//builds this object's MapKey html
Area.prototype.buildMapKey = function () {
	return '<div class="polygon_key" id="poly_key_' + this.code + '" style="border-color:' + this.borderColor + '; background-color:' + this.fillColor + '">' + this.code + '</div>';
}


//binds the event listener for the HTML element in the right menu that represents this object
Area.prototype.bindEventListener = function() {
	var area = this;
	this.globals.doc.getElementById(this.elementID).addEventListener('click', function() {
		area.togglePolygon();
	});
}


//toggle whether the polygon is showing or not
Area.prototype.togglePolygon = function() {
	//get the span for this polygon
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
	//currently closed
	if (this.state === 0) {
		this.showPolygon(span, polyKey);
	} 
	//currently open
	else if (this.state === 1) {
		this.hidePolygon(span, polyKey);
	}
}


//shows the polygon on the map and in the MapKey
Area.prototype.showPolygon = function(span, polyKey) {
	this.polygon.setMap(map.map);
		span.className = "icon-checkmark";
		//display the mapkey
		polyKey.parentElement.style.display = "block";
		//make it appear in the map key
		polyKey.className = "polygon_key active_key";
		this.state = 1;
}


//hides the polygon on the map and in the MapKey
Area.prototype.hidePolygon = function(span, polyKey) {
	this.polygon.setMap(null);
		span.className = "";
		polyKey.className = "polygon_key";
		//determine if the mapkey needs to be closed or not
		if (this.globals.doc.querySelectorAll('#' + polyKey.parentElement.id + " .active_key").length < 1) {
			polyKey.parentElement.style.display = "none";
		}
		this.state = 0;
}


//creates a polygon for this area object
Area.prototype.createPolygon = function() {
	this.polygon = new google.maps.KmlLayer(this.map, {
		suppressInfoWindows: false,
		preserveViewport: true
	});
}


//hides both the polygon on the map(and mapkey) and in the right navigation
Area.prototype.hideAll = function() {
	this.hideMapKey();
	this.hideNavigation();
}


//hides the HTML representing this object in the MapKey
Area.prototype.hideMapKey = function() {
		//get the span for this polygon
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
		//make sure that it is not checked and therefore not showing up in the map
	this.hidePolygon(span, polyKey);
}

//hides the HTML element that represents this object in the navigation
Area.prototype.hideNavigation = function() {
	this.hidden = true;
	//hide it in the left navigation
	this.globals.doc.getElementById(this.elementID).style.display = "none";
}


//shows both the polygon on the map(and mapkey) and in the right navigation
Area.prototype.showAll = function() {
	this.showMapKey();
	this.showNavigation();
}

//shows the HTML representing this object in the MapKey
Area.prototype.showMapKey = function() {
	//show in mapkey
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
	this.showPolygon(span, polyKey);
}


//shows the HTML element that represents this object in the navigation
Area.prototype.showNavigation = function() {
	this.hidden = false;
	this.globals.doc.getElementById(this.elementID).style.display = "block";
}