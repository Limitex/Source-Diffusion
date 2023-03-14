const startupHeartBeat = setInterval(() => {
  postRequest('/','', (data) => {
    if (data.status == 0) {
      clearInterval(startupHeartBeat);

      getModelsList()
      getLoadedModel()
    }
  })
}, 100);

let GenerationProgress
let SwitchModelButton
let GenerateButton 

window.onload = () => {
  GenerationProgress = new ProgressBar(document.getElementById('generate-progressbar'))
  SwitchModelButton = new LoadingButton(document.getElementById('switchmodelbutton'), 'Loading...')
  GenerateButton = new LoadingButton(document.getElementById('generatebutton'), 'Generating...')
};

const generateImage = () => {
  SwitchModelButton.Disable()
  GenerateButton.Loading()
  GenerationProgress.current(0)

  let pp = document.getElementById('positive-prompts').value;
  let np = document.getElementById('negative-prompts').value;
  let ih = document.getElementById('input-height').value;
  let iw = document.getElementById('input-width').value;
  let st = document.getElementById('input-steps').value;
  let sc = document.getElementById('input-scale').value;
  let gn = document.getElementById('input-generate-num').value;
  let ie = document.getElementById('input-eta').value;
  let is = document.getElementById('input-seed').value;
  
  let g_data = new GenerateContainer(
    positive = pp,
    negative = np,
    height = ih,
    width = iw,
    steps = st,
    scale = sc,
    num = gn,
    eta = ie,
    seed = is
  )

  const socket = new WebSocket("ws://" + HOST + ":" + PORT + "/generate");
  socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify(g_data.convertToLiteral()))
    GenerationProgress.animated(true)
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type == "generate") {
      const image_bod = document.getElementById('generate-images');
      data.output.forEach(encoded_data => {
        const decoded_data = window.atob(encoded_data);
        const uint8_array = new Uint8Array([...decoded_data].map(c => c.charCodeAt(0)));
        const blob = new Blob([uint8_array], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const container = document.createElement('div')
        image_bod.appendChild(container)

        const img = document.createElement('img');
        img.src = url;
        img.className = 'img-thumbnail';
        container.appendChild(img)

        const a = document.createElement('a')
        a.href = url;
        a.textContent = 'Download'
        container.appendChild(a)
      });
    }
    else if (data.type == "progress") {
      const progresData = JSON.parse(data.json_output);
      GenerationProgress.current((progresData.steps / (progresData.max_steps - 1)) * 100)
    }
  });

  socket.addEventListener("close", function(event) {
    SwitchModelButton.Undo()
    GenerateButton.Undo()
    GenerationProgress.animated(false)
  });
}

const getModelsList = () => {
  postRequest('/getmodelslist','', (data) => {
    const modelList = JSON.parse(data.models_json);
    const ml = document.getElementById('model-list')
    const vl = document.getElementById('vae-list')
    
    ml.innerHTML = ''
    vl.innerHTML = ''

    let e = document.createElement("option");
    e.value = 'null';
    e.textContent = "None";
    vl.appendChild(e)

    modelList.forEach(model => {
      if (model.type == 'model') {
        const i = document.createElement('option')
        i.textContent = model.name
        i.value = model.id
        ml.appendChild(i)
      } else if (model.type == 'vae') {
        const i = document.createElement('option')
        i.textContent = model.name
        i.value = model.id
        vl.appendChild(i)
      }
    });
  })
}

const getLoadedModel = () => {
  postRequest('/getloadedmodel', '', (data) => {
    const c = document.getElementById('loadedModelText')
    document.getElementById('generatebutton').disabled = data.model == null
    if (data.model == null) data.model = 'None'
    if (data.vae_model == null) data.vae_model = 'None'
    c.innerText = data.model + ' / ' + data.vae_model
  })
}

const switchModel = () => {
  SwitchModelButton.Loading()
  GenerateButton.Disable()

  const modelElm = document.getElementById('model-list')
  const vaeElm = document.getElementById('vae-list')

  if (modelElm.options.length == 0 || vaeElm.options.length == 0) {
    getLoadedModel()
    SwitchModelButton.Undo()
    GenerateButton.Undo()
    return
  }
  
  vaeid = vaeElm.options[vaeElm.selectedIndex].value
  const g_data = new ModelChangeContainer(
    model_id = modelElm.options[modelElm.selectedIndex].value,
    vae_id = vaeid != 'null' ? vaeid : null
  )
  postRequest('/switchModel', g_data.convertToLiteral(), (data) => {
    getLoadedModel()
    SwitchModelButton.Undo()
    GenerateButton.Undo()
  })
}

const loadNewModel = () => {
  const typeData = document.getElementById('input-model-type')
  const pathData = document.getElementById('input-model-path').value
  const nameData = document.getElementById('input-model-name').value
  const descriptionData = document.getElementById('input-model-description').value
  const data = new LoadNewModelInfo(
    type = typeData.options[typeData.selectedIndex].value, 
    path = pathData, 
    name = nameData, 
    description = descriptionData)
  postRequest('/loadnewmodel', data.convertToLiteral(), (data) => {
    getModelsList()
    console.log(data)
  })
}