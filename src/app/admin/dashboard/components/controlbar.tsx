'use client'
import { IoHome } from "react-icons/io5";
import { AiFillProduct } from "react-icons/ai";
import { BiSolidCategory } from "react-icons/bi";
import { MdCategory } from "react-icons/md";
import { motion } from "framer-motion";
import { useState } from "react";
import { navigateAddProduct, navigateHome } from "@/actions";
import Link from "next/link";
import { AddCarousel } from "./AddCarousel";

export default function ControlBar() {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [openModule , setOpenModule] = useState(false)

    return (
        <>
            <motion.aside 
                whileHover={{ width: "15rem" }} 
                onMouseEnter={() => setOpen(true)} 
                onMouseLeave={() => { setOpen(false); setExpanded(false); }} 
                onAnimationComplete={() => setExpanded(open)} 
                initial={{ width: "3rem" }} 
                className="absolute group overflow-hidden h-full min-h-screen pt-3 flex flex-col items-center gap-1 top-0   left-0  "
            >
                {[
                    { icon: <IoHome className="w-7 h-7" />, label: "Home"  , href:"/" }, 
                    { icon: <AiFillProduct className="w-7 h-7" />, label: "Add Product",href:"/admin/addproduct" } , 
                    { icon: <BiSolidCategory className="w-7 h-7" />, label: "Add Category"  , href:"/category" },
                    { icon: <MdCategory className="w-7 h-7" />, label: "Add Subcategory" , href:"/subcategory" }
                ].map((item, index) => (
                    <motion.div 
                        key={index}
                        initial={{ justifyContent: "center" }} 
                        
                        animate={open ? { justifyContent: "start" } : { justifyContent: "center", transition: { delay: 0.25 } }} 
                        className="w-[90%] rounded-xl flex  relative items-center"
                    >
                        <Link href={item.href ? item.href : "#"} className="hover:bg-white hover:text-black rounded-lg px-2 transition-all duration-150 ease-in-out py-2 w-full h-full">
                            {item.icon}
                            {expanded && (
                                <span  className="left-10 text-nowrap top-1/2 text-lg absolute -translate-y-1/2 transition-opacity duration-300">
                                    {item.label}
                                </span>
                            )}
                        </Link>

                    </motion.div>
                ))}
                <button onClick={()=>{
                    setOpenModule(true)
                }} className='w-full text-nowrap text-ellipsis overflow-hidden px-3 py-2 dark:bg-black bg-slate-200   mx-3'>Add Carousel</button>
            </motion.aside>
            <AddCarousel openModule={openModule} setOpenModule={setOpenModule}/>
        </>
    );
}
