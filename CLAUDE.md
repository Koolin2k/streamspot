# CLAUDE.md — StreamSpot

## Project Overview

StreamSpot is a location-based event discovery app that helps users find live sports, TV watch parties, and cultural events at nearby venues. Think "what's happening near me right now" for bars, restaurants, and entertainment venues.

**Target users:**
- People looking for somewhere to watch a game or event
- Venue owners who want to promote what they're showing/hosting

**MVP scope:** One city (Washington DC metro area). Curated venues and events to start, with self-serve venue submission once quality is stable.

**Primary user flow:** Open app → see events near me → filter/search → view event details → get venue info

-----

## Tech Stack

### Current Implementation

|Layer    |Choice                     |Status                                   |
|---------|---------------------------|-----------------------------------------|
|Framework|Next.js 13.5.1 with App Router|✅ Implemented                          |
|Language |TypeScript (strict mode)   |✅ Implemented                          |
|Styling  |Tailwind CSS + shadcn/ui   |✅ Implemented (extensive component library)|
|Database |Supabase Postgres          |⚠️ Basic schema, needs PostGIS            |
|Auth     |Supabase Auth              |✅ Email/password + Google OAuth         |
|Storage  |Supabase Storage           |📋 Not yet implemented                   |
|Maps     |Mapbox GL JS               |📋 Not yet implemented                   |

### Non-negotiable decisions (do not deviate)

- **Next.js 14+ with App Router** (currently 13.5.1, should upgrade)
- **TypeScript strict mode** (already configured)
- **Tailwind CSS** (already set up with shadcn/ui)
- **Supabase Postgres + PostGIS** (Postgres set up, PostGIS needed)
- **Mapbox GL JS** for maps (not yet added)

### Optional/later

- Supabase Edge Functions — only when external integrations needed
- Supabase Realtime — not for MVP
- PostHog — add after core features work
- Sentry — add after deployment

-----

## Current Project Structure

```
streamspot/
├── project/                    # Main application directory
│   ├── CLAUDE.md              # This file (root level preferred)
│   ├── app/
│   │   ├── layout.tsx         # ✅ Root layout with Navigation
│   │   ├── page.tsx           # ✅ Home/landing with event list
│   │   ├── tonight/
│   │   │   └── page.tsx       # ✅ "Happening now" view
│   │   ├── venues/
│   │   │   └── page.tsx       # ✅ Venue list
│   │   ├── venue/[id]/
│   │   │   ├── page.tsx       # ✅ Venue detail (server component)
│   │   │   └── VenueDetailClient.tsx  # ✅ Client interactivity
│   │   ├── dashboard/
│   │   │   └── page.tsx       # ✅ User dashboard
│   │   ├── admin/
│   │   │   └── page.tsx       # ✅ Admin panel (basic)
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx   # ✅ OAuth callback
│   ├── components/
│   │   ├── ui/                # ✅ shadcn/ui components (50+ components)
│   │   └── auth/
│   │       └── auth-modal.tsx # ✅ Auth modal component
│   ├── hooks/
│   │   ├── use-auth.ts        # ✅ Auth hook with sign in/up/out
│   │   └── use-toast.ts       # ✅ Toast notifications
│   ├── lib/
│   │   ├── supabase.ts        # ⚠️ Client-only, needs server setup
│   │   └── utils.ts           # ✅ Utility functions (cn, etc.)
│   ├── supabase/
│   │   └── migrations/
│   │       ├── 20250629213501_steep_beacon.sql   # ✅ Initial schema
│   │       └── 20250630002629_rough_cliff.sql    # ✅ User profiles
│   ├── package.json
│   ├── tailwind.config.ts     # ✅ Custom theme configured
│   └── tsconfig.json          # ✅ Strict mode enabled
```

### Missing Structure (to be created)

