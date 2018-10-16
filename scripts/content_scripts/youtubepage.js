/*eslint-disable no-use-before-define*/
/* grab thumbnail from video id, falling back to medium quality if maxres not available */
function setImage(ID, moviePlayer){
  const[maxres, fallbackres] = ["https://img.youtube.com/vi/" + ID + "/maxresdefault.jpg", "https://img.youtube.com/vi/" + ID + "/hqdefault.jpg"];
  const http = new XMLHttpRequest();
  http.onload = function(){
    if(http.status !== 404){
      /*eslint-disable no-param-reassign*/
      moviePlayer.style = "background-image: url('" + maxres + "');background-repeat: no-repeat;background-position: center;background-size: cover;";
      /*eslint-enable no-param-reassign*/
    }
    else{
      /*eslint-disable no-param-reassign*/
      moviePlayer.style = "background-image: url('" + fallbackres + "');background-repeat: no-repeat;background-position: center;background-size: cover;";
      /*eslint-enable no-param-reassign*/
    }
  };
  http.open("HEAD", maxres, false);
  http.send();
}

/* overlay image on the player with resizing style */
function playerImage(){
  const moviePlayer = document.querySelector(".html5-video-player").wrappedJSObject;
  setImage(moviePlayer.getVideoData().video_id, moviePlayer);
}

/* initial code to get video element, set the source url and then start playing*/
function initYTP(){
  const ytVideo = document.getElementsByTagName("video")[0];
  function YTLoadStart(){
    ytVideo.src = sourceURL;
    ytVideo.oncanplay = function(){ ytVideo.play(); };
    if(thumbpref){
      playerImage();
    }
  }
  ytVideo.crossOrigin = "anonymous"; //fix cross origin conflict with karaoke extension
  ytVideo.onloadstart = YTLoadStart();
  setTimeout(() => {
    if(ytVideo.src.startsWith("blob:")){
      ytVideo.src = sourceURL;
      ytVideo.play();
    }
  }, 4000);
}
initYTP();
