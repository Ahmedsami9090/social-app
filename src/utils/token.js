import jwt from 'jsonwebtoken'
import { roleEnum } from '../db/models/user.model.js'

export const createToken = async (id, email, role, expiry = "2h")=>{
    let key = ''
    if (role == roleEnum.user){
        key = process.env.TOKEN_SECRET_KEY_USER
    }else{
        key = process.env.TOKEN_SECRET_KEY_ADMIN
    }
    const token = jwt.sign({_id : id, email},
        key,
        {expiresIn : expiry})
    return token
}

export const verifyToken = async (token, key)=>{
    const decoded = jwt.verify(token, key)
    return decoded
}