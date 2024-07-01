'use client'
import { FormEvent, useEffect, useState } from "react";
import { MdOutlineAdd } from "react-icons/md";
import {  GiPencil } from "react-icons/gi";
import { GoTrash } from "react-icons/go";
import { FaCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import DropZone from "./components/dropzone";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { SuccessMessage, errorAtom, isAdminAtom, userAtom } from "@/app/state";
import { SubCombo } from "@/app/components/subComb";
import { isAdmin } from "@/app/api/admin/isAdmin";
import { useRouter } from "next/navigation";

type Spec = {
    name:string , 
    value:string  
}
type errorsType = {
    name?:string   ,
    price ? :string , 
    countInStock ?: string ,
    description ? :string ,
    details ? :string , 
    images ? :string , 
    subcategory ? :string
}
export default async function AddProduct(){
    const [isAdmin] = useAtom(isAdminAtom)
    const [user ] =useAtom(userAtom)
    const [,setError] = useAtom(errorAtom)
    const [errors , setErrors]  = useState<errorsType>({})
    const [add ,setAdd] = useState(0)
    const [edit , setEdit] = useState<number | null>(null)
    const [specifications , setSpecifications] = useState<Spec[] | []>([])
    const [specName , setSpecName] = useState('')
    const [specValue , setSpecValue] = useState('')
    const [editName , setEditName] = useState("")
    const [editValue  ,setEditValue] = useState("") 
    const [images , setImages] = useState<File[] | null>(null)
    const [description , setDescription] = useState("")
    const [name , setName] = useState("")
    const [price , setPrice]  = useState<number | "">("")
    const [countInStock , setCountInStock] = useState<number | "">("")
    const [,setMessage] = useAtom(SuccessMessage)
    const [isSubmitting , setIsSubmitting] = useState(false)
    const [subcategory , setSubcategory] = useState('')
    const router = useRouter()
    const handlesettingName = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setName(value)
    }
    const handlesettingDescription = (e:FormEvent<HTMLTextAreaElement>)=>{
        const value = e.currentTarget.value ; 
        setDescription(value)
    }
    const handlesettingPrice = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        if(value === ''){
            setPrice('')
        }
        if(Number(value) <= 0){
            setPrice('')
        }else{
            setPrice(Number(value))
        }
    }
    const handlesettingCountInStock = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        if(value === ''){
            setCountInStock('')
        }
        if(Number(value) <= 0){
            setCountInStock('')
        }else{
            setCountInStock(Number(value))
        }
    }
    
    const handleSettingSpecName =(e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value
        setSpecName(value)
    }
    const handleSettingSpecValue =(e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value
        setSpecValue(value)
    }
    const submitSpec = ()=>{
        setAdd(1)
        if(add === 1){
            if(specName === '' || specValue === ""){
                return 
            }
            setSpecifications(prev=>[...(prev || []) , {name:specName , value:specValue}])
            setSpecName('')
            setSpecValue("")
        }
    }
    const setEditMode = (index:number)=>{
        setEditName(specifications[index].name)
        setEditValue(specifications[index].value)
        setEdit(index)
    }
    const handleSettingName =(e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setEditName(value)
    }
    const handleSettingValue=(e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setEditValue(value)
    }
    const handleOnSave = (index:number)=>{
         specifications[index].name = editName
         specifications[index].value = editValue
         setEdit(null)
    }
    const handleOnDelete= (index:number)=>{
        const filtered = specifications.filter((spec)=>spec !== specifications[index])
        setSpecifications(filtered)
    }
    const fetchApi = async (productData:any)=>{
        const response = await axios.post("/api/addproduct" , productData)
        return response.data
    }
    const mutation = useMutation({
        mutationFn:async(productData : any)=>{
            return await fetchApi(productData)
        } , onSuccess:()=>{
            setName("")
            setPrice("")
            setCountInStock('')
            setDescription('')
            setSpecifications([])
            setImages([])
            setIsSubmitting(false)
            setMessage("Product created successfully")
        } , 
        onError:(error:any)=>{
            setIsSubmitting(false)
            setError(error?.response?.data?.error || "An Error occured while adding new Product")
        }
    })
    const checkEverythingIsOkay = ()=>{
         
        if(name === ""){
            let error= "product's name cannot be empty"
            setErrors({name : error})
            throw new Error(error)
        }else if(price === ''){
            let error="product's price cannot be empty"
            setErrors({price : error})
            throw new Error(error)
        }else if (countInStock === ""){
            let error = "product's number in stock cannot be empty"
            setErrors({countInStock : error})
            errors.countInStock = error
            throw new Error(error)
        }else if (description === ''){
            let error = "product's description cannot be empty"
            setErrors({description : error})
            throw new Error(error)
        }
        else if(specifications.length < 7){
            let error ="product's specifications must be at least 7 "
            setErrors({details: error})
            throw new Error(error)
        }else if(!images){
                throw new Error("error handling images")
        }else if(images.length < 5){
            let error ="product's images must be at least 5 images"
            errors.images = error
            throw new Error(error)
        }
        else if(!subcategory){
            let error ="Subcategory cannot be empty.."
            errors.subcategory = error
            throw new Error(error)
        }
        else {return null}
    }
    const handleSubmit = ()=>{
        setIsSubmitting(true)
        try{
            checkEverythingIsOkay()
            const jsonDetails = JSON.stringify(specifications)
            const formData = new FormData()
            formData.append("name" , name)
            formData.append("price" , price.toString())
            formData.append("description" , description)
            formData.append("countInStock" , countInStock.toString())
            formData.append("details" , jsonDetails)
            formData.append("subId" , subcategory)
            for(let image of images!){
                formData.append("images" , image)
            }
            mutation.mutateAsync(formData)
        }catch(error:any){
            setError(error.message)
        }
    }

    const mainInputs = [{label:"Name" , type:'text' , placeholder:"Write product's name"} ,{label:"Price" , type:'number' , placeholder:"Write product's price"} ,{label:"Count in stock" , type:'number' , placeholder:"Number of products in the stock"} ]
    if(!user || user.role !== "ADMIN" || !isAdmin){
        return router.push('/admin/dashboard')
    }
    return(
        <div className="min-h-screen w-full flex gap-3 flex-col items-center lg:items-start justify-start pt-[4rem] px-5 dark:text-slate-300">
                <h1 className="lg:text-5xl md:text-4xl sm:text-3xl text-2xl dark:text-slate-300">Add New Product</h1>
            <div className="h-auto w-full flex lg:flex-row flex-col items-center lg:items-start ">
                <div className="xs:w-3/4 w-full lg:w-1/2 h-max grid md:grid-cols-2 gap-3  p-3 ">
                    {mainInputs.map((input,i)=>(<div className="flex flex-col gap-2" key={i} >
                        <p>{input.label}</p>
                        <input type={input.type} value={input.label==="Price" ?price :input.label==="Count in stock" ? countInStock :name } onChange={input.label==="Price" ?handlesettingPrice :input.label==="Count in stock" ? handlesettingCountInStock :handlesettingName } min={0} className="outline-none dark:bg-zinc-900 bg-slate-200  w-full h-9 rounded-lg pl-3 " placeholder={input.placeholder} />
                        {input.label === "Name" && errors['name'] && <p className="text-sm text-red-500">{errors.name}</p>}
                        {input.label === "Price" && errors['price'] && <p className="text-sm text-red-500">{errors.price}</p>}
                        {input.label === "Count in stock" && errors['countInStock'] && <p className="text-sm text-red-500">{errors.countInStock}</p>}

                    </div>))}
                    <div className="flex flex-col justify-end gap-2 h-full">
                        <p>Subcategory</p>
                        <SubCombo setSubcategory={setSubcategory}/>
                        {errors.subcategory && <p className="text-sm text-red-500">{errors.subcategory}</p>}

                    </div>
                </div>
                <div className="lg:w-1/2 xs:w-3/4 w-full flex flex-col gap-2">
                    <p className="md:text-3xl sm:text-2xl text-xl">Description</p>
                    <textarea value={description} onChange={handlesettingDescription} className="w-full bg-slate-200 transition-all duration-150 ease-linear dark:bg-zinc-900 p-3 outline-0 rounded-lg h-52 resize-none"  placeholder="Write product description... "></textarea>
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
            </div>
            <div className="w-full">
                <h3 className="md:text-3xl sm:text-2xl text-xl mb-2">
                    Details {errors.details && (<span className="text-sm text-red-500">{errors.details}</span>)}
                </h3>
                <div className="grid md:grid-cols-2 w-full gap-5">
                    <div className="flex flex-col gap-3">
                        {add===1 && (<div className="bg-zinc-900 grid grid-cols-2 divide-x-2 md:text-md text-sm  divide-slate-300 dark:divide-zinc-800">
                            <input onChange={handleSettingSpecName} value={specName} type="text"  placeholder="Name..." className="h-9 outline-none pl-3 dark:bg-zinc-900 bg-slate-200" />
                            <input onChange={handleSettingSpecValue} value={specValue} type="text" placeholder="Value..." className="h-9 outline-none pl-3 dark:bg-zinc-900 bg-slate-200"/>
                        </div>)}
                        <div className="flex sm:gap-3 xs:gap-2 gap-1">
                            <button onClick={submitSpec} className="flex bg-lightgreen text-white items-center justify-center dark:bg-white transition-all duration-150 ease-in-out dark:hover:bg-slate-300 dark:text-black py-3 md:w-1/2 w-3/4 md:text-md text-xs sm:text-sm  rounded-lg"><MdOutlineAdd className="text-md "/>
                                Add Spefication
                            </button>
                            {add ===1 && <button className="flex-1 py-3 bg-red-500 md:text-md text-xs sm:text-sm text-white rounded-lg hover:bg-red-600 transition-all duration-150 ease-linear" onClick={()=>setAdd(0)}>Cancel</button>}
                        </div>
                    </div>
                    {specifications.length===0 ? <div className="w-full h-auto "><p>Nothing to show</p></div>:(
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Value
                                        </th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {specifications.map((spec , i)=><tr key={i} className="even:bg-white odd:bg-slate-200 odd:dark:bg-zinc-900 dark:even:bg-zinc-800 relative group">
                                        <th scope="row" className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {edit ===i ?<input value={editName} onChange={handleSettingName} className="h-7 w-full bg-slate-200 dark:bg-zinc-900 outline-none pl-2"/>:<p>{spec.name}</p>}
                                        </th>
                                        <td className="px-6 py-4">
                                            {edit ===i ?<input value={editValue} onChange={handleSettingValue} className="h-7 w-3/4 pl-2 outline-none bg-slate-200 dark:bg-zinc-900 "/>:<p>{spec.value}</p>}
                                        </td>
                                        {edit === i ? <div className="absolute gap-2  h-full w-[5rem] right-0 flex items-center justify-center "><button onClick={()=>{
                                            setEdit(null)
                                        }} className=" px-2 py-1 bg-red-500 text-white rounded-lg dark:hover:bg-red-600 transition-all duration-150 ease-linear ">
                                                <IoMdClose />
                                            </button>
                                            <button onClick={()=>handleOnSave(i)} className="bg-green-500 px-2 py-1  rounded-lg text-white dark:hover:bg-green-600 transition-all duration-150 ease-linear">
                                                <FaCheck />
                                            </button>
                                        </div>: <div className=" border dark:border-slate-300 backdrop-blur-sm rounded-lg top-1/2 -translate-y-1/2 right-0 p-1  gap-1 absolute  hidden group-hover:flex">
                                            <GiPencil  onClick={()=>{setEditMode(i)}} className="w-7 p-1 hover:text-black h-7 cursor-pointer rounded-full  hover:bg-white/30"/>
                                            <GoTrash onClick={()=>handleOnDelete(i)} className="w-7 h-7  text-red-500 hover:bg-red-500/30 p-1 rounded-full cursor-pointer  "/>
                                        </div>}

                                    </tr>)}
                                    
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex w-full gap-3 py-5 flex-col items-center justify-center">
                <div className="w-full"><h3 className="md:text-3xl sm:text-2xl text-xl">
                    Product Images {errors.images && (<span className="text-sm text-red-500">{errors.images}</span>)}
                </h3></div>
                
                <DropZone images={images} setImages={setImages}/>

            </div>
            <button onClick={handleSubmit} disabled={isSubmitting} className="py-3 w-1/2 bg-lightgreen disabled:opacity-20 dark:bg-white dark:text-black  text-white rounded-xl mx-auto mb-5 transition-all duration-150 ease-linear dark:hover:bg-slate-300">Submit</button>
        </div>
    )
}