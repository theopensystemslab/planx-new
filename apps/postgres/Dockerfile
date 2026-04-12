# XXX: pg_cron pinned to commit 465b38c (v1.6.7) - please update when bumping image
FROM postgis/postgis:16-3.5

# install build deps, build pg_cron and remove build deps to keep image small
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git ca-certificates postgresql-server-dev-16 \
  # as a safety catch, this build will automatically fail if we fall far behind in the pg_cron commit history
  && git clone https://github.com/citusdata/pg_cron.git --depth 50 /tmp/pg_cron \
  && cd /tmp/pg_cron \
  && git checkout 465b38c737f584d520229f5a1d69d1d44649e4e5 \
  && make \
  && make install \
  && rm -rf /tmp/pg_cron \
  && apt-get purge -y --auto-remove build-essential git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
