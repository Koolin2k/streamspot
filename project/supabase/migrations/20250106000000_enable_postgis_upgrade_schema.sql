-- =====================================================
-- StreamSpot Database Schema Upgrade
-- Enable PostGIS and upgrade to production-ready schema
-- =====================================================

-- Enable PostGIS extension for geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- Drop old tables and recreate with new schema
-- =====================================================

-- Drop old users table (will be replaced by profiles)
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- Profiles Table (extends auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Update Venues Table with PostGIS
-- =====================================================

-- Add new columns to venues
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text DEFAULT 'DC',
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS hours_json jsonb,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add generated geography column (computed from lat/lng)
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS geo geography(Point, 4326)
  GENERATED ALWAYS AS (
    CASE
      WHEN lat IS NOT NULL AND lng IS NOT NULL
      THEN st_setsrid(st_makepoint(lng, lat), 4326)::geography
      ELSE NULL
    END
  ) STORED;

-- Add constraint for verification status
ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_verification_status_check;
ALTER TABLE venues
  ADD CONSTRAINT venues_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Add unique constraint on slug
ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_slug_key;
ALTER TABLE venues
  ADD CONSTRAINT venues_slug_key UNIQUE (slug);

-- Update existing venues with sample data (you'll need to update this with real data)
UPDATE venues SET
  slug = COALESCE(slug, lower(replace(name, ' ', '-')) || '-' || substr(id::text, 1, 8)),
  city = COALESCE(city, 'Washington'),
  lat = COALESCE(lat, 38.9072),  -- Default to DC coordinates
  lng = COALESCE(lng, -77.0369),
  is_published = COALESCE(is_published, true),
  verification_status = COALESCE(verification_status, 'verified')
WHERE slug IS NULL OR lat IS NULL OR lng IS NULL;

-- =====================================================
-- Content Table (teams, shows, leagues)
-- =====================================================

CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sport', 'team', 'show', 'league', 'other')),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  metadata_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- Update Events Table
-- =====================================================

-- Drop old ENUM type if it exists
DROP TYPE IF EXISTS event_category CASCADE;

-- Add new columns to events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS content_id uuid REFERENCES content(id),
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Rename columns to match new schema
ALTER TABLE events RENAME COLUMN start_time TO starts_at;
ALTER TABLE events RENAME COLUMN end_time TO ends_at;

-- Update category column to text (remove ENUM)
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events
  ALTER COLUMN category TYPE text;
ALTER TABLE events
  ADD CONSTRAINT events_category_check
  CHECK (category IN ('sports', 'tv', 'culture', 'other'));

-- Add moderation status constraint
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_moderation_status_check;
ALTER TABLE events
  ADD CONSTRAINT events_moderation_status_check
  CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Update existing events
UPDATE events SET
  is_published = COALESCE(is_published, true),
  moderation_status = COALESCE(moderation_status, 'approved'),
  category = CASE
    WHEN category = 'shows' THEN 'tv'
    WHEN category = 'movies' THEN 'culture'
    ELSE category
  END;

-- =====================================================
-- Update RSVPs Table
-- =====================================================

-- Add status column for interested/going
ALTER TABLE rsvps
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'going';

-- Add status constraint
ALTER TABLE rsvps
  DROP CONSTRAINT IF EXISTS rsvps_status_check;
ALTER TABLE rsvps
  ADD CONSTRAINT rsvps_status_check
  CHECK (status IN ('interested', 'going'));

-- Update user_id to reference profiles instead of auth.users
ALTER TABLE rsvps
  DROP CONSTRAINT IF EXISTS rsvps_user_id_fkey;
ALTER TABLE rsvps
  ADD CONSTRAINT rsvps_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================================
-- Photos Table
-- =====================================================

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

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Venues indexes
CREATE INDEX IF NOT EXISTS venues_geo_idx ON venues USING gist(geo);
CREATE INDEX IF NOT EXISTS venues_is_published_idx ON venues(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS venues_verification_status_idx ON venues(verification_status);
CREATE INDEX IF NOT EXISTS venues_slug_idx ON venues(slug);

-- Events indexes
CREATE INDEX IF NOT EXISTS events_venue_id_idx ON events(venue_id);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events(starts_at);
CREATE INDEX IF NOT EXISTS events_published_starts_idx ON events(is_published, starts_at)
  WHERE is_published = true;
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);
CREATE INDEX IF NOT EXISTS events_content_id_idx ON events(content_id);

-- RSVPs indexes
CREATE INDEX IF NOT EXISTS rsvps_event_id_idx ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS rsvps_user_id_idx ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS rsvps_status_idx ON rsvps(status);

-- Photos indexes
CREATE INDEX IF NOT EXISTS photos_owner_type_id_idx ON photos(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS photos_created_by_idx ON photos(created_by);

-- Content indexes
CREATE INDEX IF NOT EXISTS content_type_idx ON content(type);
CREATE INDEX IF NOT EXISTS content_slug_idx ON content(slug);

-- =====================================================
-- Updated_at Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS venues_updated_at ON venues;
DROP TRIGGER IF EXISTS events_updated_at ON events;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

-- Create new triggers
CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view venues" ON venues;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Users can view all rsvps" ON rsvps;
DROP POLICY IF EXISTS "Authenticated users can create rsvps" ON rsvps;
DROP POLICY IF EXISTS "Users can delete their own rsvps" ON rsvps;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Venues policies
DROP POLICY IF EXISTS "Published venues are viewable by everyone" ON venues;
CREATE POLICY "Published venues are viewable by everyone"
  ON venues FOR SELECT USING (is_published = true AND verification_status = 'verified');

DROP POLICY IF EXISTS "Users can create venues" ON venues;
CREATE POLICY "Users can create venues"
  ON venues FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Venue owners can update their venues" ON venues;
CREATE POLICY "Venue owners can update their venues"
  ON venues FOR UPDATE USING (auth.uid() = created_by);

-- Events policies
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT USING (
    is_published = true
    AND moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = events.venue_id
      AND venues.is_published = true
      AND venues.verification_status = 'verified'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Event creators can update their events" ON events;
CREATE POLICY "Event creators can update their events"
  ON events FOR UPDATE USING (auth.uid() = created_by);

-- Content policies
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT USING (true);

-- RSVPs policies
DROP POLICY IF EXISTS "RSVPs are viewable by everyone" ON rsvps;
CREATE POLICY "RSVPs are viewable by everyone"
  ON rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create RSVPs" ON rsvps;
CREATE POLICY "Authenticated users can create RSVPs"
  ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own RSVPs" ON rsvps;
CREATE POLICY "Users can update own RSVPs"
  ON rsvps FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own RSVPs" ON rsvps;
CREATE POLICY "Users can delete own RSVPs"
  ON rsvps FOR DELETE USING (auth.uid() = user_id);

-- Photos policies
DROP POLICY IF EXISTS "Photos of published content are viewable" ON photos;
CREATE POLICY "Photos of published content are viewable"
  ON photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON photos;
CREATE POLICY "Authenticated users can upload photos"
  ON photos FOR INSERT WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- PostGIS Helper Functions
-- =====================================================

-- Function to get nearby events
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
    AND v.geo IS NOT NULL
    AND st_dwithin(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    AND (event_category IS NULL OR e.category = event_category)
  ORDER BY e.is_featured DESC, e.starts_at ASC, distance_meters ASC
  LIMIT result_limit;
$$;

-- Function to get events happening now
CREATE OR REPLACE FUNCTION get_happening_now(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 16093.4
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
    AND e.starts_at <= now()
    AND (e.ends_at IS NULL OR e.ends_at >= now())
    AND v.geo IS NOT NULL
    AND st_dwithin(
      v.geo,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT 20;
$$;

-- =====================================================
-- Sample Content Data
-- =====================================================

-- Add some sample sports content
INSERT INTO content (type, name, slug, metadata_json) VALUES
  ('sport', 'Football', 'football', '{"icon": "🏈"}'),
  ('sport', 'Basketball', 'basketball', '{"icon": "🏀"}'),
  ('sport', 'Soccer', 'soccer', '{"icon": "⚽"}'),
  ('league', 'NFL', 'nfl', '{"sport": "football"}'),
  ('league', 'NBA', 'nba', '{"sport": "basketball"}'),
  ('league', 'Premier League', 'premier-league', '{"sport": "soccer"}')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================
