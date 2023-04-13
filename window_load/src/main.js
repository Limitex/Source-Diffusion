const keepLogLines = 50;

const id = setInterval(async function () {
  const status = await window.background.stdstatus();
  const topstatus = await window.background.topstatus();
  document.getElementById('top-status-text').innerText = topstatus;
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