ALTER TABLE "product" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;