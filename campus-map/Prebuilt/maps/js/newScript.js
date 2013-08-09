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
	this.state = 0,
	this.element,
	this.globals = arguments[7];
	this.state = 0;

	//need to create the Category DOM object, it's html and event listener
	this.buildCatDOM();
}
//creates an element, builds the html and attaches an event listener to the category
Category.prototype.buildCatDOM = function() {
	  this.element = this.globals.doc.createElement("a");
	  this.element.className = 'category_bar';
	  this.element.setAttribute('href', '#');
      this.element.innerHTML += '<img class="cat_icon" src="Prebuilt/maps/imgs/icons/blank-colors/'+ this.iconColor + '.png" />';
      this.element.innerHTML += '<span class="category_name">' + this.title + '</span>';
      this.bindEventListener();
}
Category.prototype.getCatDOMObj = function() {
	var catObj = this.globals.doc.createElement('div');
	catObj.className = 'category';
	catObj.appendChild(this.element);

	var catContainer = this.globals.doc.createElement('div');
	catContainer.className = "cat_container";
	catContainer.innerHTML = '<div class="cat_info"><p>' + this.text + '</p><a href="' + this.link + '" target="_blank">' + this.title + ' website</a></div>';

	var objContainer = this.globals.doc.createElement('div');
	//append each object element and polygon element
	objContainer = this.appendLocations(objContainer);
	objContainer = this.appendAreas(objContainer);

	//append them all togethor and return the catObj DOM object
	catContainer.appendChild(objContainer);
	catObj.appendChild(catContainer);
	return catObj;
}
//gets the html for a location
Category.prototype.appendLocations = function(container) {
	for (var i = 0, len = this.markerLocations.length; i < len; i++) {
		container.appendChild(this.markerLocations[i].element);
	}
	return container;
}
Category.prototype.appendAreas = function(container) {
	for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
		container.appendChild(this.polygonLocations[i].element);
	}
	return container;
}
//bind the event listener to the element
Category.prototype.bindEventListener = function() {
	var cat = this;
	this.element.addEventListener('click', function() {
		cat.toggle();
	});
}
Category.prototype.toggle = function() {
	var sibling = this.element.parentElement.children[1];
	if (this.state === 0) {
		//open the category
		sibling.style.height = "100%";
		this.state = 1;
	} else {
		//close the category
		sibling.style.height = "0";
		this.state = 0;
	}
}

//the location class definition is for use by markers
//uses the arguments parameter
function Location() {
	this.number = arguments[8],
	this.name = arguments[0],
	this.code = arguments[1],
	this.lat = arguments[2],
	this.lon = arguments[3],
	this.img = arguments[4],
	this.hours = arguments[5],
	this.info = arguments[6],
	this.link = arguments[7],
	this.element,
	this.marker,
	this.infoWindowHTML,
	this.globals = arguments[9];

	this.buildLocationDOM();
}
Location.prototype.buildLocationDOM = function() {
	this.element = this.globals.doc.createElement("a");
	this.element.className = "object marker_object";
	this.element.name = this.name;
	this.element.setAttribute("href", "#" + this.code);
    this.element.innerHTML += '<img  class="obj_icon" src="Prebuilt/maps/imgs/icons/numeral-icons/' + this.color + '/' + this.number + '.png" alt="' + name + '" />';
    this.element.innerHTML +=   '<div class="object_name">' + this.name + '</div>';
    this.bindEventListener();
}
Location.prototype.bindEventListener = function() {

}


