class FloatWindowSwitch {
  constructor(idList) {
    this.idList = idList;
  }

  show(idName) {
    const title = document.getElementById(idName).dataset.title;
    document.getElementById("float-top-bar-title").innerText = title;

    this.idList.forEach(id => {
      if (id == idName) {
        document.getElementById(id).style.display = '';
      } else {
        document.getElementById(id).style.display = "none";
      }
    });
    document.getElementById("float-window-container").style = "";
  }

  hide() {
    document.getElementById("float-top-bar-title").innerText = "";
    this.idList.forEach(id => {
      document.getElementById(id).style.display = "none";
    });
    document.getElementById("float-window-container").style.display = "none";
  }
}

const fw = new FloatWindowSwitch([
  'float-window-contents-setting',
  'float-window-contents-addnewmodel'
])


const showFloatWindow = (idName) => {
  fw.show(idName)
};

const closeFloatWindow = () => {
  fw.hide()
};