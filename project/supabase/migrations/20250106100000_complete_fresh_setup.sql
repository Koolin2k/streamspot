-- =====================================================
-- StreamSpot Complete Database Setup
-- Fresh installation with PostGIS
-- =====================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- Profiles Table (extends auth.users)
-- =====================================================

CREATE TABLE profiles (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Venues Table (with PostGIS)
-- =====================================================

CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL DEFAULT 'Washington',
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
  verification_status text DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Content Table (teams, shows, leagues)
-- =====================================================

CREATE TABLE content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sport', 'team', 'show', 'league', 'other')),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  metadata_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- Events Table
-- =====================================================

CREATE TABLE events (
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

-- =====================================================
-- RSVPs Table
-- =====================================================

CREATE TABLE rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('interested', 'going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- Photos Table
-- =====================================================

CREATE TABLE photos (
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
-- Indexes
-- =====================================================

CREATE INDEX venues_geo_idx ON venues USING gist(geo);
CREATE INDEX venues_is_published_idx ON venues(is_published) WHERE is_published = true;
CREATE INDEX venues_slug_idx ON venues(slug);
CREATE INDEX events_venue_id_idx ON events(venue_id);
CREATE INDEX events_starts_at_idx ON events(starts_at);
CREATE INDEX events_published_starts_idx ON events(is_published, starts_at) WHERE is_published = true;
CREATE INDEX events_category_idx ON events(category);
CREATE INDEX rsvps_event_id_idx ON rsvps(event_id);
CREATE INDEX rsvps_user_id_idx ON rsvps(user_id);

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

CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Published venues viewable" ON venues FOR SELECT USING (is_published = true AND verification_status = 'verified');
CREATE POLICY "Users create venues" ON venues FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update venues" ON venues FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Published events viewable" ON events FOR SELECT USING (is_published = true AND moderation_status = 'approved');
CREATE POLICY "Users create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators update events" ON events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Content viewable" ON content FOR SELECT USING (true);

CREATE POLICY "RSVPs viewable" ON rsvps FOR SELECT USING (true);
CREATE POLICY "Users create RSVPs" ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update RSVPs" ON rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete RSVPs" ON rsvps FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Photos viewable" ON photos FOR SELECT USING (true);
CREATE POLICY "Users upload photos" ON photos FOR INSERT WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- PostGIS Functions
-- =====================================================

CREATE OR REPLACE FUNCTION get_nearby_events(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 16093.4,
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
  venue_name text,
  venue_address text,
  venue_city text,
  venue_lat double precision,
  venue_lng double precision,
  distance_meters double precision
)
LANGUAGE sql STABLE
AS $$
  SELECT
    e.id, e.title, e.description, e.category, e.starts_at, e.ends_at,
    v.name, v.address, v.city, v.lat, v.lng,
    st_distance(v.geo, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) as distance_meters
  FROM events e
  INNER JOIN venues v ON e.venue_id = v.id
  WHERE e.is_published = true
    AND e.moderation_status = 'approved'
    AND v.is_published = true
    AND e.starts_at >= now()
    AND st_dwithin(v.geo, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, radius_meters)
    AND (event_category IS NULL OR e.category = event_category)
  ORDER BY e.starts_at ASC, distance_meters ASC
  LIMIT result_limit;
$$;

-- =====================================================
-- Sample Data
-- =====================================================

INSERT INTO content (type, name, slug, metadata_json) VALUES
  ('sport', 'Football', 'football', '{"icon": "🏈"}'),
  ('sport', 'Basketball', 'basketball', '{"icon": "🏀"}'),
  ('league', 'NFL', 'nfl', '{"sport": "football"}'),
  ('league', 'NBA', 'nba', '{"sport": "basketball"}');

INSERT INTO venues (name, slug, address, city, state, lat, lng, description) VALUES
  ('The Gridman Pub', 'gridman-pub', '123 Main St', 'Washington', 'DC', 38.9072, -77.0369, 'Cozy neighborhood pub'),
  ('Sports Central', 'sports-central', '456 Oak Ave', 'Washington', 'DC', 38.9100, -77.0400, 'Ultimate sports destination'),
  ('Cozy Corner Café', 'cozy-corner', '789 Pine St', 'Washington', 'DC', 38.9050, -77.0350, 'Welcoming café');
