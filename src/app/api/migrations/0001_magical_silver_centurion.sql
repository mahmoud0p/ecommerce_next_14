DO $$ BEGIN
 CREATE TYPE "public"."payment" AS ENUM('success', 'faild');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'done');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "status" "status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment" "payment" DEFAULT 'faild';