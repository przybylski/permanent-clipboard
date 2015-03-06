// Array Remove - By John Resig (MIT Licensed)
// adjusted by Bartosz Przybylski to avoid members extension of array proto
function arrayRemove(a, from, to) {
	var rest = a.slice((to || from) + 1 || a.length);
	a.length = from < 0 ? a.length + from : from;
	return a.push.apply(a, rest);
}

function getStorage() {
  if (localStorage["storage_type"] == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

function escapeQuots(str) {
	return str.replace(/"/g, "&quot;");
}

function escapeTags(str) {
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function rebuildMenusAndReload() {
  chrome.runtime.sendMessage({event:'rebuildMenus'});
  location.reload();
}

function addToPermClipboardFromRecent() {
	addToPermClipboard(document.getElementById('recent_name').value,
	                   document.getElementById('recent_text').innerHTML);
	return false;
}

function addToPermClipboardFromManually() {
	// text can't be empty, name can
	// it will be replaced by text eventually
	var text = document.getElementById('new_content').value;
	if (text !== "")
		addToPermClipboard(document.getElementById('new_name').value, text);
	return false;
}

function addToPermClipboard(name, text) {
  getStorage().get('clipboard', function(items) {
		if (!(items.clipboard instanceof Array))
			items.clipboard = new Array();

		items.clipboard.push({ desc: name, value: text });
    getStorage().set({'clipboard':items.clipboard, 'recent':0}, rebuildMenusAndReload);
	});
}

function removeElement(s) {
  var storage = getStorage();
  storage.get('clipboard', function(items) {
		if (items.clipboard) {
			var e = parseInt(s.srcElement.id);
			arrayRemove(items.clipboard, e, e);
      storage.set({'clipboard':items.clipboard}, rebuildMenusAndReload);
		}
	});
}

function editElement(s) {
  var tableRow = s.srcElement.parentNode.parentNode;
  getStorage().get('clipboard', function(items) {
    if (items.clipboard) {
      var id = parseInt(s.srcElement.id);
      var el = items.clipboard[id];
      var td = document.createElement('td');
      td.appendChild(createEditForm(el.desc, el.value, id));
      while (tableRow.firstChild)
        tableRow.removeChild(tableRow.firstChild);
      tableRow.appendChild(td);
    }
  });
}

function createEditForm(name, content, id) {
  var wrapper = document.createElement('div');
  wrapper.id = id;
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
        var id = parseInt(wrap.id);
        var name = wrap.getElementsByClassName('entryName')[0].value;
        var content = wrap.getElementsByClassName('entryContent')[0].value;

        items.clipboard[id] = { desc: name, value: content};

        getStorage().set({'clipboard':items.clipboard}, rebuildMenusAndReload);
      }
    });
  }));
  wrapper.appendChild(createButton('Cancel', function() { location.reload(); }));
  return wrapper;
}

function createButton(name, invokeFunction) {
  var btn = document.createElement('button');
  btn.appendChild(document.createTextNode(name));
  btn.onclick = invokeFunction;
  return btn;
}

function init_i18n() {
	document.getElementById("recent_btn").value = chrome.i18n.getMessage("addBtnText");
	document.getElementById("recent_name").placeholder = chrome.i18n.getMessage("descriptionPlaceholder");
	document.getElementById("recent_title").innerHTML = chrome.i18n.getMessage("popupNewElement");
	document.getElementById("hint").innerHTML = chrome.i18n.getMessage("popupHint");
	document.getElementById("new_btn").value = chrome.i18n.getMessage("addBtnText");
	document.getElementById("new_name").placeholder = chrome.i18n.getMessage("descriptionPlaceholder");
	document.getElementById("new_content").placeholder = chrome.i18n.getMessage("contentPlaceholder");
	document.getElementById("new_item_content_trigger").innerHTML = chrome.i18n.getMessage("showAddFormText");
  document.getElementById("storage_type_text").innerHTML = chrome.i18n.getMessage(localStorage["storage_type"] == "local" ? "localStorageUsed" : "syncedStorageUsed");
  document.getElementById("options_text").innerHTML = chrome.i18n.getMessage("optionsText");
}

function copyToClipboard(s) {
	var text = s.srcElement.title;
	var copyDiv = document.createElement('div');
	copyDiv.contentEditable = true;
	document.body.appendChild(copyDiv);
	copyDiv.innerHTML = escapeTags(text);
	copyDiv.unselectable = "off";
	copyDiv.focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
	document.body.removeChild(copyDiv);
}

function createTableRow(value, desc, id) {
  return "<tr><td>" +
           "<a title=\"" + escapeQuots(value) + "\">" + desc + "</a>" +
         "</td><td class=\"actioncell\">" +
           "<img src=\"img/edit-icon.png\" id=\""+id+"\" name=\"edit_btn\" id=\""+id+"\" class=\"actionbtn\"/>" +
         "</td><td class=\"actioncell\">" +
           "<img src=\"img/remove-icon.png\" id=\""+id+"\" name=\"rem_btn\" id=\""+id+"\" class=\"actionbtn\"/>" +
         "</td></tr>";
}

function assignDeleteActions() {
  var elem = document.getElementsByName('rem_btn');
  for (var e in elem)
      elem[e].onclick = removeElement;
}

function assignEditActions() {
  var elem = document.getElementsByName('edit_btn');
  for (var e in elem)
    elem[e].onclick = editElement;
} 

function assignCopyToClipboardActions(root) {
  var elem = root.getElementsByTagName('a');
  for (var e in elem) {
      elem[e].onclick = copyToClipboard;
  }
}

document.addEventListener('DOMContentLoaded', function() {
	var btn = document.getElementById('recent_btn');
	btn.onclick = addToPermClipboardFromRecent;
	btn = document.getElementById('new_btn');
	btn.onclick = addToPermClipboardFromManually;
	btn = document.getElementById('new_item_content_trigger');
	btn.onclick = function() {
		var e = document.getElementById('new_item_content');
		if (e.classList.contains("cinvisible"))
			e.classList.remove("cinvisible");
		else
			e.classList.add("cinvisible");
		return false;
	}
	
	var elem = document.getElementById('current_div');
  getStorage().get('clipboard', function(items) {
		if (items.clipboard && items.clipboard.length > 0) {
			var k = "<hr><table>"; 
			var i = 0;
			for (var i = 0; i < items.clipboard.length; i++) {
				var desc	= items.clipboard[i].desc;
				var value = items.clipboard[i].value;
				if (!desc || desc.length == 0)
					desc = value;

        k += createTableRow(value, desc, i);
			}
			k += "</table>";
			elem.innerHTML = k;

      assignDeleteActions();
      assignEditActions();
      assignCopyToClipboardActions(elem);
		} else {
			document.getElementById("hint").innerHTML = chrome.i18n.getMessage("popupHintNoElements");
		}

    var options = document.getElementById("options_text");
    options.onclick = function() {
      chrome.tabs.create({url:'options.html'});
    };

	});

  getStorage().get('recent', function(recent) {
		if (recent.recent) {
			var div = document.getElementById('recent_text');
			if (div)
				div.innerHTML = escapeTags(recent.recent);
		} else {
			var div = document.getElementById('recent_div');
			if (div)
				div.style.display = 'none';
		}
	});
	init_i18n();
});
