## Hasura Server

**Intro**
 - This folder contains config for the proxy server which sites in front of Hasura, allowing us to control security headers
 - `docker-compose.yaml` runs this service on both local dev and Pizza environments
 - Fargate builds this service alongside Hasura for staging and production environments
 - Please see [the ADR which introduced Hasura Server](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0002-create-reverse-proxy-for-hasura.md) for full details

**Helpful resources and troubleshooting**

The [Caddy CLI](https://caddyserver.com/docs/command-line) can prove helpful if developing in this directory. You can run this interactively through the docker image with `./run-caddy-shell.sh`

After changes to the Caddyfile, you can run `caddy validate` to check your homework, and then `caddy fmt --overwrite` to lint and standardise whitespace changes etc.

`debug` can be added to the general options at the top of the Caddyfile for local testing, or more verbose CloudWatch logging

```
# General options
{
  debug
	# Handle HTTPS redirection in AWS at the LoadBalancer level
	auto_https off
}
```