import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import _ from "lodash"
import { useRouter } from "next/navigation";
type Subcategory = {
    id:string ,
    title:string
}
type Category = {
    id:string ,
    title : string ,
    subcategories: Subcategory[]
}
export const Categories = ()=>{
    const [categoriesOpen  ,setCategoriesOpen] = useState<string[]>([])
    const {data , isLoading , isError} =useQuery<Category[]>({
        queryKey:['drawer_categories'] , 
        queryFn:async()=>{
            const {data} = await axios.get('/api/categorysubcategory')
            return data
        }
    })
    const router = useRouter()
    const setOpen = (categoryId:string)=>{
        if(categoriesOpen.includes(categoryId)){
             const filtered= _.filter(categoriesOpen , (c)=>{
                return c !== categoryId
            })
            setCategoriesOpen(filtered)
        }else{
            setCategoriesOpen(prev=>[...(prev||[]) , categoryId])
        }
    }
    if(isLoading){
        return <span className="dark:text-white text-sm mt-5">
            Loading...
        </span>
    }
    else if(isError){
        return <p className="text-red-500 text-sm ">Sorry, our mistake we are working on fixing it..</p>
    }
    if(data && data.length > 0){
        return (
            <div className="w-full grid grid-flow-row mt-5">
                <h3 className="text-xl font-bold text-gray-600 mb-3">Categories</h3>
                {data.map(c=>(
                    <>
                        <div onClick={()=>{setOpen(c.id)}} key={c.id} className="w-full h-9  px-3 relative flex items-center hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all duration-150 cursor-pointer">
                            <span className="text-gray-600">{c.title}</span>
                            <FaChevronRight className="absolute right-3 dark:text-slate-300 rotate-90" />

                        </div>
                        <hr  className="dark:bg-zinc-800 dark:border-zinc-800"/>
                        {categoriesOpen.includes(c.id) && <div className="my-3">
                            {c.subcategories && <div className="w-full h-9">
                                {c.subcategories.map(s=>(
                                    <div onClick={()=>{
                                        router.push(`/products/${s.title}`)
                                    }} className="dark:text-slate-300 pl-5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 flex items-center cursor-pointer w-full h-full text-sm " key={s.id}>
                                        <p>{s.title}</p>
                                    </div>
                                ))
                                }
                            </div>}
                        </div>}
                    </>
                ))

                }
            </div>
        )

    }else{
        return <p>Sorry, No categories to show..</p>
    }
}