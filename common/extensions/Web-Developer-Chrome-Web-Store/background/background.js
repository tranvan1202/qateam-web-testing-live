var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Background                                        = WebDeveloper.Background || {};
WebDeveloper.Background.maximumCaptureVisibleTabCallsPerSecond = 1000;

// Gets the content from a URL
WebDeveloper.Background.getURLContent = async function(url, errorMessage)
{
  return new Promise((resolve) =>
  {
    var urlContent = fetch(url);

    // Get the response
    urlContent.then((response) =>
    {
      // If the response is okay
      if(response.ok)
      {
        // Get the response text
        response.text().then((text) =>
        {
          resolve({ content: text, url: url });
        });
      }
      else
      {
        resolve({ content: errorMessage, url: url });
      }
    });
  });
};

// Gets the content from a set of URLs
WebDeveloper.Background.getURLContents = async function(urls, errorMessage, sendResponse)
{
  var promises = [];
  var results  = null;

  // Loop through the urls
  for(var i = 0, l = urls.length; i < l; i++)
  {
    promises.push(WebDeveloper.Background.getURLContent(urls[i], errorMessage));
  }

  results = await Promise.all(promises);

  sendResponse(results);
};

// Gets the visible tab
WebDeveloper.Background.getVisibleTab = function(sendResponse)
{
  chrome.tabs.captureVisibleTab(null, null, function(dataUrl)
  {
    sendResponse({ dataUrl: dataUrl, maximumPerSecond: WebDeveloper.Background.maximumCaptureVisibleTabCallsPerSecond });
  });
};

// Handles any background messages
WebDeveloper.Background.message = function(message, sender, sendResponse)
{
  // If the message type is to get a storage item
  if(message.type == "get-storage-item")
  {
    WebDeveloper.Storage.getItem(message.item, function(item)
    {
      sendResponse({ value: item });
    });
  }
  else if(message.type == "get-url-contents")
  {
    WebDeveloper.Background.getURLContents(message.urls, message.errorMessage, sendResponse);
  }
  else if(message.type == "get-visible-tab")
  {
    WebDeveloper.Background.getVisibleTab(sendResponse);
  }
  else if(message.type == "set-storage-item")
  {
    WebDeveloper.Storage.setItem(message.item, message.value);

    // No response required
    sendResponse({});
  }

  return true;
};

// If the maximum capture visible tab calls per second is set
if(chrome.tabs.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND)
{
  WebDeveloper.Background.maximumCaptureVisibleTabCallsPerSecond = chrome.tabs.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND;
}

chrome.runtime.onMessage.addListener(WebDeveloper.Background.message);

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Locales = WebDeveloper.Locales || {};

// Returns a formatted string from the locale
WebDeveloper.Locales.getFormattedString = function(name, parameters)
{
  return chrome.i18n.getMessage(name, parameters);
};

// Returns a string from the locale
WebDeveloper.Locales.getString = function(name)
{
  return chrome.i18n.getMessage(name);
};

// Sets up the generated locale
WebDeveloper.Locales.setupGeneratedLocale = function()
{
  var locale = {};

  locale.collapseAll   = WebDeveloper.Locales.getString("collapseAll");
  locale.documents     = WebDeveloper.Locales.getString("documents");
  locale.donate        = WebDeveloper.Locales.getString("donate");
  locale.donationCard  = WebDeveloper.Locales.getString("donationCard");
  locale.expandAll     = WebDeveloper.Locales.getString("expandAll");
  locale.extensionName = WebDeveloper.Locales.getString("extensionName");
  locale.from          = WebDeveloper.Locales.getString("from");

  return locale;
};

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Storage           = WebDeveloper.Storage || {};
WebDeveloper.Storage.storageId = "web-developer";

// Clears the features on a tab
WebDeveloper.Storage.clearTabFeatures = function(tabProperties, tabId, updateBadgeText)
{
  // If there are no tab properties, no status or the status is loading
  if(!tabProperties || !tabProperties.status || tabProperties.status == "loading")
  {
    WebDeveloper.Storage.removeItem(tabId);

    // If the badge text should be updated
    if(updateBadgeText)
    {
      WebDeveloper.Storage.updateBadgeText(tabId);
    }
  }
};

// Returns the list of features on a tab
WebDeveloper.Storage.getFeaturesOnTab = function(tabId, callback)
{
  WebDeveloper.Storage.getItem(tabId, function(featuresOnTab)
  {
    // If there are features on the tab
    if(featuresOnTab)
    {
      callback(featuresOnTab.split(","));
    }
    else
    {
      callback(null);
    }
  });
};

