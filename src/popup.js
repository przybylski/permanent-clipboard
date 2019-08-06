function arrayRemove(a, idx) {
  var rest = a.slice(idx + 1 || a.length);
  a.length = idx < 0 ? a.length + idx : idx;
  return a.push.apply(a, rest);
}

var defaultAnimationDuration = 100;
var storage = new Storage();
var traverseArray = [];

function rebuildTable() {
  var tail = traverseArray[traverseArray.length-1];
  $('#current_div').empty().append(createTable(tail));
  $('#hint').empty().append(chrome.i18n.getMessage(tail.length == 0 ? "popupHintNoElements" : "popupHint"));
  $('.tooltipped').tooltip({
      options: {
        enterDelay: defaultAnimationDuration
      }
  });
}

function rebuildMenusAndReload() {
  chrome.runtime.sendMessage({event:'rebuildMenus'}, rebuildTable);
}

function addToPermClipboardFromRecent() {
  addToPermClipboard(
      document.getElementById('recent_name').value,
      document.getElementById('recent_text').innerText,
      function(error) {
        if (error != undefined) {
          analytics.trackEvent('Popup', 'Recent save fail', error.message);
        } else {
          analytics.trackEvent('Popup', 'Recent saved success');
          $('#add_elements_collapsible').collapsible({onClose: function() {
            $('#recent_add_element').fadeOut('fast').delay().addClass('hide');
            $('#add_elements_collapsible').collapsible({onClose: null});
          }})
          $('#add_elements_collapsible').collapsible('close', 1);  
        }
      });
  return false;
}

function addToPermClipboardFromManually() {
  // text can't be empty, name can
  // it will be replaced by text eventually
  var text = document.getElementById('new_content').value;
  if (text !== "") {
    addToPermClipboard(
        document.getElementById('new_name').value,
        text,
        function(error) {
          if (error != undefined) {
            analytics.trackEvent('Popup', 'Manually add fail', error.message);
          } else {
            $('#new_name').val('');
            $('#new_content').val('');
            $('#new_content').trigger('autoresize');
            $('#add_elements_collapsible').collapsible('close', 0);
            localStorage.removeItem('unsaved_name');
            localStorage.removeItem('unsaved_content');

            analytics.trackEvent('Popup', 'Manually add success');
          }
        });
  }
  return false;
}

function addToPermClipboard(name, text, callback) {
  traverseArray[traverseArray.length-1].push({ desc: name, value: text });
  storage.setData(null, {'clipboard':traverseArray[0], 'recent':0}, function(context, lastError) {
    if (lastError == null) {
      rebuildMenusAndReload()
    } else {
      traverseArray[traverseArray.length-1].pop();
      var errorMessage = chrome.i18n.getMessage("unknownError");
      if (lastError.message.match(/^QUOTA_BYTES_PER_ITEM/)) {
        errorMessage = chrome.i18n.getMessage("noMoreSpace");
      }
      Materialize.toast(chrome.i18n.getMessage("errorFailedToSaveEntry") + errorMessage, 3000);
    }
    if (callback != undefined) {
      callback(lastError);
    }
  });
}

function discardNewEntry() {
  localStorage.removeItem('unsaved_name');
  localStorage.removeItem('unsaved_content');
  $("#new_name").val("");
  $("#new_content").val("");
  $("#add_elements_collapsible").collapsible('close', 0);
}

function discardRecentEntry() {
  $("#recent_name").val("");
  $("#recent_text").text("");
  $("#add_elements_collapsible").collapsible('close', 1);
  $("#recent_add_element").fadeOut();
  storage.setData(null, {'recent':0});
}

function removeElement(s) {
  var elem = $(this.parentNode.parentNode);
  var e = parseInt(elem.attr('data-entryId'));
  elem.parent().slideUp('fast', function() {;
    arrayRemove(traverseArray[traverseArray.length-1], e);
    storage.setData(null, {'clipboard':traverseArray[0]}, rebuildMenusAndReload);
    rebuildTable();
    analytics.trackEvent('Popup', 'Remove element');
  });
}

