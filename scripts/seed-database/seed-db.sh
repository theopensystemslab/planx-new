cd /hasura/

hasura seeds apply

cd /scripts/

pnpm upsert-flows

echo "Fixing published_flows id sequence"
psql "${PG_URL}" < "./fix_id_sequence.sql"