'use client'
import {motion} from "framer-motion"
import Link from "next/link";
import {memo, useEffect, useState} from "react"
import { Formik } from "formik";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {  errorAtom, userAtom } from "../state";
import { useRouter } from "next/navigation";
type Errors = {
    email ?:string , 
    password? : string , 
}
type User  = {
    email :string , 
    password : string,
}
export default function Login (){
    const [ , setError] = useAtom(errorAtom)
    const [isSubmitting , setIsSubmitting ] = useState(false)
    const router = useRouter()
    const loggUser = async (userData:User)=>{
        const response = await axios.post('/api/login' , userData)
        return response.data
    }
    const [user , setUser] = useAtom(userAtom)
    const mutation = useMutation({
        mutationFn:async(userData:User)=>{
            return await loggUser(userData)
        } , 
        onSuccess:(data:any)=>{
            setUser(data.user)
            setIsSubmitting(false)
            router.push('/')
        } , 
        onError: async(error: any) => {
            setIsSubmitting(false);
            const errorMessage = error.response?.data?.error || "An error occurred";
            setError(errorMessage);
          },

    })
    const handleSubmitting = (values:User )=>{
        setIsSubmitting(true)
        const userData = {
            email :values.email ,
            password : values.password
        }
        mutation.mutateAsync(userData)
    }
    
        if(user){
            return router.push('/')
        }
        else return (
            <div className="w-full h-screen flex justify-center items-center">
    
                <Formik initialValues={{email : '' , password:''}} validate={
                    (values )=>{
                        const errors : Errors  = {}
                        if(!values.email){
                            errors.email = 'email can not be empty'
                        }
                        else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                          ) {
                            errors.email = 'Invalid email address';
                          }
                        if(!values.password){
                            errors.password = "Password cannot be empty"
                        }
                        return errors
                    }
                }
                    onSubmit={(values)=>{handleSubmitting(values)}}
                >
                    {({values , errors , touched ,handleChange , handleBlur , handleSubmit})=>(
                        <motion.form onSubmit={handleSubmit} initial={{translateY:'-100%' , opacity:0}} animate={{translateY:"0" , opacity:1}} className="w-[30rem]  shadow-lg dark:border-zinc-900 dark:shadow-black border-2 border-slate-300 h-auto dark:bg-mainDark  dark:text-white p-4 rounded-xl flex flex-col   items-center">
                            <h1 className="text-5xl mx-auto">Login</h1>
                                <label htmlFor="email" className="w-full text-xl mt-3 mb-1">Email</label>
                                <input name="email" id="email" onChange={handleChange} onBlur={handleBlur} type="email" placeholder="example@example.com" className={`w-full outline-none ${errors.email && touched.email ? "bg-red-200" : "bg-slate-200 dark:bg-white"} dark:bg-zinc-900 dark:text-slate-300 rounded-lg pl-2 h-[2.5rem] border-2 border-black dark:border-indigo-900  dark:focus:outline-indigo-900 text-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                {errors.email&& touched.email && <p className="text-red-500 text-sm w-full mt-2">{errors.email}</p>}
                                <label htmlFor="password" className="w-full text-xl mt-3 mb-1">Password</label>
                                <input id="password" onChange={handleChange} onBlur={handleBlur}  name="password" type="password" placeholder="●●●●●●●●●●" className={`w-full outline-none dark:bg-zinc-900 dark:text-slate-300 ${errors.password && touched.password ? "bg-red-200" : "bg-slate-200 dark:bg-white"} rounded-lg dark:border-indigo-900  dark:focus:outline-indigo-900 dark:text-black pl-2 h-[2.5rem] border-2 border-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                {errors.password&& touched.password && <p className="text-red-500 text-sm w-full mt-2">{errors.password}</p>}

                                <div className="text-sm w-full   text-slate-300 mt-3"><p className="cursor-pointer w-max">Forgot your password?</p></div>

                            <button type="submit" disabled={isSubmitting} className="uppercase disabled:opacity-10 mx-auto bg-lightgreen text-white dark:bg-white dark:hover:bg-slate-200 transition-all duration-100 ease-linear dark:text-black w-1/2 py-3 rounded-lg mt-3 mb-1">Login</button>
                                <Link className="text-xs text-sky-300 underline mx-auto" href={'/signup'}>You don't have account yet!</Link>

                        </motion.form>
                    )
                    }

                </Formik>
            </div>
    )
    }
    


