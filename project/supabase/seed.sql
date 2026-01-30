-- seed.sql
-- StreamSpot seed data for DMV area
-- Run after migrations: psql $DATABASE_URL -f supabase/seed.sql

-- ============================================================================
-- VENUES
-- 20 real sports bars and watch party venues in the Washington DC metro area
-- Coordinates verified via search results
-- ============================================================================

INSERT INTO venues (name, slug, description, address, city, state, zip, lat, lng, phone, website, is_published, verification_status) VALUES

-- Navy Yard / Capitol Riverfront (near Nationals Park & Audi Field)
(
  'Walter''s Sports Bar',
  'walters-sports-bar',
  'Navy Yard''s top choice for sports, beers, and burgers. Named after legendary Senators pitcher Walter Johnson. Features 30+ TVs, a 220" screen, and a 24-tap self-pour beer wall.',
  '10 N St SE',
  'Washington',
  'DC',
  '20003',
  38.8748,
  -77.0087,
  '(202) 499-3919',
  'https://www.waltersdc.com',
  true,
  'verified'
),
(
  'Mission Navy Yard',
  'mission-navy-yard',
  'Massive two-story Tex-Mex restaurant across from Nationals Park. Four bars including a 150-foot bar, outdoor balconies, and 16 draft beers. Perfect for watching sports with tacos and tequila.',
  '1221 Van St SE',
  'Washington',
  'DC',
  '20003',
  38.8753,
  -77.0074,
  '(202) 810-7010',
  'https://www.missionnavyyard.com',
  true,
  'verified'
),
(
  'Tom''s Watch Bar Navy Yard',
  'toms-watch-bar-navy-yard',
  'DC''s biggest sports bar experience with 50+ screens and 360° viewing. Every game, every day. Full audio for major matchups and chef-driven elevated bar food.',
  '1201 Half St SE',
  'Washington',
  'DC',
  '20003',
  38.8768,
  -77.0078,
  '(202) 888-2688',
  'https://tomswatchbar.com/navy-yard/',
  true,
  'verified'
),

-- Penn Quarter / Chinatown (near Capital One Arena)
(
  'Penn Quarter Sports Tavern',
  'penn-quarter-sports-tavern',
  'Voted DC''s Best Sports Bar repeatedly by Washington Post. Three blocks from Capital One Arena with 2 full bars, outdoor seating, and multiple TVs. A neighborhood favorite since 2004.',
  '639 Indiana Ave NW',
  'Washington',
  'DC',
  '20004',
  38.8936,
  -77.0213,
  '(202) 347-6666',
  'https://www.pennquartersportstavern.com',
  true,
  'verified'
),

-- U Street Corridor
(
  'Nellie''s Sports Bar',
  'nellies-sports-bar',
  'DC''s beloved LGBTQ+ friendly sports bar. Features rooftop deck, 10+ flat-panel TVs, a stadium-sized screen, and famous drag brunches. Home of the "Eat, Drink, and Be Nellie" motto.',
  '900 U St NW',
  'Washington',
  'DC',
  '20001',
  38.9169,
  -77.0254,
  '(202) 332-6355',
  'https://www.nelliessportsbar.com',
  true,
  'verified'
),
(
  'Sports & Social DC',
  'sports-and-social-dc',
  'DC''s newest premier sports watching destination on U Street. Features a 25-foot LED media wall, FanDuel sportsbook integration, and elevated bar food from the Fried Rice Collective team.',
  '1314 U St NW',
  'Washington',
  'DC',
  '20009',
  38.9170,
  -77.0312,
  '(202) 449-5583',
  'https://sportsandsocial.com/dc/',
  true,
  'verified'
),
(
  'Exiles Bar',
  'exiles-bar',
  '2023 Rammy Award winner for Best Bar. Official home for Buffalo Bills, Liverpool FC, Penn State, and UNC basketball fans. Two floors with great wings and Irish hospitality.',
  '1610 U St NW',
  'Washington',
  'DC',
  '20009',
  38.9169,
  -77.0363,
  '(202) 232-2171',
  'https://www.exilesbar.com',
  true,
  'verified'
),
(
  'Franklin Hall',
  'franklin-hall',
  '11,000 sq ft beer hall in the historic Manhattan Laundry building. Official Arsenal bar in DC. 36 taps, communal tables, pool tables, and a self-service model that keeps lines short.',
  '1348 Florida Ave NW',
  'Washington',
  'DC',
  '20009',
  38.9188,
  -77.0310,
  '(202) 750-8646',
  'https://www.franklinhalldc.com',
  true,
  'verified'
),

