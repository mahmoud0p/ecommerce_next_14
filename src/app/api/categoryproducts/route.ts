import { eq, sql } from "drizzle-orm";
import { db, pool } from "../db.server";
import { product, product_description, product_images, subcategory, product_subcategory } from "../schema";
import { NextResponse } from "next/server";

const searchProductBySubcategory = async (subcategoryName: string, page: number) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  const totalCountQuery = await db
    .select({
      count: sql`count(*)`.as<number>()
    })
    .from(product)
    .leftJoin(product_subcategory, eq(product.id, product_subcategory.productId))
    .leftJoin(subcategory, eq(product_subcategory.subcategoryId, subcategory.id))
    .where(sql`${subcategory.name} = ${subcategoryName}`)
    .execute();

  const totalCount = totalCountQuery[0].count;

  const results = await db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product_description.content,
      image: sql`(
        SELECT json_build_object('id', ${product_images.id}, 'url', ${product_images.url})
        FROM ${product_images}
        WHERE ${product_images.productId} = ${product.id}
        ORDER BY ${product_images.id}
        LIMIT 1
      )`
    })
    .from(product)
    .leftJoin(product_description, eq(product.id, product_description.productId))
    .leftJoin(product_images, eq(product.id, product_images.productId))
    .leftJoin(product_subcategory, eq(product.id, product_subcategory.productId))
    .leftJoin(subcategory, eq(product_subcategory.subcategoryId, subcategory.id))
    .where(sql`${subcategory.name} = ${subcategoryName}`)
    .groupBy(product.id, product.name, product.price, product_description.content)
    .limit(limit)
    .offset(offset)
    .execute();

  return { results, totalCount };
};

export const GET = async (req: Request) => {
  const clientConnection = await pool.connect();
  try {
    const url = new URL(req.url)
    const params= new URLSearchParams(url.searchParams)
    const subcategoryName = params.get('subcategory')
    const page = params.get('page')

    if (!subcategoryName || !page) {
      throw new Error('subcategoryName and page must be provided');
    }

    const { results, totalCount } = await searchProductBySubcategory(subcategoryName, Number(page));

    const totalPages = Math.ceil(totalCount / 10);

    return NextResponse.json({ results,
         totalPages, currentPage: page });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    clientConnection.release();
  }
};
