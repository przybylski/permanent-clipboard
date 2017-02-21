var SYNC_QUOTA = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

function save_options() {
  var select = document.getElementById("storage_type");
  var storage_type = select.children[select.selectedIndex].value;
  localStorage["storage_type"] = storage_type;
  chrome.runtime.sendMessage({event:'rebuildMenus'});
  
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

function get_storage_fill_color(percent) {
  if (typeof(percent) != typeof(0.1))
    return "#000000";
  if (percent < 0 || percent > 1)
    return "#0000FF";
  if (percent < 0.8)
    return "#60FF83";
  if (percent < 0.95)
    return "#FFA41B";
  return "#FF3B36";
}

function calculate_and_set_fill_bar() {
  chrome.storage.sync.get('clipboard', function(syncItems) {
    if (!(syncItems.clipboard instanceof Array))
      return;
    var size = computeObjectSize(syncItems.clipboard);
    var percentage = size/SYNC_QUOTA;
    set_synchronized_fill_bar(percentage);
  });
}

function computeObjectSize(object) {
  return JSON.stringify(object).length;
}

function set_synchronized_fill_bar(percent) {
  var fillBar = document.getElementById("option_storage_fill_synchronized");
  var fillBarBackground = document.createElement("div");
  fillBarBackground.className = "fill_bar_background";
  fillBarBackground.style.backgroundColor = get_storage_fill_color(percent);
  fillBarBackground.style.width = percent * fillBar.offsetWidth - 2;
  fillBarBackground.style.height = fillBar.offsetHeight - 2;

  var fillBarPercentage = document.getElementById("options_storage_percentage_fill");
  fillBarPercentage.innerText = ": " + (Math.floor(percent*100)) + "%";

  fillBar.insertBefore(fillBarBackground, fillBar.firstChild);
}

function init_i18n() {
  document.getElementById("title").innerHTML = chrome.i18n.getMessage("optionsText");
  document.getElementById("option_sync_type_text").innerHTML = chrome.i18n.getMessage("optionStorageTypeText");
  document.getElementById("option_sync_text").innerHTML = chrome.i18n.getMessage("optionSyncText");
  document.getElementById("option_swap_storages_text").innerHTML = chrome.i18n.getMessage("optionSwapStorageText");
  document.getElementById("option_swap_storage_btn_text").innerText = chrome.i18n.getMessage("optionSwapText");
  document.getElementById("option_local_text").innerHTML = chrome.i18n.getMessage("optionLocalText");
  document.getElementById("option_sync_tip").innerText = chrome.i18n.getMessage("optionSyncTip");
  document.getElementById("option_storage_usage").innerText = chrome.i18n.getMessage("optionStorageUsage");
  document.getElementById("option_storage_name_synchronized").innerText = chrome.i18n.getMessage("optionSyncText");

  document.getElementById("save").innerText = chrome.i18n.getMessage("optionsSave");
}

function dom_loaded() {
  init_i18n();
  restore_options();
  calculate_and_set_fill_bar();
}

document.addEventListener('DOMContentLoaded', dom_loaded);
document.querySelector("#save").addEventListener('click', save_options);
document.querySelector('#option_swap_storage_btn_text').addEventListener('click', swap_storage);
