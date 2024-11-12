var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Cookies = WebDeveloper.Overlay.Cookies || {};

// Adds a cookie
WebDeveloper.Overlay.Cookies.addCookie = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-location-details" }, function(response)
      {
        WebDeveloper.Overlay.Cookies.resetAddDialog(response);
        WebDeveloper.Overlay.closeConfirmation();
        WebDeveloper.Overlay.closeNotification();
        document.querySelector(".tab-content").classList.add("d-none");
        document.getElementById("add-cookie-dialog").classList.remove("d-none");
        document.getElementById("add-cookie-name").focus();
      });
    }
  });
};

// Handles a key press when adding a cookie
WebDeveloper.Overlay.Cookies.addCookieKeyPress = function(event)
{
  // If the enter key was pressed
  if(event.keyCode == 13)
  {
    WebDeveloper.Overlay.Cookies.submitAddCookie();
  }
};

// Cancels adding a cookie
WebDeveloper.Overlay.Cookies.cancelAddCookie = function()
{
  document.getElementById("add-cookie-dialog").classList.add("d-none");
  document.querySelector(".tab-content").classList.remove("d-none");
};

// Handles the cookie session setting being changed
WebDeveloper.Overlay.Cookies.changeSession = function()
{
  var addCookieExpires = document.getElementById("add-cookie-expires");

  // If the session setting is checked
  if(document.getElementById("add-cookie-session").checked)
  {
    addCookieExpires.disabled = true;
    addCookieExpires.value    = "";

    addCookieExpires.setAttribute("placeholder", "");
  }
  else
  {
    addCookieExpires.disabled = false;
    addCookieExpires.value    = WebDeveloper.Cookies.getDateTomorrow();

    addCookieExpires.setAttribute("placeholder", WebDeveloper.Locales.getString("expiresPlaceholder"));
  }
};

// Converts an array of cookies
WebDeveloper.Overlay.Cookies.convertCookies = function(cookies)
{
  var convertedCookies = [];
  var cookie           = null;
  var cookieObject     = null;

  // Loop through the cookies
  for(var i = 0, l = cookies.length; i < l; i++)
  {
    cookie       = {};
    cookieObject = cookies[i];

    cookie.expires  = cookieObject.expirationDate;
    cookie.host     = cookieObject.domain;
    cookie.httpOnly = cookieObject.httpOnly;
    cookie.name     = cookieObject.name;
    cookie.path     = cookieObject.path;
    cookie.secure   = cookieObject.secure;
    cookie.session  = cookieObject.session;
    cookie.value    = cookieObject.value;

    convertedCookies.push(cookie);
  }

  return convertedCookies;
};

// Deletes all the cookies for the current domain
WebDeveloper.Overlay.Cookies.deleteDomainCookies = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { allCookies: WebDeveloper.Overlay.Cookies.convertCookies(allCookies), type: "get-domain-cookies" }, function(cookies)
        {
          WebDeveloper.Cookies.deleteDomainCookies(cookies);
        });
      });
    }
  });
};

// Deletes all the cookies for the current path
WebDeveloper.Overlay.Cookies.deletePathCookies = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { allCookies: WebDeveloper.Overlay.Cookies.convertCookies(allCookies), type: "get-path-cookies" }, function(cookies)
        {
          WebDeveloper.Cookies.deletePathCookies(cookies);
        });
      });
    }
  });
};

// Deletes all session cookies
WebDeveloper.Overlay.Cookies.deleteSessionCookies = function()
{
  chrome.cookies.getAll({}, function(allCookies)
  {
    WebDeveloper.Cookies.deleteSessionCookies(WebDeveloper.Overlay.Cookies.convertCookies(allCookies));
  });
};

// Returns the locale for the view cookie information feature
WebDeveloper.Overlay.Cookies.getViewCookieInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.atEndOfSession             = WebDeveloper.Locales.getString("atEndOfSession");
  locale.cancel                     = WebDeveloper.Locales.getString("cancel");
  locale.cannotEditHTTPOnlyCookies  = WebDeveloper.Locales.getString("cannotEditHTTPOnlyCookies");
  locale.cannotEditLocalhostCookies = WebDeveloper.Locales.getString("cannotEditLocalhostCookies");
  locale.cookie                     = WebDeveloper.Locales.getString("cookie");
  locale.cookieDeleted              = WebDeveloper.Locales.getString("cookieDeleted");
  locale.cookieEdited               = WebDeveloper.Locales.getString("cookieEdited");
  locale.cookieInformation          = WebDeveloper.Locales.getString("cookieInformation");
  locale.cookies                    = WebDeveloper.Locales.getString("cookies");
  locale.deleteConfirmation         = WebDeveloper.Locales.getString("deleteConfirmation");
  locale.deleteCookie               = WebDeveloper.Locales.getString("deleteCookie");
  locale.deleteCookieConfirmation   = WebDeveloper.Locales.getString("deleteCookieConfirmation");
  locale.deleteLabel                = WebDeveloper.Locales.getString("delete");
  locale.edit                       = WebDeveloper.Locales.getString("edit");
  locale.editCookie                 = WebDeveloper.Locales.getString("editCookie");
  locale.expires                    = WebDeveloper.Locales.getString("expires");
  locale.expiresCannotBeEmpty       = WebDeveloper.Locales.getString("expiresCannotBeEmpty");
  locale.expiresNotValid            = WebDeveloper.Locales.getString("expiresNotValid");
  locale.expiresPlaceholder         = WebDeveloper.Locales.getString("expiresPlaceholder");
  locale.extensionName              = WebDeveloper.Locales.getString("extensionName");
  locale.host                       = WebDeveloper.Locales.getString("host");
  locale.hostCannotBeEmpty          = WebDeveloper.Locales.getString("hostCannotBeEmpty");
  locale.hostPlaceholder            = WebDeveloper.Locales.getString("hostPlaceholder");
  locale.httpOnly                   = WebDeveloper.Locales.getString("httpOnly");
  locale.name                       = WebDeveloper.Locales.getString("name");
  locale.nameCannotBeEmpty          = WebDeveloper.Locales.getString("nameCannotBeEmpty");
  locale.namePlaceholder            = WebDeveloper.Locales.getString("namePlaceholder");
  locale.no                         = WebDeveloper.Locales.getString("no");
  locale.path                       = WebDeveloper.Locales.getString("path");
  locale.pathCannotBeEmpty          = WebDeveloper.Locales.getString("pathCannotBeEmpty");
  locale.pathPlaceholder            = WebDeveloper.Locales.getString("pathPlaceholder");
  locale.save                       = WebDeveloper.Locales.getString("save");
  locale.secure                     = WebDeveloper.Locales.getString("secure");
  locale.secureCookie               = WebDeveloper.Locales.getString("secureCookie");
  locale.sessionCookie              = WebDeveloper.Locales.getString("sessionCookie");
  locale.value                      = WebDeveloper.Locales.getString("value");
  locale.valuePlaceholder           = WebDeveloper.Locales.getString("valuePlaceholder");
  locale.yes                        = WebDeveloper.Locales.getString("yes");

  return locale;
};

// Initializes the cookies overlay
WebDeveloper.Overlay.Cookies.initialize = function()
{
  var addCookieCancel           = document.getElementById("add-cookie-cancel");
  var addCookieDialog           = document.getElementById("add-cookie-dialog");
  var addCookieExpires          = document.getElementById("add-cookie-expires");
  var addCookieHost             = document.getElementById("add-cookie-host");
  var addCookieMenu             = document.getElementById("add-cookie");
  var addCookieName             = document.getElementById("add-cookie-name");
  var addCookiePath             = document.getElementById("add-cookie-path");
  var addCookieSubmit           = document.getElementById("add-cookie-submit");
  var addCookieValue            = document.getElementById("add-cookie-value");
  var deleteDomainCookiesMenu   = document.getElementById("delete-domain-cookies");
  var deletePathCookiesMenu     = document.getElementById("delete-path-cookies");
  var deleteSessionCookiesMenu  = document.getElementById("delete-session-cookies");
  var disableCookiesMenu        = document.getElementById("disable-cookies");
  var viewCookieInformationMenu = document.getElementById("view-cookie-information");

  document.querySelector('[for="add-cookie-expires"]').append(WebDeveloper.Locales.getString("expires"));
  document.querySelector('[for="add-cookie-host"]').append(WebDeveloper.Locales.getString("host"));
  document.querySelector('[for="add-cookie-name"]').append(WebDeveloper.Locales.getString("name"));
  document.querySelector('[for="add-cookie-path"]').append(WebDeveloper.Locales.getString("path"));
  document.querySelector('[for="add-cookie-secure"]').append(WebDeveloper.Locales.getString("secureCookie"));
  document.querySelector('[for="add-cookie-session"]').append(WebDeveloper.Locales.getString("sessionCookie"));
  document.querySelector('[for="add-cookie-value"]').append(WebDeveloper.Locales.getString("value"));
  addCookieCancel.append(WebDeveloper.Locales.getString("cancel"));
  addCookieDialog.querySelector("legend").append(WebDeveloper.Locales.getString("addCookie"));
  addCookieMenu.append(WebDeveloper.Locales.getString("addCookieMenu"));
  addCookieSubmit.append(WebDeveloper.Locales.getString("add"));
  deleteDomainCookiesMenu.append(WebDeveloper.Locales.getString("deleteDomainCookies"));
  deletePathCookiesMenu.append(WebDeveloper.Locales.getString("deletePathCookies"));
  deleteSessionCookiesMenu.append(WebDeveloper.Locales.getString("deleteSessionCookies"));
  disableCookiesMenu.append(WebDeveloper.Locales.getString("disableCookies"));
  viewCookieInformationMenu.append(WebDeveloper.Locales.getString("viewCookieInformation"));

  addCookieExpires.setAttribute("placeholder", WebDeveloper.Locales.getString("expiresPlaceholder"));
  addCookieHost.setAttribute("placeholder", WebDeveloper.Locales.getString("hostPlaceholder"));
  addCookieName.setAttribute("placeholder", WebDeveloper.Locales.getString("namePlaceholder"));
  addCookiePath.setAttribute("placeholder", WebDeveloper.Locales.getString("pathPlaceholder"));
  addCookieValue.setAttribute("placeholder", WebDeveloper.Locales.getString("valuePlaceholder"));

  document.getElementById("add-cookie-session").addEventListener("change", WebDeveloper.Overlay.Cookies.changeSession);
  addCookieCancel.addEventListener("click", WebDeveloper.Overlay.Cookies.cancelAddCookie);
  addCookieDialog.addEventListener("submit", function(event) { event.preventDefault(); });
  addCookieExpires.addEventListener("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  addCookieHost.addEventListener("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  addCookieMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.addCookie);
  addCookieName.addEventListener("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  addCookiePath.addEventListener("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  addCookieSubmit.addEventListener("click", WebDeveloper.Overlay.Cookies.submitAddCookie);
  addCookieValue.addEventListener("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  deleteDomainCookiesMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.deleteDomainCookies);
  deletePathCookiesMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.deletePathCookies);
  deleteSessionCookiesMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.deleteSessionCookies);
  disableCookiesMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.toggleCookies);
  viewCookieInformationMenu.addEventListener("click", WebDeveloper.Overlay.Cookies.viewCookieInformation);

  WebDeveloper.Overlay.updateContentSettingMenu(disableCookiesMenu, "cookies");
};

// Populates a cookie from a dialog
WebDeveloper.Overlay.Cookies.populateCookieFromDialog = function()
{
  var cookie = {};

  cookie.host  = document.getElementById("add-cookie-host").value.trim();
  cookie.name  = document.getElementById("add-cookie-name").value.trim();
  cookie.path  = document.getElementById("add-cookie-path").value.trim();
  cookie.value = document.getElementById("add-cookie-value").value;

  // If the cookie is secure
  if(document.getElementById("add-cookie-secure").checked)
  {
    cookie.secure = true;
  }

  // If the cookie is a session cookie
  if(document.getElementById("add-cookie-session").checked)
  {
    cookie.session = true;
  }
  else
  {
    cookie.expires = document.getElementById("add-cookie-expires").value.trim();
  }

  return cookie;
};

// Resets the add cookie dialog
WebDeveloper.Overlay.Cookies.resetAddDialog = function(response)
{
  var addCookieExpires = document.getElementById("add-cookie-expires");
  var addCookieHost    = document.getElementById("add-cookie-host");
  var addCookieName    = document.getElementById("add-cookie-name");
  var addCookiePath    = document.getElementById("add-cookie-path");

  addCookieExpires.disabled                         = false;
  addCookieExpires.value                            = WebDeveloper.Cookies.getDateTomorrow();
  addCookieHost.value                               = response.host;
  addCookieName.value                               = "";
  addCookiePath.value                               = response.path;
  document.getElementById("add-cookie-value").value = "";

  addCookieExpires.setAttribute("placeholder", WebDeveloper.Locales.getString("expiresPlaceholder"));

  addCookieExpires.classList.remove("is-invalid");
  addCookieHost.classList.remove("is-invalid");
  addCookieName.classList.remove("is-invalid");
  addCookiePath.classList.remove("is-invalid");
};

// Adds a cookie
WebDeveloper.Overlay.Cookies.submitAddCookie = function()
{
  // If the dialog is valid
  if(WebDeveloper.Overlay.Cookies.validateAddDialog())
  {
    var cookie = WebDeveloper.Overlay.Cookies.populateCookieFromDialog();

    WebDeveloper.Cookies.addCookie(cookie);
    WebDeveloper.Overlay.Cookies.cancelAddCookie();
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString("cookieAdded", [cookie.name]));
  }
};

// Toggles cookies
WebDeveloper.Overlay.Cookies.toggleCookies = function()
{
  WebDeveloper.Overlay.toggleContentSetting("cookies", this, "enableCookiesResult", "disableCookiesResult");
};

