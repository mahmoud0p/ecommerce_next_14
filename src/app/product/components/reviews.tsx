import { Loader } from "@/app/components/LoadingComponent"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Rating from "./Rating"
import { useAtom } from "jotai"
import { reviewsCount } from "@/app/state"

export default function Reviews({productId}:{productId:string}){
    const [,setReviewsCount] = useAtom(reviewsCount)
    const {data  ,isLoading , isError} = useQuery({
        queryKey:['productReviews', productId] , 
        queryFn:async()=>{
            const response = await axios.get(`/api/review?id=${productId}`)
            setReviewsCount(response.data.length)
            return response.data
        }
    })
    return (
        <>
            {isLoading ? <Loader/> :
            <>
                {isError ? (<p>Sorry, Its our mistake we are working to fix it..</p>) :
                    <div className="min-h-screen w-full px-5 py-3">
                        <h1 className="dark:text-slate-300 text-black text-3xl ">All Reviews <span className="text-sm underline text-gray-400">{data.length} {data.length > 1 ? "reviews" : "review"}</span></h1>
                        {data.length === 0  ?
                        <p>
                            Sorry, No reviews yet to show..
                        </p> :
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
                            {Array.isArray(data) && data.map((review) => (<div className="h-72 p-3 border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 rounded-lg shadow-md dark:shadow-black/80" key={review.id}>
                                    <div className="w-full grid grid-cols-2 items-center">
                                        <p className=" capitalize dark:text-slate-300 text-xl">{review.user.firstName} {review.user.lastName}</p>
                                        <div className="flex items-center justify-end">
                                            <Rating mainRating={false} rating={review.rating}/>
                                        </div>
                                    </div>
                                    <p className="dark:text-white text-zinc-900   h-2/3 rounded-lg p-4">
                                        {review.content}
                                    </p>
                            </div>))}
                        </div>

                        }
                    </div>
                }
            </>
            }
        </>
    )
}