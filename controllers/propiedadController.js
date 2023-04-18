import {validationResult} from 'express-validator'
import {Propiedad,Precio,Categoria} from '../models/index.js'
import db from '../config/db.js'



const admin = (req,res)=>{
    res.render('propiedades/admin',{
        pagina:"Mis propiedades",

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
    console.log(req.usuario)
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



    res.render('propiedades/agregar-imagen',{
        pagina:"Agrega imagenes a tu anuncio",
    })
}


export{
    admin,
    crear,
    guardar,
    agregarImagen
}