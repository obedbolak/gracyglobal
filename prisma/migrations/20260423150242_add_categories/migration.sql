-- ─── Step 1: Create category tables ONLY if they don't exist ──────────────────

CREATE TABLE IF NOT EXISTS "course_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- ─── Step 2: Create unique indexes if they don't exist ────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "course_categories_name_key"    ON "course_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "course_categories_slug_key"    ON "course_categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_name_key"   ON "product_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_slug_key"   ON "product_categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_name_key"   ON "service_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_slug_key"   ON "service_categories"("slug");

-- ─── Step 3: Insert default "Uncategorized" (skip if already exists) ──────────

INSERT INTO "course_categories" ("id", "name", "slug", "updatedAt")
VALUES ('default-course-cat', 'Uncategorized', 'uncategorized', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "product_categories" ("id", "name", "slug", "updatedAt")
VALUES ('default-product-cat', 'Uncategorized', 'uncategorized', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "service_categories" ("id", "name", "slug", "updatedAt")
VALUES ('default-service-cat', 'Uncategorized', 'uncategorized', NOW())
ON CONFLICT ("id") DO NOTHING;

-- ─── Step 4: Add categoryId columns (only if they don't exist) ────────────────

DO $$
BEGIN
    -- Add categoryId to courses
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'categoryId'
    ) THEN
        -- Drop old category column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name = 'category'
        ) THEN
            ALTER TABLE "courses" DROP COLUMN "category";
        END IF;
        
        ALTER TABLE "courses" ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT 'default-course-cat';
        ALTER TABLE "courses" ALTER COLUMN "categoryId" DROP DEFAULT;
    END IF;

    -- Add categoryId to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'categoryId'
    ) THEN
        -- Drop old category column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'category'
        ) THEN
            ALTER TABLE "products" DROP COLUMN "category";
        END IF;
        
        ALTER TABLE "products" ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT 'default-product-cat';
        ALTER TABLE "products" ALTER COLUMN "categoryId" DROP DEFAULT;
    END IF;

    -- Add categoryId to services
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'categoryId'
    ) THEN
        -- Drop old category column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'services' AND column_name = 'category'
        ) THEN
            ALTER TABLE "services" DROP COLUMN "category";
        END IF;
        
        ALTER TABLE "services" ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT 'default-service-cat';
        ALTER TABLE "services" ALTER COLUMN "categoryId" DROP DEFAULT;
    END IF;

    -- Add group column to products if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'group'
    ) THEN
        ALTER TABLE "products" ADD COLUMN "group" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- ─── Step 5: Add foreign key constraints (only if they don't exist) ───────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courses_categoryId_fkey'
    ) THEN
        ALTER TABLE "courses"
            ADD CONSTRAINT "courses_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "course_categories"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_categoryId_fkey'
    ) THEN
        ALTER TABLE "products"
            ADD CONSTRAINT "products_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_categoryId_fkey'
    ) THEN
        ALTER TABLE "services"
            ADD CONSTRAINT "services_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- ─── Step 6: Add indexes (only if they don't exist) ───────────────────────────

CREATE INDEX IF NOT EXISTS "course_categories_slug_idx"            ON "course_categories"("slug");
CREATE INDEX IF NOT EXISTS "course_categories_active_sortOrder_idx" ON "course_categories"("active", "sortOrder");

CREATE INDEX IF NOT EXISTS "product_categories_slug_idx"            ON "product_categories"("slug");
CREATE INDEX IF NOT EXISTS "product_categories_active_sortOrder_idx" ON "product_categories"("active", "sortOrder");

CREATE INDEX IF NOT EXISTS "service_categories_slug_idx"            ON "service_categories"("slug");
CREATE INDEX IF NOT EXISTS "service_categories_active_sortOrder_idx" ON "service_categories"("active", "sortOrder");

CREATE INDEX IF NOT EXISTS "courses_categoryId_idx"         ON "courses"("categoryId");
CREATE INDEX IF NOT EXISTS "courses_teacherId_idx"          ON "courses"("teacherId");
CREATE INDEX IF NOT EXISTS "courses_published_featured_idx" ON "courses"("published", "featured");
CREATE INDEX IF NOT EXISTS "courses_createdAt_idx"          ON "courses"("createdAt");

CREATE INDEX IF NOT EXISTS "products_categoryId_idx"        ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "products_sellerId_idx"          ON "products"("sellerId");
CREATE INDEX IF NOT EXISTS "products_active_featured_idx"   ON "products"("active", "featured");
CREATE INDEX IF NOT EXISTS "products_createdAt_idx"         ON "products"("createdAt");

CREATE INDEX IF NOT EXISTS "services_categoryId_idx"        ON "services"("categoryId");
CREATE INDEX IF NOT EXISTS "services_sellerId_idx"          ON "services"("sellerId");
CREATE INDEX IF NOT EXISTS "services_active_featured_idx"   ON "services"("active", "featured");
CREATE INDEX IF NOT EXISTS "services_createdAt_idx"         ON "services"("createdAt");