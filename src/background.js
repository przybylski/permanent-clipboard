function getStorage() {
  if (localStorage["storage_type"] == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

function onMenuClicked(info, tab) {
  if (info.menuItemId == "selmenu") {
    analytics.trackEvent('Menu', 'Selection added');
    chrome.tabs.sendMessage(tab.id, {event: 'addSelection'});
  } else if (info.menuItemId == "selWname") {
    analytics.trackEvent('Menu', 'Selection added');
    chrome.tabs.sendMessage(tab.id,{event: 'addSelectionWithName'});
  } else {
    getStorage().get("clipboard", function(items) {
      var val = items.clipboard[parseInt(info.menuItemId)].value;
      analytics.trackEvent('Menu', 'Inserting text');
      chrome.tabs.sendMessage(tab.id, {event:'insertText', value: val});
    });
  }
}

function rebuildMenus() {
  chrome.contextMenus.removeAll(function() {
    var title = chrome.i18n.getMessage("insertFromExtension");
    chrome.contextMenus.create({"title": title, "contexts":["editable"], "id": "parent"});
    getStorage().get("clipboard", function(items) {
      for (i in items.clipboard) {
        var desc = items.clipboard[i].desc;
        if (!desc)
          desc = items.clipboard[i].value;
        chrome.contextMenus.create(
            {"title": desc, "parentId": "parent", "id":i, "contexts":["editable"]});
      }
    });

    title = chrome.i18n.getMessage("addToExtensionDB");
    chrome.contextMenus.create({"title": title, "contexts":["selection"], "id": "selmenu"});
  });
}

function sendStorageName(sendResponse) {
  sendResponse({event: "storageName", name: localStorage["storage_type"]});
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.event == "rebuildMenus") {
      rebuildMenus();
    } else if (message.event == "getStorageName") {
      sendStorageName(sendResponse);
    }
});

chrome.contextMenus.onClicked.addListener(onMenuClicked);

chrome.runtime.onInstalled.addListener(function() {
  rebuildMenus();
  chrome.tabs.query({}, function(tabs) {
  for(var i in tabs) {
    if (tabs[i].url.startsWith("http://") || tabs[i].url.startsWith("https://")) {
      chrome.tabs.executeScript(tabs[i].id, {file: "contentscript.js"});
    }
  }
  });
});


