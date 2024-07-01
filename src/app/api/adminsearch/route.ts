import { product, product_description, product_images, subcategory, product_subcategory } from "../schema";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "../db.server";
import { NextResponse } from "next/server";
const searchProductCarousel = async (query: string, page: number) => {
    const limit = 3;
    const offset = (page - 1) * limit;
  
    // Base conditions for the query
    const baseConditions = [
      sql`to_tsvector('english', ${query}) @@ plainto_tsquery('english', ${query})`
    ];
  
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
  
    return { results, totalCount };
  };
  export const POST = async (req: Request) => {
    const clientConnection = await pool.connect();
    try {
      const data = await req.json();
      const { query, page } = data;
  
      if (!query || !page) {
        throw new Error('query and page must be provided');
      }
  
      const { results, totalCount } = await searchProductCarousel(query.toString(), page);
  
      const totalPages = Math.ceil(totalCount / 3);
  
      return NextResponse.json({ results, totalPages, currentPage: page });
    } catch (error: any) {
      console.log(error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      clientConnection.release();
    }
  };