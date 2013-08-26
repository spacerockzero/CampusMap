
/**********************************************************************************
* this class definition is for the maps, any interaction with the google maps should go through here
* there are some places where it doesn't go through here and that will have to be changed later
*
* The Map object also takes an options object literal to determine it's attributes and for the
* google map
*
* the Map object has several attributes
* map - google map - holds a reference to the google map which is used in many differenct methods used by the maps api
* mapOptions - object literal - it's contents are as follows
*                             - campusOverlayVisible - bool - lets you determine if the campusOverlay should show up on the map
*                             - campusFile - string - absolute path to the campusFile, must be absolute because it will be sent to google
*                             - centerCoordinates - array - the latitude and longitude the map will center on
* embedOptions - object literal - it's contents are as follows
*                               - embed - bool - whether it should be embed or not
*                               - coordinates - array - array of the latitude and longitude that the embedded map will center on 
*                               - name - string - the name of the marker (used by google)
*                               - icon - string - the name of the icon you wish to use, this string directly coorelates to filenames
*                                                 in the icons folder
*                               - zoom - int - the level of zoom for the embedded map
*                               - mapView - string - the view you wish to use in the embed "map" or "satellite" (satellite does hybrid view but most people know it as satellite)
* googleMapOptions - object literal - contains other options for google maps set at a later point
* infoWindow - object - a single infoWindow used by each marker
* campusLayer - object - a layer object created by the maps api of the campus
*
* Most of these attributes can be set in the options and therefore those attributes have default values as follows
* campusOverlayVisible - true
* embed - false
* coordinates - (same as centerCoordinates)
* name - ""
* icon - "blue"
* zoom - 16
* mapView - "satellite"
*
* method descriptions will be with their respective method declaration
*/
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


//initiates the map stack to get the maps showing up
//takes one parameter
//local - object literal - contains the window and document objects {win: window, doc: document}
Map.prototype.initiateMap = function(local) {
    this.setGoogleMapOptions();
    this.setGoogleMap(local);
    this.setInfoWindow();
    this.setCampusLayer();
  }


//sets the options used by google maps for displaying a map
Map.prototype.setGoogleMapOptions = function() {
  //determine which view will be used based on the embedOptions
  if (this.embedOptions.mapView === "map") {
    var view = google.maps.MapTypeId.ROADMAP;
  } else {
    var view = google.maps.MapTypeId.HYBRID;
  }

  //determine the center coordinates based on the embed options
  var coordinates = (this.embedOptions.embed === true) ? this.embedOptions.coordinates : this.mapOptions.centerCoordinates;

  //set the options
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


//creates the google map
Map.prototype.setGoogleMap = function(local) {
  //pass the DOM element being used and the googleMapOptions
  this.map = new google.maps.Map(local.doc.getElementById('map_canvas'), this.googleMapOptions);
}


//create the info window to be used by all markers
Map.prototype.setInfoWindow = function() {
  this.infoWindow = new google.maps.InfoWindow();
}


//places the campus layer on the map
//for some reason this isn't working with the layers kml file being in Ingeniux
Map.prototype.setCampusLayer = function() {
  this.campusLayer = new google.maps.KmlLayer(this.mapOptions.campusFile, {
    suppressInfoWindows: true,
    map: this.map,
    preserveViewport: true,
    zoom: 18
  });
}


//create a google map marker
//this function needs the latitude, longitude, name, and the path of the icon being used
Map.prototype.createMarker = function(lat, lon, name, icon) {
  return new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    visible: false,
    map: this.map,
    title: name,
    icon: icon
  });
}


//creates an info window whenever a marker is clicked and then displays it
//it takes the marker object and the Location object
Map.prototype.createInfoWindow = function(marker, obj) {
  //create local versions so they are in the closure for the anonymous
  //event function
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
      //render the add this buttons
      var addthis_share = 
      {
        url : "http://www.byui.edu/maps#" + obj.code,
        title : obj.name
      }
      addthis.toolbox('.addthis_toolbox',{},addthis_share);
    });
}


//this function creates a marker on the map when someone wants to embed a map into their own page
Map.prototype.createEmbedMarker = function() {
  this.createMarker(this.embedOptions.coordinates[0], this.embedOptions.coordinates[1], this.embedOptions.name, "http://www.byui.edu/Prebuilt/maps/imgs/icons/" + this.embedOptions.icon + ".png").setVisible(true);
}