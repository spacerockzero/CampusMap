/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  08.01.2012            */

// JS Lint Options (remove after deployment)
/*jslint white:true, browser: true */
/*global google, jQuery, $, done*/

// Cache global objects as local variables
  var doc = document,
      win = window,
container = doc.getElementById('container'),
     body = doc.getElementsByTagName('body')[0],
   canvas = doc.getElementById('map_canvas'),
            myLatlng,
            myOptions;

// Control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0,
  jQueryLoaded: 0
};

// Arrays to hold category names, settings, and control info
var categoryInfo = [], 
    mapCategories = [];

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

  // Set Device
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

  // Toggle between device types
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
  function setCurrentDevice(){
    // Detect and set device in control object
    if (control.currentDevice === 0){
      //set mobile
      setDevice(0);
    } else {
      //set desktop
      setDevice(1);
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

  //get heights of elements
  function getMapHeight(){
    var bodyHeight = detectHeight(body),
       titleHeight = 57,
         mapHeight = (bodyHeight - titleHeight) + "px";
    return mapHeight;
  }


/****************************************************/
/*  Set All Controls Functions                      */
/****************************************************/
  
  function setAllControls(){
    control.currentDevice = detectDevice();
    setCurrentDevice();
    setHeight(container,getMapHeight());
    setHeight(canvas,getMapHeight());
  }


/****************************************************/
/*  Load all Data Functions                         */
/****************************************************/
// Load all category info from file into categoryInfo array
function loadCategoryInfoFile() {
  var url = 'data/categories.txt';
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data) {
      //add new data to global objects
      //categories = data;
      categoryInfo = data;
    }
  })
  .done(function(){});
}

// Load all category info from file into categoryInfo array
function loadCategoryFile() {

  var url = 'data/objectFile.txt';
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data) {
      //add new data to global object
      console.log('successfully pulled json category');
      mapCategories = data;
    }
  })
  .fail(function() {
    console.log("ajax error"); 
  });

}


// LoadPopulateShowCategories functions

// Init
  // Show Loading Animation (progress?)
  // Detect Device/Size
  
  // Set map default options
  function setOptions(){
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
  }

  // Create Map Object
  function initialize() {
    setOptions();
    setAllControls();
    var map;
    map = new google.maps.Map(doc.getElementById('map_canvas'), myOptions);
    
    // Create infoWindow Object
    // Load Campus Boundary Layer
    
    // Run GatherData Stack
      loadCategoryInfoFile();
      loadCategoryFile();

    // Run LoadPopulateShowCategories Stack
    // Hide Loading Animation
  }//end initialize()

  
  
  



// Events
  // SetMenu
  function setMenu(newState){
   
    var menu_indicator = doc.getElementById('menu_indicator'),
                  menu = doc.getElementById('menu'),     
          notification = doc.getElementById('notification'),     
         currentDevice = control.currentDevice;     
    
    //selectors for non-mobile jQuery 
    if(currentDevice !== 0){     
     menu = $('#menu');     
     notification = $('#notification');     
    }
    
    if(newState === 0){
    // Toggle menu visibility off
      
      // for mobile
      if(currentDevice === 0){
        // Hide Menu
        menu.style.display = "none";
        // Show notification div
        notification.style.display = "block";
      // for non-mobile
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
      if(currentDevice === 0){
        // mobile minimal show menu, hide notification div
        menu.style.display = "block";
        notification.style.display = "none";
      } else {
        // non-mobile fancy
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

  // Event Listeners and binding
  function resizeStack(){
    setHeight(container,getMapHeight());
    setHeight(canvas,getMapHeight());
  }

  if( win.addEventListener ){
    win.addEventListener('resize', resizeStack, false);
  } else {
    var resizeTimeOut = null;
    var resizeFunc = resizeStack();
    window.onresize = function(){
      if(resizeTimeOut != null) clearTimeout(resizeTimeOut);
      resizeTimeOut = setTimeout(resizeStack, 100);
    };
  }




