function Analytics() {}

Analytics.prototype = {
	userCode: function() { return 'UA-64085295-1'},
	initialize: function() {
		_gaq.push(['_setAccount', this.userCode()]);
	},
	appendToDocument: function() {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	},
	trackEvent: function(category, subcategory) {
		_gaq.push(['_trackEvent', category, subcategory]);
	}
}

var _gaq = _gaq || [];

var analytics = new Analytics();
analytics.initialize();
analytics.appendToDocument();
