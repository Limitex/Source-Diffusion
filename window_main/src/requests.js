const PORT = 8000;
const HOST = "localhost";

const GenerateContainer = class {
  constructor(positive, negative, height, width, steps, scale, num, eta, seed) {
    this.positive = positive;
    this.negative = negative;
    this.height = height;
    this.width = width;
    this.steps = steps;
    this.scale = scale;
    this.num = num;
    this.eta = eta;
    this.seed = seed;
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
      seed: this.seed,
    };
  }
};

const ModelChangeContainer = class {
  constructor(mtype, model_id, vae_id) {
    this.mtype = mtype
    this.model_id = model_id;
    this.vae_id = vae_id;
  }

  convertToLiteral() {
    return {
      mtype: this.mtype,
      model_id: this.model_id,
      vae_id: this.vae_id,
    };
  }
};

const LoadNewModelInfo = class {
  constructor(path, name, description) {
    this.path = path;
    this.name = name;
    this.description = description;
  }

  convertToLiteral() {
    return {
      path: this.path,
      name: this.name,
      description: this.description,
    };
  }
};

const PostPid = class {
  constructor(pid) {
    this.pid = pid;
  }

  convertToLiteral() {
    return {
      pid: this.pid
    };
  }
};

const postRequest = (path, body, result) => {
  fetch("http://" + HOST + ":" + PORT + path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("The network response was error.");
    })
    .then((data) => {
      result(data);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

const socketRequest = (path, open, close, message) => {
  const socket = new WebSocket("ws://" + HOST + ":" + PORT + path);
  socket.addEventListener("open", (event) => open(event, socket));
  socket.addEventListener("message", (event) => message(event, socket));
  socket.addEventListener("close", (event) => close(event, socket));
};
