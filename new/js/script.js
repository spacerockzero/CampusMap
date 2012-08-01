/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  07.30.2012            */
/*jslint white:true, browser: true */
/*global google*/

// Cache global objects as local variables
var doc = document;
var control = {
  menuState: 1
};

// Init
  // Show Loading Animation (progress?)
  // Detect Device/Size
  
  // Set map default options
  var myLatlng = new google.maps.LatLng( 43.815045, -111.783515);
  var myOptions = {
    //maxZoom: 18,
    zoom: 16,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 
                   google.maps.MapTypeId.SATELLITE, 
                   google.maps.MapTypeId.HYBRID, 
                   google.maps.MapTypeId.TERRAIN]
    }//end mapTypeControlOptions
  };//end myOptions

  // Create Map Object
  function initialize() {
    var map;
    map = new google.maps.Map(doc.getElementById('map_canvas'), myOptions);
  }//end initialize()

  // Create infoWindow Object
  // Load Campus Boundary Layer
  // run GatherData Stack
  // run LoadPopulateShowCategories Stack
  // Hide Loading Animation

// GatherData
// LoadPopulateShowCategories

// Events
  // ToggleMenu
  function toggleMenu(){
    var menuState = control.menuState,
             menu = doc.getElementById('menu');
    if(menuState === 0){
      // Toggle menu visibility on
      menu.className = "unhide";
      // Set current state of menu visibility in control object
      control.menuState = 1;
    } else {
      // Toggle menu visibility off
      menu.className = "hide";
      // Set current state of menu visibility in control object
      control.menuState = 0;
    }
    
  }
  
  // ShowHideCategory
  // ToggleMobileDesktop
  // Search