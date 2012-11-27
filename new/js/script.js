/*****************************************************/
/*   BYU-I Campus Map                                */
/*   - Author: Jakob Anderson :: jakobanderson.com   */
/*   - Requires: Google Maps API v3, jQuery 1.7      */
/*   - Revised:  11.27.2012                          */
/*****************************************************/

// JS Lint Options (remove after deployment)
/*jslint white:true, browser: true, maxerr:100 */
/*global google, jQuery, $, done*/

// Cache global objects as local variables. 
     var doc = document,
         win = window,
        $doc = $(document),  /* jQuery variant of doc */
        $win = $(window),    /* jQuery variant of win */
// Cache often-used dom objects so that you don't have to select them again, 
// speeding up overall latency.
   container = doc.getElementById('container'),
        body = doc.getElementsByTagName('body')[0],
      canvas = doc.getElementById('map_canvas'),
    doResize,
categoryFile = 'data/categories.txt',
  //objectFile = 'data/objectFile.txt',
  objectFile = 'data/objectFileExperiment.txt',               /* Experimental Data file, used for testing new data structures and source info */
    myLatlng,                                                 /* BYU-Idaho's center of campus lat/ling in googlemaps' latling object form */
   myOptions,
         map,
parkingLayer,
  infoWindow,
    iconpath = 'img/icons/numeral-icons/',
 campusLayer,                                                 /* The layer that will have the campusfile kml rendered onto it */
  campusFile = 'http://www2.byui.edu/Map/campus_outline.xml'; /* kml file that represents the outline image of campus. All kml files must be on an absolute-path, in a web-accessible location for google's servers to process them */


// Control object holds the current states of parts of the app
var control = {
  menuState: 0,      /* 0 = Menu is closed/hidden, 1 = Menu is open/shown */
  currentDevice: 0,  /* 0 = Current Device is Mobile, 1 = Current Device is Desktop */
  categoryState: []  /* array that holds the current states (open/close) of each category's submenu */
};


// Arrays to hold category names, settings, and control info
var categoryInfo = [], /* array that holds the basic info about each category: icon, link, name, text, title, etc */
   mapCategories = [], /* array that holds the subitems from each category: objects and their lat/lon infowindow data, or polygon names, key info and kml path data */
     markerArray = []; /* array of actual google map markers of objects, separated by category, in same order as above two arrays. Iterate through this to perform functions on markers, such as setting visibility */ 


/**********************/
/*  Global Functions  */
/**********************/

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
    if (callback && typeof(callback) === "function") {
      callback();
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

  //get heights of elements
  function getMapHeight(){
    var bodyHeight = detectHeight(body),
       titleHeight = detectHeight(doc.getElementById('title')),
         mapHeight = (bodyHeight - titleHeight) + "px";
         console.log("bodyHeight = " + bodyHeight);
         console.log("titleHeight = " + titleHeight);
         console.log("mapHeight = " + mapHeight);
    return mapHeight;
  }


/****************************************************/
/*  Set All Controls Functions                      */
/****************************************************/
  
  function setAllControls(){
    var device = detectDevice();
    control.currentDevice = device;
    setCurrentDevice();
    resizeStack();
    // if(device === 0){
    //   setHeight(container,'918px');
    //   setHeight(canvas,'918px');
    // }else{
    //   setHeight(container,'901px');
    //   setHeight(canvas,'901px');
    // }
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
    .done(callback)
    .fail(function() {
      console.log("category ajax error"); 
    });
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
      console.log("objects ajax error"); 
    });
  }

  // Execution wrapper to time and serialize the data import functions from outside
  function loadCatData(callback){
    loadCategoryInfoFile();
    loadCategoryFile();
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }


/****************************************************/
/*   Load Progress                                  */
/****************************************************/
  
  // alter loading bar's visible progress %
  function loadProgress(percentageComplete, callback){

    var obj = doc.getElementById('loading_progress');
    obj.style.width = percentageComplete + '%';

    console.log("Loaded " + percentageComplete);
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }
  
  // Execute when page, data, and DOM is finished loading, then hide loading div
  function loadComplete(callback){
    loadProgress(100);
    var loadingDiv = $('#loading'),
            device = control.currentDevice,
              menu = $('#menu_button'); 
    loadingDiv.fadeOut(1000);
    //menu.fadeIn(1000);
    if (callback && typeof(callback) === "function") {
      callback();
    }
    console.timeEnd("initialize js chain until ready");
  }


