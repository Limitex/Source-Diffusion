const generateImage = () => {
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

  postRequest('/', g_data.convertToLiteral(), (data) => {
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
  })
}