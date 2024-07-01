ALTER TABLE "order_item" DROP CONSTRAINT "order_item_id_order_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "orderId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "productId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
