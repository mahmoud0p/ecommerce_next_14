import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import {  db, pool  } from "../db.server";
import { user } from "../schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { createToken } from "../signup/route";
import {  } from "pg";

export const POST = async(req:Request)=>{
    const clientConnection = await pool.connect();
    try{
         

        const data = await req.json()
        const {email , password} = data
        if(!email || !password){
            throw new Error("some information is missing!")
        }
        const [userExist]  = await db
        .select({id:user.id ,email:user.email ,password:user.password  , firstName:user.firstName , lastName:user.lastName , role:user.role})
        .from(user)
        .where(eq(user.email , email))
        .execute()
        
        if(!userExist ){
            throw new Error("this email didn't registered before")
        }
        const validPassword = bcrypt.compareSync(password , userExist.password)
        if(!validPassword){
            throw new Error("Invalid password")
        }
        const token = createToken(userExist.id)
        if(!token){
            throw new Error("error while creating token")
        }
        const userInfo = {
            id:userExist.id,
            firstName : userExist.firstName , 
            lastName : userExist.lastName , 
            email :userExist.email  ,
            role : userExist.role
        }
        cookies().set('token' , token , {httpOnly:true , maxAge:24*60*60*1000})
        return NextResponse.json({message:"user logged in succesfuly" , user:userInfo} , {status:200})
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }
    finally{
        clientConnection.release()
    }
}