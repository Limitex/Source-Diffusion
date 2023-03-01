const generateImage = () => {
  postRequest('/', { key: 'value' }, (data) => {
    console.log(data)
  })
}