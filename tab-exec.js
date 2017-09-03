/* grab thumbnail from video id, falling back to medium quality if maxres not available */
function setImage(url, img){
  //#region Video ID Regex
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
  //#endregion
  var [maxres, fallbackres] = ["https://img.youtube.com/vi/"+ID+"/maxresdefault.jpg", "https://img.youtube.com/vi/"+ID+"/mqdefault.jpg"];
  var http = new XMLHttpRequest();
  http.onload = function(){
    if (http.status != 404) img.src = maxres; else img.src = fallbackres;
  }
  http.open('HEAD', maxres, false);
  http.send();
}

/* overlay image on the player with object-fit style to handle resizing */
function playerImage(){
  var vid_container = document.querySelector(".html5-video-container");
  var movie_player = document.querySelector(".html5-video-player").wrappedJSObject;
  var imgElement = document.getElementById("playerOverlay");
  var theaterBtn = document.querySelector(".ytp-size-button");

  if (imgElement == null){
    var imgElement = document.createElement("IMG");
    imgElement.id = "playerOverlay";
  }
  setImage(movie_player.baseURI, imgElement);
  imgElement.style = "height: 100%; width: 100%; object-fit: fill";
  vid_container.insertBefore(imgElement, vid_container.childNodes[0]);
}

/* initial code to get video element, set the source url and then start playing
   this will fail on embeds */
function initYTP(){
  function YTLoadStart(){
    ytVideo.src = sourceURL;
    ytVideo.oncanplay = function(){ytVideo.play()};
    playerImage();
  }
  var ytVideo = document.getElementsByTagName("video")[0];
  ytVideo.onloadstart = YTLoadStart();
}

/* wait till doc is ready to use */
var bootstrap = function(evt){
  if (evt.target.readyState === "interactive") { initYTP(); }
  else if (evt.target.readyState === "complete") { initYTP(); }
}
switch (document.readyState) {
  case "loading":
    document.addEventListener('readystatechange', bootstrap, false);
    break;
  case "interactive":
    initYTP();
    break;
  case "complete":
    initYTP();
    break;
}
