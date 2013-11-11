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

function init_i18n() {
  document.getElementById("title").innerHTML = chrome.i18n.getMessage("optionsText");
  document.getElementById("option_sync_type_text").innerHTML = chrome.i18n.getMessage("optionStorageTypeText");
  document.getElementById("option_sync_text").innerHTML = chrome.i18n.getMessage("optionSyncText");
  document.getElementById("option_local_text").innerHTML = chrome.i18n.getMessage("optionLocalText");
  document.getElementById("option_sync_tip").innerHTML = chrome.i18n.getMessage("optionSyncTip");
}

function dom_loaded() {
  init_i18n();
  restore_options();
}

document.addEventListener('DOMContentLoaded', dom_loaded);
document.querySelector("#save").addEventListener('click', save_options);
