var storage = new Storage();

let storagePercentageThreshold = 70;

function IndexPath(string) {
  var separated = string.split('_');
  this._elements = [];
  for (var e in separated) {
    this._elements.push(parseInt(separated[e]));
  }
}

IndexPath.prototype = {
  constructor: IndexPath,
  length: function() { return this._elements.length; },
  get: function(part) { return this._elements[part]; },
  getLast: function() { return this._elements[this.length()-1]; }
}

function traverseWithIndexPath(indexPath, data) {
  var e = data;
  for (var i = 0; i < indexPath.length()-1; ++i)
    e = e[indexPath.get(i)].e;
  return e[indexPath.getLast()].value;
}

function onMenuClicked(info, tab) {
	if (info.menuItemId == "selmenu") {
		analytics.trackEvent('Menu', 'Selection added');
		chrome.tabs.sendMessage(tab.id, {event: ACTION__ADD_SELECTION});
  } else if (info.menuItemId == "runningOutOfSpace") {
    chrome.tabs.create({ url: CONTACT_PAGE_URL });
	} else {
		storage.getData('clipboard').then((data) => {
      var indexPath = new IndexPath(info.menuItemId);
      var val = traverseWithIndexPath(indexPath, data.clipboard);

			analytics.trackEvent('Menu', 'Inserting text');
			chrome.tabs.sendMessage(tab.id, {event:ACTION__INSERT_TEXT, value: val});
		}, (error) => console.error(error));
	}
}

function buildMenuLevel(menu, parentId) {
  var cnt = 0;
  for (var e in menu) {
    var elem = menu[e];
    if (elem.e != null) {
      var newId = parentId + cnt + '_';
      chrome.contextMenus.create({"title": elem.desc, "parentId": parentId, "contexts": ["editable"], "id": newId});
      buildMenuLevel(elem.e, newId);
    } else {
      var newId = parentId + cnt;
      chrome.contextMenus.create({"title": elem.desc, "parentId": parentId, "contexts": ["editable"], "id": newId});
    }
    cnt++;
  }
}

function rebuildMenus() {
	chrome.contextMenus.removeAll(function() {
    storage.getData(null, {'clipboard':[]}, function(context, items, error) {
      if (error != null) {
        console.error("Failed to get data for menu filling: " + error.message);
        return;
      }
      if (items.clipboard.length == 0) return;
      var title = chrome.i18n.getMessage("insertFromExtension");
      chrome.contextMenus.create({"title":title, "contexts":["editable"], "id": ""});
      buildMenuLevel(items.clipboard, "");
    });
    
		var title = chrome.i18n.getMessage("addToExtensionDB");
		chrome.contextMenus.create({"title": title, "contexts":["selection"], "id": "selmenu"});

    storage.getStorageUsagePercentage().then((usage) => {
        if (usage > storagePercentageThreshold) {
          chrome.contextMenus.create({
            "id": "sep",
            "type": "separator",
            "parentId": ""
          });
          chrome.contextMenus.create({
            "title": chrome.i18n.getMessage("menuRunningOutOfSpace"),
            "contexts": ["selection", "editable"],
            "id": "runningOutOfSpace",
            "parentId": ""
          });
        }
      });
	});
}

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.event == "rebuildMenus") {
      rebuildMenus();
      sendResponse({});
      return;
		} else if (message.event == 'saveRecentItem') {
			storage.setData({'recent': message.value}).then(() => {
        sendResponse({});
      }, (error) => sendResponse({'error': error}));
		} else if (message.event == 'addNewEntry') {
			storage.getData('clipboard').then((data) => {
				var clipboard = data.clipboard || [];
				clipboard.push({value: message.value, desc: message.value});
				storage.setData({'clipboard': clipboard}).then(() => {
					sendResponse({});
          rebuildMenus();
				}, (error) => {
          sendResponse({'error': error});
          rebuildMenus();
        });
			}, (error) => sendResponse({'error': error}));
		}
  return true;
});

function installContentScriptInTabs() {
	chrome.tabs.query({}, function(tabs) {
	for(var i in tabs) {
		if (tabs[i].url.startsWith("http://") || tabs[i].url.startsWith("https://")) {
			chrome.tabs.executeScript(tabs[i].id, {file: "contentscript.js"});
		}
	}
	});
}

chrome.contextMenus.onClicked.addListener(onMenuClicked);

chrome.runtime.onInstalled.addListener(function() {
	rebuildMenus();
	installContentScriptInTabs();
});