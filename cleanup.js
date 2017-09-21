var overlay = document.getElementById("playerOverlay");
if (overlay) {
  var tvurl = window.location.toString();
  if (tvurl.indexOf(".com/tv") != -1) {
    overlay.remove();
  }
  else{
    var player = document.querySelector(".html5-video-player").wrappedJSObject;
    var vid = document.getElementsByTagName("video")[0];
    if(vid){
      switch (player.getPlayerState()) {
        case 1:
        case 2:
          vid.onabort = function(){overlay.remove();}; //cleanup overlay after video is navigated away from
          break;
        default:
          overlay.remove();
      }
    }
    else{
      overlay.remove();
    }  
  }
}
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
undefined;
