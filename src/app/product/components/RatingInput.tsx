import { FormEvent } from "react"

export default function RatingInput ({rating ,setRating} : {rating : number  , setRating:(value:number)=>void}){
    const handleSettingRating = (e:FormEvent<HTMLInputElement>)=>{
        const value = Number(e.currentTarget.value)
        setRating(value)
    }
    return (
        <>
            <div className="flex flex-col" id="rating">
                <label className="text-gray-500">Insert your Rating</label>
                <div className="flex">
                    {Array(5).fill(null).map((_ , i)=>(
                        <label key={i}>
                            <input onChange={handleSettingRating} type="radio"  name="rating" className="hidden" value={i+1} />
                                <svg className={`w-7 h-7 p-[1px] cursor-pointer hover:bg-zinc-900/30  dark:hover:bg-slate-100/20 rounded-md ${i+1 <= rating ?"text-orange-300 dark:text-orange-400" :"text-gray-300  dark:text-gray-500"  }`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                    </svg>
                        </label>
                    ))
                    }
                </div>
            </div>
        </>
        
    )
}