FROM postgis/postgis:17-3.5

# install build deps, build pg_cron and remove build deps to keep image small
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       build-essential git ca-certificates postgresql-server-dev-16 \
  && git clone --depth 1 https://github.com/citusdata/pg_cron.git /tmp/pg_cron \
  && cd /tmp/pg_cron \
  && make \
  && make install \
  && rm -rf /tmp/pg_cron \
  && apt-get purge -y --auto-remove build-essential git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*