const setMainImage = (imageElement) => {
  const url = imageElement.src
  const mainImg = document.getElementById("main-generated-image");
  mainImg.src = url;
  const dbl = document.getElementById('download-button-link');
  dbl.href = url
  dbl.download = 'image.png'
}

const findParent = (element, className) => {
  r = element.parentElement
  if (r == null) return null
  l = Array.from(r.classList).find(cls => cls == className);
  return l == undefined ? findParent(r, className) : r;
}

const showMessageWindow = (title, message, okCallbacl, canselCallback) => {
  document.getElementById('message-window').style.display = '';
  document.getElementById('message-window-top-bar-title').innerText = title;
  document.getElementById('message-window-contents-text').innerText = message;
  document.getElementById('message-window-button-cansel').onclick = canselCallback
  document.getElementById('message-window-button-ok').onclick = okCallbacl
}
const closeMessageWindow = (event) => {
  document.getElementById('message-window').style.display = 'none';
}

const startupHeartBeat = setInterval(() => {
  postRequest("/", "", (data) => {
    if (data.status == 0) {
      clearInterval(startupHeartBeat);

      getModelsList();
      getLoadedModel();

      callPid(pid => {
        postRequest("/postpid", new PostPidContainer(pid).convertToLiteral(), (data) => {
          getUserSettings();
        });
      });
    }
  });
}, 100);

let GenerationProgress;
let SwitchModelButton;
let LoadNewModelButton;
let GenerateButton;
let Notice;
let Loading;

window.onload = () => {
  GenerationProgress = new ProgressBar(
    document.getElementById("generate-progressbar")
  );
  Loading = new LoadingElement(
    document.getElementById("loader-container")
  );
  SwitchModelButton = new LoadingButton(
    document.getElementById("switchmodelbutton"),
    "Loading...", Loading
  );
  LoadNewModelButton = new LoadingButton(
    document.getElementById("loadnewmodelbutton"),
    "Loading...", Loading
  );
  GenerateButton = new LoadingButton(
    document.getElementById("generatebutton"),
    "Generating...", Loading
  );
  Notice = new NotificationElements(
    document.getElementById("notification-container")
  )
  callVersion(v => {
    document.getElementById('version-container').innerText = 'Ver:' + v
  });
};

const generateImage = () => {
  SwitchModelButton.Disable();
  LoadNewModelButton.Disable();
  GenerateButton.Loading();
  GenerationProgress.current(0);

  let pp = document.getElementById("positive-prompts").value;
  let np = document.getElementById("negative-prompts").value;
  let ih = document.getElementById("input-height").value;
  let iw = document.getElementById("input-width").value;
  let st = document.getElementById("input-steps").value;
  let sc = document.getElementById("input-scale").value;
  let gn = document.getElementById("input-generate-num").value;
  let ie = document.getElementById("input-eta").value;
  let is = document.getElementById("input-seed").value;

  let g_data = new GenerateStreamContainer(
    (positive = pp),
    (negative = np),
    (height = ih),
    (width = iw),
    (steps = st),
    (scale = sc),
    (num = gn),
    (eta = ie),
    (seed = is)
  );

  socketRequest(
    "/generate",
    (event, socket) => {
      socket.send(JSON.stringify(g_data.convertToLiteral()));
      GenerationProgress.animated(true);
    },
    (event, socket) => {
      SwitchModelButton.Undo();
      GenerateButton.Undo();
      LoadNewModelButton.Undo();
      GenerationProgress.animated(false);
    },
    (event, socket) => {
      const data = JSON.parse(event.data);
      if (data.type == "generate") {
        const image_bod = document.getElementById("generate-images");
        data.output.forEach((encoded_data) => {
          const decoded_data = window.atob(encoded_data[1]);
          const uint8_array = new Uint8Array(
            [...decoded_data].map((c) => c.charCodeAt(0))
          );
          const blob = new Blob([uint8_array], { type: "image/png" });
          const url = URL.createObjectURL(blob);

          const container = document.createElement("div");
          container.className = "history-thumbnail";
          image_bod.prepend(container);

          const seed = document.createElement("div");
          seed.className = "history-thumbnail-seed";
          seed.innerText = encoded_data[0];
          container.appendChild(seed);

          const button = document.createElement('button');
          button.type = 'button';
          button.onclick = (event) => {setMainImage(event.target)};
          container.appendChild(button);

          const img = document.createElement("img");
          img.src = url;
          img.className = "img-thumbnail";
          button.appendChild(img);

          setMainImage(img);
        });
      } else if (data.type == "progress") {
        const progresData = JSON.parse(data.json_output);
        GenerationProgress.current(
          (progresData.steps / (progresData.max_steps - 1)) * 100
        );
      }
    }
  );
};

