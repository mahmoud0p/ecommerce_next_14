import { SuccessMessage, errorAtom } from "@/app/state";
import { Loader } from "@/app/components/LoadingComponent";
import { OutSideClick } from "@/app/components/outsideClick";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { AnimatePresence , motion } from "framer-motion";
import { useAtom } from "jotai";
import Image from "next/image";
import path from "path";
import {   FormEvent, useState } from "react";
import { FaX } from "react-icons/fa6";
import { MdFilterList } from "react-icons/md";
import _ from "lodash"
import Link from "next/link";
export function ConfirmationMessage({open , setIsOpen , message , onConfirm} : {open : boolean , setIsOpen :(value:boolean)=>void , message:string ,onConfirm:()=>void }){
    const ref = OutSideClick(()=>{
        setIsOpen(false)
    })
    const handleClickClose = ()=>{
        setIsOpen(false)
    }
    return (
            <AnimatePresence>
                {open && 
                <>
                <motion.div ref={ref} initial={{scaleX:0.9 ,opacity:0 ,translateY:"-100%" ,translateX:'50%'}} animate={{opacity:1 , translateY:"-50%" , translateX:'50%' , scaleX:1}} exit={{opacity:0 , translateY:"-100%" , translateX:'50%' , scaleX:0.9}} className="lg:w-2/4 sm:w-3/4 w-[90%] dark:bg-zinc-900 bg-white h-52 rounded-lg flex flex-col fixed z-[150] shadow-lg dark:shadow-black top-1/2 right-1/2 overflow-hidden">
                    <div className="w-full h-1/4 bg-slate-200  dark:bg-black flex items-center px-5 dark:border-b-zinc-800 border-b-gray-400 border-b relative">
                        <h3 className="dark:text-slate-300 text-black text-2xl">Confirmation</h3>
                        <FaX onClick={handleClickClose} className="text-xl text-red-500 cursor-pointer absolute right-5 top-1/2 -translate-y-1/2"/>
                    </div>
                    <p className=" mx-auto dark:text-white max-w-full px-3 sm:text-md md:text-lg text-sm text-wrap flex-1 flex justify-center items-center">{message}</p>
                    <div className="flex h-1/4 justify-end px-5 items-center gap-3">
                        <button onClick={onConfirm} className="text-md px-3 py-1 rounded-lg bg-green-500 dark:bg-white dark:text-black text-white">
                            Confirm
                        </button>
                        <button onClick={handleClickClose} className="text-sm  text-gray-500 dark:text-slate-300">
                            Cancel
                        </button>
                    </div>
                </motion.div>
                <div className="fixed inset-0 w-full h-full bg-black/10 backdrop-blur-sm z-[125]"></div>
                </> }
            </AnimatePresence>
    )
}

export default function ProductTable(){
    const [,setMessage] = useAtom(SuccessMessage)
    const [,setError] = useAtom(errorAtom)
    const [open ,setOpen ]=useState(false)
    const [filteredProducts , setFilteredProducts] = useState<any[]>([])
    const [filterInput , setInputFilter] = useState('')
    const [productToDelete ,setProductToDelete] = useState('')
    const {data , isLoading  , isError}  = useQuery({
        queryKey:['all_products'] ,
        queryFn:async()=>{
            const response  = await axios.get('/api/addproduct') ; 
            return response.data
        }
    })
    const [showCard ,setShowCard]  = useState('')
    const handleCardShow  =(id:string)=>{
        setShowCard(id)
    }
    const handleCardUnshow =()=>{
        setShowCard('')
    }
    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
        mutationFn:async(productId : string)=>{
            const response = await axios.delete(`/api/addproduct?productId=${productId}`)
            return response.data
        }
        ,onSuccess:()=>{
            setMessage("Product Deleted Successfully")
            queryClient.invalidateQueries({queryKey:['all_products']})
        },onError:(data:any)=>{
            setError(data?.response?.data?.error || "An Error occured while deleting the product!")
        }
    })

    const handleDeletingProduct = (productId:string)=>{
        deleteMutation.mutateAsync(productId)
        setOpen(false)
    }
    const handleFiltering = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        setInputFilter(value)
        const value_lower = value.toLowerCase() ; 
        const filtered = _.filter(data ,(f)=>{
            return f.name.toLowerCase().includes(value_lower)
        })
        setFilteredProducts(filtered)
    }
    return (
        <>
        {isLoading ? <Loader/> :
            <div className="w-1/2 p-4 flex flex-col overflow-visible items-center">
                <div className="grid grid-cols-2 w-full">
                    <h1  className="text-3xl w-max text-black dark:text-slate-300">Products</h1>
                    <div className="flex relative items-center h-full ">
                        <input value={filterInput} onChange={handleFiltering} type="text" className="w-full shadow-md dark:shadow-black/80 border border-slate-300 bg-slate-200 text-sm dark:border-zinc-800 dark:bg-zinc-900 h-9 rounded-lg outline-none pl-3" placeholder="Filter products by name.." />
                    </div>
                </div>
                <div className="relative  overflow-visible w-full shadow-md sm:rounded-lg mt-3">
                    <table className="w-full text-sm overflow-visible text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs overflow-visible text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Product name
                                </th>
                                
                                <th scope="col" className="px-6 py-3">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="overflow-visible">
                            {data && Array.isArray(data) && (filteredProducts.length > 0 ? filteredProducts : filteredProducts.length===0 && filterInput.length>0 ? filteredProducts : data).map(product => <tr key={product.id} className="odd:bg-white overflow-visible odd:dark:bg-zinc-900 relative even:bg-gray-50 even:dark:bg-zinc-800 border-b dark:border-gray-700">
                                <th onMouseEnter={()=>handleCardShow(product.id)} onMouseLeave={handleCardUnshow} scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-visible relative dark:text-white">
                                    <div className=" absolute z-[1000]">
                                        <AnimatePresence >{showCard === product.id && <motion.div initial={{translateX:100 , opacity:0  }} animate={{translateX:0 , opacity:1 }} exit={{translateX:100 , opacity:0 }} className={`absolute flex  justify-center items-center  w-max p-3 gap-3 bg-slate-200 dark:bg-zinc-900 rounded-xl shadow-lg dark:shadow-black/80 h-auto max-w-[30rem] max-h min-w-52 bottom-full left-0  `}>
                                            {product.image_url && <Image width={100} height={100} className="bg-white rounded-full min-w-32 h-32 object-contain" src={`/uploads/${path.basename(product.image_url)}`} alt= {`${product.title} image`}/>}
                                            <p className="w-1/2 text-wrap text-sm font-normal">{product.name}</p>
                                        </motion.div>}</AnimatePresence>
                                    </div>
                                    <p  className="max-w-32 cursor-pointer text-ellipsis text-nowrap z-10 overflow-hidden">{product.name}</p>
                                </th>

                                <td className="px-6 py-4">
                                    <p>{product.category}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p>${product.price}</p>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <Link href={`/editproduct/${product.id}`} className="text-blue-500 underline">Edit</Link>
                                    <button onClick={()=>{
                                        setProductToDelete(product.id)
                                        setOpen(true)
                                    }} className="text-red-500 underline">Delete</button>
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>}
            <ConfirmationMessage open={open} setIsOpen={setOpen} message="Are you sure to detete this product?" onConfirm={()=>{handleDeletingProduct(productToDelete)}} />
        </>
    )
}