'use client'
import { SuccessMessage, errorAtom } from "@/app/state"
import { Loader } from "@/app/components/LoadingComponent"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useAtom } from "jotai"
import { ChangeEvent, FormEvent, useState } from "react"

export default function UpdateUser(){
    const[ , setMessage] = useAtom(SuccessMessage)
    const[,setError] = useAtom(errorAtom)
    const [formState , setFormState] = useState({
        firstName : '' , 
        lastName : '' , 
        email : ''  ,
        currentPassword : '' , 
        newPassword :'' , 
        confirmPassword : ''
    })
    const [isSubmitting , setIsSubmitting] = useState(false)
    const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
        const value =e.target.value ;
        const name = e.target.name ;
        setFormState({...formState , [name] : value})
    }
    const { isLoading , isError} = useQuery({
        queryKey:['update_user'] , 
        queryFn:async()=>{
            const {data} = await axios.get('/api/user')
            setFormState({
                lastName:data.user.lastName , 
                firstName:data.user.firstName ,
                email :data.user.email , 
                currentPassword:'' , 
                newPassword:'' ,
                confirmPassword:''
            })
            return data
        }
    })
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn:async()=>{
            const {data} = await axios.put('/api/user' , formState)
            return data
        } , 
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['user']})
            setMessage('informations updated successfuly')
            setIsSubmitting(false)
        } , 
        onError:(err:any)=>{
            setError(err?.response?.data?.error || "An error occured while updating your informations")
            setIsSubmitting(false)
        }
    })
    const handleSubmit = (e:FormEvent)=>{
        e.preventDefault()
        setIsSubmitting(true)
        mutation.mutateAsync()
    }
    if(isLoading){
        return <Loader/>
    }else if(isError){
        return (
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-red-500 text-xl">
                <p>Sorry, its our Mistake we work on fixing it...</p>
            </div>
        )
    }else{
        return (
            <div className="w-full min-h-screen pt-[4rem] px-5 pb-3">
                <h1 className="text-3xl dark:text-slate-300">Update User's Informations</h1>
                <form onSubmit={handleSubmit}>
                    <label className="dark:text-slate-300 text-lg mt-5">First Name</label>
                    <input type="text" placeholder="Enter your the new first name" value={formState.firstName} onChange={handleChange} name="firstName" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    <label className="dark:text-slate-300 text-lg mt-5">Last Name</label>
                    <input type="text" placeholder="Enter your the new last name" value={formState.lastName} onChange={handleChange} name="lastName" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    <label className="dark:text-slate-300 text-lg mt-5">First Name</label>
                    <input type="text" placeholder="Enter your the new email" value={formState.email} onChange={handleChange} name="email" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    {/* password handling */}
                    <h3 className="text-3xl dark:text-slate-300 mt-12 mb-5">Change Password</h3>
                    <label className="dark:text-slate-300 text-lg mt-10">Current Password</label>
                    <input  placeholder="Enter your current password" value={formState.currentPassword} type='password' onChange={handleChange} name="currentPassword" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    <label className="dark:text-slate-300 text-lg mt-5">New Password</label>
                    <input  placeholder="Enter your new password" value={formState.newPassword} type='password' onChange={handleChange} name="newPassword" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    <label className="dark:text-slate-300 text-lg mt-5">Confirm the new password</label>
                    <input  placeholder="Confirm the new password " value={formState.confirmPassword} type='password' onChange={handleChange} name="confirmPassword" className="text-sm h-9 w-full rounded-lg pl-3 dark:border-indigo-900 border outline-none"/>
                    <button type="submit" disabled={isSubmitting} className="w-full disabled:opacity-70 h-12 flex items-center justify-center rounded-lg relative dark:bg-white bg-slate-300 mt-5 text-black ">{isSubmitting ?<Loader/> :"Update"}</button>
                </form>
            </div>
        )
    }
}