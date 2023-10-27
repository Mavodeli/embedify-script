// ==UserScript==
// @name         Embedify Script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Buttons on youtube to open videos through embedify
// @author       Mavodeli
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch*
// @match        https://www.youtube.com/shorts*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    // pick the right embedify (and change it when the user opens something)
    let currentURI;

    setInterval(
        function() {
            if (currentURI !== window.location.href) {
                currentURI = window.location.href;
                if (currentURI.startsWith('https://www.youtube.com/watch')) {
                    embedifyWatch();
                } else if (currentURI.startsWith('https://www.youtube.com/shorts')) {
                    embedifyShorts();
                } else if (currentURI.startsWith('https://www.youtube.com')) {
                    embedifyHome();
                }}},
        1000
    );

    // CSS
    injectCss(
        ".embedify-button { position: absolute; bottom: 0px; right: 0px; z-index: 1000; opacity: 0.9; font-size: 12px; background: orange; padding: 0.3em; margin: 0.2em; border-radius: 2em; }" +
        ".embedify-shorts-wrapper { position: absolute; bottom: 0px; left: 0px; z-index: 1000; padding: 0.5em; margin: 0.5em; }" +
        ".embedify-shorts-button { display: block; opacity: 0.9; font-size: 14px; padding: 0.5em; margin: 0.5em; border-radius: 2em; }"
    );
})();



//
// Different pages:
//

function embedifyHome() {

    console.log("embedify home active");



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
        return document.querySelectorAll("a#thumbnail[href][class*='ytd-thumbnail']:not([embedified])");
    }

    function getThumbnailID(thumbnail_element) {
        return parseID(thumbnail_element.getAttribute("href"));
    }

    function createButtonForThumbnail(thumbnail) {
        let id = getThumbnailID(thumbnail);
        let button = document.createElement("div");
        button.innerHTML = "<a href='https://mavodeli.de/embedify/?id=" + id + "' target='_blank'><button class='embedify-button'>e</button></a>";
        thumbnail.parentElement.parentElement.parentElement.parentElement.parentElement.append(button);
    }

    function updateThumbnails() {
        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
            // Set an attribute to prevent getThumbnails from getting this one again
            thumbnail.setAttribute("embedified", "true");
        }
    }
}

function embedifyWatch() {

    console.log("embedify watch active");

}

function embedifyShorts() {

    console.log("embedify shorts active");

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
