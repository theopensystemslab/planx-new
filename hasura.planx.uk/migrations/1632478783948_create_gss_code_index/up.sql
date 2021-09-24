CREATE INDEX IF NOT EXISTS "gss_code_hash_idx" ON address_base USING hash(gss_code);