-- Shaw
(
  'Ivy & Coney',
  'ivy-and-coney',
  'Chicago and Detroit-themed dive bar. Home for Cubs, Tigers, Bears, and Lions fans. Cash only, no-frills vibe with Chicago dogs, Detroit coney dogs, and Malört shots.',
  '1537 7th St NW',
  'Washington',
  'DC',
  '20001',
  38.9117,
  -77.0218,
  '(202) 670-9489',
  'https://www.ivyandconey.com',
  true,
  'verified'
),

-- NoMa
(
  'Red Bear Brewing',
  'red-bear-brewing',
  'Inclusive craft brewery in the historic Uline Arena (where the Beatles played in 1964). 24 taps, giant projection screen, Nats and Caps watch parties, drag brunches, and board games.',
  '209 M St NE',
  'Washington',
  'DC',
  '20002',
  38.9054,
  -77.0025,
  '(202) 849-6130',
  'https://www.redbear.beer',
  true,
  'verified'
),

-- Dupont Circle
(
  'Board Room',
  'board-room',
  'DC''s original board game and sports bar. Catch games on multiple TVs while playing classic board games. Happy hour daily until 7pm with $4 beers.',
  '1737 Connecticut Ave NW',
  'Washington',
  'DC',
  '20009',
  38.9132,
  -77.0447,
  '(202) 518-7666',
  'https://boardroomdc.com',
  true,
  'verified'
),
(
  'Across The Pond',
  'across-the-pond',
  'British-style pub in Dupont Circle. Premier League, rugby, and international sports focus. 11 TVs including a projection screen, authentic pub atmosphere.',
  '1734 Connecticut Ave NW',
  'Washington',
  'DC',
  '20009',
  38.9130,
  -77.0445,
  '(202) 836-2050',
  'https://www.acrosstheponddc.com',
  true,
  'verified'
),

-- Downtown / Farragut
(
  'Blackfinn Ameripub',
  'blackfinn-ameripub',
  'Upscale sports bar one block from the White House. Modern American pub fare, craft beers, and plenty of TVs. Popular for Chiefs fans and watch parties.',
  '1620 I St NW',
  'Washington',
  'DC',
  '20006',
  38.9013,
  -77.0376,
  '(202) 429-4350',
  'https://www.blackfinndc.com',
  true,
  'verified'
),

-- H Street NE
(
  'Dirty Water',
  'dirty-water',
  'New England sports bar on H Street. Decked out in Patriots, Red Sox, Celtics, and Bruins gear. Home away from home for displaced Boston fans.',
  '816 H St NE',
  'Washington',
  'DC',
  '20002',
  38.9001,
  -76.9959,
  '(202) 847-4468',
  'https://www.dirtywaterdc.com',
  true,
  'verified'
),

-- Capitol Hill
(
  'Union Pub',
  'union-pub',
  'Capitol Hill''s go-to watering hole for sports fans and neighborhood regulars. Official Bears bar with solid pub food and a great beer selection.',
  '201 Massachusetts Ave NE',
  'Washington',
  'DC',
  '20002',
  38.8945,
  -77.0029,
  '(202) 546-7200',
  'https://www.unionpubdc.com',
  true,
  'verified'
),

-- Adams Morgan
(
  'Grand Central',
  'grand-central',
  'Adams Morgan sports bar with sportsbook vibes. Official Bills Backers bar with serious Buffalo energy. Multiple TVs and a rowdy game day atmosphere.',
  '2447 18th St NW',
  'Washington',
  'DC',
  '20009',
  38.9214,
  -77.0424,
  '(202) 986-1742',
  'https://www.grandcentraldc.com',
  true,
  'verified'
),

-- Bloomingdale
(
  'Boundary Stone',
  'boundary-stone',
  'Neighborhood pub and go-to Eagles watch spot in DC. Hearty food, craft brews, and a lively community vibe where Philly fans gather.',
  '116 Rhode Island Ave NW',
  'Washington',
  'DC',
  '20001',
  38.9135,
  -77.0127,
  '(202) 621-6635',
  'https://www.boundarystone.com',
  true,
  'verified'
),

-- Georgetown
(
  'Church Hall',
  'church-hall',
  'Georgetown''s spot for a memorable game night. Happy hour weekdays 5-7pm with $5 beers. 17 flat screens throughout so you won''t miss any action.',
  '1070 Wisconsin Ave NW',
  'Washington',
  'DC',
  '20007',
  38.9044,
  -77.0633,
  '(202) 827-8779',
  'https://www.churchhalldc.com',
  true,
  'verified'
),

