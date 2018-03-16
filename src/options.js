var SYNC_QUOTA = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

function saveOptions() {
  var select = document.getElementById("storage_type");
  var storage_type = select.children[select.selectedIndex].value;
  localStorage["storage_type"] = storage_type;
  chrome.runtime.sendMessage({event:'rebuildMenus'});

  Materialize.toast(chrome.i18n.getMessage('optionsSavedToastText'), 2000);
}

function restoreOptions() {
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

function swapStorage() {
  chrome.storage.local.get('clipboard', function(localItems) {
    localItems.clipboard = localItems.clipboard || [];

    chrome.storage.sync.get('clipboard', function(syncItems) {
      syncItems.clipboard = syncItems.clipboard || [];

      chrome.storage.sync.set({'clipboard': localItems.clipboard}, function() {
        if (chrome.runtime.lastError) {
          Materialize.toast(chrome.i18n.getMessage('storageSwappingFailedMessage') + chrome.runtime.lastError.message, 4000);
          analytics.trackEvent('Options', 'Swap Failed');
          return;
        }
        chrome.storage.local.set({'clipboard': syncItems.clipboard});
        chrome.runtime.sendMessage({event:'rebuildMenus'});

        Materialize.toast(chrome.i18n.getMessage('optionsSuccess'), 4000);
        calculateAndSetFillBar();

        analytics.trackEvent('Options', 'Swap Success');
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

function calculateAndSetFillBar() {
  chrome.storage.sync.get({'clipboard':[]}, function(syncItems) {
    if (!(syncItems.clipboard instanceof Array))
      return;

    $("#option_storage_usage").empty();
    $("#option_storage_usage").append(chrome.i18n.getMessage("optionStorageUsage"));

    var size = computeObjectSize(syncItems.clipboard);
    var percentage = size/SYNC_QUOTA;
    $('#progress_progress').width(Math.floor(percentage*100)+'%');
    $('#progress_progress').removeClass('black blue light-green orange red').addClass(getStorageColorClass(percentage));
    $('#option_storage_usage').append(Math.floor(percentage*100)+"%");
  });
}

function computeObjectSize(object) {
  return JSON.stringify(object).length;
}

function readBackup() {
  $("#backup_files_input").click();
}

function makeBackup() {
  chrome.storage.local.get({'clipboard':[]}, function(items) {
    if (chrome.runtime.lastError) {
      Materialize.toast("Creating backup failed", 4000);
      return;
    }
    var stringifiedContent = JSON.stringify(items.clipboard);
    var base64Content = btoa(stringifiedContent);
    var backupObject = { content: base64Content, hash: calculateChecksum(base64Content) };
    downloadObjectAsFile(backupObject);
  });
}

function downloadObjectAsFile(s) {
  var a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([JSON.stringify(s)], {type:'application/json'}));
  a.download = 'permanentClipboard.backup';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function calculateChecksum(s) {
  var hashCode = stringHashCode(s);
  return hashCode.toString(16);
}

function stringHashCode(s) {
  var h = 0, l = s.length, i = 0;
  if ( l > 0 )
    while (i < l)
      h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return h;
};

function handleInputSelection(e) {
    restoreFromFile(e.originalEvent.target.files[0]);
}

function restoreFromFile(file) {
  var reader = new FileReader();
  reader.onload = function(f) {
    try {
      var object = JSON.parse(this.result);
      var clipboardContent = object.content;
      var clipboardHashcode = object.hash;
      if (calculateChecksum(clipboardContent) !== clipboardHashcode) {
        Materialize.toast(chrome.i18n.getMessage('optionsBackupCorrupted'), 4000);
        return;
      }
      var restoreObject = JSON.parse(atob(clipboardContent));
      chrome.storage.local.set({'clipboard':restoreObject}, function() {
        if (chrome.runtime.lastError) {
          Materialize.toast("Backup restore failed", 4000);
          return;
        } else {
          Materialize.toast(chrome.i18n.getMessage('optionsBackupRestored'), 4000);
          chrome.runtime.sendMessage({event:'rebuildMenus'});
          return;
        }
      })
    } catch (err) {
      Materialize.toast(chrome.i18n.getMessage('optionsBackupInvalidFile'), 4000);
    }
  };
  reader.readAsText(file);
}

function handleDragoverOnDocument(e) {
  var ee = e.originalEvent;
  ee.stopPropagation();
  ee.preventDefault();
  ee.dataTransfer.dropEffect = 'copy';
  $('#dropzone').removeClass('hidden');
}

function handleDragleave(e) {
  var ee = e.originalEvent;
  ee.stopPropagation();
  ee.preventDefault();
  $('#dropzone').addClass('hidden');
}

function handleDropOnDocument(e) {
  var ee = e.originalEvent;
  ee.stopPropagation();
  ee.preventDefault();
  $('#dropzone').addClass('hidden');
  var file = ee.dataTransfer.files[0];
  restoreFromFile(file);
}

function init_i18n() {
  document.title = chrome.i18n.getMessage("optionsText");
  var msg = chrome.i18n.getMessage;
  $("#title").append(chrome.i18n.getMessage("optionsText"));
  $("#option_sync_type_text").append(chrome.i18n.getMessage("optionStorageTypeText"));
  $("#option_sync_text").html(chrome.i18n.getMessage("optionSyncText"));
  $("#option_swap_storages_text").append(chrome.i18n.getMessage("optionSwapStorageText"));
  $("#option_swap_storage_btn_text").text(chrome.i18n.getMessage("optionSwapText"));
  $("#option_local_text").html(chrome.i18n.getMessage("optionLocalText"));
  $("#storage-card-title").text(chrome.i18n.getMessage("optionStorageCardTitle"));
  $('#option-name__translation-credits').text(chrome.i18n.getMessage('translatorsTitle'));

  $('#drop-overlay-content').text(msg('dropOverlayPromptText'));

  $('#option_storage_backup').text(chrome.i18n.getMessage('optionBackupTitle'));
  $('#option_make_backup').text(msg('optionBackupCreateButton'));
  $('#option_read_backup').text(msg('optionBackupRestoreButton'));

  $("#option_sync_tip").append(chrome.i18n.getMessage("optionSyncTip"));
  $("#option_used_storage_tip").append(chrome.i18n.getMessage("optionsStorageSizeHelp"));
  $("#option_swap_tip").append(chrome.i18n.getMessage("optionsSwapStoragesHelp"));
  $('#option_backup_tip').append(msg("optionBackupTip"));

  $("#save").text(chrome.i18n.getMessage("optionsSave"));
  $('#donate_button').append(chrome.i18n.getMessage('donateWithPaypal'));
}

function submitDonateForm() {
  $('#donate_form').submit();
}

$(document).ready(function() {
  init_i18n();
  restoreOptions();
  $('select').material_select();
  $('.modal').modal();
  calculateAndSetFillBar();
  $("#save").click(saveOptions);
  $('#option_swap_storage_btn_text').click(swapStorage);
  $('#donate_button').click(submitDonateForm);
  $('#option_make_backup').click(makeBackup);
  $('#option_read_backup').click(readBackup);
  $('#backup_files_input').on('change', handleInputSelection);
  $(window).bind({
    dragenter: handleDragoverOnDocument
  });
  $('#dropzone').bind({
    dragenter: handleDragoverOnDocument,
    dragover: handleDragoverOnDocument,
    drop: handleDropOnDocument,
    dragleave: handleDragleave
  });
  analytics.trackEvent('Options', 'Opened');
});
