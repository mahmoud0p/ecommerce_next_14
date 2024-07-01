'use client'
import { useState } from "react"
import ProductTable from "./Products"
import { Users } from "./users"
import { Order } from "./order"

export default function AdminTabs(){
    const [active , setActive] =useState("products")
    const handleSettingActive = (tab:string)=>{
        setActive(tab)
    }
    return (
        <div className="w-full min-h-screen h-auto flex flex-col justify-start items-center mt-[3.5rem]">
            <nav className="w-1/3 mt-[1rem] h-[3rem] relative bg-slate-200 flex items-center justify-center text-black dark:bg-zinc-900  rounded-xl">
                <div className="relative w-full grid grid-cols-3   justify-center h-full gap-3 items-center">
                    <button onClick={()=>{handleSettingActive("products")}} className={`z-[2] ${active==="products" ? "dark:text-slate-300 text-black  underline    w-max  mx-auto px-3 py-1 rounded-xl transition-all duration-300 ease-in" : " text-black/50 dark:text-white/50 "} hover:underline `}>Products</button>
                    <button onClick={()=>{handleSettingActive("users")}} className={`z-[2] ${active==="users" ? "dark:text-slate-300 underline  text-black w-max  mx-auto px-3 py-1 rounded-xl transition-all duration-300 ease-in" : " text-black/50 dark:text-white/50 "} hover:underline`}>Users</button>
                    <button onClick={()=>{handleSettingActive("orders")}} className={`z-[2] ${active==="orders" ? "dark:text-slate-300 underline    text-black w-max  mx-auto px-3 py-1 rounded-xl transition-all duration-300 ease-in" : " text-black/50 dark:text-white/50 "}  hover:underline`}>Orders</button>
                </div>
            </nav>
            {active === 'products' && 
                <ProductTable/>
            }
            {active === 'users' && 
                <Users/>
            }
            {
                active === "orders" && 
                <Order/>
            }

        </div>
    )
} 