const downloadImage = () => {
  document.getElementById('download-button-link').click();
}

const template = document.getElementById('model-edit-contents-template');
let editLists = []
const getModelsList = () => {
  postRequest("/getmodelslist", "", (data) => {
    const modelList = JSON.parse(data.models_json);
    const groups = modelList.reduce((acc, obj) => {
      const key = obj.type;
      acc[key] = acc[key] || [];
      acc[key].push(obj);
      return acc;
    }, {});

    const ml = document.getElementById("model-list");
    const vl = document.getElementById("vae-list");
    const ll = document.getElementById("lora-list");

    ml.innerHTML = "";
    vl.innerHTML = "";
    ll.innerHTML = "";

    let d = document.createElement("option");
    d.value = "null";
    d.textContent = "None";
    ml.appendChild(d);

    let e = document.createElement("option");
    e.value = "null";
    e.textContent = "None";
    vl.appendChild(e);

    let f = document.createElement("option");
    f.value = "null";
    f.textContent = "None";
    ll.appendChild(f);

    const e_parent = document.getElementById('model-list-container')
    e_parent.innerHTML = ''

    const addEditModelColumn = (type, id, name, description) => {
      const newTemp = new EditElement(template.cloneNode(true), type, id, name, description)
      editLists.push(newTemp);
      const e = newTemp.getElement()
      e_parent.appendChild(e)
      e.style.display = '';
    }

    const createElements = (d) => {
      const modelType = d['type'];
      const modelId = d['id']
      const modelName = d['name'];
      const i = document.createElement("option");
      i.textContent = modelName;
      i.value = modelId;
      i.dataset.type = modelType
      if (modelType == "Stable Diffusion Model") {
        ml.appendChild(i);
      } else if (modelType == "Stable Diffusion Vae") {
        vl.appendChild(i);
      } else if (modelType == "Stable Diffusion Lora") {
        ll.appendChild(i);
      }
      addEditModelColumn(
        modelType,
        modelId,
        modelName,
        d['description']
      )
    }
    
    if (groups['Stable Diffusion Model'] != undefined) {
      groups['Stable Diffusion Model'].forEach(d => createElements(d));
    }
    if (groups['Stable Diffusion Vae'] != undefined) {
      groups['Stable Diffusion Vae'].forEach(d => createElements(d));
    }
    if (groups['Stable Diffusion Lora'] != undefined) {
      groups['Stable Diffusion Lora'].forEach(d => createElements(d));
    }
  });
};

const getLoadedModel = () => {
  postRequest("/getloadedmodel", "", (data) => {
    const lm = document.getElementById("loaded-model-name")
    const lv = document.getElementById("loaded-vae-name")
    const ll = document.getElementById("loaded-lora-name")

    if (data.model == null) GenerateButton.Disable()
    else GenerateButton.Undo()
    if (data.model == null) data.model = "None";
    if (data.vae_model == null) data.vae_model = "None";
    if (data.lora_model == null) data.lora_model = "None"

    lm.innerText = data.model;
    lv.innerText = data.vae_model;
    ll.innerText = data.lora_model
  });
};

