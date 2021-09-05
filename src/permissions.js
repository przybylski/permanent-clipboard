window.onload = () => {
    localize();
    let readGranted = false;
    let writeGranted = false;
    navigator.permissions.query({'name': 'clipboard-read'}).then(
        result => {
            let handler = () => navigator.clipboard.readText();
            processPermission(result, "#permission-read", handler);
            result.onchange = function() {
                processPermission(this, "#permission-read", handler);
                readGranted = result.state == 'granted';
                updateTitle(readGranted, writeGranted);
            };
            readGranted = result.state == 'granted';
            updateTitle(readGranted, writeGranted);
        }
    );
    navigator.permissions.query({'name': 'clipboard-write'}).then(
        result => {
            let handler = () => { navigator.clipboard.writeText(""); };
            processPermission(result, "#permission-write", handler);
            result.onchange = function() {
                processPermission(this, "#permission-write", handler);
                writeGranted = result.state == 'granted';
                updateTitle(readGranted, writeGranted);
            }
            writeGranted = result.state == 'granted';
            updateTitle(readGranted, writeGranted);
        }
    );
}

function updateTitle(readGranted, writeGranted) {
    if (readGranted && writeGranted) {
        $("#permissions-thankYou").removeClass("hide");
    } else {
        $("#permissions-thankYou").addClass("hide");        
    }
}

function processPermission(permission, parentElement, actionHandler) {
    $(parentElement + " #action a").click(actionHandler);
    if (permission.state === 'granted') {
        $(parentElement + " #decorator").removeClass('hide', 5000);
        $(parentElement + " #action").addClass('hide', 5000);
        $(parentElement).addClass("green lighten-5", 5000);
        $(parentElement).removeClass("red", 5000);
    } else {
        $(parentElement + " #decorator").addClass('hide', 5000);
        $(parentElement + " #action").removeClass('hide', 5000);
        $(parentElement).addClass("red lighten-5", 5000);
        $(parentElement).removeClass("green", 5000);
    }
}

function localize() {
    $("#permissions-title").text(chrome.i18n.getMessage("permissions_title"));
    $("#permissions-thankYou").text(chrome.i18n.getMessage("permissions_thankYou"));
    $("#permission-read .option-entry__title p").text(chrome.i18n.getMessage("permissions_clipboardRead"));
    $("#permission-read .option-entry__subtitle p").text(chrome.i18n.getMessage("permissions_clipboardRead_rationale"));
    $("#permission-read .option-entry__action a").text(chrome.i18n.getMessage("permissions_grantPermission"));
    $("#permission-write .option-entry__title p").text(chrome.i18n.getMessage("permissions_clipboardWrite"));
    $("#permission-write .option-entry__subtitle p").text(chrome.i18n.getMessage("permissions_clipboardWrite_rationale"));
    $("#permission-write .option-entry__action a").text(chrome.i18n.getMessage("permissions_grantPermission"));
}