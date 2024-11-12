'use strict';

let metaCurrentPage;
let SKU;
let ageRestrictionState;
let geoFencingState;
let zipCodePopupState;
let targetOverlay = document.getElementById('target-overlay');
const ageGateStateArray = [];
const newageGateStateArray = [];
const geoFencingStateArray = [];
const zipCodePopupStateArray = [];


chrome.storage.local.get("ageRestriction", function (obj) {
  ageRestrictionState = obj.ageRestriction;
});

chrome.storage.local.get("geoFencing", function (obj) {
  geoFencingState = obj.geoFencing;
});

chrome.storage.local.get("zipCodePopup", function (obj) {
  zipCodePopupState = obj.zipCodePopup;
});

console.log('crawler.js launched');

let sendReadyMessage = function() {chrome.runtime.sendMessage({
  "status": "ready"
})};

let grabSKU = function() {
  if (metaCurrentPage.substring(23) === 'product') {
    let test = document.querySelectorAll('script[type="application/ld+json"]');
    let testChild = test[0].innerHTML; // string of a JSON containing the SKU number
    let cutBeginning = testChild.substring(testChild.indexOf('sku') + 7);
    SKU = cutBeginning.substring(0, cutBeginning.indexOf('"'));
  }
}

let grabMetaTag = function() {
  if (document.head.querySelector("[name~=currentpage][content]") != null) {
    metaCurrentPage = document.head.querySelector("[name~=currentpage][content]").content;
    switch (metaCurrentPage){
      case undefined:
      default:
        console.log('Path retrieved from the source code:');
        console.log(metaCurrentPage);
        sendReadyMessage();
        grabSKU();
    }
  } else {
    console.log('The currentPage tag not found. Another attempt to retrieve it will be made on page load');
    window.addEventListener("load", function load(event){
      window.removeEventListener("load", load, false); //remove listener, no longer needed
      if (document.head.querySelector("[name~=currentpage][content]") != null) {
        metaCurrentPage = document.head.querySelector("[name~=currentpage][content]").content;
        sendReadyMessage();
        grabSKU();
      } else {
        console.log('Couldn\'t establish the currentPage tag value');
        clearInterval(fn5min);
      }
    },false);
  };
  // return metaCurrentPage;
}

grabMetaTag();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.greeting) {
      case 'mordo':
        grabMetaTag();
        sendResponse(metaCurrentPage);
        break;
      case 'sku':
        sendResponse(SKU);
    }
    return true;
  }
);

let removeAgeRestriction = function(){
  let agegate = document.getElementById('nbw-agegate');
  let newagegate = document.getElementById('soft-age-gate');
  let body = document.getElementsByClassName('wrapper nbw');
  let navbar = body[0].getElementsByTagName('header')[0];
  let content = body[0].getElementsByTagName('main')[0];
  if (agegate != null) {
    switch (window.getComputedStyle(agegate).getPropertyValue('display')) {
      case 'block':
        agegate.style.display = 'none';
        ageGateStateArray[0] = 1;
        break
    };
    switch (window.getComputedStyle(navbar).getPropertyValue('opacity')) {
      case '0':
        navbar.style.opacity = '1';
        ageGateStateArray[1] = 1;
        break
    };
    switch (window.getComputedStyle(content).getPropertyValue('opacity')) {
      case '0':
        content.style.opacity = '1';
        ageGateStateArray[2] = 1;
        break
    };
    switch (window.getComputedStyle(document.documentElement).getPropertyValue('overflow')) {
      case 'hidden':
        document.documentElement.style.overflow = 'scroll';
        ageGateStateArray[3] = 1;
        break
    };
  }
  if (ageGateStateArray.reduce((partialSum, a) => partialSum + a, 0) == 4) { // check if the old age gate was removed completely
    ageGateStateArray.splice(0, 4, 'The age restriction has been hidden by the plugin.')
    console.log(ageGateStateArray[0]);
  }
  if (newagegate != null) {
    switch (window.getComputedStyle(newagegate).getPropertyValue('visibility')) {
      case 'visible':
        newagegate.style.visibility = 'hidden';
        newageGateStateArray[0] = 1;
        break
    };
    switch (document.documentElement.classList.value == 'overflow-hidden') {
      case true:
        document.documentElement.classList.remove('overflow-hidden');
        newageGateStateArray[1] = 1;
        break
    };
  }
  if (newageGateStateArray.reduce((partialSum, a) => partialSum + a, 0) == 2) { // check if the new age gate was removed completely
    newageGateStateArray.splice(0, 2, 'The new age restriction has been hidden by the plugin.')
    console.log(newageGateStateArray[0]);
  }
};

