import { sql } from "drizzle-orm";
import { date, decimal, index, integer, pgEnum, pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";


export const Roles= pgEnum("roles" , ['USER' , 'ADMIN'])
export const user = pgTable('user' , {
    id:uuid("id").defaultRandom().primaryKey() , 
    firstName :text("firstName").notNull() , 
    lastName :text("lastName").notNull() , 
    email:text("email").notNull().unique() , 
    password : text("password").notNull(), 
    role:Roles('role').default("USER").notNull() , 
    createdAt : timestamp("createdAt"),
    updatedAt : timestamp("updateAt")
})


export const product = pgTable("product" , {
    id:uuid("id").defaultRandom().primaryKey() , 
    name:text("name").notNull() , 
    price:decimal("price").notNull() , 
    rating:decimal("rating").notNull().default("0") ,
    countInStock:integer("countInStock").notNull() , 
    createdAt:timestamp("createdAt").default(sql`CURRENT_TIMESTAMP`) , 
    updatedAt:timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`) , 
},
(table) => ({
  titleSearchIndex: index('name_search_index')
  .using('gin', sql`to_tsvector('english', ${table.name})`),
}), )
export const product_images = pgTable('product_images' ,{
    id:uuid("id").defaultRandom().primaryKey() , 
    url:text('url').notNull() , 
    productId : uuid("product_id").notNull().references(()=>product.id)
})
export const product_description = pgTable("product_description" , {
    id:uuid("id").defaultRandom().primaryKey()  ,
    content:text("content").notNull() , 
    productId : uuid("product_id").notNull().references(()=>product.id)
})

export const product_details = pgTable('product_details' , {
    id:uuid("id").defaultRandom().primaryKey() , 
    content : text("content").notNull() , 
    productId : uuid("product_id").notNull().references(()=>product.id)
})

export const reviews = pgTable("reviews" , {
    id:uuid("id").defaultRandom().primaryKey() , 
    rating:decimal("rating").notNull() , 
    content:text("content").notNull() , 
    productId : uuid("product_id").notNull().references(()=>product.id) , 
    userId : uuid("user_id").notNull().references(()=>user.id)
})

export const color = pgTable("product_color" , {
    id:uuid("id").defaultRandom().primaryKey().notNull() , 
    color:text("color").notNull() , 
    productId :uuid('product_id').notNull().references(()=>product.id)
})
export const color_images = pgTable("color_image" , {
    id:uuid("id").defaultRandom().primaryKey().notNull() , 
    url:text("url").notNull() , 
    colorId:uuid("color_id").notNull().references(()=>color.id)
})

export const cart = pgTable("cart" , {
    id:uuid("id").defaultRandom().primaryKey() , 
    quantity:integer("quantity").notNull() , 
    totalPrice : decimal("total_price").notNull() , 
    userId : uuid("user_id").notNull().references(()=>user.id)
})
export const cartItem = pgTable("cart_item" , {
    id:uuid('id').primaryKey().defaultRandom() , 
    quantity:integer("quantity").notNull() , 
    totalPrice : decimal("total_price").notNull() , 
    cartId : uuid("user_id").notNull().references(()=>cart.id) , 
    product:uuid("product_id").notNull().references(()=>product.id)
})
export const Status = pgEnum('status' , ['pending' , "done"])
export const Payment = pgEnum('payment' , ['success' , "faild"])
export const order = pgTable("order"  , {
    id:uuid("id").defaultRandom().primaryKey() , 
    quantity:integer("quantity").notNull(), 
    price : decimal("price").notNull() , 
    userId : uuid("user_id").notNull().references(()=>user.id) , 
    status : Status('status').default('pending'),  
    payment : Payment('payment').default('faild'),
    address :text('addres').notNull() , 
    createdAt:timestamp('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`)
})

export const orderItem = pgTable("order_item" , {
    id:uuid("id").defaultRandom().primaryKey() , 
    quantity:integer("quantity").notNull() , 
    orderId : uuid("orderId").notNull().references(()=>order.id) , 
    productId : uuid("productId").notNull().references(()=>product.id)
})
export const addresses = pgTable('addresses' , {
    id:uuid("id").primaryKey().defaultRandom() , 
    address : text("address").notNull() , 
    userId : uuid('user_id').notNull().references(()=>user.id)
})

export const category = pgTable("category" , {
    id:uuid("id").primaryKey().defaultRandom() , 
    name:text('name').notNull() , 
})
export const subcategory = pgTable("subcategory" , {
    id:uuid("id").primaryKey().defaultRandom() , 
    name:text("name").notNull() , 
})
export const category_subcategory = pgTable("category_subcategory" ,{
    categoryId : uuid("category_id").notNull().references(()=>category.id) , 
    subcategoryId : uuid("subcategory_id").notNull().references(()=>subcategory.id)
})
export const subcategory_image = pgTable("subcategory_image" , {
    id:uuid("id").primaryKey().defaultRandom() , 
    url:text("url").notNull() , 
    subcategoryId : uuid("subcategory_id").notNull().references(()=>subcategory.id)
})
export const  product_subcategory = pgTable("product_subcategory" , {
    productId : uuid("productId").references(()=>product.id) ,
    subcategoryId : uuid("subcategoryId").references(()=>subcategory.id)
})
export  const productCarousel = pgTable("carousels" , {
    id:uuid('id').primaryKey().notNull().defaultRandom() ,
    title : text('title').notNull() , 
})

export const productsToCarousel = pgTable('products_to_carousel' , {
    productId : uuid('productId').notNull().references(()=>product.id) , 
    carouselId :uuid('carouselId').notNull().references(()=>productCarousel.id)
})