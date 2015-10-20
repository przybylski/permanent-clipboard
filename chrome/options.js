function save_options() {
  var select = document.getElementById("storage_type");
  var storage_type = select.children[select.selectedIndex].value;
  localStorage["storage_type"] = storage_type;

  var status = document.getElementById("status");
  status.innerHTML = "Options saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

function restore_options() {
  var storage_type = localStorage["storage_type"];
  if (!storage_type)
    return;

  var select = document.getElementById("storage_type");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == storage_type) {
      child.selected = "true";
      break;
    }
  }
}

function swap_storage() {
  chrome.storage.local.get('clipboard', function(localItems) {
    if (!(localItems.clipboard instanceof Array))
      localItems.clipboard = new Array();

    chrome.storage.sync.get('clipboard', function(syncItems) {
      if (!(syncItems.clipboard instanceof Array))
        syncItems.clipboard = new Array();
      
      chrome.storage.sync.set({'clipboard': localItems.clipboard}, function() {
        if (chrome.runtime.lastError) {
          alert("Setting to synchronized storage failed, aborting: " + chrome.runtime.lastError.message);
          return;
        }
        chrome.storage.local.set({'clipboard': syncItems.clipboard});
        chrome.runtime.sendMessage({event:'rebuildMenus'});
      });
    });

  });
}

function init_i18n() {
  document.getElementById("title").innerHTML = chrome.i18n.getMessage("optionsText");
  document.getElementById("option_sync_type_text").innerHTML = chrome.i18n.getMessage("optionStorageTypeText");
  document.getElementById("option_sync_text").innerHTML = chrome.i18n.getMessage("optionSyncText");
  document.getElementById("option_swap_storages_text").innerHTML = chrome.i18n.getMessage("optionSwapStorageText");
  document.getElementById("option_swap_storage_btn_text").innerText = chrome.i18n.getMessage("optionSwapText");
  document.getElementById("option_local_text").innerHTML = chrome.i18n.getMessage("optionLocalText");
  document.getElementById("option_sync_tip").innerText = chrome.i18n.getMessage("optionSyncTip");
  document.getElementById("save").innerText = chrome.i18n.getMessage("optionsSave");
}

function dom_loaded() {
  init_i18n();
  restore_options();
}

document.addEventListener('DOMContentLoaded', dom_loaded);
document.querySelector("#save").addEventListener('click', save_options);
document.querySelector('#option_swap_storage_btn_text').addEventListener('click', swap_storage);