function createEntryEditForm(name, content, id) {

  var e = $(
    '<div class="container">' +
      '<div class="row">' +
        '<div class="input-field">' +
          '<input type="text" id="editName_' + id + '" value="'+name+'">' +
          //'<label for="editName_' + id + '">' + chrome.i18n.getMessage("descriptionPlaceholder") + '</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field">' +
          '<textarea class="materialize-textarea" id="editContent_' + id + '">' + content + '</textarea>' +
          //'<label for="editContent_' + id + '">' + chrome.i18n.getMessage("contentPlaceholder") + '</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="btn-flat waves-effect waves-light right cancel-button">' + chrome.i18n.getMessage('commonCancel') + '</div>' +
        '<div class="btn-flat waves-effect waves-light right save-button">' + chrome.i18n.getMessage('optionsSave') + '</div>' +
      '</div>' +
    '</div>');

  return e;
}

function createDirectoryEditForm(name, id) {
  var e = $(
    '<div class="container">' +
      '<div class="row">' +
        '<div class="input-field">' +
          '<input type="text" id="editName_' + id + '" value="'+name+'">' +
          //'<label for="editName_' + id + '">' + chrome.i18n.getMessage("descriptionPlaceholder") + '</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="btn-flat waves-effect waves-light right cancel-button">' + chrome.i18n.getMessage('commonCancel') + '</div>' +
        '<div class="btn-flat waves-effect waves-light right save-button">' + chrome.i18n.getMessage('optionsSave') + '</div>' +
      '</div>' +
    '</div>'
    );
  return e;
}

function init_i18n() {
  const T = chrome.i18n.getMessage;
  $("#recent_btn").text(T("addBtnText"));
  $("#recent_name_label").text(T("descriptionPlaceholder"));
  $("#recent_title").text(T("popupNewElement"));

  $("#new_btn").text(T("addBtnText"));
  $("#discard_new_btn").text(T("popup_buttonDiscard"));
  $("#discard_recent_btn").text(T("popup_buttonDiscard"));
  $("#new_name_label").text(T("descriptionPlaceholder"));
  $("#new_content_label").text(T("contentPlaceholder"));

  $("#new_item_content_trigger").text(T("showAddFormText"));
  const isLocalStorage = localStorage.storage_type == "local";
  $("#storage_type_icon").attr("data-tooltip", T(isLocalStorage ? "localStorageUsed" : "syncedStorageUsed"));
  $("#storage_type_icon").text(isLocalStorage ? "fiber_manual_record" : "sync");

  $("#options_text").attr("data-tooltip", T("optionsText"));

  $("#delete_label").text(T("deleteEntryIconTitle"));
  $("#cancel_label").text(T("commonCancel"));

  $('#back_button').attr('data-tooltip', T('popupBack'));
  $('#new_dir_button').attr('data-tooltip', T('newDirectoryName'));
}

function copyToClipboard(s) {
  $(s.srcElement)
      .animate({opacity:0.5}, defaultAnimationDuration)
      .delay()
      .animate({opacity:1}, defaultAnimationDuration);

  navigator.clipboard.writeText(s.srcElement.dataset.contents)
    .then(() => {
      Materialize.toast(chrome.i18n.getMessage("popup_copiedToClipboard"), 2000);
      analytics.trackEvent('Popup', 'Element clicked');
    },
    e => {
      Materialize.toast("Failed to store in clipboard");
    });
}

