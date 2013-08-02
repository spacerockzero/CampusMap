//this is the definition for the category class
//uses arguments parameter so as to not have to define each parameter
function category() {
	//constructor and parameters
	//although they are not private they should be accessed through 
	this.id = arguments[0],
	this.name = arguments[1],
	this.title = arguments[2],
	this.text = arguments[3],
	this.iconColor = arguments[4],
	this.type = arguments[5],
	this.link = arguments[6],
	this.markerLocations = [],
	this.polygonLocations = [],
	this.state = 0;
}

//the location class definition is for use by markers
//uses the arguments parameter
function location() {
	this.name = arguments[0],
	this.code = arguments[1],
	this.lat = arguments[2],
	this.lon = arguments[3],
	this.img = arguments[4],
	this.hours = arguments[4],
	this.info = arguments[5],
	this.marker;
}

//the area class definition for use for polygons
function area() {
	this.name = arguments[0],
	this.code = arguments[1],
	this.contains = arguments[2],
	this.borderColor = arguments[3],
	this.fillColor = arguments[4],
	this.map = arguments[5],
	this.polygon;
}

//this class is the definition for the campusMap class that has all of the code in it to initialize a campusMap
/*
The options parameter contains all of the possible options for the person to configure such as:
element -- The element where you want the maps to show up
menuState -- The initial state of the menu, 0 for closed, 1 for open (default)
includeMenus -- This will allow include or not include the header and menu bars, true for include (default), false to hide
campusOverlay -- allows you to specify whether you want an overlay over the campus false won't include, true will (default)
objectsFile -- allows you to specify whether you want to use the objects file false won't include, true will include
centerCoordinates -- Where the map should be centered by default
*/
function campusMap(options) {
	this.element = (options['element']) ? options['element'] : throw "No target element specified" ,
	this.menuState = (options['menuState']) ? options['menuState'] : 1,
	this.includeMenus = (options['includeMenus']) ? options['includeMenus'] : true,
	this.useObjectsFile = (options['includeMenus'] && options['objectsFile']) ? options['objectsFile'] : true,
	this.mapOptions = {
		this.map,
		this.campusOverlayVisible = options['campusOverlay'],
		this.campusFile = 'http://www.byui.edu/Prebuilt/maps/campus_outline.xml',
		this.zoom: 16,
		this.centerCoordinates = (options['centerCoordinates']),
		this.
	},
	this.objectFile = 'Prebuilt/maps/data/objectFile.JSON',
	this.device = 0;
	this.categories = [];

	//other often used variables that should be passed around to be used in any other class
	var globals = {
		doc = document,
		win = window
	}

	this.initialize = function() {

	}
}