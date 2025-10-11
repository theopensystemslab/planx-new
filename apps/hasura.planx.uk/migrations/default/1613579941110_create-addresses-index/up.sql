CREATE INDEX IF NOT EXISTS "postcode_hash_idx" ON address_base USING hash(postcode);
