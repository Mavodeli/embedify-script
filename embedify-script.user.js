// ==UserScript==
// @name         Embedify Script
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Buttons on youtube to open videos through embedify
// @author       Mavodeli
// @source       https://github.com/Mavodeli/embedify-script
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch*
// @match        https://www.youtube.com/shorts*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

// global variables
var activeButtons = [];
var currentURI;
var embedifyEnabled = getGMValue();
var embedify_switch;
var hasReloadButton = false;

(function () {
    'use strict';

    // CSS
    injectCss(
        ".embedify-button { position: absolute; bottom: 0px; right: 0px; z-index: 1000; opacity: 0.9; font-size: 12px; background: orange; padding: 0.3em; margin: 0.2em; border-radius: 2em; }" +
        ".embedify-shorts-wrapper { position: absolute; bottom: 0px; left: 0px; z-index: 1000; padding: 0.5em; margin: 0.5em; }" +
        ".embedify-shorts-button { display: block; opacity: 0.9; font-size: 14px; padding: 0.5em; margin: 0.5em; border-radius: 2em; }" +
        ".embedify-watch-main-button { position: absolute; right: 0px; opacity: 0.9; font-size: 14px; padding: 0.5em; border-radius: 2em; background: orange; }" +
        ".embedifySwitch { position: relative; display: inline-block; width: 60px; height: 34px; margin-right: 1em }" +
        ".embedifySwitch input { opacity: 0; width: 0; height: 0; }" +
        ".embedify-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: cyan; -webkit-transition: .4s; transition: .4s; border-radius: 34px; }" +
        ".embedify-slider:before { position: absolute; content: ''; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; -webkit-transition: .4s; transition: .4s; border-radius: 50%; }" +
        "input:checked + .embedify-slider { background-color: orange; } input:focus + .embedify-slider { box-shadow: 0 0 1px #2196F3; }" +
        "input:checked + .embedify-slider:before { -webkit-transform: translateX(26px); -ms-transform: translateX(26px); transform: translateX(26px); }" +
        ".embedifyReloadButton { background-color: orange; border-radius: 50%; display: inline-block; text-align: center; height: 34px; width: 34px; font-size: 22px; margin-right: 0.5em; cursor: pointer; }"
    );

    // pick the right embedify (and change it when the user opens something)
    setInterval(
        function () {
            if (currentURI !== window.location.href) {
                currentURI = window.location.href;
                if (currentURI.startsWith('https://www.youtube.com/watch')) {
                    embedifyWatch();
                } else if (currentURI.startsWith('https://www.youtube.com/shorts')) {
                    embedifyShorts();
                } else if (currentURI.startsWith('https://www.youtube.com')) {
                    embedifyHome();
                }
            }
        },
        1000
    );
})();



//
// Different pages:
//

function embedifyHome() {

    // initial update (resize isn't called when going back a page)
    updateButtons();

    // add buttons as the user scrolls
    const resizeObserver = new ResizeObserver(entries => {
        updateButtons()
    });
    resizeObserver.observe(document.querySelector("ytd-browse"));



    //
    // functions
    //

    function getThumbnails() {
        // ignore already embedified thumbnails
        return document.querySelectorAll("a#thumbnail[href][class*='ytd-thumbnail']");
    }

    function getThumbnailID(thumbnail_element) {
        return parseID(thumbnail_element.getAttribute("href"));
    }

    function createButtonForThumbnail(thumbnail) {
        let id = getThumbnailID(thumbnail);
        let button = document.createElement("div");
        button.innerHTML = "<a href='https://mavodeli.de/embedify/?id=" + id + "' target='_blank'><button class='embedify-button'>e</button></a>";
        thumbnail.parentElement.parentElement.parentElement.parentElement.parentElement.append(button);
        activeButtons.push(button);
    }

    function updateButtons() {
        clearButtons();

        createEmbedifySwitch();

        if (!embedifyEnabled) { return; }

        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
        }
    }
}

