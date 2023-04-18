import express from 'express'
import {body} from 'express-validator'

import {admin,crear,guardar,agregarImagen,guardarImagenes} from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'

const router = express.Router()

router.get('/mis-propiedades',protegerRuta,admin)
router.get('/propiedades/crear',protegerRuta,crear)
router.post('/propiedades/crear',protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().isLength({max:200}).withMessage('La descripcion del anuncio es obligatoria'),
    body('categoria').isNumeric().withMessage('Se debe seleccionar una categoria'),
    body('precio').isNumeric().withMessage('Se debe seleccionar un precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('banios').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('garage').isNumeric().withMessage('Selecciona la cantidad de garage'),
    body('calle').notEmpty().withMessage('Se debe ubicar la propiedad en el mapa'),
    guardar
)
router.get('/propiedades/agrega-imagen/:id',protegerRuta,agregarImagen)

router.post('/propiedades/agrega-imagen/:id',protegerRuta,upload.single('imagen'),guardarImagenes)

export default router