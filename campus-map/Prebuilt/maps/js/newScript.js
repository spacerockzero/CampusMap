function category() {
	//constructor and parameters
	this.id = arguments[0];
	this.name = arguments[1];
	this.title = arguments[2];
	this.text = arguments[3];
	this.iconColor = arguments[4];
	this.type = arguments[5];
	this.link = arguments[6];
	this.markerLocations;
	this.polygonLocations;

	this.getId = function() {
		return this.id;
	}
	this.getName = function () {
		return this.name;
	}
	this.getTitle = function() {
		return this.title; 
	}
	this.getText = function() {
		return this.text;
	}
	this.getIconColor = function() {
		return this.iconColor;
	}
	this.getType = function() {
		return this.type;
	}
	this.getLink = function() {
		return this.link;
	}
	this.setID = function() {
		this.id = arguments[0];
	}
	this.setName = function() {
		this.name = arguments[0];
	}
	this.setTitle = function() {
		this.title = arguments[0];
	}
	this.setText = function() {
		this.text = arguments[0];
	}
	this.setIconColor = function() {
		this.iconColor = arguments[0];
	}
	this.setType = function () {
		this.type = arguments[0];
	}
	this.setLink = function() {
		this.link = arguments[0];
	}
}

