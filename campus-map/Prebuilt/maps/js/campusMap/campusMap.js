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
	this.device,
	this.objectFile = 'Prebuilt/maps/data/newCatObj.txt',
	this.device = 0,
	this.categories = [];

	//other often used variables that should be passed around to be used in any other class
	this.globals = {
		doc: document,
		win: window
	}
	addScript("http://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=campusMap.initializeMaps",this.globals);
}
//calls the initialize map stack
CampusMap.prototype.initializeMaps = function() {
		console.time("initialize js chain until ready");
		//make a copy of all of the globals
		var local = this.globals;
		//build the mark up based on the options sent in
		this.buildHTML();
		//initiate the maps
		map.initiateMap(local);
		this.detectDevice();
		//load the category 
		if (this.includeMenus) {
			this.loadCatObjs();
		}
		//event listener to run anything that needs to wait until after google maps has loaded
		google.maps.event.addListenerOnce(map.map, 'tilesloaded', function() {
			if (map.embedOptions.embed === true) {
      			map.createEmbedMarker();
    		}
			campusMap.buildMapKey();
			campusMap.setMapHeight();
			campusMap.initializeSearch();
		});
		this.bindMenuButton();
}
//builds the needed HTML for the map
CampusMap.prototype.buildHTML = function() {
	var html = (this.includeMenus) ? '<div id="title"><h1 id="heading">BYU-Idaho Campus Map</h1><a id="device_type" href="#" onmousedown="toggleDevice(); return false;" title="Switch Device Type"><div id="device_container"><div class="device icon-desktop"></div><div class="device icon-mobile"></div></div></a><a id="menu_button" class="icon-settings" href="#" title="Open Menu. Click this or press [space] bar"></a></div>' : "";
	html += '<div id="container" name="container">';
	html += (this.includeMenus) ? '<div id="menu" name="menu" style="display:block; z-index: 2;"><div id="inner_menu" class="scrolling-element-class" ><div id="object_search"><input type="text" placeholder="Search"/><span class="icon-cancel"></span></div><nav id="categories" class="child-element"></nav><!-- // categories --></div><!-- // inner menu --></div><!-- // menu -->' : "";
	html += '<div id="map_canvas"><div id="nojs-msg"><br/>This BYU-Idaho Campus Map application requires Javascript to run. <br/>Your device or browser doesn\'t appear to have JavaScript enabled. <br/>Please enable it and try again, or try another device or browser.</div></div>';
	html += '<div id="map_keys"></div>';
	this.globals.doc.getElementById(this.element).innerHTML = html;
}
//loads the category and object file and creates the categories and objects for each object
CampusMap.prototype.loadCatObjs = function(callback) {
	var filePath = this.objectFile;
	var parent = this;
		var xmlhttp;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
  			xmlhttp=new XMLHttpRequest();
  		} else {// code for IE6, IE5
  			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  		}
		xmlhttp.onreadystatechange=function() {
  			if (xmlhttp.readyState==4) {
  				var data = JSON.parse(xmlhttp.responseText);
  				parent.parseCategories(data);
  				if (callback && typeof(callback) === "function") {
  					callback();
  				}
    		}
  		}
		xmlhttp.open("GET",filePath,true);
		xmlhttp.send();
	}
	//parses the category file and creates category objects of them all
CampusMap.prototype.parseCategories = function(data) {
		for (var i = 0, numberCategories = data.length; i < numberCategories; i++) {
			var cat = data[i];
			this.categories.push(new Category(cat.ID, cat.name, cat.title, cat.text, cat.icon, cat.type, cat.link, this.globals, "cat_" + i));
			this.categories[i].markerLocations = (cat.objects) ? this.parseLocations(cat.objects,cat.icon) : null;
			this.categories[i].polygonLocations = (cat.polygons) ? this.parseAreas(cat.polygons) : null;
			this.globals.doc.getElementById('categories').appendChild(this.categories[i].getCatDOMObj());
		}
		this.bindAllEvents();
	}
	//parses all of the locations and creates location objects out of them all
CampusMap.prototype.parseLocations = function(locations, color) {
		var markerLocations = [];
		for (var j = 0, numberLocations = locations.length; j < numberLocations; j++) {
			var marker = locations[j]
				markerLocations.push(new Location(marker.name, marker.code, marker.lat, marker.lon, marker.img, marker.hours, marker.info, marker.link, j, this.globals, color));	
		}
		return markerLocations;
	}
	//parses all of the areas and creates area objects out of them all
