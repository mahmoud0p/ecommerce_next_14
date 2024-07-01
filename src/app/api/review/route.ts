import {  db, pool } from "../db.server";
import { NextResponse } from "next/server";
import {  product, reviews, user } from "../schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "../user/route";
import _ from "lodash"

export const GET = async (req: Request) => {
    const clientConnection = await pool.connect();
    try {
      
      const url = new URL(req.url);
      const searchParams = new URLSearchParams(url.search);
      const productId = searchParams.get("id");
  
      if (!productId) {
        throw new Error("Error cannot find product id");
      }
  
      const [findProduct] = await db
        .select()
        .from(product)
        .where(eq(product.id, productId))
        .execute()
        
  
      if (!findProduct) {
        throw new Error("Cannot find this product");
      }
  
      const getReviews = await db
        .select({
          id: reviews.id,
          content: reviews.content,
          rating: reviews.rating,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            
          },
        })
        .from(reviews)
        .where(eq(reviews.productId, productId))
        .leftJoin(user, eq(user.id, reviews.userId))
        .execute()
    
  
      return NextResponse.json(getReviews, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } 
    finally{
      clientConnection.release()
  }
  };
export const POST = async(req:Request)=>{
  const clientConnection = await pool.connect();
    try{

    const data  = await req.json() ; 
    const {content , rating , productId} = data
    if(!content || !rating || !productId){
        throw new Error("Sorry, some informations are missing")
    }
    const token = cookies().get("token")

    if(!token){
        throw new Error("You Must Login first..")
    }
    const id = verifyToken(token.value)
    if(!id){
        throw new Error("Sorry, An error occured while recognising you..")
    }
    const [finduser] = await db
    .select({id:user.id})
    .from(user)
    .where(eq(user.id ,id))
    .execute()
    
    if(!finduser){
        throw new Error("Sorry, cannot find the user..")
    }
    const [findProduct]= await db
    .select()
    .from(product)
    .where(eq(product.id , productId))
    .execute()
    
    if(!findProduct){
        throw new Error("Sorry, Cannot find the product..")
    }
    const [addReview] = await db
    .insert(reviews)
    .values({
        content , 
        rating ,
        userId:finduser.id , 
        productId:findProduct.id
    }).returning({
        id:reviews.id
    })
    .execute()
    
    
    if(!addReview){
        throw new Error("an error occured while adding the Review..")
    }
    const findreviews = await db
    .select()
    .from(reviews)
    .where(
        eq(reviews.productId , productId)
    )
    .execute()
    
    const RatingSummation= _.sumBy(findreviews , (r)=>{
        return Number(r.rating)
    })
    const averageRating= ((RatingSummation/findreviews.length)).toFixed(2)
    const [updateProduct]= await db
    .update(product)
    .set({
        rating : averageRating
    })
    .where(eq(product.id  , productId))
    .returning({
        id:product.id
    })
    .execute()
    
    if(!updateProduct){
        throw new Error("An error occured while updating product..")
    }
    return NextResponse.json({message:"Review added successfully.."} , {status:200})
}catch(err:any){
    return NextResponse.json({error : err.message ,} ,{status:500} )
}finally{
  clientConnection.release()
}
}

export const PUT = ()=>{

}
export const dELETE = ()=>{

}