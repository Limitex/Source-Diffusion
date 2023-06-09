const PORT = 8000;
const HOST = "localhost";

const GenerateStreamContainer = class {
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
  constructor(mtype, model_id, vae_id, lora_id) {
    this.mtype = mtype
    this.model_id = model_id;
    this.vae_id = vae_id;
    this.lora_id = lora_id;
  }

  convertToLiteral() {
    return {
      mtype: this.mtype,
      model_id: this.model_id,
      vae_id: this.vae_id,
      lora_id: this.lora_id
    };
  }
};

const AddNewModelContainer = class {
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

const UpdateModelInfoContainer = class {
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

class DeleteModelContainer {
  constructor(path) {
    this.path = path
  }
  convertToLiteral() {
    return {
      path: this.path,
    };
  }
}

const PostPidContainer = class {
  constructor(pid) {
    this.pid = pid;
  }

  convertToLiteral() {
    return {
      pid: this.pid
    };
  }
};

const UserSettingsContainer = class {
  constructor(savepath, save_enabled) {
    this.savepath = savepath;
    this.save_enabled = save_enabled;
  }

  convertToLiteral() {
    return {
      savepath: this.savepath,
      save_enabled: this.save_enabled
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

const showServerStatus = (data, failedText) => {
  if (data.status == 0) {
    Notice.append('Success.');
  } else if (data.status == 1) { // Normal Error Receive
    Notice.append(data.status_str);
  } else if (data.status == 2) { // Python Error Receive
    Notice.append(extractErrorLine(data.status_str));
  } else {
    Notice.append(failedText);
  }
  console.log(data);
}

const extractErrorLine = (err_str) => {
  const errorLines = err_str.trim().split('\n');
  const lastLine = errorLines[errorLines.length - 1].trim();
  const re = /^(\w+Error|Exception):\s+/;
  const errorText = lastLine.replace(re, '');
  return errorText;
}