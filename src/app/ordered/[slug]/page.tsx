'use client'
import { Loader } from "@/app/components/LoadingComponent"
import { useQuery } from "@tanstack/react-query"
import { FaCaretDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion"
import axios from "axios"
import { useState } from "react";

export function extractDate(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function numberToWords(num: number): string {
    const belowTwenty = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
    ];

    const tens = [
        "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ];

    const aboveThousand = [
        "", "thousand", "million", "billion", "trillion"
    ];

    if (num < 20) return belowTwenty[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + belowTwenty[num % 10] : '');
    if (num < 1000) return belowTwenty[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');

    let word = '';
    let index = 0;
    while (num > 0) {
        if (num % 1000 !== 0) {
            word = numberToWords(num % 1000) + " " + aboveThousand[index] + (word ? ' ' + word : '');
        }
        num = Math.floor(num / 1000);
        index++;
    }

    return word.trim();
}

interface Order {
    id: string;
    createdAt: string;
    orderItems: { id: string }[];
    price: number;
    payment: string;
    status: string;
    address: string;
}

export default function Orders() {
    const [openFull, setOpenFull] = useState<string | null>(null);
    const { data: orderData, isLoading, isError } = useQuery<Order[]>({
        queryKey: ['userOrder'],
        queryFn: async () => {
            const { data } = await axios.get('/api/order');
            return data;
        }
    });

    if (isLoading) {
        return <Loader />;
    } else if (isError) {
        return (
            <div className="text-red-500 text-lg absolute translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2">
                Oops, our mistake we are working on fixing it
            </div>
        );
    } else if (orderData) {
        return (
            <>
                <div className="w-3/4 mx-auto h-screen pt-[4rem]">
                    <h1 className="dark:text-slate-300 text-3xl">Your Orders</h1>
                    <hr className="dark:bg-zinc-900 dark:border-zinc-900" />
                    {Array.isArray(orderData) && orderData.length > 0 ? <>
                        <h3 className="text-md"><span className="font-bold text-lg text-gray-600">Total Orders:</span> {orderData.length}</h3>
                        <div className="grid grid-flow-row gap-3">
                            {orderData.map((order) => {
                                const address = JSON.parse(order.address) as Record<string,string>;
                                return (
                                    <motion.div key={order.id} initial={{ height: '4rem' }} animate={openFull === order.id ? { height: 'auto' } : { height: '4rem' }} className="px-3 dark:text-slate-300 flex flex-col xl:text-md text-sm gap-3 overflow-hidden w-full dark:border-slate-300/30 border rounded-lg">
                                        <div className="w-full h-auto relative xl:grid-flow-col md:grid-cols-2 grid-cols-1 lg:grid-cols-3 grid">
                                            <p className="text-ellipsis text-nowrap overflow-hidden h-[4rem] flex items-center"><span className="text-gray-600 font-bold">Ordered On:</span> {extractDate(order.createdAt)}</p>
                                            <p className="text-ellipsis text-nowrap overflow-hidden h-[4rem] flex items-center"><span className="text-gray-600 font-bold">Number Of Products:</span> {numberToWords(order.orderItems.length)}</p>
                                            <p className="text-ellipsis text-nowrap overflow-hidden h-[4rem] flex items-center"><span className="text-gray-600 font-bold">Total Price:</span> ${order.price}</p>
                                            <p className="text-ellipsis text-nowrap overflow-hidden h-[4rem] flex items-center mx-2"><span className="text-gray-600 font-bold">Payment:</span> <span className={`${order.payment === "success" ? 'text-green-500 font-bold bg-green-500/30' : 'text-red-500 bg-red-500/30 font-bold'} py-1 px-3 rounded-md`}>{order.payment}</span></p>
                                            <p className="text-ellipsis text-nowrap overflow-hidden h-[4rem] flex items-center mx-2"><span className="text-gray-600 font-bold">Arrived:</span> <span className={`${order.status === "done" ? 'text-green-500 font-bold bg-green-500/30' : 'text-red-500 bg-red-500/30 font-bold'} py-1 px-3 rounded-md`}>{order.status}</span></p>
                                            <button  onClick={() => {
                                                if (openFull === order.id) {
                                                    setOpenFull(null);
                                                } else {
                                                    setOpenFull(order.id);
                                                }
                                            }} className="dark:text-slate-300 xl:relative xl:top-[2rem] xl:right-0 absolute top-[2rem] right-3 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-slate-300/30 flex items-center justify-center ">
                                                <FaCaretDown />
                                            </button>
                                        </div>
                                        <div className="h-[16rem]">
                                            <AnimatePresence>
                                                {openFull === order.id &&
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-2">
                                                        <h3 className="text-xl">Address</h3>
                                                        <hr className="dark:bg-zinc-900 dark:border-zinc-900" />
                                                        <div className="grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-3">
                                                            {Object.entries(address).map(([key, value]) => (
                                                                <p key={key}><span className="font-bold text-gray-600">{key}: </span>{value}</p>
                                                            ))}

                                                        </div>
                                                    </motion.div>
                                                }
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </> :
                        <div>
                            Sorry, cannot find any orders
                        </div>
                    }
                </div>
            </>
        );
    }
}
