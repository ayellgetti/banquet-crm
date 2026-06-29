-- AlterTable
ALTER TABLE "events" ADD COLUMN "plate_package_id" VARCHAR(50),
ADD COLUMN "menu_item_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "menu_saved_at" TIMESTAMP(3);
