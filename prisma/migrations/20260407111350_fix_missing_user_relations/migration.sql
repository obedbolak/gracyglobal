-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LINK');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'SUPPORT');

-- DropIndex
DROP INDEX "community_members_userId_key";

-- CreateTable (communities must exist BEFORE we reference it)
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");

-- AlterTable community_members: drop old columns, add new ones safely
ALTER TABLE "community_members"
  DROP COLUMN "badge",
  DROP COLUMN "bio",
  DROP COLUMN "contributions",
  DROP COLUMN "systems",
  DROP COLUMN "updatedAt",
  ADD COLUMN "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
  ADD COLUMN "communityId" TEXT;

-- Wipe the stale rows (old single-community model, no valid communityId to assign)
DELETE FROM "community_members";

-- Now enforce NOT NULL
ALTER TABLE "community_members" ALTER COLUMN "communityId" SET NOT NULL;

-- AlterTable community_posts: add communityId safely
ALTER TABLE "community_posts"
  DROP COLUMN "category",
  ADD COLUMN "linkPreview" JSONB,
  ADD COLUMN "linkUrl" TEXT,
  ADD COLUMN "mediaType" TEXT,
  ADD COLUMN "mediaUrl" TEXT,
  ADD COLUMN "type" "PostType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "communityId" TEXT,
  ALTER COLUMN "title" DROP NOT NULL,
  ALTER COLUMN "content" DROP NOT NULL;

-- Wipe orphaned posts (they have no communityId and can't be assigned one)
DELETE FROM "community_posts";

-- Now enforce NOT NULL
ALTER TABLE "community_posts" ALTER COLUMN "communityId" SET NOT NULL;

-- DropEnum (must come after columns using it are dropped)
DROP TYPE "MemberBadge";

-- CreateTable post_comments
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable post_reactions
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_userId_postId_type_key" ON "post_reactions"("userId", "postId", "type");
CREATE UNIQUE INDEX "community_members_userId_communityId_key" ON "community_members"("userId", "communityId");

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_communityId_fkey"
  FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "community_members" ADD CONSTRAINT "community_members_communityId_fkey"
  FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;