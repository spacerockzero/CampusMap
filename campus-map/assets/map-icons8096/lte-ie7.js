/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'map-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-list' : '&#xe000;',
			'icon-mobile' : '&#xe001;',
			'icon-monitor' : '&#xe002;',
			'icon-monitor-2' : '&#xe003;',
			'icon-mobile-2' : '&#xe004;',
			'icon-info' : '&#xe005;',
			'icon-monitor-3' : '&#xe006;',
			'icon-info-2' : '&#xe007;',
			'icon-info-3' : '&#xe008;',
			'icon-info-4' : '&#xe009;',
			'icon-marker' : '&#xe00a;',
			'icon-location' : '&#xe00b;',
			'icon-location-2' : '&#xe00c;',
			'icon-map' : '&#xe00d;',
			'icon-pin' : '&#xe00e;',
			'icon-pin-2' : '&#xe00f;',
			'icon-location-3' : '&#xe010;',
			'icon-compass' : '&#xe011;',
			'icon-location-4' : '&#xe012;',
			'icon-location-5' : '&#xe013;',
			'icon-compass-2' : '&#xe014;',
			'icon-compass-3' : '&#xe015;',
			'icon-compass-4' : '&#xe016;',
			'icon-map-pin-stroke' : '&#xe017;',
			'icon-map-pin-fill' : '&#xe018;',
			'icon-map-pin-alt' : '&#xe019;',
			'icon-list-2' : '&#xe01a;',
			'icon-menu' : '&#xe01b;',
			'icon-list-3' : '&#xe01c;',
			'icon-checkbox' : '&#xe01d;'
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