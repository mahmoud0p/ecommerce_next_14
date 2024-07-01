'use client'
import { useAtom } from "jotai";
import { searchLoading, searchResults } from "../state";
import Image from "next/image";
import path from "path";
import { Suspense, useEffect, useState } from "react";
import { Loader } from "@/app/components/LoadingComponent";
import { motion } from "framer-motion";
import { RiMenuFill } from "react-icons/ri";
import { navigateProduct } from "@/actions";
import { CheckBox } from "../components/checkbox";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from 'react-responsive'
import Rating from "../product/components/Rating";
import MultiRangeSlider from "../components/MultiRange";
import _ from "lodash"
import { SearchPagination } from "./pagination";

type Category = {
  id: string,
  name: string,
}

export default function Search() {
  const [results, setResults] = useAtom(searchResults);
  const [categories, setCategories] = useState<Category[] | []>([])
  const [openSlider, setOpenSlider] = useState(true);
  const min = 0;
  const [max, setMax] = useState(0)
  const [page, setPage] = useState(1)
  const [value, setValue] = useState<[number, number] | null>(null)
  const [range, setRange] = useState<[number, number] | null>(null)
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([])
  const [inStock, setInStock] = useState(false)
  const [length, setLength] = useState<number>(1)
  const [, setLoading] = useAtom(searchLoading)
  const param = useSearchParams()
  const search = param.get('query')
  
  const handleOpenSlider = () => {
    setOpenSlider(!openSlider);
  };

  const isBigScreen = useMediaQuery({ query: '(min-width: 720px)' })

  const { isLoading, isError } = useQuery({
    queryKey: ['search_results', search, page, range, inStock, categoriesSelected],
    queryFn: async () => {
      const { data } = await axios.post('/api/search', { query: search, page, range, categoriesSelected, inStock })
      setResults(data.results)
      setCategories(data.categories)
      setLength(data.totalPages || 1)
      if (max === 0) {
        setMax(data.maxPrice)
        setValue([0, data.maxPrice])
      }
      setLoading(false)

      return data
    } , 
    enabled :!!search
  })

  const handleNavigating = (id: string) => {
    navigateProduct(`/product/${id}`)
  }

  if (isError) {
    return <div className="text-xl text-red-500 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
      Oops our mistake we are working on fixing it 
    </div>
  } else {
    
    return (
      <>
        <Suspense fallback={<Loader />}>
          <div className="h-auto text-3xl pt-[3.5rem] flex pb-[4rem] w-full min-h-screen relative">
            <>
              <button
                onClick={handleOpenSlider}
                className="absolute w-9 h-9 z-10 text-xl mt-2 ml-2 bg-white dark:bg-transparent flex justify-center items-center rounded-lg border-2 dark:border-slate-300 dark:text-slate-300"
              >
                <RiMenuFill />
              </button>
              <motion.div
                initial={{ width: isBigScreen ? "15rem" : "8rem", opacity: 1 }}
                animate={openSlider ? { width: isBigScreen ? '15rem' : "8rem" } : { width: '0', opacity: 0 }}
                className="h-full pt-12 px-2 min-h-screen overflow-hidden text-nowrap"
              >
                <label className="font-bold text-gray-600 text-lg capitalize">
                  Available
                </label>
                <div className="w-full flex items-center gap-1 mt-2 dark:text-slate-300">
                  <CheckBox onCheck={() => setInStock(true)} onUnCheck={()=>{
                    setInStock(false)
                  }} />
                  <p className="text-sm">
                    In Stock
                  </p>
                </div>
                <hr className="mx-auto mt-3 dark:border-zinc-900 dark:bg-zinc-900 w-full" />
                <label className="font-bold text-gray-600 text-lg capitalize">
                  Category
                </label>
                <div className="flex flex-col gap-3">
                  {categories.map(c =>
                    <div key={c.id} className="flex items-center gap-1">
                      <CheckBox onUnCheck={()=>{
                        const filtered = _.filter(categoriesSelected , (category)=>{
                            return category!== c.id 
                        })
                        setCategoriesSelected(filtered)
                      }} onCheck={() => setCategoriesSelected(prev => [...(prev || []), c.id])} />
                      <p className="text-sm dark:text-slate-300 capitalize">{c.name}</p>
                    </div>
                  )}
                </div>
                <hr className="mx-auto mt-3 dark:border-zinc-900 dark:bg-zinc-900 w-full" />
                <label className="font-bold text-gray-600 text-lg capitalize">
                  Price Range
                </label>
                <div className="flex items-center justify-center mt-3">
                  {value && <MultiRangeSlider min={min} max={max} value={value} setValue={setValue} setRange={setRange} />}
                </div>
              </motion.div>
              {isLoading ? <Loader /> : results ? <div className="flex-1 pl-14 px-5 mt-2 grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-3">
                {results.map(product => (
                  <div
                    className="w-full max-h-[30rem] bg-white dark:bg-mainDark shadow-md dark:shadow-black dark:border-zinc-900 border border-slate-300 flex flex-col gap-1 rounded-3xl p-4"
                    key={product.id}
                  >
                    {product.image.url !== null && (
                      <div className="w-full h-64 bg-white rounded-3xl">
                        <Image
                          className="w-full md:max-h-64 max-h-52 object-contain"
                          width={130}
                          height={130}
                          src={`/uploads/${path.basename(product.image.url)}`}
                          alt={`${product.name} image`}
                          priority
                        ></Image>
                      </div>
                    )}
                    <p onClick={() => handleNavigating(product.id)} className="text-lg cursor-pointer capitalize max-w-3/4 text-nowrap text-ellipsis overflow-hidden">
                      {product.name}
                    </p>
                    <p className="text-sm bg-lightgreen dark:bg-zinc-900 dark:shadow-black w-max px-3 py-1 text-white rounded-lg shadow-md">
                      ${product.price}
                    </p>
                    <Rating rating={product.rating || "0"} mainRating={true} />
                    {product.description && (
                      <p className="text-zinc-400 lining-nums line-clamp-3 max-h-[4.2em] text-sm max-w-3/4 overflow-hidden text-ellipsis">
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
              </div> : <>
                <p className="dark:text-slate-300 ml-14">Nothing to show</p>
              </>}
              <SearchPagination page={page} setPage={setPage} length={length} />
            </>
          </div>
        </Suspense>
      </>
    );
  }
}
