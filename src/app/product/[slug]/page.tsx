'use client'
import { Loader } from "@/app/components/LoadingComponent"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import ProductCarousel from "../components/productCarousel"
import {  useState } from "react"
import { BiCartAdd } from "react-icons/bi";
import Rating from "../components/Rating"
import { SuccessMessage, cartItemsCount, cartItems_atom, reviewsCount, userAtom } from "@/app/state"
import { useAtom } from "jotai"
import Reviews from "../components/reviews"
import AddingReview from "../components/addingReview"
import { useMediaQuery } from 'react-responsive'
import { v4 as uuidv4 } from "uuid";

type Product = {
    name : string ,
    id:string , 
    price  : string ,
    countInStock :number , 
    details:string ,
    description : string ,
    rating : string , 
    images  : {id : string , url : string }[] , 
    category : string
}
export  default function Product (){
    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-width: 640px)'
      })
      const isMobile = useMediaQuery({ query: '(max-width: 639px)' })
      
    const params = useParams()
    const {slug} = params
    const [readmore , setreadmore] = useState(false)
    const [,setMessage] = useAtom(SuccessMessage)
    const [submitting ,setSubmittion] = useState(false)
    const [,setCart] = useAtom(cartItems_atom)
    const [,setCount] = useAtom(cartItemsCount)
    const [user ] =useAtom(userAtom)
    const {isLoading , data , isError} = useQuery<Product>({
        queryKey:['product' , slug],
        queryFn:async()=>{
            const response = await axios.get(`/api/product?id=${slug}`) 
            return response.data
        }
    })
    const advancedRating = useQuery({
        queryKey:['advancedRating'] , 
        queryFn:async()=>{
            const response = await axios.get(`/api/advancedrating?productId=${slug.toString()}`)
            return response.data
        }
    })
    const handleReadMore = ()=>{
        setreadmore (!readmore)
    }
    const queryClient = useQueryClient()
    const addTocartMutation = useMutation({
        mutationFn:async()=>{
            const response = await axios.post('/api/cart' , {productId : slug})
            return response.data
        } , 
        onSuccess:()=>{
            setMessage("Product Added Successfuly")
            queryClient.invalidateQueries({queryKey:['cartQuantity']})
            setSubmittion(false)
        }
    })
    const handleAddingCart = ()=>{
        setCart((prev) => [
            ...(prev || []),
            {
              id: uuidv4(), 
              totalPrice: data?.price || "0", 
              quantity: 1,
              product: {
                name: data?.name || "Unnamed Product", 
                price: data?.price || "0", 
                id: data?.id || uuidv4(), 
                images: data?.images || [], 
              },
            },
          ]);
          setCount(prev=> prev+1)
        setSubmittion(true)
        if(user){
            addTocartMutation.mutateAsync()
        }
    }
    const details = data?.details ?  JSON.parse(data?.details) : null
    const [reviewsLength] = useAtom(reviewsCount)
    return(
        <>{
            isLoading ? <Loader/> :
            <>
                {isError ? <div>
                    <p className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-red-400 text-lg">
                        Error while fetching the product... we'r sorry about this technical error
                    </p>
                </div> : <div className="pt-[4rem] w-full min-h-screen relative">
                    {data && (
                        <div className="h-auto py-2 min-h-screen w-full flex sm:flex-row flex-col gap-2 px-5">
                            {isMobile &&<h1 className="text-xl mx-auto sm:ring-0  md:text-3xl  dark:text-slate-300">{data.name}</h1>}
                            {data.images && <div className="sm:w-1/2 mt-3 w-[90%] justify-center mx-auto flex">
                                <ProductCarousel images={data.images}/>
                            </div>}
                            <div className="flex-1 flex gap-3 flex-col px-5">
                                {isDesktopOrLaptop && <h1 className="text-xl  sm:ring-0  md:text-3xl  flex gap-3 dark:text-indigo-900">{data.name} </h1>}
                                
   
                                <div className={`h-max relative`}>
                                    <p className={`md:text-sm text-xs  text-black dark:text-gray-400  mt-1  text-ellipsis transition-all duration-300 ease-in-out ${readmore?"overflow-y-auto h-auto" :"line-clamp-19 max-h-[20em] overflow-hidden"}`}>
                                        {data.description}
                                    </p>
                                    <button onClick={handleReadMore} className="absolute top-full right-0 text-blue-500 dark:text-indigo-900  px-3 py-1 rounded-lg">{readmore ? "Read Less.." : "Read More.."}</button>
                                </div>
                                <div className="flex md:flex-row sm:flex-col  md:items-center justify-start gap-2 mt-5">
                                    <h3 className="text-2xl dark:text-slate-300 ">${data.price}</h3>
                                    <Rating mainRating={true} rating={data.rating}/>
                                </div>
                                <div className="flex w-full justify-start    gap-3 items-center">
                                    <button disabled={submitting}  onClick={handleAddingCart} className="dark:bg-white disabled:opacity-70 bg-lightgreen text-white flex justify-center items-center text-md md:w-1/2 w-3/4 dark:hover:bg-slate-300 transition-all duration-150 ease-in-out dark:text-black px-5 py-2 rounded-lg"><BiCartAdd />
                                    Add To Cart</button>
                                </div>
                                <hr  className="dark:bg-zinc-900 dark:border-zinc-900 mt-7"/>
                                <h3 className="md:text-xl text-sm dark:text-slate-300">
                                    Category
                                </h3>
                                <p className="font-normal bg-slate-300 text-xs text-black w-max py-2 px-3 rounded-full">{data.category}</p>
                                <hr  className="dark:border-zinc-900 dark:bg-zinc-900"/> 
                            </div>
                        </div>
                    )
                    }
                    <div className="flex flex-col-reverse lg:flex-row-reverse w-full px-5">
                    {details && <div className="relative w-full lg:w-1/2 pt-10 px-5 overflow-x-auto overflow-y-auto max-h-screen ">
                        <h3 className="md:text-3xl text-lg  dark:text-slate-300">Details</h3>
                        <hr className="dark:bg-zinc-900 dark:border-zinc-900"/>
                        <table className="w-full text-sm mt-3 text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg">
                            <tbody >
                                {Array.isArray(details) && details.map((detail , i) => <tr key={i} className="  bg-slate-100 border-b dark:bg-zinc-900 dark:border-gray-700">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {detail.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        {detail.value}
                                    </td>
                                </tr>)}
                                
                            </tbody>
                        </table>
                    </div>}
                    {data && advancedRating?.data && 
                    <div className="flex flex-col flex-1 pt-10">
                        <h3 className="dark:text-slate-300 text-3xl ">Rating Review</h3>
                        <hr className="dark:bg-zinc-900 mb-3 dark:border-zinc-900"/>
                        <Rating mainRating={true} rating={data?.rating} />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{reviewsLength} global ratings</p>
                        <div className="flex items-center mt-4 ">
                            <p className="text-sm font-medium text-black dark:text-slate-300 hover:underline">5 star</p>
                            <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                <div className="h-5 bg-orange-300 rounded" style={{width : `${(advancedRating.data.fiveStars)*100}%`}} ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{(advancedRating.data.fiveStars)*100}%</span>
                        </div>
                        <div className="flex items-center mt-4">
                            <p className="text-sm font-medium text-black dark:text-slate-300 hover:underline">4 star</p>
                            <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                <div className="h-5 bg-orange-300 rounded" style={{width : `${(advancedRating.data.fourStars)*100}%`}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{(advancedRating.data.fourStars)*100}%</span>
                        </div>
                        <div className="flex items-center mt-4">
                            <p className="text-sm font-medium text-black dark:text-slate-300 hover:underline">3 star</p>
                            <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                <div className="h-5 bg-orange-300 rounded" style={{width : `${(advancedRating.data.threeStars)*100}%`}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{(advancedRating.data.threeStars)*100}%</span>
                        </div>
                        <div className="flex items-center mt-4">
                            <p className="text-sm font-medium text-black dark:text-slate-300 hover:underline">2 star</p>
                            <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                <div className="h-5 bg-orange-300 rounded" style={{width : `${(advancedRating.data.twoStars)*100}%`}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{(advancedRating.data.twoStars)*100}%</span>
                        </div>
                        <div className="flex items-center mt-4">
                            <p className="text-sm font-medium text-black dark:text-slate-300 hover:underline">1 star</p>
                            <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                <div className="h-5 bg-orange-300 rounded" style={{width : `${(advancedRating.data.oneStar)*100}%`}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{(advancedRating.data.oneStar)*100}%</span>
                        </div>  
                    </div>
                    }
                   </div> 
                    <AddingReview productId={slug.toString()}/>
                    <Reviews productId={slug.toString()}/>
                </div>}
            </>
        }
        </>
    )
}