import { NextRequest, NextResponse } from "next/server"
import { db, pool } from "../db.server"
import { product, productCarousel, product_images, productsToCarousel } from "../schema"
import _ from "lodash"
import { eq, sql } from "drizzle-orm"
import { isAdmin } from "../admin/isAdmin"
export const POST  = async(req:NextRequest)=>{
    const isAdminRes = await isAdmin();
    if (isAdminRes.status !== 200) {
        return NextResponse.json({ error: "unauthorized" }, { status: 500 });
    }
    const clientConnection = await pool.connect()

    try{
        const data = await req.json()
        const {products , title} = data
        if(!products || !title){
            throw new Error("some informations are missing")
        }
        if(products.length === 0 || !Array.isArray(products)){
            throw new Error("products cannot be empty..")
        }
        const [Carousel] = await db
        .insert(productCarousel)
        .values({
            title 
        })
        .returning({id:productCarousel.id})
        .catch(err=>{
            throw new Error(err.message)
        })
        if(!Carousel){
            throw new Error("an error occured while creating the Carousel")
        }
        _.each(products , async(productId)=>{
            await db.insert(productsToCarousel).values({
                productId , 
                carouselId:Carousel.id
            })
            .catch(err=>{
                throw new Error(err.message)
            })
        })
        return NextResponse.json({message:'New Product Carousel Added ...'})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }
    finally{
        clientConnection.release()
    }
}
export const DELETE  = async(req:NextRequest)=>{
    const isAdminRes = await isAdmin();
    if (isAdminRes.status !== 200) {
        return NextResponse.json({ error: "unauthorized" }, { status: 500 });
    }
    const clientConnection = await pool.connect()

    try{
        const url = new URL(req.url) 
        const searchParams = new URLSearchParams(url.searchParams)
        const carouselId = searchParams.get('carouselId')
        if(!carouselId){
            throw new Error("Cannot find carousel id")
        }
        await db
        .delete(productsToCarousel)
        .where(eq(productsToCarousel.carouselId , carouselId))
        .catch(err=>{throw new Error(err.message)})
        await db
        .delete(productCarousel)
        .where(eq(productCarousel.id , carouselId))
        .catch(err=>{
            throw new Error(err.message)
        })
        return NextResponse.json({message:'Carousel deleted successfuly...'})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }
    finally{
        clientConnection.release()
    }
}



export const GET = async (req: NextRequest) => {
    const clientConnection = await pool.connect();
    try {
        const carousels = await db
            .select({
                carouselId: productCarousel.id,
                carouselTitle: productCarousel.title,
                products: sql`
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', p.id,
                                'name', p.name,
                                'price', p.price,
                                'image', (
                                    SELECT pi.url
                                    FROM ${product_images} pi
                                    WHERE ${product_images.productId} = p.id
                                    LIMIT 1
                                )
                            )
                        )
                        FROM ${productsToCarousel} 
                        INNER JOIN ${product} p ON ${productsToCarousel.productId} = ${product.id} 
                        WHERE ${productsToCarousel.carouselId} = ${sql`${productCarousel.id}`}
                    ) AS products`
            })
            .from(productCarousel)
            .execute()
            
        if (!carousels) {
            throw new Error("No carousels found");
        }

        console.log(JSON.stringify(carousels, null, 2));  // Debug log the fetched data

        return NextResponse.json(carousels);
    } catch (err: any) {
        console.error('Error fetching carousels:', err);  // Debug log any errors
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        clientConnection.release();
    }
};