/****************************************************/
/*   Marker Functions                               */
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

  function buildCatObject(i,catIndex,name,color){
    var thishtml = "";
        thishtml += '<a id="obj_' + catIndex + '-' + i + '" class="object marker_object" name="' + name + '" href="#">';
        thishtml +=   '<img  class="obj_icon" src="img/icons/numeral-icons/' + color + '/' + (i+1) + '.png" alt="' + name + '" />';
        thishtml +=   '<div class="object_name">' + name + '</div>';
        thishtml += '</a>';
    return thishtml;
  }

  function createInfoWindow(marker,obj,catName){
    // Listener that builds the infopane popups on marker click
    google.maps.event.addListener(marker, 'click', function() {

      var content = '',
             name = obj.name,
              img,
             link = obj.link,
            hours = obj.hours,
            phone = obj.phone,
          address = obj.address,
             info = obj.info,
           device = control.currentDevice;

              if (obj.img) {
                if (obj.img.indexOf(':') === -1) {
                  img = 'img/objects/' + catName + '/' + obj.img;
                }
                else {
                  img = obj.img;
                }
              }
             

      // Create the info panes which hold content about each building
      content += '<div class="infopane';
      if(device === 0) {
        content += ' infopane-mobile">';
      } else {
        content += ' infopane-desktop">';
      }
      content +=   '<h2>' + name + '</h2>';
      content +=   '<div>';
      if (img){
        content += '<img src="' + img + '" alt="' + name + '"';
        if(device === 0) {
          content += 'width="100" height="75"'; 
        } else {
          content += 'width="200" height="150"';
        }
        content += 'style="float:right;margin:0 0 10px 10px"/>';
      }
      content += '<div class="button-div">';
      if (phone){
        content += '<a class="phone-call btn btn-large btn-primary icon-call" href="tel:' + phone + '" ></a>';
      }
      if (link){
        content += '<a href="' + link + '" class="btn btn-large btn-primary">More Info</a>';
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
      // Set the content of the InfoWindow
      infoWindow.setContent(content);
      // Open the InfoWindow
      infoWindow.open(map, marker);
    }); //end click listener
  }

  // OBJECT SELECT AND DISPLAY
  function displayPoint(marker) {
    var moveEnd = google.maps.event.addListener(map, 'moveend', function() {
      var markerOffset = map.fromLatLngToDivPixel(marker.getPosition());
      google.maps.event.removeListener(moveEnd);
    });
    map.panTo(marker.getPosition());
    google.maps.event.trigger(marker, 'click');
  }/* END displayPoint() */

/****************************************************/
/*   Populate & Show Categories                     */
/****************************************************/

  // Populate menu
  function populateCategoryInfo(callback){

    // set target div and html string var to be inserted
    var target = doc.getElementById('categories'),
          html = "",
  mapKeyTarget = doc.getElementById('map_keys'),
        length = categoryInfo.length,
       thisCat,
         state,
             i = 0,
         catID;

    while(i<length){
      thisCat = categoryInfo[i];
      
      html += '<div class="category" id="cat_' + i + '">';
      if (categoryInfo[i].type === 0){
        html += '<a class="category_bar" href="#" >';
      } else {
        html += '<a class="category_bar cat_polygon" href="#" >';
        mapKeyTarget.innerHTML += '<div id="map_key_' + thisCat.name + '"><div class="key_title">' + thisCat.name + ' Map Key</div><a href="#" class="close icon-cancel nolink"></a></div>';
      }
      html +=     '<img class="cat_icon" src="img/icons/blank-colors/'+ thisCat.icon + '.png" />';
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
    if (callback && typeof(callback) === "function") {
      callback();
    } 
  }

  function populateObjectCategory(index, callback){
    // set target div and html string var to be inserted
    var target = document.getElementById('category_' + index),
          html = "",
        catObj = categoryInfo[index],
       catName = catObj.name,
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
      // Append html string for all DOM to be created for this category 
      
      html += buildCatObject(i,index,name,color);

      // Create infoWindow for this marker
      createInfoWindow(marker,obj,catName);

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
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }


  //do something with polygon layers' data
  function populatePolygonCategory(index,callback){

    var target = document.getElementById('category_' + index),
          html = "",
        catObj = categoryInfo[index],
       objData = mapCategories[index],
  mapKeyTarget = document.getElementById('map_key_' + catObj.name),
        mapKey = "",
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
      html +=   '<div class="polygon_key" id="poly_' + thisData.name + '" style="border-color:' + thisData.borderColor + '; background-color:' + thisData.fillColor + '"><span>&nbsp;</span></div>';
      html +=   '<div class="object_name polygon">' + thisData.name + '</div>';
      html += '</a>';

      mapKey += '<div class="polygon_key" id="poly_key_' + thisData.code + '"style="border-color:' + thisData.borderColor + '; background-color:' + thisData.fillColor + '">' + thisData.code + '</div>';

      // set GoogleEarth KML polygon file path string
      polygonFile = mapCategories[index][i].map;

      // create google map kml layer object with custom options
      polygonLayer = new google.maps.KmlLayer(polygonFile,
                        {
                            suppressInfoWindows: false,
                            preserveViewport: true
                        });

      // push this layer to this category's layer array
      layers.push(polygonLayer);

      // add to incrementer
      i += 1;
    }
    
    // push entire category of layers to markerArray
    markerArray[index] = layers;

    // write all new html for this category to DOM in one instant reflow
    target.innerHTML = html;
    mapKeyTarget.innerHTML += mapKey;

    if (callback && typeof(callback) === "function") {
      callback();
    }
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
    //console.time('show polygon');
    //console.log(obj.children());
          obj = obj.find('span');
    var layer = markerArray[catIndex][layerIndex],
         code = mapCategories[catIndex][layerIndex].code,
       catKey = document.getElementById('map_key_' + categoryInfo[catIndex].name),
       keyObj = $('#map_keys ' + '#poly_key_' + code),
       active = obj.hasClass('icon-checkmark');
    console.log(obj);


    //Hide this layer's polygons
    if (active === true) {
      layer.setMap(null);
      obj.toggleClass('icon-checkmark');
      keyObj.toggleClass('active_key');
    }
    //Show this layer's polygons
    else {
      layer.setMap(map);
      obj.toggleClass('icon-checkmark');
      catKey.className = 'active_key_group';
      keyObj.toggleClass('active_key');
    }
    //console.timeEnd('show polygon');
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }


/****************************************************/
/*   Setup App                                      */
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
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }

  


