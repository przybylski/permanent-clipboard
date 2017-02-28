// Array Remove - By John Resig (MIT Licensed)
// adjusted by Bartosz Przybylski to avoid members extension of array proto
function arrayRemove(a, from, to) {
  var rest = a.slice((to || from) + 1 || a.length);
  a.length = from < 0 ? a.length + from : from;
  return a.push.apply(a, rest);
}

var defaultAnimationDuration = 100;
var storage = new Storage();
var traverseArray = [];

function getStorage() {
  if (localStorage["storage_type"] == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

function rebuildTable() {
  $('#current_div').empty();
  $('#current_div').append(createTable(traverseArray[traverseArray.length-1]));
}

function rebuildMenusAndReload() {
  chrome.runtime.sendMessage({event:'rebuildMenus'});
  rebuildTable();
}

function addToPermClipboardFromRecent() {
  addToPermClipboard(document.getElementById('recent_name').value,
                     document.getElementById('recent_text').innerHTML);
  analytics.trackEvent('Popup', 'Recent saved');
  return false;
}

function addToPermClipboardFromManually() {
  // text can't be empty, name can
  // it will be replaced by text eventually
  var text = document.getElementById('new_content').value;
  if (text !== "") {
    addToPermClipboard(document.getElementById('new_name').value, text);
    analytics.trackEvent('Popup', 'Manually add');
  }
  return false;
}

function addToPermClipboard(name, text) {  
  traverseArray[traverseArray.length-1].push({ desc: name, value: text });
  storage.setData(null, {'clipboard':traverseArray[0], 'recent':0}, rebuildMenusAndReload);
}

function removeElement(s) {
  var e = parseInt(s.srcElement.parentNode.parentNode.parentNode.getAttribute('data-entryId'));
  arrayRemove(traverseArray[traverseArray.length-1], e, e);
  storage.setData(null, {'clipboard':traverseArray[0]}, rebuildMenusAndReload);
  rebuildTable();
  analytics.trackEvent('Popup', 'Remove element');
}

function editElement(s) {
  var tableRow = s.srcElement.parentNode.parentNode;
  getStorage().get('clipboard', function(items) {
    if (items.clipboard) {
      var id = parseInt(s.srcElement.parentNode.parentNode.getAttribute('data-entryId'));
      var el = items.clipboard[id];
      var td = document.createElement('td');
      td.appendChild(createEditForm(el.desc, el.value, id));
      while (tableRow.lastChild)
        tableRow.removeChild(tableRow.lastChild);
      tableRow.appendChild(td);
      analytics.trackEvent('Popup', 'Edit started');
    }
  });
}

function createEditForm(name, content, id) {
  var wrapper = document.createElement('div');
  var child = document.createElement('input');
  child.className = 'entryName';
  child.value = name;
  wrapper.appendChild(child);
  wrapper.appendChild(document.createElement('br'));

  child = document.createElement('textarea');
  child.className = 'entryContent';
  wrapper.appendChild(child).appendChild(document.createTextNode(content));
  wrapper.appendChild(document.createElement('br'));

  wrapper.appendChild(createButton('Save', function(s) {
    getStorage().get('clipboard', function(items) {
      if (items.clipboard) {
        var wrap = s.srcElement.parentNode;
        var id = parseInt(wrap.parentNode.parentNode.getAttribute('data-entryId'));
        var name = wrap.getElementsByClassName('entryName')[0].value;
        var content = wrap.getElementsByClassName('entryContent')[0].value;

        items.clipboard[id] = { desc: name, value: content};

        getStorage().set({'clipboard':items.clipboard}, rebuildMenusAndReload);
        analytics.trackEvent('Popup', 'Editing saved');
      }
    });
  }));
  wrapper.appendChild(createButton('Cancel', function() {
      location.reload();
      analytics.trackEvent('Popup', 'Editing canceled');
  }));
  return wrapper;
}

function createButton(name, invokeFunction) {
  var btn = document.createElement('button');
  btn.appendChild(document.createTextNode(name));
  btn.onclick = invokeFunction;
  return btn;
}

function init_i18n() {
  $("#recent_btn").text(chrome.i18n.getMessage("addBtnText"));
  $("#recent_name_label").text(chrome.i18n.getMessage("descriptionPlaceholder"));
  $("#recent_title").text(chrome.i18n.getMessage("popupNewElement"));

  $("#hint").append(chrome.i18n.getMessage("popupHint"));
  
  $("#new_btn").text(chrome.i18n.getMessage("addBtnText"));
  $("#new_name_label").text(chrome.i18n.getMessage("descriptionPlaceholder"));
  $("#new_content_label").text(chrome.i18n.getMessage("contentPlaceholder"));
  
  $("#new_item_content_trigger").text(chrome.i18n.getMessage("showAddFormText"));
  $("#storage_type_text").text(chrome.i18n.getMessage(localStorage["storage_type"] == "local" ? "localStorageUsed" : "syncedStorageUsed"));

  $("#delete_label").text(chrome.i18n.getMessage("deleteEntryIconTitle"));
  $("#cancel_label").text(chrome.i18n.getMessage("commonCancel"));
}

function copyToClipboard(s) {
  var textArr = s.srcElement.title.split('\n');
  $(s.srcElement).animate({opacity:0.5}, 100, function() { $(s.srcElement).animate({opacity:1}, 100); });
  var copyDiv = document.createElement('div');
  copyDiv.contentEditable = true;
  document.body.appendChild(copyDiv);
  for (var te in textArr) {
    copyDiv.appendChild(document.createTextNode(textArr[te]));
    copyDiv.appendChild(document.createElement('br'));
  }
  copyDiv.unselectable = "off";
  copyDiv.focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  document.body.removeChild(copyDiv);
  analytics.trackEvent('Popup', 'Element clicked');
}

function createEntry(item, id) {

  var createSrcSet = function(base, type) {
    return base + "_1x." + type + ", " + base + "_2x." + type + " 2x";
  }

  var top = document.createElement('div');
  top.classList.add('row');
  top.classList.add('rowrow');
  top.classList.add('valign-wrapper');
  top.setAttribute('data-entryId', id);

  var left = document.createElement('div');
  left.classList.add('col');
  left.classList.add('s1');

  if (item.e != null) {
    var i = document.createElement('img');
    i.srcset = createSrcSet('img/icons/ic_folder', 'png');
    left.appendChild(i);
  }

  top.appendChild(left);

  var main = document.createElement('div');
  main.classList.add('col');
  main.classList.add('s8');

  {
    var a = document.createElement('a');
    a.appendChild(document.createTextNode(item.desc));
    if (item.value != null) {
      a.onclick = copyToClipboard;
      a.title = item.value;
    } else {
      a.onclick = function(e) {
        $('#current_div').empty();
        $('#current_div').append(createTable(item.e));
        $('#back_button').removeClass('scale-out');
        traverseArray.push(item.e);
      };
    }
    main.appendChild(a);
  }

  top.appendChild(main);

  var edit = document.createElement('div');
  edit.classList.add('col');
  edit.classList.add('c1');

  {
    var d = document.createElement('div');
    var i = document.createElement('img');

    i.srcset = createSrcSet('img/icons/ic_edit', 'png');

    d.appendChild(i);
    edit.appendChild(d);
  }

  top.appendChild(edit);

  var remove = document.createElement('div');
  remove.classList.add('col');
  remove.classList.add('c1');
  {
    var d = document.createElement('div');
    var i = document.createElement('img');
    i.srcset = createSrcSet('img/icons/ic_delete', 'png');
    i.classList.add('actionbtn');
    i.onclick = removeElement;

    d.appendChild(i);
    remove.appendChild(d);
  }
  top.appendChild(remove);

  return top;
}

function createTable(items) {
  var table = document.createElement('table');
  for (var id in items) {
    var item = items[id];
    if (!item.desc || item.desc.length == 0)
      item.desc = item.value;

    table.appendChild(createEntry(item, id));
  }
  return table;
}

function createNewDirectory(s) {
  traverseArray[traverseArray.length-1].push({desc:'dir', e:[]});
  storage.setData(null, {clipboard: traverseArray[0]}, rebuildMenusAndReload);
  analytics.trackEvent('Popup', 'Directory created')
}

$(document).ready(function() {

  $('.collapsible').collapsible();

  $('#recent_btn').click(addToPermClipboardFromRecent);
  $('#new_btn').click(addToPermClipboardFromManually);
  $('#new_dir_button').click(createNewDirectory);
  
  var elem = document.getElementById('current_div');
  getStorage().get('clipboard', function(items) {
    traverseArray.push(items.clipboard);
    if (items.clipboard && items.clipboard.length > 0) {
      elem.appendChild(createTable(items.clipboard));
    } else {
      $("#hint").html(chrome.i18n.getMessage("popupHintNoElements"));
    }

    $("#options_text").click(function() {
      chrome.tabs.create({url:'options.html'});
    });

    $('.dropdown-button').dropdown({
      constrainWidth: false,
      stopPropagation: true
    });

  });

  $('#back_button').click(function(e) {
    traverseArray.pop();
    rebuildTable();
    if (traverseArray.length == 1)
      $('#back_button').addClass('scale-out');
  });


  $("#current_div").sortable({
      placeholder: "list-placeholder",
      forcePlaceholderSize: true,
      cursor: "ns-resize",
      axis: 'y',
      items: 'table > div.row',
      opacity: 0.7,
      revert: defaultAnimationDuration,
      start: function(event, ui) {
        $('.actioncell', ui.item).each(function() {
          $('.actioncell', ui.item).css({opacity:0});
        });
      },
      stop: function(event, ui) {
        $('.actioncell', ui.item).each(function() {
          $('.actioncell', ui.item).animate({opacity:1}, defaultAnimationDuration);
        });
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

  getStorage().get('recent', function(recent) {
    if (recent.recent) {
      var div = document.getElementById('recent_text');
      if (div) {
        while (div.lastChild)
          div.removeChild(div.lastChild);
        div.appendChild(document.createTextNode(recent.recent));
      }
    } else {
      $('#recent_add_element').addClass('hide');
    }
  });

  init_i18n();
});

function relocateElement(from, to) {
  var elem = traverseArray[traverseArray.length-1][from];
  arrayRemove(traverseArray[traverseArray.length-1], from, from);
  traverseArray[traverseArray.length-1].splice(to, 0, elem);
  storage.setData(null, {'clipboard':traverseArray[0]}, rebuildMenusAndReload);

  analytics.trackEvent('Popup', 'Rearrange');
}
