function Storage() { }

let SYNC_QUOTA = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
let LOCAL_QUOTA = chrome.storage.local.QUOTA_BYTES;

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
      if (callback !== undefined) {
        callback(context, items, chrome.runtime.lastError);
      }
      chrome.runtime.lastError = null;
		});
	},
	setData: function(context, data, callback) {
		this.getDefaultStorage().set(data, function() {
      if (callback !== undefined) {
        callback(context, chrome.runtime.lastError);
      }
			chrome.runtime.lastError = null;
		});
	},
  getStorageUsagePercentage: function(callback) {
    this.getData(null, {'clipboard':[]}, function(context, data, error) {
      if (error != null) {
        callback(0.0);
      }
      let dataLength = JSON.stringify(data.clipboard).length;
      let usage = dataLength / (localStorage['storage_type'] == 'local' ? LOCAL_QUOTA : SYNC_QUOTA);
      if (callback != undefined) {
        callback(usage * 100.0);
      }
    });
  }
}

if (typeof module !== 'undefined')
  module.exports = Storage;
