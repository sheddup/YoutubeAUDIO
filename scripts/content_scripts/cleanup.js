//SCRIPT TRIGGERED FROM TURNING OFF BROWSERACTION WHEN USING GLOBAL TAB MODE
let overlay = document.querySelector(".html5-video-player").wrappedJSObject;
if(overlay.style["background-image"]){
  const tvurl = window.location.toString();
  if(tvurl.indexOf(".com/tv") !== -1){
    overlay.style = "";
  }
  else{
    const player = document.querySelector(".html5-video-player").wrappedJSObject;
    const vid = document.getElementsByTagName("video")[0];
    if(vid){
      switch(player.getPlayerState()){
        case 1:
        case 2:
          vid.onabort = function(){ overlay.style = ""; }; //cleanup overlay after video is navigated away from
          break;
        default:
          overlay.style = "";
      }
    }
    else{
      overlay.style = "";
    }
  }
}
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
undefined;
