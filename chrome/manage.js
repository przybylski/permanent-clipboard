
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
      toplevel.append(createEntryViewForData(items.clipboard[i]));
    }

    toplevel.sortable({
        placeholder: "list-placeholder",
        forcePlaceholderSize: true,
        cursor: "ns-resize",
        axis: 'y',
        revert: 100,
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
    tearDownBrowserIfNeeded();
    currentlySelected = $(event.target);
    appendBrowserIfNeeded();
  });
}

function tearDownBrowserIfNeeded() {

}

function appendBrowserIfNeeded() {

}

var currentlySelected;

$().ready(function() {
  displayClipboardElements();
  initiateLiveEvents();
});
