'use strict';

let sidebarVisibility = document.getElementById('sidebarVisibility');

// Saves options to chrome.storage
function save_options() {
  let sidebarSetting;
  sidebarSetting = sidebarVisibility.checked;
  chrome.storage.local.set({
    sidebar: sidebarSetting
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value sidebar = 'false'
  chrome.storage.local.get({
    sidebar: false
  }, function(items) {
    sidebarVisibility.checked = items.sidebar;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('sidebarVisibility').addEventListener('change', save_options);