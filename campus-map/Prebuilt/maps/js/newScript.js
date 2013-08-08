var campusMap = new CampusMap(options);
//this is the definition for the category class
//uses arguments parameter so as to not have to define each parameter
function Category() {
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
function Location() {
	this.name = arguments[0],
	this.code = arguments[1],
	this.lat = arguments[2],
	this.lon = arguments[3],
	this.img = arguments[4],
	this.hours = arguments[4],
	this.info = arguments[5],
	this.link = arguments[6],
	this.marker;
}

//the area class definition for use for polygons
function Area() {
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
element -- The element id where you want the maps to show up
menuState -- The initial state of the menu, 0 for closed, 1 for open (default)
includeMenus -- This will allow include or not include the header and menu bars, true for include (default), false to hide
campusOverlay -- allows you to specify whether you want an overlay over the campus false won't include, true will (default)
centerCoordinates -- Where the map should be centered by default
zoom -- how zoomed in the maps should be, default is 16
*/
function CampusMap(options) {
	this.element = (options['element']) ? options['element'] : console.log("No element provided.") ,
	this.menuState = (options['menuState']) ? options['menuState'] : 1,
	this.includeMenus = (options['includeMenus'] == null) ? true : options['includeMenus'],
	this.map = new Map(options), //send the whole options object so that it can get the attributes that are related to it
	this.objectFile = 'Prebuilt/maps/data/newCatObj.JSON',
	this.device = 0;
	this.categories = [];

	//other often used variables that should be passed around to be used in any other class
	this.globals = {
		doc: document,
		win: window
	}
	addScript("http://maps.googleapis.com/maps/api/js?v=3&sensor=false",{win: window, doc: document},function() {campusMap.initializeMaps();});
}
CampusMap.prototype.initializeMaps = function() {
		console.time("initialize js chain until ready");
		//make a copy of all of the globals
		var local = this.globals;
		//the first thing that we are going to want to do is to pull in the google maps api script
		//we will place it at the bottom of the body
		this.map.initiateMap(this.element, local);

		//load the category 
		this.loadCatObjFile(function() {

		})
	}
CampusMap.prototype.loadCatObjFile = function(callback) {
		var xmlhttp;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
  			xmlhttp=new XMLHttpRequest();
  		} else {// code for IE6, IE5
  			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  		}
		xmlhttp.onreadystatechange=function() {
  			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
  				var data = JSON.parse(xmlhttp.responseText);
  				this.parseData(data);
  				if (callback && typeof(callback) === "function") {
  					callback();
  				}
    		}
  		}
		xmlhttp.open("GET",this.objectFile,true);
		xmlhttp.send();
	}
CampusMap.prototype.parseCategories = function(data) {
		for (var i = 0, numberCategories = data.length; i < numCategories; i++) {
			var cat = data[i];
			this.categories.push(new Category(cat.id, cat.name, cat.title, cat.text, cat.iconColor, cat.type, cat.link));
			this.categories.markerLocations = this.parseLocations(cat.objects);
			this.categories.polygonLocations = this.parseAreas(cat.polygons);
		}
	}
CampusMap.prototype.parseLocations = function(locations) {
		var markerLocations = [];
		for (var j = 0, numberLocations = locations.length; j < numberLocations; j++) {
			var marker = locations[j]
				markerLocations.push(new Location(marker.name, marker.code, marker.lat, marker.lon, marker.img, marker.hours, marker.info, marker.link));
			}
		return markerLocations;
	}
CampusMap.prototype.parseAreas = function(areas) {
		var polygonAreas = [];
		for (var j = 0, numberAreas = areas.length; j < numberAreas; j++) {
			var polygon = areas[j]
				polygonLocations.push(new Area(polygon.name, polygon.code, polygon.contains, polygon.borderColor, polygon.fillColor, polygon.map));
			}
		return polygonLocations;
	}

//this class definition is for the maps, any interaction with the google maps goes through here
function Map(options) {
	this.map;
	this.mapOptions = {
		campusOverlayVisible : (options['campusOverlay'] == null) ? true : options['campusOverlay'],
		campusFile : 'http://www.byui.edu/Prebuilt/maps/campus_outline.xml',
		zoom: options['zoom'],
		centerCoordinates : (options['centerCoordinates'] == null) ? [43.815045,-111.783515] : options['centerCoordinates']
	},
	this.googleMapOptions = {},
	this.infoWindow,
	this.campusLayer;
}
Map.prototype.initiateMap = function(element, local) {
		this.setGoogleMapOptions();
		this.setGoogleMap(element, local);
		this.setInfoWindow();
		this.setCampusLayer();
	}

Map.prototype.setGoogleMapOptions = function() {
		this.googleMapOptions = {
			zoom: this.mapOptions.zoom,
			center: new google.maps.LatLng(this.mapOptions.centerCoordinates[0], this.mapOptions.centerCoordinates[1]),
			mapTypeId: googlemaps.MapTypeId.HYBRID,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP,
							 google.maps.mapTypeId.SATELLITE,
							 google.maps.mapTypeId.HYBRID,
							 google.maps.mapTypeId.TERRAIN]
			}
		};
	}
Map.prototype.setGoogleMap = function(element, local) {
		this.map = new google.maps.Map(local.doc.getElementById(element), this.googleMapOptions);
	}
Map.prototype.setInfoWindow = function() {
		this.infoWindow = new google.maps.InfoWindow();
	}
Map.prototype.setCampusLayer = function() {
		this.campusLayer = new google.maps.KmlLayer(campusFile, {
			suppressInfoWindows: true,
			map: this.map,
			preserveViewport: true,
			zoom: 18
		});
	}


//this function will be used to add a script to the page
function addScript(src, local, callback) {
	var script = local.doc.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	script.onload = function() {
		if (callback && typeof(callback) === 'function') {
			callback();
		}
	}
	local.doc.getElementsByTagName("body")[0].appendChild(script);
}