-- Clarendon (Arlington)
(
  'Whitlow''s on Wilson',
  'whitlows-on-wilson',
  'Arlington institution since 1946. Rooftop bar, multiple rooms with TVs, and a neighborhood feel. Great for Commanders and DC sports fans.',
  '2854 Wilson Blvd',
  'Arlington',
  'VA',
  '22201',
  38.8872,
  -77.0944,
  '(703) 276-9693',
  'https://www.whitlows.com',
  true,
  'verified'
),

-- Herndon (Northern Virginia)
(
  'Jimmy''s Old Town Tavern',
  'jimmys-old-town-tavern',
  'Northern Virginia''s legendary sports bar. Official Bills bar that opens at 7am for games. They even run buses to Commanders games. A true destination for dedicated fans.',
  '697 Spring St',
  'Herndon',
  'VA',
  '20170',
  38.9694,
  -77.3861,
  '(703) 435-5467',
  'https://www.jimmysoldtown.com',
  true,
  'verified'
);

-- ============================================================================
-- CONTENT
-- Teams, leagues, and shows that events can reference
-- ============================================================================

INSERT INTO content (type, name, slug, metadata_json) VALUES
-- DC Teams
('team', 'Washington Commanders', 'washington-commanders', '{"league": "NFL", "sport": "football"}'),
('team', 'Washington Nationals', 'washington-nationals', '{"league": "MLB", "sport": "baseball"}'),
('team', 'Washington Wizards', 'washington-wizards', '{"league": "NBA", "sport": "basketball"}'),
('team', 'Washington Capitals', 'washington-capitals', '{"league": "NHL", "sport": "hockey"}'),
('team', 'Washington Mystics', 'washington-mystics', '{"league": "WNBA", "sport": "basketball"}'),
('team', 'DC United', 'dc-united', '{"league": "MLS", "sport": "soccer"}'),

-- Popular visiting teams (for away game watch parties)
('team', 'Dallas Cowboys', 'dallas-cowboys', '{"league": "NFL", "sport": "football"}'),
('team', 'Philadelphia Eagles', 'philadelphia-eagles', '{"league": "NFL", "sport": "football"}'),
('team', 'Buffalo Bills', 'buffalo-bills', '{"league": "NFL", "sport": "football"}'),
('team', 'Chicago Bears', 'chicago-bears', '{"league": "NFL", "sport": "football"}'),
('team', 'New England Patriots', 'new-england-patriots', '{"league": "NFL", "sport": "football"}'),
('team', 'Pittsburgh Steelers', 'pittsburgh-steelers', '{"league": "NFL", "sport": "football"}'),

-- Soccer
('team', 'Liverpool FC', 'liverpool-fc', '{"league": "Premier League", "sport": "soccer"}'),
('team', 'Arsenal FC', 'arsenal-fc', '{"league": "Premier League", "sport": "soccer"}'),
('team', 'Manchester United', 'manchester-united', '{"league": "Premier League", "sport": "soccer"}'),
('team', 'Chelsea FC', 'chelsea-fc', '{"league": "Premier League", "sport": "soccer"}'),

-- College
('team', 'Maryland Terrapins', 'maryland-terrapins', '{"conference": "Big Ten", "sport": "multiple"}'),
('team', 'Georgetown Hoyas', 'georgetown-hoyas', '{"conference": "Big East", "sport": "basketball"}'),
('team', 'Virginia Cavaliers', 'virginia-cavaliers', '{"conference": "ACC", "sport": "multiple"}'),
('team', 'Penn State', 'penn-state', '{"conference": "Big Ten", "sport": "multiple"}'),
('team', 'Michigan Wolverines', 'michigan-wolverines', '{"conference": "Big Ten", "sport": "multiple"}'),
('team', 'UNC Tar Heels', 'unc-tar-heels', '{"conference": "ACC", "sport": "basketball"}'),
('team', 'Chicago Cubs', 'chicago-cubs', '{"league": "MLB", "sport": "baseball"}'),
('team', 'Detroit Tigers', 'detroit-tigers', '{"league": "MLB", "sport": "baseball"}'),

-- Leagues (for generic league events)
('league', 'NFL', 'nfl', '{"sport": "football"}'),
('league', 'NBA', 'nba', '{"sport": "basketball"}'),
('league', 'MLB', 'mlb', '{"sport": "baseball"}'),
('league', 'NHL', 'nhl', '{"sport": "hockey"}'),
('league', 'Premier League', 'premier-league', '{"sport": "soccer"}'),
('league', 'MLS', 'mls', '{"sport": "soccer"}'),
('league', 'UFC', 'ufc', '{"sport": "mma"}'),
('league', 'NCAA Football', 'ncaa-football', '{"sport": "football"}'),
('league', 'NCAA Basketball', 'ncaa-basketball', '{"sport": "basketball"}'),

