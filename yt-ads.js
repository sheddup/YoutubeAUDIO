function regExpCheck(url){
  var result = /\%22ad|\&adfmt\=|\.atdmt\.|watch7ad\_|\.innovid\.|\/adsales\/|\/adserver\/|\.fwmrm\.net|\/stats\/ads|ad\d-\w*\.swf$|\.doubleclick\.|\/www\-advertise\.|google\-analytics\.|\.googleadservices\.|\.googletagservices\.|\.googlesyndication\.|\.serving\-sys\.com\/|youtube\.com\/ptracking\?|:\/\/.*\.google\.com\/uds\/afs|\/csi\?v\=\d+\&s\=youtube\&action\=|[\=\&\_\-\.\/\?\s]ad[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]ads[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adid[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adunit[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adhost[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]adview[\=\&\_\-\.\/\?\s]|[\=\&\_\-\.\/\?\s]pagead[\=\&\_\-\.\/\?\s\d]|[\=\&\_\-\.\/\?\s]googleads[\=\&\_\-\.\/\?\s]/i.test(url);
  /*  */
  return result;
};

var block = false;
function beforeRequest(request){
  var req = request.url;
  if (regExpCheck(req)) {
    browser.tabs.query({}).then(tabs => browser.tabs.get(request.tabId)).then(tab => {
      if (tab.url.indexOf(".youtube.com/") != -1) block = true; else block = false;
    });
    return {"cancel": block};
  }
}

browser.webRequest.onBeforeRequest.addListener(beforeRequest, {"urls" : ["*://*.google.com/*", "*://*.googleapis.com/*", "*://*.youtube.com/*", "*://*.serving-sys.com/*", "*://*.googlesyndication.com/*", "*://*.googletagservices.com/*", "*://*.googleadservices.com/*", "*://*.google-analytics.com/*", "*://*.doubleclick.net/*", "*://*.atdmt.com/*", "*://*.innovid.com/*", "*://*.fwmrm.net/*"]}, ["blocking"]);
