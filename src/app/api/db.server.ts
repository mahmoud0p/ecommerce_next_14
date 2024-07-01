import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Pool } from 'pg';
const User = process.env.USER ; 
const Host = process.env.HOST ; 
const Database = process.env.DATABASE ; 
const Password = process.env.PASSWORD
if(!User || !Host || !Database || !Password){
    throw new Error("cannot find one of them")
}
export const pool = new Pool({
  user: User,
  host: Host,
  database:Database ,
  password: Password,
  port: 5432, 
});

const dburl = process.env.DB_URL;
if (!dburl) {
    throw new Error("cannot find db url");
}

export const client = postgres(dburl , {max:1});
export const db = drizzle(client);
