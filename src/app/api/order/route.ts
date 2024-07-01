import { NextResponse } from "next/server"
import { db, pool } from "../db.server"
import { cookies } from "next/headers"
import { verifyToken } from "../user/route"
import { cart, cartItem, order, orderItem, product } from "../schema"
import { eq, sql } from "drizzle-orm"
import _ from "lodash"
export const POST = async(req:Request)=>{
    const clientConnection = await pool.connect()
    try{
        const data = await req.json()
        const {address} = data
        if(!address){
            throw new Error("Sorry,cannot find your address")
        }
        const token = cookies().get('token')
        if(!token){
            throw new Error('Loggin first..')
        }

        const userId = verifyToken(token.value )
        if(!userId){
            throw new Error("cannot find the user's id..")
        }
        const [findCart] = await db.select().from(cart).where(eq(cart.userId  , userId))
        .catch(err=>{
            throw new Error(err.message)
        })
        if(!findCart){
            throw new Error('cannot find your cart')
        }
        const cartItems = await db.select().from(cartItem).where(eq(cartItem.cartId , findCart.id))
        .catch(err=>{
            throw new Error(err.message)
        })
        if(!cartItems || cartItems.length === 0){
            throw new Error('cannot find any cart items ')
        }
        const [createdOrder] =await db.insert(order).values({
            userId , 
            price:findCart.totalPrice , 
            quantity : findCart.quantity , 
            payment:'success' , 
            address ,

        }).returning({id:order.id})
        .catch(err=>{
            throw new Error(err.message)
        })
        _.each(cartItems , async(c)=>{
            await db.insert(orderItem).values({
                productId:c.product , 
                orderId:createdOrder.id , 
                quantity:c.quantity , 
            }).catch(err=>{
                throw new Error(err.message)
            })

        })
        return NextResponse.json({message:'Your order is on his way to you'}  , {status:200})
    }catch(err:any){
        return NextResponse.json({
            error:err.message 
        } , {
            status:500 
        })
    }
    finally{
        clientConnection.release()
    }
}

export const GET = async () => {
    const clientConnection = await pool.connect();
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            throw new Error("You should log in first.");
        }
        const userId = verifyToken(token);
        if (!userId) {
            throw new Error("Cannot find the user in the database.");
        }

        const orders = await db
            .select({
                id: order.id,
                createdAt: order.createdAt,
                address: order.address,
                price :order.price ,
                status: order.status,
                payment: order.payment,
                orderItems: sql`
                    json_agg(json_build_object(
                        'orderItemId', ${orderItem.id},
                        'quantity', ${orderItem.quantity},
                        'productId', ${product.id},
                        'productName', ${product.name}
                    )) AS orderItems
                `
            })
            .from(order)
            .leftJoin(orderItem, eq(orderItem.orderId, order.id))
            .leftJoin(product, eq(orderItem.productId, product.id))
            .where(eq(order.userId, userId))
            .groupBy(order.id, order.createdAt, order.address, order.status, order.payment);

        return NextResponse.json(orders);
    } catch (err: any) {
        return NextResponse.json({
            error: err.message
        }, {
            status: 500
        });
    } finally {
        clientConnection.release();
    }
}
