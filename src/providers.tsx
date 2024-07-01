'use client'
import {QueryClientProvider , QueryClient} from "@tanstack/react-query"
import { ReactNode } from "react"
import {Provider as JotaiProvider , createStore} from "jotai"
const queryClient = new QueryClient()
const store = createStore()
export const Provider = ({children} :{children:ReactNode})=>{
    return (
        <QueryClientProvider client={queryClient}>
            <JotaiProvider store={store}>
                {children}
            </JotaiProvider>
        </QueryClientProvider>
    )
}