/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'map-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-desktop' : '&#xe000;',
			'icon-info' : '&#xe001;',
			'icon-feedback' : '&#xe002;',
			'icon-compass' : '&#xe004;',
			'icon-settings' : '&#xe003;',
			'icon-mobile' : '&#xe005;',
			'icon-phone' : '&#xe006;'
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