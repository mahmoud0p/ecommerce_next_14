import { NextResponse } from "next/server"
import { client, db, pool } from "../db.server"
import { user } from "../schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { verifyToken } from "../user/route"

export const POST = async(req:Request)=>{
    const clientConnection = await pool.connect();
    try{
        const data = await req.json()
        const token = cookies().get('token')
        if(!token){
            throw new Error("please,login first to access") ; 
        }
        const {id , password} = data
        if(!id || !password){
            throw new Error("some information is missing...")
        }
        const mainUserId = verifyToken(token.value)
        if(!mainUserId){
            throw new Error('cannot verify the token')
        }
        console.log('input :'+id , "main : " + mainUserId)
        if(id !== mainUserId){
            throw new Error("you should loggin your admin account first")
        }
        const [adminUser] =await db
        .select({role:user.role})
        .from(user)
        .where(eq(user.id , id))
        .execute()
        
        if(!adminUser){
            throw new Error("user is not recognized")
        }
        if(adminUser.role !== 'ADMIN'){
            throw new Error("only admins can authorize")

        }else{
            return NextResponse.json({message:'welcome to the control room' , role:adminUser.role} , {status:201})
        }
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }finally{
        clientConnection.release()
    }

}