-- Create custom types
CREATE TYPE event_category AS ENUM ('sports', 'shows', 'movies');

-- Create tables
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  category event_category NOT NULL DEFAULT 'shows',
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  max_capacity integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view events" ON events FOR SELECT TO public USING (true);
CREATE POLICY "Users can view all rsvps" ON rsvps FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create rsvps" ON rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rsvps" ON rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sample data
INSERT INTO venues (name, address, description, image_url) VALUES
  ('The Gridman Pub', '123 Main St, Chicago, IL 60614', 'A cozy neighborhood pub perfect for watching your favorite shows and sports.', 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg'),
  ('Sports Central', '456 Oak Ave, Chicago, IL 60610', 'The ultimate sports viewing destination with big screens and great food.', 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg'),
  ('Cozy Corner Café', '789 Pine St, Chicago, IL 60611', 'A welcoming café atmosphere perfect for intimate viewing parties.', 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg');

INSERT INTO events (title, description, start_time, end_time, category, venue_id, max_capacity)
SELECT 'The Bears 4-nge 8', 'Watch the latest episode with fellow fans', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'shows', v.id, 25 FROM venues v WHERE v.name = 'The Gridman Pub';

INSERT INTO events (title, description, start_time, end_time, category, venue_id, max_capacity)
SELECT 'NBA Finals Game 6', 'Championship showdown viewing party', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3.5 hours', 'sports', v.id, 40 FROM venues v WHERE v.name = 'Sports Central';

INSERT INTO events (title, description, start_time, end_time, category, venue_id, max_capacity)
SELECT 'Stranger Things Finale', 'Season finale watch party with snacks included', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '5 hours', 'shows', v.id, 20 FROM venues v WHERE v.name = 'Cozy Corner Café';
