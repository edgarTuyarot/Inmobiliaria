import nodemailer from 'nodemailer'
import { DatabaseError } from 'sequelize';

const emailRegistro = async (datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email,nombre,token} = datos

    //enviar email
    await transport.sendMail({
        from: 'Inmo.com',
        to:email,
        subject:'Confirma tu cuenta en Inmo.com',
        text:'confirmar cuenta',
        html:`
        <p>Hola ${nombre} confirma tu cuenta en inmo.com</p>
        <p>Tu cuenta ya esta lisata, solo debes confirmarla en el siguiente enlace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

        <p>Si tu no creaste esta cuenta, ingnora en mensaje.</p>

        `


    })


}
const olvidePassword = async (datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email,nombre,token} = datos

    //enviar email
    await transport.sendMail({
        from: 'Inmo.com',
        to:email,
        subject:'Resetear password Inmo.com',
        text:'resetear password',
        html:`
        <p>Hola ${nombre} solicitaste un reseteo de credencial password</p>
        <p>para realizarlo hace click en el siguiente enlace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/reset-password/${token}">Resetear Password</a></p>

        <p>Si tu no solicitaste el reseteo, ingnora en mensaje.</p>

        `


    })


}

export {
    emailRegistro,
    olvidePassword
}