// Returns true if the add dialog is valid
WebDeveloper.Overlay.Cookies.validateAddDialog = function()
{
  var host      = document.getElementById("add-cookie-host");
  var hostValue = host.value.trim();
  var name      = document.getElementById("add-cookie-name");
  var path      = document.getElementById("add-cookie-path");
  var valid     = true;

  // If the cookie name is not set
  if(name.value.trim() == "")
  {
    document.getElementById("add-cookie-name-invalid").replaceChildren(WebDeveloper.Locales.getString("nameCannotBeEmpty"));
    name.classList.add("is-invalid");

    valid = false;
  }
  else
  {
    name.classList.remove("is-invalid");
  }

  // If the cookie host is not set
  if(hostValue == "")
  {
    document.getElementById("add-cookie-host-invalid").replaceChildren(WebDeveloper.Locales.getString("hostCannotBeEmpty"));
    host.classList.add("is-invalid");

    valid = false;
  }
  else if(hostValue == "localhost" || hostValue == ".localhost")
  {
    var hostInvalid = document.getElementById("add-cookie-host-invalid");

    // Host cannot be localhost error message contains HTML
    hostInvalid.replaceChildren();
    hostInvalid.insertAdjacentHTML("beforeend", DOMPurify.sanitize(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("hostCannotBeLocalhost")));
    host.classList.add("is-invalid");

    valid = false;
  }
  else
  {
    host.classList.remove("is-invalid");
  }

  // If the cookie path is not set
  if(path.value.trim() == "")
  {
    document.getElementById("add-cookie-path-invalid").replaceChildren(WebDeveloper.Locales.getString("pathCannotBeEmpty"));
    path.classList.add("is-invalid");

    valid = false;
  }
  else
  {
    path.classList.remove("is-invalid");
  }

  // If the cookie is not a session cookie
  if(!document.getElementById("add-cookie-session").checked)
  {
    var expires      = document.getElementById("add-cookie-expires");
    var expiresValue = expires.value.trim();

    // If the cookie expires is not set
    if(expiresValue == "")
    {
      document.getElementById("add-cookie-expires-invalid").replaceChildren(WebDeveloper.Locales.getString("expiresCannotBeEmpty"));
      expires.classList.add("is-invalid");

      valid = false;
    }
    else if(new Date(expiresValue) == "Invalid Date")
    {
      document.getElementById("add-cookie-expires-invalid").replaceChildren(WebDeveloper.Locales.getString("expiresNotValid"));
      expires.classList.add("is-invalid");

      valid = false;
    }
    else
    {
      expires.classList.remove("is-invalid");
    }
  }

  return valid;
};

// Displays all the cookies for the page
WebDeveloper.Overlay.Cookies.viewCookieInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { allCookies: WebDeveloper.Overlay.Cookies.convertCookies(allCookies), type: "get-cookies" }, function(data)
        {
          WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-cookie-information.html"), tab.index, data, WebDeveloper.Overlay.Cookies.getViewCookieInformationLocale());
        });
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Cookies.initialize);
}
else
{
  WebDeveloper.Overlay.Cookies.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay     = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.CSS = WebDeveloper.Overlay.CSS || {};

// Adds a feature on a tab
WebDeveloper.Overlay.CSS.addFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "/features/js/css.js", scriptCode);
};

// Disables all styles
WebDeveloper.Overlay.CSS.disableAllStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleAllStyles(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Disables the browser default styles
WebDeveloper.Overlay.CSS.disableBrowserDefaultStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.CSS.toggleBrowserDefaultStyles([document]); });
    }
  });
};

// Disables embedded styles
WebDeveloper.Overlay.CSS.disableEmbeddedStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleEmbeddedStyles(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Disables inline styles
WebDeveloper.Overlay.CSS.disableInlineStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleInlineStyles(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Disables linked style sheets
WebDeveloper.Overlay.CSS.disableLinkedStyleSheets = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleLinkedStyleSheets(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Disables print styles
WebDeveloper.Overlay.CSS.disablePrintStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.togglePrintStyles(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays handheld styles
WebDeveloper.Overlay.CSS.displayHandheldStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(displayHandheldStylesEnabled)
      {
        WebDeveloper.Storage.isFeatureOnTab("display-print-styles", tab, function(displayPrintStylesEnabled)
        {
          // If about to display handheld styles and print styles are being displayed
          if(!displayHandheldStylesEnabled && displayPrintStylesEnabled)
          {
            WebDeveloper.Overlay.CSS.toggleFeatureOnTab(document.getElementById("display-print-styles"), tab, function() { WebDeveloper.CSS.toggleMediaTypeStyles("print", false, [document]); });
          }

          WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleMediaTypeStyles("handheld", !featureEnabled, [document]); }, [displayHandheldStylesEnabled]);
        });
      });
    }
  });
};

// Displays print styles
WebDeveloper.Overlay.CSS.displayPrintStyles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(displayPrintStylesEnabled)
      {
        WebDeveloper.Storage.isFeatureOnTab("display-handheld-styles", tab, function(displayHandheldStylesEnabled)
        {
          // If about to display print styles and handheld styles are being displayed
          if(!displayPrintStylesEnabled && displayHandheldStylesEnabled)
          {
            WebDeveloper.Overlay.CSS.toggleFeatureOnTab(document.getElementById("display-handheld-styles"), tab, function() { WebDeveloper.CSS.toggleMediaTypeStyles("handheld", false, [document]); });
          }

          WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.CSS.toggleMediaTypeStyles("print", !featureEnabled, [document]); }, [displayPrintStylesEnabled]);
        });
      });
    }
  });
};

// Edits the CSS of the page
WebDeveloper.Overlay.CSS.editCSS = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.couldNotLoadCSS = WebDeveloper.Locales.getString("couldNotLoadCSS");
      locale.dashboardTitle  = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("dashboard");
      locale.editCSS         = WebDeveloper.Locales.getString("editCSS");
      locale.embeddedStyles  = WebDeveloper.Locales.getString("embeddedStyles");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, ["/embedded/js/dashboard/dashboard.js", "/embedded/js/dashboard/edit-css.js"], function(featureEnabled, cssLocale) { WebDeveloper.EditCSS.editCSS(!featureEnabled, document, cssLocale); }, [enabled, locale], true);
      });
    }
  });
};

// Returns the locale for the view CSS feature
WebDeveloper.Overlay.CSS.getViewCSSLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.couldNotLoadCSS    = WebDeveloper.Locales.getString("couldNotLoadCSS");
  locale.css                = WebDeveloper.Locales.getString("css");
  locale.dark               = WebDeveloper.Locales.getString("dark");
  locale.embeddedCSSFrom    = WebDeveloper.Locales.getString("embeddedCSSFrom");
  locale.light              = WebDeveloper.Locales.getString("light");
  locale.none               = WebDeveloper.Locales.getString("none");
  locale.styleSheet         = WebDeveloper.Locales.getString("styleSheet");
  locale.styleSheets        = WebDeveloper.Locales.getString("styleSheets");
  locale.syntaxHighlighting = WebDeveloper.Locales.getString("syntaxHighlighting");

  return locale;
};

// Initializes the CSS overlay
WebDeveloper.Overlay.CSS.initialize = function()
{
  var disableAllStylesMenu            = document.getElementById("disable-all-styles");
  var disableBrowserDefaultStylesMenu = document.getElementById("disable-browser-default-styles");
  var disableEmbeddedStylesMenu       = document.getElementById("disable-embedded-styles");
  var disableInlineStylesMenu         = document.getElementById("disable-inline-styles");
  var disableLinkedStyleSheetsMenu    = document.getElementById("disable-linked-style-sheets");
  var disablePrintStylesMenu          = document.getElementById("disable-print-styles");
  var displayHandheldStylesMenu       = document.getElementById("display-handheld-styles");
  var displayPrintStylesMenu          = document.getElementById("display-print-styles");
  var editCSSMenu                     = document.getElementById("edit-css");
  var reloadLinkedStyleSheetsMenu     = document.getElementById("reload-linked-style-sheets");
  var useBorderBoxModelMenu           = document.getElementById("use-border-box-model");
  var viewCSSMenu                     = document.getElementById("view-css");

  disableAllStylesMenu.append(WebDeveloper.Locales.getString("disableAllStyles"));
  disableBrowserDefaultStylesMenu.append(WebDeveloper.Locales.getString("disableBrowserDefaultStyles"));
  disableEmbeddedStylesMenu.append(WebDeveloper.Locales.getString("disableEmbeddedStyles"));
  disableInlineStylesMenu.append(WebDeveloper.Locales.getString("disableInlineStyles"));
  disableLinkedStyleSheetsMenu.append(WebDeveloper.Locales.getString("disableLinkedStyleSheets"));
  disablePrintStylesMenu.append(WebDeveloper.Locales.getString("disablePrintStyles"));
  displayHandheldStylesMenu.append(WebDeveloper.Locales.getString("displayHandheldStyles"));
  displayPrintStylesMenu.append(WebDeveloper.Locales.getString("displayPrintStyles"));
  editCSSMenu.append(WebDeveloper.Locales.getString("editCSS"));
  reloadLinkedStyleSheetsMenu.append(WebDeveloper.Locales.getString("reloadLinkedStyleSheets"));
  useBorderBoxModelMenu.append(WebDeveloper.Locales.getString("useBorderBoxModel"));
  viewCSSMenu.append(WebDeveloper.Locales.getString("viewCSS"));

  disableAllStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disableAllStyles);
  disableBrowserDefaultStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disableBrowserDefaultStyles);
  disableEmbeddedStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disableEmbeddedStyles);
  disableInlineStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disableInlineStyles);
  disableLinkedStyleSheetsMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disableLinkedStyleSheets);
  disablePrintStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.disablePrintStyles);
  displayHandheldStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.displayHandheldStyles);
  displayPrintStylesMenu.addEventListener("click", WebDeveloper.Overlay.CSS.displayPrintStyles);
  editCSSMenu.addEventListener("click", WebDeveloper.Overlay.CSS.editCSS);
  reloadLinkedStyleSheetsMenu.addEventListener("click", WebDeveloper.Overlay.CSS.reloadLinkedStyleSheets);
  useBorderBoxModelMenu.addEventListener("click", WebDeveloper.Overlay.CSS.useBorderBoxModel);
  viewCSSMenu.addEventListener("click", WebDeveloper.Overlay.CSS.viewCSS);
};

// Reloads the linked style sheets of the page
WebDeveloper.Overlay.CSS.reloadLinkedStyleSheets = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.CSS.reloadLinkedStyleSheets([document]); });
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.CSS.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/css.js", scriptCode, args);
};

// Displays alt attributes for all images
WebDeveloper.Overlay.CSS.useBorderBoxModel = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.CSS.useBorderBoxModel([document]); });
    }
  });
};

// Displays the CSS
WebDeveloper.Overlay.CSS.viewCSS = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-css" }, function(data)
      {
        WebDeveloper.Storage.getItem("syntax_highlight_theme", function(item)
        {
          data.theme = item;

          WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-css.html"), tab.index, data, WebDeveloper.Overlay.CSS.getViewCSSLocale());
        });
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.CSS.initialize);
}
else
{
  WebDeveloper.Overlay.CSS.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Disable = WebDeveloper.Overlay.Disable || {};

// Initializes the disable overlay
WebDeveloper.Overlay.Disable.initialize = function()
{
  var disableJavaScriptMenu    = document.getElementById("disable-javascript");
  var disableNotificationsMenu = document.getElementById("disable-notifications");
  var disablePopupsMenu        = document.getElementById("disable-popups");
  var resetDisableFeaturesMenu = document.getElementById("reset-disable-features");

  disableJavaScriptMenu.appendChild(document.createTextNode(WebDeveloper.Locales.getString("disableJavaScript")));
  disableNotificationsMenu.appendChild(document.createTextNode(WebDeveloper.Locales.getString("disableNotifications")));
  disablePopupsMenu.appendChild(document.createTextNode(WebDeveloper.Locales.getString("disablePopups")));
  resetDisableFeaturesMenu.appendChild(document.createTextNode(WebDeveloper.Locales.getString("resetDisableFeatures")));

  disableJavaScriptMenu.addEventListener("click", WebDeveloper.Overlay.Disable.toggleJavaScript);
  disableNotificationsMenu.addEventListener("click", WebDeveloper.Overlay.Disable.toggleNotifications);
  disablePopupsMenu.addEventListener("click", WebDeveloper.Overlay.Disable.togglePopups);
  resetDisableFeaturesMenu.addEventListener("click", WebDeveloper.Overlay.Disable.resetFeatures);

  WebDeveloper.Overlay.updateContentSettingMenu(disableJavaScriptMenu, "javascript");
  WebDeveloper.Overlay.updateContentSettingMenu(disableNotificationsMenu, "notifications");
  WebDeveloper.Overlay.updateContentSettingMenu(disablePopupsMenu, "popups");
};

// Resets the disable features
WebDeveloper.Overlay.Disable.resetFeatures = function()
{
  chrome.contentSettings.cookies.clear({});
  chrome.contentSettings.images.clear({});
  chrome.contentSettings.javascript.clear({});
  chrome.contentSettings.notifications.clear({});
  chrome.contentSettings.popups.clear({});

  WebDeveloper.Overlay.updateContentSettingMenu(document.getElementById("disable-javascript"), "javascript");
  WebDeveloper.Overlay.updateContentSettingMenu(document.getElementById("disable-notifications"), "notifications");
  WebDeveloper.Overlay.updateContentSettingMenu(document.getElementById("disable-popups"), "popups");

  WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("resetDisableFeaturesResult"));
};

// Toggles JavaScript
WebDeveloper.Overlay.Disable.toggleJavaScript = function()
{
  WebDeveloper.Overlay.toggleContentSetting("javascript", this, "enableJavaScriptResult", "disableJavaScriptResult");
};

// Toggles notifications
WebDeveloper.Overlay.Disable.toggleNotifications = function()
{
  WebDeveloper.Overlay.toggleContentSetting("notifications", this, "enableNotificationsResult", "disableNotificationsResult");
};

