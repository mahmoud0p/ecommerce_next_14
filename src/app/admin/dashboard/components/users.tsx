import { SuccessMessage, errorAtom, userAtom } from "@/app/state";
import { Loader } from "@/app/components/LoadingComponent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useAtom } from "jotai";
import { FormEvent, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { ConfirmationMessage } from "./Products";
import _ from "lodash"
export const Users = ()=>{
    const [open ,setOpen ] = useState(false)
    const [userId , setUserId] = useState('')
    const [ , setMessage] = useAtom(SuccessMessage)
    const [ , setError] = useAtom(errorAtom)
    const [user_] = useAtom(userAtom)
    const [filterInput , setInputFilter] = useState('')
    const [filteredUsers , setFilteredUsers] = useState<any[]>([])
    const {isLoading ,data } =useQuery({
        queryKey:['users'] , 
        queryFn:async()=>{
            const response  = await axios.get('/api/users') ;
            return response.data
        }
    })
    const queryClient  = useQueryClient()
    const mutation = useMutation({
        mutationFn:async()=>{
            const response = await axios.delete(`/api/users?userId=${userId}`)
            return response.data
        } , 
        onSuccess:()=>{
            setMessage('User Deleted successfuly')
            queryClient.invalidateQueries({queryKey:['users']})
            setOpen(false)
        } , 
        onError:(err:any)=>{
            setOpen(false)
            setError(err?.response?.data?.error || 'An error occured while deleting the user..')
        }
    })
    const handleDeleting = ()=>{
        mutation.mutateAsync()
    }
    const handleFiltering = (e:FormEvent<HTMLInputElement>)=>{
        const value = e.currentTarget.value ;
        const value_lower = value.toLowerCase() ; 
        setInputFilter(value)
        const filtered =_.filter(data , (user)=>{
            return user.firstName.toLowerCase().includes(value_lower) || user.lastName.toLowerCase().includes(value_lower) || user.email.toLowerCase().includes(value_lower)
        })
        setFilteredUsers(filtered)
    }
    return (
        <>
        {isLoading ? <Loader/> :
            <div className="w-1/2 p-4 flex flex-col overflow-visible items-center">
                <div className="grid grid-cols-2 w-full">
                    <h1  className="text-3xl w-max text-black dark:text-slate-300">Users</h1>
                    <div className="flex relative items-center h-full ">
                        <input value={filterInput} onChange={handleFiltering} type="text" className="w-full shadow-md dark:shadow-black/80 border border-slate-300 bg-slate-200 text-sm dark:border-zinc-800 dark:bg-zinc-900 h-9 rounded-lg outline-none pl-3" placeholder="Filter users by name or email.." />
                    </div>
                </div>
                <div className="relative  overflow-visible w-full shadow-md sm:rounded-lg mt-3">
                    <table className="w-full text-sm overflow-visible text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs overflow-visible text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Name
                                </th>
                                
                                <th scope="col" className="px-6 py-3">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="overflow-visible">
                            {data && Array.isArray(data) && (filteredUsers.length > 0 ? filteredUsers : filteredUsers.length === 0 && filterInput.length > 0 ? filteredUsers:data).map(user => <tr key={user.id} className="odd:bg-white overflow-visible odd:dark:bg-zinc-900 relative even:bg-gray-50 even:dark:bg-zinc-800 border-b dark:border-gray-700">
                                <th  scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-visible relative dark:text-white">
                                    <p  className="max-w-32 cursor-pointer text-ellipsis text-nowrap z-10 overflow-hidden">{user.firstName} {user.lastName}</p>
                                </th>

                                <td className="px-6 py-4">
                                    <p>{user.email}</p>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button 
                                    onClick={()=>{
                                        setOpen(true)
                                        setUserId(user.id)
                                    }
                                    }
                                    disabled ={user_?.email === user.email}
                                    className="text-red-500 disabled:opacity-70 underline">Delete</button>
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>}
            <ConfirmationMessage open={open} setIsOpen={setOpen} message="Are you sure to detete this user?" onConfirm={()=>{handleDeleting()}} />
        </>
    )
}