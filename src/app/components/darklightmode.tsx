"use client"
import { useCallback } from "react"
import { BsSun } from "react-icons/bs";
import { BsMoonStars } from "react-icons/bs";

import {useTheme } from "next-themes";

export const DarkModeButton = ()=>{
    const {theme , setTheme ,systemTheme} = useTheme()
    const handleSettingDark = useCallback(()=>{
        setTheme('dark')
    } , [])
    const handleSettingLight = useCallback(()=>{
        setTheme('light')
    } , [])
    return(
        <button
          onClick={ theme === "light" ? handleSettingDark : handleSettingLight}
          className={`inline-flex dark:bg-slate-300 dark:text-black bg-black dark:shadow-black mt-2 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`}
        >
          {theme === 'dark' ? 
          <BsSun className="h-5 w-5 dark:text-black text-slate-300"/>
            :<BsMoonStars className="h-5 w-5 dark:text-black text-slate-300"/>
          }<span className="ml-2 dark:text-black text-slate-300 font-bold first:">Toggle Theme</span>
        </button>
    )
}