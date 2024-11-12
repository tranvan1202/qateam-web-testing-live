'use strict';

// variables

let btnFinalComplete = document.getElementById('cheilPlugin-logo');

let btnSites = document.getElementById('cheilPluginSection-btnSites');
let btnAssets = document.getElementById('cheilPluginSection-btnAssets');
let btnEditor = document.getElementById('cheilPluginSection-btnEditor');
let btnProperties = document.getElementById('cheilPluginSection-btnProperties');
let btnPreview = document.getElementById('cheilPluginSection-btnPreview');
let btnQA = document.getElementById('cheilPluginSection-btnQA');
let btnStg = document.getElementById('cheilPluginSection-btnStg');
let btnLive = document.getElementById('cheilPluginSection-btnLive');
let btnGr = document.getElementById('cheilPluginSection-btnGr');
let btnFencing = document.getElementById('cheilPluginSection-btnFencing');
let btnTest = document.getElementById('cheilPluginSection-btnTest');
let btnDrupalLogin = document.getElementById('cheilPluginSection-btnDrupalLogin');
let btnRefresh = document.getElementById('refreshButton');
let btnInputToggle = document.getElementById('inputToTextarea');
let btnSidepanelToggle = document.getElementById('sidepanelToggleButton');

let body = document.getElementById('cheilPopup');
let camels = document.getElementsByClassName('cameleon');
let topPartOfButtonColumn = document.getElementById('topButton');
let SKUInput = document.getElementById('SKUInputArea');
let textareaDOMElement = null;
let sidebarHidden = false;

let inputPathSites = document.getElementById('cheilPluginSection-pathSites');
let inputPathAssets = document.getElementById('cheilPluginSection-pathAssets');

// let selectAEM = document.getElementById('AEMSelectorCheckbox');
let AEMselectors = document.getElementsByClassName("switch");
let AEMarray = [...AEMselectors];
let currentAEM = new Array(2);
currentAEM[0] = 'author.pp.iqos.com';
let disableAgeVerificationCheckbox = document.getElementById('ageRestrictionCheckbox');
let ageRestrictionHidden = false;
let disableGeoFencingCheckbox = document.getElementById('geoFencingCheckbox');
let geoFencingHidden = false;
let disablezipCodePopupCheckbox = document.getElementById('zipCodePopupCheckbox');
let zipCodePopupHidden = false;

let crawlerFunctionStatus = false;
let pathRetrieveStatus = false;
let currentURL = '';
let isTextareaUnfolded = false;
let path = [];
let SKU;
let json;

// GENERIC FUNCTIONS
function tabsQuery(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		callback(tabs);
	});
}

function executeScript(tabs, code) {
	chrome.scripting.executeScript({
		target: {tabId: tabs.id},
		func: openWindow,
		args: [code]
	});
}

function openWindow(code) {
	window.open(code);
}

function executeScriptSelf(tabs, code) {
	chrome.scripting.executeScript({
		target: {tabId: tabs.id},
		func: openWindowSelf,
		args: [code]
	});
}

function openWindowSelf(code) {
	window.open(code, '_self');
}

function togglePageNavigateSection() {
	body.classList.toggle('unfold');
	btnSidepanelToggle.classList.toggle('active');
}

function unfoldPageNavigateSection() {
	if (sidebarHidden == true) {
		body.classList.add('unfold');
		btnSidepanelToggle.classList.add('active');
	}
}

// Getting the sidebar visibility option from the option page
chrome.storage.local.get(['sidebar'], function(items) {
	sidebarHidden = items.sidebar;
	if (sidebarHidden == false) {
		btnSidepanelToggle.remove();
		body.classList.add('alwaysVisible');
		body.classList.remove('animated');
	}
});

// function that removes the input field for the sites and adds a textarea instead:
function toggleInputFieldToTextarea() {
	let SitesInputValue = [];
	SitesInputValue = grabPathFromTextarea(isTextareaUnfolded);
	switch (isTextareaUnfolded) {
		case false:
			inputPathSites.remove();
			const textarea = document.createElement('textarea');
			textarea.setAttribute('id', 'cheilPluginSection-btnSitesTextarea');
			textarea.setAttribute('placeholder', '/content/pmisite/de/en/home' + '\n' + 'Add multiple site paths to open them all at once.');
			textarea.setAttribute('maxlength', '4000');
			textarea.setAttribute('wrap', 'off');
			if (SitesInputValue[0].length > 0) {	// add content existing before in the input field
				textarea.value += SitesInputValue[0];
			}
			btnSites.before(textarea);
			textareaDOMElement = document.getElementById('cheilPluginSection-btnSitesTextarea');
			btnInputToggle.setAttribute('title', 'Fold the input area');
			isTextareaUnfolded = true;
			break;
		case true:
			textareaDOMElement.remove();
			const inputfield = document.createElement('input');
			inputfield.setAttribute('type', 'text');
			inputfield.setAttribute('id', 'cheilPluginSection-pathSites');
			inputfield.setAttribute('placeholder', '/content/pmisite/de/en/home');
			if (SitesInputValue[0].length > 0) {	// add content existing before in the input field
				inputfield.value += SitesInputValue[0];
			}
			btnSites.before(inputfield);
			inputPathSites = document.getElementById('cheilPluginSection-pathSites');
			btnInputToggle.setAttribute('title', 'Unold the input area');
			isTextareaUnfolded = false;
			break;
		default:
			console.log('bajo jajo');
	}
}

