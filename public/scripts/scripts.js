// "Masks" are like dynamic functions I can add different actions according to the input I receive
// In order to it works I have to add "onkeydown/onclick", etc direct in HTML page
const Mask = {
    apply(input, func) {
        setTimeout(function() {
            input.value = Mask[func](input.value)
        }, 1)
    },
    formatBRL(value) {
        value = value.replace(/\D/g, "") // Prevents input other digit rather than numbers in the Price field and formats it to BRL.
                                            
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL' // R$1.000,00
        }).format(value/100) // It divides by 100 because it transforms 1,00 into 100 (removing the comma by the Regular Expression), so I turn it back!
    },
    cpfCnpj(value) {
        // removes any non-numeric character
        value = value.replace(/\D/g, "")

        // limits 14 characters in the field
        if (value.length > 14)
            value = value.slice(0, -1)

        // check if it is CNPJ - 11.222.333/4444-55
        if (value.length > 11) {
            // 11.222333444455
            value = value.replace(/(\d{2})(\d)/, "$1.$2")
            // 11.222.333444455
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            // 11.222.333/444455
            value = value.replace(/(\d{3})(\d)/, "$1/$2")
            // 11.222.333/4444-55
            value = value.replace(/(\d{4})(\d)/, "$1-$2")
        } else {
            // check if it is CPF - 111.222.333-44
            // 111.22233344
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            // 111.222.33344
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            // 111.222.333-44
            value = value.replace(/(\d{3})(\d)/, "$1-$2")
        }

        return value
    },
    cep(value) {
        // removes any non-numeric character
        value = value.replace(/\D/g, "")

        // limits 8 characters in the field
        if (value.length > 8)
            value = value.slice(0, -1)

        // formats to CEP - 11111-111
        value = value.replace(/(\d{5})(\d)/, "$1-$2")

        return value
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

        if (PhotosUpload.hasLimit(event)) return

        // The use of 'Array.from()' is for transforming the received list in 'fileList' into a 'Array', then I can use the 'forEach'.
        Array.from(fileList).forEach(file => {
            
            PhotosUpload.files.push(file)

            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image()
                image.src = String(reader.result)

                const div = PhotosUpload.getContainer(image)
                PhotosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    hasLimit(event) {
        const { uploadLimit, input, preview } = PhotosUpload
        const { files: fileList } = input

        if (fileList.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()
            return true
        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == "photo")
                photosDiv.push(item)
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
        // ClipboardEvent is for Firefox, DataTransfer is for Chrome
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

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
        const photoDiv = event.target.parentNode // <div class="photo">
        const photosArray = Array.from(PhotosUpload.preview.children)
        const index = photosArray.indexOf(photoDiv)


        PhotosUpload.files.splice(index, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photoDiv.remove()
    },
    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode

        if (photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]')
            if (removedFiles) {
                removedFiles.value += `${photoDiv.id},`
            }
        }

        photoDiv.remove()
    }
}

const ImageGallery = {
    highlight: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e) {
        const { target } = e

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
        target.classList.add('active')

        ImageGallery.highlight.src = target.src
        Lightbox.image.src = target.src
    }
}

const Lightbox = {
    target: document.querySelector('.lightbox-target'),
    image: document.querySelector('.lightbox-target img'),
    closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
    open() {
        Lightbox.target.style.opacity = 1
        Lightbox.target.style.top = 0
        Lightbox.target.style.bottom = 0
        Lightbox.closeButton.style.top = 0
    },
    close() {
        Lightbox.target.style.opacity = 0
        Lightbox.target.style.top = "-100%"
        Lightbox.target.style.bottom = "initial"
        Lightbox.closeButton.style.top = "-80px"
    }
}

const Validate = {
    apply(input, func) {
        Validate.clearErrors(input)
        
        let results = Validate[func](input.value)
        input.value = results.value

        if (results.error)
            Validate.displayError(input, results.error)
    },
    displayError(input, error) {
        const div = document.createElement('div')

        div.classList.add('error')
        div.innerHTML = error
        input.parentNode.appendChild(div)

        // prevents the user from leaving the field with an error
        input.focus()
    },
    clearErrors(input) {
        const errorDiv = input.parentNode.querySelector('.error')

        if (errorDiv)
            errorDiv.remove()
    },
    isEmail(value) {
        let error = null
        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if (!value.match(mailFormat))
            error = "Email inválido"

        return {
            error,
            value
        }
    },
    isCpfCnpj(value) {
        let error = null

        const cleanValues = value.replace(/\D/g, "")

        if (cleanValues.length > 11 && cleanValues.length !== 14) {
            error = "CNPJ inválido"
        } 
        else if (cleanValues.length < 12 && cleanValues.length !== 11) {
            error = "CPF inválido"
        }

        return {
            error,
            value
        }
    },
    isCep(value) {
        let error = null

        const cleanValues = value.replace(/\D/g, "")

        if (cleanValues.length !== 8) {
            error = "CEP inválido"
        } 

        return {
            error,
            value
        }
    },
    allFields(event) {
        const items = document.querySelectorAll('.item input, .item select, .item textarea')
    
        for (let item of items) {
            if (item.value == "" && items.removed_files.value != "") {
                const message = document.createElement('div')
                
                message.classList.add('messages')
                message.classList.add('error')
                message.style.position = 'fixed'
                
                message.innerHTML = "Todos os campos são obrigatórios."
                document.querySelector('body').append(message)

                event.preventDefault()
            }
        }
    }
}