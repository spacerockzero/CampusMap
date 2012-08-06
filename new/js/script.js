/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  08.01.2012            */

// JS Lint Options (remove after deployment)
/*jslint white:true, browser: true */
/*global google, jQuery, $, done*/

// Cache global objects as local variables
  var doc = document,
container = doc.getElementById('container'),
     body = doc.getElementsByTagName('body')[0],
   canvas = doc.getElementById('map_canvas');

// control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0
};

/**********************/
/*  Global Functions  */
/**********************/

// Asynchronous script loader function
function loadScript(src, callback) {
  var head = document.getElementsByTagName('head')[0],
    script = document.createElement('script');
      done = false;
  script.setAttribute('src', src);
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('charset', 'utf-8');
  script.onload = script.onreadstatechange = function() {
    if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
      done = true;
      script.onload = script.onreadystatechange = null;
      if (callback) {
        callback();
      }
    }
  }
  head.insertBefore(script, head.firstChild);
}

// Detect object height
function detectHeight(object){
  return object.offsetHeight;
}

//set object height
function setHeight(object, height){
  object.style.height = height;
}

/****************************************************/
/*  Device & Feature Detection & Setting Functions  */
/****************************************************/
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

  function setCurrentDevice(){
  // Detect and set browser attributes in control object
    // Detect and set device in control object
    if (control.currentDevice === 0){
      //set mobile
      setDevice(0);
    } else {
      //set desktop
      setDevice(1);
    }
  }  

  function getMapHeight(){
    //get heights of elements
    var bodyHeight = detectHeight(body),
       titleHeight = 57,
         mapHeight = (bodyHeight - titleHeight) + "px";
    return mapHeight;
  }

// Gather data and set all controls
  function setAllControls(){
    control.currentDevice = detectDevice();
    setCurrentDevice();
    setHeight(container,getMapHeight());
    setHeight(canvas,getMapHeight());
  }



// GatherData functions
// LoadPopulateShowCategories functions

// Init
  // Show Loading Animation (progress?)
  // Detect Device/Size
  
  // Set map default options
  var myLatlng,
      myOptions;

  myLatlng = new google.maps.LatLng( 43.815045, -111.783515);
  myOptions = {
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
    setAllControls();
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
                 menu = $('#menu'),
         notification = $('#notification');
    
    if(newState === 0){
      // Toggle menu visibility off
        // Hide Menu with fade transition
        menu.fadeOut(200);
        // Show notification div with fade transition
        notification.fadeIn(200);
      // Toggle indicator
      menu_indicator.innerHTML = "+";
      // Set current state of menu visibility in control object
      control.menuState = 0;
      
    } 
    else {
      // Toggle menu visibility on
        menu.fadeIn(200);
        notification.fadeOut(200);
      // Toggle indicator
      menu_indicator.innerHTML = "-";
      // Set current state of menu visibility in control object
      control.menuState = 1;
      
    }
  }

  // ToggleMenu
  function toggleMenu(){
    console.time("toggleMenu");
    var menuState = control.menuState;
    if(menuState === 0){
      // Toggle menu visibility on
      setMenu(1);
    } else {
      // Toggle menu visibility off
      setMenu(0);
    }
    console.timeEnd("toggleMenu");
  }
  
  // ShowHideCategory

  

  // Search

  // Event Listeners and binding
  function resizeStack(){
    setHeight(container,getMapHeight());
    setHeight(canvas,getMapHeight());
  }
  //window.onResize = resizeStack;
  window.addEventListener('resize', resizeStack, false);

  if( window.addEventListener ){
      window.addEventListener('resize', resizeStack, false);
  }


