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


class NotificationElements {
  constructor(element) {
    this.notification_container = element;
    this.notification_list = []
  }

  append(text) {
    const newNotification = document.createElement('div');
    newNotification.classList.add('notification');

    const closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.onclick = (event) => newNotification.remove();
    newNotification.appendChild(closeButton);

    const closeButtonIcon = document.createElement('i');
    closeButtonIcon.classList.add('bi', 'bi-x');
    closeButton.appendChild(closeButtonIcon);

    const notificationText = document.createTextNode(text);
    newNotification.appendChild(notificationText);

    this.notification_container.appendChild(newNotification);
    this.notification_list.push(newNotification);
  }
}

class LoadingWindow {
  constructor() {
    this.container = document.getElementById('loading-window');
    this.loadingId = document.getElementById("loading-window-id");
    this.successId = document.getElementById("success-window-id");

    this.transitionTime = window.getComputedStyle(this.container).getPropertyValue("transition").split(" ")[1].replace("s", "") * 1000;
    this.style = this.container.style.top
    this.displayTime = 3000
  }

  show() {
    this.loadingId.style.display = '';
    this.container.style.top = 0;
  }

  close(callback) {
    if (this.loadingId.style.display != '') {
      callback();
      return;
    }
    this.container.style.top = this.style;
    setTimeout(() => {
      this.loadingId.style.display = 'none';
      this.successId.style.display = 'none';
      callback();
    }, this.transitionTime);
  }

  s_close(callback, text = 'Success') {
    if (this.loadingId.style.display != '') {
      callback();
      return;
    }
    this.container.style.top = this.style;
    this.successId.innerText = text;
    setTimeout(() => {
      this.loadingId.style.display = 'none';
      this.successId.style.display = '';
      this.container.style.top = 0;
      setTimeout(() => {
        this.container.style.top = this.style;
        setTimeout(() => {
          this.successId.style.display = 'none';
          callback()
        }, this.transitionTime);
      }, this.displayTime + this.transitionTime);

    }, this.transitionTime);
  }
}