// Returns an item
WebDeveloper.Storage.getItem = function(item, callback)
{
  chrome.storage.local.get(item.toString(), function(storageItem)
  {
    // If the item was found
    if(item in storageItem)
    {
      callback(storageItem[item]);
    }
    else
    {
      callback(null);
    }
  });
};

// Returns multiple items
WebDeveloper.Storage.getItems = function(items, callback)
{
  chrome.storage.local.get(items, function(storageItems)
  {
    callback(storageItems);
  });
};

// Returns true if a feature is on a tab
WebDeveloper.Storage.isFeatureOnTab = function(feature, tab, callback)
{
  var isFeatureOnTab = false;
  var tabId          = tab.id;

  WebDeveloper.Storage.getItem(tabId, function(featuresOnTab)
  {
    // If there are features on the tab
    if(featuresOnTab)
    {
      var featuresOnTabArray = featuresOnTab.split(",");

      // Loop through the features on the tab
      for(var i = 0, l = featuresOnTabArray.length; i < l; i++)
      {
        // If the feature is on the tab
        if(featuresOnTabArray[i] == feature)
        {
          isFeatureOnTab = true;
        }
      }
    }

    callback(isFeatureOnTab);
  });
};

// Removes an item
WebDeveloper.Storage.removeItem = function(item)
{
  chrome.storage.local.remove(item.toString());
};

// Sets an item
WebDeveloper.Storage.setItem = function(item, value, callback)
{
  var storageItem = {};

  storageItem[item] = value;

  chrome.storage.local.set(storageItem, callback);
};

// Sets an item if it is not already set
WebDeveloper.Storage.setItemIfNotSet = function(item, value)
{
  WebDeveloper.Storage.getItem(item, function(existingItem)
  {
    // If the item is not already set
    if(!existingItem)
    {
      WebDeveloper.Storage.setItem(item, value);
    }
  });
};

// Handles a tab being activated
WebDeveloper.Storage.tabActivated = function(tabInfo)
{
  WebDeveloper.Storage.updateBadgeText(tabInfo.tabId);
};

// Handles a tab being removed
WebDeveloper.Storage.tabRemoved = function(tabId, properties)
{
  WebDeveloper.Storage.clearTabFeatures(properties, tabId, false);
};

// Handles a tab updating
WebDeveloper.Storage.tabUpdated = function(tabId, properties)
{
  WebDeveloper.Storage.clearTabFeatures(properties, tabId, true);
};

// Toggles a feature on a tab
WebDeveloper.Storage.toggleFeatureOnTab = function(feature, tab, callback)
{
  var featureTabId = tab.id;

  WebDeveloper.Storage.getItem(featureTabId, function(currentFeaturesOnTab)
  {
    var newFeaturesOnTab = null;

    // If there are features on the tab
    if(currentFeaturesOnTab)
    {
      var featureOnTab = false;

      newFeaturesOnTab = currentFeaturesOnTab.split(",");

      // Loop through the features on the tab
      for(var i = 0, l = newFeaturesOnTab.length; i < l; i++)
      {
        // If the feature is on the tab
        if(newFeaturesOnTab[i] == feature)
        {
          featureOnTab = true;

          newFeaturesOnTab.splice(i, 1);
        }
      }

      // If the feature is on the tab
      if(featureOnTab)
      {
        newFeaturesOnTab = newFeaturesOnTab.join(",");
      }
      else
      {
        newFeaturesOnTab = currentFeaturesOnTab + "," + feature;
      }
    }
    else
    {
      newFeaturesOnTab = feature;
    }

    WebDeveloper.Storage.setItem(featureTabId, newFeaturesOnTab, function() { WebDeveloper.Storage.updateBadgeText(featureTabId, callback); });
  });
};

// Updates the badge text for a tab
WebDeveloper.Storage.updateBadgeText = function(featureTabId, callback)
{
  var badgeText    = "";
  var badgeTooltip = "Web Developer";

  WebDeveloper.Storage.getFeaturesOnTab(featureTabId, function(featuresOnTab)
  {
    // If there are features on the tab
    if(featuresOnTab)
    {
      var featureCount       = featuresOnTab.length;
      var featureDescription = "features";

      // If there is only one feature count
      if(featureCount == 1)
      {
        featureDescription = "feature";
      }

      badgeText     = featureCount.toString();
      badgeTooltip += "\n" + badgeText + " active " + featureDescription + " on this tab";
    }

    chrome.action.setBadgeText({ text: badgeText, tabId: featureTabId });
    chrome.action.setTitle({ title: badgeTooltip, tabId: featureTabId });

    // If a callback is set
    if(callback)
    {
      callback();
    }
  });
};

