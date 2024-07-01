import { NextResponse } from "next/server"
import { db, pool } from "../db.server"
import { isAdmin } from "../admin/isAdmin"
import { category } from "../schema";
import { eq } from "drizzle-orm";

export const POST = async(req:Request)=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }

    const clientConnection = await pool.connect()
    try{
        const data = await req.json()
        const {name } = data ; 
        if(!name){
            throw new Error("We don't have the name")
        }
        const [categoryExist] = await db.select().from(category).where(eq(category.name , name))
        if(categoryExist){
            throw new Error("Category title is already exists.")
        }
        await db.insert(category).values({
            name
        })
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        return NextResponse.json({message:"Category Added Successfuly"})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}
export const GET = async(req:Request)=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect()
    try{
        const categories = await db.select().from(category)
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        if(categories.length>0){
            return NextResponse.json(categories , {status : 200})

        }
        else {
            return NextResponse.json({message:"No categories yet"} , {status:200})
        }
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
        const url = new URL(req.url)
        const searchParam =new URLSearchParams(url.searchParams) ; 
        const categoryId = searchParam.get('categoryId')
        if(!categoryId){
            throw new Error("cannot find the category id")
        }
        await db.delete(category).where(eq(category.id , categoryId))
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        return NextResponse.json({message:"Category deleted successfuly"} , {status:200}) ; 
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}
export const PUT = async(req:Request)=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect()
    try{
        const data =await req.json() ; 
        const {newName , categoryId} = data ; 
        if(!newName || !categoryId){
            throw new Error ("Some informations is missing..")
        }
        await db.update(category).set({
            name:newName 
        }).where(eq(category.id , categoryId))
        return NextResponse.json({message:"category updated successfuly"} , {status:200})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}