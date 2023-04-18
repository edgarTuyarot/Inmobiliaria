import Propiedad from './Propiedad.js'
import Categoria from './Categoria.js'
import Precio from './Precio.js'
import Usuario from './Usuario.js'


//Relaciones de tablas
Propiedad.belongsTo(Categoria,{foreignKey:'categoriaId'})
Propiedad.belongsTo(Precio,{foreignKey:'precioId'})
Propiedad.belongsTo(Usuario,{foreignKey:'usuarioId'})



//Exportamos los modelos.
export{
    Propiedad,
    Precio,
    Categoria,
    Usuario
}