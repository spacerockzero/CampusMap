function KMLParser() {
	var doc = arguments[0];

	var categoryName;
	var categoryText;
	var categoryColor;
	var link;
	var image;

	var makers = [];
	var polygons = [];
}


//top level function to parse the KML
KMLParser.prototype.parseKML = function() {
	this.categoryName = doc.getElementsByTagName('name')[0].children[0].data;
	var result = this.extractLinkText(doc.getElementsByTagName('description')[0].children[0].data);
	this.link = result[0];
	this.categoryText = result[1];
	result = this.extractSrcFromImage(this.categoryText);
	this.image = result[0];
	this.categoryText = result[1];

	
}


//this function will extract the url from the link in any string
KMLParser.prototype.extractLinkText = function(string) {
	var anchor = "";
	var stringAnchorStart = string.indexOf("<a");
	if (pos !== -1) {
		var stringAnchorEnd = string.indexOf("</a>") + 4;
		anchor = string.substr(stringAnchorStart, stringAnchorEnd);
		endAnchorPos = anchor.indexOf('>');
		anchor = anchor.substr(endAnchorPos, anchor.length - 4 - endAnchorPos);
		string = string.substr(0, stringAnchorStart) + string.substr(stringAnchorEnd);
	}

	return [anchor, string];
}


//this function will extract the src from the image in any string
KMLParser.prototype.extractSrcFromImage = function(string) {
	var image = "";
	var stringImageStart = string.indexOf("<img");
	if (pos !== -1) {
		var stringImageEnd = string.indexOf("/>") + 2;
		image = string.substr(stringImageStart, stringImageEnd);
		endImagePos = image.indexOf('>');
		image = anchor.substr(endImagePos, image.length - 4 - endImagePos);
		string = string.substr(0, stringImageStart) + string.substr(stringImageEnd);
	}

	return [image, string];
}