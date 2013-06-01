function onCopy(e) {
  var selection = document.getSelection();
  if (selection.toString().length > 0)
    chrome.storage.sync.set({'recent': selection.toString()});
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.event == "insertText") {
      document.execCommand("insertHTML", true, message.value);
    } else if (message.event == "addSelection") {
      var selection = document.getSelection().toString();
      chrome.storage.sync.get("clipboard", function(items) {
        if (!(items.clipboard instanceof Array)) {
          items.clipboard = new Array()
        }
        items.clipboard.push({value: selection, desc: selection});
        chrome.storage.sync.set({clipboard: items.clipboard}, function() {
          chrome.runtime.sendMessage({event: "rebuildMenus"});
        });
      });
    }
    sendResponse({});
  });

document.addEventListener('copy', onCopy, true);
