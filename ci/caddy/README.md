# Caddy

We use a Caddy server (in a Docker container) as a reverse proxy on our Vultr/pizza builds.

## Automatic HTTPS

Caddy [automatically provisions SSL certificates](https://caddyserver.com/docs/automatic-https) so that we don't have to. With the setup given in the `Caddyfile`, it goes one further, and provisions a [single wilcard cert](https://caddyserver.com/docs/caddyfile/patterns#wildcard-certificates). This ideally stops us from hitting the 50/week cap imposed by LetsEncrypt.

In order to allow the caddy container to solve the [DNS-01 challenge](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge), it needs to control our Vultr DNS setup, so we bake the [caddy-dns/vultr module](https://github.com/caddy-dns/vultr) into the image, as per the `Dockerfile`.

## Debugging

To see verbose logs for the caddy container, add the `debug` directive to the global options. If testing the setup, you can also make use of the LetsEncrypt's staging server using the `acme_ca` directive. To access the admin API from the pizza (but outside the container), use the `admin` directive. For example:

```
{
  email {$TLS_EMAIL}
  debug
  acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
  admin 0.0.0.0:2019
}
```

## `tls` options

The propagation knobs should be understood like so: wait for `propagation_delay` before starting poll of DNS records (after attempting to write them to Vultr), then keep trying to verify success for `propagation_timeout`, before handing over to the ACME server.

Note also that Docker's embedded DNS breaks CertMagic polling, meaning Caddy can't verify the successful writing of appropriate DNS records, so we explicitly set public [resolvers](https://caddyserver.com/docs/caddyfile/directives/tls#resolvers) (specifically Cloudflare and Google).

## Building the image

We bake the caddy-dns/vultr plugin into a standard caddy image using [xcaddy](https://caddyserver.com/docs/build#xcaddy), as per the `Dockerfile`. This means the final image doesn't require a Go installation, saving several GB.

See also comprehensive documentation and examples from Vultr [here](https://docs.vultr.com/how-to-build-a-docker-image).

Should you make any changes to the Dockerfile, the following commands should suffice to rebuild the image from scratch and push it to the Vultr container registry (assuming your working directory is `/ci/caddy/`):

```
docker login $VULTR_CR_URN -u $VULTR_CR_ID -p $VULTR_CR_API_KEY
docker build --no-cache -t caddy-vultr:latest .
docker tag caddy-vultr:latest "$VULTR_CR_URN/caddy-vultr:latest"
docker push "$VULTR_CR_URN/caddy-vultr:latest"
```

NB. The `%VULTR...` env vars should be available in your `.env`! `$VULTR_CR_URN` is not a secret (at time of writing, it is `lhr.vultrcr.com/planx`), but we use the variable in case it changes later.
