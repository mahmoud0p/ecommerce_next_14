import {  client, db, pool } from "../db.server";
import { user } from "../schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import validator from 'validator'
import { eq } from "drizzle-orm";
export const checkUserExist = async (email: string) => {
  try {
    const userExist = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).execute()
    return userExist.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

export const createToken = (id: string) => {
  try {
    const secret = process.env.secret_key;
    if (!secret) {
      throw new Error("Cannot find secret key");
    }
    const token = jwt.sign({ id }, secret, { expiresIn: "1d" });
    return token;
  } catch (error:any) {
    throw new Error("Failed to create token");
  }
};
const checkCorrectEmail  = (email : string)=>{
  return validator.isEmail(email)
}
const checkStrongPassword = (password : string)=>{
  return validator.isStrongPassword(password)
}
export const POST = async (req: Request) => {
  const clientConnection = await pool.connect();
    const res = NextResponse
  if (req.method !== "POST") {
    return res.json({ error: "Method Not Allowed" } , {status:405});
  }
  const data  = await req.json()
  try {
    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new Error("Some information is missing");
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const userExist = await checkUserExist(email)
    if(userExist){
      throw new Error("email already exists!")
    }
    const validEmail = checkCorrectEmail(email) 
    if(!validEmail){
      throw new Error("email format is not correct")
    }
    const strongPassword = checkStrongPassword(password)
    if(!strongPassword){
      throw new Error('password should contain symbols, capital letters, and numbers ')
    }
    const createdUser = await db.insert(user).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: user.id  , firstName:user.firstName , lastName:user.lastName , email:user.email})
    .execute()
    if (!createdUser || createdUser.length === 0) {
      throw new Error("An error occurred while creating the user");
    }

    const token = createToken(createdUser[0].id);
    if (!token) {
      throw new Error("Failed to create token");
    }
    cookies().set('token' , token , {httpOnly:true , maxAge:24*60*60*1000})
    return res.json({ message: "User created successfully!"  , user:createdUser[0]} , {status:201});
  } catch (error:any) {
    return res.json({ error: error.message } , {status:500});
  }
  finally{
    clientConnection.release()
}
};

