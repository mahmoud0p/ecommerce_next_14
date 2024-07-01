'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import { FormEvent, useState } from "react"
import { SuccessMessage, errorAtom } from "../state";
import { ConfirmationMessage } from "../admin/dashboard/components/Products";
import _ from "lodash"
import { Loader } from "@/app/components/LoadingComponent";
export default function Category(){
    const [name ,setName] = useState('')
    const [newName , setNewName] = useState('')
    const [ , setError] = useAtom(errorAtom)
    const [ , setMessage]  = useAtom(SuccessMessage)
    const [errorName, setNameError] =useState('')
    const queryClient = useQueryClient()
    const [submitting ,setIsSubmitting] = useState<{
        adding? : boolean , 
        deleting ?: boolean , 
        editing ? : boolean 
    }>({})
    const [open , setOpen ] = useState(false)
    const [categoryId , setCategoryId] = useState('')
    const [filter , setfilter] = useState<any[]>([])
    const [filterInp , setFilterInp] = useState('')
    const [editMode ,setEditMode] = useState('')
    const message = "Are you sure you want to delete this category?"
    const handleSettingName = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        setNameError('')
        setName(value)
    }
    const addCategory = useMutation({
        mutationFn:async()=>{
            const response = await axios.post('/api/categories' ,{name})
            return  response.data ;
        },
        onSuccess:()=>{
            setMessage('Category added successfuly..')
            queryClient.invalidateQueries({queryKey:['admin_categories']})
            setName('')
            setIsSubmitting({
                adding:false
            })
        } , 
        onError:(err:any)=>{
            setError(err?.response?.data?.error)
            setIsSubmitting({
                adding:false
            })
        }
    })
    const deleteCategory = useMutation({
        mutationFn:async()=>{
            const response = await axios.delete(`/api/categories?categoryId=${categoryId}`)
            return  response.data ;
        },
        onSuccess:()=>{
            setMessage('Category deleted successfuly..')
            queryClient.invalidateQueries({queryKey:['admin_categories']})
            setIsSubmitting({
                deleting:false
            })
        } , 
        onError:(err:any)=>{
            setError(err?.response?.data?.error)
            setIsSubmitting({
                deleting:false
            })
        }
    })
    const updateCategory = useMutation({
        mutationFn:async(categoryId : string)=>{
            const response = await axios.put('/api/categories' , {newName , categoryId})
            return response.data
        } , 
        onSuccess:()=>{
            setMessage('Category edited successfuly..')
            queryClient.invalidateQueries({queryKey:['admin_categories']})
            setNewName('')
            setIsSubmitting({
                editing:false
            })
            setEditMode("")
        } , 
        onError:(err:any)=>{
            setError(err?.response?.data?.error)
            setIsSubmitting({
                editing:false
            })
        }
    })
    const {data , isLoading , isError} = useQuery({
        queryKey : ['admin_categories'] ,
        queryFn:async()=>{
            const response = await axios.get('/api/categories' ) ; 
            return response.data
        } , 

    })
    const handleAddingCategory = ()=>{
        setIsSubmitting({
            adding:true
        })
        if(!name){
            setNameError('Category title cannot be empty..')  
            return
        }
        addCategory.mutateAsync()
        setfilter([])
    }
    const deleteCategoryFn = ()=>{
        setIsSubmitting({
            deleting:true
        })
        deleteCategory.mutateAsync()
        setOpen(false)
        if(filter.length>0){
           const afterDelete =  _.filter(filter ,(f)=>{
                return f.id !== categoryId
            })
            setfilter(afterDelete)
        }
    }
    const handleFiltering = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        setFilterInp(value)
        const lower_value = value.toLowerCase()
        const filteredCategories  = _.filter(data,(category)=>{
            return category.name.toLowerCase().includes(lower_value)
        })
        setfilter(filteredCategories)
        
    }
    const handleSettingNewName = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setNewName(value)
    }
    const handelEditting = (categoryId:string)=>{
        setIsSubmitting({
            editing:false
        })
        updateCategory.mutateAsync(categoryId)
        if(filter.length>0){
            _.each(filter , (f)=>{
                if(f.id === categoryId){
                    f.name = newName
                }
            })
        }
        
    }
    return (
        <>
        {isLoading ? <Loader/> :  
        <div className=" min-h-screen pt-[4rem] w-3/4 mx-auto">
            <h3 className="text-3xl text-slate-300">Categories</h3>
            <div className="w-full  mt-5">
                <h3 className="mx-auto w-max mb-2 text-2xl ">Add Category</h3>
                <hr  className="bg-zinc-900 border-zinc-900 "/>
                 <div className="flex flex-col gap-2 px-5 mt-10">
                    <label className="text-xl text-slate-300">Category Name</label>
                    <div className="flex gap-2 w-full relative">
                        <input type="text" placeholder="Write Category Title.." className="outline-none h-9 rounded-lg w-1/2 pl-3 text-sm" value={name} onChange={handleSettingName} />
                        {errorName&&<p className="text-sm text-red-500 absolute top-full ">{errorName}</p>}
                        <button onClick={handleAddingCategory} disabled={submitting.adding === true} className="dark:text-black disabled:opacity-50 dark:hover:bg-slate-200 transition-all duration-150 ease-in-out dark:bg-white py-2 px-3 rounded-lg">Submit</button>
                    </div>
                 </div>
            </div>
            <hr className="bg-zinc-900 border-zinc-900 w-full mt-10"/>
            <div className="w-full h-screen">
                <div className="w-full h-auto flex justify-center"><input value={filterInp} onChange={handleFiltering} className="w-1/2 mx-auto h-9 rounded-lg outline-none pl-3 mt-3 bg-zinc-900" placeholder="Filter">
                </input></div>
                 {isError? <p>Error while fetching the data</p>: data && <div className="relative  overflow-visible w-full shadow-md sm:rounded-lg mt-3">
                        <table className="w-full text-sm overflow-visible text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs overflow-visible text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="overflow-visible">
                                {Array.isArray(data) && (filter.length>0 ? filter :filter.length===0 && filterInp.length>0 ? filter :  data).map(category => <tr key={category.id} className="odd:bg-white overflow-visible odd:dark:bg-zinc-900 relative even:bg-gray-50 even:dark:bg-zinc-800 border-b dark:border-gray-700">
                                    <th  scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-visible relative dark:text-white">
                                        {editMode===category.id ? <input className="h-9 w-52 rounded-lg pl-3 outline-none " type="text" value={newName} onChange={handleSettingNewName} placeholder="Write the new title" />:<p  className="max-w-32 capitalize cursor-pointer text-ellipsis text-nowrap z-10 overflow-hidden">
                                            {category.name}
                                        </p>}
                                    </th>
                                    <td className="px-6 py-4 flex gap-3">
                                        {editMode===category.id ? 
                                             <>
                                                <button onClick={()=>handelEditting(category.id)} disabled={submitting.editing === true} className="py-2 px-3 bg-green-500 disabled:opacity-70 rounded-lg text-white">Save</button>
                                                <button disabled={submitting.editing === true} className="text-red-500 disabled:opacity-70" onClick={
                                                    ()=>{
                                                        setEditMode('')
                                                    }
                                                }>Cancel</button>
                                            </>
                                        :<>
                                            <button onClick={
                                                ()=>{
                                                    setNewName(category.name)
                                                    setEditMode(category.id)
                                                }
                                            } className="text-blue-500 underline">Edit</button>
                                            <button onClick={()=>{
                                                setOpen(true)
                                                setCategoryId(category.id)
                                            }} disabled={submitting.deleting === true} className="text-red-500 disabled:opacity-70 underline">Delete</button>
                                        </>}
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>}
            </div>

        </div>
}
        <ConfirmationMessage open={open} setIsOpen={setOpen} message={message} onConfirm={deleteCategoryFn} />
        </>
    )
}