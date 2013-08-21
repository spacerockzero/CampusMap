//this class definition is for the maps, any interaction with the google maps goes through here
function Map(options) {
  this.map;
  this.mapOptions = {
    campusOverlayVisible : (options['campusOverlay'] == null) ? true : options['campusOverlay'],
    campusFile : 'http://www.byui.edu/Prebuilt/maps/campus_outline.xml',
    zoom: (options['zoom']) ? options['zoom'] : 16,
    centerCoordinates : (options['centerCoordinates'] == null) ? [43.815045,-111.783515] : options['centerCoordinates'],
    mapView: (options['mapView']) ? options['mapView'] : "satellite"
  },
  this.googleMapOptions = {},
  this.infoWindow,
  this.campusLayer;
}
Map.prototype.initiateMap = function(local) {
    this.setGoogleMapOptions();
    this.setGoogleMap(local);
    this.setInfoWindow();
    this.setCampusLayer();
  }

Map.prototype.setGoogleMapOptions = function() {
  if (this.mapOptions.mapView === "map") {
    var view = google.maps.MapTypeId.ROADMAP;
  } else {
    var view = google.maps.MapTypeId.SATELLITE;
  }

    this.googleMapOptions = {
      zoom: this.mapOptions.zoom,
      center: new google.maps.LatLng(this.mapOptions.centerCoordinates[0], this.mapOptions.centerCoordinates[1]),
      mapTypeId: view,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP,
               google.maps.MapTypeId.SATELLITE,
               google.maps.MapTypeId.HYBRID,
               google.maps.MapTypeId.TERRAIN]
      }
    };
  }
Map.prototype.setGoogleMap = function(local) {
    this.map = new google.maps.Map(local.doc.getElementById('map_canvas'), this.googleMapOptions);
  }
Map.prototype.setInfoWindow = function() {
    this.infoWindow = new google.maps.InfoWindow();
  }
Map.prototype.setCampusLayer = function() {
    this.campusLayer = new google.maps.KmlLayer(this.mapOptions.campusFile, {
      suppressInfoWindows: true,
      map: this.map,
      preserveViewport: true,
      zoom: 18
    });
  }
Map.prototype.createMarker = function(lat, lon, name, icon) {
  return new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    visible: false,
    map: this.map,
    title: name,
    icon: icon
  });
}
Map.prototype.createInfoWindow = function(marker, obj) {
  var infoWindow = this.infoWindow;
  var map = this.map;
  // Listener that builds the infopane popups on marker click
    google.maps.event.addListener(marker, 'click', function() {

      var content = '',
             name = obj.name,
              img,
             link = obj.link,
            hours = obj.hours,
            phone = obj.phone,
          address = obj.address,
             info = obj.info;

              if (obj.img) {
                if (obj.img.indexOf(':') === -1) {
                  img = 'Prebuilt/maps/imgs/objects/' + obj.img;
                }
                else {
                  img = obj.img;
                }
              }
             

      // Create the info panes which hold content about each building
      content += '<div class="infopane infopane-desktop">';
      content +=   '<h2>' + name + '</h2>';
      content +=   '<div>';
      if (img){
        content += '<img src="' + img + '" alt="' + name + '"';
        // if(device === 0) {
        //   content += 'width="100" height="75"'; 
        // } else {
          content += 'width="200" height="150"';
        // }
        content += 'style="float:right;margin:0 0 10px 10px"/>';
      }
      content += '<div class="button-div">';
      if (phone){
        content += '<a class="phone-call btn btn-large btn-primary icon-call" href="tel:' + phone + '" ></a>';
      }
      if (link){
        content += '<a href="' + link + '" target="_blank" class="btn btn-large btn-primary">More Info</a>';
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
      content += '</div>';
      content += '<div class="addthis_toolbox addthis_32x32_style addthis_default_style">';
      content += "<p>Share this location.</p>";
      content += '<a class="addthis_button_facebook social_button"></a>';
      content += '<a class="addthis_button_google_plusone_share social_button"></a>';
      content += '<a class="addthis_button_twitter social_button"></a>';
      content += '<a class="addthis_button_compact social_button"></a>';
      content += '</div>';
      // Set the content of the InfoWindow
      infoWindow.setContent(content);
      // Open the InfoWindow
      infoWindow.open(map, marker);
      //render the buttons
      var addthis_share = 
      {
        url : "http://www.byui.edu/maps#" + obj.code,
        title : obj.name
      }
      addthis.toolbox('.addthis_toolbox',{},addthis_share);
    });
}