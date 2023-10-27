// ==UserScript==
// @name         Embedify Script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Buttons on youtube to open videos through embedify
// @author       Mavodeli
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("embedify active");



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

    function parseID(url) {
        const youtube_regex = /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|shorts\/|\?vi?=|\&vi?=)([^#\&\?]*).*/
        let parsed = url.match(youtube_regex);
        if (parsed && parsed[2]) {
            return parsed[2];
        }
    }

    function getThumbnailID(thumbnail_element) {
        return parseID(thumbnail_element.getAttribute("href"));
    }

    function createButtonForThumbnail(thumbnail) {
        let id = getThumbnailID(thumbnail);
        let button = document.createElement("div");
        button.innerHTML = "<a href='https://mavodeli.de/embedify/?id=" + id + "' target='_blank'><button class='embedify-button'>e</button></a>";
        thumbnail.parentElement.parentElement.parentElement.append(button);
    }

    function updateThumbnails() {
        var thumbnails = getThumbnails();

        for (let thumbnail of thumbnails) {
            createButtonForThumbnail(thumbnail);
            // Set an attribute to prevent getThumbnails from getting this one again
            thumbnail.setAttribute("embedified", "true");
        }
    }



    //
    // CSS
    //

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

    injectCss(
        ".test { top: 0px; left: 0px; position: absolute; padding: 2px; border: 1px solid black } " +
        ".embedify-button { position: absolute; bottom: 0px; right: 0px; z-index: 1000; opacity: 0.9; font-size: 12px; background: orange; padding: 0.5em; margin: 0.5em; border-radius: 2em; }"
    );
})();

