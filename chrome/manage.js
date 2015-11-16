
function getStorage() {
  if (localStorage["storage_type"] == "local")
    return chrome.storage.local;
  return chrome.storage.sync;
}

function createEntryViewForData(data) {
  var e = $('<div></div>');
  e.addClass('browser_entry');
  
  var title = $('<div></div>');
  title.addClass('entry_title');
  title.text(data.desc);

  e.append(title);

  if (typeof data.value == "string") {
    var subtitle = $('<div></div>');
    subtitle.addClass('entry_value');
    subtitle.text(data.value);
    e.append(subtitle);
  } else {
    e.addClass('submenu');
    var arrow = $('<span></span>');
    arrow.addClass('ui-icon').addClass('ui-icon-carat-1-e');
    e.append(arrow);
  }

  return e;
}

function createEntriesWindow() {
  var e = $('<div></div>');

  e.addClass('browser_window');

  return e;
}

function displayClipboardElements() {
  getStorage().get('clipboard', function(items) {

    var toplevel = createEntriesWindow();

    $('#browser_wrapper').append(toplevel);

    for (var i = 0; i < items.clipboard.length; ++i) {
      var ee = createEntryViewForData(items.clipboard[i]);
      toplevel.append(ee);
      ee.attr('path', '_'+i);
    }

    toplevel.sortable({
        placeholder: "list-placeholder",
        forcePlaceholderSize: true,
        cursor: "ns-resize",
        revert: 100,
        connectWith: 'div'
    });
    
  });
}

function initiateLiveEvents() {
  $('div').on('click', 'div.browser_entry', function(event) {
    while (!$(event.target).hasClass('browser_entry'))
      event.target = event.target.parentNode;
    if (currentlySelected) {
      currentlySelected.removeClass('ui-selected');
    }
    $(event.target).addClass('ui-selected');
    var incoming = $(event.target);
    var path = tearDownBrowserIfNeeded(incoming);
    currentlySelected = incoming;
    appendBrowserIfNeeded(incoming, path);
  });
}

function tearDownBrowserIfNeeded(incoming) {
  if (currentlySelected == null)
    return incoming.attr('path').split("_");
  var incomingPath = incoming.attr('path').split("_");
  var currentPath = currentlySelected.attr('path').split("_");

  var same = 0;

  for (var i = 0; i < Math.min(incomingPath.length, currentPath.length); ++i) {
    if (incomingPath[i] != currentPath[i]) break;
    same++;
  }
  
  if (same == incomingPath.length) same--;

  var e = $('#browser_wrapper .browser_window');
  for (var i = same; i < e.length; ++i) {
    e[i].remove();
  }

  return incomingPath;
}

function appendBrowserIfNeeded(incoming, pathLeft) {

  getStorage().get('clipboard', function(items) {


    if (currentlySelected != null && currentlySelected.hasClass('submenu')) {
      var displayElems = items.clipboard;
      for (var i = 1; i < pathLeft.length; ++i) {
        displayElems = displayElems[parseInt(pathLeft[i])].value;
      }

      var level = createEntriesWindow();
      level.attr('path', currentlySelected.attr('path'));

      $('#browser_wrapper').append(level);
      for (var i = 0; i < displayElems.length; ++i) {
        var ee = createEntryViewForData(displayElems[i]);
        level.append(ee);
        ee.attr('path', currentlySelected.attr('path')+'_'+i);
      }
      level.sortable({
        placeholder: "list-placeholder",
        forcePlaceholderSize: true,
        revert: 100,
        connectWith: 'div'
      });
    }

  });
}

var currentlySelected;

$().ready(function() {
  displayClipboardElements();
  initiateLiveEvents();
});
