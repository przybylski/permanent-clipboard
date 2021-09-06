import { internacionalizeContent } from './js/i18n.js';

window.onload = () => {
    internacionalizeContent(document.body);
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
        $(parentElement + " #decorator").removeClass('hide');
        $(parentElement + " #action").addClass('hide');
        $(parentElement).addClass("green lighten-5");
        $(parentElement).removeClass("red");
    } else {
        $(parentElement + " #decorator").addClass('hide');
        $(parentElement + " #action").removeClass('hide');
        $(parentElement).addClass("red lighten-5");
        $(parentElement).removeClass("green");
    }
}