//the area class definition for use for polygons
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

	this.createPolygon();
}
Area.prototype.buildAreaDOM = function() {
	var element = this.globals.doc.createElement("a");
	element.className = "object polygon";
	element.id = this.elementID;
	element.setAttribute('href', '#' + this.code);
	element.innerHTML = '<div class="polygon_key" id="poly_' + this.name + '" style="border-color:' + this.borderColor + '; background-color:' + this.fillColor + '"><span>&nbsp;</span></div>';
    element.innerHTML += '<div class="object_name polygon">' + this.name + '</div>';

    return element;
}
Area.prototype.buildMapKey = function () {
	return '<div class="polygon_key" id="poly_key_' + this.code + '" style="border-color:' + this.borderColor + '; background-color:' + this.fillColor + '">' + this.code + '</div>';
}
Area.prototype.bindEventListener = function() {
	var area = this;
	this.globals.doc.getElementById(this.elementID).addEventListener('click', function() {
		area.togglePolygon();
	});
}
Area.prototype.togglePolygon = function() {
	//get the span for this polygon
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
	//currently closed
	if (this.state === 0) {
		this.showPolygon(span, polyKey);
	} 
	//open
	else if (this.state === 1) {
		this.hidePolygon(span, polyKey);
	}
}
Area.prototype.showPolygon = function(span, polyKey) {
	this.polygon.setMap(map.map);
		span.className = "icon-checkmark";
		//display the mapkey
		polyKey.parentElement.style.display = "block";
		//make it appear in the map key
		polyKey.className = "polygon_key active_key";
		this.state = 1;
}
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
Area.prototype.createPolygon = function() {
	this.polygon = new google.maps.KmlLayer(this.map, {
		suppressInfoWindows: false,
		preserveViewport: true
	});
}
Area.prototype.hideAll = function() {
	this.hideMapKey();
	this.hideNavigation();
}
Area.prototype.hideMapKey = function() {
		//get the span for this polygon
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
		//make sure that it is not checked and therefore not showing up in the map
	this.hidePolygon(span, polyKey);
}
Area.prototype.hideNavigation = function() {
	this.hidden = true;
	//hide it in the left navigation
	this.globals.doc.getElementById(this.elementID).style.display = "none";
}
Area.prototype.showAll = function() {
	this.showMapKey();
	this.showNavigation();
}
Area.prototype.showMapKey = function() {
	//show in mapkey
	var span = this.globals.doc.getElementById(this.elementID).children[0].children[0];
	var polyKey = this.globals.doc.getElementById("poly_key_" + this.code);
	this.showPolygon(span, polyKey);
}
Area.prototype.showNavigation = function() {
	this.hidden = false;
	this.globals.doc.getElementById(this.elementID).style.display = "block";
}