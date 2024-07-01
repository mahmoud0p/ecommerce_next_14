'use client'
import { SetStateAction } from 'jotai';
import React, { Dispatch } from 'react'
import Dropzone from 'react-dropzone'
import { FaMountainSun } from "react-icons/fa6";
import Image from "next/image"

export default function DropZone  ({images ,setImages}:{images:File[] | null , setImages:Dispatch<SetStateAction<File[]|null>>}){
    return(
        <Dropzone onDrop={acceptedFiles => setImages(prev => [...(prev || []) ,...acceptedFiles ])}>
        {({getRootProps, getInputProps}) => (
            <section className='w-full overflow-hidden  overflow-x-auto gap-3 bg-slate-300  dark:bg-zinc-900 h-[30rem] p-4 flex md:flex-row flex-col justify-center items-center rounded-3xl '>
            <div className='md:w-1/3 xs:w-3/4 w-full bg-white dark:bg-mainDark flex-col h-3/4 flex justify-center items-center rounded-3xl border-slate-300 border-2' {...getRootProps()}>
                <input {...getInputProps()} />
                <FaMountainSun className='md:text-3xl sm:text-5xl text-4xl'/>

                <p className='w-3/4 md:text-md sm:text-sm text-xs '> Drag 'n' drop some files here, or click to select files</p>
            </div>
            <div className='flex-1  md:h-3/4 h-52 w-2/3 flex flex-col gap-3 xs:max-w-2/3  overflow-x-auto'>
                <h3 className='md:text-2xl sm:text-xl text-md'>Images Uploaded</h3>
                <div className=' md:flex-1 h-52 w-full max-h-full   overflow-x-auto  flex  flex-row   md:max-w-3/4 justify-start px-3 py-2 gap-3 box-border items-center rounded-3xl dark:bg-mainDark bg-white'>
                    {images?.length === 0 ? <p>Nothing To show</p> : images?.map((image ,i)=>(
                        <div
                        key={i}
                        className="relative min-w-52 md:h-52 h-32 border-2 rounded-md cursor-pointer"
                        onClick={() => {
                            const filtered = images.filter(image_filtered => image_filtered !== image);
                            setImages(filtered);
                        }}
                    >
                        <Image
                            width={200}
                            height={200}
                            src={URL.createObjectURL(image)}
                            className="object-contain w-full h-full"
                            alt={`uploaded image number ${i + 1}`}
                        />
                        <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm text-white opacity-0 hover:opacity-100">
                            Click to delete
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            </section>
        )}
        </Dropzone>
    )
}