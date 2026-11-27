FROM postgres:16-trixie

# PostGIS is pinned (see #7859) - standard apt repository only serves current builds,
# but our package is now in the apt-archive, so we add that as a source to keep the pin resolvable
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && echo "deb [ signed-by=/usr/local/share/keyrings/postgres.gpg.asc ] https://apt-archive.postgresql.org/pub/repos/apt trixie-pgdg-archive main" \
  > /etc/apt/sources.list.d/pgdg-archive.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
  postgresql-16-postgis-3=3.6.4+dfsg-2.pgdg13+1 \
  postgresql-16-postgis-3-scripts=3.6.4+dfsg-2.pgdg13+1 \
  postgresql-16-cron \
  && rm -rf /var/lib/apt/lists/*
