import { NextResponse } from "next/server"
import { db, pool } from "../db.server"
import { category, category_subcategory, subcategory, subcategory_image } from "../schema"
import { sql } from "drizzle-orm"

export const GET = async(req:Request)=>{
    const clientConnection = await pool.connect()
    try{
        const Categories = await db.select(
            {
                id:category.id , 
                title:category.name , 
                subcategories : sql`
                    (
                        SELECT 
                            json_agg(
                                json_build_object(
                                'id' , ${subcategory.id} ,
                                'title' , ${subcategory.name} )
                                
                                
                                
                            )

                        FROM ${
                            category_subcategory
                        }
                        LEFT JOIN ${subcategory} s ON ${category_subcategory.subcategoryId} = ${subcategory.id} 
                        WHERE ${category_subcategory.categoryId} = ${sql`${category.id}`}
                    ) AS subcategories
                `
            }
        ).from(category)
        .groupBy(category.id , category.name )
        return NextResponse.json(Categories)
    }catch(err:any){
        return NextResponse.json({error:err.message})
    }
    finally{
        clientConnection.release()
    }
}