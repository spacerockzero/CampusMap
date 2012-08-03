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
  currentDevice: 0,
  jQueryLoaded: 0
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

  function loadjQuery(){
    // load jQuery if desktop device
    if(control.currentDevice === 1){
      // load the file and display an alert dialog once the script has been loaded
      loadScript('js/libs/jquery-1.7.2.min.js', function() {});
      control.jQueryLoaded = 1;
    }
  }

  // Detect jQuery
  function detectjQuery(){
    if(typeof jQuery === 'undefined'){
      return 0;
    } else {
      return 1;
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
    loadjQuery();
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
                 menu = doc.getElementById('menu'),
         notification = doc.getElementById('notification'),
         jQueryLoaded = control.jQueryLoaded;
    
    if(jQueryLoaded === 1){
      menu = $('#menu');
      notification = $('#notification');
    }
    
    if(newState === 0){
      // Toggle menu visibility off
      if(jQueryLoaded === 0){
        // Hide Menu
        menu.style.display = "none";
        // Show notification div
        notification.style.display = "block";
      } else {
        // Hide Menu with fade transition
        menu.fadeOut(200);
        // Show notification div with fade transition
        notification.fadeIn(200);
      }
      // Toggle indicator
      menu_indicator.innerHTML = "+";
      // Set current state of menu visibility in control object
      control.menuState = 0;
      
    } 
    else {
      // Toggle menu visibility on
      if(jQueryLoaded === 0){
        menu.style.display = "block";
        // Hide notification div
        notification.style.display = "none";
      }else{
        menu.fadeIn(200);
        notification.fadeOut(200);
      }
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

//   (function( win ){
//   var doc = win.document;
    
//   // If there's a hash, or addEventListener is undefined, stop here
//   if( !(location.hash && win.addEventListener) ){
//     //scroll to 1
//     window.scrollTo( 0, 1 );
//     var scrollTop = 1,
//       getScrollTop = function(){
//         return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
//       },
//       //reset to 0 on bodyready, if needed
//       bodycheck = setInterval(function(){
//         if( doc.body ){
//           clearInterval( bodycheck );
//           scrollTop = getScrollTop();
//           win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
//         } 
//       }, 15 );
//     win.addEventListener( "load", function(){
//       setTimeout(function(){
//           //reset to hide addr bar at onload
//           win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
//       }, 0);
//     } );
//   }
// })( this );


