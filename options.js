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
  var radioval = arg.target.value
  var mode_setter = browser.storage.local.set({ tab_mode: radioval });
  function dirtycleanup(tabs) {
    tabcount = Object.keys(tabs).length;
    if(tabcount==0){
      browser.runtime.reload();
    }
    else{
      for (let tab of tabs) {
        browser.tabs.executeScript(tab.id, {file: "janitor.js"});
      }
    }
  }

  var querying = browser.tabs.query({url: "*://*.youtube.com/*"});
  querying.then(dirtycleanup);
}

function restoreOptions() {
  var mode_getter = browser.storage.local.get("tab_mode");
  mode_getter.then((obj) => {
    switch (obj.tab_mode) {
      case "tabs":
        document.getElementById("tabs").checked = true;
        break;
      default:
        document.getElementById("global").checked = true;
    }
  });

}

browser.runtime.onMessage.addListener(janitormessage);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("settingform").addEventListener("change", saveOptions);
