'use client'
import { Loader } from "@/app/components/LoadingComponent";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Product, ProductCarousel } from "./components/Carousel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Carousel = {
  carouselId:string ,
  carouselTitle:string ,
  products: Product[]
}
const DynamicSwiper = dynamic(() => import('@/app/components/mainpageSwiper'), {
  ssr: false,
  loading: () => <Loader />
});

const DynamicCategories = dynamic(() => import('@/app/components/mainCategories'), {
  ssr: false,
  loading: () => <Loader />
});

export default function Home() {
  const {data:CarouselData , isLoading:CarouseIsLoading,  isError:CarouselError} = useQuery<Carousel[]>({
    queryKey:['carousels'] , 
    queryFn:async()=>{
      const {data } = await axios.get('/api/carousel')
      return data
    }
  })
  return (
    <>
      <main className="flex items-center justify-start flex-col h-auto lg:h-screen w-full pt-[4rem]">
        <div className="flex gap-4 h-1/2 px-5 w-full lg:flex-row flex-col-reverse items-center justify-center">
          <div className="lg:w-1/2 w-full flex flex-col gap-3 lg:h-full h-[15rem] justify-center overflow-hidden relative items-center rounded-3xl bg-gradient-to-br dark:from-indigo-900 from-slate-300">
            <p className="dark:text-white xl:text-3xl lg:text-2xl sm:text-xl text-lg">Easy, Fast Shopping</p>
            <button className="dark:bg-white bg-black text-white hover:text-black hover:bg-white dark:text-black px-5 lg:text-lg md:text-md text-sm rounded-xl py-2 dark:hover:bg-slate-200 transition-all duration-100 ease-linear">
              Start Shopping
            </button>
          </div>
          <Suspense fallback={<Loader />}>
            <DynamicSwiper />
          </Suspense>
        </div>
        <Suspense fallback={<Loader />}>
          <DynamicCategories />
        </Suspense>
      </main>
      {CarouseIsLoading ? <Loader/> : CarouselError ? <p>Sorry, An error occured while fetching data..</p>: Array.isArray(CarouselData) && CarouselData.map(c=>
      <div key={c.carouselId} className="h-auto">
        <ProductCarousel title={c.carouselTitle} products={c.products} carouselId = {c.carouselId}/>
      </div>
      )}
    </>
  );
}
