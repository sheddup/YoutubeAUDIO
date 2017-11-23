/* grab thumbnail from video id, falling back to medium quality if maxres not available */
function setImage(ID, img){
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

  if (imgElement == null){
    var imgElement = document.createElement("IMG");
    imgElement.id = "playerOverlay";
  }
  setImage(movie_player.getVideoData()["video_id"], imgElement);
  imgElement.style = "height: 100%; width: 100%; object-fit: fill";
  vid_container.insertBefore(imgElement, vid_container.childNodes[0]);
}

/* initial code to get video element, set the source url and then start playing*/
function initYTP(){
  function YTLoadStart(){
    ytVideo.src = sourceURL;
    ytVideo.oncanplay = function(){ytVideo.play()};
    if (thumbpref) {
      playerImage();
    }
  }
  var ytVideo = document.getElementsByTagName("video")[0];
  ytVideo.onloadstart = YTLoadStart();
  setTimeout(function(){
    if (ytVideo.src.startsWith("blob:")) {
      ytVideo.src = sourceURL;
      ytVideo.play();
    }
  }, 4000);
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
