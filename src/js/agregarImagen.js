import {Dropzone} from 'dropzone'

const token = document.querySelector('meta[name="csrf-token"]').content

//Desde aca se configura el dropzone
Dropzone.options.imagen = {
    dictDefaultMessage: "sube tus imagenes aqui",
    acceptFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads:1,
    autoProcessQueue:false,
    addRemoveLinks:true,
    dictRemoveFile:'Borrar imagen',
    dictMaxFilesExceeded:"el limite es 1 archivo",
    dictFileTooBig:"Tamaño maximo 5MB",
    headers:{
        'CSRF-Token': token
    },
    paramName:'imagen',
    //modificando funciones de dropzone
    init: function (){
        const dropzone = this
        //asiganr la funcion al boton publicar
        const btnPublicar =  document.querySelector('#publicar')
        btnPublicar.addEventListener('click', function(){
            dropzone.processQueue()
        })
        //asignar la redireccion
        dropzone.on('queuecomplete',function(){
            if(dropzone.getActiveFiles().length == 0){
                window.location.href = '/mis-propiedades'
            }
        })
    }

}
