class LoadingButton {
  constructor(element, processingText) {
    (this.processingText = processingText),
      (this.before_text = element.innerText),
      (this.button_element = element),
      (this.loading_element = element.querySelectorAll(".loadingStatus")[0]),
      (this.text_element = element.querySelectorAll(".loadingText")[0]);
  }

  Loading() {
    this.text_element.innerText = this.processingText;
    this.button_element.disabled = true;
    this.loading_element.className = "spinner-border spinner-border-sm";
  }

  Disable() {
    this.button_element.disabled = true;
  }

  Undo() {
    this.text_element.innerText = this.before_text;
    this.button_element.disabled = false;
    this.loading_element.className = "";
  }
}

class ProgressBar {
  constructor(element) {
    this.progressBar_element = element;
  }

  current(percent) {
    this.progressBar_element.style.width = percent + "%";
  }

  animated(boolean) {
    if (boolean) {
      this.progressBar_element.classList.add("progress-bar-striped");
      this.progressBar_element.classList.add("progress-bar-animated");
    } else {
      this.progressBar_element.classList.remove("progress-bar-striped");
      this.progressBar_element.classList.remove("progress-bar-animated");
    }
  }
}
