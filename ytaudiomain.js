function adsRequest(request){
  function regExpCheck(url){
    var result = /\%22ad|\&adfmt\=|\.atdmt\.|watch7ad\_|\.innovid\.|\/adsales\/|\/adserver\/|\.fwmrm\.net|\/stats\/ads|ad\d-\w*\.swf$|\.doubleclick\.|\/www\-advertise\.|google\-analytics\.|\.googleadservices\.|\.googletagservices\.|\.googlesyndication\.|\.serving\-sys\.com\/|youtube\.com\/ptracking\?|:\/\/.*\.google\.com\/uds\/afs|\/csi\?v\=\d+\&s\=youtube\&action\=|[\=\&\_\-\.\/\?\s]ad[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]ads[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adid[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adunit[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adhost[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adview[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]pagead[\=\&\_\-\.\/\?\s\d]|[\=\&\_\-\.\/\?\s]googleads[\=\&\_\-\.\/\?\s]/i.test(url);
    /*  */
    return result;
  }

  if (regExpCheck(request.url) && !!ytTabList[request.tabId]) {
    var taburl = ytTabList[request.tabId].url;
    if (taburl.indexOf(".youtube.com/") != -1){
      return {cancel: true};
    }
    else{
      return {cancel: false};
    }
  }

}

/*cleanup overlays if user toggles addon outside of a youtube tab*/
function cleanupOverlay(){
  browser.tabs.query({url: "*://*.youtube.com/*"}).then(tabs => {
    for (let tab of tabs){
      browser.tabs.executeScript(tab.id, {file: "cleanup.js"});
    }
  });
}

/* handle browseraction click and toggle webrequest listener*/
function toggleListener(tabDetails = false){
  function checkReload(clickedTab){
    //Check active tab for youtube url, reload tab if youtube url is found
    if(clickedTab.url.indexOf(".youtube.com/") != -1) {
      browser.tabs.reload(clickedTab.id, {bypassCache: true});
      //user toggled from youtube tab, reloading tab
    }
    else {
      return;
      //user toggled outside of a youtube tab, not reloading tab
    }
  }
  if (browser.webRequest.onBeforeRequest.hasListener(matchAudio)) {
    browser.webRequest.onBeforeRequest.removeListener(matchAudio);
    browser.webRequest.onBeforeRequest.removeListener(adsRequest);
    browser.browserAction.setIcon({path: "icons/ytaudioOFF32.png"});
    browser.browserAction.setTitle({title: "YoutubeAUDIO Disabled"});
    browser.storage.local.set({ save_state: "disabled" });
    cleanupOverlay();
  }
  else{
    // listen for all youtube videoplayback requests
    browser.webRequest.onBeforeRequest.addListener(matchAudio,
      {urls: ["*://*.googlevideo.com/videoplayback*"]}, ["blocking"] );
    browser.webRequest.onBeforeRequest.addListener(adsRequest, {"urls" : ["*://*.google.com/*", "*://*.googleapis.com/*", "*://*.youtube.com/*", "*://*.serving-sys.com/*", "*://*.googlesyndication.com/*", "*://*.googletagservices.com/*", "*://*.googleadservices.com/*", "*://*.google-analytics.com/*", "*://*.doubleclick.net/*", "*://*.atdmt.com/*", "*://*.innovid.com/*", "*://*.fwmrm.net/*"]}, ["blocking"]);
    browser.browserAction.setIcon({path: "icons/ytaudioON32.png"});
    browser.browserAction.setTitle({title: "YoutubeAUDIO Enabled"});
    browser.storage.local.set({ save_state: "enabled" });
  }
  if (!tabDetails) return; else checkReload(tabDetails);
}

/* execute youtubepage.js in tab id of webrequest, passing the audio source URL*/
function execTab(requestedTab, strippedURL){
  var jsString = "var sourceURL = "+JSON.stringify(strippedURL)+";";
  browser.tabs.executeScript(requestedTab.id, {code: jsString}, function(){
    browser.tabs.executeScript(
      requestedTab.id,
      {file: "youtubepage.js"}
    )
  });
}

/* match youtube requests for webm/mp4 audio, blocking any video
   parsed url is marked with bypasscheck parameter then execTab is called with audio source url and relevant tab id
   skips requests outside of .youtube.com */
function matchAudio(ytRequest) {
  var taburl = ytTabList[ytRequest.tabId].url;
  //#region skipembed
  if (taburl.indexOf(".youtube.com/") == -1){
    return{cancel: false};
  }
  //#endregion

  var youtubeURL = unescape(ytRequest.url);
  if (youtubeURL.indexOf("bypasscheck") != -1){
    return { cancel: false};
  }

  else if (youtubeURL.indexOf("redirector.googlevideo.com") != -1) {
    if (taburl.indexOf(".youtube.com/") != -1){
      return {cancel: true};
    }
    else{
      return {cancel: false};
    }
  }

	else if	(youtubeURL.indexOf("audio/mp4") != -1 || youtubeURL.indexOf("audio/webm") != -1) {

		if (youtubeURL.indexOf("&range=0") != -1){
			var strippedURL = youtubeURL.split("&range=0")[0].concat("&bypasscheck=1");
      execTab(ytTabList[ytRequest.tabId], strippedURL);
			return { cancel: false };
    }
    else {
      return { cancel: true };
    }
  }
  else {
    return { cancel: true };
  }
}

//load previous enabled/disabled state
function loadState(storage){
  switch (storage.save_state) {
    case "disabled":
      break;
    default:
      toggleListener();
  }
}

//keep tab url list up to date
function onUpdatedListener(tabId, changeInfo, tab) {
    ytTabList[tab.id] = tab;
}
function onRemovedListener(tabId) {
    delete ytTabList[tabId];
}

var ytTabList = {};

browser.tabs.query({}).then(tabs => {
  for (let tab of tabs){
    ytTabList[tab.id] = tab;
  }
});

//listen for tab changes
browser.tabs.onUpdated.addListener(onUpdatedListener);
browser.tabs.onRemoved.addListener(onRemovedListener);

//browser action click event, callback toggles webrequest listener and browseraction icons
browser.browserAction.onClicked.addListener(toggleListener);

browser.storage.local.get("save_state").then(loadState);