/****************************************************/
/*   Menu Toggle                                    */
/****************************************************/
  // SetMenu
  function setMenu(newState){
   
              var menu = doc.getElementById('menu'),     
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
       menu.stop().fadeOut(300);            /* Hide Menu with fade transition, Show notification div with fade transition*/
        notification.stop().fadeIn(300);
      }
      control.menuState = 0; 
    } 
    else {                             /* Toggle menu visibility on */
      if(currentDevice === 0){         /*  mobile minimal show menu, hide notification div*/
        menu.style.display = "block";
       notification.style.display = "none";
      } else {                         /* non-mobile fancy */
       menu.stop().fadeIn(300);
       notification.stop().fadeOut(300);
      }
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

    $('.category_bar').on("click",function(){

      console.time("clickCategory");
      //close any open info windows
      infoWindow.close();

      var device = control.currentDevice,
          parent = this.parentNode,
           index = parent.id.substr(4),
        catState = control.categoryState[index],
           child = parent.children[1],
         display = child.style.display,
         polygon = $(this).hasClass('cat_polygon');         
      
      if(device === 1){
        child = $(this).next('div');
      }

      // Toggle Category in Menu
      if(catState === 0){ /* If category is closed */
        if(device === 0){
          child.style.display = "block";
        } else {
          child.slideToggle(200);
        }
        if(polygon === false){
          // Show markers for this category
          toggleMarkerVisibility(index,1);
        } 
        catState = 1;
      } else { /* If category is open */
        if(device === 0){
          child.style.display = "none";
        } else {
          child.slideToggle(200);
        }
        if(polygon === false){
          // Hide markers for this category
          toggleMarkerVisibility(index,0);
        } 
        catState = 0;
      }

      // Set global control with changes
      control.categoryState[index] = catState;
      console.timeEnd("clickCategory");
    });
    
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }
/****************************************************/
/*   Category Toggle                                */
/****************************************************/

  function bindPolygonToggle(callback){

    $('.object.polygon').click(function(event){

      // stop click event from "propagating/bubbling down to children DOM elements"
      event.stopPropagation();

         var obj = $(this),
        catIndex = obj.parent().attr('id').substr(9),
      layerIndex = obj.attr('id').substr(10);

      togglePolygonVisibility(obj, catIndex, layerIndex);

    });
    callback();
  }  

