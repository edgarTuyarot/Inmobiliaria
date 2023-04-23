import {validationResult} from 'express-validator'
import {unlink} from 'node:fs/promises'
import {Propiedad,Precio,Categoria} from '../models/index.js'
import db from '../config/db.js'



const admin = async (req,res)=>{
    //del req se estrae el id del usuario logeado
    const {id}=req.usuario
    //con el id se realiza la consulta a la base de datos
    const propiedades =  await Propiedad.findAll({where:
        {
        usuarioId : id
        },
        include:[
            {model: Categoria, as: 'categoria'},
            {model:Precio,as:'precio'}

        ]


    })

    res.render('propiedades/admin',{
        pagina:"Mis propiedades",
        propiedades,
        csrfToken: req.csrfToken()

    })

}
//Formulario para crear una nueva propiedad
const crear = async (req,res)=>{
    //consultar DB Precio y Categorias
    const [categorias,precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/crear',{
        pagina:"Crear tu anuncio",
        csrfToken: req.csrfToken(),
        precios,
        categorias,
        propiedad:{}
    })
}

//Funcion para guardar en la base de datos
const guardar = async (req,res)=>{
    //validacion de resultado
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        //importar precio y categorias desde db
        const [categorias,precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])


        return res.render('propiedades/crear',{
            pagina:"Crear tu anuncio",
            barra: true,
            csrfToken: req.csrfToken(),
            precios,
            categorias,
            errores:resultado.array(),
            propiedad:{
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                categoria: req.body.categoria,
                precio: req.body.precio,
                habitaciones: req.body.habitaciones,
                banios: req.body.banios,
                garage: req.body.garage,
                calle: req.body.calle,
                lat:req.body.lat,
                lng:req.body.lng,
            }
        })
    }
    const {titulo,descripcion,categoria,precio,habitaciones,banios,garage,calle,lat,lng} = req.body
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            categoriaId: categoria,
            precioId:precio,
            habitaciones,
            banios,
            garage,
            calle,
            lat,
            lng,
            usuarioId:req.usuario.id,
            imagen:"img"
        })
        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agrega-imagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}
const agregarImagen = async (req,res,next)=>{
    const {id} = req.params

    //validar que la propidad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que el usuario logeado sea el mismo que publico la propiedad
    //Validar con toString para evitar que futuros ORM evaluen tambien el tipo de numero como obejto.
    if(req.usuario.id.toString() != propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }



    res.render('propiedades/agregar-imagen',{
        pagina:`Agrega imagenes para ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken()


    })
}

const guardarImagenes=async (req,res,next) =>{
    const {id} = req.params

    //validar que la propidad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que el usuario logeado sea el mismo que publico la propiedad
    //Validar con toString para evitar que futuros ORM evaluen tambien el tipo de numero como obejto.
    if(req.usuario.id.toString() != propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {
        //almacenar imagen y publicar propiedad
        console.log(req.file)
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1
        await propiedad.save()
        //el next permite que se puede acceder al siguiente middleware viniendo desde el boton de publicar mediante la funcion en el dropzone
        next()

    } catch (error) {
        console.log(error)
    }

}

const editar = async (req,res)=>{
    const {id} = req.params
    //Validar que la propieda exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    //revisar que la propiedad sea del usuario
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //consultar DB Precio y Categorias
    const [categorias,precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/editar',{
        pagina:`Editar tu anuncio: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        precios,
        categorias,
        propiedad
    })


}
const guardarCambios = async (req,res)=>{
   //validacion de resultado
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('propiedades/editar',{
            pagina:`Editar tu anuncio: ${propiedad.titulo}`,
            barra: true,
            csrfToken: req.csrfToken(),
            errores:resultado.array(),
            propiedad:{
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                categoria: req.body.categoria,
                precio: req.body.precio,
                habitaciones: req.body.habitaciones,
                banios: req.body.banios,
                garage: req.body.garage,
                calle: req.body.calle,
                lat:req.body.lat,
                lng:req.body.lng,
            }
        })
    }

    //Verificacion de la propiedad en BBDD
    const {id} = req.params
    //Validar que la propieda exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    //revisar que la propiedad sea del usuario
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    //rescribir los datos de la propiedad en al base de datos
    try {
        const {titulo,descripcion,categoria,precio,habitaciones,banios,garage,calle,lat,lng} = req.body
        propiedad.set({
            titulo,
            descripcion,
            categoriaId: categoria,
            precioId:precio,
            habitaciones,
            banios,
            garage,
            calle,
            lat,
            lng
        })
        await propiedad.save()
        res.redirect('/mis-propiedades')

    } catch (error) {
        console.error(error)
    }

}

const eliminar = async (req,res)=>{
    const {id} = req.params
    //Validar que la propieda exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    //revisar que la propiedad sea del usuario
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    //eliminar la imagen asociada
    await unlink(`public/uploads/${propiedad.imagen}`)

    //eliminar de la bd la imagen
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}


//Muestra una propiedad
const mostrarPropiedad = async (req,res)=>{
    //Validar que la propieda exista
    const {id} = req.params
    const propiedad = await Propiedad.findByPk(id,{
        include:[
            {model: Categoria, as: 'categoria'},
            {model:Precio,as:'precio'}

        ]
    })

    if(!propiedad){
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar',{
        pagina: propiedad.titulo,
        propiedad
    })
}

export{
    admin,
    crear,
    guardar,
    agregarImagen,
    guardarImagenes,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad
}