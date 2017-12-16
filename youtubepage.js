/* grab thumbnail from video id, falling back to medium quality if maxres not available */
function setImage(ID, movie_player){
  var [maxres, fallbackres] = ["https://img.youtube.com/vi/"+ID+"/maxresdefault.jpg", "https://img.youtube.com/vi/"+ID+"/hqdefault.jpg"];
  var http = new XMLHttpRequest();
  http.onload = function(){
    if (http.status != 404) {
      movie_player.style = "background-image: url('"+maxres+"');background-repeat: no-repeat;background-position: center;background-size: cover;";
    }
    else{
      movie_player.style = "background-image: url('"+fallbackres+"');background-repeat: no-repeat;background-position: center;background-size: cover;";
    }
  }
  http.open('HEAD', maxres, false);
  http.send();
}

/* overlay image on the player with resizing style */
function playerImage(){
  var movie_player = document.querySelector(".html5-video-player").wrappedJSObject;
  setImage(movie_player.getVideoData()["video_id"], movie_player);
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
  ytVideo.crossOrigin = "anonymous"; //fix cross origin conflict with karaoke extension
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
