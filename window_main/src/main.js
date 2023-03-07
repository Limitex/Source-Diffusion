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
  const genb = document.getElementById('generatebutton')
  const genl = document.getElementById('generateloading')
  const gent = document.getElementById('generatetext')
  const gent_txt = gent.innerText
  gent.innerText = 'Generating...'
  genb.disabled = true
  genl.className = 'spinner-border spinner-border-sm'

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

  postRequest('/generate', g_data.convertToLiteral(), (data) => {
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

      gent.innerText = gent_txt
      genb.disabled = false
      genl.className = ''
    });
  })
}

const getModelsList = () => {
  postRequest('/getmodelslist','', (data) => {
    const ml = document.getElementById('model-list')
    const vl = document.getElementById('vae-list')
    data.model_list.forEach(element => {
      const i = document.createElement('option')
      i.textContent = element
      ml.appendChild(i)
    });
    data.vae_model_list.forEach(element => {
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
  const smb = document.getElementById('switchmodelbutton')
  const sml = document.getElementById('switchmodelloading')
  const smt = document.getElementById('switchmodeltext')
  const smt_txt = smt.innerText
  smt.innerText = 'Loading...'
  smb.disabled = true
  sml.className = 'spinner-border spinner-border-sm'

  const modelElm = document.getElementById('model-list')
  const vaeElm = document.getElementById('vae-list')
  const g_data = new ModelChangeContainer(
    model_name = modelElm.options[modelElm.selectedIndex].value,
    vae_model_name = vaeElm.options[vaeElm.selectedIndex].value
  )
  postRequest('/switchModel', g_data.convertToLiteral(), (data) => {
    getLoadedModel()
    smt.innerText = smt_txt
    smb.disabled = false
    sml.className = ''
  })
}