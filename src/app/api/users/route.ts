import { NextResponse } from "next/server";
import { isAdmin } from "../admin/isAdmin";
import { db, pool } from "../db.server";
import { reviews, user } from "../schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../user/route";
import { cookies } from "next/headers";

export const GET = async(req:Request)=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect()
    try{
        const users = await db.select().from(user)
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        return NextResponse.json(users, {status:200})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}
export const DELETE = async(req:Request)=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect()
    try{    
        const url = new URL(req.url) ;
        const searchParams = new URLSearchParams(url.searchParams)
        const userId = searchParams.get('userId')
        const token = cookies().get('token')
        if(!token){
            throw new Error("Login in first")
        }
        const id = verifyToken(token.value)
        if(id=== userId){
            throw new Error("You can't delete your self..")
        }
        if(!userId){
            throw new Error("cannot find the subcategory")
        }
        const [findUser] = await db.select().from(user).where(eq(user.id , userId))
        if(!findUser){
            throw new Error("Cannot find that user or already deleted..")
        }
        if(findUser.role === "ADMIN"){
            throw new Error('Cannot delete user because he is Admin')
        }
        await db
        .delete(reviews)
        .where(eq(reviews.userId , userId))
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        await db
        .delete(user)
        .where(eq(user.id , userId))
        .catch((err)=>{
            throw new Error (err.message)
        })
        return NextResponse.json({message:"user is deleted successfuly"})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}