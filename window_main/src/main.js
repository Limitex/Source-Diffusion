const startupHeartBeat = setInterval(() => {
  postRequest('/','', (data) => {
    if (data.status == 0) {
      clearInterval(startupHeartBeat);

      getModelsList()
      getLoadedModel()
    }
  })
}, 100);

const generateImage = () => {
  const smb = document.getElementById('switchmodelbutton')
  const genb = document.getElementById('generatebutton')
  const genl = document.getElementById('generateloading')
  const gent = document.getElementById('generatetext')
  const gent_txt = gent.innerText
  smb.disabled = true
  gent.innerText = 'Generating...'
  genb.disabled = true
  genl.className = 'spinner-border spinner-border-sm'
  let progress = document.getElementById('generate-progressbar')
  progress.style.width = '0%'

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
    progress.classList.add("progress-bar-striped")
    progress.classList.add("progress-bar-animated")
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
      progress.style.width = ((progresData.steps / (progresData.max_steps - 1)) * 100) + '%'
    }

  });

  socket.addEventListener("close", function(event) {
    gent.innerText = gent_txt
    smb.disabled = false
    genb.disabled = false
    genl.className = ''
    progress.classList.remove("progress-bar-striped")
    progress.classList.remove("progress-bar-animated")
  });
}

const getModelsList = () => {
  postRequest('/getmodelslist','', (data) => {
    const ml = document.getElementById('model-list')
    const vl = document.getElementById('vae-list')
    data.model_id_list.forEach(element => {
      const i = document.createElement('option')
      i.textContent = element
      ml.appendChild(i)
    });
    data.vae_id_list.forEach(element => {
      const i = document.createElement('option')
      i.textContent = element
      vl.appendChild(i)
    });
  })
}

const getLoadedModel = () => {
  postRequest('/getloadedmodel', '', (data) => {
    const c = document.getElementById('loadedModelText')
    document.getElementById('generatebutton').disabled = data.model == '' || data.vae_model == ''
    if (data.model == '') data.model = 'None'
    if (data.vae_model == '') data.vae_model = 'None'
    c.innerText = data.model + ' / ' + data.vae_model
  })
}

const switchModel = () => {
  const genb = document.getElementById('generatebutton')
  const smb = document.getElementById('switchmodelbutton')
  const sml = document.getElementById('switchmodelloading')
  const smt = document.getElementById('switchmodeltext')
  const smt_txt = smt.innerText
  genb.disabled = true
  smt.innerText = 'Loading...'
  smb.disabled = true
  sml.className = 'spinner-border spinner-border-sm'

  const modelElm = document.getElementById('model-list')
  const vaeElm = document.getElementById('vae-list')

  if (modelElm.options.length == 0 || vaeElm.options.length == 0) {
    getLoadedModel()
    smt.innerText = smt_txt
    genb.disabled = false
    smb.disabled = false
    sml.className = ''
    return
  }
  
  const g_data = new ModelChangeContainer(
    model_name = modelElm.options[modelElm.selectedIndex].value,
    vae_model_name = vaeElm.options[vaeElm.selectedIndex].value
  )
  postRequest('/switchModel', g_data.convertToLiteral(), (data) => {
    getLoadedModel()
    smt.innerText = smt_txt
    genb.disabled = false
    smb.disabled = false
    sml.className = ''
  })
}