let removeGeoFencing = function() {
  let geoFence = document.getElementById('geo-fencing');
  if (geoFence != null) {
    switch (window.getComputedStyle(geoFence).getPropertyValue('display')) {
      case 'block':
        geoFence.style.display = 'none';
        geoFencingStateArray[0] = 1;
        break
    };
  }
  if (geoFencingStateArray[0] == 1) { // check if the geo fencing was removed completely
    geoFencingStateArray[1] = 'The geo fencing has been hidden by the plugin.'
    console.log(geoFencingStateArray[1]);
  }
};

let removezipCodePopup = function() {
  let zipCodePopup = document.getElementById('address-wall-wrapper');
  if (zipCodePopup != null) {
    switch (window.getComputedStyle(zipCodePopup).getPropertyValue('display')) {
      case 'block':
        zipCodePopup.style.display = 'none';
        zipCodePopupStateArray[0] = 1;
        break
    };
    switch (window.getComputedStyle(document.getElementsByClassName('modal-backdrop')[0]).getPropertyValue('visibility')) {
      case 'visible':
        document.getElementsByClassName('modal-backdrop')[0].style.visibility = 'hidden';
        zipCodePopupStateArray[1] = 1;
        break
    };
    switch (window.getComputedStyle(document.documentElement).getPropertyValue('overflow')) {
      case 'hidden':
        document.documentElement.style.overflow = 'scroll';
        zipCodePopupStateArray[2] = 1;
        break
    };
  }
  if (zipCodePopupStateArray.reduce((partialSum, a) => partialSum + a, 0) == 3) { // check if the new age gate was removed completely
    zipCodePopupStateArray.splice(0, 3, 'The new age restriction has been hidden by the plugin.')
    console.log(zipCodePopupStateArray[0]);
  }
};

let runCheckedFunctions = function() {
  // removed the requirement to run the code when the age gate is visible (this removes the white page in author)
  // if (ageRestrictionState == 'hidden' && document.getElementById('nbw-agegate').style.display != 'none') {}
  if (ageRestrictionState == 'hidden' || document.getElementById('wm-ipp-base') != null) {
    removeAgeRestriction();
  };
  if (geoFencingState == 'hidden') {
    removeGeoFencing();
  };
  if (zipCodePopupState == 'hidden') {
    removezipCodePopup();
  };
  if (targetOverlay != null) {
    if (window.getComputedStyle(targetOverlay).getPropertyValue('display') == 'block') {
      targetOverlay.style.opacity = '0';
    }
  }
}

// runs the disable geo fencing and age gate every 0,2 of a second
let timer = function(){setInterval(runCheckedFunctions, 200)};
timer();

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  clearInterval(timer);
},false);

let fn5min = function() {
  grabMetaTag();
}
setInterval(fn5min, 300000); // run the grabMetaTag function every 5 minutes to keep the content script working in the background.

// once 404 with no '.html' in the URL has been detected, shorten the URL by removing '/' and send a message to the background.js to open it once again.
if(metaCurrentPage.includes('404') && window.location.href.slice(-1) == '/') {
  let currentURL      = window.location.href;
  let shortenedURL	  =	currentURL.substring(0, currentURL.length - 1)
  chrome.runtime.sendMessage({
    greeting: 'PleaseAddHTMLThamks',
    URL: shortenedURL,
  });
}

// send a message to the background.js to execute a redirect once a maintenance page has been identified
if(window.location.href.indexOf('maintenance.html') > 0) {
  let currentURL      = window.location.href;
  let indexStart 		  =	currentURL.indexOf('www') + 4;
  let indexEnd 			  =	currentURL.indexOf('.com');
  let maintEnv				=	currentURL.substring(indexStart, indexEnd);
  chrome.runtime.sendMessage(maintEnv);
}