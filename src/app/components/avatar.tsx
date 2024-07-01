'use client'
import {  cartItemsCount, userAtom } from "@/app/state"
import {  useAtom } from "jotai"
import {AnimatePresence, motion} from "framer-motion"
import { useState } from "react"
import { OutSideClick } from "./outsideClick"
import { CiLogout } from "react-icons/ci";
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { RiAdminFill } from "react-icons/ri";
import Link from "next/link"

export default function Avatar (){
    const [user ,setUser] = useAtom(userAtom)
    const [open , setOpen] = useState(false)
    const [,setCartCount] = useAtom(cartItemsCount)
    const queryClient = useQueryClient()

    const handleOpen  = ()=>{
        setOpen(true)
    }
    const handleClose = ()=>{
        setOpen(false)
    }
    const ref = OutSideClick(()=>{
        handleClose()
    })
    const loggingOut = async()=>{
        const response = await axios.post("/api/user")
        return response.data
    }
    const logoutMutation=useMutation({
        mutationFn:async()=>{
            return await  loggingOut()
        } , 
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['userData']})
            setCartCount(0)
        }   
    })
    const [userInfo]  = useAtom(userAtom)
    return (
        <AnimatePresence>
            {user&&<motion.div initial={{translateX:'100%' , opacity:0}} animate={{translateX:0 , opacity:1} }  className="w-10 h-10 relative mx-auto">
                    <button onClick={handleOpen} className="rounded-full mx-auto bg-white flex items-center cursor-pointer hover:bg-slate-200 transition-all duration-150 ease-linear justify-center   ring-2 ring-black/30 w-full h-full ring-offset-2 ring-offset-white dark:ring-offset-darkgreen dark:bg-slate-300 dark:hover:bg-slate-200  dark:ring-slate-300/30 dark:text-black  uppercase  text-zinc-400 text-lg">{user?.firstName[0]}{user?.lastName[0]}</button>
                    <AnimatePresence>
                        {open && <motion.div ref={ref} initial={{translateY:10 , opacity:0 , scaleX:0.9}} animate={{translateY:0 , opacity:1 , scaleX:1} } exit={{translateY:10 , opacity:0 , scaleX:0.9}} className={`absolute border-2  dark:border-zinc-900 border-slate-300 top-full w-52 min-h-14 p-2 bg-white right-0 z-[100] shadow-lg dark:shadow-black/80 rounded-lg dark:text-white text-black dark:bg-mainDark `}>
                        
                                <Link onClick={handleClose} href={`/user/info/${user.id}`} className="w-full h-12 flex items-center justify-center bg-slate-100 rounded-lg dark:bg-zinc-900 b">{user?.email}</Link>
                                {userInfo?.role === "ADMIN" &&<Link onClick={handleClose} href="/admin/dashboard" 
                                    className="mt-1 text-sm  rounded-xl hover:bg-sky-300/10 transition-all duration-150 ease-in-out  w-full p-3 flex gap-1 justify-start  items-center">
                                    <RiAdminFill className="dark:text-white/80"/>
                                    Admin Dashboard
                                </Link>}
                                <button onClick={()=> {
                                    setUser(null)
                                    logoutMutation.mutateAsync()
                                    setOpen(false)
                                }} 
                                className="mt-1 text-sm  rounded-xl hover:bg-sky-300/10 transition-all duration-150 ease-in-out  w-full p-3 flex gap-1 justify-start  items-center"><CiLogout className="w-5 h-5" />
                                    Sign Out
                                </button>
                        </motion.div> }  
                    </AnimatePresence>
            </motion.div>}
        </AnimatePresence>
    )
}