const switchModel = () => {
  SwitchModelButton.Loading();
  GenerateButton.Disable();
  LoadNewModelButton.Disable();

  const modelElm = document.getElementById("model-list");
  const vaeElm = document.getElementById("vae-list");
  const loraElm = document.getElementById("lora-list");

  vaeid = vaeElm.options[vaeElm.selectedIndex].value;
  modelid = modelElm.options[modelElm.selectedIndex]
  loraId = loraElm.options[loraElm.selectedIndex].value;

  if (modelElm.options.length == 0 || modelid.value == "null") {
    getLoadedModel();
    SwitchModelButton.Undo();
    GenerateButton.Undo();
    LoadNewModelButton.Undo();
    Notice.append('Model was no exist.');
    return;
  }
  
  const g_data = new ModelChangeContainer(
    (mtype = modelid.dataset.type),
    (model_id = modelid.value),
    (vae_id = vaeid != "null" ? vaeid : null),
    (lora_id = loraId != "null" ? loraId : null)
  );
  postRequest("/switchModel", g_data.convertToLiteral(), (data) => {
    getLoadedModel();
    SwitchModelButton.Undo();
    GenerateButton.Undo();
    LoadNewModelButton.Undo();

    showServerStatus(data, 'Failed to load model.')
  });
};

const loadNewModel = () => {
  const pathData = document.getElementById("input-model-path").value;
  const nameData = document.getElementById("input-model-name").value;
  const descriptionData = document.getElementById("input-model-description").value;

  if (pathData == "" || nameData == "" || descriptionData == "") {
    Notice.append("Please enter all values");
    return;
  }

  SwitchModelButton.Disable();
  GenerateButton.Disable();
  LoadNewModelButton.Loading();

  const data = new AddNewModelContainer(
    (path = pathData),
    (name = nameData),
    (description = descriptionData)
  );
  postRequest("/loadnewmodel", data.convertToLiteral(), (data) => { 
    SwitchModelButton.Undo();
    GenerateButton.Undo();
    LoadNewModelButton.Undo();

    getModelsList();
    getLoadedModel();

    showServerStatus(data, 'Failed to add model.')
  });
};

const openLink = (element) => {
  const link = element.getElementsByTagName('a')[0].href;
  callOpenBrowser(link)
}


const showAddModelWindow = () => {
  showFloatWindow('float-window-contents-addnewmodel')
}

const showSettingWindow = () => {
  showFloatWindow('float-window-contents-setting')
}

const showEditModelsWindow = () => {
  getModelsList();
  showFloatWindow('float-window-contents-editmodels')
}

const editModelListEdit = (event) => {
  const element = findParent(event, 'model-edit-contents-box')
  const targetIdName = element.getElementsByClassName('model-edit-text-id')[0]
  const targetName = element.getElementsByClassName('edit-input-model-name')[0]
  const targetDescriptionName = element.getElementsByClassName('edit-input-model-description')[0]

  if (targetName.dataset.default == targetName.value && 
    targetDescriptionName.dataset.default == targetDescriptionName.value) {
      Notice.append('No changed.')
      return;
  }
  showMessageWindow(
    'Do you want to confirm the change?',
    'ID : ' + targetIdName.innerText + '\n' +
    'Name : ' + targetName.dataset.default + ' -> \n' + targetName.value + '\n' +
    'Description : ' + targetDescriptionName.dataset.default + ' -> \n' + targetDescriptionName.value,
    ()=>{
      const cmi = new UpdateModelInfoContainer(targetIdName.innerText, targetName.value, targetDescriptionName.value)
      postRequest("/updatemodelinfo", cmi.convertToLiteral(), (data) => {
        Notice.append(data.status_str)
        getModelsList()
        closeMessageWindow()
      });
    }, closeMessageWindow);
}

const editModelListTrash = (event) => {
  const element = findParent(event, 'model-edit-contents-box')
  const targetIdName = element.getElementsByClassName('model-edit-text-id')[0]
  const targetName = element.getElementsByClassName('edit-input-model-name')[0]
  const targetDescriptionName = element.getElementsByClassName('edit-input-model-description')[0]

  showMessageWindow(
    'Do you really want to delete it?',
    'ID : ' + targetIdName.innerText + '\n' +
    'Name : ' + targetName.dataset.default + '\n' +
    'Description : ' + targetDescriptionName.dataset.default,
    () => {
      const dmi = new DeleteModelContainer(targetIdName.innerText);
      postRequest("/deletemodelinfo", dmi.convertToLiteral(), (data) => {
        Notice.append(data.status_str)
        getModelsList()
        closeMessageWindow()
      });
    }, closeMessageWindow);

}