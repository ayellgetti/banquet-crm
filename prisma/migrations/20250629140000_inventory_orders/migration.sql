-- CreateEnum
CREATE TYPE "InventoryOrderStatus" AS ENUM ('PLACED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "inventory_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "vendor_id" BIGINT NOT NULL,
    "event_id" BIGINT,
    "delivery_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "InventoryOrderStatus" NOT NULL DEFAULT 'PLACED',
    "created_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_order_lines" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "material_id" VARCHAR(120) NOT NULL,
    "material_name" VARCHAR(255) NOT NULL,
    "material_category" VARCHAR(100),
    "unit" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inventory_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_orders_order_number_key" ON "inventory_orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_inventory_order_vendor" ON "inventory_orders"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_inventory_order_delivery" ON "inventory_orders"("delivery_at");

-- CreateIndex
CREATE INDEX "idx_inventory_order_line_order" ON "inventory_order_lines"("order_id");

-- AddForeignKey
ALTER TABLE "inventory_orders" ADD CONSTRAINT "inventory_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_orders" ADD CONSTRAINT "inventory_orders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_orders" ADD CONSTRAINT "inventory_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_order_lines" ADD CONSTRAINT "inventory_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "inventory_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