function embedifyWatch() {

    // initial update
    updateButtons();

    // add buttons for recommended videos as the user scrolls
    const resizeObserver = new ResizeObserver(entries => {
        updateButtons();
    });
    resizeObserver.observe(document.querySelector("div#columns"));



    //
    // functions
    //

    function getMenuRenderer() {
        return document.querySelector("div#title[class*=ytd-watch]");
    }

    function getMainID() {
        return parseID(window.location.href);
    }

    function createMainButton() {
        let id = getMainID();
        let MenuRenderer = getMenuRenderer();
        let button = document.createElement("div");
        button.innerHTML = "<a href='https://mavodeli.de/embedify/?id=" + id + "' style='text-decoration: none;'><button class='embedify-watch-main-button'>embedify</button></a>";
        // button.setAttribute("style", "display: flex; align-items: center;");
        MenuRenderer.prepend(button);
        activeButtons.push(button);
    }

    function getThumbnails() {
        // ignore already embedified thumbnails
        return document.querySelectorAll("a#thumbnail[href][class*='ytd-thumbnail']:not([embedified])");
    }

    function getThumbnailID(thumbnail_element) {
        return parseID(thumbnail_element.getAttribute("href"));
    }

    function createButtonForThumbnail(thumbnail) {
        let id = getThumbnailID(thumbnail);
        let button = document.createElement("div");
        button.innerHTML = "<a href='https://mavodeli.de/embedify/?id=" + id + "' target='_blank'><button class='embedify-button'>e</button></a>";
        thumbnail.parentElement.parentElement.parentElement.append(button);
        activeButtons.push(button);
    }

    function updateButtons() {
        clearButtons();

        createEmbedifySwitch();

        if (!embedifyEnabled) { return; }

        // main button
        createMainButton();

        // recommended videos
        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
        }
    }
}

function embedifyShorts() {

    clearButtons();

    createButtonsForShort();

    createEmbedifySwitch();


    //
    // functions
    //

    function getShortsContainer() {
        return document.querySelector("div#shorts-container")
    }

    function getShortID() {
        return parseID(window.location.href);
    }

    function createButtonsForShort() {
        let id = getShortID();
        let shortsContainer = getShortsContainer();
        let buttons = document.createElement("div");
        buttons.classList.add("embedify-shorts-wrapper");
        if (embedifyEnabled) {
            buttons.innerHTML =
                "<a href='https://mavodeli.de/embedify/?id=" + id + "' style='text-decoration: none;'><button class='embedify-shorts-button' style='background: orange;'>embedify</button></a>" +
                "<a href='https://www.youtube.com/watch?v=" + id + "' style='text-decoration: none;'><button class='embedify-shorts-button' style='background: cyan;'>unshortify</button></a>";
        } else {
            buttons.innerHTML =
                "<a href='https://www.youtube.com/watch?v=" + id + "' style='text-decoration: none;'><button class='embedify-shorts-button' style='background: cyan;'>unshortify</button></a>";
        }
        shortsContainer.append(buttons);
        activeButtons.push(buttons);
    }
}

function parseID(url) {
    const youtube_regex = /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|shorts\/|\?vi?=|\&vi?=)([^#\&\?]*).*/
    let parsed = url.match(youtube_regex);
    if (parsed && parsed[2]) {
        return parsed[2];
    }
}

function injectCss(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
        return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function clearButtons() {
    for (let button of activeButtons) {
        button.remove();
    }
    activeButtons = [];
}

function createEmbedifySwitch() {
    let container = document.querySelector("div#end[class*=ytd-masthead]");

    let toggle = document.createElement("label");
    toggle.classList.add("embedifySwitch");
    toggle.innerHTML =
        "<input type='checkbox'>" +
        "<span class='embedify-slider'></span>";

    container.prepend(toggle);
    activeButtons.push(toggle);

    // Set input state
    embedify_switch = toggle.firstChild;
    embedify_switch.checked = embedifyEnabled;

    $(embedify_switch).change(function () {
        if (this.checked) {
            embedifyEnabled = true;
            setGMValue();
            addReloadButton();
        } else {
            embedifyEnabled = false;
            setGMValue();
            addReloadButton();
        }
    });
}

function setGMValue() {
    GM_setValue("embedifyEnabled", embedifyEnabled.toString());
}

function getGMValue() {
    let val = GM_getValue("embedifyEnabled", "true");
    return val === "true";
}

function addReloadButton() {
    if (hasReloadButton) { return; }

    let container = document.querySelector("div#end[class*=ytd-masthead]");

    let button = document.createElement("input");
    button.classList.add("embedifyReloadButton");
    button.type = "button";
    button.value = "↻";

    container.prepend(button);
    activeButtons.push(button);
    hasReloadButton = true;

    $(button).on("click", function () {
        location.reload();
    });
}
