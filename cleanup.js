var overlay = document.getElementById("playerOverlay");
if (overlay) {
  var player = document.querySelector(".html5-video-player").wrappedJSObject;
  var vid = document.getElementsByTagName("video")[0];
  if(vid){
    switch (player.getPlayerState()) {
      case 1:
        vid.onabort = function(){overlay.remove();};
        break;
      case 2:
        vid.onabort = function(){overlay.remove();};
        break;
      default:
        overlay.remove();
    }
  }
  else{
    overlay.remove();
  }
}
undefined; //https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
