
function getStorage() {
  if (localStorage["storage_type"] == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

function displayClipboardElements() {
  getStorage().get('clipboard', function(items) {
    
  });
}

document.addEventListener('DOMContentLoaded', function() {
  displayClipboardElements();
});
