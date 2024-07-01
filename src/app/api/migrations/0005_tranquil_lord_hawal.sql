CREATE TABLE IF NOT EXISTS "carousels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products_to_carousel" (
	"productId" uuid NOT NULL,
	"carouselId" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products_to_carousel" ADD CONSTRAINT "products_to_carousel_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products_to_carousel" ADD CONSTRAINT "products_to_carousel_carouselId_carousels_id_fk" FOREIGN KEY ("carouselId") REFERENCES "public"."carousels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
