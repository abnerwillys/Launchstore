const Mask = {
  apply(input, funcName) {
    setTimeout(() => {
      input.value = Mask[funcName](input.value)
    }, 1)
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "") //regular expression

    return value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }
}

const PhotosUpload = {
  input: "",
  preview: document.querySelector('#photos-preview'),
  uploadLimit: 6,
  files: [],
  handleFileInput(event) {
    const { files: fileList } = event.target
    PhotosUpload.input = event.target
    
    if(PhotosUpload.hasLimit(event)) return

    Array.from(fileList).forEach(file => {
      PhotosUpload.files.push(file)

      const reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = () => {
        const image = new Image()
        image.src   = String(reader.result)
        
        const div = PhotosUpload.getContainer(image)
        PhotosUpload.preview.appendChild(div)        
      }      
    })

    PhotosUpload.input.files = PhotosUpload.getAllFiles()
  },
  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload
    const { files: fileList } = input

    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} Fotos`)
      event.preventDefault()
      return true
    }

    const photosDiv = []
    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == "photo") {
        photosDiv.push(item)
      }
    })

    const totalPhotos = fileList.length + photosDiv.length

    if (totalPhotos > uploadLimit) {
      alert("Você atingiu o limite máximo de fotos")
      event.preventDefault()
      return true
    }

    return false
  },
  getAllFiles() {
    const dataTransfer = new DataTransfer() || new ClipboardEvent("").clipboardData

    PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

    return dataTransfer.files
  },
  getContainer(image) {
    const div = document.createElement('div')
    div.classList.add('photo')

    div.onclick = PhotosUpload.removePhoto

    div.appendChild(image)

    div.appendChild(PhotosUpload.getRemoveButton())

    return div
  },
  getRemoveButton() {
    const button = document.createElement('i')
    button.classList.add('material-icons')
    button.innerHTML = "close"
    return button
  },
  removePhoto(event) {
    const photoDiv    = event.target.parentNode // <div class="photo">
    const photosArray = Array.from(PhotosUpload.preview.children) //Make an Array with all divs .photos
    const index = photosArray.indexOf(photoDiv) //Find in array what photo will be deleted

    PhotosUpload.files.splice(index, 1) //splice remove an item from an array on the index informated. The second parameter is how many elements/index we'll remove starting after the index.
    PhotosUpload.input.files = PhotosUpload.getAllFiles()

    photoDiv.remove()
  }
}