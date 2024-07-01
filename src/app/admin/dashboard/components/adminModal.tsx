import { isAdminAtom } from "@/app/state"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useAtom } from "jotai"
import { FormEvent, useState } from "react"

export default function AdminModal (){
    const [id , setId] =useState('')
    const [,setIsAdmin] =useAtom(isAdminAtom)
    const [password , setPassword] = useState('')
    const fetchAdmin = async()=>{
        const response = await axios.post("/api/admin" , {id , password})
        return response.data
    }
    const mutation = useMutation({
        mutationFn:async()=>{
            return await fetchAdmin()
        } , 
        onSuccess:(data:any)=>{
            if(data.role === 'ADMIN'){
                setIsAdmin(true)
            }
        }
    })
    const onSubmit =(e:FormEvent)=>{
        e.preventDefault()
        mutation.mutateAsync()
    }
    const handleSettingId = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setId(value)
    }
    const handleSettingPassword = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ; 
        setPassword(value) ; 
    }
    return (
        <form onSubmit={onSubmit} className="absolute top-1/2 w-96 flex-col gap-3 flex items-center justify-center p-4 rounded-xl shadow-xl right-1/2 translate-x-1/2 -translate-y-1/2 border-slate-200 border-2 dark:border-zinc-900 dark:bg-zinc-900 h-96">
            <h1 className="text-2xl text-red-500">Admin Login</h1>
            <input value={id} autoComplete="off" onChange={handleSettingId} type="text" name="id" placeholder="Enter your id..." className=" w-full h-9 border border-black dark:border-slate-300 rounded-lg pl-3 outline-none shadow-inner shadow-black/30"  required/>
            <input value={password} onChange={handleSettingPassword} type="password" placeholder="Enter your password..." className=" w-full h-9 border border-black dark:border-slate-300 rounded-lg pl-3 outline-none shadow-inner shadow-black/30"  required/>
            <button type="submit" className="dark:text-white text-black">Submit</button>
        </form>
    )
}