-- Sample DC Venues and Events for Testing
-- Run this in your Supabase SQL Editor to populate test data

-- Insert DC Venues
INSERT INTO venues (name, slug, description, address, city, state, zip, lat, lng, phone, website, verification_status, is_published) VALUES
(
  'Penn Social',
  'penn-social',
  'Multi-level bar and restaurant with bowling, bocce, and sports viewing. Great for game day!',
  '801 E St NW',
  'Washington',
  'DC',
  '20004',
  38.8959,
  -77.0223,
  '(202) 552-2006',
  'https://www.pennsocialdc.com',
  'verified',
  true
),
(
  'Bluejacket Brewery',
  'bluejacket-brewery',
  'Craft brewery with a massive beer list and rotating taps. Modern space with great food.',
  '300 Tingey St SE',
  'Washington',
  'DC',
  '20003',
  38.8763,
  -77.0025,
  '(202) 524-4862',
  'https://www.bluejacketdc.com',
  'verified',
  true
),
(
  'Dacha Beer Garden',
  'dacha-beer-garden',
  'German-style beer garden with communal tables and lively atmosphere. Perfect for soccer matches!',
  '1600 7th St NW',
  'Washington',
  'DC',
  '20001',
  38.9122,
  -77.0217,
  '(202) 350-9888',
  'https://dachadc.com',
  'verified',
  true
),
(
  'Songbyrd Music House',
  'songbyrd-music-house',
  'Record store, bar, and music venue rolled into one. Eclectic events and great vibes.',
  '2477 18th St NW',
  'Washington',
  'DC',
  '20009',
  38.9198,
  -77.0417,
  '(202) 450-2917',
  'https://www.songbyrddc.com',
  'verified',
  true
),
(
  'Rocket Bar',
  'rocket-bar',
  'Classic dive bar with pinball, arcade games, and sports on TV. Casual and fun.',
  '714 7th St NW',
  'Washington',
  'DC',
  '20001',
  38.9010,
  -77.0219,
  '(202) 628-7665',
  'https://www.rocketbardc.com',
  'verified',
  true
),
(
  'Decades DC',
  'decades-dc',
  'Multi-floor club and bar featuring different decades of music. Great for themed events.',
  '1219 Connecticut Ave NW',
  'Washington',
  'DC',
  '20036',
  38.9068,
  -77.0406,
  '(202) 835-2280',
  'https://www.decadesdc.com',
  'verified',
  true
);

-- Insert some upcoming events
INSERT INTO events (title, description, category, starts_at, ends_at, venue_id, is_featured, is_published, moderation_status) VALUES
(
  'Monday Night Football Watch Party',
  'Join us for MNF! Drink specials and wing buckets all night.',
  'sports',
  NOW() + INTERVAL '2 hours',
  NOW() + INTERVAL '5 hours',
  (SELECT id FROM venues WHERE slug = 'penn-social'),
  true,
  true,
  'approved'
),
(
  'NBA GameTime: Wizards vs Lakers',
  'Catch the Wizards take on the Lakers. Multiple screens, great atmosphere!',
  'sports',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 3 hours',
  (SELECT id FROM venues WHERE slug = 'rocket-bar'),
  true,
  true,
  'approved'
),
(
  'Trivia Night',
  'Weekly trivia with prizes! Teams of up to 6. Free to play.',
  'culture',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days 2 hours',
  (SELECT id FROM venues WHERE slug = 'bluejacket-brewery'),
  false,
  true,
  'approved'
),
(
  'Premier League Morning: Arsenal vs Chelsea',
  'Early kickoff! Full English breakfast available. Come support your club!',
  'sports',
  NOW() + INTERVAL '3 days 8 hours',
  NOW() + INTERVAL '3 days 10 hours',
  (SELECT id FROM venues WHERE slug = 'dacha-beer-garden'),
  true,
  true,
  'approved'
),
(
  'Indie Rock Showcase',
  'Local bands performing all night. $10 cover, 21+.',
  'culture',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days 4 hours',
  (SELECT id FROM venues WHERE slug = 'songbyrd-music-house'),
  false,
  true,
  'approved'
),
(
  '90s Hip Hop Night',
  'Throwback Thursday! Best 90s hip hop all night on the main floor.',
  'culture',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days 5 hours',
  (SELECT id FROM venues WHERE slug = 'decades-dc'),
  false,
  true,
  'approved'
),
(
  'UFC Fight Night',
  'PPV event on all screens. Come early for good seats!',
  'sports',
  NOW() + INTERVAL '6 days',
  NOW() + INTERVAL '6 days 4 hours',
  (SELECT id FROM venues WHERE slug = 'penn-social'),
  true,
  true,
  'approved'
),
(
  'College Basketball: Georgetown Watch Party',
  'Hoyas game watch party! Specials on Georgetown-themed drinks.',
  'sports',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days 2 hours',
  (SELECT id FROM venues WHERE slug = 'rocket-bar'),
  false,
  true,
  'approved'
);

-- Verify the data
SELECT
  v.name as venue_name,
  e.title as event_title,
  e.category,
  e.starts_at,
  ST_AsText(v.geo) as coordinates
FROM events e
JOIN venues v ON e.venue_id = v.id
ORDER BY e.starts_at;
