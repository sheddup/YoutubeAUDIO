var msgcounter = 0;
var tabcount = 0;
function janitormessage(msg, sender, sendResponse){
  if (msg.msg == "clean") {
    msgcounter++;
    if (msgcounter == tabcount){
      msgcounter = 0;
      tabcount = 0;
      browser.runtime.reload();
    }
  }
}

function saveOptions(arg) {
  arg.stopPropagation();
  if (arg.target.id == "thumbpref") {
    if (arg.target.checked) {
      browser.storage.local.set({ thumb_pref: "enabled" }).then(() => browser.runtime.sendMessage({"newval": true}));
    }
    else {
      browser.storage.local.set({ thumb_pref: "disabled" }).then(() => browser.runtime.sendMessage({"newval": false}));
    }
  }
  else {
    var radioval = arg.target.value;
    browser.storage.local.set({ tab_mode: radioval }).then(() => {
      browser.tabs.query({url: "*://*.youtube.com/*"}).then(tabs => {
        tabcount = Object.keys(tabs).length;
        if(tabcount==0){
          browser.runtime.reload();
        }
        else{
          for (let tab of tabs) {
            browser.tabs.executeScript(tab.id, {file: "janitor.js"});
          }
        }
      });
    });
  }
}

function restoreOptions() {
  var mode_getter = browser.storage.local.get("tab_mode");
  var thumb_getter = browser.storage.local.get("thumb_pref");
  mode_getter.then((obj) => {
    switch (obj.tab_mode) {
      case "tabs":
        document.getElementById("tabs").checked = true;
        break;
      default:
        document.getElementById("global").checked = true;
    }
  });

  thumb_getter.then((obj) => {
    switch (obj.thumb_pref) {
      case "disabled":
        document.getElementById("thumbpref").checked = false;
        break;
      default:
        document.getElementById("thumbpref").checked = true;
    }
  });
}

browser.runtime.onMessage.addListener(janitormessage);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("settingform").addEventListener("change", saveOptions);
document.getElementById("thumbpref").addEventListener("change", saveOptions);
