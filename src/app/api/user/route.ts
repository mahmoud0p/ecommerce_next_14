import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import {   db, pool } from "../db.server";
import { user } from "../schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcrypt"
import validator from "validator";
export const verifyToken = (token:string)=>{
    const secret = process.env.secret_key
    if(!secret){
        throw new Error("cannot find the secret key")
    }
    try{
        const decoded  = jwt.verify(token ,secret ) as jwt.JwtPayload ; 
        if(!decoded){
            throw new Error("Token expired")
        }
        return decoded.id
    }catch(err:any){
        cookies().delete("token")
        return null
    }
}

export const GET = async(req:NextApiRequest)=>{
    const clientConnection = await pool.connect();
    try{
        const token = cookies().get("token") ; 
        if(!token){
            return NextResponse.json({isLoggedIn:false})
        }
        const id = verifyToken(token.value)
        const [loggedUser] = await db
        .select({id:user.id ,email : user.email , firstName : user.firstName , lastName:user.lastName , role : user.role})
        .from(user)
        .where(eq(user.id , id))
        .execute()
        
        if(!loggedUser){
            throw new Error ("cannot find the user")
        }
        return NextResponse.json({user:loggedUser} , {status:200})
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }finally{
        clientConnection.release()
    }

}

export const POST = async(req:NextApiRequest)=>{
    const clientConnection = await pool.connect();
    try{
        const token = cookies().get("token") ; 
        if(!token){
            return NextResponse.json({message:"already logged out"})
        }
        cookies().delete("token")
        return NextResponse.json({message:"user logged out succefuly!"})
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }
    finally{
        clientConnection.release()
    }
}

type NewData = {
    firstName ?:string , 
    lastName ?: string , 
    email ?:string ,
    password ?:string
}
export const PUT = async(req:Request)=>{
    const clientConnection = await pool.connect();
    try{
        const data = await req.json()
        const {firstName , lastName , email ,currentPassword , newPassword} = data
        if(!firstName || !lastName || !email){
            throw new Error("some informations is missing")
        }
        const token =cookies().get("token")
        if(!token ){
            throw new Error("Loggin first>>>")
        }
        const Id = verifyToken(token.value)
        const [existUser] = await db
        .select()
        .from(user)
        .where(eq(user.id , Id))
        .catch(err=>{
            throw new Error(err.message)
        })
        const newData : NewData = {}
        if(firstName !== existUser.firstName){
            newData.firstName =firstName
        }
        if(lastName !== existUser.lastName){
            newData.lastName =lastName
        }
        if(email !== existUser.email){
            newData.email =email
        }
        
        if(newPassword){
            const validPassword = bcrypt.compareSync(currentPassword , existUser.password)
            if(!validPassword){
                throw new Error("you entered your current password incorrect")
            }
            if(!validator.isStrongPassword(newPassword)){
                throw new Error('password is not strong enough ')
            }
            newData.password = bcrypt.hashSync(newPassword , 8)
        }
        if(newData.email || newData.password || newData.firstName || newData.lastName ){
            await db.update(user).set(newData).catch((err)=>{
                throw new Error(err.message)
            })
        }

        return NextResponse.json({message:"updated succefuly!"})
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }
    finally{
        clientConnection.release()
    }
}

