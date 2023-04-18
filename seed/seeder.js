import categorias from './categorias.js'
import {Categoria,Precio,Usuario} from '../models/index.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
import db from '../config/db.js'

const importarDatos = async ()=>{
    try {
        //autenticar en la BD
        await db.authenticate()
        //Generar las columnas
        await db.sync()

        //Insertar los datos
        await Promise.all([
            Usuario.bulkCreate(usuarios),
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
        ])

        console.log('Datos importados correctamente')
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

const eliminarDatos = async ()=>{
    try {
        await db.sync({force:true})
        console.log('Datos Eliminados')
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2] == "-i"){
    importarDatos();
}
if(process.argv[2] == "-e"){
    eliminarDatos();
}