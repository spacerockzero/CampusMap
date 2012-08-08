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
// categoryDivs = $('.category'),
               myLatlng,
               myOptions,
               map,
               parkingLayer,
               infoWindow,
               campusLayer,
 polygonFile = 'http://www2.byui.edu/Map/parking_data2.xml',
  campusFile = 'http://www2.byui.edu/Map/campus-outline.xml';


// Control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0
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
        // Set the body id, set new control value
        body.setAttribute("id","mobile");
        control.currentDevice = 0;
        console.log("Mobile mode set");
    } else {
      // Set to Desktop
        // Set the body id, set new control value
        body.setAttribute("id","desktop");
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
  function loadCategoryInfoFile(callback) {
    var url = 'data/categories.txt';
    $.ajax({
      dataType: "json",
      url: url,
      success: function(data) {
        //add new data to global objects
        categoryInfo = data;
      }
    })
    .done(callback);
  }

  // Load all category info from file into categoryInfo array
  function loadCategoryFile(callback) {
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
    .done(callback)
    .fail(function() {
      console.log("ajax error"); 
    });
  }

  function loadCatData(callback){
    loadCategoryInfoFile();
    loadCategoryFile();
    callback();
  }

/****************************************************/
/*   Populate & Show Categories                     */
/****************************************************/

  // Populate menu
  function populateCategoryInfo(callback){
    //console.time("populateCategories");
    // set target div and html string var to be inserted
    var target = doc.getElementById('categories'),
          html = "",
        length = categoryInfo.length,
             i = 0;

    while(i<length){
      html += '<div class="category" >';
      html +=   '<a class="category_bar" href="#">';
      html +=     '<img class="cat_icon" src="img/icons/blank-colors/'+ categoryInfo[i].icon + '.png" height="25"/>';
      html +=     '<span class="category_name">' + categoryInfo[i].title + '</span>';
      html +=   '</a>';
      html +=   '<div class="cat_container">';
      html +=     '<div class="cat_info">';
      html +=       '<p>';
      html +=         categoryInfo[i].text;
      html +=       '</p>';
      html +=       '<a href="' + categoryInfo[i].link + '">' + categoryInfo[i].title + ' website</a>';
      html +=     '</div>';
      html +=   '</div>';
      html += '</div>';
      i += 1;
    }

    // insert html back into target with one reflow
    target.innerHTML = html; 
    callback;
    //console.timeEnd("populateCategories");  
  }

  function populateContent(callback){
    callback;
  }

  // Show / Toggle Categories
  function showCategories(callback){
    callback;
  }


/****************************************************/
/*   Initialize App                                 */
/****************************************************/

// Init
  // Show Loading Animation (progress?)
  
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

  function setMap(){
    map = new google.maps.Map(doc.getElementById('map_canvas'), myOptions);
  }

  function setInfoWindow(){
    // Create infoWindow Object
    infoWindow = new google.maps.InfoWindow();
  }

  function setCampusLayer(){
    // Load Campus Boundary Layer
    campusLayer = new google.maps.KmlLayer(campusFile,
      {
        suppressInfoWindows: true,
        map: map,
        preserveViewport: true,
        zoom: 18
      });
    campusLayer.setMap(map);
  }

  function bindCategoryToggle(){
    $('.category').click(function(){

      var device = control.currentDevice,
           child = this.children[1],
         display = child.style.display,
         $jChild = $(this).find('.cat_container');
      
      if(display !== 'block'){
        if(device === 0){
          child.style.display = "block";
        } else {
          $jChild.slideToggle(200);
        }
      } else {
        if(device === 0){
          child.style.display = "none";
        } else {
          $jChild.slideToggle(200);
        }
      }
    });
  }

  // Create Map Object
  function initialize() {
    // Run Map setup stack
    setOptions();
    setAllControls();
    setMap();
    setInfoWindow();
    setCampusLayer();    
    
    // Run GatherData Stack using callback function to serialize the dependent functions
    // loadCategoryInfoFile(function(){
      
    //   populateCategoryInfo();
    // });
    // loadCategoryFile(function(){
    //   populateContent();
    //   bindCategoryToggle();
    // });

    // Run Populate Categories Stack

    // Hide Loading Animation

  }//end initialize()



/****************************************************/
/*   Menu Toggle                                    */
/****************************************************/
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
      
      // For mobile
      if(currentDevice === 0){
        // Hide Menu, Show notification div
        menu.style.display = "none";
        notification.style.display = "block";
      
      // for non-mobile
      } else {
        // Hide Menu with fade transition, Show notification div with fade transition
        menu.fadeOut(200);
        notification.fadeIn(200);
      }
      
      // Toggle indicator, Set current state of menu visibility in control object
      menu_indicator.innerHTML = "+";
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
      // Toggle indicator, Set current state of menu visibility in control object
      menu_indicator.innerHTML = "-";
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

/****************************************************/
/*   Category Toggle                                */
/****************************************************/

// function categoryToggle(obj){

//   var jQueryLoaded = control.jQueryLoaded,
//              child = obj.children[1],
//         divClasses = child.className;

//   // if(jQueryLoaded !== 1){
//   //   if(divClasses !== "hide"){
//   //     child.addClass('hide');
//   //   } else {
//   //     child.addClass('unhide');
//   //   }
//   // } else {
//     child.toggleClass('unhide');
//   // }
// }


  // Search (needs web service ajax server)



/****************************************************/
/*   Events & Bindings                              */
/****************************************************/

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
      if(resizeTimeOut !== null) {clearTimeout(resizeTimeOut);}
      resizeTimeOut = setTimeout(resizeStack, 100);
    };
  }





