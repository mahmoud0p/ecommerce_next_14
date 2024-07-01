import { SearchPagination } from "@/app/search/pagination";
import { SuccessMessage, errorAtom } from "@/app/state";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence ,motion } from "framer-motion"
import { SetStateAction, useAtom } from "jotai"
import Image from "next/image";
import path from "path";
import { Dispatch, FormEvent, useState } from "react"
import { IoMdAdd } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";

export const AddCarousel = ({openModule , setOpenModule} : {openModule:boolean , setOpenModule:Dispatch<SetStateAction<boolean>>})=>{
    const [page ,setPage] = useState(1)
    const [query , setQuery] = useState('')
    const [title , setTitle] = useState('')
    const [products , setProducts] =useState<string[]>([])
    const [length ,setLength] = useState(0)
    const [results ,setResults] = useState([])
    const [ , setError] = useAtom(errorAtom)
    const [ , setMessage] = useAtom(SuccessMessage)
    const { isLoading ,isError}= useQuery({
        queryKey:['admin_page' , page , query],
        queryFn:async()=>{
            const {data} = await axios.post('/api/adminsearch' , {page , query})
            setLength(data.totalPages)
            setResults(data.results)
            return data
        } , 
        enabled:query.length > 3
       
    })
    const handleQueryChange = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        setQuery(value)
    }
    const handleTitleChange = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        setTitle(value)
    }
    const mutation = useMutation({
        mutationFn:async()=>{
            const {data} = await axios.post('/api/carousel' , {title , products})
            return data
        },
        onSuccess:()=>{
            setMessage("Carousel added successfuly")
        } , 
        onError:(err:any)=>{
            const errMessage = err?.response?.data?.error || 'An error occured while adding carousel'
            setError(errMessage)
        }
    })
    const addProduct =(productId :string)=>{
        if(products.includes(productId)){
            const filtered = products.filter(p=>{
                return p !== productId
            })
            setProducts(filtered)
        }else{
            setProducts(prev=>[...(prev || []) , productId])
        }
    }
    const handleSubmit=(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(!title){
            return
        }
        if(!query){
            return
        }
        if(products.length === 0){
            return
        }
        mutation.mutateAsync()
    }
    const handleClose = ()=>{
        setOpenModule(false)
    }
    return (
        <>
            <AnimatePresence>
                {openModule && (
                    <div className="w-full h-full flex items-center justify-center z-[1600] fixed inset-0">
                        <motion.form onSubmit={handleSubmit} initial={{opacity:0 , translateY:-100}} animate={{opacity:1 , translateY:0}} exit={{opacity:0 , translateY:-100}} className="w-96 h-auto max-h-[90%] overflow-y-auto relative p-3 shadow-lg border dark:border-zinc-900 dark:shadow-black/80 dark:bg-black rounded-3xl bg-slate-200 z-10">
                            <h1 className="mx-auto text-xl dark:text-slate-300 w-max">Add Carousel</h1>
                            <hr  className="dark:bg-zinc-900 dark:border-zinc-900"/>
                            <br />
                            <label className="dark:text-slate-300 font-bold text-lg ">Title</label>
                            <br />
                            <input value={title} onChange={handleTitleChange} type="text" placeholder="Ex:- new arrival,etc..."  className="w-3/4 text-sm pl-3 h-9 rounded-lg outline-none dark:border-slate-300 border border-black " />
                            <hr  className="dark:bg-zinc-900 dark:border-zinc-900 my-5"/>
                            <input value={query} onChange={handleQueryChange} type="text" className="w-3/4 h-9 rounded-full pl-3 outline-none border dark:border-slate-300 text-sm" placeholder="Search product by name.." />
                            <hr  className="dark:bg-zinc-900 dark:border-zinc-900 my-5"/>
                            {isLoading && <p>Loading...</p>}
                            <div className="w-full flex flex-col h-96">
                                {Array.isArray(results)&&results.length>0 && results.map((r:any)=><div  key={r.id} className="w-full px-3 items-center h-16 grid grid-flow-col dark:bg-zinc-900 bg-slate-300 rounded-xl">
                                    <Image src={`/uploads/${path.basename(r.image.url)} `} className="object-contain w-14 h-14 rounded-full bg-white " width={100} height={100} alt="product image"/>
                                    <p className="w-16 text-ellipsis text-nowrap overflow-hidden">{r.name}</p>
                                    <p className="w-18 text-ellipsis text-nowrap overflow-hidden">${r.price}</p>
                                    <button onClick={()=>{
                                        addProduct(r.id)
                                    }} className="bg-slate-300/30 w-9 h-9 rounded-full flex items-center justify-center">
                                    {products.includes(r.id) ? <FaCheck />:<IoMdAdd  />}</button>
                                </div>)}

                            </div>
                            <div className="w-full grid grid-flow-col items-center">
                                <div className="relative h-14 w-full">
                                    {length>0 &&<SearchPagination page={page} setPage={setPage} length={length} />}
                                </div>
                                <div className="w-full flex flex-row-reverse gap-1 justify-start ">
                                    <button type="submit" className="w-1/2 h-9 rounded-full dark:bg-white dark:text-black bg-slate-300">Submit</button>
                                    <button onClick={handleClose} className="px-3 py-1 rounded-full dark:bg-slate-300 dark:text-black bg-slate-300">Cancel</button>

                                </div>

                            </div>
                        </motion.form>
                        <div onClick={()=>{
                            setOpenModule(false)
                        }} className="absolute w-full h-full inset-0 bg-black/10 backdrop-blur-sm z-1"></div>
                    </div>
                )
                }

            </AnimatePresence>
        </>
    )
}