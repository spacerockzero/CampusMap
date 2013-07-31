/* POST-ANALYTICS SCRIPT */

// load the files asynchronously
loadScript('js/vendor/s_code.js', function() {
  loadScript('js/vendor/omniture_code.js', function() {});
});

//Insert google analytics asynchronously
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-12079604-6']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); 
  ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; 
  s.parentNode.insertBefore(ga, s);
})();