-- TV Shows (for watch parties)
('show', 'RuPaul''s Drag Race', 'rupauls-drag-race', '{"network": "VH1/Paramount+"}'),
('show', 'House of the Dragon', 'house-of-the-dragon', '{"network": "HBO"}'),
('show', 'The Bachelor', 'the-bachelor', '{"network": "ABC"}');

-- ============================================================================
-- SAMPLE EVENTS
-- A few example events to demonstrate the data model
-- Note: In production, you'd create events with real upcoming dates
-- ============================================================================

-- Get venue IDs for sample events
-- These use NOW() + intervals so they're always in the future when seeded

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'NFL Sunday Ticket - All Games',
  'sports',
  (date_trunc('week', NOW()) + interval '6 days' + interval '13 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '6 days' + interval '23 hours')::timestamptz,
  'Catch all the NFL action on our 30+ screens. Drink specials all day.',
  true,
  'approved',
  true
FROM venues v WHERE v.slug = 'walters-sports-bar';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Bills vs Commanders Watch Party',
  'sports',
  (date_trunc('week', NOW()) + interval '6 days' + interval '13 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '6 days' + interval '16 hours')::timestamptz,
  'Official Bills Backers watch party. $20 buckets, wing specials, and 50/50 raffle.',
  true,
  'approved',
  true
FROM venues v WHERE v.slug = 'exiles-bar';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Arsenal vs Chelsea - Premier League',
  'sports',
  (date_trunc('week', NOW()) + interval '5 days' + interval '12 hours' + interval '30 minutes')::timestamptz,
  (date_trunc('week', NOW()) + interval '5 days' + interval '15 hours')::timestamptz,
  'Doors open 1 hour before kickoff. Full English breakfast available.',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'franklin-hall';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Liverpool Match Day',
  'sports',
  (date_trunc('week', NOW()) + interval '5 days' + interval '10 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '5 days' + interval '12 hours')::timestamptz,
  'Exiles Reds watch party. Early doors, full sound, YNWA.',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'exiles-bar';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Drag Brunch',
  'culture',
  (date_trunc('week', NOW()) + interval '6 days' + interval '13 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '6 days' + interval '15 hours')::timestamptz,
  'All-you-can-eat buffet with a show! Reservations recommended.',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'nellies-sports-bar';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Cubs vs Cardinals Watch Party',
  'sports',
  (date_trunc('week', NOW()) + interval '3 days' + interval '19 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '3 days' + interval '22 hours')::timestamptz,
  'Chicago dogs, Malört shots, and a rivalry game on the TVs.',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'ivy-and-coney';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Monday Night Football',
  'sports',
  (date_trunc('week', NOW()) + interval '7 days' + interval '20 hours' + interval '15 minutes')::timestamptz,
  (date_trunc('week', NOW()) + interval '7 days' + interval '23 hours' + interval '30 minutes')::timestamptz,
  'MNF on the big screen with full audio. Happy hour prices until kickoff.',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'penn-quarter-sports-tavern';

INSERT INTO events (venue_id, title, category, starts_at, ends_at, description, is_published, moderation_status, is_featured)
SELECT
  v.id,
  'Trivia Night',
  'culture',
  (date_trunc('week', NOW()) + interval '2 days' + interval '19 hours')::timestamptz,
  (date_trunc('week', NOW()) + interval '2 days' + interval '21 hours')::timestamptz,
  'Test your knowledge at District Trivia. Free to play, prizes for winners!',
  true,
  'approved',
  false
FROM venues v WHERE v.slug = 'red-bear-brewing';

-- ============================================================================
-- VERIFICATION
-- Quick check that data was inserted correctly
-- ============================================================================

DO $$
DECLARE
  venue_count INT;
  content_count INT;
  event_count INT;
BEGIN
  SELECT COUNT(*) INTO venue_count FROM venues;
  SELECT COUNT(*) INTO content_count FROM content;
  SELECT COUNT(*) INTO event_count FROM events;

  RAISE NOTICE 'Seed data loaded successfully:';
  RAISE NOTICE '  - Venues: %', venue_count;
  RAISE NOTICE '  - Content: %', content_count;
  RAISE NOTICE '  - Events: %', event_count;
END $$;
