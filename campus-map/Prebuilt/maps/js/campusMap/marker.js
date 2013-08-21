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
	this.globals = arguments[9];
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
	this.globals.doc.getElementById(this.elementID).addEventListener('click',function() {
		this.displayMarker();
	});
}
Location.prototype.displayMarker() {
	var moveEnd = google.maps.event.addListener(map, 'moveend', function() {
    var markerOffset = map.fromLatLngToDivPixel(this.marker.getPosition());
      google.maps.event.removeListener(moveEnd);
    });
    map.panTo(marker.getPosition());
    google.maps.event.trigger(marker, 'click');
}