// Toggles popups
WebDeveloper.Overlay.Disable.togglePopups = function()
{
  WebDeveloper.Overlay.toggleContentSetting("popups", this, "enablePopupsResult", "disablePopupsResult");
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Disable.initialize);
}
else
{
  WebDeveloper.Overlay.Disable.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay       = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Forms = WebDeveloper.Overlay.Forms || {};

// Adds a feature on a tab
WebDeveloper.Overlay.Forms.addFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "/features/js/forms.js", scriptCode, args);
};

// Checks all checkboxes
WebDeveloper.Overlay.Forms.checkAllCheckboxes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.toggleCheckboxes(true, [document]); });
    }
  });
};

// Clears all form fields
WebDeveloper.Overlay.Forms.clearFormFields = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.clearFormFields([document]); });
    }
  });
};

// Clears all radio buttons
WebDeveloper.Overlay.Forms.clearRadioButtons = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.clearRadioButtons([document]); });
    }
  });
};

// Converts the methods of all forms
WebDeveloper.Overlay.Forms.convertFormMethods = function(method)
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function(formMethod) { WebDeveloper.Forms.convertFormMethods(formMethod, [document]); }, [method]);
    }
  });
};

// Converts select elements to text inputs
WebDeveloper.Overlay.Forms.convertSelectElementsToTextInputs = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.convertSelectElementsToTextInputs([document]); });
    }
  });
};

// Converts text inputs to textareas
WebDeveloper.Overlay.Forms.convertTextInputsToTextareas = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.convertTextInputsToTextareas([document]); });
    }
  });
};

// Displays the details about all forms
WebDeveloper.Overlay.Forms.displayFormDetails = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Forms.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Forms.displayFormDetails(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays all passwords
WebDeveloper.Overlay.Forms.displayPasswords = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.displayPasswords([document]); });
    }
  });
};

// Enables auto completion on all elements
WebDeveloper.Overlay.Forms.enableAutoCompletion = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.enableAutoCompletion([document]); });
    }
  });
};

// Enables all form fields
WebDeveloper.Overlay.Forms.enableFormFields = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.enableFormFields([document]); });
    }
  });
};

// Expands all select elements
WebDeveloper.Overlay.Forms.expandSelectElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.expandSelectElements([document]); });
    }
  });
};

// Returns the locale for the view form information feature
WebDeveloper.Overlay.Forms.getViewFormInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.action        = WebDeveloper.Locales.getString("action");
  locale.elements      = WebDeveloper.Locales.getString("elements");
  locale.form          = WebDeveloper.Locales.getString("form");
  locale.forms         = WebDeveloper.Locales.getString("forms");
  locale.id            = WebDeveloper.Locales.getString("id");
  locale.label         = WebDeveloper.Locales.getString("label");
  locale.maximumLength = WebDeveloper.Locales.getString("maximumLength");
  locale.method        = WebDeveloper.Locales.getString("method");
  locale.name          = WebDeveloper.Locales.getString("name");
  locale.size          = WebDeveloper.Locales.getString("size");
  locale.type          = WebDeveloper.Locales.getString("type");
  locale.value         = WebDeveloper.Locales.getString("value");

  return locale;
};

// Initializes the forms overlay
WebDeveloper.Overlay.Forms.initialize = function()
{
  var checkAllCheckboxesMenu                = document.getElementById("check-all-checkboxes");
  var clearFormFieldsMenu                   = document.getElementById("clear-form-fields");
  var clearRadioButtonsMenu                 = document.getElementById("clear-radio-buttons");
  var convertFormGetsToPostsMenu            = document.getElementById("convert-form-gets-to-posts");
  var convertFormPostsToGetsMenu            = document.getElementById("convert-form-posts-to-gets");
  var convertSelectElementsToTextInputsMenu = document.getElementById("convert-select-elements-to-text-inputs");
  var convertTextInputsToTextareasMenu      = document.getElementById("convert-text-inputs-to-textareas");
  var displayFormDetailsMenu                = document.getElementById("display-form-details");
  var displayPasswordsMenu                  = document.getElementById("display-passwords");
  var enableAutoCompletionMenu              = document.getElementById("enable-auto-completion");
  var enableFormFieldsMenu                  = document.getElementById("enable-form-fields");
  var expandSelectElementsMenu              = document.getElementById("expand-select-elements");
  var makeFormFieldsWritableMenu            = document.getElementById("make-form-fields-writable");
  var outlineFormFieldsWithoutLabelsMenu    = document.getElementById("outline-form-fields-without-labels");
  var populateFormFieldsMenu                = document.getElementById("populate-form-fields");
  var removeFormValidationMenu              = document.getElementById("remove-form-validation");
  var removeMaximumLengthsMenu              = document.getElementById("remove-maximum-lengths");
  var uncheckAllCheckboxesMenu              = document.getElementById("uncheck-all-checkboxes");
  var viewFormInformationMenu               = document.getElementById("view-form-information");

  checkAllCheckboxesMenu.append(WebDeveloper.Locales.getString("checkAllCheckboxes"));
  clearFormFieldsMenu.append(WebDeveloper.Locales.getString("clearFormFields"));
  clearRadioButtonsMenu.append(WebDeveloper.Locales.getString("clearRadioButtons"));
  convertFormGetsToPostsMenu.append(WebDeveloper.Locales.getString("convertFormGetsToPosts"));
  convertFormPostsToGetsMenu.append(WebDeveloper.Locales.getString("convertFormPostsToGets"));
  convertSelectElementsToTextInputsMenu.append(WebDeveloper.Locales.getString("convertSelectElementsToTextInputs"));
  convertTextInputsToTextareasMenu.append(WebDeveloper.Locales.getString("convertTextInputsToTextareas"));
  displayFormDetailsMenu.append(WebDeveloper.Locales.getString("displayFormDetails"));
  displayPasswordsMenu.append(WebDeveloper.Locales.getString("displayPasswords"));
  enableAutoCompletionMenu.append(WebDeveloper.Locales.getString("enableAutoCompletion"));
  enableFormFieldsMenu.append(WebDeveloper.Locales.getString("enableFormFields"));
  expandSelectElementsMenu.append(WebDeveloper.Locales.getString("expandSelectElements"));
  makeFormFieldsWritableMenu.append(WebDeveloper.Locales.getString("makeFormFieldsWritable"));
  outlineFormFieldsWithoutLabelsMenu.append(WebDeveloper.Locales.getString("outlineFormFieldsWithoutLabels"));
  populateFormFieldsMenu.append(WebDeveloper.Locales.getString("populateFormFields"));
  removeFormValidationMenu.append(WebDeveloper.Locales.getString("removeFormValidation"));
  removeMaximumLengthsMenu.append(WebDeveloper.Locales.getString("removeMaximumLengths"));
  uncheckAllCheckboxesMenu.append(WebDeveloper.Locales.getString("uncheckAllCheckboxes"));
  viewFormInformationMenu.append(WebDeveloper.Locales.getString("viewFormInformation"));

  checkAllCheckboxesMenu.addEventListener("click", WebDeveloper.Overlay.Forms.checkAllCheckboxes);
  clearFormFieldsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.clearFormFields);
  clearRadioButtonsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.clearRadioButtons);
  convertFormGetsToPostsMenu.addEventListener("click", function() { WebDeveloper.Overlay.Forms.convertFormMethods("post"); });
  convertFormPostsToGetsMenu.addEventListener("click", function() { WebDeveloper.Overlay.Forms.convertFormMethods("get"); });
  convertSelectElementsToTextInputsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.convertSelectElementsToTextInputs);
  convertTextInputsToTextareasMenu.addEventListener("click", WebDeveloper.Overlay.Forms.convertTextInputsToTextareas);
  displayFormDetailsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.displayFormDetails);
  displayPasswordsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.displayPasswords);
  enableAutoCompletionMenu.addEventListener("click", WebDeveloper.Overlay.Forms.enableAutoCompletion);
  enableFormFieldsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.enableFormFields);
  expandSelectElementsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.expandSelectElements);
  makeFormFieldsWritableMenu.addEventListener("click", WebDeveloper.Overlay.Forms.makeFormFieldsWritable);
  outlineFormFieldsWithoutLabelsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.outlineFormFieldsWithoutLabels);
  populateFormFieldsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.populateFormFields);
  removeFormValidationMenu.addEventListener("click", WebDeveloper.Overlay.Forms.removeFormValidation);
  removeMaximumLengthsMenu.addEventListener("click", WebDeveloper.Overlay.Forms.removeMaximumLengths);
  uncheckAllCheckboxesMenu.addEventListener("click", WebDeveloper.Overlay.Forms.uncheckAllCheckboxes);
  viewFormInformationMenu.addEventListener("click", WebDeveloper.Overlay.Forms.viewFormInformation);
};

// Makes all form fields writable
WebDeveloper.Overlay.Forms.makeFormFieldsWritable = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.makeFormFieldsWritable([document]); });
    }
  });
};

// Outlines all form fields without labels
WebDeveloper.Overlay.Forms.outlineFormFieldsWithoutLabels = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Forms.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Forms.outlineFormFieldsWithoutLabels(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Populates all form fields
WebDeveloper.Overlay.Forms.populateFormFields = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.getItem("populate_email_address", function(item)
      {
        WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function(emailAddress, password) { WebDeveloper.Forms.populateFormFields([document], emailAddress, password); }, [item, WebDeveloper.Locales.getString("password").toLowerCase()]);
      });
    }
  });
};

// Removes validation on all form fields
WebDeveloper.Overlay.Forms.removeFormValidation = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.removeFormValidation([document]); });
    }
  });
};

// Removes maximum lengths from all elements
WebDeveloper.Overlay.Forms.removeMaximumLengths = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.removeMaximumLengths([document]); });
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Forms.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/forms.js", scriptCode, args);
};

// Unchecks all checkboxes
WebDeveloper.Overlay.Forms.uncheckAllCheckboxes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Forms.toggleCheckboxes(false, [document]); });
    }
  });
};

// Displays information about all forms
WebDeveloper.Overlay.Forms.viewFormInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-forms" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-form-information.html"), tab.index, data, WebDeveloper.Overlay.Forms.getViewFormInformationLocale());
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Forms.initialize);
}
else
{
  WebDeveloper.Overlay.Forms.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Images = WebDeveloper.Overlay.Images || {};

// Adds a feature on a tab
WebDeveloper.Overlay.Images.addFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "/features/js/images.js", scriptCode, args);
};

// Displays alt attributes for all images
WebDeveloper.Overlay.Images.displayAltAttributes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.displayAltAttributes(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the dimensions for all images
WebDeveloper.Overlay.Images.displayImageDimensions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.height = WebDeveloper.Locales.getString("height");
      locale.width  = WebDeveloper.Locales.getString("width");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled, featureLocale) { WebDeveloper.Images.displayImageDimensions(!featureEnabled, [document], featureLocale); }, [enabled, locale]);
      });
    }
  });
};

// Displays the paths for all images
WebDeveloper.Overlay.Images.displayImagePaths = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.displayImagePaths(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Finds all the broken images on a page
WebDeveloper.Overlay.Images.findBrokenImages = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-broken-images" }, function(data)
      {
        var locale = WebDeveloper.Locales.setupGeneratedLocale();

        locale.brokenImage  = WebDeveloper.Locales.getString("brokenImage");
        locale.brokenImages = WebDeveloper.Locales.getString("brokenImages");

        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/find-broken-images.html"), tab.index, data, locale);
      });
    }
  });
};

// Returns the locale for the view image information feature
WebDeveloper.Overlay.Images.getViewImageInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.alt      = WebDeveloper.Locales.getString("alt");
  locale.height   = WebDeveloper.Locales.getString("height");
  locale.image    = WebDeveloper.Locales.getString("image");
  locale.images   = WebDeveloper.Locales.getString("images");
  locale.property = WebDeveloper.Locales.getString("property");
  locale.src      = WebDeveloper.Locales.getString("src");
  locale.value    = WebDeveloper.Locales.getString("value");
  locale.width    = WebDeveloper.Locales.getString("width");

  return locale;
};

// Hides all background images
WebDeveloper.Overlay.Images.hideBackgroundImages = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.hideBackgroundImages([document]); });
    }
  });
};

