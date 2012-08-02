/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  08.01.2012            */

// JS Lint Options (remove after deployment)
/*jslint white:true, browser: true */
/*global google*/

// Cache global objects as local variables
var doc = document;

// control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0
};

// Detect and set device in control object
  function detectDevice(){
    var width = doc.body.offsetWidth;
    if(width < 800){
      return 0;
    } else {
      return 1;
    }
  }
  // Set and Toggle Device
  function setDevice(changeTo){
    var deviceIndicator = doc.getElementById('device_type'),
                   body = doc.getElementsByTagName("body")[0];
    if (changeTo === 0){
      // Set to Mobile
        // Set the body id
        body.setAttribute("id","mobile");
        // set new control value
        control.currentDevice = 0;
        console.log("Mobile mode set");
    } else {
      // Set to Desktop
        // Set the body id
        body.setAttribute("id","desktop");
        //set new control value
        control.currentDevice = 1;
        console.log("desktop mode set");
    }
  }
  function toggleDevice(){
    var current = control.currentDevice;
    if (current === 0){
      // set device as desktop
      setDevice(1);
    } else {
      // set device as mobile
      setDevice(0);
    }
  }
  // Detect and set browser attributes in control object
    // Detect and set device in control object
    control.currentDevice = detectDevice();
    if (control.currentDevice === 0){
      //set mobile
      setDevice(0);
    } else {
      //set desktop
      setDevice(1);
    }

// GatherData functions
// LoadPopulateShowCategories functions

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



// Events
  // SetMenu
  function setMenu(newState){
   var menu_indicator = doc.getElementById('menu_indicator'),
                 menu = doc.getElementById('menu');
    if(newState === 0){
      // Toggle menu visibility off
      menu.style.display = "none";
      // Toggle indicator
      menu_indicator.innerHTML = "+";
      // Set current state of menu visibility in control object
      control.menuState = 0;
    } else {
      // Toggle menu visibility on
      menu.style.display = "block";
      // Toggle indicator
      menu_indicator.innerHTML = "-";
      // Set current state of menu visibility in control object
      control.menuState = 1;
    }
  }
  // ToggleMenu
  function toggleMenu(){
    var menuState = control.menuState;
    if(menuState === 0){
      // Toggle menu visibility on
      setMenu(1);
    } else {
      // Toggle menu visibility off
      setMenu(0);
    }
  }
  
  // ShowHideCategory

  

  // Search





