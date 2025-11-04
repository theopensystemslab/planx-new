SELECT cron.schedule(
  'daily-lps-magic-link-cleanup',  
  '0 2 * * *',           
  $$DELETE FROM lps_magic_links WHERE used_at IS NOT NULL OR created_at < now() - INTERVAL '15 minutes'$$
);
