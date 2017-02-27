var SYNC_QUOTA = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

function save_options() {
  var select = document.getElementById("storage_type");
  var storage_type = select.children[select.selectedIndex].value;
  localStorage["storage_type"] = storage_type;
  chrome.runtime.sendMessage({event:'rebuildMenus'});

  Materialize.toast(chrome.i18n.getMessage('optionsSavedToastText'), 2000);
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
    localItems.clipboard = localItems.clipboard || [];

    chrome.storage.sync.get('clipboard', function(syncItems) {
      syncItems.clipboard = syncItems.clipboard || []; 

      chrome.storage.sync.set({'clipboard': localItems.clipboard}, function() {
        if (chrome.runtime.lastError) {
          Materialize.toast(chrome.i18n.getMessage('storageSwappingFailedMessage') + chrome.runtime.lastError.message, 4000);
          return;
        }
        chrome.storage.local.set({'clipboard': syncItems.clipboard});
        chrome.runtime.sendMessage({event:'rebuildMenus'});
        
        Materialize.toast("Success", 4000);
        calculate_and_set_fill_bar();

      });
    });

  });
}

function getStorageColorClass(percent) {
  if (typeof(percent) != typeof(0.1))
    return "black";
  if (percent < 0 || percent > 1)
    return "blue";
  if (percent < 0.8)
    return "light-green";
  if (percent < 0.95)
    return "orange";
  return "red";
}

function calculate_and_set_fill_bar() {
  chrome.storage.sync.get('clipboard', function(syncItems) {
    if (!(syncItems.clipboard instanceof Array))
      return;

    $("#option_storage_usage").empty();
    $("#option_storage_usage").append(chrome.i18n.getMessage("optionStorageUsage"));

    var size = computeObjectSize(syncItems.clipboard);
    var percentage = size/SYNC_QUOTA;
    $('#progress_progress').width(Math.floor(percentage*100)+'%');
    $('#progress_progress').addClass(getStorageColorClass(percentage));
    $('#option_storage_usage').append(Math.floor(percentage*100)+"%");
  });
}

function computeObjectSize(object) {
  return JSON.stringify(object).length;
}

function init_i18n() {
  document.title = chrome.i18n.getMessage("optionsText");
  $("#title").append(chrome.i18n.getMessage("optionsText"));
  $("#option_sync_type_text").append(chrome.i18n.getMessage("optionStorageTypeText"));
  $("#option_sync_text").html(chrome.i18n.getMessage("optionSyncText"));
  $("#option_swap_storages_text").append(chrome.i18n.getMessage("optionSwapStorageText"));
  $("#option_swap_storage_btn_text").text(chrome.i18n.getMessage("optionSwapText"));
  $("#option_local_text").html(chrome.i18n.getMessage("optionLocalText"));
  
  $("#option_sync_tip").append(chrome.i18n.getMessage("optionSyncTip"));
  $("#option_used_storage_tip").append(chrome.i18n.getMessage("optionsStorageSizeHelp"));
  $("#option_swap_tip").append(chrome.i18n.getMessage("optionsSwapStoragesHelp"));

  $("#save").text(chrome.i18n.getMessage("optionsSave"));
}

$(document).ready(function() {
  init_i18n();
  restore_options();
  $('select').material_select();
  $('.modal').modal();
  calculate_and_set_fill_bar();
  $("#save").click(save_options);
  $('#option_swap_storage_btn_text').click(swap_storage);
});


