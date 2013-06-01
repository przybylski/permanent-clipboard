function onMenuClicked(info, tab) {
  if (info.menuItemId == "selmenu") {
    chrome.tabs.sendMessage(tab.id, {event: 'addSelection'});
  } else if (info.menuItemId == "selWname") {
    chrome.tabs.sendMessage(tab.id,{event: 'addSelectionWithName'});
  } else {
    chrome.storage.sync.get("clipboard", function(items) {
      var val = items.clipboard[parseInt(info.menuItemId)].value;
      chrome.tabs.sendMessage(tab.id, {event:'insertText', value: val});
    });
  }
}

function rebuildMenus() {
  chrome.contextMenus.removeAll(function() {
    var title = chrome.i18n.getMessage("insertFromExtension");
    chrome.contextMenus.create({"title": title, "contexts":["editable"], "id": "parent"});
    chrome.storage.sync.get("clipboard", function(items) {
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
    }
});

chrome.contextMenus.onClicked.addListener(onMenuClicked);

chrome.runtime.onInstalled.addListener(function() {
  rebuildMenus();
});


