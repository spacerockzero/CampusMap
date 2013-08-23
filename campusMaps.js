addScript("http://s7.addthis.com/js/300/addthis_widget.js#pubid=xa-51f6872a25a1fb8c", { win: window, doc: document });
var campusMap = new CampusMap(options);
var map = new Map(options);
//this function will be used to add a script to the page
function addScript(src, local) {
	var script = local.doc.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	local.doc.getElementsByTagName("body")[0].appendChild(script);
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
			this.bindMenuButton();
		}
		//event listener to run anything that needs to wait until after google maps has loaded
		google.maps.event.addListenerOnce(map.map, 'tilesloaded', function() {
			if (map.embedOptions.embed === true) {
      			map.createEmbedMarker();
    		} else {
    			campusMap.anchorLocation();
    		}
			campusMap.setMapHeight();
    		if (campusMap.includeMenus) {
				campusMap.buildMapKey();
				campusMap.initializeSearch();
			}
		});
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
CampusMap.prototype.anchorLocation = function() {
	//detect if a code has been sent in the url using an anchor
  	if (window.location.hash) {
	    var code = window.location.hash.substr(1);
	    var object = this.findObject(code);
	    object.showAll();
	    this.fireEvent(this.globals.doc.getElementById(object.elementID), 'click');
	}
}
CampusMap.prototype.findObject = function(code) {
	var object = null;
	for (var i = 0, len = this.categories.length; i < len && object === null; i++) {
		var cat = this.categories[i];
		if (cat.markerLocations) {
			for (var j = 0, len2 = cat.markerLocations.length; j < len2 && object === null; j++) {
				if (cat.markerLocations[j].code === code) {
					object = cat.markerLocations[j];
				}
			}
		}
		if (cat.polygonLocations) {
			for (var j = 0, len2 = cat.polygonLocations.length; j < len2 && object === null; j++) {
				if (cat.markerLocations[j].code === code) {
					object = cat.polygonLocations[j];
				}
			}
		}
	}
	return object;
}
CampusMap.prototype.fireEvent = function(element, event) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt)
   }
}