/****************************************************/
/*   Bind Menu Objects                              */
/****************************************************/

  function bindMenuObjects(callback){
    
    $('.object.marker_object').click(function(event){
      // stop click event from "propagating/bubbling down to children DOM elements"
      event.stopPropagation();

         var obj = this,
        catIndex = obj.id.charAt(4),
        objIndex = obj.id.substr(6),
      thisMarker = markerArray[catIndex][objIndex],
          device = control.currentDevice;

      //display corresponding marker/infowindow when menu item is clicked/pressed
      displayPoint(thisMarker);
      if (device === 0){ 
        setMenu(0);
      }
    });
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }  

  function typeToggle(callback){
    //automagically switch to vector map for close-up, and satellite map for farther view
    google.maps.event.addListener( map, 'maptypeid_changed', function() {
      document.getElementById("notification").className = map.getMapTypeId(); 
    });
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }

  // Search (needs web service ajax server? 
    // May just do a live AJAX node search of the 
    // objectFile Array to live populate results, 
    // and the according markers)

  // URL - Object API ? (Navigate to specific object using an externally shared url)
    // This may also work through the search service, once complete...


/****************************************************/
/*   Initialize App                                 */
/****************************************************/

  // Initialize & Execute Map App Stack
  function initialize(callback) {
    console.time("initialize js chain until ready");
    // Run Map setup stack
    setOptions();
    setAllControls();
    setMap();
      loadProgress(10);
    setInfoWindow();
    setCampusLayer();
      loadProgress(80);
    // Run GatherData Stack using callback functions to serialize the dependent functions
    loadCategoryInfoFile(function(){ 
      populateCategoryInfo(function(){
        loadCategoryFile(function(){
          runPopulators(function(){
            bindCategoryToggle(function(){
              bindPolygonToggle(function(){
                bindMenuObjects(function(){
                  typeToggle(function(){
                    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
                      // do something only the first time the map is loaded
                      // Remove Loading screen
                      loadComplete();
                    });
                  });
                });
              });
            });
          }); 
        });
      });
    });
    if (callback && typeof(callback) === "function") {
      callback();
    }
  }//end initialize()


/****************************************************/
/*   Other Events & Bindings                        */
/****************************************************/

  // Global Resize Event Function Stack
  function resizeStack(){
    // var deviceState = control.currentDevice;
    // if(deviceState === 1){
    //   setHeight(container,getMapHeight());
    //   setHeight(canvas,getMapHeight());
    //   setDevice(detectDevice());
    //  } else {
      var device = detectDevice();
      setDevice(device);
      if(device === 0){
        setHeight(container,'918px');
        setHeight(canvas,'918px');
      }else{
        setHeight(container,'901px');
        setHeight(canvas,'901px');
      }
      // setHeight(container,getMapHeight());
      // setHeight(canvas,getMapHeight());
    // }
  }

  // global map resize event listener
  $win.resize(function(){
    clearTimeout(doResize);
    doResize = setTimeout(function(){
      resizeStack();
    }, 100);
  });

  $win.load(function(){
    // Run initialize function chain
    initialize();
    
    // close menu on off-click 
    $('#map_canvas').click(function(event){
      // stop click event from "propagating/bubbling down to children DOM elements"
      event.stopPropagation();
      var device = control.currentDevice;
      if($(this) !== $('#menu_button') && device !== 1){
        setMenu(0);
      }
    });
    // Toggle Menu on spacebar keypress
    $(document).keydown(function(evt) {
      if (evt.keyCode === 32) {
        toggleMenu();
      }
    });
  });
