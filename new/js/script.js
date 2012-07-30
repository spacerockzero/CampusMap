/*  BYU-I Campus Map                */
/*  powered by Google Maps API v3   */
/*  Revised:  07.30.2012            */



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
      map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
    }//end initialize()

    // Create infoWindow Object
    // Load Campus Boundary Layer
    // run GatherData Stack
    // run LoadPopulateShowCategories Stack
    // Hide Loading Animation

  // GatherData
  // LoadPopulateShowCategories
  // ShowHideCategory
  // ToggleMobileDesktop
  // Search
  // Resize map_canvas to fit screen
  // (function(){
  //   window.getOffset
  // })