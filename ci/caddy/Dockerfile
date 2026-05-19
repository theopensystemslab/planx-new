# check=skip=FromPlatformFlagConstDisallowed
# ^ we build caddy for Vultr instances (i.e. Alpine), so we suppress warnings re hardcoding the platform

# XXX: if updating this file, also update the image on Vultr CR (see README)
# build Caddy with the Vultr DNS-01 challenge provider
# see https://caddyserver.com/docs/modules/dns.providers.vultr
FROM --platform=linux/amd64 caddy:2.11-builder-alpine AS builder
RUN xcaddy build --with github.com/caddy-dns/vultr@v0.0.0-20250723121531-55bf3e9768be

# copy only the custom binary into a minimal runtime image
FROM --platform=linux/amd64 caddy:2.11-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
