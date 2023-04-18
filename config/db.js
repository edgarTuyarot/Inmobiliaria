import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config({path:'.env'})

const db = new Sequelize(process.env.DB_NOMBRE,process.env.DB_USER,process.env.DB_PASSWORD ??'',{
    hosto: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    define : {
        timestamps:true
    },
    pool:{
        max: 5, //maximo de conexion en simultaneo
        min: 0, //minimo
        acquire:30000, //tiempo que puede intentar una conexion
        idle:10000      //a los 10 segunds de inactividad y se desconecta
    },
    operatorAliases: false
})

export default db;