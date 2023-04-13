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