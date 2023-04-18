import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre:'Edgar',
        email:'edgar@edgar.com',
        confirmado:1,
        password:bcrypt.hashSync('password',10)
    }
]

export default usuarios