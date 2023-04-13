const setLogText = (text) => {
  const newlog = String.fromCharCode(...text).trimEnd();
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

const setTopStatus = (text) => {
  const newlog = String.fromCharCode(...text).trimEnd();
  document.getElementById('top-status-text').innerText = newlog;
}