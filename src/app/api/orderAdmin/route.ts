import { NextRequest, NextResponse } from "next/server";
import { db, pool } from "../db.server";
import { isAdmin } from "../admin/isAdmin";
import { order } from "../schema";
import { asc, desc, eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
    const isAdminRes = await isAdmin();
    if (isAdminRes.status !== 200) {
        return NextResponse.json({ error: "unauthorized" }, { status: 500 });
    }

    const clientConnection = await pool.connect();
    const { searchParams } = new URL(req.url);
    const sortOrder = searchParams.get('sort') || 'desc';

    try {
        const orders = await db
            .select()
            .from(order)
            .orderBy(sortOrder === 'asc'?asc(order.createdAt):desc(order.createdAt) )
            .catch(err => {
                throw new Error(err.message);
            });

        if (orders.length === 0) {
            return NextResponse.json({ message: 'Sorry, there are no orders yet' });
        }
        return NextResponse.json(orders);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        clientConnection.release();
    }
};

export const PUT = async (req: NextRequest) => {
    const isAdminRes = await isAdmin();
    if (isAdminRes.status !== 200) {
        return NextResponse.json({ error: "unauthorized" }, { status: 500 });
    }

    const clientConnection = await pool.connect();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
        await db
            .update(order)
            .set({ status: 'done' })
            .where(eq(order.id, orderId))
            .catch(err => {
                throw new Error(err.message);
            });

        return NextResponse.json({ message: 'The order has arrived' });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        clientConnection.release();
    }
};
