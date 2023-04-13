const keepLogLines = 50;

const setLogText = (arrayText) => {
  const newlog = String.fromCharCode(...arrayText).trimEnd();
  console.log(newlog);
  const logTextElement = document.getElementById("log-text");
  const logList = logTextElement.innerHTML.split("<br>");
  logList.push(newlog);
  if (logList.length > keepLogLines)
    logList.splice(0, logList.length - keepLogLines);
  logTextElement.innerHTML = logList.join("<br>");
  document.getElementById("log-text-container").scrollTop =
    logTextElement.scrollHeight;
};

const setTopStatus = (arrayText) => {
  const newlog = String.fromCharCode(...arrayText).trimEnd();
  document.getElementById('top-status-text').innerText = newlog;
}

const setExitStatus = (arrayText) => {
  exitCode = arrayText[0]
  if (exitCode == 0 || exitCode == 1) {
    document.getElementById('button-container').style.display = '';
    document.getElementById('animation-container').classList = ''
  } else if (exitCode == -1) {
    document.getElementById('button-container').style.display = 'none';
  }
}