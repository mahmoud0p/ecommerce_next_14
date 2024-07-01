import {atom} from 'jotai'
type User = {
    id:string ,
    email : string , 
    firstName : string , 
    lastName :string , 
    role : string
}
type Product = {
        name:string , 
        price : string , 
        rating : string ,
        id:string,
        description:string
    image :{
        id:string , 
        url:string
    }
}
type Cart ={
    id:string , 
    quantity : number , 
    totalPrice : string ,
    products : {
        id:string ,
        name : string , 
        price : number , 
        images : {
            id:string , 
            url:string ,

        }[]
    }[]
}
type Items = {
    id: string, 
    quantity: number, 
    totalPrice: string, 
    product: {
        name: string,
        id: string, 
        images: {url: string, id: string}[]
        price: string, 
    }
}
export const userAtom = atom<User | null>(null)
export const searchLoading = atom<boolean>(false)
export const isAdminAtom = atom<boolean>(false)
export const searchResults = atom<Product[] | null>(null)
export const errorAtom = atom<string | null >(null)
export const SuccessMessage = atom<string | null>(null)
export const stickyAtom = atom<boolean>(false)
export  const cartItems_atom = atom<Items[] | []>([])
export const reviewsCount = atom<number>(0)
export const cartItemsCount = atom <number>(0)