// Grab content from the Sites textarea or input field and convert it into a path array
function grabPathFromTextarea(Unfolded) {
	let data = [];
	switch (Unfolded) {
		case true:
			let sentencesToLabeledData = textareaDOMElement.value;
			data = sentencesToLabeledData.split('\n');
			break;
		case false:
			data[0] = inputPathSites.value;
			break;
		default:
			console.log('ja ci dam bajo jajo. Na Inowrocławskiej jesteś');
	}
	return data;
}

// Sites AEM selector script. Changes current aem value after selecting it and prints it in console
AEMarray.forEach((element, index) => {
  element.addEventListener("click", () => {
    // element.style.visibility = "visible";
    element.classList.add('active');
    if (index == 0) {
			currentAEM = ['author.pp.iqos.com', 0];
    } else if (index == 1) {
			currentAEM = ['author.stg.iqos.com', 1];
    } else {
			currentAEM = ['author.iqos.com', 2];
    }
		for (let pack of camels) { // changing collors for each element camels array, which are all colored buttons
			switch (index) {
				case 0: // if the first button in the AEM version switch was clicked
					if (pack.classList.contains('violet')) {
						pack.classList.toggle('violet');
					} else if (pack.classList.contains('red')) {
						pack.classList.toggle('red');
					};
					break;
				case 1: // if the first button in the AEM version switch was clicked
					if (pack.classList.contains('red')) {
						pack.classList.toggle('red');
						pack.classList.add('violet');
					} else if (pack.classList.contains('violet')) {
						break;
					} else {
						pack.classList.add('violet');
					};
					break;
				case 2: // if the first button in the AEM version switch was clicked
					if (pack.classList.contains('violet')) {
						pack.classList.toggle('violet');
						pack.classList.add('red');
					} else if (pack.classList.contains('red')) {
						break;
					} else {
						pack.classList.add('red');
					}
					break;
			}
		}
    AEMarray
      .filter(function (item) {
        return item != element;
      })
      .forEach((item) => {
				if (item.classList.contains('active')) {
					item.classList.toggle('active');
				}
        // item.style.visibility = "hidden";
      });
  });
});

function AEMcheck(url) {
	switch (true) {
		case url.indexOf('pp.iqos.com') > 0:
			AEMarray[0].click()
			console.log('Current environment: '+currentAEM[0]);
			break;
		case url.indexOf('stg.iqos.com') > 0:
			AEMarray[1].click()
			currentAEM = ['author.stg.iqos.com', 1];
			console.log('Current environment: '+currentAEM[0]);
			break;
		case url.indexOf('iqos.com') > 0 || url.indexOf('iqosclub.com') > 0:
			AEMarray[2].click()
			currentAEM = ['author.iqos.com', 2];
			console.log('Current environment: '+currentAEM[0]);
			break;
		case url.indexOf('pp.veev-vape.com') > 0:
			AEMarray[0].click()
			console.log('Current environment: '+currentAEM[0]);
			break;
		case url.indexOf('stg.veev-vape.com') > 0:
			AEMarray[1].click()
			currentAEM = ['author.stg.iqos.com', 1];
			console.log('Current environment: '+currentAEM[0]);
			break;
		case url.indexOf('veev-vape.com') > 0:
			AEMarray[2].click()
			currentAEM = ['author.iqos.com', 2];
			console.log('Current environment: '+currentAEM[0]);
			break;
		default:
			AEMarray[0].click()
			console.log('Couldn\'t establish AEM version of the current page.\n');
	}
}

// function that runs the checkbox for disabling the age restriction overlay
disableAgeVerificationCheckbox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    chrome.storage.local.set({ageRestriction: 'hidden'});
		chrome.tabs.reload();
  } else {
    chrome.storage.local.set({ageRestriction: 'rendered'});
  }
});

chrome.storage.local.get("ageRestriction", function (objAge) {
  ageRestrictionHidden = objAge;
	if (ageRestrictionHidden.ageRestriction == 'hidden') {
		disableAgeVerificationCheckbox.checked = true;
	}
});

