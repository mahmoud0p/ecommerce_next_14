"use client";

import CheckoutPage from "@/app/components/checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAtom } from "jotai";
import { cartItems_atom } from "../state";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader } from "../components/LoadingComponent";
import Image from "next/image";
import path from "path";
import { token } from "../components/token";
import { useRouter } from "next/navigation";
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(stripePublicKey);
export const  convertToSubcurrency =(amount: number, factor = 100)=> {
    return Math.round(amount * factor);
  }
  
  type Cart = {
    id: string, 
    quantity: string, 
    totalPrice: string
}

export default function Orders(){
    const [cartItems, setCartItems] = useAtom(cartItems_atom)
    const [cart, setCart] = useState<Cart | null>(null)
    const token_ = token
    const { isLoading, isError } = useQuery({
        queryKey: ['cartItems'], 
        queryFn: async () => {
            const response = await axios.get('/api/cart')
            setCart(response.data.cart)
            setCartItems(response.data.items)
            return response.data
        } ,
        enabled:!!token_
    })
    const router = useRouter()
    if(isLoading){
        return <Loader/>
    }else if(isError){
        return (
            router.push('/')
        )
    }
    else if(cart) {return (
        <div className="w-full min-h-screen relative pt-[4rem] px-5 dark:text-slate-300 text-md">
            <h1 className="text-3xl">Check Out</h1>
            
            <div className="flex lg:flex-row flex-col gap-3 mt-5">
                <div className="flex-1 grid grid-flow-row gap-3 px-5 py-3 dark:border-slate-300 border rounded-lg">
                    {cartItems.map(item =>(
                        <div key={item.id} className="w-full   min-h-32  flex flex-wrap items-center px-3 gap-3">
                            <div className="w-32 h-32 flex items-center justify-center bg-white rounded-lg">
                                <Image width={100} height={100} priority src={`/uploads/${path.basename(item.product.images[0].url)}`} alt="product image" className="h-32 w-32 object-contain "/>
                            </div>
                            <p className="lg:w-96 w-auto  text-wrap"><span className="text-gray-600 font-bold">Product Name:</span> {item.product.name}</p>
                            <p><span className="text-gray-600 font-bold">Price:</span> ${item.product.price}</p>
                            <p className="mx-3"><span className="text-gray-600 font-bold ">QTY:</span> {item.quantity}</p>
                        </div>
                    ))}
                    <hr  className=" w-full dark:bg-zinc-900 dark:border-zinc-900"/>
                    <div >
                        <p className="text-xl "><span className="text-2xl font-bold text-gray-600">Total Price: </span>${cart.totalPrice}</p>
                    </div>
                </div>
                <div className="lg:w-96 w-full">
                    <Elements
                        stripe={stripePromise}
                        options={{
                            mode: 'payment' , 
                            amount: convertToSubcurrency(Number(cart?.totalPrice)),
                            currency: "usd",
                        
                        }}
                    >
                        <CheckoutPage amount={Number(cart?.totalPrice)}/>
                    </Elements>
                </div>
            </div>

        </div>
    )}
}