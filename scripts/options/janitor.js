//SCRIPT TRIGGERED FROM CHANGING TAB MODE IN OPTIONS
let overlay = document.querySelector(".html5-video-player").wrappedJSObject;
if(overlay.style["background-image"]){
  overlay.style = "";
}
browser.runtime.sendMessage({ msg: "clean" });
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
undefined;