// Hides all images
WebDeveloper.Overlay.Images.hideImages = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.hideImages(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Initializes the images overlay
WebDeveloper.Overlay.Images.initialize = function()
{
  var disableImagesMenu                        = document.getElementById("disable-images");
  var displayAltAttributesMenu                 = document.getElementById("display-alt-attributes");
  var displayImageDimensionsMenu               = document.getElementById("display-image-dimensions");
  var displayImagePathsMenu                    = document.getElementById("display-image-paths");
  var findBrokenImagesMenu                     = document.getElementById("find-broken-images");
  var hideBackgroundImagesMenu                 = document.getElementById("hide-background-images");
  var hideImagesMenu                           = document.getElementById("hide-images");
  var makeImagesFullSizeMenu                   = document.getElementById("make-images-full-size");
  var makeImagesInvisibleMenu                  = document.getElementById("make-images-invisible");
  var outlineAllImagesMenu                     = document.getElementById("outline-all-images");
  var outlineBackgroundImagesMenu              = document.getElementById("outline-background-images");
  var outlineImagesWithAdjustedDimensionsMenu  = document.getElementById("outline-images-with-adjusted-dimensions");
  var outlineImagesWithEmptyAltAttributesMenu  = document.getElementById("outline-images-with-empty-alt-attributes");
  var outlineImagesWithOversizedDimensionsMenu = document.getElementById("outline-images-with-oversized-dimensions");
  var outlineImagesWithoutAltAttributesMenu    = document.getElementById("outline-images-without-alt-attributes");
  var outlineImagesWithoutDimensionsMenu       = document.getElementById("outline-images-without-dimensions");
  var reloadImagesMenu                         = document.getElementById("reload-images");
  var replaceImagesWithAltAttributesMenu       = document.getElementById("replace-images-with-alt-attributes");
  var viewImageInformationMenu                 = document.getElementById("view-image-information");

  disableImagesMenu.append(WebDeveloper.Locales.getString("disableImages"));
  displayAltAttributesMenu.append(WebDeveloper.Locales.getString("displayAltAttributes"));
  displayImageDimensionsMenu.append(WebDeveloper.Locales.getString("displayImageDimensions"));
  displayImagePathsMenu.append(WebDeveloper.Locales.getString("displayImagePaths"));
  findBrokenImagesMenu.append(WebDeveloper.Locales.getString("findBrokenImages"));
  hideBackgroundImagesMenu.append(WebDeveloper.Locales.getString("hideBackgroundImages"));
  hideImagesMenu.append(WebDeveloper.Locales.getString("hideImages"));
  makeImagesFullSizeMenu.append(WebDeveloper.Locales.getString("makeImagesFullSize"));
  makeImagesInvisibleMenu.append(WebDeveloper.Locales.getString("makeImagesInvisible"));
  outlineAllImagesMenu.append(WebDeveloper.Locales.getString("outlineAllImages"));
  outlineBackgroundImagesMenu.append(WebDeveloper.Locales.getString("outlineBackgroundImages"));
  outlineImagesWithAdjustedDimensionsMenu.append(WebDeveloper.Locales.getString("outlineImagesWithAdjustedDimensions"));
  outlineImagesWithEmptyAltAttributesMenu.append(WebDeveloper.Locales.getString("outlineImagesWithEmptyAltAttributes"));
  outlineImagesWithOversizedDimensionsMenu.append(WebDeveloper.Locales.getString("outlineImagesWithOversizedDimensions"));
  outlineImagesWithoutAltAttributesMenu.append(WebDeveloper.Locales.getString("outlineImagesWithoutAltAttributes"));
  outlineImagesWithoutDimensionsMenu.append(WebDeveloper.Locales.getString("outlineImagesWithoutDimensions"));
  reloadImagesMenu.append(WebDeveloper.Locales.getString("reloadImages"));
  replaceImagesWithAltAttributesMenu.append(WebDeveloper.Locales.getString("replaceImagesWithAltAttributes"));
  viewImageInformationMenu.append(WebDeveloper.Locales.getString("viewImageInformation"));

  disableImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.toggleImages);
  displayAltAttributesMenu.addEventListener("click", WebDeveloper.Overlay.Images.displayAltAttributes);
  displayImageDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Images.displayImageDimensions);
  displayImagePathsMenu.addEventListener("click", WebDeveloper.Overlay.Images.displayImagePaths);
  findBrokenImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.findBrokenImages);
  hideBackgroundImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.hideBackgroundImages);
  hideImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.hideImages);
  makeImagesFullSizeMenu.addEventListener("click", WebDeveloper.Overlay.Images.makeImagesFullSize);
  makeImagesInvisibleMenu.addEventListener("click", WebDeveloper.Overlay.Images.makeImagesInvisible);
  outlineAllImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineAllImages);
  outlineBackgroundImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineBackgroundImages);
  outlineImagesWithAdjustedDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineImagesWithAdjustedDimensions);
  outlineImagesWithEmptyAltAttributesMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineImagesWithEmptyAltAttributes);
  outlineImagesWithOversizedDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineImagesWithOversizedDimensions);
  outlineImagesWithoutAltAttributesMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineImagesWithoutAltAttributes);
  outlineImagesWithoutDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Images.outlineImagesWithoutDimensions);
  reloadImagesMenu.addEventListener("click", WebDeveloper.Overlay.Images.reloadImages);
  replaceImagesWithAltAttributesMenu.addEventListener("click", WebDeveloper.Overlay.Images.replaceImagesWithAltAttributes);
  viewImageInformationMenu.addEventListener("click", WebDeveloper.Overlay.Images.viewImageInformation);

  WebDeveloper.Overlay.updateContentSettingMenu(disableImagesMenu, "images");
};

// Makes all images full size
WebDeveloper.Overlay.Images.makeImagesFullSize = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.makeImagesFullSize([document]); });
    }
  });
};

// Makes all images invisible
WebDeveloper.Overlay.Images.makeImagesInvisible = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.makeImagesInvisible(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all images
WebDeveloper.Overlay.Images.outlineAllImages = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.outlineAllImages([document]); });
    }
  });
};

// Outlines all background images
WebDeveloper.Overlay.Images.outlineBackgroundImages = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.outlineBackgroundImages(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all images with adjusted dimensions
WebDeveloper.Overlay.Images.outlineImagesWithAdjustedDimensions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.outlineImagesWithAdjustedDimensions(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all images with empty alt attributes
WebDeveloper.Overlay.Images.outlineImagesWithEmptyAltAttributes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.outlineImagesWithEmptyAltAttributes([document]); });
    }
  });
};

// Outlines all images with oversized dimensions
WebDeveloper.Overlay.Images.outlineImagesWithOversizedDimensions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.outlineImagesWithOversizedDimensions(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all images without alt attributes
WebDeveloper.Overlay.Images.outlineImagesWithoutAltAttributes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.outlineImagesWithoutAltAttributes([document]); });
    }
  });
};

// Outlines all images without dimensions
WebDeveloper.Overlay.Images.outlineImagesWithoutDimensions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.outlineImagesWithoutDimensions([document]); });
    }
  });
};

// Reloads all the images on a page
WebDeveloper.Overlay.Images.reloadImages = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Images.reloadImages([document]); });
    }
  });
};

// Replaces all images with alt attributes
WebDeveloper.Overlay.Images.replaceImagesWithAltAttributes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Images.replaceImagesWithAltAttributes(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Images.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/images.js", scriptCode, args);
};

// Toggles images
WebDeveloper.Overlay.Images.toggleImages = function()
{
  WebDeveloper.Overlay.toggleContentSetting("images", this, "enableImagesResult", "disableImagesResult");
};

// Displays all the images
WebDeveloper.Overlay.Images.viewImageInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-images" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-image-information.html"), tab.index, data, WebDeveloper.Overlay.Images.getViewImageInformationLocale());
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Images.initialize);
}
else
{
  WebDeveloper.Overlay.Images.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay             = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Information = WebDeveloper.Overlay.Information || {};

// Displays the abbreviations on a page
WebDeveloper.Overlay.Information.displayAbbreviations = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Information.displayAbbreviations([document]); });
    }
  });
};

// Displays the access keys on a page
WebDeveloper.Overlay.Information.displayAccessKeys = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayAccessKeys(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the anchors on a page
WebDeveloper.Overlay.Information.displayAnchors = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayAnchors(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the ARIA roles on a page
WebDeveloper.Overlay.Information.displayARIARoles = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Information.displayARIARoles([document]); });
    }
  });
};

// Displays the dimensions for divs on a page
WebDeveloper.Overlay.Information.displayDivDimensions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.height = WebDeveloper.Locales.getString("height");
      locale.width  = WebDeveloper.Locales.getString("width");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled, featureLocale) { WebDeveloper.Information.displayDivDimensions(!featureEnabled, [document], featureLocale); }, [enabled, locale]);
      });
    }
  });
};

// Displays the order of the divs on a page
WebDeveloper.Overlay.Information.displayDivOrder = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayDivOrder(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays information about an element
WebDeveloper.Overlay.Information.displayElementInformation = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.ancestors                         = WebDeveloper.Locales.getString("ancestors");
      locale.children                          = WebDeveloper.Locales.getString("children");
      locale.dashboardTitle                    = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("dashboard");
      locale.dom                               = WebDeveloper.Locales.getString("dom");
      locale.elementInformation                = WebDeveloper.Locales.getString("elementInformation");
      locale.layout                            = WebDeveloper.Locales.getString("layout");
      locale.position                          = WebDeveloper.Locales.getString("position");
      locale.selectAnElementDisplayInformation = WebDeveloper.Locales.getString("selectAnElementDisplayInformation");
      locale.text                              = WebDeveloper.Locales.getString("text");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, ["/embedded/js/dashboard/dashboard.js", "/embedded/js/dashboard/element-information.js"], function(featureEnabled, featureLocale) { WebDeveloper.ElementInformation.initialize(!featureEnabled, document, featureLocale); }, [enabled, locale], true);
      });
    }
  });
};

// Displays the id and class details for a page
WebDeveloper.Overlay.Information.displayIdClassDetails = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayIdClassDetails(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the details for the links on a page
WebDeveloper.Overlay.Information.displayLinkDetails = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Information.displayLinkDetails([document]); });
    }
  });
};

// Displays the information for objects on a page
WebDeveloper.Overlay.Information.displayObjectInformation = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayObjectInformation(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the stack levels on a page
WebDeveloper.Overlay.Information.displayStackLevels = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayStackLevels(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the tab indices on a page
WebDeveloper.Overlay.Information.displayTabIndex = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayTabIndex(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the depth of all tables on a page
WebDeveloper.Overlay.Information.displayTableDepth = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled, depth) { WebDeveloper.Information.displayTableDepth(!featureEnabled, [document], depth); }, [enabled, WebDeveloper.Locales.getString("depth")]);
      });
    }
  });
};

// Displays the information for tables on a page
WebDeveloper.Overlay.Information.displayTableInformation = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayTableInformation(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the title attributes on a page
WebDeveloper.Overlay.Information.displayTitleAttributes = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Information.displayTitleAttributes(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Displays the topographic information for a page
WebDeveloper.Overlay.Information.displayTopographicInformation = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Information.displayTopographicInformation([document]); });
    }
  });
};

// Finds all the duplicate ids on a page
WebDeveloper.Overlay.Information.findDuplicateIds = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-duplicate-ids" }, function(data)
      {
        var locale = WebDeveloper.Locales.setupGeneratedLocale();

        locale.duplicateId  = WebDeveloper.Locales.getString("duplicateId");
        locale.duplicateIds = WebDeveloper.Locales.getString("duplicateIds");

        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/find-duplicate-ids.html"), tab.index, data, locale);
      });
    }
  });
};

// Returns the locale for the view anchor information feature
WebDeveloper.Overlay.Information.getViewAnchorInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.anchor            = WebDeveloper.Locales.getString("anchor");
  locale.anchorInformation = WebDeveloper.Locales.getString("anchorInformation");
  locale.anchors           = WebDeveloper.Locales.getString("anchors");

  return locale;
};

// Returns the locale for the view color information feature
WebDeveloper.Overlay.Information.getViewColorInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.color            = WebDeveloper.Locales.getString("color");
  locale.colorInformation = WebDeveloper.Locales.getString("colorInformation");
  locale.colors           = WebDeveloper.Locales.getString("colors");

  return locale;
};

// Returns the locale for the view document outline feature
WebDeveloper.Overlay.Information.getViewDocumentOutlineLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.documentOutline = WebDeveloper.Locales.getString("documentOutline");
  locale.heading         = WebDeveloper.Locales.getString("heading");
  locale.headings        = WebDeveloper.Locales.getString("headings");
  locale.missingHeading  = WebDeveloper.Locales.getString("missingHeading");
  locale.noHeadingText   = WebDeveloper.Locales.getString("noHeadingText");

  return locale;
};

// Returns the locale for the view JavaScript feature
WebDeveloper.Overlay.Information.getViewJavaScriptLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.beautifyJavaScript     = WebDeveloper.Locales.getString("beautifyJavaScript");
  locale.couldNotLoadJavaScript = WebDeveloper.Locales.getString("couldNotLoadJavaScript");
  locale.dark                   = WebDeveloper.Locales.getString("dark");
  locale.embeddedJavaScriptFrom = WebDeveloper.Locales.getString("embeddedJavaScriptFrom");
  locale.javaScript             = WebDeveloper.Locales.getString("javaScript");
  locale.light                  = WebDeveloper.Locales.getString("light");
  locale.none                   = WebDeveloper.Locales.getString("none");
  locale.syntaxHighlighting     = WebDeveloper.Locales.getString("syntaxHighlighting");
  locale.undoBeautifyJavaScript = WebDeveloper.Locales.getString("undoBeautifyJavaScript");

  return locale;
};

// Returns the locale for the view link information feature
WebDeveloper.Overlay.Information.getViewLinkInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.link            = WebDeveloper.Locales.getString("link");
  locale.linkInformation = WebDeveloper.Locales.getString("linkInformation");
  locale.links           = WebDeveloper.Locales.getString("links");

  return locale;
};

// Returns the locale for the view meta tag information feature
WebDeveloper.Overlay.Information.getViewMetaTagInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.content  = WebDeveloper.Locales.getString("content");
  locale.metaTag  = WebDeveloper.Locales.getString("metaTag");
  locale.metaTags = WebDeveloper.Locales.getString("metaTags");
  locale.name     = WebDeveloper.Locales.getString("name");

  return locale;
};

// Returns the locale for the view response headers feature
WebDeveloper.Overlay.Information.getViewResponseHeadersLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.couldNotLoadResponseHeaders = WebDeveloper.Locales.getString("couldNotLoadResponseHeaders");
  locale.responseHeaders             = WebDeveloper.Locales.getString("responseHeaders");

  return locale;
};

