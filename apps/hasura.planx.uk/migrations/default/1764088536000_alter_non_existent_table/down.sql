-- inverse of the up migration (which will fail)
ALTER TABLE not_a_table 
DROP COLUMN spoof;
