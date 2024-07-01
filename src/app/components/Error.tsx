import { errorAtom } from "@/app/state"
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai"
import { useEffect, useState } from "react";
import { MdOutlineError } from "react-icons/md";
import {motion} from "framer-motion"
export default function Error(){
    const [error ,setError ] = useAtom(errorAtom)
    const [stick , setSticky] = useState(false)
    useEffect(()=>{
        const handleScroll = ()=>{
            if(window.scrollY > 4*16){
                setSticky(true)
            }else{
                setSticky(false)
            }
        }
        window.addEventListener('scroll' , handleScroll)
        return ()=>{
            window.removeEventListener("scroll" , handleScroll)
        }
    }, [])
    useEffect(()=>{
        if(error){
            setTimeout(()=>{
                setError(null)
            } , 4500)
        }
    } , [error])
    return (
        <AnimatePresence>
            {error && <motion.div initial={{opacity:0 , translateY:-10 , translateX:'50%' , scaleX:0.9}} animate={{opacity:1 , translateY:0 , translateX:'50%' , scaleX:1}} className={`w-max max-w-full z-[2000] px-10 gap-1 text-lg justify-center items-center flex text-red-500 h-[3rem] dark:border-2 border-red-500 shadow-lg dark:shadow-black/30 rounded-xl  right-1/2  dark:bg-zinc-900 bg-slate-200 ${stick ? "fixed top-1" : "absolute top-[4rem]"}`}>
                <MdOutlineError />
                {error}
            </motion.div>}
        </AnimatePresence>
        
        
    )
}