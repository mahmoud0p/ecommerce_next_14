import { eq, sql } from "drizzle-orm";
import { db, pool } from "../db.server";
import { product, product_description, product_images, subcategory, product_subcategory } from "../schema";
import { NextResponse } from "next/server";

const searchProduct = async (
  query: string,
  page: number,
  minPrice: number,
  maxPrice: number,
  categoriesSelected: string[],
  inStock: boolean
) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  // Base conditions for the query
  const baseConditions = [
    sql`to_tsvector('english', ${query}) @@ plainto_tsquery('english', ${query})`,
    sql`${product.price} BETWEEN ${minPrice} AND ${maxPrice}`
  ];

  // Adding category filter if categoriesSelected is not empty
  if (categoriesSelected.length > 0) {
    const categoryCondition = sql`${product.id} IN (
      SELECT ${product_subcategory.productId} 
      FROM ${product_subcategory} 
      WHERE ${product_subcategory.subcategoryId} IN (${sql.join(categoriesSelected.map(cat => sql`${cat}`), sql`, `)})
    )`;
    baseConditions.push(categoryCondition);
  }

  // Adding inStock filter
  if (inStock) {
    baseConditions.push(sql`${product.countInStock} > 0`);
  }

  // Combine all conditions with AND operator
  const conditions = sql.join(baseConditions, sql` AND `);

  // Query to count the total number of matching products
  const totalCountQuery = await db
    .select({
      count: sql`count(*)`.as<number>()
    })
    .from(product)
    .where(conditions)
    .execute();

  const totalCount = totalCountQuery[0].count;

  // Query to fetch the maximum price of matching products
  const maxPriceQuery = await db
    .select({
      maxPrice: sql`max(${product.price})`.as<number>()
    })
    .from(product)
    .where(conditions)
    .execute();

  const maxProductsPrice = Math.ceil(maxPriceQuery[0].maxPrice);

  // Query to fetch paginated products
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
    .where(conditions)
    .groupBy(product.id, product.name, product.price, product_description.content)
    .limit(limit)
    .offset(offset)
    .execute();

  return { results, totalCount, maxProductsPrice };
};

export const POST = async (req: Request) => {
  const clientConnection = await pool.connect();
  try {
    const data = await req.json();
    const { query, page, range, categoriesSelected, inStock } = data;

    if (!query || !page) {
      throw new Error('query and page must be provided');
    }

    let minPrice = 0;
    let maxPrice = Number.MAX_SAFE_INTEGER;
    if (range) {
      [minPrice, maxPrice] = range;
    }

    const { results, totalCount, maxProductsPrice: maxPriceInRange } = await searchProduct(
      query.toString(),
      page,
      minPrice,
      maxPrice,
      categoriesSelected || [],
      inStock || false
    );
    const categories = await db.select().from(subcategory).catch(err => {
      throw new Error(err.message);
    });

    const totalPages = Math.ceil(totalCount / 10);

    return NextResponse.json({ results, categories, totalPages, currentPage: page, maxPrice: maxPriceInRange });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    clientConnection.release();
  }
};
