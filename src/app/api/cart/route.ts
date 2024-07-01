import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "../user/route";
import {   db, pool } from "../db.server";
import { cart, cartItem, product, product_images, user } from "../schema";
import { eq, sql } from "drizzle-orm";
import _ from "lodash"

const UpdateCart = async(Id:string)=>{
  const allItems = await db.select().from(cartItem).where(eq(cartItem.cartId , Id)).catch((err)=>{
    throw new Error(err.message)
  })
  const TotalPrice = _.sumBy(allItems ,(a)=>{
    return Number(a.totalPrice) 
  } )
  await db.update(cart).set({
    quantity:allItems.length , 
    totalPrice:(TotalPrice.toFixed(2)).toString() , 
})
}

export const GET = async (req: Request) => {
  const token = cookies().get('token');
  if (!token) {
    return NextResponse.json({ message: 'you should loggin first' });
  }
  const clientConnection = await pool.connect();
  try {

    const id = verifyToken(token.value);
    const url = new URL(req.url);
    const urlParam = new URLSearchParams(url.searchParams);
    const cartQuantity = urlParam.get('cartQuantity');

    const [usercart] = await db
      .select()
      .from(cart)
      .where(eq(cart.userId, id))
      .execute()
      
    if (cartQuantity) {
      const cartItemsNumber = await db
      .select()
      .from(cartItem)
      .where(eq(cartItem.cartId, usercart.id))
      .execute()
      
      
      return NextResponse.json({ number: cartItemsNumber.length });
    }

    const cartItems = await db
  .select({
    id: cartItem.id,
    quantity: cartItem.quantity,
    totalPrice: cartItem.totalPrice,
    product: sql`(
      SELECT json_build_object(
        'id', ${product.id},
        'name', ${product.name},
        'price', ${product.price},
        'images', (
          SELECT json_agg(json_build_object('id', ${product_images.id}, 'url', ${product_images.url}))
          FROM ${product_images}
          WHERE ${product_images.productId} = ${product.id}
        )
      )
      FROM ${product}
      WHERE ${product.id} = ${cartItem.product}
      LIMIT 1
    )`
  })
  .from(cartItem)
  .leftJoin(product, eq(cartItem.product, product.id))
  .where(eq(cartItem.cartId, usercart.id))
  .groupBy(cartItem.id)
  .execute();

      
      const items = _.each(cartItems , (c)=>(
        {
          id:c.id , 
          quantity : c.quantity ,
          totalPrice:c.totalPrice , 
          product: c.product
        }
      ))
      
    return NextResponse.json({items , cart:usercart});
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }finally{
    clientConnection.release()
}
  
};

export const POST = async (req: Request) => {
  const clientConnection = await pool.connect();
  try {


    const data = await req.json();
    const token = cookies().get('token');

    if (!token) {
      throw new Error("You Must loggin first...");
    }

    const id = verifyToken(token.value);
    const [findUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, id))
    .execute()
    
    if (!findUser) {
      throw new Error("cannot find this user");
    }

    let [findUserCart] = await db
    .select({ id: cart.id })
    .from(cart)
    .where(eq(cart.userId, id))
    .execute()
    
    if (!findUserCart) {
      [findUserCart] = await db.insert(cart).values({
        userId: findUser.id,
        quantity: 0,
        totalPrice: "0.00"
      }).returning({ id: cart.id })
      .execute()
    
      if (!findUserCart) {
        throw new Error("an error occurred while creating user's cart");
      }
    }

    const { productId } = data;
    const [findProduct] = await db.select({ id: product.id, price: product.price }).from(product).where(eq(product.id, productId))

    if (!findProduct) {
      throw new Error('cannot find this product');
    }

    const [findcartItemSameProduct] = await db.select().from(cartItem).where(eq(cartItem.product, findProduct.id))
    //if same product is already added to cart ...
    if (findcartItemSameProduct) {
      const totalPrice = (Number(findProduct.price) * (findcartItemSameProduct.quantity + 1)).toFixed(2);
      await db
        .update(cartItem)
        .set({ quantity: findcartItemSameProduct.quantity + 1, totalPrice: totalPrice.toString() })
        .where(eq(cartItem.id, findcartItemSameProduct.id))
        .execute()
        await UpdateCart(findUserCart.id)
      return NextResponse.json({ message: "product added successfully" });
    }

    const createCartItem = await db.insert(cartItem).values({
      cartId: findUserCart.id,
      quantity: 1,
      totalPrice: findProduct.price,
      product: findProduct.id
    })
    .execute()
    
    if (!createCartItem) {
      throw new Error('an error occurred while adding new product to cart');
    }
    await UpdateCart(findUserCart.id)
    return NextResponse.json({ message: "product added successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally{
    clientConnection.release()
}
  
};

export const DELETE = async (req: Request) => {
  const clientConnection = await pool.connect();
  try {

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const cartItemId = searchParams.get("id")

    if (!cartItemId) {
      throw new Error("cannot find the cartitem id");
    }

    const [findCartItem] = await db
    .select({ id: cartItem.id })
    .from(cartItem)
    .where(eq(cartItem.id, cartItemId))
    .execute()
    
    if (!findCartItem) {
      throw new Error('cannot find this cart item');
    }

    const [deleteItem] = await db
    .delete(cartItem)
    .where(eq(cartItem.id, cartItemId))
    .returning({ id: product.id })
    .execute()
    
    if (!deleteItem) {
      throw new Error("an error occurred while deleting the item from the cart");
    }

    return NextResponse.json({ message: "item deleted successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally{
    clientConnection.release()
}
  
};

export const PUT = async (req: Request) => {
  const clientConnection = await pool.connect();
  try {


    const data = await req.json();
    const { cartItemId, newQuantity } = data;

    const [findCartItem] = await db.select(
      {
        id: cartItem.id,
        quantity: cartItem.quantity,
        price: product.price ,
        cartId :cartItem.cartId
      }
    )
    .from(cartItem)
    .where(eq(cartItem.id, cartItemId))
    .leftJoin(product, eq(product.id, cartItem.product))
    .groupBy(cartItem.id, cartItem.quantity, product.price)
    .execute()
    
    if (!findCartItem) {
      throw new Error('cannot find the cart item');
    }

    const updateQuantity = await db.update(cartItem).set({
      quantity: Number(newQuantity),
      totalPrice: ((Number(findCartItem.price) * Number(newQuantity)).toFixed(2)).toString()
    })
    .where(eq(cartItem.id, findCartItem.id))
    .returning({ id: cartItem.id })
    .execute()
    
    if (!updateQuantity) {
      throw new Error("an error occurred while updating product quantity");
    }
    await UpdateCart(findCartItem.cartId)
    return NextResponse.json({ message: "item's quantity updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally{
    clientConnection.release()
}
  
};