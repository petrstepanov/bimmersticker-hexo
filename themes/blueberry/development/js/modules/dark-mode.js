// Stolen from here
// https://stackoverflow.com/a/75065536/885400

function _updateTheme() {
    const colorMode = window.matchMedia("(prefers-color-scheme: dark)").matches ?
        "dark" :
        "light";
    document.querySelector("html").setAttribute("data-bs-theme", colorMode);
    }

function _bindEvents(){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _updateTheme)
}

function init(){
    _updateTheme();
    _bindEvents();
}

exports.init = init;