// Initializes the information overlay
WebDeveloper.Overlay.Information.initialize = function()
{
  var displayAbbreviationsMenu          = document.getElementById("display-abbreviations");
  var displayAccessKeysMenu             = document.getElementById("display-access-keys");
  var displayAnchorsMenu                = document.getElementById("display-anchors");
  var displayARIARolesMenu              = document.getElementById("display-aria-roles");
  var displayDivDimensionsMenu          = document.getElementById("display-div-dimensions");
  var displayDivOrderMenu               = document.getElementById("display-div-order");
  var displayElementInformationMenu     = document.getElementById("display-element-information");
  var displayIdClassDetailsMenu         = document.getElementById("display-id-class-details");
  var displayLinkDetailsMenu            = document.getElementById("display-link-details");
  var displayObjectInformationMenu      = document.getElementById("display-object-information");
  var displayStackLevelsMenu            = document.getElementById("display-stack-levels");
  var displayTabIndexMenu               = document.getElementById("display-tab-index");
  var displayTableDepthMenu             = document.getElementById("display-table-depth");
  var displayTableInformationMenu       = document.getElementById("display-table-information");
  var displayTitleAttributesMenu        = document.getElementById("display-title-attributes");
  var displayTopographicInformationMenu = document.getElementById("display-topographic-information");
  var findDuplicateIdsMenu              = document.getElementById("find-duplicate-ids");
  var viewAnchorInformationMenu         = document.getElementById("view-anchor-information");
  var viewColorInformationMenu          = document.getElementById("view-color-information");
  var viewDocumentOutlineMenu           = document.getElementById("view-document-outline");
  var viewJavaScriptMenu                = document.getElementById("view-javascript");
  var viewLinkInformationMenu           = document.getElementById("view-link-information");
  var viewMetaTagInformationMenu        = document.getElementById("view-meta-tag-information");
  var viewResponseHeadersMenu           = document.getElementById("view-response-headers");

  displayAbbreviationsMenu.append(WebDeveloper.Locales.getString("displayAbbreviations"));
  displayAccessKeysMenu.append(WebDeveloper.Locales.getString("displayAccessKeys"));
  displayAnchorsMenu.append(WebDeveloper.Locales.getString("displayAnchors"));
  displayARIARolesMenu.append(WebDeveloper.Locales.getString("displayARIARoles"));
  displayDivDimensionsMenu.append(WebDeveloper.Locales.getString("displayDivDimensions"));
  displayDivOrderMenu.append(WebDeveloper.Locales.getString("displayDivOrder"));
  displayElementInformationMenu.append(WebDeveloper.Locales.getString("displayElementInformation"));
  displayIdClassDetailsMenu.append(WebDeveloper.Locales.getString("displayIdClassDetails"));
  displayLinkDetailsMenu.append(WebDeveloper.Locales.getString("displayLinkDetails"));
  displayObjectInformationMenu.append(WebDeveloper.Locales.getString("displayObjectInformation"));
  displayStackLevelsMenu.append(WebDeveloper.Locales.getString("displayStackLevels"));
  displayTabIndexMenu.append(WebDeveloper.Locales.getString("displayTabIndex"));
  displayTableDepthMenu.append(WebDeveloper.Locales.getString("displayTableDepth"));
  displayTableInformationMenu.append(WebDeveloper.Locales.getString("displayTableInformation"));
  displayTitleAttributesMenu.append(WebDeveloper.Locales.getString("displayTitleAttributes"));
  displayTopographicInformationMenu.append(WebDeveloper.Locales.getString("displayTopographicInformation"));
  findDuplicateIdsMenu.append(WebDeveloper.Locales.getString("findDuplicateIds"));
  viewAnchorInformationMenu.append(WebDeveloper.Locales.getString("viewAnchorInformation"));
  viewColorInformationMenu.append(WebDeveloper.Locales.getString("viewColorInformation"));
  viewDocumentOutlineMenu.append(WebDeveloper.Locales.getString("viewDocumentOutline"));
  viewJavaScriptMenu.append(WebDeveloper.Locales.getString("viewJavaScript"));
  viewLinkInformationMenu.append(WebDeveloper.Locales.getString("viewLinkInformation"));
  viewMetaTagInformationMenu.append(WebDeveloper.Locales.getString("viewMetaTagInformation"));
  viewResponseHeadersMenu.append(WebDeveloper.Locales.getString("viewResponseHeaders"));

  displayAbbreviationsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayAbbreviations);
  displayAccessKeysMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayAccessKeys);
  displayAnchorsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayAnchors);
  displayARIARolesMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayARIARoles);
  displayDivDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayDivDimensions);
  displayDivOrderMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayDivOrder);
  displayElementInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayElementInformation);
  displayIdClassDetailsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayIdClassDetails);
  displayLinkDetailsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayLinkDetails);
  displayObjectInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayObjectInformation);
  displayStackLevelsMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayStackLevels);
  displayTabIndexMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayTabIndex);
  displayTableDepthMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayTableDepth);
  displayTableInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayTableInformation);
  displayTitleAttributesMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayTitleAttributes);
  displayTopographicInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.displayTopographicInformation);
  findDuplicateIdsMenu.addEventListener("click", WebDeveloper.Overlay.Information.findDuplicateIds);
  viewAnchorInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewAnchorInformation);
  viewColorInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewColorInformation);
  viewDocumentOutlineMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewDocumentOutline);
  viewJavaScriptMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewJavaScript);
  viewLinkInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewLinkInformation);
  viewMetaTagInformationMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewMetaTagInformation);
  viewResponseHeadersMenu.addEventListener("click", WebDeveloper.Overlay.Information.viewResponseHeaders);
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Information.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/information.js", scriptCode, args);
};

// Displays the anchor information for a page
WebDeveloper.Overlay.Information.viewAnchorInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-anchors" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-anchor-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewAnchorInformationLocale());
      });
    }
  });
};

// Displays the color information for a page
WebDeveloper.Overlay.Information.viewColorInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-colors" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-color-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewColorInformationLocale());
      });
    }
  });
};

// Displays the document outline
WebDeveloper.Overlay.Information.viewDocumentOutline = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-document-outline" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-document-outline.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewDocumentOutlineLocale());
      });
    }
  });
};

// Displays the JavaScript
WebDeveloper.Overlay.Information.viewJavaScript = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-javascript" }, function(data)
      {
        WebDeveloper.Storage.getItem("syntax_highlight_theme", function(item)
        {
          data.theme = item;

          WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-javascript.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewJavaScriptLocale());
        });
      });
    }
  });
};

// Displays the link information for a page
WebDeveloper.Overlay.Information.viewLinkInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-links" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-link-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewLinkInformationLocale());
      });
    }
  });
};

// Displays the meta tag information for a page
WebDeveloper.Overlay.Information.viewMetaTagInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-meta-tags" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-meta-tag-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewMetaTagInformationLocale());
      });
    }
  });
};

// Displays the response headers
WebDeveloper.Overlay.Information.viewResponseHeaders = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-document-details" }, function(data)
      {
        WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-response-headers.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewResponseHeadersLocale());
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Information.initialize);
}
else
{
  WebDeveloper.Overlay.Information.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay               = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Miscellaneous = WebDeveloper.Overlay.Miscellaneous || {};

// Adds a feature on a tab
WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "/features/js/miscellaneous.js", scriptCode, args);
};

// Adds an href to the history
WebDeveloper.Overlay.Miscellaneous.addToHistory = function(href)
{
  chrome.history.addUrl({ url: href });
};

// Clears the cache
WebDeveloper.Overlay.Miscellaneous.clearCache = function()
{
  WebDeveloper.Overlay.closeConfirmation();

  chrome.browsingData.removeCache({ since: 0 }, function()
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("clearCacheResult"));
  });
};

// Clears the history
WebDeveloper.Overlay.Miscellaneous.clearHistory = function()
{
  WebDeveloper.Overlay.closeConfirmation();

  chrome.history.deleteAll(function()
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("clearHistoryResult"));
  });
};

// Asks to confirm to clear the cache
WebDeveloper.Overlay.Miscellaneous.confirmClearCache = function()
{
  WebDeveloper.Overlay.displayConfirmation(null, WebDeveloper.Locales.getString("clearCacheConfirmation"), WebDeveloper.Locales.getString("clear"), "trash", WebDeveloper.Overlay.Miscellaneous.clearCache);
};

// Asks to confirm to clear the history
WebDeveloper.Overlay.Miscellaneous.confirmClearHistory = function()
{
  WebDeveloper.Overlay.displayConfirmation(null, WebDeveloper.Locales.getString("clearHistoryConfirmation"), WebDeveloper.Locales.getString("clear"), "trash", WebDeveloper.Overlay.Miscellaneous.clearHistory);
};

// Displays a color picker
WebDeveloper.Overlay.Miscellaneous.displayColorPicker = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.hoverColor    = WebDeveloper.Locales.getString("hoverColor");
      locale.selectedColor = WebDeveloper.Locales.getString("selectedColor");
      locale.title         = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("colorPicker");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/embedded/js/toolbar/color-picker.js", function(featureEnabled, featureLocale) { WebDeveloper.ColorPicker.displayColorPicker(!featureEnabled, document, featureLocale); }, [enabled, locale], true);
      });
    }
  });
};

// Displays all hidden elements
WebDeveloper.Overlay.Miscellaneous.displayHiddenElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Miscellaneous.displayHiddenElements([document]); });
    }
  });
};

// Displays line guides
WebDeveloper.Overlay.Miscellaneous.displayLineGuides = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.addHorizontalLineGuide = WebDeveloper.Locales.getString("addHorizontalLineGuide");
      locale.addVerticalLineGuide   = WebDeveloper.Locales.getString("addVerticalLineGuide");
      locale.nextPosition           = WebDeveloper.Locales.getString("nextPosition");
      locale.positionLabel          = WebDeveloper.Locales.getString("positionLabel");
      locale.previousPosition       = WebDeveloper.Locales.getString("previousPosition");
      locale.title                  = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("lineGuides");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/embedded/js/toolbar/line-guides.js", function(featureEnabled, featureLocale) { WebDeveloper.LineGuides.displayLineGuides(!featureEnabled, document, featureLocale); }, [enabled, locale], true);
      });
    }
  });
};

// Displays a ruler
WebDeveloper.Overlay.Miscellaneous.displayRuler = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var locale = {};

      locale.endPositionX   = WebDeveloper.Locales.getString("endPositionX");
      locale.height         = WebDeveloper.Locales.getString("height");
      locale.startPositionX = WebDeveloper.Locales.getString("startPositionX");
      locale.title          = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("ruler");
      locale.width          = WebDeveloper.Locales.getString("width");
      locale.yLabel         = WebDeveloper.Locales.getString("yLabel");

      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/embedded/js/toolbar/ruler.js", function(featureEnabled, featureLocale) { WebDeveloper.Ruler.displayRuler(!featureEnabled, document, featureLocale); }, [enabled, locale], true);
      });
    }
  });
};

// Initializes the miscellaneous overlay
WebDeveloper.Overlay.Miscellaneous.initialize = function()
{
  var clearCacheMenu            = document.getElementById("clear-cache");
  var clearHistoryMenu          = document.getElementById("clear-history");
  var displayColorPickerMenu    = document.getElementById("display-color-picker");
  var displayHiddenElementsMenu = document.getElementById("display-hidden-elements");
  var displayLineGuidesMenu     = document.getElementById("display-line-guides");
  var displayRulerMenu          = document.getElementById("display-ruler");
  var linearizePageMenu         = document.getElementById("linearize-page");
  var makeFramesResizableMenu   = document.getElementById("make-frames-resizable");
  var markAllLinksUnvisitedMenu = document.getElementById("mark-all-links-unvisited");
  var markAllLinksVisitedMenu   = document.getElementById("mark-all-links-visited");

  clearHistoryMenu.append(WebDeveloper.Locales.getString("clearHistory"));
  displayColorPickerMenu.append(WebDeveloper.Locales.getString("displayColorPicker"));
  displayHiddenElementsMenu.append(WebDeveloper.Locales.getString("displayHiddenElements"));
  displayLineGuidesMenu.append(WebDeveloper.Locales.getString("displayLineGuides"));
  displayRulerMenu.append(WebDeveloper.Locales.getString("displayRuler"));
  linearizePageMenu.append(WebDeveloper.Locales.getString("linearizePage"));
  makeFramesResizableMenu.append(WebDeveloper.Locales.getString("makeFramesResizable"));
  markAllLinksUnvisitedMenu.append(WebDeveloper.Locales.getString("markAllLinksUnvisited"));
  markAllLinksVisitedMenu.append(WebDeveloper.Locales.getString("markAllLinksVisited"));

  clearHistoryMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.confirmClearHistory);
  displayColorPickerMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.displayColorPicker);
  displayHiddenElementsMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.displayHiddenElements);
  displayLineGuidesMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.displayLineGuides);
  displayRulerMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.displayRuler);
  linearizePageMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.linearizePage);
  makeFramesResizableMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.makeFramesResizable);
  markAllLinksUnvisitedMenu.addEventListener("click", function() { WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks(false); });
  markAllLinksVisitedMenu.addEventListener("click", function() { WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks(true); });

  // If the browsing data API is set
  if(chrome.browsingData)
  {
    clearCacheMenu.append(WebDeveloper.Locales.getString("clearCache"));
    clearCacheMenu.addEventListener("click", WebDeveloper.Overlay.Miscellaneous.confirmClearCache);
  }
  else
  {
    clearCacheMenu.classList.add("hide");
  }
};

// Linearizes a page
WebDeveloper.Overlay.Miscellaneous.linearizePage = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Miscellaneous.linearizePage([document]); });
    }
  });
};

// Makes all frames resizable
WebDeveloper.Overlay.Miscellaneous.makeFramesResizable = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab(featureItem, tab, function() { WebDeveloper.Miscellaneous.makeFramesResizable([document]); });
    }
  });
};

// Removes an href from the history
WebDeveloper.Overlay.Miscellaneous.removeFromHistory = function(href)
{
  chrome.history.deleteUrl({ url: href });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Miscellaneous.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/miscellaneous.js", scriptCode, args);
};

