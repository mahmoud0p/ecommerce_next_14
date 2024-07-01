import { Swiper, SwiperSlide } from "swiper/react"
import { Swiper as SwiperType } from "swiper/types";
import 'swiper/css';
import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { FaCaretLeft } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive'
import Image from "next/image";
import { BsTrash3 } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { SuccessMessage, errorAtom, userAtom } from "../state";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ConfirmationMessage } from "../admin/dashboard/components/Products";

export type Product= {
    id:string ,
    name:string ,
    price:string ,
    image:string
}
export const ProductCarousel  =({title , products , carouselId} : {title:string ,products : Product[] , carouselId:string})=>{
    const swiperRef = useRef<SwiperType | null>(null)
    const [end ,setEnd] = useState(false)
    const [begin ,setBegin] = useState(true)
    const [user  ]= useAtom(userAtom)
    const [ , setSucc] = useAtom(SuccessMessage)
    const [ , setError] = useAtom(errorAtom)
    const [open , setOpen ] = useState(false)
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    const router = useRouter()
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn:async()=>{
            const {data} = await axios.delete(`/api/carousel?carouselId=${carouselId}`)
            return data
        } , 
        onSuccess:()=>{
            setSucc('Carousel deleted successfuly..')
            queryClient.invalidateQueries({queryKey:['carousels']})
            setOpen(false)
        } , 
        onError:(err:any)=>{
            const errorMessage = err?.response?.data?.error || "An error occured while deleting the carousel"
            setError(errorMessage)
        }
    })
    const handleDelete = ()=>{
        mutation.mutateAsync()
    }
    return(
        <div className="h-[50vh] w-full  p-4 flex flex-col relative">
            <h3 className="dark:text-slate-300 font-bold text-3xl capitalize">{title}</h3>
            {   
                user&& user.role === "ADMIN" && 
                <button onClick={()=>{
                    setOpen(true)
                }} className="w-9 h-9  absolute right-3 rounded-full after:w-32 after:h-9 after:rounded-lg after:absolute after:bottom-full after:right-0 after:z-[100] dark:after:bg-black/70 after:bg-slate-300 after:content-['Delete'] hover:after:flex after:justify-center after:items-center after:text-red-500 after:hidden  bg-red-500/30 flex items-center justify-center"><BsTrash3  className="w-6 h-6 text-red-500"/></button>}
            <Swiper
            breakpoints={{
                1200 :{
                    slidesPerView:3.5,
                    slidesPerGroup:3, 
                    spaceBetween:30 , 
                    allowTouchMove:false
                }
                ,
                1000:{
                    slidesPerView:3.5,
                    slidesPerGroup:3,
                    spaceBetween:15,
                    allowTouchMove:true
                },
                350:{
                    slidesPerView:2.2,
                    slidesPerGroup:2,
                    allowTouchMove:true , 
                },
                0:{
                    slidesPerView:1,
                    slidesPerGroup:1,
                    allowTouchMove:true , 
                    
                }
            }}
            
            spaceBetween={30}
            onSwiper={(swiper)=>{
                    swiperRef.current =swiper
            }}
            onReachBeginning={()=>setBegin(true)}
            onReachEnd={()=>setEnd(true)}
            className="w-full  flex-1 border relative p-3 dark:border-zinc-900 rounded-xl">
                {products.map((p)=>
                    <SwiperSlide 
                     key={p.id}
                     className="bg-white p-3 relative rounded-xl cursor-pointer" 
                     onClick={()=>{
                        router.push(`/product/${p.id}`)
                    }}>
                        <Image width={100} height={100} src={p.image} alt={`${p.name} image`} className="w-full h-full object-contain" />
                    </SwiperSlide>
                )}
                
                
                
                {!isTabletOrMobile &&
                <>
                    <button onClick={()=>{
                        swiperRef.current?.slideNext()
                        setBegin(false)
                    }} 
                    disabled={end}
                    className="absolute disabled:opacity-30 bg-slate-300 text-3xl flex items-center justify-center border border-zinc-900 text-black z-[100] h-12  w-12 rounded-full cursor-pointer right-4 top-1/2 -translate-y-1/2">
                        <FaCaretRight className="m w-10 h-10"/>
                    </button>
                    <button 
                    disabled={begin}
                    onClick={()=>{
                        swiperRef.current?.slidePrev()
                        setEnd(false)
                    }} className="absolute disabled:opacity-30 bg-slate-300 text-3xl flex items-center justify-center border border-zinc-900 text-black z-[100] h-12  w-12 rounded-full cursor-pointer left-4 top-1/2 -translate-y-1/2">
                        <FaCaretLeft  className="m w-10 h-10"/>
                    </button>
                </>
                }
            </Swiper>
            <ConfirmationMessage message="Are you sure you want to delete this carousel" open={open} setIsOpen={setOpen} onConfirm={handleDelete}/>
        </div>
    )
}