```
project/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # 📋 Browser client (SSR-compatible)
│   │   ├── server.ts          # 📋 Server client
│   │   ├── middleware.ts      # 📋 Auth middleware
│   │   └── types.ts           # 📋 Generated DB types
│   ├── hooks/
│   │   ├── use-location.ts    # 📋 Geolocation hook
│   │   ├── use-events.ts      # 📋 Event data fetching
│   │   └── use-venues.ts      # 📋 Venue data fetching
│   └── utils/
│       ├── geo.ts             # 📋 Distance calculations
│       └── date.ts            # 📋 Date formatting
├── app/
│   ├── events/                # 📋 Dedicated events routes
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── search/                # 📋 Search functionality
│       └── page.tsx
├── components/
│   ├── events/                # 📋 Event-specific components
│   ├── venues/                # 📋 Venue-specific components
│   └── layout/                # 📋 Layout components (header, footer)
├── .env.local.example         # 📋 Environment template
└── public/                    # 📋 Static assets
```

-----

## Database Schema

### Current Schema (Basic)

The current implementation has a basic schema without geolocation features:

**Tables:**
- `venues` - Basic venue info (id, name, address, description, image_url)
- `events` - Events (id, title, description, start_time, end_time, category, venue_id, max_capacity)
- `rsvps` - User RSVPs (id, event_id, user_id)
- `users` - User profiles (id, email, full_name, avatar_url)

**Issues to fix:**
1. ⚠️ Missing PostGIS extension and geography columns
2. ⚠️ No lat/lng coordinates for venues
3. ⚠️ Basic RLS policies don't match spec
4. ⚠️ Missing `content` table for teams/shows/leagues
5. ⚠️ Missing `photos` table
6. ⚠️ Event categories use ENUM instead of text check constraint
7. ⚠️ Missing indexes for performance
8. ⚠️ Missing slug fields for SEO-friendly URLs

### Target Schema (PostGIS-enabled)

Create a new migration to upgrade to this schema:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Venues (with PostGIS)
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL DEFAULT 'DC',
  zip text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geo geography(Point, 4326) GENERATED ALWAYS AS (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) STORED,
  phone text,
  website text,
  hours_json jsonb,
  image_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content (teams, shows, leagues)
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sport', 'team', 'show', 'league', 'other')),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  metadata_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- Events (enhanced)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('sports', 'tv', 'culture', 'other')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  content_id uuid REFERENCES content(id),
  image_url text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RSVPs (enhanced)
CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('interested', 'going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('venue', 'event')),
  owner_id uuid NOT NULL,
  storage_path text NOT NULL,
  caption text,
  sort_order int DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS venues_geo_idx ON venues USING gist(geo);
CREATE INDEX IF NOT EXISTS venues_is_published_idx ON venues(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS events_venue_id_idx ON events(venue_id);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events(starts_at);
CREATE INDEX IF NOT EXISTS events_published_starts_idx ON events(is_published, starts_at) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);
CREATE INDEX IF NOT EXISTS rsvps_event_id_idx ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS rsvps_user_id_idx ON rsvps(user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Enhanced RLS Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Venues
CREATE POLICY "Published venues are viewable by everyone"
  ON venues FOR SELECT USING (is_published = true AND verification_status = 'verified');

CREATE POLICY "Users can create venues"
  ON venues FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Venue owners can update their venues"
  ON venues FOR UPDATE USING (auth.uid() = created_by);

-- Events
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT USING (
    is_published = true
    AND moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = events.venue_id
      AND venues.is_published = true
    )
  );

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events"
  ON events FOR UPDATE USING (auth.uid() = created_by);

-- Content
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT USING (true);

-- RSVPs
CREATE POLICY "RSVPs are viewable by everyone"
  ON rsvps FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create RSVPs"
  ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs"
  ON rsvps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVPs"
  ON rsvps FOR DELETE USING (auth.uid() = user_id);

-- Photos
CREATE POLICY "Photos of published content are viewable"
  ON photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON photos FOR INSERT WITH CHECK (auth.uid() = created_by);
```

-----

## Core Queries (PostGIS)

### Nearby Events Function

```sql
CREATE OR REPLACE FUNCTION get_nearby_events(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 16093.4, -- 10 miles
  event_category text DEFAULT NULL,
  result_limit int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  starts_at timestamptz,
  ends_at timestamptz,
  image_url text,
  is_featured boolean,
  venue_id uuid,
  venue_name text,
  venue_slug text,
  venue_address text,
  venue_city text,
  venue_lat double precision,
  venue_lng double precision,
  venue_image_url text,
  distance_meters double precision,
  rsvp_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    e.id,
    e.title,
    e.description,
    e.category,
    e.starts_at,
    e.ends_at,
    e.image_url,
    e.is_featured,
    v.id as venue_id,
    v.name as venue_name,
    v.slug as venue_slug,
    v.address as venue_address,
    v.city as venue_city,
    v.lat as venue_lat,
    v.lng as venue_lng,
    v.image_url as venue_image_url,
    st_distance(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    (SELECT count(*) FROM rsvps r WHERE r.event_id = e.id) as rsvp_count
  FROM events e
  INNER JOIN venues v ON e.venue_id = v.id
  WHERE
    e.is_published = true
    AND e.moderation_status = 'approved'
    AND v.is_published = true
    AND v.verification_status = 'verified'
    AND e.starts_at >= now()
    AND st_dwithin(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    AND (event_category IS NULL OR e.category = event_category)
  ORDER BY e.is_featured DESC, e.starts_at ASC, distance_meters ASC
  LIMIT result_limit;
$$;
```

### "Happening Now" Function

```sql
CREATE OR REPLACE FUNCTION get_happening_now(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 16093.4
)
RETURNS TABLE (
  -- Same columns as above
  id uuid,
  title text,
  description text,
  category text,
  starts_at timestamptz,
  ends_at timestamptz,
  image_url text,
  is_featured boolean,
  venue_id uuid,
  venue_name text,
  venue_slug text,
  venue_address text,
  venue_city text,
  venue_lat double precision,
  venue_lng double precision,
  venue_image_url text,
  distance_meters double precision,
  rsvp_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    e.id,
    e.title,
    e.description,
    e.category,
    e.starts_at,
    e.ends_at,
    e.image_url,
    e.is_featured,
    v.id as venue_id,
    v.name as venue_name,
    v.slug as venue_slug,
    v.address as venue_address,
    v.city as venue_city,
    v.lat as venue_lat,
    v.lng as venue_lng,
    v.image_url as venue_image_url,
    st_distance(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    (SELECT count(*) FROM rsvps r WHERE r.event_id = e.id) as rsvp_count
  FROM events e
  INNER JOIN venues v ON e.venue_id = v.id
  WHERE
    e.is_published = true
    AND e.moderation_status = 'approved'
    AND v.is_published = true
    AND e.starts_at <= now()
    AND (e.ends_at IS NULL OR e.ends_at >= now())
    AND st_dwithin(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT 20;
$$;
```

-----

## Authentication Setup

### Current Implementation Issues

⚠️ **The current auth setup has these problems:**

1. Using a single client-side Supabase client (`lib/supabase.ts`)
2. Hardcoded credentials in source code (security issue)
3. Not using SSR-compatible auth patterns
4. No auth middleware for route protection

### Required Changes

#### 1. Create environment variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://umlymccdsfccvwmzepye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only for admin operations

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 2. Replace `lib/supabase.ts` with proper SSR clients

**lib/supabase/client.ts** (for client components):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts** (for server components):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

**lib/supabase/middleware.ts**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
```

#### 3. Update `hooks/use-auth.ts`

Change the import to use the new client:

```typescript
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // ... rest of the hook
}
```

#### 4. Add middleware.ts to root

Create `middleware.ts` in the project root:

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

-----

## UI/UX Guidelines

### Design System (Current)

✅ **Already implemented:**
- Mobile-first responsive design
- Dark theme with emerald accent color (#10b981)
- shadcn/ui component library (50+ components)
- Custom fonts: Inter (body), Space Grotesk (headings)
- Smooth animations via Tailwind

### Color Palette (Current)

The app uses a dark theme with HSL color variables:

```css
:root {
  --background: 220 10% 5%;        /* #0B0B0E - Dark background */
  --foreground: 0 0% 100%;         /* White text */
  --primary: 142 76% 36%;          /* #10b981 - Emerald */
  --muted: 217 10% 64%;            /* Muted text */
  --border: 0 0% 100% / 0.1;       /* White 10% opacity */
}
```

### Component Patterns

✅ **Current best practices:**
- Server components by default
- Client components marked with `'use client'`
- Consistent use of shadcn/ui components
- Navigation component shows/hides based on route

📋 **To implement:**
- Skeleton loading states for all async content
- Error boundaries with friendly messages
- Pull-to-refresh on mobile
- Proper SEO metadata for all pages

-----

## Development Workflow

### Current Setup

```bash
# Install dependencies
cd project
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Workflow (Supabase)

⚠️ **Supabase CLI not set up locally yet**

To set up:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in project
cd project
supabase init

# Start local Supabase
supabase start

# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/supabase/types.ts

# Reset database (development only)
supabase db reset
```

### Type Generation

After any schema changes, always regenerate types:

```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

Then use them in your code:

```typescript
import { Database } from '@/lib/supabase/types'

type Event = Database['public']['Tables']['events']['Row']
type Venue = Database['public']['Tables']['venues']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
```

-----

## Code Style & Conventions

### File Naming

✅ **Current conventions:**
- Components: `kebab-case.tsx` (e.g., `auth-modal.tsx`)
- Pages: `page.tsx` (Next.js App Router)
- Hooks: `use-name.ts` (e.g., `use-auth.ts`)
- Utilities: `kebab-case.ts`

### Import Order

```typescript
// 1. External packages
import { useState } from 'react'
import Link from 'next/link'

// 2. Internal absolute paths
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// 3. Components
import { Button } from '@/components/ui/button'
import { EventCard } from './event-card'

// 4. Types
import type { Event, Venue } from '@/lib/supabase/types'
```

### TypeScript Patterns

✅ **Use strict mode** (already enabled in `tsconfig.json`)

```typescript
// ✅ Good - Use generated types
import { Database } from '@/lib/supabase/types'
type Event = Database['public']['Tables']['events']['Row']

// ❌ Bad - Don't define types manually
interface Event {
  id: string
  title: string
  // ...
}
```

### Component Patterns

```typescript
// ✅ Server Component (default)
export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*')

  return <EventList events={events} />
}

// ✅ Client Component (only when needed)
'use client'

export function EventFilter() {
  const [filter, setFilter] = useState('')
  // ... interactive logic
}
```

-----

## Priority Tasks (Roadmap)

### 🔴 Critical (Blocking MVP)

1. **Fix Auth Setup**
   - Move credentials to `.env.local`
   - Implement SSR-compatible Supabase clients
   - Add middleware for auth
   - Update `use-auth` hook

2. **Upgrade Database Schema**
   - Enable PostGIS extension
   - Add geography columns to venues
   - Migrate existing data
   - Update RLS policies
   - Add missing tables (content, photos)

3. **Implement Geolocation**
   - Create `use-location` hook
   - Request user permission
   - Show distance to venues
   - Filter events by radius

4. **Add Maps (Mapbox)**
   - Install `mapbox-gl` and `react-map-gl`
   - Create map component
   - Show venues on map
   - Cluster markers

### 🟡 Important (For Full MVP)

5. **Implement Core Queries**
   - Nearby events query
   - Happening now query
   - Event search

6. **Build Event Pages**
   - Event feed (`/events`)
   - Event detail (`/events/[id]`)
   - Category filters

7. **Improve Venue Pages**
   - List of events at venue
   - Hours display
   - Contact info

8. **RSVP Functionality**
   - RSVP button
   - RSVP count display
   - User's RSVPs on dashboard

### 🟢 Polish (Post-MVP)

9. **Loading & Error States**
   - Skeleton loaders
   - Error boundaries
   - Empty states

10. **SEO & Metadata**
    - Dynamic metadata
    - Open Graph images
    - Sitemap

11. **Performance**
    - Image optimization
    - Code splitting
    - Caching strategy

-----

## Common Gotchas

### 1. PostGIS Geography vs Geometry

⚠️ **Use `geography` for accurate distance calculations in meters.**

```sql
-- ✅ Good - Geography (accurate for real-world distances)
CREATE INDEX venues_geo_idx ON venues USING gist(geo);
WHERE st_dwithin(v.geo, user_point::geography, 16093.4)

-- ❌ Bad - Geometry (planar, inaccurate for lat/lng)
WHERE st_dwithin(v.geom, user_point, 0.1)
```

### 2. RLS + Joins

When using `.select()` with joins, RLS applies to each table separately.

```typescript
// ✅ Both events and venues must be published
const { data } = await supabase
  .from('events')
  .select('*, venue:venues(*)')
  .eq('is_published', true)  // RLS checks this
  // venues.is_published also checked by RLS
```

### 3. Supabase Types

Regenerate types after **every** schema change:

```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

### 4. Anonymous vs Authenticated

RLS policies distinguish between:
- `public` - Anyone (including anonymous)
- `authenticated` - Logged-in users only
- `auth.uid() = user_id` - Specific user

### 5. Server vs Client Components

**Server components:**
- Default in App Router
- Can fetch data directly
- Use `await createClient()` from `lib/supabase/server`

**Client components:**
- Mark with `'use client'`
- For interactivity (useState, onClick, etc.)
- Use `createClient()` from `lib/supabase/client`

### 6. Environment Variables

⚠️ **Never commit `.env.local`** (already in `.gitignore`)

Public variables must start with `NEXT_PUBLIC_`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `SUPABASE_URL` (not accessible in browser)

-----

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Supabase (local)
supabase start                 # Start local Supabase
supabase stop                  # Stop local Supabase
supabase db push               # Apply migrations
supabase db reset              # Reset database (destructive!)
supabase gen types typescript --local > lib/supabase/types.ts

# Database
supabase migration new <name>  # Create new migration
supabase db diff               # Show schema diff
supabase db lint               # Lint SQL

# Deployment
git push origin main           # Triggers CI/CD (if configured)
```

-----

## Things NOT to Build Yet

❌ **Do not implement these without explicit request:**

- Admin panel (use Supabase dashboard)
- Push notifications
- Realtime updates (Supabase Realtime)
- Payment processing
- User reviews/ratings
- Social features (following, sharing, feeds)
- Email notifications
- Analytics dashboard
- Native mobile apps
- Venue claims/verification workflow

-----

## Questions & Assumptions

When in doubt, follow these principles:

1. **Simpler over clever** - Readable code beats clever tricks
2. **Fewer dependencies** - Use built-in features when possible
3. **Working over perfect** - Ship working code, iterate later
4. **Mobile-first** - Most users are on phones
5. **Server by default** - Use server components unless you need interactivity

### Decision Tree

**Should I use a client component?**
- Need useState, useEffect, or event handlers? → Yes
- Just displaying data? → No (use server component)

**Should I add a library?**
- Does Next.js or Tailwind already solve this? → Don't add
- Is it a one-time use? → Write utility function instead
- Widely used and maintained? → OK to add

**Should I create an abstraction?**
- Used in 3+ places? → Maybe abstract
- Used in 1-2 places? → Keep it simple, don't abstract

-----

## Getting Help

1. **Supabase Docs:** https://supabase.com/docs
2. **Next.js Docs:** https://nextjs.org/docs
3. **PostGIS Docs:** https://postgis.net/docs/
4. **Mapbox GL JS:** https://docs.mapbox.com/mapbox-gl-js/
5. **shadcn/ui:** https://ui.shadcn.com/

-----

## Version History

- **v0.1.0** (Current) - Initial setup with basic auth, venues, events
  - ✅ Next.js 13.5.1 + TypeScript + Tailwind
  - ✅ Supabase auth (email/password + Google)
  - ✅ Basic schema (venues, events, rsvps, users)
  - ✅ shadcn/ui component library
  - ⚠️ Missing: PostGIS, geolocation, maps, proper SSR auth

- **v0.2.0** (Target) - MVP with geolocation
  - 📋 PostGIS-enabled database
  - 📋 Mapbox integration
  - 📋 Location-based event discovery
  - 📋 SSR-compatible auth
  - 📋 Event search & filters

---

Last updated: 2026-01-06
