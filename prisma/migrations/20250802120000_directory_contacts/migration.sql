-- CreateEnum
CREATE TYPE "DirectoryContactType" AS ENUM ('EMPLOYEE', 'OTHER');

-- CreateTable
CREATE TABLE "directory_contacts" (
    "id" BIGSERIAL NOT NULL,
    "type" "DirectoryContactType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mobile" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directory_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_directory_contact_type" ON "directory_contacts"("type");
