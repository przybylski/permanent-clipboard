function onCopy(e) {
  var selection = document.getSelection();
  if (selection.toString().length > 0)
    chrome.runtime.sendMessage({event:"saveRecentItem", value: selection.toString()});
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.event == "insertText") {
      document.execCommand("insertText", true, message.value);
    } else if (message.event == "addSelection") {
      var selection = document.getSelection().toString();
      if (selection.length > 0)
        chrome.runtime.sendMessage({event: 'addNewEntry', value: selection});
    }
    sendResponse({});
  });

document.addEventListener('copy', onCopy, true);
