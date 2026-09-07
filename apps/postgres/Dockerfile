FROM postgis/postgis:16-3.5

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-16-cron \
  && rm -rf /var/lib/apt/lists/*
