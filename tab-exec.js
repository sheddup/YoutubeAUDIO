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

/* overlay image on the player and handle resize events */
function playerImage(){
  var movie_player = document.getElementById("movie_player").wrappedJSObject;
  var imgElement = document.getElementById("playerOverlay");
  var theaterBtn = document.getElementsByClassName("ytp-size-button ytp-button")[0];

  if (imgElement == null){
    var imgElement = document.createElement("IMG");
    imgElement.id = "playerOverlay";
    setImage(movie_player.baseURI, imgElement);
    imgElement.width = movie_player.getPlayerSize().width;
    imgElement.height = movie_player.getPlayerSize().height;
    movie_player.appendChild(imgElement);
  } else {
    setImage(movie_player.baseURI, imgElement);
    imgElement.width = movie_player.getPlayerSize().width;
    imgElement.height = movie_player.getPlayerSize().height;
    movie_player.appendChild(imgElement);
  }

  function resizer(){
    var [newWidth, newHeight] = [movie_player.getPlayerSize().width, movie_player.getPlayerSize().height];
    imgElement.width = newWidth;
    imgElement.height = newHeight;
  }

  window.onresize = resizer;
  theaterBtn.onclick = function(){setTimeout(resizer, 500)};
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
  if (ytVideo == null) console.log("couldn't load video element. YT embeds not supported yet");
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
