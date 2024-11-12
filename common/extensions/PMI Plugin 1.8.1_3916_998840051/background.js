// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// chrome.alarms.create({ periodInMinutes: 4.9 })
// chrome.alarms.onAlarm.addListener(() => {
//   console.log('log for debug');
// });

let index = 0;
let crawlerlaunched = false;
let currentAEM = new Array(2);

chrome.runtime.onMessage.addListener(
  function(crawler) {
    if (crawler.status == 'ready') {
      crawlerlaunched = true;
    }
    return true;
  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == 'crawlerStatus'){
      sendResponse(crawlerlaunched);
    }
    return true;
  }
);

chrome.runtime.onMessage.addListener(function(json) {
  switch (json.button) {
    case 'sites':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          executeScript(tabs[0], 'https://'+json.aem+'/sites.html'+json.path[index]);
        }
      });
      break;
    case 'editor':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          executeScript(tabs[0], 'https://'+json.aem+'/editor.html'+json.path[index]+'.html');
        }
      });
      break;
    case 'properties':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          executeScript(tabs[0], 'https://'+json.aem+'/mnt/overlay/wcm/core/content/sites/properties.html?item='+json.path[index]);
        }
      });
      break;
    case 'preview':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          executeScript(tabs[0], 'https://'+json.aem+json.path[index]+'.html?wcmmode=disabled');
        }
      });
      break;
    case 'qa':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          switch (true) {
            case json.path[index].includes('veevsite'):
              executeScript(tabs[0], 'https://www.pp.veev-vape.com'+json.path[index]);
              break;
            case json.path[index].includes('pmiclub/de'):
              executeScript(tabs[0], 'https://club.pp.iqos.com'+json.path[index]);
              break;
            default: executeScript(tabs[0], 'https://www.pp.iqos.com'+json.path[index]);
          }
        }
      });
      break;
    case 'stg':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          switch (true) {
            case json.path[index].includes('veevsite'):
              executeScript(tabs[0], 'https://www.stg.veev-vape.com'+json.path[index]);
              break;
            case json.path[index].includes('pmiclub/de'):
              executeScript(tabs[0], 'https://club.stg.iqos.com'+json.path[index]);
              break;
            default: executeScript(tabs[0], 'https://www.stg.iqos.com'+json.path[index]);
          }
        }
      });
      break;
    case 'live':
      tabsQuery(function(tabs) {
        for (index = 0; index < json.path.length; index++) {
          switch (true) {
            case json.path[index].includes('veevsite'):
              executeScript(tabs[0], 'https://www.veev-vape.com'+json.path[index]);
              break;
            case json.path[index].includes('pmiclub/de'):
              executeScript(tabs[0], 'https://www.iqosclub.com'+json.path[index]);
              break;
            default: executeScript(tabs[0], 'https://www.iqos.com'+json.path[index]);
          }
        }
      });
  }
});

function retrievePath(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "mordo"}, function(response) {
			callback(response);
		});
	});
}

// redirecting from the maintenance to the corresponding authorize page
chrome.runtime.onMessage.addListener(function(maintenanceEnv) {
  switch (maintenanceEnv) {
    case 'pp.iqos':
      tabsQuery(function(tabs) {
        executeScriptSelf(tabs[0], 'https://www.pp.iqos.com/cgi-bin/authorize.cgi');
      });
      break
    case 'stg.iqos':
      tabsQuery(function(tabs) {
        executeScriptSelf(tabs[0], 'https://www.stg.iqos.com/cgi-bin/authorize.cgi');
      });
      break
    case 'pp.veev':
      tabsQuery(function(tabs) {
        executeScriptSelf(tabs[0], 'https://www.pp.veev-vape.com/edgeauth');
      });
      break
    case 'stg.veev':
      tabsQuery(function(tabs) {
        executeScriptSelf(tabs[0], 'https://www.stg.iqos.com/cgi-bin/authorize.cgi');
      });
  }
});

chrome.runtime.onMessage.addListener(function(fix404) {
  if (fix404.greeting == 'PleaseAddHTMLThamks') {
    tabsQuery(function(tabs) {
      executeScriptSelf(tabs[0], fix404.URL + '.html');
    });
  }
});

// I have no idea why this was here :))))) :
// chrome.runtime.onInstalled.addListener(function() {

//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([{
//       conditions: [new chrome.declarativeContent.PageStateMatcher({
//         pageUrl: {},
//       })],
//       actions: [new chrome.declarativeContent.ShowPageAction()]
//     }]);
//   });
// });

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.url === "https://") {
        chrome.tabs.remove(tabId);
        crawlerlaunched = false;
        chrome.runtime.reload();
    }
});

chrome.storage.local.set({ 
  sidebar: false
});

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