function adsRequest(request){
  let cancelReq = false;
  /* code in this function modified from MPL 2.0 licensed extension: https://addons.mozilla.org/en-US/firefox/addon/youtube-adblock/versions/0.1.5 */
  function regExpCheck(url){
    /* eslint-disable no-useless-escape */
    const result = /\%22ad|\&adfmt\=|\.atdmt\.|watch7ad\_|\.innovid\.|\/adsales\/|\/adserver\/|\.fwmrm\.net|\/stats\/ads|ad\d-\w*\.swf$|\.doubleclick\.|\/www\-advertise\.|google\-analytics\.|\.googleadservices\.|\.googletagservices\.|\.googlesyndication\.|\.serving\-sys\.com\/|youtube\.com\/ptracking\?|:\/\/.*\.google\.com\/uds\/afs|\/csi\?v\=\d+\&s\=youtube\&action\=|[\=\&\_\-\.\/\?\s]ad[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]ads[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adid[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adunit[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adhost[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adview[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]pagead[\=\&\_\-\.\/\?\s\d]|[\=\&\_\-\.\/\?\s]googleads[\=\&\_\-\.\/\?\s]/i.test(url);
    /* eslint-enable no-useless-escape */
    return result;
  }

  if(regExpCheck(request.url) && !!ytTabList[request.tabId]){
    const taburl = ytTabList[request.tabId].url;
    if(taburl.indexOf(".youtube.com/") !== -1){
      cancelReq = true;
    }
  }
  return { cancel: cancelReq };
}

/*gracefully cleanup any existing player overlays*/
function cleanupOverlay(){
  browser.tabs.query({ url: "*://*.youtube.com/*" }).then(tabs => {
    for(const tab of tabs){
      browser.tabs.executeScript(tab.id, { file: "/scripts/content_scripts/cleanup.js" });
    }
  });
}

function checkReload(clickedTab){
  //Check active tab for youtube url, reload tab if youtube url is found
  if(clickedTab.url.indexOf(".youtube.com/") !== -1){
    browser.tabs.reload(clickedTab.id, { bypassCache: true });
    //user toggled from youtube tab, reloading tab
  }
}

const fnObj = {};
/* handle browseraction click and toggle webrequest listener*/
function toggleTab(tabDetails = false){
  const tabid = tabDetails.id;
  const tabaudioFN = "tab" + tabid.toString();
  const tabadsFN = "ads" + tabid.toString();
  if(typeof fnObj[tabaudioFN] !== "undefined"){
    if(browser.webRequest.onBeforeRequest.hasListener(fnObj[tabaudioFN])){
      browser.webRequest.onBeforeRequest.removeListener(fnObj[tabaudioFN]);
      browser.webRequest.onBeforeRequest.removeListener(fnObj[tabadsFN]);

      browser.browserAction.setIcon({ path: "icons/ytaudioOFF32.png", tabId: tabid });
      browser.browserAction.setTitle({ title: "YoutubeAUDIO Disabled", tabId: tabid });

      delete fnObj[tabaudioFN];
      delete fnObj[tabadsFN];
    }
  }
  else{
    fnObj[tabaudioFN] = function(arg){ return matchAudio(arg); };
    fnObj[tabadsFN] = function(arg){ return adsRequest(arg); };

    browser.webRequest.onBeforeRequest.addListener(fnObj[tabaudioFN],
      { urls: ["*://*.googlevideo.com/videoplayback*"], tabId: tabid }, ["blocking"]);
    browser.webRequest.onBeforeRequest.addListener(fnObj[tabadsFN], { urls: ["*://*.google.com/*", "*://*.googleapis.com/*", "*://*.youtube.com/*", "*://*.serving-sys.com/*", "*://*.googlesyndication.com/*", "*://*.googletagservices.com/*", "*://*.googleadservices.com/*", "*://*.google-analytics.com/*", "*://*.doubleclick.net/*", "*://*.atdmt.com/*", "*://*.innovid.com/*", "*://*.fwmrm.net/*"], tabId: tabid }, ["blocking"]);

    browser.browserAction.setIcon({ path: "icons/ytaudioON32.png", tabId: tabid });
    browser.browserAction.setTitle({ title: "YoutubeAUDIO Enabled", tabId: tabid });
  }
  if(tabDetails) checkReload(tabDetails);
}

function toggleGlobal(tabDetails = false){
  if(browser.webRequest.onBeforeRequest.hasListener(matchAudio)){
    browser.webRequest.onBeforeRequest.removeListener(matchAudio);
    browser.webRequest.onBeforeRequest.removeListener(adsRequest);
    browser.browserAction.setIcon({ path: "icons/ytaudioOFF32.png" });
    browser.browserAction.setTitle({ title: "YoutubeAUDIO Disabled" });
    browser.storage.local.set({ save_state: "disabled" });
    cleanupOverlay();
  }
  else{
    // listen for all youtube videoplayback requests
    browser.webRequest.onBeforeRequest.addListener(matchAudio,
      { urls: ["*://*.googlevideo.com/videoplayback*"] }, ["blocking"]);
    browser.webRequest.onBeforeRequest.addListener(adsRequest, { urls: ["*://*.google.com/*", "*://*.googleapis.com/*", "*://*.youtube.com/*", "*://*.serving-sys.com/*", "*://*.googlesyndication.com/*", "*://*.googletagservices.com/*", "*://*.googleadservices.com/*", "*://*.google-analytics.com/*", "*://*.doubleclick.net/*", "*://*.atdmt.com/*", "*://*.innovid.com/*", "*://*.fwmrm.net/*"] }, ["blocking"]);
    browser.browserAction.setIcon({ path: "icons/ytaudioON32.png" });
    browser.browserAction.setTitle({ title: "YoutubeAUDIO Enabled" });
    browser.storage.local.set({ save_state: "enabled" });
  }
  if(tabDetails) checkReload(tabDetails);
}

/* execute youtubepage.js in tab id of webrequest, passing the audio source URL*/
function execTab(requestedTabID, strippedURL){
  const jsString = "var sourceURL = " + JSON.stringify(strippedURL) + ";var thumbpref = " + enabledThumb + ";";
  browser.tabs.executeScript(requestedTabID, { code: jsString }, () => {
    browser.tabs.executeScript(requestedTabID, { file: "/scripts/content_scripts/youtubepage.js" });
  });
}

/* match youtube requests for webm/mp4 audio, blocking any video
   parsed url is marked with bypasscheck parameter then execTab is called with audio source url and relevant tab id
   skips requests outside of .youtube.com */
function matchAudio(ytRequest){
  const taburl = ytTabList[ytRequest.tabId].url;
  const youtubeURL = unescape(ytRequest.url);

  if(taburl.indexOf(".youtube.com/") === -1){
    //dont block requests outside of youtube i.e embedded videos
    return { cancel: false };
  }

  if(youtubeURL.indexOf("bypasscheck") !== -1){
    //dont block parsed audio URL
    return { cancel: false };
  }

  if(youtubeURL.indexOf("redirector.googlevideo.com") !== -1){
    if(taburl.indexOf(".youtube.com/") !== -1){
      return { cancel: true };
    }
    return { cancel: false };
  }

  if(youtubeURL.indexOf("&range=0") !== -1 && (youtubeURL.indexOf("audio/mp4") !== -1 || youtubeURL.indexOf("audio/webm") !== -1)){
    const strippedURL = youtubeURL.split("&range=0")[0].concat("&bypasscheck=1");
    execTab(ytRequest.tabId, strippedURL);
    return { cancel: false }; //don't cancel req, cancelling range=0(init) request causes the yt player to restart the video over and over:/
  }
  return { cancel: true };
}

//#region keep tab url list up to date
function onUpdatedListener(tabId, changeInfo, tab){
  ytTabList[tab.id] = { url: tab.url };
}
function onRemovedListener(tabId){
  delete ytTabList[tabId];
  delete fnObj["tab" + tabId.toString()];
  delete fnObj["ads" + tabId.toString()];
}

let ytTabList = {};
let enabledThumb = true;
browser.tabs.query({}).then(tabs => {
  for(const tab of tabs){
    ytTabList[tab.id] = { url: tab.url };
  }
});

//listen for tab changes
browser.tabs.onUpdated.addListener(onUpdatedListener);
browser.tabs.onRemoved.addListener(onRemovedListener);
//#endregion

function loadGlobalState(){
  function loadState(storage){
    switch(storage.save_state){
      case "disabled":
        break;
      default:
        toggleGlobal();
    }
  }
  browser.browserAction.onClicked.addListener(toggleGlobal);
  browser.storage.local.get("save_state").then(loadState);
}

function loadTabMode(storage){
  const loadedMode = storage.tab_mode;
  switch(loadedMode){
    case "tabs":
      browser.browserAction.onClicked.addListener(toggleTab);
      break;
    case "global":
      loadGlobalState();
      break;
    default:
      browser.storage.local.set({ tab_mode: "tabs", last_mode: "tabs" });
      browser.browserAction.onClicked.addListener(toggleTab);
  }
  if(loadedMode){
    const lastMode = browser.storage.local.get("last_mode");
    lastMode.then((obj) => {
      const last = obj.last_mode;
      if(last !== loadedMode){
        const msg = { tabs: "Per tab mode now active", global: "All tabs mode now active" };
        browser.notifications.create({
          type: "basic",
          title: "YoutubeAUDIO",
          message: msg[loadedMode]
        });
        browser.storage.local.set({ last_mode: loadedMode });
      }
    });
  }
}
function loadedThumb(storage){
  switch(storage.thumb_pref){
    case "disabled":
      enabledThumb = false;
      break;
    default:
      enabledThumb = true;
  }
}
function changeThumb(msg){
  enabledThumb = msg.newval;
}
function firstInstall(details){
  browser.storage.local.get("seen_options").then((obj) => {
    if(!obj.seen_options){
      browser.runtime.openOptionsPage().then(() => {
        browser.storage.local.set({ seen_options: true });
        if(details.reason === "install"){
          browser.notifications.create({
            type: "basic",
            title: "YoutubeAUDIO: Thank you for installing me",
            message: "Use this about:addons options page to configure behaviour."
          });
        }
      });
    }
  });
  // if (details.reason == "update") {
  //   browser.notifications.create({
  //     "type": "basic",
  //     "title": "YoutubeAUDIO: New in 1.5.3",
  //     "message": "You can now disable thumbnails in the options page."
  //   });
  // }
}

browser.runtime.onInstalled.addListener(firstInstall);
browser.storage.local.get("tab_mode").then(loadTabMode);
browser.storage.local.get("thumb_pref").then(loadedThumb);
browser.runtime.onMessage.addListener(changeThumb);