function createEntry(item, id) {

  var createSrcSet = function(base, type) {
    return base + "_1x." + type + ", " + base + "_2x." + type + " 2x";
  }

  var top1 = document.createElement('div');
  var top = document.createElement('div');
  top.classList.add('row', 'rowrow', 'valign-wrapper');
  top1.appendChild(top);
  top1.setAttribute('data-entryId', id);
  top.setAttribute('data-entryId', id);

  var left = document.createElement('div');
  left.classList.add('col', 's1');

  if (item.e != null) {
    var i = document.createElement('img');
    i.srcset = createSrcSet('img/icons/ic_folder', 'png');
    left.appendChild(i);
  }

  top.appendChild(left);

  var main = document.createElement('div');
  main.classList.add('col', 's10');

  {
    var a = document.createElement('a');
    a.appendChild(document.createTextNode(item.desc));
    if (item.value != null) {
      a.onclick = copyToClipboard;
      a.dataset.contents = item.value;
      a.classList.add("tooltipped");
      a.dataset.position = "top";
      let elipssisTextLength = 35;
      a.dataset.tooltip = item.value.length > elipssisTextLength+3
          ? item.value.substr(0, elipssisTextLength) + "..."
          : item.value;
    } else {
      a.onclick = function(e) {
        traverseArray.push(item.e);
        rebuildTable();
        $('#back_button').removeClass('scale-out');
      };
    }
    main.appendChild(a);
  }

  top.appendChild(main);

  var edit = document.createElement('div');

  edit.classList.add('col', 'c1', 'btn-action-wrapper');

  {
    var d = document.createElement('div');
    d.classList.add('btn-action', 'btn-flat');
    var i = document.createElement('i');
    i.classList.add('material-icons', 'edit_icon');
    i.appendChild(document.createTextNode('mode_edit'));


    d.onclick = function(s) {
      var d = $(document.createElement('div'))
        .addClass('container edit-form')
        .append(item.value != null ? createEntryEditForm(item.desc, item.value, id) : createDirectoryEditForm(item.desc, id))
        .hide();

      var vv = $(this).parent().parent().parent();

      d.find('.cancel-button').click(function() {
        d.slideUp('fast', function() {
          d.remove();
        });
        vv.find('.edit_icon').fadeIn('fast').parent().removeClass('disabled');
      });

      d.find('.save-button').click(function() {
        d.slideUp('fast', function() {
          traverseArray[traverseArray.length-1][id].desc = $('#editName_'+id).val();
          if (item.value != null)
            traverseArray[traverseArray.length-1][id].value = $('#editContent_'+id).val();
          storage.setData(null, {'clipboard':traverseArray[0]}, function(context, error) {
          });
          rebuildMenusAndReload();
        });
      });

      vv.append(d)
      d.slideDown('fast');
      vv.find('.edit_icon').parent().addClass('disabled');
      vv.find('.edit_icon').fadeOut('fast');
      vv.find('#editName_' + id).focus();
    };

    d.appendChild(i);
    edit.appendChild(d);
  }

  top.appendChild(edit);

  var remove = document.createElement('div');
  remove.classList.add('col', 'c1');
  {
    var d = document.createElement('div');
    d.classList.add('btn-action', 'btn-flat');
    d.onclick = removeElement;
    var i = document.createElement('i');
    i.classList.add('material-icons');
    i.appendChild(document.createTextNode('delete'));

    d.appendChild(i);
    remove.appendChild(d);
  }
  top.appendChild(remove);

  return top1;
}

function createTable(items) {
  var table = document.createElement('div');
  table.classList.add('top-padded');
  for (var id in items) {
    var item = items[id];
    if (!item.desc || item.desc.length == 0)
      item.desc = item.value;

    table.appendChild(createEntry(item, id));
  }
  return table;
}

function createNewDirectory(s) {
  traverseArray[traverseArray.length-1].push({desc:chrome.i18n.getMessage('newDirectoryName'), e:[]});
  storage.setData(null, {clipboard: traverseArray[0]}, function(context, error) {
    if (error == null) {
      rebuildMenusAndReload();
      analytics.trackEvent('Popup', 'Directory created');
    } else {
      var errorMessage = chrome.i18n.getMessage("unknownError");
      if (error.message.match(/^QUOTA_BYTES_PER_ITEM/)) {
        errorMessage = chrome.i18n.getMessage("noMoreSpace");
      }
      Materialize.toast(chrome.i18n.getMessage("errorFailedToCreateDirectory") + errorMessage, 3000);
    }
  });
}

function setupDidYouKnowContainer() {
  var MAX_DID_YOU_KNOW = parseInt(chrome.i18n.getMessage('popupHintsCount'));
  var didYouKnowIDToShow = Math.floor(Math.random() * (MAX_DID_YOU_KNOW)) + 1;

  $('#did_you_know_text').html(chrome.i18n.getMessage('popupHintText_' + didYouKnowIDToShow));
}

