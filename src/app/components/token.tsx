'use server'

import { cookies } from "next/headers"

export const token  = cookies().get("token")