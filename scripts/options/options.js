let msgcounter = 0;
let tabcount = 0;
function janitormessage(msg){
  if(msg.msg === "clean"){
    msgcounter++;
    if(msgcounter === tabcount){
      msgcounter = 0;
      tabcount = 0;
      browser.runtime.reload();
    }
  }
}

function saveOptions(arg){
  arg.stopPropagation();
  if(arg.target.id === "thumbpref"){
    if(arg.target.checked){
      browser.storage.local.set({ thumb_pref: "enabled" }).then(() => browser.runtime.sendMessage({ newval: true }));
    }
    else{
      browser.storage.local.set({ thumb_pref: "disabled" }).then(() => browser.runtime.sendMessage({ newval: false }));
    }
  }
  else{
    const radioval = arg.target.value;
    browser.storage.local.set({ tab_mode: radioval }).then(() => {
      browser.tabs.query({ url: "*://*.youtube.com/*" }).then(tabs => {
        tabcount = Object.keys(tabs).length;
        if(tabcount === 0){
          browser.runtime.reload();
        }
        else{
          for(const tab of tabs){
            browser.tabs.executeScript(tab.id, { file: "/scripts/options/janitor.js" });
          }
        }
      });
    });
  }
}

function restoreOptions(){
  const modeGetter = browser.storage.local.get("tab_mode");
  const thumbGetter = browser.storage.local.get("thumb_pref");
  modeGetter.then((obj) => {
    switch(obj.tab_mode){
      case "tabs":
        document.getElementById("tabs").checked = true;
        break;
      default:
        document.getElementById("global").checked = true;
    }
  });

  thumbGetter.then((obj) => {
    switch(obj.thumb_pref){
      case "disabled":
        document.getElementById("thumbpref").checked = false;
        break;
      default:
        document.getElementById("thumbpref").checked = true;
    }
  });
}

browser.runtime.onMessage.addListener(janitormessage);
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("settingform").addEventListener("change", saveOptions);
document.getElementById("thumbpref").addEventListener("change", saveOptions);
