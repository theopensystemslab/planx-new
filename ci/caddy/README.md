# Caddy

We use a Caddy server (in a Docker container) as a reverse proxy on our Vultr/pizza builds.

## Automatic HTTPS

Caddy [automatically provisions SSL certificates](https://caddyserver.com/docs/automatic-https) so that we don't have to. With the setup given in the `Caddyfile`, it goes one further, and provisions a [single wilcard cert](https://caddyserver.com/docs/caddyfile/patterns#wildcard-certificates). This ideally stops us from hitting the 50/week cap imposed by LetsEncrypt.

In order to allow the caddy container to solve the [DNS-01 challenge](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge), it needs to control our Vultr DNS setup, so we bake the [caddy-dns/vultr module](https://github.com/caddy-dns/vultr) into the image, as per the `Dockerfile`.

## Debugging

To see verbose logs for the caddy container, add the `debug` directive to the global options. If testing the setup, you can also make use of the LetsEncrypt's staging server using the `acme_ca` directive. For example:

```
{
	email {$TLS_EMAIL}
	debug
	acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
}
```

## `tls` options

The propagation knobs should be understood like so: wait for `propagation_delay` before starting poll of DNS records (after attempting to write them to Vultr), then keep trying to verify success for `propagation_timeout`, before handing over to the ACME server.

Note also that Docker's embedded DNS breaks CertMagic polling, meaning Caddy can't verify the successful writing of appropriate DNS records, so we explicitly set public [resolvers](https://caddyserver.com/docs/caddyfile/directives/tls#resolvers) (specifically Cloudflare and Google).
