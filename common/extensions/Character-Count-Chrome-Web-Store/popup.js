'use strict';

function countParagraphs(text) {
    var amount = 0;
    if (text == "") {
        amount = 0;
    } else if (text.substring(text.length - 1, text.length) == "\n") {
        amount = text.replace(/\n+|\n+$|(\n)+/g, "#").split("#").length - 1;
    } else {
        amount = text.replace(/\n+|\n+$|(\n)+/g, "#").split("#").length;
    }
    if (amount > 1) {
        return amount;
    } else {
        return amount;
    }
}
function countSentences(text) {
    var amount = 0;
    if (text == "") {
        amount = 0;
    } else if ((text.substring(text.length - 1, text.length) == "?") || (text.substring(text.length - 1, text.length) == "!") || (text.substring(text.length - 1, text.length) == ".")) {
        amount = text.replace(/(\.|!|\?)+|(\.|!|\?)+$|(\.|!|\?)+/g, "#").split("#").length - 1;
    } else {
        amount = text.replace(/(\.|!|\?)+|(\.|!|\?)+$|(\.|!|\?)+/g, "#").split("#").length;
    }
    if (amount > 1) {
        return amount;
    } else {
        return amount;
    }
}
function countWords(text) {
    if (text.length == 0) {
        return 0;
    }
    return text.trim().replace(/\s+/gi, ' ').split(' ').length;
}
function countCharactersWSpace(text) {
    if (text.replace("\n").length == 0) {
        return text.replace(/\n/g, "").length;
    } else {
        return text.replace(/\n/g, "").length;
    }
}
function countCharacters(text) {
    if (text.split(" ").length - 1 <= 1) {
        return text.split(" ").length - 1;
    } else {
        return text.split(" ").length - 1;
    }
}

chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
}, function(selection) {
    document.getElementById('chart-count').innerHTML = countCharactersWSpace( selection[0] );
    document.getElementById('chart-words').innerHTML = countWords( selection[0] );
    document.getElementById('chart-sentences').innerHTML = countSentences( selection[0] );
    document.getElementById('chart-paragraphs').innerHTML = countParagraphs( selection[0] );
    document.getElementById('chart-whitespace').innerHTML = countCharacters( selection[0] );
});