//this class definition is for the maps, any interaction with the google maps goes through here
function Map(options) {
  this.map;
  this.mapOptions = {
    campusOverlayVisible : (options['campusOverlay'] == null) ? true : options['campusOverlay'],
    campusFile : 'http://www.byui.edu/Prebuilt/maps/campus_outline.xml',
    centerCoordinates : [43.815045,-111.783515]
  },
  this.embedOptions = {
    embed : options['embed'],
    coordinates : (options['centerCoordinates'] !== null) ? options['centerCoordinates'] : [43.815045,-111.783515],
    name : (options['locationName']) ? options['locationName'] : "",
    icon : (options['icon']) ? options['icon'] : "blue",
    zoom: (options['zoom']) ? options['zoom'] : 16,
    mapView: (options['mapView']) ? options['mapView'] : "satellite"
  }
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
  if (this.embedOptions.mapView === "map") {
    var view = google.maps.MapTypeId.ROADMAP;
  } else {
    var view = google.maps.MapTypeId.SATELLITE;
  }
  var coordinates = (this.embedOptions.embed === true) ? this.embedOptions.coordinates : this.mapOptions.centerCoordinates;

    this.googleMapOptions = {
      zoom: (this.embedOptions.embed) ? this.embedOptions.zoom : 16,
      center: new google.maps.LatLng(coordinates[0], coordinates[1]),
      mapTypeId: view,
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
Map.prototype.createMarker = function(lat, lon, name, icon) {
  return new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    visible: false,
    map: this.map,
    title: name,
    icon: icon
  });
}
Map.prototype.createInfoWindow = function(marker, obj) {
  var infoWindow = this.infoWindow;
  var map = this.map;
  // Listener that builds the infopane popups on marker click
    google.maps.event.addListener(marker, 'click', function() {

      var content = '',
             name = obj.name,
              img,
             link = obj.link,
            hours = obj.hours,
            phone = obj.phone,
          address = obj.address,
             info = obj.info;

              if (obj.img) {
                if (obj.img.indexOf(':') === -1) {
                  img = 'Prebuilt/maps/imgs/objects/' + obj.img;
                }
                else {
                  img = obj.img;
                }
              }
             

      // Create the info panes which hold content about each building
      content += '<div class="infopane">';
      content +=   '<h2>' + name + '</h2>';
      content +=   '<div>';
      if (img){
        content += '<img src="' + img + '" alt="' + name + '"';
        content += ' style="float:right;margin:0 0 10px 10px"/>';
      }
      content += '<div class="button-div">';
      if (phone){
        content += '<a class="phone-call btn btn-large btn-primary icon-call" href="tel:' + phone + '" ></a>';
      }
      if (link){
        content += '<a href="' + link + '" target="_blank" class="btn btn-large btn-primary">More Info</a>';
      }
      content += '</div>';
      if (hours){
        content += '<div class="info-row info-hours"><strong>Hours:</strong> ' + hours + '</div>';
      }
      if (phone){
        content += '<div class="info-row info-phone"><strong>Phone:</strong> ' + phone + '</div>';
      }
      if (address){
        content += '<div class="info-row info-address"><strong>Address:</strong> ' + address + '</div>';
      }
      if (info){
        content += '<div class="info-row info-info"><strong>Info:</strong> ' + info + '</div>';
      }
      content += '</div>';
      content += '</div>';
      content += '<div class="addthis_toolbox addthis_32x32_style addthis_default_style">';
      content += "<p>Share this location.</p>";
      content += '<a class="addthis_button_facebook social_button"></a>';
      content += '<a class="addthis_button_google_plusone_share social_button"></a>';
      content += '<a class="addthis_button_twitter social_button"></a>';
      content += '<a class="addthis_button_compact social_button"></a>';
      content += '</div>';
      // Set the content of the InfoWindow
      infoWindow.setContent(content);
      // Open the InfoWindow
      infoWindow.open(map, marker);
      //render the buttons
      var addthis_share = 
      {
        url : "http://www.byui.edu/maps#" + obj.code,
        title : obj.name
      }
      addthis.toolbox('.addthis_toolbox',{},addthis_share);
    });
}
Map.prototype.createEmbedMarker = function() {
  this.createMarker(this.embedOptions.coordinates[0], this.embedOptions.coordinates[1], this.embedOptions.name, "http://www.byui.edu/Prebuilt/maps/imgs/icons/" + this.embedOptions.icon + ".png").setVisible(true);
}
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
	this.elementID = arguments[8],
	this.globals = arguments[7];
}
//creates an element, builds the html and attaches an event listener to the category
Category.prototype.buildCatDOM = function() {
	  var element = this.globals.doc.createElement("a");
	  element.className = 'category_bar';
	  element.id = this.elementID;
	  element.setAttribute('href', '#');
      element.innerHTML += '<img class="cat_icon" src="Prebuilt/maps/imgs/icons/blank-colors/'+ this.iconColor + '.png" />';
      element.innerHTML += '<span class="category_name">' + this.title + '</span>';
      return element;
}
Category.prototype.getCatDOMObj = function() {
	var catObj = this.globals.doc.createElement('div');
	catObj.className = 'category';
	catObj.appendChild(this.buildCatDOM());

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
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			container.appendChild(this.markerLocations[i].buildLocationDOM());
		}
	}
	return container;
}
Category.prototype.appendAreas = function(container) {
	if (this.polygonLocations) {
		for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
			container.appendChild(this.polygonLocations[i].buildAreaDOM());
		}
	}
	return container;
}
//bind the event listener to the element
Category.prototype.bindEventListener = function() {
	var cat = this;
	this.globals.doc.getElementById(this.elementID).addEventListener('click', function() {
		cat.toggle();
	});
}
Category.prototype.toggle = function() {
	var sibling = this.globals.doc.getElementById(this.elementID).parentElement.children[1];
	//close any open info windows
	map.infoWindow.close();
	this.toggleMarkersVisibility();
	if (this.state === 0) {
		this.openCategory(sibling);
	} else {
		this.closeCategory(sibling);
	}
}
Category.prototype.openCategory = function(sibling) {
	sibling.style.display = "block";
	sibling.style.height = "100%";
	this.state = 1;
}
Category.prototype.closeCategory = function(sibling) {
	//close the category
	sibling.style.display = "none";
	sibling.style.height = "0";
	this.state = 0;
}
Category.prototype.toggleMarkersVisibility = function() {
	//if the category is closed
	if (this.state === 0) {
		this.showAllMarkers();
	} else {
		this.hideAllMarkers();
	}
}
Category.prototype.showAllMarkers = function() {
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			if (!this.markerLocations[i].hidden) {
				this.markerLocations[i].marker.setVisible(true);
			}
		}
	}
}
Category.prototype.hideAllMarkers = function() {
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			this.markerLocations[i].showNavigation();
			this.markerLocations[i].hideMarker();
		}
	}
}
Category.prototype.hideAllPolygons = function() {
	if (this.polygonLocations) {
		for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
			this.polygonLocations[i].showNavigation();
			this.polygonLocations[i].hideMapKey();
		}
	}
}
Category.prototype.buildMapKey = function() {
	var html = "";
	if (this.polygonLocations) {
	//build category holder
		html = "<div id='poly_key_" + this.id + "' class='map_key_category map_key_" + this.name + "' style='display: none'><div class='key_title'>" + this.name + " Map Key</div><a class='close icon-cancel nolink' href='#'></a>"; 
		for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
			html += this.polygonLocations[i].buildMapKey();
		}
		html += "</div>";
	}
	return html;
}
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