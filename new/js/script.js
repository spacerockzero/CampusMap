/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  08.01.2012            */

// JS Lint Options (remove after deployment)
/*jslint white:true, browser: true */
/*global google, jQuery, $, done*/

// Cache global objects as local variables
     var doc = document,
         win = window,
        $doc = $(document),
        $win = $(window),
   container = doc.getElementById('container'),
        body = doc.getElementsByTagName('body')[0],
      canvas = doc.getElementById('map_canvas'),
    doResize,
categoryFile = 'data/categories.txt',
  objectFile = 'data/objectFile.txt',
    myLatlng,
   myOptions,
         map,
parkingLayer,
  infoWindow,
 campusLayer,
    iconpath = 'img/icons/numeral-icons/',
 polygonFile = 'http://www2.byui.edu/Map/parking_data.xml',
  campusFile = 'http://www2.byui.edu/Map/campus_outline.xml';


// Control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0
};


// Arrays to hold category names, settings, and control info
var categoryInfo = [], 
   mapCategories = [],
     markerArray = [];


/**********************/
/*  Global Functions  */
/**********************/

  // Asynchronous script loader function
  function loadScript(src, callback) {
    var head = document.getElementsByTagName('head')[0],
      script = document.createElement('script'),
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

function jsFade(eid,time,callback) {
  var timeToFade = time,
         element = document.getElementById(eid);
  
  if(element === null){
    return;
  }
   
  if(element.FadeState === null)
  {
    if(element.style.opacity === null 
        || element.style.opacity === '' 
        || element.style.opacity === '1')
    {
      element.FadeState = 2;
    }
    else
    {
      element.FadeState = -2;
    }
  }
    
  if(element.FadeState === 1 || element.FadeState === -1)
  {
    element.FadeState = element.FadeState === 1 ? -1 : 1;
    element.FadeTimeLeft = time - element.FadeTimeLeft;
  }
  else
  {
    element.FadeState = element.FadeState === 2 ? -1 : 1;
    element.FadeTimeLeft = time;
    setTimeout("animateFade(" + new Date().getTime() + ",'" + eid + "')", 33);
  }
  callback;  
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
  function setDevice(changeTo, callback){
    var deviceIndicator = doc.getElementById('device_type'),
                   body = doc.getElementsByTagName("body")[0];
    if (changeTo === 0){
      // Set to Mobile
        // Set the body id, set new control value
        control.currentDevice = 0;
        body.setAttribute("id","mobile");
    } else {
      // Set to Desktop
        // Set the body id, set new control value
        control.currentDevice = 1;
        body.setAttribute("id","desktop");
    }
    callback;
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

    $.ajax({
      dataType: "json",
      url: categoryFile,
      success: function(data) {
        //add new data to global objects
        categoryInfo = data;
      }
    })
    .done(callback);
  }

  // Load all category info from file into categoryInfo array
  function loadCategoryFile(callback) {
    $.ajax({
      dataType: "json",
      url: objectFile,
      success: function(data) {
        //add new data to global object
        console.log('successfully pulled json categories');
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
/*   Events & Bindings                              */
/****************************************************/

  function loadComplete(callback){

      console.log("inside loadComplete");

    var loadingDiv = $('#loading'),
            device = control.currentDevice; 
    
    // if(device === 1){
    //   loadingDiv = $('#loading');
    // }

    //hide loading message
    // if(device === 0){
    //   // minimal for mobile
    //   jsFade(loadingDiv,999);
    //   // win.setTimeout("",1000);
    //   loadingDiv.style.display = 'none';

    // } else {
      // fancy and smooth for desktop
      loadingDiv.fadeOut(700);
    // }

    callback;
  }


/****************************************************/
/*   Populate & Show Categories                     */
/****************************************************/

  // Populate menu
  function populateCategoryInfo(callback){

    // set target div and html string var to be inserted
    var target = doc.getElementById('categories'),
          html = "",
        length = categoryInfo.length,
       thisCat,
             i = 0;

    while(i<length){

      thisCat = categoryInfo[i];

      html += '<div class="category" >';
      html +=   '<a class="category_bar" href="#" onmousedown="toggleMarkerVisibility(' + i + ', 1); return false;">';
      html +=     '<img class="cat_icon" src="img/icons/blank-colors/'+ thisCat.icon + '.png" height="25"/>';
      html +=     '<span class="category_name">' + thisCat.title + '</span>';
      html +=   '</a>';
      html +=   '<div class="cat_container">';
      html +=     '<div class="cat_info">';
      html +=       '<p>';
      html +=         thisCat.text;
      html +=       '</p>';
      html +=       '<a href="' + thisCat.link + '">' + thisCat.title + ' website</a>';
      html +=     '</div>';
      html +=     '<div id="category_' + i + '"></div>';
      html +=   '</div>';
      html += '</div>';
      i += 1;
    }

    // insert html back into target with one reflow
    target.innerHTML = html; 
    callback; 
  }

  function populateObjectCategory(index){

    console.time("populate Category");
    // set target div and html string var to be inserted
    var target = document.getElementById('category_' + index),
          html = "",
        catObj = categoryInfo[index],
       objData = mapCategories[index],
    allMarkers = markerArray,
       markers = [],
         color = catObj.icon,
          icon,
        length = objData.length,
             i = 0,
           obj,
          name,
           lat,
           lon,
        marker;        

    // begin iterations through menu/marker objects
    while(i<length){
          obj = objData[i];
         name = obj.name;
          lat = obj.lat;
          lon = obj.lon;
         icon = iconpath + color + '/' + (i+1) + '.png';
       marker = new google.maps.Marker({
         position: new google.maps.LatLng(lat, lon),
         visible: false,
         map: map,
         title: name,
         icon: icon
       });

      // Build html string for all DOM to be created for this category 
      html += '<a class="object" href="#">';
      html +=   '<img  class="obj_icon" src="img/icons/numeral-icons/' + color + '/' + (i+1) + '.png" alt="' + objData[i].name + '" height="25">';
      html +=   '<div class="object_name">' + objData[i].name + '</div>';
      html += '</a>';

      markers.push(marker);
      
      i += 1;
    }

    // Insert output into the DOM in one action. 
    // Consider combining all reflow into one function later.
    target.innerHTML = html;

    // Add this category's markers to array of all markers
    allMarkers[index] = markers;

    console.timeEnd("populate Category");
  }

  function populatePolygonCategory(callback){

  }

  

  // Show / Toggle Object Category
  function toggleMarkerVisibility(index,newState){
    var array = markerArray[index],
  arrayLength = array.length,
            i = 0;

    if(newState === 1){
      // Show Markers
      while(i<arrayLength){
        array[i].setVisible(true);
        i += 1;
      }
    } else {
    // Hide markers
      while(i<arrayLength){
        array[i].setVisible(false);
        i += 1;
      }
    }

  }

// markerArray[catIndex][i].setVisible(false);
  // Show / Toggle Polygon Category
  function showPolygonCategory(callback){
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


/****************************************************/
/*   Category Toggle                                */
/****************************************************/

  function bindCategoryToggle(callback){

    $('.category_bar').click(function(){
          console.time("clickCategory");
      var device = control.currentDevice,
           child = this.parentNode.children[1],
         display = child.style.display,
         $jChild = $(this).parent().find('.cat_container');
      
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
       console.timeEnd("clickCategory");
    });
    callback;
  }

  //populate all categories
  function runPopulators(callback){
    
    var i = 0,
   length = categoryInfo.length,
     type;

    while(i<length){
      type = categoryInfo[i].type;
      if(type === 0){
        populateObjectCategory(i);
      } else if (type === 1){
        populatePolygonCategory(i);
      }
      i += 1;
    }
    callback;
  }

  // Create Map Object
  function initialize(callback) {
    // Run Map setup stack
    setOptions();
    setAllControls();
    setMap();
    setInfoWindow();
    setCampusLayer();    
    
    // Run GatherData Stack using callback function to serialize the dependent functions
    loadCategoryInfoFile(function(){ 
      populateCategoryInfo();
    });
    loadCategoryFile(function(){
      runPopulators();
      bindCategoryToggle();
    });
    // wait 1 second after reaching this point in the script to execute the loadComplete() function
    win.setTimeout("loadComplete()",1000);        /* This is still running async for now, will load before all init has completed until fixed */
    callback;
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
    
    if(currentDevice !== 0){ /* selectors for non-mobile jQuery */
     menu = $('#menu');     
     notification = $('#notification');     
    }

    if(newState === 0){               /* Toggle menu visibility off */
      if(currentDevice === 0){        /* For mobile */
        menu.style.display = "none";  /* Hide Menu, Show notification div*/
        notification.style.display = "block";
      } else {                        /* for non-mobile */
        menu.fadeOut(200);            /* Hide Menu with fade transition, Show notification div with fade transition*/
        notification.fadeIn(200);
      }
      menu_indicator.innerHTML = "+";  /* Toggle indicator, Set current state of menu visibility in control object */
      control.menuState = 0; 
    } 
    else {                             /* Toggle menu visibility on */
      if(currentDevice === 0){         /*  mobile minimal show menu, hide notification div*/
        menu.style.display = "block";
        notification.style.display = "none";
      } else {                         /* non-mobile fancy */
        
        menu.fadeIn(200);
        notification.fadeOut(200);
      }                                /* Toggle indicator, Set current state of menu visibility in control object */
      menu_indicator.innerHTML = "-";
      control.menuState = 1; 
    }
  }

  // ToggleMenu
  function toggleMenu(){
    var menuState = control.menuState;
    if(menuState === 0){              /* Toggle menu visibility on */
      setMenu(1);
    } else {                          /* Toggle menu visibility off */
      setMenu(0);
    }
  }


  // Search (needs web service ajax server? 
    // May just do a live AJAX node search of the 
    // objectFile Array to live populate results, 
    // and the according markers)

  // URL - Object API ? (Navigate to specific object using an externally shared url)
    // This may also work through the search service, once complete...



/****************************************************/
/*   Events & Bindings                              */
/****************************************************/

  // Global Resize Event Function Stack
  function resizeStack(){
    setHeight(container,getMapHeight());
    setHeight(canvas,getMapHeight());
    setDevice(detectDevice());
  }

  // global map resize event listener
  $win.resize(function(){
    clearTimeout(doResize);
    doResize = setTimeout(function(){resizeStack();}, 100);
  });

  $win.load(function(){
    initialize();
  });
  // $('.object_name').ready(function(){
  //   loadComplete();
  // });
 