// function that runs the checkbox for disabling the geo fencing overlay
disableGeoFencingCheckbox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    chrome.storage.local.set({geoFencing: 'hidden'});
		chrome.tabs.reload();
  } else {
    chrome.storage.local.set({geoFencing: 'rendered'});
  }
});

chrome.storage.local.get("geoFencing", function (objGeo) {
  geoFencingHidden = objGeo;
	if (geoFencingHidden.geoFencing == 'hidden') {
		disableGeoFencingCheckbox.checked = true;
	}
});

// function that runs the checkbox for disabling the zip code overlay
disablezipCodePopupCheckbox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    chrome.storage.local.set({zipCodePopup: 'hidden'});
		chrome.tabs.reload();
  } else {
    chrome.storage.local.set({zipCodePopup: 'rendered'});
  }
});

chrome.storage.local.get("zipCodePopup", function (objGeo) {
  zipCodePopupHidden = objGeo;
	if (zipCodePopupHidden.zipCodePopup == 'hidden') {
		disablezipCodePopupCheckbox.checked = true;
	}
});

// Retrieving current URL from the page code (current meta tag)
function retrievePath(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "mordo"}, function(response) {
			callback(response);
		});
	});
}

// Retrieving product SKU from the page code
function retrieveSKU(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "sku"}, function(response) {
			callback(response);
		});
	});
}

// Display retrieved SKU in the plugin popup
function DisplaySKU() {
	SKUInput.removeAttribute('disabled');
	SKUInput.value += SKU;
}

function crawlerStatus(callback) {
	chrome.runtime.sendMessage({greeting: "crawlerStatus"}, function(response) {
		callback(response);
	});
}

// convert button type, path and currentAEM to JSON object
function stringifyButtonPathAndAEM(button, paths, aem) {
	let json = {
		button: button,
		path: paths,
		aem: aem
	};
	return json;
}

// Current URL grabber scripts that run after page loads or upon clicking refresh button. (Listener and button scripts are below)
function init(){
	let indexStart, indexEnd, startString;
	tabsQuery(function(tabs) {
		currentURL = tabs[0].url;

		AEMcheck(currentURL);

		switch (true) {
			case currentURL.indexOf('editor.html') > 0:
				startString			=	'editor.html';
				indexStart 			=	currentURL.indexOf(startString) + startString.length;
				indexEnd 				=	currentURL.split('.html', 2).join('.html').length; // removes the second .html and everything that stands after it
				path[0]					=	currentURL.substring(indexStart, indexEnd);
				console.log('Retrieved path from the URL. Case: \'editor.html\'.');
				break;
			case currentURL.indexOf('sites.html') > 0:
				startString			=	'sites.html';
				indexStart 			=	currentURL.indexOf(startString) + startString.length;
				indexEnd 				=	currentURL.length;
				path[0]					=	currentURL.substring(indexStart, indexEnd);
				console.log('Retrieved path from the URL. Case: \'sites.html\'.');
				break;
			case currentURL.indexOf('properties.html?item=') > 0:
				startString			=	'item=';
				indexStart 			=	currentURL.indexOf(startString) + startString.length;
				indexEnd 				=	currentURL.length;
				path[0]					=	currentURL.substring(indexStart, indexEnd);
				console.log('Retrieved path from the URL. Case: \'properties.html\'.');
		}

		switch (path[0]) { // retrieve path from page's code if couldn't get one from URL
			case undefined:
				crawlerStatus(function(crawlerLaunched){
					switch (crawlerLaunched) {
						case true:
							retrievePath(function(response){
								path[0] = response;
								switch (path[0] !== undefined) {
									case true:
										switch (path[0].includes('404')) { // Case of retrieving 404 url from current page meta data. Path will be set based on current URL instead.
											case true:
												switch (currentURL.includes('/content/pmisite')) {
													case true:
														startString = '/content/pmisite';
														break;
													default:
													startString			=	'iqos.com';
												}
												indexStart 			=	currentURL.indexOf(startString) + startString.length;
												indexEnd 				=	currentURL.indexOf('.html');
												path[0] 						=	'/content/pmisite' + currentURL.substring(indexStart, indexEnd);
												console.log('404 page found. Path retrieved from the URL:');
												break;
											default:
												console.log('Found the page\'s relavite path:');
										}
										inputPathSites.value = path[0];
										unfoldPageNavigateSection();
										pathRetrieveStatus = true;
										console.log(path[0]);
										if (path[0].substring(23) === 'product') {
											retrieveSKU(function(response){
												SKU = response;
												DisplaySKU();
											});
										}
										break;
									default:
										console.log('Something went wrong retrieving path from meta data.');
								}
							});
							break;
						// setting a listener to wait till the page loads for the init URL grabber script to run
						default:
							chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
								if (changeInfo.status == 'complete') { 
									switch (pathRetrieveStatus) { // launch only when couldn't retrieve path from source code
										case true:
											console.log('Current path: '+path[0]);
											break;
										case false:
											init();
											console.log('The init function relaunched on page load.');
									}
								}
							});
					}
				});
				break;
			default:
				inputPathSites.value = path[0];
				unfoldPageNavigateSection();
				pathRetrieveStatus = true;
		}
	});
}

