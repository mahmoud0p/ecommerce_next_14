import { Loader } from "@/app/components/LoadingComponent";
import { extractDate } from "@/app/ordered/[slug]/page";
import { SuccessMessage, errorAtom } from "@/app/state";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import { useState } from "react";

export const Order = () => {
    const [sortOrder, setSortOrder] = useState('desc');
    const [ , setMessage] = useAtom(SuccessMessage) ; 
    const [,setError]  = useAtom(errorAtom)
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['admin_orders', sortOrder],
        queryFn: async () => {
            const { data } = await axios.get(`/api/orderAdmin?sort=${sortOrder}`);
            return data;
        },
        
    });
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn:async(orderId:string)=>{
            const {data} = await axios.put(`/api/orderAdmin?id=${orderId}`)
            return {data}
        } , 
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['admin_orders']})
            setMessage('Order arrived 🥳')
        } , 
        onError:(err:any)=>{
            setError(err?.response?.data?.error || 'An error occured while setting order to be arrived 😓')
        }
    })
    const handleSortChange = (order: 'asc' | 'desc') => {
        setSortOrder(order);
    };

    if (isLoading) {
        return <Loader />;
    } else if (isError) {
        return (
            <div className="text-red-500 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-xl">
                Oops, Our mistake we are working on fixing it
            </div>
        );
    }
    const handleSetArrived = (orderId:string)=>{
        mutation.mutateAsync(orderId)
    }
    return (
        <>
            <div className="flex justify-between mb-4 mt-5">
                <div className="grid grid-cols-2 w-full items-center">
                    <h1 className="text-3xl dark:text-slate-300">Orders</h1>
                    <button
                        onClick={() => handleSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className=" py-2 w-72 dark:bg-white dark:text-black bg-blue-500 text-white rounded"
                    >
                        Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
                    </button>
                </div>
            </div>
            {orders.length > 0 ? (
                <div>
                    <table className="w-full text-sm overflow-visible text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs overflow-visible text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Payment
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="overflow-visible">
                            {orders && Array.isArray(orders) && orders.map((order: any) => (
                                <tr key={order.id} className="odd:bg-white overflow-visible odd:dark:bg-zinc-900 relative even:bg-gray-50 even:dark:bg-zinc-800 border-b dark:border-gray-700">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-visible relative dark:text-white">
                                        <p className="max-w-32 cursor-pointer text-ellipsis text-nowrap z-10 overflow-hidden">{extractDate(order.createdAt)}</p>
                                    </th>
                                    <td className="px-6 py-4">
                                        <p>${order.price}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{order.payment}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{order.status}</p>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button
                                            disabled={order.status === "done"}
                                            className="text-blue-500 disabled:opacity-30 underline"
                                            onClick={() => handleSetArrived(order.id)}
                                        >
                                            Set Arrived
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                orders.message && (
                    <>
                        {orders.message}
                    </>
                )
            )}
        </>
    );
};