// Toggles all links on the page between visited and unvisited
WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks = function(visited)
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-links" }, function(data)
      {
        var documents = data.documents;
        var links     = null;

        // Loop through the documents
        for(var i = 0, l = documents.length; i < l; i++)
        {
          links = documents[i].links;

          // Loop through all the links
          for(var j = 0, m = links.length; j < m; j++)
          {
            // If marking links as visited
            if(visited)
            {
              WebDeveloper.Overlay.Miscellaneous.addToHistory(links[j]);
            }
            else
            {
              WebDeveloper.Overlay.Miscellaneous.removeFromHistory(links[j]);
            }
          }
        }

        // If marking links as visited
        if(visited)
        {
          WebDeveloper.Common.displayNotification("markAllLinksVisitedResult");
        }
        else
        {
          WebDeveloper.Common.displayNotification("markAllLinksUnvisitedResult");
        }
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Miscellaneous.initialize);
}
else
{
  WebDeveloper.Overlay.Miscellaneous.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Options = WebDeveloper.Overlay.Options || {};

// Opens the about page
WebDeveloper.Overlay.Options.about = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    chrome.tabs.create({ index: tab.index + 1, url: chrome.runtime.getURL("/about/about.html") });
    WebDeveloper.Overlay.close();
  });
};

// Initializes the options overlay
WebDeveloper.Overlay.Options.initialize = function()
{
  var aboutMenu     = document.getElementById("about");
  var helpMenu      = document.getElementById("help");
  var optionsMenu   = document.getElementById("options");
  var resetPageMenu = document.getElementById("reset-page");

  aboutMenu.append(WebDeveloper.Locales.getString("aboutMenu"));
  helpMenu.append(WebDeveloper.Locales.getString("help"));
  optionsMenu.append(WebDeveloper.Locales.getString("optionsMenu"));
  resetPageMenu.append(WebDeveloper.Locales.getString("resetPage"));

  aboutMenu.addEventListener("click", WebDeveloper.Overlay.Options.about);
  optionsMenu.addEventListener("click", WebDeveloper.Overlay.Options.options);
  resetPageMenu.addEventListener("click", WebDeveloper.Overlay.Options.resetPage);
};

// Opens the options
WebDeveloper.Overlay.Options.options = function()
{
  chrome.runtime.openOptionsPage();
  WebDeveloper.Overlay.close();
};

// Resets the page
WebDeveloper.Overlay.Options.resetPage = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Overlay.addScriptToTab(tab, function() { window.location.reload(); }, function()
    {
      WebDeveloper.Overlay.close();
    });
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Options.initialize);
}
else
{
  WebDeveloper.Overlay.Options.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Outline = WebDeveloper.Overlay.Outline || {};

// Initializes the outline overlay
WebDeveloper.Overlay.Outline.initialize = function()
{
  var outlineAbsolutePositionedElementsMenu = document.getElementById("outline-absolute-positioned-elements");
  var outlineBlockLevelElementsMenu         = document.getElementById("outline-block-level-elements");
  var outlineDeprecatedElementsMenu         = document.getElementById("outline-deprecated-elements");
  var outlineExternalLinksMenu              = document.getElementById("outline-external-links");
  var outlineFixedPositionedElementsMenu    = document.getElementById("outline-fixed-positioned-elements");
  var outlineFloatedElementsMenu            = document.getElementById("outline-floated-elements");
  var outlineFramesMenu                     = document.getElementById("outline-frames");
  var outlineHeadingsMenu                   = document.getElementById("outline-headings");
  var outlineNonSecureElementsMenu          = document.getElementById("outline-non-secure-elements");
  var outlineRelativePositionedElementsMenu = document.getElementById("outline-relative-positioned-elements");
  var outlineTableCaptionsMenu              = document.getElementById("outline-table-captions");
  var outlineTableCellsMenu                 = document.getElementById("outline-table-cells");
  var outlineTablesMenu                     = document.getElementById("outline-tables");
  var showElementTagNamesMenu               = document.getElementById("show-element-tag-names");

  outlineAbsolutePositionedElementsMenu.append(WebDeveloper.Locales.getString("outlineAbsolutePositionedElements"));
  outlineBlockLevelElementsMenu.append(WebDeveloper.Locales.getString("outlineBlockLevelElements"));
  outlineDeprecatedElementsMenu.append(WebDeveloper.Locales.getString("outlineDeprecatedElements"));
  outlineExternalLinksMenu.append(WebDeveloper.Locales.getString("outlineExternalLinks"));
  outlineFixedPositionedElementsMenu.append(WebDeveloper.Locales.getString("outlineFixedPositionedElements"));
  outlineFloatedElementsMenu.append(WebDeveloper.Locales.getString("outlineFloatedElements"));
  outlineFramesMenu.append(WebDeveloper.Locales.getString("outlineFrames"));
  outlineHeadingsMenu.append(WebDeveloper.Locales.getString("outlineHeadings"));
  outlineNonSecureElementsMenu.append(WebDeveloper.Locales.getString("outlineNonSecureElements"));
  outlineRelativePositionedElementsMenu.append(WebDeveloper.Locales.getString("outlineRelativePositionedElements"));
  outlineTableCaptionsMenu.append(WebDeveloper.Locales.getString("outlineTableCaptions"));
  outlineTableCellsMenu.append(WebDeveloper.Locales.getString("outlineTableCells"));
  outlineTablesMenu.append(WebDeveloper.Locales.getString("outlineTables"));
  showElementTagNamesMenu.append(WebDeveloper.Locales.getString("showElementTagNames"));

  outlineAbsolutePositionedElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineAbsolutePositionedElements);
  outlineBlockLevelElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineBlockLevelElements);
  outlineDeprecatedElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineDeprecatedElements);
  outlineExternalLinksMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineExternalLinks);
  outlineFixedPositionedElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineFixedPositionedElements);
  outlineFloatedElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineFloatedElements);
  outlineFramesMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineFrames);
  outlineHeadingsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineHeadings);
  outlineNonSecureElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineNonSecureElements);
  outlineRelativePositionedElementsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineRelativePositionedElements);
  outlineTableCaptionsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineTableCaptions);
  outlineTableCellsMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineTableCells);
  outlineTablesMenu.addEventListener("click", WebDeveloper.Overlay.Outline.outlineTables);
  showElementTagNamesMenu.addEventListener("click", WebDeveloper.Overlay.Outline.toggleShowElementTagNames);

  WebDeveloper.Storage.getItem("outline.show.element.tag.names", function(showElementTagNames)
  {
    // If the outline show element tag names preference is set to true
    if(showElementTagNames)
    {
      showElementTagNamesMenu.classList.add("active");
    }
  });
};

// Outlines all absolute positioned elements
WebDeveloper.Overlay.Outline.outlineAbsolutePositionedElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Outline.outlinePositionedElements("absolute", !featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all block level elements
WebDeveloper.Overlay.Outline.outlineBlockLevelElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.getItem("outline.show.element.tag.names", function(showElementTagNamesStorage)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(showElementTagNames) { WebDeveloper.Outline.outlineBlockLevelElements([document], showElementTagNames); }, [showElementTagNamesStorage]);
      });
    }
  });
};

// Outlines all deprecated elements
WebDeveloper.Overlay.Outline.outlineDeprecatedElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.getItem("outline.show.element.tag.names", function(showElementTagNamesStorage)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(showElementTagNames) { WebDeveloper.Outline.outlineDeprecatedElements([document], showElementTagNames); }, [showElementTagNamesStorage]);
      });
    }
  });
};

// Outlines all external links
WebDeveloper.Overlay.Outline.outlineExternalLinks = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Outline.outlineExternalLinks(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all fixed positioned elements
WebDeveloper.Overlay.Outline.outlineFixedPositionedElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Outline.outlinePositionedElements("fixed", !featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all floated elements
WebDeveloper.Overlay.Outline.outlineFloatedElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Outline.outlineFloatedElements(!featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all frames
WebDeveloper.Overlay.Outline.outlineFrames = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Outline.outlineFrames([document]); });
    }
  });
};

// Outlines all headings
WebDeveloper.Overlay.Outline.outlineHeadings = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.getItem("outline.show.element.tag.names", function(showElementTagNamesStorage)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(showElementTagNames) { WebDeveloper.Outline.outlineHeadings([document], showElementTagNames); }, [showElementTagNamesStorage]);
      });
    }
  });
};

// Outlines all non-secure elements
WebDeveloper.Overlay.Outline.outlineNonSecureElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Outline.outlineNonSecureElements([document]); });
    }
  });
};

// Outlines all relative positioned elements
WebDeveloper.Overlay.Outline.outlineRelativePositionedElements = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.isFeatureOnTab(featureItem.getAttribute("id"), tab, function(enabled)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(featureEnabled) { WebDeveloper.Outline.outlinePositionedElements("relative", !featureEnabled, [document]); }, [enabled]);
      });
    }
  });
};

// Outlines all table captions
WebDeveloper.Overlay.Outline.outlineTableCaptions = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Outline.outlineTableCaptions([document]); });
    }
  });
};

// Outlines all table cells
WebDeveloper.Overlay.Outline.outlineTableCells = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Storage.getItem("outline.show.element.tag.names", function(showElementTagNamesStorage)
      {
        WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function(showElementTagNames) { WebDeveloper.Outline.outlineTableCells([document], showElementTagNames); }, [showElementTagNamesStorage]);
      });
    }
  });
};

// Outlines all tables
WebDeveloper.Overlay.Outline.outlineTables = function()
{
  var featureItem = this;

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, function() { WebDeveloper.Outline.outlineTables([document]); });
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Outline.toggleFeatureOnTab = function(featureItem, tab, scriptCode, args)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "/features/js/outline.js", scriptCode, args);
};

// Toggles whether to show element tag names when outlining
WebDeveloper.Overlay.Outline.toggleShowElementTagNames = function()
{
  var featureItem = this;

  featureItem.classList.toggle("active");
  WebDeveloper.Storage.setItem("outline.show.element.tag.names", featureItem.classList.contains("active"));
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Outline.initialize);
}
else
{
  WebDeveloper.Overlay.Outline.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Common                 = WebDeveloper.Common || {};
WebDeveloper.Overlay                = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.animationSpeed = 100;

// Displays a notification
WebDeveloper.Common.displayNotification = function(message, parameters)
{
  // If parameters are set
  if(parameters)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString(message, parameters));
  }
  else
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(message));
  }
};

// Adds a feature on a tab
WebDeveloper.Overlay.addFeatureOnTab = function(featureItem, tab, scriptFiles, scriptCode, args)
{
  WebDeveloper.Overlay.addScriptsToTab(tab, scriptFiles, scriptCode, args, null);
};

// Adds a script to the tab
WebDeveloper.Overlay.addScriptToTab = function(tab, scriptCode, callback)
{
  chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scriptCode }).then(callback);
};

// Adds scripts to the tab
WebDeveloper.Overlay.addScriptsToTab = function(tab, scriptFiles, scriptCode, args, callback)
{
  // If the script file is not an array
  if(!Array.isArray(scriptFiles))
  {
    scriptFiles = [scriptFiles];
  }

  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: scriptFiles }).then(() =>
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scriptCode, args: args }).then(callback)
  );
};

// Handles a tab change
WebDeveloper.Overlay.changeTab = function(event)
{
  var eventTarget = event.target;

  // If the event target is a nav link
  if(eventTarget && eventTarget.classList.contains("nav-link"))
  {
    WebDeveloper.Overlay.closeConfirmation();
    WebDeveloper.Overlay.closeNotification();
    WebDeveloper.Overlay.Cookies.cancelAddCookie();
    WebDeveloper.Overlay.Resize.cancelResizeWindow();

    WebDeveloper.Storage.setItem("menu", eventTarget.parentElement.getAttribute("id"));
  }
};

// Checks that the extension has the necessary permissions (this is needed for Firefox where host_permissions are not granted by default)
WebDeveloper.Overlay.checkPermissions = function()
{
  chrome.permissions.contains({ origins: ["<all_urls>"] }, function(hasPermissions)
  {
    // If the extension does not have the necessary permissions
    if(!hasPermissions)
    {
      chrome.permissions.request({ origins: ["<all_urls>"] }, function(permissionGranted)
      {
        // If the permission was not granted
        if(!permissionGranted)
        {
          WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("permissionsRequired"), "danger");
        }
      });
    }
  });
};

// Closes the overlay
WebDeveloper.Overlay.close = function()
{
  window.close();
};

// Closes the confirmation
WebDeveloper.Overlay.closeConfirmation = function()
{
  document.getElementById("confirmation").classList.add("d-none");
};

// Closes the notification
WebDeveloper.Overlay.closeNotification = function()
{
  document.getElementById("notification").classList.add("d-none");
};

// Displays a confirmation
WebDeveloper.Overlay.displayConfirmation = function(title, message, buttonText, buttonIcon, callback)
{
  var buttonHTML   = buttonText;
  var confirmation = document.getElementById("confirmation");
  var button       = confirmation.querySelector(".btn-warning");

  // If the button icon is set
  if(buttonIcon)
  {
    buttonHTML = '<svg class="bi me-1"><use href="/svg/icons/icons.svg#' + buttonIcon + '"></svg>' + buttonText;
  }

  WebDeveloper.Overlay.closeNotification();

  // Removes any old event listeners
  button.replaceWith(button.cloneNode(true));

  button = confirmation.querySelector(".btn-warning");

  button.replaceChildren();

  // Cannot use DOMPurify to sanitize the HTML or it breaks the SVG icon
  button.insertAdjacentHTML("beforeend", buttonHTML);
  confirmation.querySelector("span").replaceChildren(message);
  confirmation.classList.remove("d-none");

  button.addEventListener("click", function()
  {
    callback();
    WebDeveloper.Overlay.closeConfirmation();
  });
};

// Displays a notification
WebDeveloper.Overlay.displayNotification = function(message, type)
{
  var notification = document.getElementById("notification");
  var span         = notification.querySelector("span");

  // If the type is not specified
  if(!type)
  {
    type = "success";
  }

  span.replaceChildren();
  span.insertAdjacentHTML("beforeend", DOMPurify.sanitize(message));
  notification.classList.remove("alert-danger", "alert-info", "alert-success", "alert-warning", "d-none");
  notification.classList.add("alert-" + type);
};