init();

// Sites url and button
btnSites.onclick = function() { // opens sites after pressing enter key inside the input field
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('sites', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

inputPathSites.onkeydown = function(event) { // opens sites after pressing "Sites" button
	if (event.keyCode == 13) {
		path = grabPathFromTextarea(isTextareaUnfolded);
		json = stringifyButtonPathAndAEM('sites', path, currentAEM[0]);
		chrome.runtime.sendMessage(json);
	}
};

//open assets page
function openAssetsAEM() {
	tabsQuery(function(tabs) {
		if (inputPathAssets.value !== '') {
			executeScript(tabs[0], 'https://'+currentAEM[0]+'/assets.html'+inputPathAssets.value);
		} else {
			executeScript(tabs[0], 'https://'+currentAEM[0]+'/assets.html/content/dam');
		}
	});
}

// Assets url and button onclick funtions
btnAssets.onclick = function() { // opens Asstes after pressing enter key inside the input field
	openAssetsAEM();
};

inputPathAssets.onkeydown = function(event) { // opens Asstes after pressing "Asstes" button
	if (event.keyCode == 13) {
		openAssetsAEM();
	}
};

// AEM Shortcut buttons
btnEditor.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('editor', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

btnProperties.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('properties', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

btnPreview.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('preview', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

btnQA.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('qa', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

btnStg.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('stg', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

btnLive.onclick = function() {
	path = grabPathFromTextarea(isTextareaUnfolded);
	json = stringifyButtonPathAndAEM('live', path, currentAEM[0]);
	chrome.runtime.sendMessage(json);
};

// Universal buttons
btnGr.onclick = function() {
	tabsQuery(function(tabs) {
		let questionmark = currentURL.indexOf('?');
		if (questionmark > 0) {
			currentURL = currentURL.substring(0, questionmark);
		}
		executeScriptSelf(tabs[0], currentURL+'?gr=false');
	});
};

btnFencing.onclick = function() {
	tabsQuery(function(tabs) {
		let questionmark = currentURL.indexOf('?');
		if (questionmark > 0) {
			currentURL = currentURL.substring(0, questionmark);
		}
		executeScriptSelf(tabs[0], currentURL+'?no_fencing=true');
	});
};

btnTest.onclick = function() {
	tabsQuery(function(tabs) {
		let questionmark = currentURL.indexOf('?');
		if (questionmark > 0) {
			currentURL = currentURL.substring(0, questionmark);
		}
		executeScriptSelf(tabs[0], currentURL+'?test');
	});
};

btnDrupalLogin.onclick = function() {
	tabsQuery(function(tabs) {
		let acsitefactoryPos = currentURL.indexOf('acsitefactory.com');
		if (acsitefactoryPos > 0) {
			currentURL = currentURL.substring(0, acsitefactoryPos+17);
		}
		executeScriptSelf(tabs[0], currentURL+'/saml/login');
	});
};

// force the init function and animate the refresh button
btnRefresh.onclick = function() {
	btnRefresh.classList.toggle("rotate");
	btnRefresh.disabled = true;
	setTimeout(() => {
		btnRefresh.classList.toggle("rotate");
		btnRefresh.disabled = false;
		console.log('New path: ' + path[0]);
	}, 1000);
	console.log('Forced init function by clicking the refresh button.');
	path[0] = undefined;
	init();
	if (isTextareaUnfolded == true) {
		toggleInputFieldToTextarea();
		btnInputToggle.classList.toggle("rotate");
		btnInputToggle.disabled = true;
		setTimeout(() => btnInputToggle.disabled = false, 400);
	}
};

btnSidepanelToggle.onclick = function() {
	togglePageNavigateSection();
	btnSidepanelToggle.disabled = true;
	setTimeout(() => btnSidepanelToggle.disabled = false, 400);
};

// add onClick listener to the input field button
btnInputToggle.onclick = function() {
	toggleInputFieldToTextarea();
	btnInputToggle.classList.toggle("rotate");
	btnInputToggle.disabled = true;
	setTimeout(() => btnInputToggle.disabled = false, 400);
};