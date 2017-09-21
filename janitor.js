var overlay = document.getElementById("playerOverlay");
if(overlay) {
  overlay.remove();
}
browser.runtime.sendMessage({msg : "clean"});
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
undefined;
