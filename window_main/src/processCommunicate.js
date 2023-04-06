const callPid = (callback) => {
  window.background.pid().then(callback);
}

const callOpenBrowser = (link) => {
  window.background.openBrowser(link);
}

const callVersion = (callback) => {
  window.background.version().then(callback);
}