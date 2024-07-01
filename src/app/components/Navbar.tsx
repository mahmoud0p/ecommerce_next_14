'use client';
import { FormEvent, KeyboardEvent, Suspense, memo, useCallback, useState } from 'react';
import { CiSearch } from "react-icons/ci";
import { AiOutlineShoppingCart, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import { CgMenuRight } from "react-icons/cg";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import dynamic from "next/dynamic";
import { DarkModeButton } from "./darklightmode";
import { Loader } from "./LoadingComponent";
import Avatar from './avatar';
import { useAtom } from 'jotai';
import { cartItemsCount, searchLoading,  userAtom } from '@/app/state';
import axios from 'axios';
import {  useQuery } from '@tanstack/react-query';
import { token } from './token';
import { useRouter } from 'next/navigation';
import { AnimatePresence , motion } from 'framer-motion';
import { OutSideClick } from './outsideClick';

const Drawer = dynamic(() => import("./drawer"), {
  suspense: true,
});

const Navbar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openMenu ,setOpenMenu] = useState(false)
  const [user , setUser] = useAtom(userAtom)
  const [search , setSearch ] = useState("")
  const [loading, setLoading] = useAtom(searchLoading)
  const [cartCount , setCartCount] = useAtom(cartItemsCount)
  const ref = OutSideClick(()=>{
    setOpenMenu(false)
  })
  const router = useRouter()
    const getUser = async()=>{
        try{
          const response = await axios.get(`/api/user`)
          setUser(response.data.user)
          return response.data  
        }catch(error:any){
            console.log(error.message)
        }
    }
    const {isLoading } = useQuery({
        queryKey:['userData'] , 
        queryFn:async () =>{ return await getUser()},
        enabled:!!token , 
        refetchOnWindowFocus:false , 
        refetchOnReconnect:false
    })
  const handleOpenDrawer = useCallback(() => {
    setOpenDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);
  const settingSearch = (e:FormEvent<HTMLInputElement>)=>{
    const value = e.currentTarget.value ;
    setSearch(value)
  }
  
  const handleClickingEnter  = (e : KeyboardEvent)=>{
    if(e.key ==="Enter"){
      handleSearchFunction()
    }
  }
  const handleSearchFunction  =()=>{
    if(!search){
      return
    }
    router.push(`/search?query=${search}`)
    setLoading(true)
  }
  useQuery({
    queryKey:['cartQuantity'] , 
    queryFn: async()=>{
      const response = await axios.get(`/api/cart?cartQuantity=${true}`)
      setCartCount(response?.data?.number || 0)
      return response.data
    } , 
    enabled:!!token  , 

  })
  return (
    <nav className="h-[3.5rem] z-[100] absolute inset-0 bg-transparent border-b dark:border-b-zinc-900 text-black  md:gap-0 items-center grid sm:flex md:grid grid-cols-2 sm:grid-cols-3 w-full dark:text-slate-300 text-md">
      <div className="flex sm:justify-start sm:w-1/4 md:w-full gap-2 items-center px-5">
        <button onClick={handleOpenDrawer}>
          <HiOutlineMenuAlt2 className="text-black dark:text-slate-300 md:h-7 md:w-7 h-5 w-5" />
        </button>
        <Link
          href="/"
          className="sm:flex md:mx-auto lg:text-lg h-full md:text-sm text-xl  font-tiny   transition-all duration-100 ease-linear"
        >
          EShop
        </Link>
      </div>
      <div className="md:w-full sm:w-[40%] hidden sm:flex items-center justify-center relative">
        <input
          autoCorrect="false"
          autoComplete="off"
          name="search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={settingSearch}
          onKeyUp={handleClickingEnter}
          className="w-full h-9 text-black border text-sm border-black dark:border-slate-300 dark:focus:outline-slate-300  dark:bg-zinc-900 bg-white dark:text-slate-300 rounded-full pl-5 focus:outline-[2px] focus:outline-offset-4 focus:outline-white transition-all duration-100 ease-in-out outline-none"
        />
        <button disabled={loading} onClick={handleSearchFunction} className="absolute border-l border-black px-2 box-border dark:border-slate-300 disabled:opacity-20 right-1">
          <CiSearch className="text-black dark:text-slate-300 h-7 w-7 z-10" />
        </button>
      </div>
      <div className="hidden sm:grid sm:flex-1 lg:p-0 px-2 grid-cols-3 gap-3 h-full items-center">
        <Link href={user? `/ordered/${user.id} ` : '/login'} className="hover:bg-white/10 flex items-center justify-center dark:text-slate-300 text-xs md:text-sm lg:text-lg h-3/4 w-3/4 mx-auto rounded-lg">
          Orders
        </Link>
        <Link href="/cart" className="md:w-full md:h-12 relative dark:text-slate-300 h-10 w-10 mx-auto flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-150 ease-in-out">
          <AiOutlineShoppingCart className="md:h-7 md:w-7 h-6 w-6" />
          <div className='w-4 h-4 text-sm top-1 ring-1 ring-black dark:ring-zinc-900 md:right-4 sm:right-0 lg:right-1/3 bg-white text-black flex justify-center items-center absolute rounded-full'>
            {cartCount || 0}
          </div>
        </Link>
        {isLoading ? <div className='relative w-full h-full'><Loader/></div>:user ? <Avatar/> :<Link
          href="/login"
          className="dark:bg-white bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-200 text-xs md:text-sm lg:text-md xl:text-lg text-black w-full lg:w-3/4 h-3/4 rounded-lg shadow-md mx-auto transition-all duration-100 ease-linear flex items-center justify-center"
        >
          Account
        </Link>}
      </div>
      <div className="flex justify-end relative px-5 items-center sm:hidden">
        <button onClick={()=>{setOpenMenu(!openMenu)}} className="items-center justify-center w-7 h-7">
          <CgMenuRight className="text-black dark:text-slate-300 h-full w-full" />
        </button>
        <AnimatePresence>
          {openMenu &&
            <motion.div ref={ref} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className='w-[200%] h-auto overflow-hidden absolute top-full p-4 right-0 bg-slate-300 dark:bg-zinc-900 shadow-md z-[2000] flex flex-col gap-2'>
                <Link onClick={()=>{setOpenMenu(false)}} href={user? `/ordered/${user.id} ` : '/login'} className="hover:bg-white/10 flex items-center  dark:text-slate-300 text-xs dark:bg-zinc-800 bg-slate-200 md:text-sm lg:text-lg h-9 px-3 w-full mx-auto rounded-lg">
                  Orders
                </Link>
                <Link href="/cart" onClick={()=>{setOpenMenu(false)}} className="hover:bg-white/10 flex items-center  dark:text-slate-300 text-xs dark:bg-zinc-800 bg-slate-200 md:text-sm lg:text-lg h-9 px-3 w-full mx-auto rounded-lg">
                  Cart({cartCount || 0})
                </Link>
                <Link href={user ? `/user/info/${user.id}`:'/login'} onClick={()=>{setOpenMenu(false)}} className="hover:bg-white/10 flex items-center  dark:text-slate-300 text-xs dark:bg-zinc-800 bg-slate-200 md:text-sm lg:text-lg h-9 px-3 w-full mx-auto rounded-lg">
                  {user ? "User" : "Account"}
                </Link>
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <Suspense fallback={<Loader />}>
        <Drawer setOpenDrawer={setOpenDrawer} openDrawer={openDrawer}>
          <button
            onClick={handleCloseDrawer}
            className="absolute right-1 top-1 rounded-full hover:rotate-180 transition-all duration-300 text-red-500"
          >
            <AiOutlineClose className="w-7 h-7" />
          </button>
          <div className='xl:flex  items-center gap-2 w-full '>
            <p className="text-black dark:text-white md:text-xl sm:text-md text-sm">Screen Theme</p>
            <DarkModeButton />
          </div>
        </Drawer>
      </Suspense>
    </nav>
  );
};

export default memo(Navbar);