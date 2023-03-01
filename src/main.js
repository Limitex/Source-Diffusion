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
    console.log(data)
  })
}