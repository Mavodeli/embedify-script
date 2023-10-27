// ==UserScript==
// @name         Embedify Script
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Buttons on youtube to open videos through embedify
// @author       Mavodeli
// @source       https://github.com/Mavodeli/embedify-script
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch*
// @match        https://www.youtube.com/shorts*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function () {
    'use strict';

    // keep track of active buttons
    var activeButtons = [];

    // pick the right embedify (and change it when the user opens something)
    let currentURI;

    setInterval(
        function () {
            if (currentURI !== window.location.href) {
                currentURI = window.location.href;
                if (currentURI.startsWith('https://www.youtube.com/watch')) {
                    embedifyWatch(activeButtons);
                } else if (currentURI.startsWith('https://www.youtube.com/shorts')) {
                    embedifyShorts(activeButtons);
                } else if (currentURI.startsWith('https://www.youtube.com')) {
                    embedifyHome(activeButtons);
                }
            }
        },
        1000
    );

    // CSS
    injectCss(
        ".embedify-button { position: absolute; bottom: 0px; right: 0px; z-index: 1000; opacity: 0.9; font-size: 12px; background: orange; padding: 0.3em; margin: 0.2em; border-radius: 2em; }" +
        ".embedify-shorts-wrapper { position: absolute; bottom: 0px; left: 0px; z-index: 1000; padding: 0.5em; margin: 0.5em; }" +
        ".embedify-shorts-button { display: block; opacity: 0.9; font-size: 14px; padding: 0.5em; margin: 0.5em; border-radius: 2em; }" +
        ".embedify-watch-main-button { position: absolute; right: 0px; opacity: 0.9; font-size: 14px; padding: 0.5em; border-radius: 2em; background: orange; }"
    );
})();



//
// Different pages:
//

function embedifyHome(activeButtons) {

    console.log("embedify home active");

    // initial update (resize isn't called when going back a page)
    updateThumbnails();

    // add buttons as the user scrolls
    const resizeObserver = new ResizeObserver(entries => {
        updateThumbnails()
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

    function updateThumbnails() {
        clearButtons(activeButtons);

        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
        }
    }
}

function embedifyWatch(activeButtons) {

    console.log("embedify watch active");

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
        clearButtons(activeButtons);

        // main button
        createMainButton();

        // recommended videos
        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
        }
    }
}

function embedifyShorts(activeButtons) {

    console.log("embedify shorts active");

    clearButtons(activeButtons);

    createButtonsForShort();



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
        buttons.innerHTML = "<div class='embedify-shorts-wrapper'>" +
            "<a href='https://mavodeli.de/embedify/?id=" + id + "' style='text-decoration: none;'><button class='embedify-shorts-button' style='background: orange;'>embedify</button></a>" +
            "<a href='https://www.youtube.com/watch?v=" + id + "' style='text-decoration: none;'><button class='embedify-shorts-button' style='background: cyan;'>unshortify</button></a>" +
            "</div>";
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

function clearButtons(activeButtons) {
    for (let button of activeButtons) {
        button.remove();
    }
    activeButtons = [];
}
