/*****************************************************/
/*   BYU-I Campus Map                                */
/*   - Author: Jakob Anderson :: jakobanderson.com   */
/*   - Requires: Google Maps API v3, jQuery 1.7      */
/*   - Revised:  08.28.2012                          */
/*****************************************************/

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
 //polygonFile = 'http://www2.byui.edu/Map/parking_data.xml',
  campusFile = 'http://www2.byui.edu/Map/campus_outline.xml';


// Control object holds the current states and values of the app
var control = {
  menuState: 0,
  currentDevice: 0,
  categoryState: []
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
  // This static file may be replaced by a web service 
  // returning JSON data at a later time
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
  // This static file may be replaced by a web service 
  // returning JSON data at a later time
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

  // Execution wrapper to time and serialize the data import functions from outside
  function loadCatData(callback){
    loadCategoryInfoFile();
    loadCategoryFile();
    callback();
  }


/****************************************************/
/*   Load Progress                                  */
/****************************************************/
  
  // alter loading bar's visible progress %
  function loadProgress(percentageComplete){
    var obj = doc.getElementById('loading_progress');
    obj.style.width = percentageComplete + '%';
  }

  // Execute when page, data, and DOM is finished loading, then hide loading div
  function loadComplete(callback){
    loadProgress(100);
    var loadingDiv = $('#loading'),
            device = control.currentDevice; 
    loadingDiv.fadeOut(1000);
    callback;
  }


/****************************************************/
/*   Create a Marker                                */
/****************************************************/

  function createMarker(lat,lon,name,icon){

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      visible: false,
      map: map,
      title: name,
      icon: icon
    });

    return marker;
  }

  function buildCatObject(i,name,color){
    var thishtml = "";
        thishtml += '<a class="object" href="#">';
        thishtml +=   '<img  class="obj_icon" src="img/icons/numeral-icons/' + color + '/' + (i+1) + '.png" alt="' + name + '" height="25">';
        thishtml +=   '<div class="object_name">' + name + '</div>';
        thishtml += '</a>';
    return thishtml;
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
         state,
             i = 0,
         catID;

    while(i<length){

      thisCat = categoryInfo[i];

      html += '<div class="category" id="cat_' + i + '">';
      if (categoryInfo[i].type === 0){
        html +=   '<a class="category_bar" href="#" >';
      } else {
        html +=   '<a class="category_bar cat_polygon" href="#" >';
      }
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

      // set the global control to read this category as being in a closed state by default
      control.categoryState[i] = 0;

      i += 1;
    }

    // insert html back into target with one reflow
    target.innerHTML = html; 
    callback; 
  }

  function populateObjectCategory(index){
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

      //create new google maps marker 
      marker = createMarker(lat,lon,name,icon); 
      // Build html string for all DOM to be created for this category 
      html += buildCatObject(i,name,color);
      // push this category's markers to the main global marker array
      markers.push(marker);
      // advance iterator
      i += 1;
    }

    // Insert output into the DOM in one action. 
    // Consider combining all reflow into one function with the category builder later.
    target.innerHTML = html;
    // Add this category's markers to array of all markers
    allMarkers[index] = markers;

  }


  //do something with polygon layers' data
  function populatePolygonCategory(index,callback){

    var target = document.getElementById('category_' + index),
          html = "",
        catObj = categoryInfo[index],
       objData = mapCategories[index],
      thisData,
          icon,
        length = objData.length,
             i = 0,
          name,
  polygonLayer,
   polygonFile,
        layers = [];

    while(i<length){

      thisData = objData[i];

      // write html for category menu
      html += '<a class="object polygon" id="layer_cat_' + i + '" href="#">';
      html +=   '<div class="polygon_key" id="poly_' + thisData.name + '" style="border-color:' + thisData.borderColor + ';background-color:' + thisData.fillColor + '">&nbsp;</div>';
      html +=   '<div class="object_name polygon">' + thisData.name + '</div>';
      html +=  '</a>';

      // set GoogleEarth KML polygon file path string
      polygonFile = mapCategories[index][i].map;

      // load map layer
      polygonLayer = new google.maps.KmlLayer(polygonFile,
                        {
                            suppressInfoWindows: true,
                            preserveViewport: true
                            // zoom: 18
                        });

      layers.push(polygonLayer);

      i += 1;
    }
    
    markerArray[index] = layers;

    // write all new html for this category to DOM in one instant reflow
    target.innerHTML = html;

  }


  // Show / Toggle Object Category markers
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


  // Show / Toggle Polygon Category KML layers
  function togglePolygonVisibility(obj, catIndex, layerIndex, callback){
    console.time('show polygon');
    var layer = markerArray[catIndex][layerIndex],
        active = obj.hasClass('active_polygon');
        console.log("This hasclass = " + obj.className);

    //Hide this layer's polygons
    if (active === true) {
      layer.setMap(null);
      obj.toggleClass('active_polygon');
      console.log(obj.className);
    }
    //Show this layer's polygons
    else {
      layer.setMap(map);
      obj.toggleClass('active_polygon');
      console.log(obj.className);
    }
    console.timeEnd('show polygon');
    callback;
  }


