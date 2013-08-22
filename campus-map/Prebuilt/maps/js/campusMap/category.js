//this is the definition for the category class
//uses arguments parameter so as to not have to define each parameter
function Category() {
	//constructor and parameters
	//although they are not private they should be accessed through 
	this.id = arguments[0],
	this.name = arguments[1],
	this.title = arguments[2],
	this.text = arguments[3],
	this.iconColor = arguments[4],
	this.type = arguments[5],
	this.link = arguments[6],
	this.markerLocations = [],
	this.polygonLocations = [],
	this.state = 0,
	this.elementID = arguments[8],
	this.globals = arguments[7];
}
//creates an element, builds the html and attaches an event listener to the category
Category.prototype.buildCatDOM = function() {
	  var element = this.globals.doc.createElement("a");
	  element.className = 'category_bar';
	  element.id = this.elementID;
	  element.setAttribute('href', '#');
      element.innerHTML += '<img class="cat_icon" src="Prebuilt/maps/imgs/icons/blank-colors/'+ this.iconColor + '.png" />';
      element.innerHTML += '<span class="category_name">' + this.title + '</span>';
      return element;
}
Category.prototype.getCatDOMObj = function() {
	var catObj = this.globals.doc.createElement('div');
	catObj.className = 'category';
	catObj.appendChild(this.buildCatDOM());

	var catContainer = this.globals.doc.createElement('div');
	catContainer.className = "cat_container";
	catContainer.innerHTML = '<div class="cat_info"><p>' + this.text + '</p><a href="' + this.link + '" target="_blank">' + this.title + ' website</a></div>';

	var objContainer = this.globals.doc.createElement('div');
	//append each object element and polygon element
	objContainer = this.appendLocations(objContainer);
	objContainer = this.appendAreas(objContainer);

	//append them all togethor and return the catObj DOM object
	catContainer.appendChild(objContainer);
	catObj.appendChild(catContainer);
	return catObj;
}
//gets the html for a location
Category.prototype.appendLocations = function(container) {
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			container.appendChild(this.markerLocations[i].buildLocationDOM());
		}
	}
	return container;
}
Category.prototype.appendAreas = function(container) {
	if (this.polygonLocations) {
		for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
			container.appendChild(this.polygonLocations[i].buildAreaDOM());
		}
	}
	return container;
}
//bind the event listener to the element
Category.prototype.bindEventListener = function() {
	var cat = this;
	this.globals.doc.getElementById(this.elementID).addEventListener('click', function() {
		cat.toggle();
	});
}
Category.prototype.toggle = function() {
	var sibling = this.globals.doc.getElementById(this.elementID).parentElement.children[1];
	//close any open info windows
	map.infoWindow.close();
	this.toggleMarkersVisibility();
	if (this.state === 0) {
		//open the category
		sibling.style.display = "block";
		sibling.style.height = "100%";
		this.state = 1;
	} else {
		//close the category
		sibling.style.display = "none";
		sibling.style.height = "0";
		this.state = 0;
	}
}
Category.prototype.toggleMarkersVisibility = function() {
	//if the category is closed
	if (this.state === 0) {
		this.showAllMarkers();
	} else {
		this.hideAllMarkers();
	}
}
Category.prototype.showAllMarkers = function() {
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			if (!this.markerLocations[i].hidden) {
				this.markerLocations[i].marker.setVisible(true);
			}
		}
	}
}
Category.prototype.hideAllMarkers = function() {
	if (this.markerLocations) {
		for (var i = 0, len = this.markerLocations.length; i < len; i++) {
			this.markerLocations[i].marker.setVisible(false);
		}
	}
}
Category.prototype.buildMapKey = function() {
	var html = "";
	if (this.polygonLocations) {
	//build category holder
		html = "<div id='poly_key_" + this.id + "' class='map_key_category map_key_" + this.name + "' style='display: none'><div class='key_title'>" + this.name + " Map Key</div><a class='close icon-cancel nolink' href='#'></a>"; 
		for (var i = 0, len = this.polygonLocations.length; i < len; i++) {
			html += this.polygonLocations[i].buildMapKey();
		}
		html += "</div>";
	}
	return html;
}