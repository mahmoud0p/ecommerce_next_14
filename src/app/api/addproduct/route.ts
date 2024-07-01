'use server';
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { join } from "path";
import _ from "lodash";
import mime from "mime";
import {  db, pool } from "../db.server";
import { product, product_description, product_details, product_images, product_subcategory, reviews, subcategory } from "../schema";
import { isAdmin } from "../admin/isAdmin";
import { desc, eq, sql } from "drizzle-orm";
import path from "path"
const uploadDir = join(process.cwd(), 'public', 'uploads');

export const POST = async (req: NextRequest) => {
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect();  
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string | null;
        const price = formData.get("price") as string | null;
        const countInStock = Number(formData.get("countInStock")) as number | null;
        const description = formData.get("description") as string | null;
        const details = formData.get("details") as string | null;
        const images = formData.getAll("images") as File[] | null;
        const subId  = formData.get('subId') as string ;
        if (!name || !price || !countInStock || !description || !details || !subId) {
            throw new Error("some informations is missing");
        }

        if (!images) {
            throw new Error("there's no uploaded images");
        }
        if (images.length < 5) {
            throw new Error("you must at least upload 5 images");
        }
        const [findSubcategory] = await db
        .select()
        .from(subcategory)
        .where(eq(subcategory.id , subId))
        .catch((err)=>{
            throw new Error(err.message)
        })
        if(!findSubcategory){
            throw new Error('cannot find the subcategory')
        }
        const [createdProduct] = await db
        .insert(product)
        .values({ name, price, countInStock })
        .returning({ id: product.id })
        .execute()
        .catch((err:any)=>{
            throw new Error(err.message)
        })

        await db.insert(product_subcategory).values({
            productId:createdProduct.id ,
            subcategoryId:subId
        })
        const [productDetail] = await db
        .insert(product_details)
        .values({ content: details, productId: createdProduct.id })
        .returning({ id: product_details.id })
        .execute()
        
        if (!productDetail) {
            throw new Error("an error occured while creating product details");
        }

        const [productDescription] = await db
        .insert(product_description)
        .values({ content: description, productId: createdProduct.id })
        .returning({ id: product_description.id })
        .execute()
        
        if (!productDescription) {
            throw new Error("an error occured while creating description");
        }

        const dirExist = fs.statSync(uploadDir);
        if (!dirExist) {
            throw new Error("cannot find uploading folder");
        }

        await Promise.all(images.map(async (image) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const buffer = Buffer.from(await image.arrayBuffer());
            const filename = `${image.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
            fs.writeFileSync(`${uploadDir}/${filename}`, buffer);
            const fileUrl = `/uploads/${filename}`;
            const [productImage] = await db
            .insert(product_images)
            .values({ url: fileUrl, productId: createdProduct.id })
            .returning({ id: product_images.id })
            .execute()
            
            if (!productImage) {
                throw new Error("an error occured while uploading image");
            }
            return productImage;
        }));

        return NextResponse.json({ message: "product created succesfuly" });
    } catch (err: any) {
        console.log(err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        clientConnection.release();  
    }
};
export const GET =async()=>{
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }
    const clientConnection = await pool.connect()
    try{
        const products = await db.select({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: sql`
                (
                    SELECT ${product_images.url}
                    FROM ${product_images}
                    WHERE ${product_images.productId} = ${product.id}
                    LIMIT 1
                ) AS image_url
            `,
            category:sql`
            (SELECT ${subcategory.name} FROM ${subcategory}
             INNER JOIN ${product_subcategory} ON ${product_subcategory.subcategoryId} = ${subcategory.id}
             WHERE ${product_subcategory.subcategoryId} = ${subcategory.id})`
        }).from(product)
        .leftJoin(product_images , eq(product_images.productId , product.id))
        .groupBy(product.id , product.name , product.price)
        return NextResponse.json(products)
    }catch(error:any){
        return NextResponse.json({error:error.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}

export const DELETE = async (req: Request) => {
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }

    const clientConnection = await pool.connect();
    try {
        const url = new URL(req.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const productId = searchParams.get('productId');
        if (!productId) {
            throw new Error('Cannot find the product ID');
        }

        await db.delete(product_description).where(eq(product_description.productId, productId));

        await db.delete(product_details).where(eq(product_details.productId, productId));

        const productImages = await db.select().from(product_images).where(eq(product_images.productId, productId));

        if (productImages.length > 0) {
            for (const image of productImages) {
                await db.delete(product_images).where(eq(product_images.id, image.id));

                const fileUrl = path.basename(image.url);
                const filePath = path.join(process.cwd(), 'public', 'uploads', fileUrl);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await db.delete(reviews).where(eq(reviews.productId, productId));

        await db.delete(product).where(eq(product.id, productId));

        return NextResponse.json({ message: "Product deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting product:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        clientConnection.release();
    }
};

type MainInfo = {
    name? :string  ,
    price ?  : string ,
    countInStock ? : number , 
}
export const PUT = async (req: Request) => {
    const adminResponse = await isAdmin();
    if (adminResponse.status !== 200) {
        return adminResponse;
    }

    const clientConnection = await pool.connect();
    try {
        const formData = await req.formData();
        const productId = formData.get("productId") as string | null;
        const name = formData.get("name") as string | null;
        const price = formData.get("price") as string | null;
        const countInStock = Number(formData.get("countInStock")) as number | null;
        const description = formData.get("description") as string | null;
        const details = formData.get("details") as string | null;
        const images = formData.getAll("images") as File[] | null;
        const subId  = formData.get('subId') as string;
        const imagesDeleted = formData.getAll('imagesDeleted') as []
        if (!productId || !name || !price || !countInStock || !description || !details ) {
            throw new Error("Some information is missing");
        }
        const mainInformations : MainInfo = {}
        const [existingProduct] = await db
        .select({
            id:product.id , 
            name:product.name , 
            price : product.price , 
            countInStock : product.countInStock , 
            description  : product_description.content ,
            details : product_details.content
        })
        .from(product)
        .where(eq(product.id, productId))
        .leftJoin(product_description , eq(product_description.productId , productId))
        .leftJoin(product_details , eq(product_details.productId , productId))
        .groupBy(product.id , product.name , product.price, product.countInStock , product_description.content , product_details.content)
        .execute()
        .catch((err:any)=>{
            throw new Error(err.message)
        })
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        if(name){
            mainInformations.name =  name === existingProduct.name ? undefined : name
        }
        if(price){
            mainInformations.price = price === existingProduct.price  ? undefined : price
        }
        if(countInStock){
            mainInformations.countInStock = countInStock === Number(existingProduct.countInStock) ? undefined : countInStock
        }
        if(mainInformations.name || mainInformations.price || mainInformations.countInStock){
            await db.update(product)
                .set(mainInformations)
                .where(eq(product.id, productId))
                .execute();

        }
        if(description && description !== existingProduct.description  ){
            await db.update(product_description)
                .set({ content: description })
                .where(eq(product_description.productId, productId))
                .execute();
        }
        if(details && details !== existingProduct.details){
            await db.update(product_details)
                .set({ content: details })
                .where(eq(product_details.productId, productId))
                .execute();
        }
        if(subId){
            await db.update(product_subcategory)
                .set({ subcategoryId: subId })
                .where(eq(product_subcategory.productId, productId))
                .execute();
        }

            const existingImages = await db.select().from(product_images).where(eq(product_images.productId, productId)).execute();
            if((existingImages.length - (imagesDeleted.length || 0) + (images?.length || 0) )< 5 ){
                throw new Error("Images cannot be less than 5 images")
            }
        if (imagesDeleted && imagesDeleted.length > 0) {
            for (const image of imagesDeleted) {
                const [imageToBeDeleted] = await db
                .select()
                .from(product_images)
                .where(eq(product_images.id , image))
                .catch((err)=>{
                    throw new Error(err.message , image)
                })
                await db
                .delete(product_images)
                .where(eq(product_images.id, imageToBeDeleted.id))
                .execute()
                .catch((err)=>{
                    throw new Error (err.message)
                });

                const fileUrl = path.basename(imageToBeDeleted.url);
                const filePath = path.join(uploadDir, fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

        }
         if(images && images.length){
             await Promise.all(images.map(async (image) => {
                 const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                 const buffer = Buffer.from(await image.arrayBuffer());
                 const filename = `${image.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
                 fs.writeFileSync(`${uploadDir}/${filename}`, buffer);
                 const fileUrl = `/uploads/${filename}`;
    
                 await db.insert(product_images)
                     .values({ url: fileUrl, productId: productId })
                     .execute();
             }));
         }   


        return NextResponse.json({ message: "Product updated successfully" });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        clientConnection.release();
    }
};