# XXX: pg_cron pinned to commit 465b38c (v1.6.7) - please update when bumping image
FROM postgis/postgis:16-3.5

# Compile pg_cron from source, then drop the build deps. See README.md for why this image is
# prebuilt/published and why apt falls back to snapshot.debian.org when the live mirror 404s.
RUN set -eux; \
  cp /etc/apt/sources.list /etc/apt/sources.list.orig; \
  install_deps() { apt-get update && apt-get install -y --no-install-recommends \
    build-essential git ca-certificates postgresql-server-dev-16; }; \
  # if the live mirror fails, retry against the  snapshot
  if ! install_deps; then \
    echo "live mirror failed, falling back to snapshot.debian.org" >&2; \
    sed -e 's|^deb http://deb.debian.org|# deb http://deb.debian.org|' \
        -e 's|^# deb http://snapshot|deb http://snapshot|' \
        /etc/apt/sources.list.orig > /etc/apt/sources.list; \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/80-snapshot; \
    install_deps; \
    rm -f /etc/apt/apt.conf.d/80-snapshot; \
  fi; \
  cp /etc/apt/sources.list.orig /etc/apt/sources.list; \
  rm -f /etc/apt/sources.list.orig; \
  # as a safety catch, this build will automatically fail if we fall far behind in the pg_cron commit history
  git clone https://github.com/citusdata/pg_cron.git --depth 50 /tmp/pg_cron; \
  cd /tmp/pg_cron; \
  git checkout 465b38c737f584d520229f5a1d69d1d44649e4e5; \
  make; \
  make install; \
  rm -rf /tmp/pg_cron; \
  apt-get purge -y --auto-remove build-essential git; \
  apt-get clean; \
  rm -rf /var/lib/apt/lists/*
