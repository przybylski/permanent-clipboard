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
	getData: function(data) {
		return new Promise((resolve, reject) => {
			this.getDefaultStorage().get(data, (result) => {
				if (chrome.runtime.lastError)
					return reject(chrome.runtime.lastError);
				resolve(result);
			});
		});
	},
	setData: function(data) {
		return new Promise((resolve, reject) => {
			this.getDefaultStorage().set(data, () => {
				if (chrome.runtime.lastError)
					return reject(chrome.runtime.lastError);
				resolve();
			});
		});
	},
  getStorageUsagePercentage: function() {
		return new Promise((resolve) => {
			this.getData(null, {'clipboard':[]}, function(context, data, error) {
				if (error != null) {
					resolve(0.0);
				}
				let dataLength = JSON.stringify(data.clipboard).length;
				let usage = dataLength / (localStorage['storage_type'] == 'local' ? LOCAL_QUOTA : SYNC_QUOTA);
				if (callback != undefined) {
					resolve(usage * 100.0);
				}
			});
		});
  }
}

if (typeof module !== 'undefined')
  module.exports = Storage;
