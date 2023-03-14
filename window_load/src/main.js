let lastResult = 0;
const id = setInterval(async function () {
  const result = await window.background.stdout();
  const status = await window.background.stdstatus();
  if (result.length !== lastResult) {
    console.log(result.length + result[result.length - 1]);
    const logTextConteiner = document.getElementById("log-text-container");
    const logText = document.getElementById("log-text");
    logText.innerHTML = result.join("<br>");
    lastResult = result.length;
    logTextConteiner.scrollTop = logText.scrollHeight;
  }
  if (status == 0 || status == 1) {
    const exitButtonContainer = document.createElement("div");
    exitButtonContainer.setAttribute("id", "exit-button-container");

    const exitButton = document.createElement("button");
    exitButton.setAttribute("type", "button");
    exitButton.setAttribute("class", "btn btn-danger");
    exitButton.setAttribute("id", "exit-button");
    exitButton.setAttribute("onclick", "exit_func()");
    exitButton.innerHTML = "Exit";

    exitButtonContainer.appendChild(exitButton);

    document.body.append(exitButtonContainer);
    clearInterval(id);
  }
}, 1);

const exit_func = () => {
  window.background.exitAll();
};
