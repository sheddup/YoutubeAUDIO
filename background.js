/* Log error */
function onError(error) {
  console.error(`Error: ${error}`);
}

/* handle browseraction click and toggle webrequest listener*/
function toggleListener(tabDetails){
  function checkReload(clickedTab){
    //#region Check active tab for youtube url, reload tab if youtube url is found
    if(clickedTab.url.indexOf(".youtube.com/") != -1) {
      browser.tabs.reload(clickedTab.id, {bypassCache: true});
      console.log("user toggled from youtube tab, reloading tab");
    }
    else {
      console.log("user toggled outside of a youtube tab, not reloading tab");
    }
    //#endregion
  }
  if (browser.webRequest.onBeforeRequest.hasListener(matchAudio)) {
    browser.webRequest.onBeforeRequest.removeListener(matchAudio);
    browser.browserAction.setIcon({path: "icons/ytaudioOFF32.png"});
    browser.browserAction.setTitle({title: "YoutubeAUDIO Disabled"});
  }
  else{
    // listen for all youtube videoplayback requests
    browser.webRequest.onBeforeRequest.addListener(matchAudio,
      {urls: ["https://*.googlevideo.com/videoplayback*"]}, ["blocking"] );
    browser.browserAction.setIcon({path: "icons/ytaudioON32.png"});
    browser.browserAction.setTitle({title: "YoutubeAUDIO Enabled"});
  }
  if (tabDetails == "firstrun") return; else checkReload(tabDetails);
}

/* execute tab-exec.js in tab id of webrequest, passing the audio source URL*/
function execTab(requestedTab, strippedURL){
  var jsString = "var sourceURL = "+JSON.stringify(strippedURL)+";";
  browser.tabs.executeScript(requestedTab.id, {code: jsString}, function(){
    browser.tabs.executeScript(
      requestedTab.id,
      {file: "tab-exec.js"}
    )
  });
}

/* match youtube requests for webm/mp4 audio, blocking any video
   parsed url is marked with bypasscheck parameter then execTab is called with audio source url and relevant tab id
   skips requests outside of .youtube.com */
var skip = false;
function matchAudio(ytRequest) {
  //#region mess of code to skip embedded youtube requests
  function skipEmbed(tab){
    if (tab.url.indexOf(".youtube.com/") == -1) skip = true; else skip = false;
  }
  browser.tabs.query({currentWindow: true}).then(tabs => browser.tabs.get(ytRequest.tabId)).then(tab => { skipEmbed(tab); });
  if (skip == true){return{cancel: false};}
  //#endregion

	var youtubeURL = unescape(ytRequest.url);
  if (youtubeURL.indexOf("bypasscheck") != -1){
    return { cancel: false};
  }
	else if	(youtubeURL.indexOf("audio/mp4") != -1 || youtubeURL.indexOf("audio/webm") != -1) {

		if (youtubeURL.indexOf("&range=0") != -1){
			var strippedURL = youtubeURL.split("&range=0")[0].concat("&bypasscheck=1");
			browser.tabs.query({currentWindow: true})
			.then(tabs => browser.tabs.get(ytRequest.tabId))
			.then(tab => { execTab(tab, strippedURL); });
      return { cancel: false };

		} else {
			return { cancel: true };
    }
	}
  else {
		return { cancel: true };
  }
}

//browser action click event, callback toggles webrequest listener and browseraction icons
browser.browserAction.onClicked.addListener(toggleListener);

//enable listener on first run, 'firstrun' param skips reload check
toggleListener("firstrun")
