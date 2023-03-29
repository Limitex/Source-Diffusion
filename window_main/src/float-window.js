const iframeContents = document.getElementById("float-window-contents");

iframeContents.addEventListener('load', () => {
  if (iframeContents.contentDocument.readyState === 'complete') {
    document.getElementById("float-window-container").style = "";
  }
});

const showFloatWindow = (title, htmlPath) => {
  document.getElementById("float-top-bar-title").innerText = title;
  iframeContents.src = htmlPath;
};

const closeFloatWindow = () => {
  document.getElementById("float-window-container").style.display = "none";
};
