FROM postgres:16-trixie

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       postgresql-16-postgis-3=3.6.4+dfsg-2.pgdg13+1 \
       postgresql-16-postgis-3-scripts=3.6.4+dfsg-2.pgdg13+1 \
       postgresql-16-cron \
  && rm -rf /var/lib/apt/lists/*