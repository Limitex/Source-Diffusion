const callPid = (callback) => {
  window.background.pid().then(callback);
}

const callOpenBrowser = (link) => {
  window.background.openBrowser(link);
}