addScript("http://s7.addthis.com/js/300/addthis_widget.js#pubid=xa-51f6872a25a1fb8c", { win: window, doc: document });
var campusMap = new CampusMap(options);
var map = new Map(options);
//this function will be used to add a script to the page
function addScript(src, local, callback) {
	var script = local.doc.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	local.doc.getElementsByTagName("body")[0].appendChild(script);
}