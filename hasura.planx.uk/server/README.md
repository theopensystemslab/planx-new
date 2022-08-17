## Hasura Server

**Setup**
 - Install Caddy (`brew install caddy`)
 - Use `caddy run` to test locally, or test as part of the docker-compose setup
 - Please see [the ADR which introduced Hasura Server](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0002-create-reverse-proxy-for-hasura.md) for full details

**Helpful resources and troubleshooting**

I would recommend using the [Caddy CLI](https://caddyserver.com/docs/command-line) if developing in this directory.

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