// Updates the overlay icon
WebDeveloper.Storage.updateOverlayIcon = function()
{
  WebDeveloper.Storage.getItem("overlay_icon", function(item)
  {
    // If the overlay icon is not set
    if(!item)
    {
      item = "color";

      WebDeveloper.Storage.setItemIfNotSet("overlay_icon", "color");
    }

    chrome.action.setIcon({ path:
    {
      16: "/img/logos/" + item + "/16.png",
      32: "/img/logos/" + item + "/32.png",
      48: "/img/logos/" + item + "/48.png",
      64: "/img/logos/" + item + "/64.png",
      128: "/img/logos/" + item + "/128.png",
      256: "/img/logos/" + item + "/256.png"
    } });
  });
};

chrome.action.setBadgeBackgroundColor({ color: "#198754" });
WebDeveloper.Storage.updateOverlayIcon();

chrome.tabs.onActivated.addListener(WebDeveloper.Storage.tabActivated);
chrome.tabs.onRemoved.addListener(WebDeveloper.Storage.tabRemoved);
chrome.tabs.onUpdated.addListener(WebDeveloper.Storage.tabUpdated);

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Upgrade = WebDeveloper.Upgrade || {};

// Fixes a content setting
WebDeveloper.Upgrade.fixContentSetting = function(settingType)
{
  chrome.contentSettings[settingType].get({ primaryUrl: "http://*/*" }, function(details)
  {
    // If the setting is currently set to allow
    if(details.setting == "allow")
    {
      chrome.contentSettings[settingType].clear({});
    }
  });
};

// Fixes the content settings
WebDeveloper.Upgrade.fixContentSettings = function()
{
  // If content settings exists
  if(chrome.contentSettings)
  {
    var settingTypes = ["cookies", "images", "javascript", "notifications", "popups"];

    // Loop through the setting types
    for(var i = 0, l = settingTypes.length; i < l; i++)
    {
      WebDeveloper.Upgrade.fixContentSetting(settingTypes[i]);
    }
  }
};

// Migrates any legacy settings
WebDeveloper.Upgrade.migrateLegacySettings = function()
{
  // Try needed as Chrome errors trying to even check access to window
  try
  {
    // If the window and local storage are available
    if(window && window.localStorage)
    {
      // Loop through the legacy settings
      for(var i = 0, l = window.localStorage.length; i < l; i++)
      {
        var key = window.localStorage.key(i);

        WebDeveloper.Storage.setItemIfNotSet(key, window.localStorage.getItem(key));
      }

      // window.localStorage.clear();
    }
  }
  catch(exception)
  {
    // Do nothing
  }
};

// Migrates the tools
WebDeveloper.Upgrade.migrateTools = function()
{
  WebDeveloper.Storage.getItems(["tool_count", "tool_5_description", "tool_5_url", "tool_6_description", "tool_6_url"], function(items)
  {
    // If there are six tools and the last two are Validate Section 508 and Validate WAI
    if(items.tool_count && items.tool_count == 6 &&
      items.tool_5_description && items.tool_5_description == "Validate Section 508" && items.tool_5_url && items.tool_5_url == "http://www.cynthiasays.com/mynewtester/cynthia.exe?rptmode=-1&url1=" &&
      items.tool_6_description && items.tool_6_description == "Validate WAI" && items.tool_6_url && items.tool_6_url == "http://www.cynthiasays.com/mynewtester/cynthia.exe?rptmode=2&url1=")
    {
      WebDeveloper.Storage.removeItem("tool_6_description");
      WebDeveloper.Storage.removeItem("tool_6_url");
      WebDeveloper.Storage.setItem("tool_4_description", WebDeveloper.Locales.getString("tool_4_description"));
      WebDeveloper.Storage.setItem("tool_4_url", "http://wave.webaim.org/report#/");
      WebDeveloper.Storage.setItem("tool_5_description", WebDeveloper.Locales.getString("tool_5_description"));
      WebDeveloper.Storage.setItem("tool_5_url", "http://validator.w3.org/checklink?check=Check&hide_type=all&summary=on&uri=");
      WebDeveloper.Storage.setItem("tool_count", 5);
    }
    else if(items.tool_count && items.tool_count == 7 &&
      items.tool_6_description && items.tool_6_description == "Validate Structured Data" && items.tool_6_url && items.tool_6_url == "https://search.google.com/structured-data/testing-tool/u/0/#url=")
    {
      WebDeveloper.Storage.setItem("tool_6_url", "https://search.google.com/test/rich-results?url=");
    }
  });
};

