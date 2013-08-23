//the location class definition is for use by markers
//uses the arguments parameter
function Location() {
	this.number = arguments[8] + 1,
	this.name = arguments[0],
	this.code = arguments[1],
	this.lat = arguments[2],
	this.lon = arguments[3],
	this.img = arguments[4],
	this.hours = arguments[5],
	this.info = arguments[6],
	this.link = arguments[7],
	this.color = arguments[10],
	this.elementID = this.code + "_" + this.number, 
	this.marker,
	this.infoWindowHTML,
	this.globals = arguments[9],
	this.hidden = false;

	this.createMarker();
	this.createInfoWindow();
}
Location.prototype.buildLocationDOM = function() {
	var element = this.globals.doc.createElement("a");
	element.className = "object marker_object";
	element.id = this.elementID;
	element.name = this.name;
	element.setAttribute("href", "#" + this.code);
    element.innerHTML += '<img  class="obj_icon" src="Prebuilt/maps/imgs/icons/numeral-icons/' + this.color + '/' + this.number + '.png" alt="' + name + '" />';
    element.innerHTML +=   '<div class="object_name">' + this.name + '</div>';

    return element;
}
Location.prototype.bindEventListener = function() {
	var marker = this;
	this.globals.doc.getElementById(this.elementID).addEventListener('click',function() {
		marker.panToMarker();
	});
}
Location.prototype.panToMarker = function() {
	var moveEnd = google.maps.event.addListener(map, 'moveend', function() {
    var markerOffset = map.map.fromLatLngToDivPixel(this.marker.getPosition());
      google.maps.event.removeListener(moveEnd);
    });
    map.map.panTo(this.marker.getPosition());
    google.maps.event.trigger(this.marker, 'click');
}
Location.prototype.createMarker = function() {
	this.marker = map.createMarker(this.lat, this.lon, this.name, "Prebuilt/maps/imgs/icons/numeral-icons/" + this.color + "/" + this.number + ".png")
}
Location.prototype.createInfoWindow = function() {
	map.createInfoWindow(this.marker, this);
}
Location.prototype.hideAll = function() {
	this.hideNavigation();
	this.hideMarker();
}
Location.prototype.hideMarker = function() {
	this.marker.setVisible(false);
}
Location.prototype.hideNavigation = function() {
	this.hidden = true;
	//hide it in the navigation and then hide it on the map
	this.globals.doc.getElementById(this.elementID).style.display = "none";
}
Location.prototype.showAll = function() {
	this.showMarker();
	this.showNavigation();
}
Location.prototype.showMarker = function() {
	this.marker.setVisible(true);
}
Location.prototype.showNavigation = function() {
	this.hidden = false;
	this.globals.doc.getElementById(this.elementID).style.display = "block";
}
				