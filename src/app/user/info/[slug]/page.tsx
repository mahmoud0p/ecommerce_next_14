'use client'
import { Loader } from "@/app/components/LoadingComponent"
import { cartItemsCount, userAtom } from "@/app/state"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useAtom } from "jotai"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CiLogout } from "react-icons/ci"
type User = {
    id:string
    firstName : string , 
    lastName : string ,
    email  :string
}
export default function User (){
    const [user ,setUser] = useAtom(userAtom)

    const [,setCartCount] = useAtom(cartItemsCount)
    const loggingOut = async()=>{
        const response = await axios.post("/api/user")
        return response.data
    }
    const queryClient = useQueryClient()
    const logoutMutation=useMutation({
        mutationFn:async()=>{
            return await  loggingOut()
        } , 
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['userData']})
            router.push('/')
            setCartCount(0)
        }   
    })
    const router = useRouter()
    const {data:userData , isLoading , isError}=useQuery<User>({
        queryKey:['user'] , 
        queryFn:async()=>{
            const {data} = await axios.get('/api/user')
            return data.user
        }
    })
    if(isLoading){
        return <Loader/>
    }
    else if(!userData){
        return router.push('/')
    }else{
        return (
            <div className="h-screen w-full pt-[4rem] px-5">
                <div>
                    <h1 className="text-5xl dark:text-slate-300">
                        User Informations
                    </h1>
                    <Link href={`/user/edit/${userData.id}`} className="dark:bg-white dark:text-black py-1 px-3 rounded-lg bg-slate-300 text-gray-500">update informations</Link>
                </div>
                <div className="mt-5 flex gap-2 items-center justify-start w-full ">
                    <p className="text-lg text-gray-600 ">Name : </p>
                    <p className=" capitalize text-lg dark:text-slate-300">{userData.firstName} {userData.lastName}</p>
                </div>
                <div className="mt-5 flex gap-2 items-center justify-start">
                    <p className="text-lg text-gray-600 ">Email : </p>
                    <p className="text-lg dark:text-slate-300">{userData.email}</p>
                </div>
                <button onClick={()=> {
                                    setUser(null)
                                    logoutMutation.mutateAsync()
                                }} 
                                className="mt-1 text-sm  rounded-xl dark:bg-white dark:text-black items-center justify-center hover:bg-sky-300/10 transition-all duration-150 ease-in-out  w-full p-3 flex gap-1 bg-slate-200"><CiLogout className="w-5 h-5" />
                                    Sign Out
                                </button>
            </div>
        )
    }
}