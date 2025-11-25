-- destined to fail!
ALTER TABLE not_a_table 
ADD COLUMN spoof BOOLEAN DEFAULT FALSE;