window.onload = function() {
  document.body.onpageshow = function() {
    chrome.runtime.sendMessage({event:'rebuildMenus'});
    initialize();
    loadStorageItems();
  };
}

function initialize() {
  init_i18n();

  $('#recent_btn').click(addToPermClipboardFromRecent);
  $('#new_btn').click(addToPermClipboardFromManually);
  $('#new_dir_button').click(createNewDirectory);
  $('#discard_new_btn').click(discardNewEntry);
  $('#discard_recent_btn').click(discardRecentEntry);

  $('.tooltipped').tooltip({
        options: {
          enterDelay: defaultAnimationDuration
        }
      });
  setupDidYouKnowContainer();

  var elem = document.getElementById('current_div');

  $("#options_text").click(function() {
    chrome.tabs.create({url:'options.html'});
  });

  $('#back_button').click(function(e) {
    traverseArray.pop();
    if (traverseArray.length == 1)
      $('#back_button').addClass('scale-out');
    rebuildTable();
  });

  $("#current_div").sortable({
      placeholder: "list-placeholder",
      forcePlaceholderSize: true,
      cursor: "ns-resize",
      axis: 'y',
      items: 'div.top-padded > div',
      opacity: 0.7,
      revert: defaultAnimationDuration,
      helper : 'clone',
      start: function(event, ui) {
        $('.btn-action', ui.item).animate( { opacity: 0 }, defaultAnimationDuration);
      },
      stop: function(event, ui) {
        $('.btn-action', ui.item).animate( { opacity: 1 }, defaultAnimationDuration);
        var uiRaw = ui.item.get(0);

        var source = parseInt(uiRaw.getAttribute("data-entryId"));
        var target = -1;

        if (uiRaw.nextSibling) {
          var nextId = parseInt(uiRaw.nextSibling.getAttribute("data-entryId"));
          target = nextId - (source < nextId ? 1 : 0);
        } else if (uiRaw.previousSibling) {
          var prevId = parseInt(uiRaw.previousSibling.getAttribute("data-entryId"));
          target = prevId + (source > prevId ? 1 : 0);
        }

        if (target != -1 && target != source)
          relocateElement(source, target);
      }
  });

  $("#new_content").keyup(function() {
    localStorage.setItem('unsaved_content', $("#new_content").val());
  });
  $("#new_name").keyup(function() {
    localStorage.setItem('unsaved_name', $("#new_name").val());
  });
  $("#new_item_content_trigger").click(function() {
    $(this).find('.badge').fadeOut();
  });

};

function loadStorageItems() {
  storage.getData(null, {'clipboard':[], 'recent':null}, function(context, items, error) {
    if (error != null) {
      console.log(error.message);
      return;
    }
    if (items.recent) {
      $('#recent_text').empty().text(items.recent);
      $('#recent_add_element').removeClass('hide');
    }
    traverseArray.push(items.clipboard);
    rebuildTable();
  });

  if ((!localStorage.unsaved_name || localStorage.unsaved_name === "") &&
      (!localStorage.unsaved_content || localStorage.unsaved_content === "")) {
    return;
  }
  let i = document.createElement('span');
  i.classList.add('new', 'badge');
  i.dataset.badgeCaption = "";
  i.appendChild(document.createTextNode(chrome.i18n.getMessage('popup_unsavedChanges')));

  $("#new_content").val(localStorage.unsaved_content);
  $("#new_name").val(localStorage.unsaved_name);

  $("#new_item_content_trigger").append(i);
}


function relocateElement(from, to) {
  var elem = traverseArray[traverseArray.length-1][from];
  arrayRemove(traverseArray[traverseArray.length-1], from);
  traverseArray[traverseArray.length-1].splice(to, 0, elem);
  storage.setData(null, {'clipboard':traverseArray[0]}, rebuildMenusAndReload);

  analytics.trackEvent('Popup', 'Rearrange');
}
