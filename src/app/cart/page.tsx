'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useAtom } from "jotai"
import { cartItemsCount, cartItems_atom, errorAtom, userAtom } from "../state"
import { Loader } from "@/app/components/LoadingComponent"
import Image from "next/image"
import path from "path"
import { FormEvent, useState } from "react"
import { navigateProduct } from "@/actions"
import _, { remove } from "lodash"
import { FaLongArrowAltRight } from "react-icons/fa";
import Link from "next/link"



type Cart = {
    id: string, 
    quantity: string, 
    totalPrice: string
}

export default function Cart() {
    const [cartItems, setCartItems] = useAtom(cartItems_atom)
    const [cart, setCart] = useState<Cart | null>(null)
    const [,  setCount] = useAtom(cartItemsCount)
    const [, setError] = useAtom(errorAtom)
    const queryClient = useQueryClient()
    const [user ] = useAtom(userAtom)
    const { data ,isLoading, isError } = useQuery({
        queryKey: ['cartItems'], 
        queryFn: async () => {
            const response = await axios.get('/api/cart')
            setCart(response.data.cart)
            setCartItems(response.data.items)
            return response.data
        } , 
        enabled:!!user
    })

    const updateQuantity = useMutation({
        mutationFn: async (data: { newQuantity: number, cartItemId: string }) => {
            const response = await axios.put('/api/cart', data)
            return response.data
        },
        onError: (err: any) => {
            setError(err.response.data.error)
            queryClient.invalidateQueries({ queryKey: ['cartItems'] })
        },
    })

    const handleQuantityInput = (e: FormEvent<HTMLInputElement>, cartItemId: string) => {
        const newQuantity = Math.max(1, parseInt(e.currentTarget.value, 10));
        const productPrice = cartItems.find(item => item.id === cartItemId)?.product.price

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity, totalPrice: (Number(productPrice) * newQuantity).toFixed(2) } : item
            )
            const newTotal = _.sumBy(updatedItems, item => Number(item.totalPrice)).toFixed(2)
            setCart(prev => (prev ? { ...prev, totalPrice: newTotal } : null))
            return updatedItems
        })
        if(user){
            updateQuantity.mutateAsync({ newQuantity, cartItemId })
        }
    }

    const deleteMutation = useMutation({
        mutationFn: async (cartItemId: string) => {
            const response = await axios.delete(`/api/cart?id=${cartItemId}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartQuantity'] })
        }
    })

    const handleRemove = (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId))
        setCount(prev=>prev-1)
        if(!!user){
            deleteMutation.mutateAsync(cartItemId)
        }
    }
    if(isLoading){
        return <Loader/>
    }
    if(isError){
        return <div className="text-red-500 text-lg top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            Oops, Our mistake we are working on fixing it..
        </div>
    }
    return (
        <>
                        <>
                            {cartItems && (
                                <div className="pt-[4rem] w-full min-h-screen flex items-center flex-col px-5">
                                    <h1 className="text-3xl dark:text-indigo-500 capitalize">Cart Items ({cartItems.length} items)</h1>
                                    <hr className="border-zinc-900 bg-zinc-900 w-full my-2" />
                                    {cartItems.length === 0 ? (
                                        <p className="text-xl text-slate-300">No items to show...</p>
                                    ) : (
                                        <div className="flex lg:flex-row flex-col w-full gap-3">
                                            <div className="relative overflow-x-auto lg:w-3/4 w-full">
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-black uppercase bg-gray-50 dark:bg-zinc-900 dark:text-slate-300">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3">
                                                                Product Image
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Product Name 
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Quantity
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Total Price
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cartItems.map(item => (
                                                            <tr key={item.id} className="bg-white border-b dark:bg-zinc-800 dark:border-gray-700">
                                                                <th onClick={() => navigateProduct(`/product/${item.product.id}`)} scope="row" className="px-6 py-4 font-medium cursor-pointer text-gray-900 whitespace-nowrap bg-white flex justify-center dark:text-white">
                                                                    {item?.product?.images[0]?.url && (
                                                                        <Image height={100} width={100} className="max-h-32 max-w-full object-contain" alt={`${item.product.name} image`} src={`/uploads/${path.basename(item.product.images[0].url)}`} />
                                                                    )}
                                                                </th>
                                                                <td className="px-6 py-4 min-w-52 w-52 text-ellipsis overflow-hidden">
                                                                    {item?.product.name}
                                                                </td>
                                                                <td className="px-6">
                                                                    <input onChange={(e) => handleQuantityInput(e, item.id)} value={item.quantity} min={1} type="number" className="w-[5rem] outline-none flex items-center py-2 px-3 rounded-lg dark:bg-zinc-900 bg-slate-200 border border-slate-300 dark:border-indigo-900 justify-center" />
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    ${item?.totalPrice}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <button onClick={() => handleRemove(item.id)} className="text-red-500 underline">Remove</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {!!data?<div className="flex-1 bg-slate-100 dark:bg-zinc-900 rounded-xl p-4 relative  h-72">
                                                <h3 className="dark:text-indigo-500 text-3xl">Details</h3>
                                                <p className="text-md  px-3 py-3"><span className="text-lg font-bold text-gray-600">Number Of Products:</span> <span className="text-black dark:text-slate-300 text-md">{cart?.quantity}</span></p>
                                                <hr  className="w-full dark:bg-zinc-800  dark:border-zinc-800"/>
                                                <p className="text-md px-3 py-3 "><span className="text-lg font-bold text-gray-600">Total:</span> <span className="text-black dark:text-slate-300 underline text-md">${cart?.totalPrice}</span></p>
                                                <Link href={'/orders'} className="lg:absolute relative mt-3 float-right lg:bottom-5 right-5 text-sm after:contents[''] after:h-[2px] after:w-0 hover:after:w-full after:transition-all rounded-full after:duration-150 after:bg-indigo-900 hover:text-indigo-900 transition-all duration-150 after:absolute after:bottom-0  flex items-center gap-1">Check Out <FaLongArrowAltRight /></Link>
                                            </div>: <Link className="w-32 h-9 rounded-lg dark:bg-white text-black flex justify-center items-center" href={'/login'}>Login</Link>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    
        </>
    )
}
