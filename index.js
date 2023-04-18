
import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'

import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import db from './config/db.js'
import { cookie } from 'express-validator'


//crear la app
const app = express();

//habilitar lectura de forms
app.use(express.urlencoded({extended:true}))

//conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log('conexion correcta a la base de datos')
} catch (error) {
console.log(error)
}
//habilitar cookieParser
app.use(cookieParser())

//Habilitar csurf
app.use(csrf({cookie:true}))
//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//carpeta publica
app.use(express.static('public'))


//Routing
app.use('/auth', usuarioRoutes);
app.use('/',propiedadesRoutes)


//Definir un puerto y arrancar el proyecto.-
const port = 3000;

app.listen(port,()=>{
    console.log("Server onPort = ", port)
})
