import { HiStar } from "react-icons/hi2";

export default function Rating ({rating , mainRating}:{rating : string , mainRating:boolean}){
    const rating_number  = Math.floor(Number(rating))
    return (
        <div className="flex items-center">
            {Array(5).fill(null).map((_ ,i)=>(
                <HiStar key={i} className={`w-5 h-5 ${i < rating_number ?"text-orange-300 dark:text-orange-400" :"text-gray-300  dark:text-gray-500"  }`}/>
            ))}
            {mainRating &&
            <>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">{rating}</p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">out of</p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
            </>
            }
        </div>
    )
}