CampusMap.prototype.parseAreas = function(areas) {
		var polygonAreas = [];
		for (var j = 0, numberAreas = areas.length; j < numberAreas; j++) {
			var polygon = areas[j]
				polygonAreas.push(new Area(polygon.name, polygon.code, polygon.contains, polygon.borderColor, polygon.fillColor, polygon.map, this.globals));

			}
		return polygonAreas;
	}
	//detects what kind of device is being 
CampusMap.prototype.detectDevice = function() {
 var width = this.globals.doc.body.offsetWidth;
    this.device = (width < 800) ? 0 : 1;
}
CampusMap.prototype.bindAllEvents = function() {
	var category;
	//loop through each category
	for (var i = 0, len = this.categories.length; i < len; i++) {
		category = this.categories[i];
		category.bindEventListener();
		//for each marker and each polygon we will bind all of their events
		if (category.markerLocations) {
			for (var j = 0, len2 = category.markerLocations.length; j < len2; j++) {
				category.markerLocations[j].bindEventListener();
			}
		}
		if (category.polygonLocations) {
			for (var j = 0, len2 = category.polygonLocations.length; j < len2; j++) {
				category.polygonLocations[j].bindEventListener();
			}
		}
	}
}
CampusMap.prototype.buildMapKey = function() {
	var html = "";
	//go through each category and look for any polygons and create a map key for them
	for (var i = 0, len = this.categories.length; i < len; i++) {
		html += this.categories[i].buildMapKey();
	}	
	var element = this.globals.doc.getElementById("map_keys");
	element.innerHTML = html;
}
CampusMap.prototype.getMapHeight = function() {
var height = this.globals.doc.getElementById(this.element).offsetHeight;
	return (this.includeMenus) ? height - 57 : height;
}
CampusMap.prototype.setMapHeight = function() {
	var height = this.getMapHeight();
	var container =	this.globals.doc.getElementById('container');
	container.style.height = height + "px";
	var map_canvas = this.globals.doc.getElementById('map_canvas');
	map_canvas.style.height = height + "px";
}
CampusMap.prototype.initializeSearch = function() {
	var search = this.globals.doc.getElementById('object_search').children[0];
	search.addEventListener('keyup', function() {
		campusMap.performSearch(this.value);
	});
	//make the close button on the search clear the field and then perform the search
	//in order to clear everything
	search.nextSibling.addEventListener('click', function() {
		search.value = "";
		campusMap.performSearch("");
	});

}
CampusMap.prototype.performSearch = function(val) {
	if (val != "") {
		val = val.toLowerCase();
		//find all of the objects that match
		for (var i = 0, len = this.categories.length; i < len; i++) {
			var cat = this.categories[i];
			var visibleOptions = ((cat.markerLocations) ? cat.markerLocations.length : 0) + ((cat.polygonLocations) ? cat.polygonLocations.length : 0);
			if (cat.markerLocations) {
				for (var j = 0, len2 = cat.markerLocations.length; j < len2; j++) {
					if (cat.markerLocations[j].name.toLowerCase().indexOf(val) === -1) {
						cat.markerLocations[j].hideAll();
						visibleOptions--;
					} else {
						cat.markerLocations[j].showAll();
					}
				}
			}
			if (cat.polygonLocations) {
				for (var j = 0, len2 = cat.polygonLocations.length; j < len2; j++) {
					if (cat.polygonLocations[j].name.toLowerCase().indexOf(val) === -1) {
						cat.polygonLocations[j].hideAll();
						visibleOptions--;
					} else {
						cat.polygonLocations[j].showAll();
					}
				}
			}
			var sibling = this.globals.doc.getElementById(cat.elementID).parentElement.children[1];
			if (visibleOptions > 0) {
				cat.openCategory(sibling);
			} else {
				cat.closeCategory(sibling);
			}
		} 
	} else {
			for (var i = 0, len = this.categories.length; i < len; i++) {
				var cat = this.categories[i];
				if (cat.markerLocations) {
					this.categories[i].hideAllMarkers();
				}	
				if (cat.polygonLocations) {
					this.categories[i].hideAllPolygons();
				}
				var sibling = this.globals.doc.getElementById(cat.elementID).parentElement.children[1];
				cat.closeCategory(sibling);
			}
	}
}
CampusMap.prototype.bindMenuButton = function() {
	this.globals.doc.getElementById('menu_button').addEventListener('click', function() {
		campusMap.toggleMenu();
	});
}
CampusMap.prototype.toggleMenu = function() {
	(this.menuState) ? this.hideMenu() : this.showMenu();
}
CampusMap.prototype.hideMenu = function() {
	this.menuState = 0;
	this.globals.doc.getElementById('menu').style.display = "none";
}
CampusMap.prototype.showMenu = function() {
	this.menuState = 1;
	this.globals.doc.getElementById('menu').style.display = "block";
}