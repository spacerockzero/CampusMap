/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-cancel' : '&#xe000;',
			'icon-checkmark' : '&#xe001;',
			'icon-desktop' : '&#xe005;',
			'icon-info' : '&#xe006;',
			'icon-feedback' : '&#xe007;',
			'icon-compass' : '&#xe008;',
			'icon-settings' : '&#xe009;',
			'icon-mobile' : '&#xe00a;',
			'icon-call' : '&#xe00b;'
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
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};