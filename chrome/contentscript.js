function getStorage(storageName) {
  if (storageName == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

var postponedActions = new Array();

function onCopy(e) {
  var selection = document.getSelection();
  if (selection.toString().length > 0) {
    chrome.runtime.sendMessage({event:"getStorageName"}, function(response) {
      getStorage(response.name).set({'recent': selection.toString()});
    });
  }
}

function handleAddSelection(selection, storageName) {
  var selection = document.getSelection().toString();
      getStorage(storageName).get("clipboard", function(items) {
        if (!(items.clipboard instanceof Array)) {
          items.clipboard = new Array()
        }
        items.clipboard.push({value: selection, desc: selection});
        getStorage(storageName).set({clipboard: items.clipboard}, function() {
          chrome.runtime.sendMessage({event: "rebuildMenus"});
        });
      });
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.event == "insertText") {
      document.execCommand("insertHTML", true, message.value);
    } else if (message.event == "addSelection") {
      var selection = document.getSelection().toString();
      chrome.runtime.sendMessage({event:"getStorageName"}, function(response) {

        getStorage(response.name).get("clipboard", function(items) {
          if (!(items.clipboard instanceof Array)) {
            items.clipboard = new Array()
          }
          items.clipboard.push({value: selection, desc: selection});
          getStorage(response.name).set({clipboard: items.clipboard}, function() {
            chrome.runtime.sendMessage({event: "rebuildMenus"});
          });
        });

      });
    }
    sendResponse({});
  });

document.addEventListener('copy', onCopy, true);
