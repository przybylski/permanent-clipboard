function Analytics() {}

Analytics.prototype = {
	userCode: function() { return 'UA-64085295-1'; },
	initialize: function() {
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://ssl.google-analytics.com/analytics.js','ga');

		ga('create', this.userCode(), 'auto');
		ga('set', 'checkProtocolTask', null);
	},
	trackEvent: function(category, action) {
		ga('send', 'event', category, action);
	}
}

var analytics = new Analytics();
analytics.initialize();
