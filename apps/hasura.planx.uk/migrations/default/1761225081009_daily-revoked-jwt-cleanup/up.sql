SELECT cron.schedule(
  'daily-revoked-jwt-cleanup',
  '0 2 * * *',
  $$DELETE FROM revoked_tokens WHERE expires_at < now()$$
);
