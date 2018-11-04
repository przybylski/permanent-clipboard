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
	getData: function(context, data, callback) {
		this.getDefaultStorage().get(data, function(items) {
            if (callback == undefined)
              return;

			if (chrome.runtime.lastError != null) {
				callback(context, items, chrome.runtime.lastError);
			} else {
				callback(context, items, null);
			}
		});
	},
	setData: function(context, data, callback) {
		this.getDefaultStorage().set(data, function() {
            if (callback == undefined)
              return;

			if (chrome.runtime.lastError != null) {
				callback(context, chrome.runtime.lastError);
			} else {
				callback(context);
			}
		});
	}
}

if (typeof module !== 'undefined')
  module.exports = Storage;
