function Storage() { }

Storage.prototype = {
	constructor: Storage,
	getSynchronizedStorage: function() {
		return chrome.storage.sync;
	},
	getLocalStorage: function() {
		return chrome.storage.local;
	},
	getDefaultStorage: function() {
		if (localStorage['storage_type'] == 'local')
			return chrome.storage.local;
		return chrome.storage.sync;
	},
	retrieveData: function(data, callback, userObject) {
		getDefaultStorage().get(data, function(items) {
			if (chrome.runtime.lastError) {
				callback(false, chrome.runtime.lastError, userObject);
			} else {
				callback(true, items, userObject);
			}
		});
	},
	saveData: function(data, callback, userObject) {
		getDefaultStorage().get(data, function(items) {
			if (chrome.runtime.lastError) {
				callback(false, chrome.runtime.lastError, userObject);
			} else {
				callback(true, items, userObject);
			}
		});
	}
}
