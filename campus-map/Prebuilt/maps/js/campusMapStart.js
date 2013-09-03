console.time("initialize js chain until ready");

//adds the script for the addthis social sharing api
addScript("http://s7.addthis.com/js/300/addthis_widget.js#pubid=xa-51f6872a25a1fb8c", { win: window, doc: document });
//both of the constructors takes a global options object literal containing all of the options the user
//wishes to set for the campus map
//it is optional for the Map constructor but not for the CampusMap object as you need to specify the id of the element
//it will be embedded in
var campusMap = new CampusMap(options);
var map = new Map(options);

/***************************************************
* this function is used to add a script to the page
* takes two parameters
* src - the relative or absolute url of the script to be embeded
* local - an object literal containing the document element
*			{ doc : document}
****************************************************/
function addScript(src, local) {
	var script = local.doc.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	local.doc.getElementsByTagName("body")[0].appendChild(script);
}