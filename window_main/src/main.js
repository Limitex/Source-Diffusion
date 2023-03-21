const startupHeartBeat = setInterval(() => {
  postRequest("/", "", (data) => {
    if (data.status == 0) {
      clearInterval(startupHeartBeat);

      getModelsList();
      getLoadedModel();
    }
  });
}, 100);

let GenerationProgress;
let SwitchModelButton;
let LoadNewModelButton;
let GenerateButton;

window.onload = () => {
  GenerationProgress = new ProgressBar(
    document.getElementById("generate-progressbar")
  );
  SwitchModelButton = new LoadingButton(
    document.getElementById("switchmodelbutton"),
    "Loading..."
  );
  LoadNewModelButton = new LoadingButton(
    document.getElementById("loadnewmodelbutton"),
    "Loading..."
  );
  GenerateButton = new LoadingButton(
    document.getElementById("generatebutton"),
    "Generating..."
  );
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

  let g_data = new GenerateContainer(
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
          const decoded_data = window.atob(encoded_data);
          const uint8_array = new Uint8Array(
            [...decoded_data].map((c) => c.charCodeAt(0))
          );
          const blob = new Blob([uint8_array], { type: "image/png" });
          const url = URL.createObjectURL(blob);

          const container = document.createElement("div");
          container.className = "history-thumbnail";
          image_bod.prepend(container);

          const img = document.createElement("img");
          img.src = url;
          img.className = "img-thumbnail";
          container.appendChild(img);

          const mainImg = document.getElementById("main-generated-image");
          mainImg.src = url;

          document.getElementById('download-button-link').href = url
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

const getModelsList = () => {
  postRequest("/getmodelslist", "", (data) => {
    const modelList = JSON.parse(data.models_json);
    const ml = document.getElementById("model-list");
    const vl = document.getElementById("vae-list");

    ml.innerHTML = "";
    vl.innerHTML = "";

    let e = document.createElement("option");
    e.value = "null";
    e.textContent = "None";
    vl.appendChild(e);

    modelList.forEach((model) => {
      const i = document.createElement("option");
      i.textContent = model.name;
      i.value = model.id;
      i.dataset.type = model.type
      if (model.type == "model") {
        ml.appendChild(i);
      } else if (model.type == "vae") {
        vl.appendChild(i);
      } else if (model.type == "huggingface") {
        ml.appendChild(i);
      }
    });
  });
};

const getLoadedModel = () => {
  postRequest("/getloadedmodel", "", (data) => {
    const c = document.getElementById("loadedModelText");
    if (data.model == null) GenerateButton.Disable()
    else GenerateButton.Undo()
    if (data.model == null) data.model = "None";
    if (data.vae_model == null) data.vae_model = "None";
    c.innerText = data.model + " / " + data.vae_model;
  });
};

const switchModel = () => {
  SwitchModelButton.Loading();
  GenerateButton.Disable();
  LoadNewModelButton.Disable();

  const modelElm = document.getElementById("model-list");
  const vaeElm = document.getElementById("vae-list");

  if (modelElm.options.length == 0 || vaeElm.options.length == 0) {
    getLoadedModel();
    SwitchModelButton.Undo();
    GenerateButton.Undo();
    LoadNewModelButton.Undo();
    return;
  }

  vaeid = vaeElm.options[vaeElm.selectedIndex].value;
  modelid = modelElm.options[modelElm.selectedIndex]
  const g_data = new ModelChangeContainer(
    (mtype = modelid.dataset.type),
    (model_id = modelid.value),
    (vae_id = vaeid != "null" ? vaeid : null)
  );
  postRequest("/switchModel", g_data.convertToLiteral(), (data) => {
    getLoadedModel();
    SwitchModelButton.Undo();
    GenerateButton.Undo();
    LoadNewModelButton.Undo();
  });
};

const loadNewModel = () => {
  SwitchModelButton.Disable();
  GenerateButton.Disable();
  LoadNewModelButton.Loading();

  const pathData = document.getElementById("input-model-path").value;
  const nameData = document.getElementById("input-model-name").value;
  const descriptionData = document.getElementById(
    "input-model-description"
  ).value;
  const data = new LoadNewModelInfo(
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
    console.log(data);
  });
};