// Opens the upgrade URL
WebDeveloper.Upgrade.openUpgradeURL = function(version)
{
  chrome.tabs.create({ url: "https://chrispederick.com/work/web-developer/chrome/installed/" + version + "/" });
};

// Removes any deleted settings
WebDeveloper.Upgrade.removeDeletedSettings = function()
{
  WebDeveloper.Storage.removeItem("icon_color");
};

// Sets up the default options
WebDeveloper.Upgrade.setupDefaultOptions = function()
{
  // Advanced
  WebDeveloper.Storage.setItemIfNotSet("populate_email_address", "example@example.com");

  // Colors
  WebDeveloper.Storage.setItemIfNotSet("syntax_highlight_theme", "none");

  // General
  WebDeveloper.Storage.setItemIfNotSet("display_overlay_with", "icons_text");
  WebDeveloper.Storage.setItemIfNotSet("overlay_icon", "color");

  // Resize
  WebDeveloper.Storage.setItemIfNotSet("resize_1_description", WebDeveloper.Locales.getString("resize_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("resize_1_height", 768);
  WebDeveloper.Storage.setItemIfNotSet("resize_1_width", 1024);
  WebDeveloper.Storage.setItemIfNotSet("resize_count", 1);

  // Responsive layouts
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_description", WebDeveloper.Locales.getString("responsive_layout_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_height", 480);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_width", 320);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_description", WebDeveloper.Locales.getString("responsive_layout_2_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_height", 320);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_width", 480);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_description", WebDeveloper.Locales.getString("responsive_layout_3_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_height", 800);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_width", 600);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_description", WebDeveloper.Locales.getString("responsive_layout_4_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_height", 600);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_width", 800);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_description", WebDeveloper.Locales.getString("responsive_layout_5_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_height", 1024);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_width", 768);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_description", WebDeveloper.Locales.getString("responsive_layout_6_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_height", 768);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_width", 1024);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_count", 6);

  // Tools
  WebDeveloper.Storage.setItemIfNotSet("tool_1_description", WebDeveloper.Locales.getString("tool_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_1_url", "http://jigsaw.w3.org/css-validator/validator?profile=css3&warning=0&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_2_description", WebDeveloper.Locales.getString("tool_2_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_2_url", "http://validator.w3.org/feed/check.cgi?url=");
  WebDeveloper.Storage.setItemIfNotSet("tool_3_description", WebDeveloper.Locales.getString("tool_3_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_3_url", "http://validator.w3.org/check?verbose=1&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_4_description", WebDeveloper.Locales.getString("tool_4_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_4_url", "http://wave.webaim.org/report#/");
  WebDeveloper.Storage.setItemIfNotSet("tool_5_description", WebDeveloper.Locales.getString("tool_5_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_5_url", "http://validator.w3.org/checklink?check=Check&hide_type=all&summary=on&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_6_description", WebDeveloper.Locales.getString("tool_6_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_6_url", "https://search.google.com/test/rich-results?url=");
  WebDeveloper.Storage.setItemIfNotSet("tool_7_description", WebDeveloper.Locales.getString("tool_7_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_7_url", "https://www.nslookup.io/dns-records/");
  WebDeveloper.Storage.setItemIfNotSet("tool_count", 7);
};

// Upgrades the extension
WebDeveloper.Upgrade.upgrade = function(details)
{
  // If the extension was installed or updated
  if(details.reason === "install" || details.reason === "update")
  {
    WebDeveloper.Upgrade.openUpgradeURL("3.0.1");

    WebDeveloper.Storage.getItem("version", function(item)
    {
      // If the versions do not match
      if(item != "3.0.1")
      {
        WebDeveloper.Storage.setItem("version", "3.0.1");

        WebDeveloper.Upgrade.fixContentSettings();
        WebDeveloper.Upgrade.migrateLegacySettings();
        WebDeveloper.Upgrade.migrateTools();
        WebDeveloper.Upgrade.removeDeletedSettings();

        // Run on a timeout to make sure all the migration has completed
        setTimeout(function()
        {
          WebDeveloper.Upgrade.setupDefaultOptions();
          WebDeveloper.Storage.updateOverlayIcon();
        }, 100);
      }
    });
  }
};

chrome.runtime.onInstalled.addListener(WebDeveloper.Upgrade.upgrade);
