import { NextResponse } from "next/server"
import { db, pool } from "../db.server"
import { isAdmin } from "../admin/isAdmin";
import { category, category_subcategory, product_subcategory, subcategory, subcategory_image } from "../schema";
import { eq, sql } from "drizzle-orm";
import mime from "mime"
import * as fs from "fs"
import path from "path";
const uploadDir = path.join(process.cwd() , 'public' , 'uploads' )
export const POST = async(req:Request)=>{
    const clientConnection = await pool.connect()
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    try{
        const data=await req.formData()
        const name = data.get("name") as string; 
        const categoryId = data.get('categoryId') as string ;
        const image  = data.get('image') as File ;
        console.log(name, categoryId , image)
        if(!name || !image || !categoryId){
            throw new Error('Some informations is missing')
        }
        const [findCategory] = await db.select().from(category).where(eq(category.id , categoryId))
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        if(!findCategory){
            throw new Error("cannot find this category id")
        }
        const [createSub] = await db.insert(subcategory).values({
            name ,             
        }).returning({id:subcategory.id}).catch((err:any)=>{
            throw new Error(err.message)
        })
        
        await db.insert(category_subcategory).values({
            categoryId : findCategory.id , 
            subcategoryId:createSub.id
        }).catch((err:any)=>{
            throw new Error(err.message)
        })
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = `${image.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
        fs.writeFileSync(`${uploadDir}/${filename}`, buffer);
        await db.insert(subcategory_image).values({
            url:filename , 
            subcategoryId:createSub.id
        })
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        return NextResponse.json({message:'subcategory created successfuly'} , {status:200})
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
        const subcategories = await db
  .select({
    id: subcategory.id,
    name: subcategory.name,
    image: sql`
      (SELECT ${subcategory_image.url} FROM ${subcategory_image} WHERE ${subcategory_image.subcategoryId} = ${subcategory.id})`,
    category: sql`
      (SELECT ${category.name} FROM ${category}
       INNER JOIN ${category_subcategory} ON ${category_subcategory.categoryId} = ${category.id}
       WHERE ${category_subcategory.subcategoryId} = ${subcategory.id})`
  })
  .from(subcategory)
  .leftJoin(subcategory_image, eq(subcategory_image.subcategoryId, subcategory.id))
  .catch((err: any) => {
    throw new Error(err.message);
  });

        return NextResponse.json(subcategories , {status:200})
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
        const subId = searchParams.get('subId')
        if(!subId){
            throw new Error("cannot find the subcategory")
        }
        await db
        .delete(category_subcategory)
        .where(eq(category_subcategory.subcategoryId , subId))
        .catch((err)=>{
            throw new Error (err.message)
        })
        await db
        .delete(product_subcategory)
        .where(eq(product_subcategory.subcategoryId ,subId ))
        .catch((err)=>{
            throw new Error(err.message)
        })
        const [subcategoryUrl ] = await db.select({
            url:subcategory_image.url
        }).from(subcategory_image)
        .where(eq(subcategory_image.subcategoryId, subId ))
        if(subcategoryUrl){
            fs.unlinkSync(`${uploadDir}/${subcategoryUrl.url}`)
        }
        await db.delete(subcategory_image).where(eq(subcategory_image.subcategoryId , subId))
        await db
        .delete(subcategory)
        .where(eq(subcategory.id , subId))
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        return NextResponse.json({message:"Subcategory is deleted successfuly"})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}
export const PUT = async (req: Request) => {
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
      return adminResponse;
    }
    const clientConnection = await pool.connect();
    try {
      const data = await req.formData();
      const subId = data.get('subId') as string;
      const name = data.get("name") as string;
      const categoryId = data.get('categoryId') as string;
      const image = data.get('image') as File | null; 
  
      console.log(subId, name, categoryId, image);
  
      
  
      // Check if the subcategory exists
      const [findSubcategory] = await db
        .select()
        .from(subcategory)
        .where(eq(subcategory.id, subId))
        .catch((err: any) => {
          throw new Error(err.message);
        });
  
      if (!findSubcategory) {
        throw new Error("Cannot find this subcategory ID");
      }
  
      // Update subcategory name
      if(name){
          await db
            .update(subcategory)
            .set({ name })
            .where(eq(subcategory.id, subId))
            .catch((err: any) => {
              throw new Error(err.message);
            });
      }
      if(categoryId){
          await db
            .update(category_subcategory)
            .set({ categoryId })
            .where(eq(category_subcategory.subcategoryId, subId))
            .catch((err: any) => {
              throw new Error(err.message);
            });
      }
  
  
      // Handle image upload if a new image is provided
      if (image) {
        // Delete the old image
        const [subcategoryUrl] = await db
          .select({ url: subcategory_image.url })
          .from(subcategory_image)
          .where(eq(subcategory_image.subcategoryId, subId));
  
        if (subcategoryUrl) {
          fs.unlinkSync(`${uploadDir}/${subcategoryUrl.url}`);
        }
  
        // Upload the new image
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = `${image.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
        fs.writeFileSync(`${uploadDir}/${filename}`, buffer);
  
        // Update image URL in the database
        await db
          .update(subcategory_image)
          .set({ url: filename })
          .where(eq(subcategory_image.subcategoryId, subId))
          .catch((err: any) => {
            throw new Error(err.message);
          });
      }
  
      return NextResponse.json({ message: 'Subcategory updated successfully' }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
      clientConnection.release();
    }
  };
  