/****************************************************/
/*   Initialize App                                 */
/****************************************************/
  
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

  // Initialize & Execute Map App Stack
  function initialize(callback) {
    // Run Map setup stack
    setOptions();
    setAllControls();
    setMap();
    setInfoWindow();
    setCampusLayer(); 
      loadProgress(20);   
    // Run GatherData Stack using callback function to serialize the dependent functions
    loadCategoryInfoFile(function(){ 
      populateCategoryInfo();
    });
      loadProgress(40);
    loadCategoryFile(function(){
      runPopulators();
      bindCategoryToggle();
      bindPolygonToggle();
    });
      loadProgress(90);
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
        menu.fadeOut(300);            /* Hide Menu with fade transition, Show notification div with fade transition*/
        notification.fadeIn(300);
      }
      menu_indicator.innerHTML = "+";  /* Toggle indicator, Set current state of menu visibility in control object */
      control.menuState = 0; 
    } 
    else {                             /* Toggle menu visibility on */
      if(currentDevice === 0){         /*  mobile minimal show menu, hide notification div*/
        menu.style.display = "block";
        notification.style.display = "none";
      } else {                         /* non-mobile fancy */
        
        menu.fadeIn(300);
        notification.fadeOut(300);
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


/****************************************************/
/*   Category Toggle                                */
/****************************************************/

  function bindCategoryToggle(callback){

    $('.category_bar').mousedown(function(){

      console.time("clickCategory");

      var device = control.currentDevice,
          parent = this.parentNode,
           index = parent.id.substr(4),
        catState = control.categoryState[index],
           child = parent.children[1],
         display = child.style.display,
         polygon = $(this).hasClass('cat_polygon');         
      
      if(device === 1){
        child = $(this).parent().find('.cat_container');
      }

        // Toggle Category in Menu
        if(catState === 0){
          catState = 1;
          if(device === 0){
            child.style.display = "block";
          } else {
            child.slideToggle(200);
          }
          if(polygon === false){
            // Show markers for this category
            toggleMarkerVisibility(index,1);
          } 
        
        } else {
          catState = 0;
          if(device === 0){
            child.style.display = "none";
          } else {
            child.slideToggle(200);
          }
          if(polygon === false){
            // Hide markers for this category
            toggleMarkerVisibility(index,0);
          } 
        }

      // Set global control with changes
      control.categoryState[index] = catState;
      console.timeEnd("clickCategory");

    });
    callback;
  }
/****************************************************/
/*   Category Toggle                                */
/****************************************************/

  function bindPolygonToggle(callback){

    $('.object.polygon').mousedown(function(event){
      event.stopPropagation();
      console.log("inside polygon click");

         var obj = $(this),
        catIndex = obj.parent().attr('id').substr(9),
      layerIndex = obj.attr('id').substr(10);

      console.log('catIndex = ' + catIndex + ', layerIndex = ' + layerIndex);

      togglePolygonVisibility(obj, catIndex, layerIndex);

    });

  }  
  // Search (needs web service ajax server? 
    // May just do a live AJAX node search of the 
    // objectFile Array to live populate results, 
    // and the according markers)

  // URL - Object API ? (Navigate to specific object using an externally shared url)
    // This may also work through the search service, once complete...


/****************************************************/
/*   Other Events & Bindings                        */
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
    doResize = setTimeout(function(){
      resizeStack();
    }, 500);
  });

  $win.load(function(){
    initialize(loadComplete);
    loadComplete();
  });
 





