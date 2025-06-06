# build Caddy with the Vultr DNS-01 challenge provider
# see https://caddyserver.com/docs/modules/dns.providers.vultr
FROM caddy:2.10-builder-alpine AS builder
RUN xcaddy build --with github.com/caddy-dns/vultr

# copy only the custom binary into a minimal runtime image
# TODO: we will definitely want to publish this image somewhere (e.g. AWS ECR), rather than build every time
FROM caddy:2.10-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
