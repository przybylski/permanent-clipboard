var storage = new Storage();

function onMenuClicked(info, tab) {
  if (info.menuItemId == "selmenu") {
    analytics.trackEvent('Menu', 'Selection added');
    chrome.tabs.sendMessage(tab.id, {event: 'addSelection'});
  } else if (info.menuItemId == "selWname") {
    analytics.trackEvent('Menu', 'Selection added');
    chrome.tabs.sendMessage(tab.id,{event: 'addSelectionWithName'});
  } else {
    storage.getData(null, 'clipboard', function(context, data, error) {
      if (error != null) {
        console.error(error);
        return;
      }
      var val = data.clipboard[parseInt(info.menuItemId)].value;
      analytics.trackEvent('Menu', 'Inserting text');
      chrome.tabs.sendMessage(tab.id, {event:'insertText', value: val});
    });
  }
}

function rebuildMenus() {
  chrome.contextMenus.removeAll(function() {
    var title = chrome.i18n.getMessage("insertFromExtension");
    chrome.contextMenus.create({"title": title, "contexts":["editable"], "id": "parent"});
    storage.getData(null, "clipboard", function(context, items, error) {
      if (error != null) {
        console.error(error);
        return;
      }
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

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.event == "rebuildMenus") {
      rebuildMenus();
    } else if (message.event == 'saveRecentItem') {
      storage.setData(null, {'recent': message.value}, function() {});
    } else if (message.event == 'addNewEntry') {
      storage.getData(null, 'clipboard', function(context, data, error) {
        if (error != null) {
          console.error(error);
          sendResponse({});
          return;
        }
        var clipboard = data.clipboard || [];
        clipboard.push({value: message.value, desc: message.value});
        storage.setData(null, {clipboard: clipboard}, function(context, error) {
          if (error != null)
            console.error(error);
          sendResponse({});
        });
      });
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


