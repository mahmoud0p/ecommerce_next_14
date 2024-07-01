'use client'
import { Loader } from "@/app/components/LoadingComponent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { MdFilterList } from "react-icons/md";
import _ from "lodash"
import { useAtom } from "jotai";
import { SuccessMessage, errorAtom } from "../state";
import Image from "next/image";
import { ConfirmationMessage } from "../admin/dashboard/components/Products";
import { AnimatePresence } from "framer-motion";
import {motion} from 'framer-motion'
import { FaX } from "react-icons/fa6";
import "./styles.css"
import { CustomCombobox } from "@/app/components/combobox";
const EditCard = ({ subcategory, openEdit, setOpenEdit }: { subcategory: any, openEdit: boolean, setOpenEdit: (value: boolean) => void }) => {
    const [imageUploaded, setImageUploaded] = useState<File | null>(null);
    const [submitting , setSubmitting] = useState(false)
    const [title, setTitle] = useState<string>(subcategory?.name || '');
    const [,setMessage] = useAtom(SuccessMessage)
    const [category ,setCategory] = useState('')
    const[ , setError] = useAtom(errorAtom)
    const queryClient = useQueryClient()
    const [Subcategory , setSubcategory] = useState<{id:string , name:string , category:string , image:string}|null>(null)
    const mutation = useMutation({
        mutationFn:async(data:any)=>{
            const response = await axios.put('/api/subcategories' , data)
            return response.data
        } , 
        onSuccess:()=>{
            setOpenEdit(false) ; 
            setMessage('Subcategory edited successfuly')
            setSubmitting(false)
            queryClient.invalidateQueries({queryKey:['subcategories']})
        } , 
        onError:(err:any)=>{
            setOpenEdit(false)
            setSubmitting(false)
            setError(err?.response?.data?.error || "An error occured while editing the subcategory")
        }
    })
    const handleSubmit = ()=>{
        setSubmitting(true)
        const formData =new FormData()  ;
        if(!Subcategory){
            return setError('No subcategory') 
        }
        formData.append('name' , title) ;  
        formData.append('subId' , Subcategory.id )
        formData.append('categoryId' , category)
        if(imageUploaded){
            formData.append('image' , imageUploaded)
        }
        mutation.mutateAsync(formData)
        
    }
    useEffect(() => {
      if (subcategory) {
        setSubcategory(subcategory)
        setTitle(subcategory.name)
      }
      
    }, [subcategory]);
  
    const handleClosing = () => {
      setOpenEdit(false);
    };
  
   
    const handleChangingTitle = (e: FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setTitle(value);
    };
  
    const handleUploading = (e: FormEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0];
      if (file) {
        setImageUploaded(file);
      }
    };
  
    return (
      <AnimatePresence>
        {openEdit && (
          <>
            <div className="fixed  inset-0 h-full w-full z-[1600]">
              <motion.div
                initial={{  translateY: '-100%', opacity: 0, translateX: '50%' }}
                animate={{  translateY: '-50%', opacity: 1 }}
                exit={{  translateY: '-100%', opacity: 0 }}
                className="fixed shadow-lg pb-3 edit-subcategory overflow-y-auto items-center dark:shadow-black top-1/2 right-1/2 w-2/4 flex overflow-hidden flex-col h-3/4 z-[10] bg-white rounded-3xl dark:bg-zinc-900"
              >
                <div className="min-h-32 bg-slate-200 flex items-center border-b dark:border-slate-300 border-gray-400 w-full px-5 dark:bg-black relative">
                  <h3 className="dark:text-slate-300 text-3xl">Edit Subcategory</h3>
                  <FaX onClick={handleClosing} className="text-xl cursor-pointer absolute top-1/2 text-red-500 -translate-y-1/2 right-5" />
                </div>
                <div className="w-full flex-1 px-5 mt-5 mx-auto flex flex-col gap-1">
                  <label className="text-xl">Title</label>
                  <input
                    onChange={handleChangingTitle}
                    type="text"
                    className="h-9 w-3/4 outline-none rounded-lg pl-3 text-sm"
                    value={title}
                    placeholder="Ex: Men's Clothes, Mobile Phones, etc..."
                  />
                  <p className="text-xl mt-3">Current Category</p>
                  <p className="text-gray-400">{Subcategory?.category}</p>
                  <CustomCombobox setCategory={setCategory}/>
                  <label className="mt-5 text-xl">Upload the new Image <span className="text-sm text-blue-500">note on uploading new image the old image will be deleted permenantly</span></label>
                  <input type="file" onChange={handleUploading} className="hidden" id="upload-image" />
                  
                    <div className="w-max border mx-auto border-slate-300 mt-2 rounded-lg overflow-hidden cursor-pointer flex justify-center h-auto relative group">
                      {imageUploaded && <div
                        onClick={() => setImageUploaded(null)}
                        className="w-52 h-52  hidden group-hover:flex absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 justify-center items-center backdrop-blur-sm"
                        >
                        Click to remove
                      </div>}
                      <Image
                        width={100}
                        height={100}
                        className="w-52 h-52 object-contain"
                        src={imageUploaded ? URL.createObjectURL(imageUploaded) : `/uploads/${Subcategory?.image}`}
                        alt="uploaded-image"
                      />
                    </div>
                  
                </div>
                        <label htmlFor="upload-image" className="cursor-pointer text-center py-2 px-4 bg-blue-500 text-white rounded-lg mt-2">Upload Image</label>
                <div className="w-full flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting }
                    className="border-2 disabled:opacity-70 border-gray-600 text-gray-600 dark:border-white dark:text-white mt-3 w-1/2 mx-auto py-2 rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              </motion.div>
              <div onClick={handleClosing} className="fixed inset-0 w-full h-full z-[1] bg-black/30 backdrop-blur-sm"></div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  };
export default function Subcategory(){
    const [subs ,setSubs] = useState<{id:string , name:string , image:string , category:string}[]>([])
    const [filtering , setFiltering] =useState<{id:string , name:string , image:string , category:string}[]>([])
    const [filter , setFilter] = useState<string>('')
    const [title , setTitle] = useState('')
    const [image,setImage] = useState<File | null>(null)
    const [ , setMessage] = useAtom(SuccessMessage)
    const [ , setError] = useAtom(errorAtom)
    const[category ,setCategory] = useState('')
    const [inputValue ,setInputValue] = useState('')
    const [editSub , setEditSub] = useState<{id:string ,name:string ,image:string  , category:string} | null>(null)
    const [openEdit , setOpenEdit] = useState(false)
    const {isLoading } = useQuery({
        queryKey:['subcategories'] , 
        queryFn:async()=>{
            const response = await axios.get('/api/subcategories')
            setSubs(response.data)
            return response.data
        }
    })
    const message = "Are you sure you want to delete this subcategory?"
    const [subId , setSubId] = useState('')
    const [open , setIsOpen] = useState(false)
    const handleSettingFilter= (e:FormEvent<HTMLInputElement>)=>{
        const value= e.currentTarget.value.toLowerCase() ;
        setFilter(value)
        const filteredSubs = _.filter(subs , (s)=>{
            const subaya = s.name.toLowerCase()
            return subaya.includes(value)
        })
        setFiltering(filteredSubs)
    }
    const handleTitle = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value
        setTitle(value)
    }
    const handleUploading = (e:FormEvent<HTMLInputElement>)=>{
        const file = e.currentTarget.files?.[0] ;
        if(file){
            setImage(file)
        } 
    }
    const queryClient = useQueryClient ()
    const addingMutation = useMutation({
        mutationFn:async(subData:any)=>{
            const response =await axios.post('/api/subcategories' , subData)
            return response.data
        } ,
        onSuccess:()=>{
            setCategory('')
            setTitle('')
            setImage(null)
            setInputValue('')
            setMessage("Subcategory added successfuly")
            queryClient.invalidateQueries({queryKey:['subcategories']})
        } , 
        onError: (err:any)=>{
            setError(err?.response?.data?.error || 'An error occured while adding subcategory')
        }
    })
    const handleSubmit  =()=>{
        if(!title){
            return 
        }
        if(!image){
            return 
        }
        if(!category){
            return
        }
        const formData = new FormData()
        formData.append("name" , title) ; 
        formData.append('image' , image) ; 
        formData.append('categoryId' , category)
        addingMutation.mutateAsync(formData)
    }
    const deleteMutation = useMutation({
        mutationFn:async()=>{
            const response = await axios.delete(`/api/subcategories?subId=${subId}`)
            return response.data
        }
        ,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['subcategories']})
            setMessage('Subcategory deleted successfully')
        }
        , onError(err:any){
            setError(err?.response?.data?.error || "An error occured while deleting the subcategory")
        }
    })
    const handleDeleting =()=>{
        deleteMutation.mutateAsync()
        const filtered = _.filter(filtering , (f)=>{
            return f.id !== subId
        })
        setFiltering(filtered)
        setIsOpen(false)
    }
    return (
        <>
            <div className="md:w-3/4 w-full mx-auto min-h-screen pt-[4rem] px-5">
                <h3 className="text-3xl dark:text-slate-300 ">Subcategories</h3>
                <div className="w-full mt-5 p-3 dark:bg-zinc-900 rounded-lg ">
                    <h3 className="text-xl dark:text-slate-300">Add Subcategory</h3>
                    <div className="flex flex-col gap-1 mt-2">
                        <label className="text-lg">Subcategory Title</label>
                        <input type="text" value={title} onChange={handleTitle} className="text-sm h-9 pl-2 rounded-lg lg:w-1/2 sm:w-2/3 w-full outline-none border border-zinc-800" placeholder="Ex:Men's Clothes, Mobile Phones, etc..." />
                    </div>
                    <CustomCombobox  setCategory={setCategory}/>
                    <div className="mt-3 w-max flex flex-col gap-1">
                        <h3 className="text-lg">Upload Image for Subcategory</h3>
                        <label>
                            <input onChange={handleUploading} type="file"  className="hidden" />
                            <p className="uppercase w-max cursor-pointer dark:hover:bg-slate-200 transition-all duration-150 ease-in-out  dark:bg-white px-5 py-2 rounded-lg dark:text-black">Upload Image</p>
                        </label>
                    </div>
                    {image && <div className="w-max border border-slate-300 mt-2 rounded-lg overflow-hidden cursor-pointer flex justify-center h-auto relative group">
                            <div onClick={()=>{
                                setImage(null)
                            }} className="w-52 h-52 hidden group-hover:flex absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2  justify-center items-center backdrop-blur-sm">
                                Click To remove
                            </div>
                            <Image width={100} height={100}  className="w-52 h-52 object-contain" src={URL.createObjectURL(image)} alt="uploaded-image"/>
                        </div>}
                    <div className="w-full flex justify-center">
                        <button onClick={handleSubmit} className="border-2 border-gray-600 text-gray-600 dark:border-white dark:text-white mt-3 w-1/2 mx-auto py-2 rounded-lg">Submit</button>
                    </div>
                </div>
                {/* subcategory table */}
                {isLoading ? <Loader/> :<div className="w-full  mt-10 h-screen flex flex-col items-start justify-start">
                    <div className="flex relative w-1/2 mx-auto items-center  ">
                        <input  onChange={handleSettingFilter} type="text" className="w-full shadow-md dark:shadow-black/80 border border-slate-300 bg-slate-200 text-sm dark:border-zinc-800 dark:bg-zinc-900 h-9 rounded-lg outline-none pl-3" placeholder="Filter.." />
                        <button className="text-xl w-5 h-5 rounded-full text-black  flex justify-center items-center bg-white absolute right-1 ring-1 ring-zinc-900"><MdFilterList /></button>
                    </div>
                    {subs.length > 0 && subs && <div className="relative  overflow-visible w-full shadow-md sm:rounded-lg mt-3">
                        <table className="w-full text-sm overflow-visible text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs overflow-visible text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="overflow-visible">
                                {Array.isArray(subs) &&(filtering.length>0  ? filtering :filter.length>0 ? filtering:subs).map(sub =><tr key={sub.id} className="odd:bg-white overflow-visible odd:dark:bg-zinc-900 relative even:bg-gray-50 even:dark:bg-zinc-800 border-b dark:border-gray-700">
                                    <th  scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-visible relative dark:text-white">
                                        <p  className="max-w-32 cursor-pointer text-ellipsis text-nowrap z-10 overflow-hidden">
                                            {sub.name}
                                        </p>
                                    </th>
                                    <th  scope="row" className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap overflow-visible relative dark:text-gray-500">
                                        <p  className="max-w-32  text-ellipsis text-nowrap z-10 overflow-hidden">
                                            {sub.category}
                                        </p>
                                    </th>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={
                                            ()=>{
                                                setOpenEdit(true)
                                                setEditSub(sub)
                                            }
                                        } className="text-blue-500 underline">Edit</button>
                                        <button onClick={()=>{
                                            setIsOpen(true)
                                            setSubId(sub.id)
                                        }} className="text-red-500 underline">Delete</button>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>}
                </div>}
            </div>
            <EditCard subcategory={editSub} openEdit={openEdit} setOpenEdit={setOpenEdit}/>
            <ConfirmationMessage open={open} setIsOpen={setIsOpen} message={message} onConfirm={handleDeleting}/>
        </>
    )
}