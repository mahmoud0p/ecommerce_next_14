'use client'
import React, { FormEvent, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SubCombo } from '@/app/components/subComb';
import { useParams } from 'next/navigation';
import DropZone from '@/app/admin/addproduct/components/dropzone';
import { IoMdClose } from 'react-icons/io';
import { FaCheck } from 'react-icons/fa6';
import { GiPencil } from 'react-icons/gi';
import { GoTrash } from 'react-icons/go';
import { Loader } from '@/app/components/LoadingComponent';
import Image from 'next/image';
import _ from "lodash"
import { useAtom } from 'jotai';
import { SuccessMessage, errorAtom } from '@/app/state';
interface Product {
  id: string;
  name: string;
  price: string;
  countInStock: number;
  description: string;
  details: string;
  subId: string;
}





const updateProduct = async ({  formData }: {  formData: FormData }) => {
  const response =await axios.put(`/api/addproduct`, formData);
  return response.data
};



const EditProductPage: React.FC = () => {

  const params = useParams()
    const {slug} = params
  const queryClient = useQueryClient();
  const [imagesUploaded , setImageUploaded] = useState<File[]|null>([])
  const [oldImages, setOldImages] = useState<{id:string , url:string}[]>([])
  const [formState, setFormState] = useState({
    name: '',
    price: '',
    countInStock: '',
    description: '',
  });
  const [ , setMessage] = useAtom(SuccessMessage)
  const [ , setError] = useAtom(errorAtom)
  const [subcategory , setSubcategory] = useState('')
  const [details , setDetails] = useState<{name:string , value:string}[]>([])
  const [addMode ,setAddMode] = useState(false)
  const [specName , setSpecName] = useState('')
  const [specValue , setSpecValue] = useState('')
  const [imageDeleted , setImagesDeleted] = useState<string[]>([])
  const submitSpec = ()=>{
        if(specName === '' || specValue === ""){
            return 
        }
        setDetails(prev=>[...(prev || []) , {name:specName , value:specValue}])
        setSpecName('')
        setSpecValue("")
}
  const [edit , setEdit] = useState<number | null>(null)
  const {  isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey : ['product', slug.toString() as string],
    queryFn : async() :Promise<Product> => {
        const { data } = await axios.get(`/api/product?id=${slug.toString()}`);
        setFormState({
          name : data.name , 
          price:data.price , 
          countInStock:data.countInStock , 
          description:data.description , 
        })
        setOldImages(data.images)
        setDetails(JSON.parse(data.details))
        return data;
      } , 
      refetchOnReconnect:false ,
      refetchOnWindowFocus:false
  });


  const mutation = useMutation({mutationFn : updateProduct, 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey : ['product', slug.toString() as string]});
      setImageUploaded([])
      setMessage('Product updated successfully!');
    },
    onError: (err:any) => {
      setError(err?.response?.data?.error || 'An error occured while updating the product');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };


  const handleSettingSpecName =(e:FormEvent<HTMLInputElement>)=>{
    const value = e.currentTarget.value
    setSpecName(value)
}
const handleSettingSpecValue =(e:FormEvent<HTMLInputElement>)=>{
    const value = e.currentTarget.value
    setSpecValue(value)
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('productId' , slug.toString())
    Object.keys(formState).forEach(key => {
        formData.append(key, formState[key as keyof typeof formState] as string);
    });
    formData.append('subId' , subcategory)
    formData.append('details' , JSON.stringify(details))
    _.each(imageDeleted , (i)=>{
      formData.append('imagesDeleted'  , i)
    })
    _.each(imagesUploaded , (i)=>{
      formData.append('images' , i)
    })
    mutation.mutate({  formData });
  };

  
  const handleOnSave = (index:number)=>{
         details[index].name = editName
         details[index].value = editValue
         setEdit(null)
    }
    const handleOnDelete= (index:number)=>{
        const filtered = details.filter((spec)=>spec !== details[index])
        setDetails(filtered)
    }
    const handleSettingName =(e:FormEvent<HTMLInputElement>)=>{
      const value = e.currentTarget.value ; 
      setEditName(value)
  }
  const handleSettingValue=(e:FormEvent<HTMLInputElement>)=>{
      const value = e.currentTarget.value ; 
      setEditValue(value)
  }
  const setEditMode = (index:number)=>{
    setEditName(details[index].name)
    setEditValue(details[index].value)
    setEdit(index)
}
  const handleDelete = (imageId:string)=>{
    const exist = imageDeleted.includes(imageId)
    if(exist){
      return 
    }
    if(oldImages.length === 5){
      return setError("Images cannot be less than 5 images")
    }
    const filtered = _.filter(oldImages , (o)=>{
      return o.id !== imageId
    })
    setOldImages(filtered)
    setImagesDeleted(prev=>[...(prev || []) ,imageId])
  }
  const [editName , setEditName] = useState("")
    const [editValue  ,setEditValue] = useState("") 
  if (isLoadingProduct) return <Loader/>;
    
  else return (
    <div className="min-h-screen dark:text-slate-300 pt-[4rem] pb-5 px-5">
      <div className="container mx-auto">
        <h1 className="text-2xl mb-4">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-indigo-900  outline-none rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="text"
              name="price"
              value={formState.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-indigo-900  outline-none rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Count In Stock</label>
            <input
              type="number"
              name="countInStock"
              value={formState.countInStock}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-indigo-900  outline-none rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              className="w-full p-2 border dark:border-indigo-900 outline-none resize-none h-52 rounded"
            ></textarea>
          </div>
          <div>
            <label className="block mb-2">Details</label>
            
                    {details.length===0 ? <div className="w-full h-auto "><p>Nothing to show</p></div>:(
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
                                    {details.map((spec , i)=><tr key={i} className="even:bg-white odd:bg-slate-200 odd:dark:bg-zinc-900 dark:even:bg-zinc-800 relative group">
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
                                        </div>: 
                                        <div className=" border dark:border-slate-300 backdrop-blur-sm rounded-lg top-1/2 -translate-y-1/2 right-0 p-1  gap-1 absolute  hidden group-hover:flex">
                                            <GiPencil  onClick={()=>{setEditMode(i)}} className="w-7 p-1 hover:text-black h-7 cursor-pointer rounded-full  hover:bg-white/30"/>
                                            <GoTrash onClick={()=>handleOnDelete(i)} className="w-7 h-7  text-red-500 hover:bg-red-500/30 p-1 rounded-full cursor-pointer  "/>
                                        </div>}

                                    </tr>)}
                                    
                                </tbody>
                            </table>
                        </div>
                    )}
                    {addMode &&<div className='mt-3 w-full grid grid-cols-2 gap-2'>
                      <div className='grid grid-cols-2 gap-2'>
                        <input value={specName} onChange={handleSettingSpecName} type="text" placeholder='Name..' className='h-9 text-sm rounded-lg outline-none border border-indigo-900 pl-3' />
                        <input value={specValue} onChange={handleSettingSpecValue} type="text" placeholder='Value..' className='h-9 text-sm rounded-lg outline-none border border-indigo-900 pl-3' />
                      </div>
                      <div className='flex gap-2'>
                        <button type='button' onClick={submitSpec} className='text-white bg-green-500 px-5 py-1 rounded-lg'>Add</button>
                        <button onClick={()=>{
                          setAddMode(false)
                        }} className='text-white bg-red-500 px-5 py-1 rounded-lg'>Cancel</button>
                      </div>
                      </div>}
                    {!addMode &&<div className='mt-3 w-full flex justify-end'><button onClick={()=>{
                      setAddMode(true)
                    }} className='dark:text-black bg-white px-5 py-1 rounded-lg'>Add</button></div>}
                </div>
          <div>
            <label className="block mb-2">Subcategory</label>
            <SubCombo
              setSubcategory={setSubcategory}
            />
          </div>
          <div>
            <label className="block mb-2">Images</label>
            <div className='grid grid-cols-3 gap-1 '>
              {oldImages.map(image=>
                <div className='bg-white flex h-72 relative justify-center items-center group' key={image.id}>
                  <Image alt='product images' className='w-52 object-contain h-52' width={130} height={130} src={image.url} />
                  <div onClick={()=>{handleDelete(image.id)}} className='absolute inset-0 backdrop-blur-sm w-full h-full hidden text-red-500 font-bold group-hover:flex items-center justify-center cursor-pointer'>
                    Click To Delete
                  </div>
                </div>
              )
              }
            </div>
            <div className='w-full mt-5'>
              <DropZone images={imagesUploaded } setImages={setImageUploaded}/>

            </div>
          </div>
          <button
            type="submit"
            className="w-full p-2 mb-5 dark:bg-white dark:text-black text-white rounded"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
