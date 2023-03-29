const showFloatWindow = (title, htmlPath) => {
  document.getElementById("float-window-container").style = "";
  document.getElementById("float-top-bar-title").innerText = title;
  document.getElementById("float-window-contents").src = htmlPath;
};

const closeFloatWindow = () => {
  document.getElementById("float-window-container").style.display = "none";
};
