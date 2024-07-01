import {defineConfig} from "drizzle-kit"
const Host = process.env.HOST ;
const User = process.env.USER ; 
const Password = process.env.Password ; 
const Database = process.env.DATABASE ; 
if(!Host || !User || !Password || !Database){
    throw new Error("cannot find one of credentials")
}
export default defineConfig({
    schema:"./src/app/api/schema.ts" , 
    dialect:'postgresql' , 
    out:"./src/app/api/migrations" , 
     
    dbCredentials:{
        host:Host ,
        user:User , 
        password:Password , 
        database:Database , 
        ssl:false
    },
    

    
})