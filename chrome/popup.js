// Array Remove - By John Resig (MIT Licensed)
// adjusted by Bartosz Przybylski to avoid members extension of array proto
function arrayRemove(a, from, to) {
  var rest = a.slice((to || from) + 1 || a.length);
  a.length = from < 0 ? a.length + from : from;
  return a.push.apply(a, rest);
}

function escapeQuots(str) {
  return str.replace(/"/g, "&quot;");
}

function escapeTags(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function addToPermClipboard() {
  chrome.storage.sync.get('clipboard', function(items) {
    if (!(items.clipboard instanceof Array))
      items.clipboard = new Array();
    var element = {
      desc:  document.getElementById('recent_name').value,
      value: document.getElementById('recent_text').innerHTML
    };
    items.clipboard.push(element);

    chrome.storage.sync.set({'clipboard':items.clipboard, 'recent':0}, function() {
      chrome.runtime.sendMessage({event:'rebuildMenus'});
      location.reload();
    });
  });
  return false;
}

function removeElement(s) {
  chrome.storage.sync.get('clipboard', function(items) {
    if (items.clipboard) {
      var e = parseInt(s.srcElement.id);
      arrayRemove(items.clipboard, e, e);
      chrome.storage.sync.set({'clipboard':items.clipboard}, function(){
        chrome.runtime.sendMessage({event:'rebuildMenus'});
        location.reload();
      });
    }
  });
}

function init_i18n() {
  document.getElementById("recent_btn").value = chrome.i18n.getMessage("addBtnText");
  document.getElementById("recent_name").placeholder = chrome.i18n.getMessage("descriptionPlaceholder");
  document.getElementById("recent_title").innerHTML = chrome.i18n.getMessage("popupNewElement");
  document.getElementById("hint").innerHTML = chrome.i18n.getMessage("popupHint");
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

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('recent_btn');
  btn.onclick = addToPermClipboard;
  var elem = document.getElementById('current_div');
  chrome.storage.sync.get('clipboard', function(items) {
    if (items.clipboard && items.clipboard.length > 0) {
      var k = "<hr><table>"; 
      var i = 0;
      for (var i = 0; i < items.clipboard.length; i++) {
        var desc  = items.clipboard[i].desc;
        var value = items.clipboard[i].value;
        if (!desc || desc.length == 0)
          desc = value;

        k += "<tr><td><a title=\"" + escapeQuots(value) + "\">" + desc + "</a></td><td><img src=\"img/remove-icon.png\" id=\""+i+"\" name=\"rem_btn\" id=\""+i+"\" class=\"rembtn\"/></td></tr>";
      }
      k += "</table>";
      elem.innerHTML = k;

      elem = document.getElementsByName('rem_btn');
      for (var e in elem)
        elem[e].onclick = removeElement;

      elem = document.getElementsByTagName('a');
      for (var e in elem)
        elem[e].onclick = copyToClipboard;
    } else {
      document.getElementById("hint").innerHTML = chrome.i18n.getMessage("popupHintNoElements");
    }

  });

  chrome.storage.sync.get('recent', function(recent) {
    if (recent.recent) {
      var div = document.getElementById('recent_text');
      if (div)
        div.innerHTML = escapeTags(recent.recent);
    } else {
      var div = document.getElementById('recent_div');
      if (div)
        div.style.visibility = 'hidden';
    }
  });
  init_i18n();
});
