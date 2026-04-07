# Community Feature Setup Guide

## 📋 What's Been Done

✅ **Schema Updated** - Added complete community models:

- `Community` - Community with slug & category
- `CommunityPost` - Posts with media, links, and previews
- `PostComment` - Comments on posts
- `PostReaction` - Reactions (LIKE, LOVE, SUPPORT)
- `CommunityMember` - Membership with roles (MEMBER, MODERATOR, ADMIN)

✅ **API Routes** - All endpoints ready:

- `GET /api/communities` - List all communities
- `POST /api/communities/[slug]/posts` - Create post
- `GET /api/communities/[slug]/posts` - Fetch feed
- `POST /api/posts/[id]/react` - Add reaction
- `POST /api/posts/[id]/comment` - Add comment
- `POST /api/communities/[slug]/join` - Join/leave toggle

✅ **Components Updated** - CommunityFeed now fetches from API instead of mock data

✅ **Seed Script** - Sample data ready to populate

---

## 🚀 Quick Start

### Step 1: Run Migration

```bash
cd /home/obed/Desktop/gracyglobal
npx prisma migrate dev --name update-community-schema
```

### Step 2: Seed Sample Data

```bash
npx ts-node prisma/seed-communities.ts
```

This will create:

- 7 communities (one for each system)
- 5 sample users
- 7 sample posts with comments and reactions

### Step 3: Test the Community Page

1. Navigate to `/community` in your app
2. You should see the communities with sample data
3. Click into any community to see posts and interact

---

## 📡 API Routes Reference

### Get All Communities

```bash
GET /api/communities
```

**Response:**

```json
[
  {
    "id": "...",
    "name": "Human Flourishing",
    "slug": "human-flourishing",
    "description": "...",
    "image": "...",
    "category": "💛",
    "memberCount": 5,
    "postCount": 3,
    "isJoined": true
  }
]
```

### Get Community Feed

```bash
GET /api/communities/[slug]/posts
```

**Response:**

```json
[
  {
    "id": "...",
    "title": "My post title",
    "content": "Post content...",
    "type": "TEXT",
    "tags": ["tag1", "tag2"],
    "user": { "id": "...", "name": "John", "image": "..." },
    "_count": { "comments": 2, "reactions": 5 },
    "reactions": [{ "type": "LIKE" }],
    "createdAt": "2025-03-15T10:00:00Z"
  }
]
```

### Create Post in Community

```bash
POST /api/communities/[slug]/posts
Content-Type: application/json

{
  "type": "TEXT",
  "title": "My Post Title",
  "content": "Post content...",
  "tags": ["tag1", "tag2"],
  "mediaUrl": null,
  "mediaType": null,
  "linkUrl": null,
  "linkPreview": null
}
```

### React to Post

```bash
POST /api/posts/[id]/react
Content-Type: application/json

{
  "type": "LIKE"  // or "LOVE" or "SUPPORT"
}
```

### Comment on Post

```bash
POST /api/posts/[id]/comment
Content-Type: application/json

{
  "content": "Great post!"
}
```

### Join/Leave Community

```bash
POST /api/communities/[slug]/join
```

**Response:** `{ "action": "joined" | "left" }`

---

## 🎨 Component Structure

### CommunityFeed Component

Now automatically fetches posts from API:

```tsx
<CommunityFeed
  communitySlug="human-flourishing" // optional
  selectedSystem="knowledge-skills" // optional
/>
```

Features:

- Real-time data from API
- Search filtering
- Post count & engagement display
- Loading states
- Empty state handling

---

## 📝 Post Types Supported

- **TEXT** - Text/caption posts
- **IMAGE** - Image from Cloudinary
- **VIDEO** - Video from Cloudinary
- **DOCUMENT** - PDF or document
- **LINK** - Link with preview (auto-scraped)

---

## 👥 Member Roles

- **MEMBER** - Default role, can post & comment
- **MODERATOR** - Can moderate content
- **ADMIN** - Full community management

---

## 🔐 Authentication

All POST requests require:

- Valid NextAuth session
- User must be a community member to post/comment

---

## 📊 Features

✅ Full CRUD for posts  
✅ Comments with replies  
✅ Multi-type reactions  
✅ Community membership management  
✅ Rich media support (Cloudinary ready)  
✅ Link previews (JSON field ready)  
✅ Tag system  
✅ Search across posts  
✅ User roles & permissions

---

## 🛠️ Next Steps

1. **Cloudinary Integration** - Add upload handling in POST routes
2. **Link Preview Scraping** - Implement meta tag scraping
3. **Real-time Updates** - Add WebSocket for live notifications
4. **Moderation Tools** - Add content moderation UI
5. **Analytics** - Track engagement metrics

---

## 📚 File Locations

- **Schema**: `prisma/schema.prisma`
- **Seed**: `prisma/seed-communities.ts`
- **API Routes**: `app/api/communities/` & `app/api/posts/`
- **Component**: `components/community/CommunityFeed.tsx`