// Returns the selected tab
WebDeveloper.Overlay.getSelectedTab = function(callback)
{
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs)
  {
    callback(tabs[0]);
  });
};

// Returns the selected window
WebDeveloper.Overlay.getSelectedWindow = function(callback)
{
  chrome.windows.getCurrent(callback);
};

// Initializes the overlay
WebDeveloper.Overlay.initialize = function()
{
  var confirmationCancel = document.getElementById("confirmation-cancel");

  WebDeveloper.Storage.getItem("display_overlay_with", function(displayOverlayWith)
  {
    WebDeveloper.Overlay.labelMenu(document.querySelector("#cookies-toolbar > a"), WebDeveloper.Locales.getString("cookies"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#css-toolbar > a"), WebDeveloper.Locales.getString("css"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#disable-toolbar > a"), WebDeveloper.Locales.getString("disable"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#forms-toolbar > a"), WebDeveloper.Locales.getString("forms"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#images-toolbar > a"), WebDeveloper.Locales.getString("images"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#information-toolbar > a"), WebDeveloper.Locales.getString("information"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#miscellaneous-toolbar > a"), WebDeveloper.Locales.getString("miscellaneous"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#options-toolbar > a"), WebDeveloper.Locales.getString("options"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#outline-toolbar > a"), WebDeveloper.Locales.getString("outline"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#resize-toolbar > a"), WebDeveloper.Locales.getString("resize"), displayOverlayWith);
    WebDeveloper.Overlay.labelMenu(document.querySelector("#tools-toolbar > a"), WebDeveloper.Locales.getString("tools"), displayOverlayWith);

    // If the display overlay with setting is set to text
    if(displayOverlayWith == "text")
    {
      document.querySelector(".nav-tabs").classList.add("overlay-text");
    }
  });

  WebDeveloper.Storage.getItem("menu", function(menu)
  {
    // If the menu is not set
    if(!menu)
    {
      // Default to the cookies toolbar since disable is not available on all browsers
      menu = "cookies-toolbar";
    }

    // If the menu is set
    if(menu)
    {
      bootstrap.Tab.getOrCreateInstance(document.querySelector("#" + menu + " > a")).show();
    }
  });

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Storage.getFeaturesOnTab(tab.id, function(featuresOnTab)
    {
      // If there are features on the tab
      if(featuresOnTab)
      {
        // Loop through the features on the tab
        for(var i = 0, l = featuresOnTab.length; i < l; i++)
        {
          document.getElementById(featuresOnTab[i]).classList.add("active");
        }
      }
    });
  });

  confirmationCancel.append(WebDeveloper.Locales.getString("cancel"));

  WebDeveloper.Overlay.checkPermissions();

  confirmationCancel.addEventListener("click", WebDeveloper.Overlay.closeConfirmation);
  document.getElementById("notification-close").addEventListener("click", WebDeveloper.Overlay.closeNotification);
  document.querySelector(".container-fluid").addEventListener("click", WebDeveloper.Overlay.openURL);
  document.querySelector(".nav-tabs").addEventListener("click", WebDeveloper.Overlay.changeTab);
};

// Returns true if this is a valid tab
WebDeveloper.Overlay.isValidTab = function(tab)
{
  var url = tab.url;

  // If this is a chrome URL
  if(url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0 || url.indexOf("moz-extension://") === 0)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("internalBrowserPagesError"), "danger");

    return false;
  }
  else if(url.indexOf("https://addons.mozilla.org/") === 0 || url.indexOf("https://chrome.google.com/extensions/") === 0 || url.indexOf("https://chrome.google.com/webstore/") === 0 || url.indexOf("https://chromewebstore.google.com/") === 0)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("extensionGalleryError"), "danger");

    return false;
  }

  return true;
};

// Labels a menu
WebDeveloper.Overlay.labelMenu = function(menu, label, displayOverlayWith)
{
  // If the display overlay with setting is set to icons only
  if(displayOverlayWith == "icons")
  {
    menu.setAttribute("title", label);
  }
  else
  {
    menu.append(label);
  }
};

// Handles any overlay messages
WebDeveloper.Overlay.message = function(message, sender, sendResponse)
{
  // If the message type is a notification
  if(message.type == "display-notification")
  {
    WebDeveloper.Common.displayNotification(message.message, message.parameters);

    // No response required
    sendResponse({});
  }

  return true;
};

// Opens a generated tab
WebDeveloper.Overlay.openGeneratedTab = function(tabURL, tabIndex, data, locale)
{
  // Need to clone the data and locale to workaround Firefox dead object memory clean up
  var generatedData   = JSON.parse(JSON.stringify(data));
  var generatedLocale = JSON.parse(JSON.stringify(locale));
  var newTabIndex     = tabIndex + 1;

  chrome.tabs.create({ active: false, index: newTabIndex, url: tabURL }, function(openedTab)
  {
    var tabLoaded = function(tabId, tabInformation)
    {
      // If this is the opened tab and it finished loading
      if(tabId == openedTab.id && tabInformation.status && tabInformation.status == "complete")
      {
        var extensionTab = null;
        var tabs         = chrome.extension.getViews({ tabId: tabId, type: "tab" });

        // Vivaldi does not return tabs when searching for type tab
        if(tabs.length === 0)
        {
          tabs = chrome.extension.getViews({ tabId: tabId });
        }

        // Loop through the tabs
        for(var i = 0, l = tabs.length; i < l; i++)
        {
          extensionTab = tabs[i];

          extensionTab.WebDeveloper.Generated.initialized = true;

          extensionTab.WebDeveloper.Generated.initialize(generatedData, generatedLocale);
        }

        chrome.tabs.onUpdated.removeListener(tabLoaded);
        chrome.tabs.highlight({ tabs: newTabIndex });

        WebDeveloper.Overlay.close();
      }
    };

    chrome.tabs.onUpdated.addListener(tabLoaded);
  });
};

// Opens a tab to the URL
WebDeveloper.Overlay.openTab = function(tabURL)
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    chrome.tabs.create({ index: tab.index + 1, url: tabURL });
    WebDeveloper.Overlay.close();
  });
};

// Opens a URL from the overlay
WebDeveloper.Overlay.openURL = function(event)
{
  var eventTarget = event.target;

  // If the event target is set, is a link, has an href, and is an open URL link
  if(eventTarget && eventTarget.tagName && eventTarget.tagName.toLowerCase() == "a" && eventTarget.hasAttribute("href") && eventTarget.classList.contains("open-url"))
  {
    var href = eventTarget.getAttribute("href");

    WebDeveloper.Overlay.getSelectedTab(function(tab)
    {
      chrome.tabs.create({ index: tab.index + 1, url: href });
      WebDeveloper.Overlay.close();
    });

    event.preventDefault();
  }
};

// Opens a validation tab
WebDeveloper.Overlay.openValidationTab = function(tabURL, tabIndex, data)
{
  var newTabIndex = tabIndex + 1;

  chrome.tabs.create({ active: false, index: newTabIndex, url: tabURL }, function(openedTab)
  {
    var tabLoaded = function(tabId, tabInformation)
    {
      // If this is the opened tab and it finished loading
      if(tabId == openedTab.id && tabInformation.status && tabInformation.status == "complete")
      {
        var extensionTab = null;
        var tabs         = chrome.extension.getViews({ tabId: tabId, type: "tab" });

        // Loop through the tabs
        for(var i = 0, l = tabs.length; i < l; i++)
        {
          extensionTab = tabs[i];

          extensionTab.WebDeveloper.Validation.initialized = true;

          extensionTab.WebDeveloper.Validation.initialize(data);
        }

        chrome.tabs.onUpdated.removeListener(tabLoaded);
        chrome.tabs.highlight({ tabs: newTabIndex });

        WebDeveloper.Overlay.close();
      }
    };

    chrome.tabs.onUpdated.addListener(tabLoaded);
  });
};

// Sets a content setting
WebDeveloper.Overlay.setContentSetting = function(settingType, currentSetting, newSetting, menu, message)
{
  chrome.contentSettings[settingType].clear({}, function()
  {
    chrome.contentSettings[settingType].get({ primaryUrl: "http://*/*" }, function(details)
    {
      // If the setting is still set to the current setting
      if(details.setting == currentSetting)
      {
        chrome.contentSettings[settingType].set({ primaryPattern: "<all_urls>", setting: newSetting }, function()
        {
          WebDeveloper.Overlay.updateContentSettingMenu(menu, settingType);
          WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(message));
        });
      }
      else
      {
        WebDeveloper.Overlay.updateContentSettingMenu(menu, settingType);
        WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(message));
      }
    });
  });
};

// Toggles a content setting
WebDeveloper.Overlay.toggleContentSetting = function(settingType, menu, enableMessage, disableMessage)
{
  chrome.contentSettings[settingType].get({ primaryUrl: "http://*/*" }, function(details)
  {
    var currentSetting = details.setting;

    // If the setting is currently set to block
    if(currentSetting == "block")
    {
      WebDeveloper.Overlay.setContentSetting(settingType, currentSetting, "allow", menu, enableMessage);
    }
    else
    {
      WebDeveloper.Overlay.setContentSetting(settingType, currentSetting, "block", menu, disableMessage);
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.toggleFeatureOnTab = function(featureItem, tab, scriptFiles, scriptCode, args, closeOverlay)
{
  var feature = featureItem.getAttribute("id");

  WebDeveloper.Overlay.addScriptsToTab(tab, scriptFiles, scriptCode, args, function()
  {
    featureItem.classList.toggle("active");

    WebDeveloper.Storage.toggleFeatureOnTab(feature, tab, function()
    {
      // If the overlay should be closed
      if(closeOverlay)
      {
        WebDeveloper.Overlay.close();
      }
    });
  });
};

// Updates the menu
WebDeveloper.Overlay.updateContentSettingMenu = function(menu, settingType)
{
  // If content settings exists
  if(chrome.contentSettings)
  {
    chrome.contentSettings[settingType].get({ primaryUrl: "http://*/*" }, function(details)
    {
      // If the setting is currently set to block
      if(details.setting == "block")
      {
        menu.classList.add("active");
      }
      else if(menu.classList.contains("active"))
      {
        menu.classList.remove("active");
      }
    });
  }
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.initialize);
}
else
{
  WebDeveloper.Overlay.initialize();
}

chrome.runtime.onMessage.addListener(WebDeveloper.Overlay.message);

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Resize = WebDeveloper.Overlay.Resize || {};

// Cancels resizing the window
WebDeveloper.Overlay.Resize.cancelResizeWindow = function()
{
  document.getElementById("resize-window-dialog").classList.add("d-none");
  document.querySelector(".tab-content").classList.remove("d-none");
};

// Resizes the window to a custom size
WebDeveloper.Overlay.Resize.customResizeWindow = function(event)
{
  var eventTarget = event.target;

  // If the event target is a custom resize window option
  if(eventTarget && eventTarget.classList.contains("custom-resize-window"))
  {
    WebDeveloper.Overlay.Resize.resizeWindow(eventTarget.getAttribute("data-height"), eventTarget.getAttribute("data-width"));
  }
};

// Displays the resize dialog
WebDeveloper.Overlay.Resize.displayResizeDialog = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-window-size" }, function(response)
      {
        WebDeveloper.Overlay.Resize.resetResizeDialog(response);
        WebDeveloper.Overlay.closeConfirmation();
        WebDeveloper.Overlay.closeNotification();
        document.querySelector(".tab-content").classList.add("d-none");
        document.getElementById("resize-window-dialog").classList.remove("d-none");
        document.getElementById("resize-window-width").focus();
      });
    }
  });
};

// Displays the window size
WebDeveloper.Overlay.Resize.displayWindowSize = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-window-size" }, function(response)
      {
        WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString("displayWindowSizeResult", [response.outerWidth, response.outerHeight, response.innerWidth, response.innerHeight]), "info");
      });
    }
  });
};

// Opens the options to edit the resize dimensions
WebDeveloper.Overlay.Resize.editResizeDimensions = function()
{
  chrome.runtime.openOptionsPage();
  WebDeveloper.Overlay.close();
};

// Returns the locale for the view responsive layouts feature
WebDeveloper.Overlay.Resize.getViewResponsiveLayoutsLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.layouts                      = WebDeveloper.Locales.getString("layouts");
  locale.reloadLayouts                = WebDeveloper.Locales.getString("reloadLayouts");
  locale.responsiveLayouts            = WebDeveloper.Locales.getString("responsiveLayouts");
  locale.viewResponsiveLayoutsWarning = WebDeveloper.Locales.getString("viewResponsiveLayoutsWarning");

  return locale;
};

