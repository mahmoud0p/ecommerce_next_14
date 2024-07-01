'use server'

import { redirect } from "next/navigation" ; 


export const navigateHome = ()=>{
    redirect("/")
}

export const navigateSearch = ()=>{
    redirect("/search")
}
export const navigateProduct =(directory:string)=>{
    redirect(directory)
}

export const navigateCart = ()=>{
    redirect('/cart')
}

export const navigateAdmin = ()=>{
    redirect("/admin/dashboard")
}

export const navigateAddProduct = ()=>{
    redirect('/admin/addproduct')
}