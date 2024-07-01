'use server'
import { cookies } from "next/headers"
import { verifyToken } from "../user/route"
import { db } from "../db.server";
import { user } from "../schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export const isAdmin  = async()=>{
    try{
        const token = cookies().get("token")
        if(!token){
            throw new Error("cannot find the token") ; 
        }
        const id= verifyToken(token.value)
        const [findUser] =await db.select().from(user).where(eq(user.id , id)).execute()
        if(!findUser){
            throw new Error ('Sorry an error cannot find the user')
        }
        if(findUser.role !== "ADMIN"){
            throw new Error ('Un autherized')
        }
        return NextResponse.next()
    }catch(
        error:any
    ){
        return NextResponse.json({error : error.message} ,{status:500})
    }
}
