-- Add latitude and longitude columns to venues table for geocoding
ALTER TABLE venues 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add an index for spatial queries to improve performance of nearby venue searches
CREATE INDEX idx_venues_location ON venues (latitude, longitude);

-- Add a comment to document the geocoding feature
COMMENT ON COLUMN venues.latitude IS 'Latitude coordinate from geocoded address';
COMMENT ON COLUMN venues.longitude IS 'Longitude coordinate from geocoded address';