//the area class definition for use for polygons
function Area() {
	this.name = arguments[0],
	this.code = arguments[1],
	this.contains = arguments[2],
	this.borderColor = arguments[3],
	this.fillColor = arguments[4],
	this.map = arguments[5],
	this.polygon,
	this.element,
	this.globals = arguments[6];

	this.buildAreaDOM();
}
Area.prototype.buildAreaDOM = function() {
	this.element = this.globals.doc.createElement("a");
	this.element.className = "object polygon";
	this.element.setAttribute('href', '#' + this.code);
	this.element.innerHTML = '<div class="polygon_key" id="poly_' + this.name + '" style="border-color:' + this.borderColor + '; background-color:' + this.fillColor + '"><span>&nbsp;</span></div>';
    this.element.innerHTML += '<div class="object_name polygon">' + this.name + '</div>';
    this.bindEventListener();
}
Area.prototype.bindEventListener = function() {

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
	this.device,
	this.map = new Map(options), //send the whole options object so that it can get the attributes that are related to it
	this.objectFile = 'Prebuilt/maps/data/newCatObj.JSON',
	this.device = 0;
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
		this.map.initiateMap(local);
		if (this.includeMenus) {
			this.detectDevice();
		}
		//load the category 
		this.loadCatObjs();
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
			this.categories.push(new Category(cat.id, cat.name, cat.title, cat.text, cat.icon, cat.type, cat.link, this.globals));
			this.categories.markerLocations = (cat.objects) ? this.parseLocations(cat.objects) : null;
			this.categories.polygonLocations = (cat.polygons) ? this.parseAreas(cat.polygons) : null;
			this.globals.doc.getElementById('categories').appendChild(this.categories[i].getCatDOMObj());
		}
	}
	//parses all of the locations and creates location objects out of them all
CampusMap.prototype.parseLocations = function(locations) {
		var markerLocations = [];
		for (var j = 0, numberLocations = locations.length; j < numberLocations; j++) {
			var marker = locations[j]
				markerLocations.push(new Location(marker.name, marker.code, marker.lat, marker.lon, marker.img, marker.hours, marker.info, marker.link, j, this.globals));
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
    var newDevice = (width < 800) ? 0 : 1;
    (newDevice != this.device) ? this.setDevice(this.device = newDevice) : null;
}
CampusMap.prototype.setDevice = function() {
	var deviceIndicator = this.globals.doc.getElementById('device_type'),
                   body = this.globals.doc.getElementsByTagName("body")[0];
    if (this.device == 0){
        // Set the body id, set new control value
        body.setAttribute("id","mobile");
    } else {
        // Set the body id, set new control value
        body.setAttribute("id","desktop");
    }
}

//this class definition is for the maps, any interaction with the google maps goes through here
function Map(options) {
	this.map;
	this.mapOptions = {
		campusOverlayVisible : (options['campusOverlay'] == null) ? true : options['campusOverlay'],
		campusFile : 'http://www.byui.edu/Prebuilt/maps/campus_outline.xml',
		zoom: (options['zoom']) ? options['zoom'] : 16,
		centerCoordinates : (options['centerCoordinates'] == null) ? [43.815045,-111.783515] : options['centerCoordinates']
	},
	this.googleMapOptions = {},
	this.infoWindow,
	this.campusLayer;
}
Map.prototype.initiateMap = function(local) {
		this.setGoogleMapOptions();
		this.setGoogleMap(local);
		this.setInfoWindow();
		this.setCampusLayer();
	}

Map.prototype.setGoogleMapOptions = function() {
		this.googleMapOptions = {
			zoom: this.mapOptions.zoom,
			center: new google.maps.LatLng(this.mapOptions.centerCoordinates[0], this.mapOptions.centerCoordinates[1]),
			mapTypeId: google.maps.MapTypeId.HYBRID,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP,
							 google.maps.MapTypeId.SATELLITE,
							 google.maps.MapTypeId.HYBRID,
							 google.maps.MapTypeId.TERRAIN]
			}
		};
	}
Map.prototype.setGoogleMap = function(local) {
		this.map = new google.maps.Map(local.doc.getElementById('map_canvas'), this.googleMapOptions);
	}
Map.prototype.setInfoWindow = function() {
		this.infoWindow = new google.maps.InfoWindow();
	}
Map.prototype.setCampusLayer = function() {
		this.campusLayer = new google.maps.KmlLayer(this.mapOptions.campusFile, {
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
	local.doc.getElementsByTagName("body")[0].appendChild(script);
}