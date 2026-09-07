# XXX: pg_cron pinned to commit 465b38c (v1.6.7) - please update when bumping image
FROM postgis/postgis:16-3.5

# install build deps, build pg_cron and remove build deps to keep image small
RUN set -eux; \
  # The deb.debian.org CDN can cache a 404 for hours, blocking PRs, Vultr, or regression tests
  # Retry on a different CDN if we hit issues
  cp /etc/apt/sources.list /etc/apt/sources.list.orig; \
  apt_ok=0; \
  for mirror in deb.debian.org cloudfront.debian.net; do \
    sed "s|deb.debian.org|$mirror|g" /etc/apt/sources.list.orig > /etc/apt/sources.list; \
    if apt-get update && apt-get install -y --no-install-recommends \
        build-essential git ca-certificates postgresql-server-dev-16; then \
      apt_ok=1; break; \
    fi; \
    echo "apt failed via $mirror, trying next mirror..." >&2; \
  done; \
  [ "$apt_ok" = 1 ] || { echo "apt failed on all mirrors" >&2; exit 1; }; \
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
