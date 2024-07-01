import { NextResponse } from "next/server"
import {  db, pool } from "../db.server"
import { product, product_description, product_details, product_images, product_subcategory, subcategory } from "../schema"
import { eq, sql } from "drizzle-orm"

export const GET  =async(req:Request)=>{
    const clientConnection = await pool.connect();
    try{

        const url = new URL(req.url)
        const searchParams = new URLSearchParams(url.searchParams)
        const id = searchParams.get("id")
        if(!id){
            throw new Error("cannot find id property")
        }
        const id_string = id.toString()
        const [getProduct] = await db.select(
            {
                id:product.id ,
                name:product.name , 
                price:product.price , 
                countInStock :product.countInStock , 
                description : product_description.content ,
                details : product_details.content , 
                rating:product.rating ,
                images : sql`array_agg(json_build_object('id',${product_images.id} , 'url',${product_images.url}))` , 
                category:sql`
                (SELECT ${subcategory.name} FROM ${subcategory}
                 INNER JOIN ${product_subcategory} ON ${product_subcategory.subcategoryId} = ${subcategory.id}
                 WHERE ${product_subcategory.subcategoryId} = ${subcategory.id})`

            }
        ).from(product)
        .leftJoin(product_images ,eq(product.id  , product_images.productId))
        .leftJoin(product_description , eq(product.id , product_description.productId))
        .leftJoin(product_details , eq(product.id , product_details.productId))
        .where(eq(product.id , id_string))
        .groupBy(product.id , product.name , product.price , product.countInStock , product.id  , product_description.content , product_details.content)
        .execute()
        
        return NextResponse.json(getProduct ,{status:200})
    }catch(err:any){
        return NextResponse.json({error:err.message})
    }
    finally{
        clientConnection.release()
    }
}