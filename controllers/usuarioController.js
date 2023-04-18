import {check,validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js"
import {generarId,generarJwt} from '../helpers/tokens.js'
import {emailRegistro,olvidePassword} from '../helpers/email.js'


const formularioLogin = (req,res) =>{
    res.render('auth/login',{
        pagina:"Iniciar Sesion",
        csrfToken: req.csrfToken()

    })
}

const autenticar = async (req,res) =>{
    //extraer los datos del request
    const {email,password} = req.body
    //validaciones
    await check('email').isEmail().withMessage("Email no puede estar vacio").run(req)
    await check('password').notEmpty().withMessage("Password no puede estar vacio").run(req)

    let resultado = validationResult(req)
    //verificar si el arreglo de errores esta vacio, sino retoranar a la vista de registro con los errores encontrados
    if(!resultado.isEmpty()){
        return  res.render('auth/login',{
                    pagina:"Iniciar Sesion",
                    errores: resultado.array(),
                    csrfToken: req.csrfToken()
                })
    }
    //Verificar si el mail ya esta en la base de datos
    const usuario = await Usuario.findOne({where: {email}})
    //Si no esta
    if (!usuario) {
        return  res.render('auth/login',{
            pagina:"Iniciar Sesion",
            errores: [{msg:"Usuario Inexistente"}],
            csrfToken: req.csrfToken()
        })
    }
    //Si esta y esta confirmada la cuenta
    if(!usuario.confirmado){
        return  res.render('auth/login',{
            pagina:"Iniciar Sesion",
            errores: [{msg:"Cuenta no confirmada"}],
            csrfToken: req.csrfToken()
        })
    }
    //Verificar el password
    if(!usuario.verificarPassword(password)){
        return  res.render('auth/login',{
            pagina:"Iniciar Sesion",
            errores: [{msg:"Contraseña incorrecta"}],
            csrfToken: req.csrfToken()
        })
    }

    //Auntentica usuario
    const token=generarJwt({id:usuario.id,nombre:usuario.nombre})
    //almacenar en un cookie
    return res.cookie('_token',token,{
        httpOnly:true,
        //secure: true,

    }).redirect('/mis-propiedades')


}
const formularioRegistro = (req,res) =>{
    console.log(req.csrfToken())
    res.render('auth/registro',{
        pagina:"Crear Cuenta",
        csrfToken: req.csrfToken()
    })


}

const registrar = async (req,res)=>{
    //extraer los datos del request
    const {nombre,email,password} = req.body
    //Validacion
    await check('nombre').notEmpty().withMessage("El nombre no puede estar vacio").run(req)
    await check('email').isEmail().withMessage("Eso no parece un email").run(req)
    await check('password').isLength({min:6}).withMessage("Password minimo de 6 caracteres").run(req)
    await check('repetir_password').equals(password).withMessage("Los password no son iguales").run(req)


    let resultado = validationResult(req)
    //verificar si el arreglo de errores esta vacio, sino retoranar a la vista de registro con los errores encontrados
    if(!resultado.isEmpty()){
        return  res.render('auth/registro',{
                    pagina:"Crear Cuenta",
                    errores: resultado.array(),
                    usuario:{
                        nombre: nombre,
                        email:email
                    },
                    csrfToken: req.csrfToken()
                })
    }
    //Verificar si el mail ya esta en la base de datos
    const existeUsuario = await Usuario.findOne({where: {email}})
    //condicional segun la respuesta de la consulta anterior
    if(existeUsuario){
        return  res.render('auth/registro',{
            pagina:"Crear Cuenta",
            errores: [{msg:"Email ya registrado"}],
            csrfToken: req.csrfToken()
        })
    }

    //Almacenar Usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //envia mail de confirmacion
    const {token} = usuario;

    emailRegistro({nombre,email,token})

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un Email de confirmacion'

    })

}

//funcion compraobar cuenta de mail
const confirmar=async(req,res)=>{
    const {token} = req.params
    //verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
        pagina:"Error al confirmar tu cuenta",
        error:true,
        mensaje: "No se pudo confirmar la cuenta, validaciones incorrectas"
    })
    }
    //cambiar estado en base de datos
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save()

    return res.render('auth/confirmar-cuenta',{
        pagina:"Cuenta Confirmada",
        mensaje: "La cuenta se confirmo correctamente"
    })
}

const formularioResetPassword = (req,res) =>{
    res.render('auth/reset-password',{
        pagina:"Restablecer Password",
        csrfToken: req.csrfToken()
    })

}

const resetPassword = async (req,res)=>{
    //extraer los datos del request
    const {email} = req.body
    //Validacion
    await check('email').isEmail().withMessage("Eso no parece un email").run(req)

    let resultado = validationResult(req)
    //verificar si el arreglo de errores esta vacio, sino retoranar a la vista de registro con los errores encontrados
    if(!resultado.isEmpty()){
        return  res.render('auth/reset-password',{
                    pagina:"Restablecer Password",
                    errores: resultado.array(),
                    csrfToken: req.csrfToken()
                })
    }
    //Verificar si el mail  esta en la base de datos
    const usuario = await Usuario.findOne({where: {email}})
    //condicional segun la respuesta de la consulta anterior
    if(!usuario){
        return  res.render('auth/reset-password',{
            pagina:"Restablecer Password",
            errores: [{msg:"Usuario no registrado"}],
            csrfToken: req.csrfToken()
        })
    }

    //Generar un token y enviar email
    usuario.token = generarId();
    await usuario.save()

    //Enviar mail
    olvidePassword({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })

    //Renderizar vista
    res.render('templates/mensaje',{
        pagina: 'Resetear Password',
        mensaje: 'Hemos enviado un Email para el reseteo del password'

    })


}

const comprobarToken = async (req,res)=>{
    const {token} = req.params
    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
        pagina:"Resetear tu password",
        error:true,
        mensaje: "Validaciones incorrectas, intenta de nuevo"
    })
    }
    //mostrar formulario para resetear el password
    return  res.render('auth/update-password',{
        pagina:"Resetear Password",
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req,res,next)=>{
    //extraer los datos del request
    const {password} = req.body
    const {token} = req.params
    //validar el password
    await check('password').isLength({min:6}).withMessage("Password minimo de 6 caracteres").run(req)
    await check('repetir_password').equals(password).withMessage("Los password no son iguales").run(req)

    let resultado = validationResult(req)
    //verificar si el arreglo de errores esta vacio, sino retoranar a la vista de registro con los errores encontrados
    if(!resultado.isEmpty()){
        return  res.render('auth/update-password',{
            pagina:"Resetear Password",
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }


    //Identificar el usuario que solicito el reset
    const usuario = await Usuario.findOne({where: {token}})
    //hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token=null
    usuario.save()

    res.render('templates/mensaje',{
        pagina: 'Resetear Password',
        mensaje: 'Password reseteado con exito!'

    })


}
export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioResetPassword,
    registrar,
    confirmar,
    resetPassword,
    nuevoPassword,
    comprobarToken
}