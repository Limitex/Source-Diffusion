const keepLogLines = 50;

let lastResult = 0;
const id = setInterval(async function () {
  const result = await window.background.stdout();
  const status = await window.background.stdstatus();
  const topstatus = await window.background.topstatus();
  if (result.length !== lastResult) {
    console.log(result.length + result[result.length - 1]);
    const logTextConteiner = document.getElementById("log-text-container");
    const logText = document.getElementById("log-text");
    if (result.length > keepLogLines) result.splice(0, result.length - keepLogLines);
    logText.innerHTML = result.join("<br>");
    lastResult = result.length;
    logTextConteiner.scrollTop = logText.scrollHeight;
    document.getElementById('top-status-text').innerText = topstatus;
  }
  if (status == 0 || status == 1) {
    document.getElementById('button-container').style.display = '';
    document.getElementById('animation-container').classList = ''
  }
  if (status == -1) {
    document.getElementById('button-container').style.display = 'none';
  }
}, 1);

const exit_func = () => {
  window.background.exitAll();
};

const reset_func = () => {
  window.background.envreset();
}

window.onload = async () => {
  const result = await window.background.devout();
  const version = await window.background.version();
  console.log(result)

  document.getElementById('version-container').innerText = version;
}