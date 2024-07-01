'use client'
import {motion} from "framer-motion"
import {Formik} from "formik"
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {memo } from "react"
import axios from "axios"
import { useAtom } from "jotai";
import { userAtom } from "../state";
interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
function Signup  (){
    
    const [ , setUser] = useAtom(userAtom)
    const createUser = async (userData: UserData) => {
        console.log(userData)
        const response = await axios.post("/api/signup", userData);
        return response.data;

};
     const mutation=  useMutation({
        mutationFn:(userData  : UserData)=>createUser(userData) , 
        onSuccess:(data:any)=>{
            setUser(data.user)
        }
    })
    
    const handleSubmitting = (values:{firstName:string ,lastName : string , email:string  , password :string , } , )=>{
        mutation.mutateAsync(values)
    }
    return (
        <>
            <div className="w-full min-h-screen pt-[2rem] pb-[2rem] flex justify-center items-center overflow-hidden">
                <Formik 
                    initialValues={{email : "" , password : "" , firstName : "" , lastName:"" , confirmPassword:""}}
                    validate={values => {
                        const errors : {email ? : string , firstName ? : string , lastName ?: string , password?:string  , confirmPassword?:string} = {};
                        if (!values.email) {
                          errors.email = 'Email cannot be empty';
                        } else if (
                          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                        ) {
                          errors.email = 'Invalid email address';
                        }
                        if(!values.firstName){
                            errors.firstName = "First name cannot be empty" ; 
                        }
                        if(!values.lastName){
                            errors.lastName = "Last name cannot be empty"
                        }
                        if(!values.password){
                            errors.password =  'Password cannot be empty'
                        }
                        if(!values.confirmPassword){
                            errors.confirmPassword  = 'Password confirmation cannot be empty'
                        }else if(values.confirmPassword !== values.password){
                            errors.confirmPassword = "Password confirmation should match the password"
                        }
                        
                        return errors;
                      }}
                      onSubmit={(values )=>{
                            handleSubmitting(values)
                      }}
                      >
                        {({values , errors , touched , handleChange , handleBlur , handleSubmit })=>(
                            <motion.form onSubmit={handleSubmit} initial={{translateY:'-100%'}} animate={{translateY:"0"}} className="w-[30rem] mt-12 shadow-lg dark:border-4 dark:border-darkgreen border-2 border-slate-300 h-auto dark:bg-mainDark  dark:text-white p-4 rounded-xl flex flex-col gap-6  items-center">
                            <h1 className="text-5xl mx-auto">Signup</h1>
                            <div className="w-full flex flex-col  gap-2 relative ">
                                <p >Name</p>
                                <div className="flex justify-center items-center gap-4">
                                    <input name="firstName" onChange={handleChange} onBlur={handleBlur} value={values.firstName} type="text" placeholder="first name" className={`w-1/2 outline-none ${errors.firstName && touched.firstName ? "bg-red-200 text-red-500" : "bg-slate-200 dark:bg-white text-black"} rounded-full pl-2 h-[2.5rem] border-2 border-black dark:border-0 dark:focus:outline-white text-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                    {errors.firstName && touched.firstName && <p className="text-red-300 text-sm absolute left-2 top-[103%]">
                                            {errors.firstName}
                                        </p>}
                                    <input onChange={handleChange} onBlur={handleBlur} name="lastName" type="text" placeholder="last name" className={`w-1/2 outline-none ${errors.lastName && touched.lastName ? "bg-red-200 text-red-500" : "bg-slate-200 dark:bg-white text-black"} rounded-full pl-2 h-[2.5rem] border-2 border-black dark:border-0 dark:focus:outline-white text-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                    {errors.lastName && touched.lastName  &&
                                     <p className="text-red-300 text-sm absolute left-[53%] top-[103%]">
                                            {errors.lastName}
                                        </p>}
                                </div>
                            </div>
                            <div className="w-full flex flex-col  gap-2">
                                <p >Email</p>
                                <input onChange={handleChange} onBlur={handleBlur} name="email" type="email" placeholder="example@example.com" className={`w-full ${errors.email && touched.email ? "bg-red-200 text-red-500" : "bg-slate-200 dark:bg-white text-black"} outline-none  rounded-full pl-2 h-[2.5rem] border-2 border-black dark:border-0 dark:focus:outline-white text-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                    {errors.email && touched.email && <p className="text-red-300 text-sm  top-full">
                                            {errors.email}
                                        </p>}
                            </div>
                            <div className="w-full flex flex-col relative gap-2">
                                <p >Password</p>
                                <input type="password" onChange={handleChange} onBlur={handleBlur} name="password" placeholder="●●●●●●●●●●" className={`w-full outline-none ${errors.password && touched.password ? "bg-red-200 text-red-500" : "bg-slate-200 dark:bg-white text-black"} rounded-full dark:border-0 dark:focus:outline-white dark:text-black pl-2 h-[2.5rem] border-2 border-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                {errors.password && touched.password && <p className="text-red-300 text-sm  top-full">
                                            {errors.password}
                                        </p> }

                            </div>
                            <div className="w-full flex flex-col relative gap-2">
                                <p >Confirm Password</p>
        
                                <input onChange={handleChange} onBlur={handleBlur} type="password" name="confirmPassword" placeholder="●●●●●●●●●●" className={`w-full outline-none ${errors.confirmPassword && touched.confirmPassword ? "bg-red-200 text-red-500" : "bg-slate-200 dark:bg-white text-black"} rounded-full dark:border-0 dark:focus:outline-white dark:text-black pl-2 h-[2.5rem] border-2 border-black focus:outline-2 focus:outline-black focus:outline-offset-4 transition-all duration-100 ease-linear`} required/>
                                {errors.confirmPassword && touched.confirmPassword &&<p className="text-red-300 text-sm  top-full">
                                            {errors.confirmPassword}
                                        </p> }
                            </div>
                            <button type="submit"  className="uppercase mx-auto bg-lightgreen text-white dark:bg-white dark:text-black w-1/2 py-3 rounded-lg">Signup</button>
                            <div className="w-full flex flex-col h-max ">
                                <Link className="text-sm text-blue-300 underline mx-auto" href={'/login'}>Already have account?</Link>
                            </div>
                        </motion.form>
                        )

                        }
                
                </Formik>
            </div>
        </>
    )
}

export default memo(Signup)