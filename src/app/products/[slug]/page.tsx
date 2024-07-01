'use client'
import { Loader } from "@/app/components/LoadingComponent";
import { SearchPagination } from "@/app/search/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams  ,useRouter} from "next/navigation";
import { useState } from "react";

export default function SubcategoryProducts() {
  const params = useParams();
  const slug = params.slug;
  const [page, setPage] = useState(1);
  const [length ,setLength] = useState(0)
    const router = useRouter()
  const { data, isLoading, isError } = useQuery({
    queryKey :['subcategory_products', slug, page],
    queryFn:async () => {
      const { data } = await axios.get(`/api/categoryproducts?subcategory=${slug}&page=${page}`);
      setLength(data.totalPages)
      return data.results;
    },

   }
  );



  if (isLoading) return <Loader/>;
  if (isError) return <div className="text-red-500 right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2">Error loading data</div>;

  return (
    <div className="w-full min-h-screen relative pt-[4rem] px-5">
      <h1 className="text-gray-600 text-3xl">{decodeURIComponent(slug.toString())}</h1>
      <hr className="dark:bg-zinc-900 dark:border-zinc-900"/>
      <div className="mt-5 grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:grid-cols-4 gap-3">
        { data && Array.isArray(data) &&data.map((product) => (
          <div key={product.id} className="h-96 p-4 rounded-xl bg-slate-200 dark:bg-zinc-900 overflow-hidden flex flex-col gap-3">
            <img onClick={()=>{router.push(`/product/${product.id}`)}} className="w-full p-1 cursor-pointer rounded-xl h-1/2 bg-white object-contain " src={product.image.url} alt={product.name} />
            <h2 onClick={()=>{router.push(`/product/${product.id}`)}} className="text-nowrap cursor-pointer text-lg font-bold text-gray-600 text-ellipsis overflow-hidden w-full h-auto">{product.name}</h2>
            <p className="max-h-[4.5em] text-sm text-gray-500 line-clamp-3">{product.description}</p>
            <p className="bg-gray-600 text-white w-max py-2 px-3 rounded-lg ">${product.price}</p>
          </div>
        ))}
      </div>
      {length > 0&& <SearchPagination length={data} page={page} setPage={setPage} />}
    </div>
  );
}
