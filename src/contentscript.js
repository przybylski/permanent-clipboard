chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    switch (message.event) {
      case 'insertText':
        document.execCommand("insertText", true, message.value);
        break;
      case 'addSelection':
        var selection = document.getSelection().toString();
        if (selection.length > 0)
          chrome.runtime.sendMessage({event: 'addNewEntry', value: selection}, function(response) {
            if (response.error != null)
              alert(chrome.i18n.getMessage("errorFailedToSaveEntry") + response.error.message);
          });
        break;
      default:
        console.warn('Unknown message event sent to content script' + message.event);
    }
    sendResponse({});
  });

document.addEventListener('copy', function(e) {
  var selection = document.getSelection().toString();
  if (selection.length > 0)
    chrome.runtime.sendMessage({event:"saveRecentItem", value: selection}, function(response) {
      if (response.error != null)
        console.error("Failed to save recent item: " + response.error.message);
    });
});
