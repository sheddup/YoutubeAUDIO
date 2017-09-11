function onError(error) {
  console.error(`Error: ${error}`);
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
    browser.browserAction.setIcon({path: "icons/ytaudioOFF32.png"});
    browser.browserAction.setTitle({title: "YoutubeAUDIO Disabled"});
    browser.storage.local.set({ save_state: "disabled" });
    cleanupOverlay();
  }
  else{
    // listen for all youtube videoplayback requests
    browser.webRequest.onBeforeRequest.addListener(matchAudio,
      {urls: ["*://*.googlevideo.com/videoplayback*"]}, ["blocking"] );
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
var skipembed = false;
var redirectorblock = false;
function matchAudio(ytRequest) {
  //#region mess of code to skip embedded youtube requests
  function skipEmbed(tab){
    if (tab.url.indexOf(".youtube.com/") == -1) skipembed = true; else skipembed = false;
  }
  browser.tabs.query({currentWindow: true}).then(tabs => browser.tabs.get(ytRequest.tabId)).then(tab => { skipEmbed(tab); });
  if (skipembed == true){return{cancel: false};}
  //#endregion

  var youtubeURL = unescape(ytRequest.url);
  if (youtubeURL.indexOf("bypasscheck") != -1){
    return { cancel: false};
  }

  else if (youtubeURL.indexOf("redirector.googlevideo.com") != -1) {
    browser.tabs.query({}).then(tabs => browser.tabs.get(ytRequest.tabId)).then(tab => {
      if (tab.url.indexOf(".youtube.com/") != -1) redirectorblock = true; else redirectorblock = false;
    });
    return {cancel: redirectorblock};
  }

	else if	(youtubeURL.indexOf("audio/mp4") != -1 || youtubeURL.indexOf("audio/webm") != -1) {

		if (youtubeURL.indexOf("&range=0") != -1){
			var strippedURL = youtubeURL.split("&range=0")[0].concat("&bypasscheck=1");
			browser.tabs.query({currentWindow: true}).then(tabs => browser.tabs.get(ytRequest.tabId)).then(tab => {
        execTab(tab, strippedURL);
      });
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

//browser action click event, callback toggles webrequest listener and browseraction icons
browser.browserAction.onClicked.addListener(toggleListener);

//load previous enabled/disabled state
function loadState(storage){
  switch (storage.save_state) {
    case "disabled":
      break;
    default:
      toggleListener();
  }
}
browser.storage.local.get("save_state").then(loadState, onError);
