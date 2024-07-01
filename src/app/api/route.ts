import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export function GET(
    req: NextApiRequest,
  ) {
    return Response.json({ message: 'Hello from Next.js!' })
  }

