import {  useEffect, useRef } from "react"

export const OutSideClick = ( Callback:()=>void)=>{
        const ref= useRef<HTMLDivElement>(null)

        useEffect(()=>{
            const handeClickOutSide = (event : MouseEvent | TouchEvent)=>{
                if(ref.current && !ref.current.contains(event.target as Node)){
                    Callback()
                }
            }
            document.addEventListener('mouseup' , handeClickOutSide)  
            document.addEventListener('touchend' , handeClickOutSide)  
            return ()=>{
                document.removeEventListener("mouseup" ,handeClickOutSide)
                document.removeEventListener("touchend" ,handeClickOutSide)
            } 
        } ,[Callback])
        return ref
}