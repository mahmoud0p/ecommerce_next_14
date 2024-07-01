import { SuccessMessage, errorAtom, userAtom } from "@/app/state"
import { useAtom } from "jotai"
import RatingInput from "./RatingInput"
import { FormEvent, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export default function AddingReview ({productId} : {productId : string}){
    const [user] = useAtom(userAtom)
    const [rating , setRating] = useState(1)
    const [content , setContent] = useState('')
    const [ , setMessage] = useAtom(SuccessMessage)
    const [ , setError] = useAtom(errorAtom)
    const queryClient = useQueryClient()
    const handleSettingContent  = (e:FormEvent<HTMLTextAreaElement>)=>{
        const value =e.currentTarget.value ;
        setContent(value)
    }
    const PostMutation  = useMutation({
        mutationFn:async()=>{
            const response = await axios.post(`/api/review` , {content , rating , productId })
            return response.data
        }
        ,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["productReviews"]})
            queryClient.invalidateQueries({queryKey:["advancedRating"]})
            setContent('')
            setRating(1)
            setMessage("Your Review Submitted successfuly")
        } , 
        onError:(error:any)=>{
            setError(error.response.data.error)
        }
    })
    const onSubmit = ()=>{
        PostMutation.mutateAsync()
    }
    return (
        <div className="w-full h-auto gap-3 flex flex-col p-5">
            <h3 className="text-3xl dark:text-slate-300 ">Adding Review</h3>
            <hr  className="bg-zinc-900 border-zinc-900"/>
            {user ? <p className="text-xl dark:text-slate-300 capitalize">{user.firstName} {user.lastName}</p> : <p className="text-xl dark:text-slate-300 capitalize">User's Name</p> }
            <RatingInput rating={rating} setRating={setRating}/>
            <div className="flex flex-col">
                <label className="text-gray-500">Write your review</label>
                <textarea value={content} onChange={handleSettingContent}  placeholder="Share Your Thoughts.." className="outline-none h-52 border-2 border-gray-400 rounded-lg p-3"/>
            </div>
            <button onClick={onSubmit} className="border-2 rounded-lg text-gray-500 border-gray-500 dark:border-indigo-900 dark:text-indigo-900 mx-auto w-1/2 py-2">Submit Review</button>
        </div>
    )
}