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
	retrieveData: function(context, data, callback) {
		this.getDefaultStorage().get(data, function(items) {
			if (chrome.runtime.lastError != null) {
				callback(context, false, chrome.runtime.lastError);
			} else {
				callback(context, true, items);
			}
		});
	},
	saveData: function(context, data, callback) {
		this.getDefaultStorage().set(data, function() {
			if (chrome.runtime.lastError != null) {
				callback(context, chrome.runtime.lastError);
			} else {
				callback(context);
			}
		});
	}
}

module.exports = Storage;