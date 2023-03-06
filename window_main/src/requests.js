const PORT = 8000
const HOST = 'localhost'

const GenerateContainer = class {
  constructor(positive, negative, height, width, steps, scale, num, eta, seed) {
    this.positive = positive
    this.negative = negative
    this.height = height
    this.width = width
    this.steps = steps
    this.scale = scale
    this.num = num
    this.eta = eta
    this.seed = seed
  }

  convertToLiteral() {
    return {
      positive: this.positive,
      negative: this.negative,
      height: this.height,
      width: this.width,
      steps: this.steps,
      scale: this.scale,
      num: this.num,
      eta: this.eta,
      seed: this.seed
    }
  }
}

const ModelChangeContainer = class {
  constructor(model_name, vae_model_name) {
    this.model_name = model_name
    this.vae_model_name = vae_model_name
  }

  convertToLiteral() {
    return {
      model_name: this.model_name,
      vae_model_name: this.vae_model_name
    }
  }
}

const postRequest = (path, body, result) => {
  fetch('http://' + HOST + ':' + PORT + path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    if (response.ok) {
      return response.json()
    }
    throw new Error('The network response was error.');
  }).then(data => {
    result(data)
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}