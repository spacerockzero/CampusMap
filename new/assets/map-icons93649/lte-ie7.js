/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'map-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-monitor' : '&#x64;&#x65;&#x73;&#x6b;&#x74;&#x6f;&#x70;',
			'icon-mobile' : '&#x6d;&#x6f;&#x62;&#x69;&#x6c;&#x65;',
			'icon-info' : '&#x69;&#x6e;&#x66;&#x6f;',
			'icon-comment' : '&#x66;&#x65;&#x65;&#x64;&#x62;&#x61;&#x63;&#x6b;',
			'icon-untitled' : '&#x63;&#x6f;&#x6d;&#x70;&#x61;&#x73;&#x73;',
			'icon-untitled-2' : '&#x73;&#x65;&#x74;&#x74;&#x69;&#x6e;&#x67;&#x73;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c) {
			addIcon(el, icons[c[0]]);
		}
	}
};