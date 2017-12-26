
function init_i18n() {
  $('#title').text(chrome.i18n.getMessage('translatorsTitle'))
}

function fillTranslators() {
  var element = $('#translators');
  for(var index in translatorsData) {
    var element = translatorsData[index];
    $('#translators').append(cardContentTemplate.format(index, element));
  }
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

var cardContentTemplate =
  '<div class="card-content">' +
    '<div class="option-entry">' +
      '<div class="option-entry__name">' +
        '<p class="option-entry__language">{0}</p>' +
      '</div>' +
      '<div class="option-entry__translator">' +
        '<p>{1}</p>' +
      '</div>' +
    '</div>'+
  '</div>' +
  '<li class="divider"></li>';

var translatorsData = {
  'Deutsch': 'Aleksandra Dubaniowska',
  'English': 'Bartosz Przybylski',
  'Polski': 'Bartosz Przybylski',
  'Русский': 'Eldar Khalmatov'
};

$(document).ready(function() {
  init_i18n();
  fillTranslators();
});
