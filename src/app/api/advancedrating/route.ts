import _ from "lodash"
import { client, db, pool } from "../db.server"
import { reviews } from "../schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
export const GET =async(req:Request)=>{
    const url = new URL(req.url)
    const searchParam = new URLSearchParams(url.searchParams)
    const productId  = searchParam.get('productId')
    if(!productId){
        throw new Error('Cannot find product id')
    }
    const clientConnection = await pool.connect();
    try{
        const getReviews = await db
        .select({
            rating:reviews.rating
        })
        .from(reviews)
        .where(eq(reviews.productId ,productId))
        .execute()
        
        const count = getReviews.length
        const fiveStars = _.filter(getReviews , (r)=>{
            return Number(r.rating)=== 5 
        })
        const fourStars = _.filter(getReviews , (r)=>{
            return Number(r.rating) === 4 
        })
        const threeStars = _.filter(getReviews , (r)=>{
            return Number(r.rating)=== 3 
        })
        const twoStars = _.filter(getReviews , (r)=>{
            return Number(r.rating)=== 2 
        })
        const oneStar = _.filter(getReviews , (r)=>{
            return Number(r.rating)=== 1 
        })
        return NextResponse.json({oneStar : oneStar.length/count , twoStars:twoStars.length/count , threeStars:threeStars.length/count , fourStars:fourStars.length/count , fiveStars:fiveStars.length/count})
    }catch(err:any){
        return NextResponse.json({error:err.message} , {status:500})
    }finally{
        clientConnection.release()
    }
}