// Initializes the resize overlay
WebDeveloper.Overlay.Resize.initialize = function()
{
  var displayWindowSizeMenu     = document.getElementById("display-window-size");
  var editResizeDimensionsMenu  = document.getElementById("edit-resize-dimensions");
  var resizeWindowCancel        = document.getElementById("resize-window-cancel");
  var resizeWindowDialog        = document.getElementById("resize-window-dialog");
  var resizeWindowHeight        = document.getElementById("resize-window-height");
  var resizeWindowMenu          = document.getElementById("resize-window");
  var resizeWindowSubmit        = document.getElementById("resize-window-submit");
  var resizeWindowWidth         = document.getElementById("resize-window-width");
  var viewResponsiveLayoutsMenu = document.getElementById("view-responsive-layouts");

  document.querySelector('[for="resize-window-height"]').append(WebDeveloper.Locales.getString("height"));
  document.querySelector('[for="resize-window-width"]').append(WebDeveloper.Locales.getString("width"));
  displayWindowSizeMenu.append(WebDeveloper.Locales.getString("displayWindowSize"));
  editResizeDimensionsMenu.append(WebDeveloper.Locales.getString("editResizeDimensions"));
  resizeWindowCancel.append(WebDeveloper.Locales.getString("cancel"));
  resizeWindowDialog.querySelector("legend").append(WebDeveloper.Locales.getString("resizeWindow"));
  resizeWindowMenu.append(WebDeveloper.Locales.getString("resizeWindowMenu"));
  resizeWindowSubmit.append(WebDeveloper.Locales.getString("resize"));
  viewResponsiveLayoutsMenu.append(WebDeveloper.Locales.getString("viewResponsiveLayouts"));

  resizeWindowHeight.setAttribute("placeholder", WebDeveloper.Locales.getString("heightPlaceholder"));
  resizeWindowWidth.setAttribute("placeholder", WebDeveloper.Locales.getString("widthPlaceholder"));

  document.getElementById("custom-resize-options").addEventListener("click", WebDeveloper.Overlay.Resize.customResizeWindow);
  displayWindowSizeMenu.addEventListener("click", WebDeveloper.Overlay.Resize.displayWindowSize);
  editResizeDimensionsMenu.addEventListener("click", WebDeveloper.Overlay.Resize.editResizeDimensions);
  resizeWindowCancel.addEventListener("click", WebDeveloper.Overlay.Resize.cancelResizeWindow);
  resizeWindowDialog.addEventListener("submit", function(event) { event.preventDefault(); });
  resizeWindowHeight.addEventListener("keypress", WebDeveloper.Overlay.Resize.resizeWindowKeyPress);
  resizeWindowMenu.addEventListener("click", WebDeveloper.Overlay.Resize.displayResizeDialog);
  resizeWindowSubmit.addEventListener("click", WebDeveloper.Overlay.Resize.submitResizeWindow);
  resizeWindowWidth.addEventListener("keypress", WebDeveloper.Overlay.Resize.resizeWindowKeyPress);
  viewResponsiveLayoutsMenu.addEventListener("click", WebDeveloper.Overlay.Resize.viewResponsiveLayouts);

  WebDeveloper.Overlay.Resize.setupCustomResizeOptions();
};

// Resets the add cookie dialog
WebDeveloper.Overlay.Resize.resetResizeDialog = function(response)
{
  var resizeWindowHeight = document.getElementById("resize-window-height");
  var resizeWindowWidth  = document.getElementById("resize-window-width");

  resizeWindowHeight.value = response.outerHeight;
  resizeWindowWidth.value  = response.outerWidth;

  resizeWindowHeight.classList.remove("is-invalid");
  resizeWindowWidth.classList.remove("is-invalid");
};

// Resizes the window
WebDeveloper.Overlay.Resize.resizeWindow = function(height, width)
{
  WebDeveloper.Overlay.getSelectedWindow(function(selectedWindow)
  {
    var size = {};

    // Set the window state to normal before resizing the window
    size.state = "normal";

    // If the height is not a wildcard
    if(height != "*")
    {
      size.height = parseInt(height, 10);
    }

    // If the width is not a wildcard
    if(width != "*")
    {
      size.width = parseInt(width, 10);
    }

    chrome.windows.update(selectedWindow.id, size, function()
    {
      WebDeveloper.Overlay.close();
    });
  });
};

// Handles a key press when resizing the window
WebDeveloper.Overlay.Resize.resizeWindowKeyPress = function(event)
{
  // If the enter key was pressed
  if(event.keyCode == 13)
  {
    WebDeveloper.Overlay.Resize.submitResizeWindow();
  }
};

// Sets up the custom resize options
WebDeveloper.Overlay.Resize.setupCustomResizeOptions = function()
{
  var customResizeOptionTemplate = document.getElementById("custom-resize-option").innerHTML;
  var editResizeDimensions       = document.getElementById("edit-resize-dimensions").parentElement;

  Mustache.parse(customResizeOptionTemplate);

  WebDeveloper.Storage.getItem("resize_count", function(resizeOptionCount)
  {
    var resizeStorageOptionKeys = [];

    // Loop through the resize options
    for(var i = 1, l = resizeOptionCount; i <= l; i++)
    {
      resizeStorageOptionKeys.push("resize_" + i + "_description", "resize_" + i + "_height", "resize_" + i + "_width");
    }

    WebDeveloper.Storage.getItems(resizeStorageOptionKeys, function(resizeStorageOptions)
    {
      var description  = null;
      var height       = 0;
      var resizeOption = null;
      var width        = 0;

      // Loop through the resize options in reverse to allow insertAdjacentHTML to insert in the correct order
      for(i = resizeOptionCount, l = 0; i > l; i--)
      {
        description = resizeStorageOptions["resize_" + i + "_description"];
        height      = resizeStorageOptions["resize_" + i + "_height"];
        width       = resizeStorageOptions["resize_" + i + "_width"];

        // If the description, height and width are set
        if(description && height > 0 && width > 0)
        {
          resizeOption = {};

          resizeOption.description = description;
          resizeOption.height      = height;
          resizeOption.width       = width;

          editResizeDimensions.insertAdjacentHTML("afterbegin", DOMPurify.sanitize(Mustache.render(customResizeOptionTemplate, resizeOption)));
        }
      }
    });
  });
};

// Resizes the window
WebDeveloper.Overlay.Resize.submitResizeWindow = function()
{
  // If the dialog is valid
  if(WebDeveloper.Overlay.Resize.validateResizeDialog())
  {
    WebDeveloper.Overlay.Resize.resizeWindow(document.getElementById("resize-window-height").value.trim(), document.getElementById("resize-window-width").value.trim());
  }
};

// Returns true if the resize dialog is valid
WebDeveloper.Overlay.Resize.validateResizeDialog = function()
{
  var height      = document.getElementById("resize-window-height");
  var heightValue = height.value.trim();
  var valid       = true;
  var width       = document.getElementById("resize-window-width");
  var widthValue  = width.value.trim();

  // If the height is not set
  if(heightValue == "")
  {
    document.getElementById("resize-window-height-invalid").replaceChildren(WebDeveloper.Locales.getString("heightCannotBeEmpty"));
    height.classList.add("is-invalid");

    valid = false;
  }
  else if(heightValue != "*" && (parseInt(heightValue, 10) != heightValue || heightValue <= 0))
  {
    document.getElementById("resize-window-height-invalid").replaceChildren(WebDeveloper.Locales.getString("heightNotValid"));
    height.classList.add("is-invalid");

    valid = false;
  }
  else
  {
    height.classList.remove("is-invalid");
  }

  // If the width is not set
  if(widthValue == "")
  {
    document.getElementById("resize-window-width-invalid").replaceChildren(WebDeveloper.Locales.getString("widthCannotBeEmpty"));
    width.classList.add("is-invalid");

    valid = false;
  }
  else if(widthValue != "*" && (parseInt(widthValue, 10) != widthValue || widthValue <= 0))
  {
    document.getElementById("resize-window-width-invalid").replaceChildren(WebDeveloper.Locales.getString("widthNotValid"));
    width.classList.add("is-invalid");

    valid = false;
  }
  else
  {
    width.classList.remove("is-invalid");
  }

  return valid;
};

// Displays the responsive layouts for the page
WebDeveloper.Overlay.Resize.viewResponsiveLayouts = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var data = {};

      data.layouts = [];
      data.pageURL = tab.url;

      WebDeveloper.Storage.getItem("responsive_layout_count", function(responsiveLayoutOptionCount)
      {
        var responsiveLayoutStorageOptionKeys = [];

        // Loop through the tools
        for(var i = 1, l = responsiveLayoutOptionCount; i <= l; i++)
        {
          responsiveLayoutStorageOptionKeys.push("responsive_layout_" + i + "_description", "responsive_layout_" + i + "_height", "responsive_layout_" + i + "_width");
        }

        WebDeveloper.Storage.getItems(responsiveLayoutStorageOptionKeys, function(responsiveLayoutStorageOptions)
        {
          var description = null;
          var height      = 0;
          var layout      = null;
          var width       = 0;

          // Loop through the tools
          for(i = 1, l = responsiveLayoutOptionCount; i <= l; i++)
          {
            description = responsiveLayoutStorageOptions["responsive_layout_" + i + "_description"];
            height      = responsiveLayoutStorageOptions["responsive_layout_" + i + "_height"];
            width       = responsiveLayoutStorageOptions["responsive_layout_" + i + "_width"];

            // If the description, height and width are set
            if(description && height > 0 && width > 0)
            {
              layout             = {};
              layout.description = description;
              layout.height      = height;
              layout.width       = width;

              data.layouts.push(layout);
            }
          }

          WebDeveloper.Overlay.openGeneratedTab(chrome.runtime.getURL("/generated/view-responsive-layouts.html"), tab.index, data, WebDeveloper.Overlay.Resize.getViewResponsiveLayoutsLocale());
        });
      });
    }
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Resize.initialize);
}
else
{
  WebDeveloper.Overlay.Resize.initialize();
}

var WebDeveloper = WebDeveloper || {}; // eslint-disable-line no-redeclare, no-use-before-define

WebDeveloper.Overlay       = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Tools = WebDeveloper.Overlay.Tools || {};

// Opens a custom tool
WebDeveloper.Overlay.Tools.customTool = function(event)
{
  var eventTarget = event.target;

  // If the event target is a custom tool
  if(eventTarget && eventTarget.classList.contains("custom-tool"))
  {
    WebDeveloper.Overlay.getSelectedTab(function(tab)
    {
      WebDeveloper.Overlay.openTab(eventTarget.getAttribute("data-url") + encodeURIComponent(tab.url));
    });
  }
};

// Opens the options to edit the tools
WebDeveloper.Overlay.Tools.editTools = function()
{
  chrome.runtime.openOptionsPage();
  WebDeveloper.Overlay.close();
};

// Initializes the tools overlay
WebDeveloper.Overlay.Tools.initialize = function()
{
  var editToolsMenu         = document.getElementById("edit-tools");
  var validateLocalCSSMenu  = document.getElementById("validate-local-css");
  var validateLocalHTMLMenu = document.getElementById("validate-local-html");
  var viewSourceMenu        = document.getElementById("view-source");

  editToolsMenu.append(WebDeveloper.Locales.getString("editTools"));
  validateLocalCSSMenu.append(WebDeveloper.Locales.getString("validateLocalCSS"));
  validateLocalHTMLMenu.append(WebDeveloper.Locales.getString("validateLocalHTML"));
  viewSourceMenu.append(WebDeveloper.Locales.getString("viewSource"));

  document.getElementById("custom-tools").addEventListener("click", WebDeveloper.Overlay.Tools.customTool);
  editToolsMenu.addEventListener("click", WebDeveloper.Overlay.Tools.editTools);
  validateLocalCSSMenu.addEventListener("click", WebDeveloper.Overlay.Tools.validateLocalCSS);
  validateLocalHTMLMenu.addEventListener("click", WebDeveloper.Overlay.Tools.validateLocalHTML);
  viewSourceMenu.addEventListener("click", WebDeveloper.Overlay.Tools.viewSource);

  WebDeveloper.Overlay.Tools.setupCustomTools();
};

// Sets up the custom tools
WebDeveloper.Overlay.Tools.setupCustomTools = function()
{
  var customToolTemplate = document.getElementById("custom-tool").innerHTML;
  var editTools          = document.getElementById("edit-tools").parentElement;

  Mustache.parse(customToolTemplate);

  WebDeveloper.Storage.getItem("tool_count", function(toolsCount)
  {
    var toolsStorageOptionKeys = [];

    // Loop through the tools
    for(var i = 1, l = toolsCount; i <= l; i++)
    {
      toolsStorageOptionKeys.push("tool_" + i + "_description", "tool_" + i + "_url");
    }

    WebDeveloper.Storage.getItems(toolsStorageOptionKeys, function(toolsStorageOptions)
    {
      var description = null;
      var tool        = null;
      var url         = null;

      // Loop through the tools in reverse to allow insertAdjacentHTML to insert in the correct order
      for(i = toolsCount, l = 0; i > l; i--)
      {
        description = toolsStorageOptions["tool_" + i + "_description"];
        url         = toolsStorageOptions["tool_" + i + "_url"];

        // If the description and url are set
        if(description && url)
        {
          tool = {};

          tool.description = description;
          tool.url         = url;

          editTools.insertAdjacentHTML("afterbegin", DOMPurify.sanitize(Mustache.render(customToolTemplate, tool)));
        }
      }
    });
  });
};

// Validates the CSS of the local page
WebDeveloper.Overlay.Tools.validateLocalCSS = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, { type: "get-css" }, function(data)
      {
        var contentDocument = null;
        var styles          = "";
        var documents       = data.documents;
        var styleSheets     = [];

        // Loop through the documents
        for(var i = 0, l = documents.length; i < l; i++)
        {
          contentDocument = documents[i];
          styleSheets     = styleSheets.concat(contentDocument.styleSheets);

          // If there are embedded styles
          if(contentDocument.embedded)
          {
            styles += contentDocument.embedded;
          }
        }

        chrome.runtime.sendMessage({ errorMessage: "", type: "get-url-contents", urls: styleSheets }, function(urlContents)
        {
          // Loop through the URL contents
          for(i = 0, l = urlContents.length; i < l; i++)
          {
            styles += urlContents[i].content;
          }

          WebDeveloper.Overlay.openValidationTab(chrome.runtime.getURL("/generated/validate-local-css.html"), tab.index, styles);
        });
      });
    }
  });
};

// Validates the HTML of the local page
WebDeveloper.Overlay.Tools.validateLocalHTML = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.runtime.sendMessage({ errorMessage: "", type: "get-url-contents", urls: [tab.url] }, function(data)
      {
        WebDeveloper.Overlay.openValidationTab(chrome.runtime.getURL("/generated/validate-local-html.html"), tab.index, data[0].content);
      });
    }
  });
};

// Displays the source of the page
WebDeveloper.Overlay.Tools.viewSource = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Overlay.openTab("view-source:" + tab.url);
  });
};

// If the document is still loading
if(document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", WebDeveloper.Overlay.Tools.initialize);
}
else
{
  WebDeveloper.Overlay.Tools.initialize();
}
