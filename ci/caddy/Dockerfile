# build Caddy with the Vultr DNS-01 challenge provider
FROM caddy:2.10-builder-alpine AS builder
# see https://caddyserver.com/docs/modules/dns.providers.vultr
RUN xcaddy build --with github.com/caddy-dns/vultr

# copy only the custom binary into a minimal runtime image
FROM caddy:2.10-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
