import express from 'express'
import {formularioLogin,formularioRegistro, formularioResetPassword,registrar,confirmar, resetPassword,comprobarToken,nuevoPassword,autenticar} from '../controllers/usuarioController.js'



const router = express.Router()

router.get('/login', formularioLogin)
router.post('/login', autenticar)
router.get('/registro',formularioRegistro)
router.post('/registro',registrar)
router.get('/confirmar/:token',confirmar)

router.get('/reset-password',formularioResetPassword)
router.post('/reset-password',resetPassword)

//almacena el nuevo password
router.get('/reset-password/:token',comprobarToken)
router.post('/reset-password/:token',nuevoPassword)




export default router