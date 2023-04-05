class LoadingButton {
  constructor(element, processingText, loadingElement) {
    (this.processingText = processingText),
      (this.before_text = element.innerText.trim()),
      (this.button_element = element),
      (this.loading_element = element.querySelectorAll(".loadingStatus")[0]),
      (this.text_element = element.querySelectorAll(".loadingText")[0]),
      (this.loadingElement = loadingElement)
  }

  Loading() {
    this.text_element.innerText = this.processingText;
    this.button_element.disabled = true;
    this.loadingElement.Loading()
  }

  Disable() {
    this.button_element.disabled = true;
  }

  Undo() {
    this.text_element.innerText = this.before_text;
    this.button_element.disabled = false;
    this.loadingElement.Undo();
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

class LoadingElement {
  constructor(element) {
    this.element = element
  }

  Loading() {
    this.element.style.display = ''
  }

  Undo() {
    this.element.style.display = 'none'
  }
}

class EditElement {
  constructor(element, type, id, name, description) {
    this.element = element;
    this.element.getElementsByClassName('model-edit-text-type')[0].innerText = type;
    this.element.getElementsByClassName('model-edit-text-id')[0].innerText = id;
    const n = this.element.getElementsByClassName('edit-input-model-name')[0];
    n.value = name;
    n.dataset.default = name;
    const d = this.element.getElementsByClassName('edit-input-model-description')[0]
    d.value = description;
    d.dataset.default = description;
  }

  getElement() {
    return this.element;
  }
}