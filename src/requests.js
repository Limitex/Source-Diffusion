const PORT = 8000
const HOST = 'localhost'

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