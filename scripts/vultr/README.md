# vultr script

This script creates and destroys pizzas on Vultr - that is, an instance and associated DNS records.

It uses a dedicated node client called [vultr-node](https://github.com/vultr/vultr-node) to interact with the Vultr API.

It is intended to replace the [vultr-action](https://github.com/vultr/vultr-node) custom GitHub action that our workflows have used previously.

## Usage

To create an instance, get its IP address, create corresponding DNS records, and wait for it to spin up, run something like this:

```sh
pnpm run create --domain=planx.pizza --pullRequestId=9999 --os=ubuntu
```

The script accepts a domain, pull request ID, and operating system. Other OS options include `alpine`, `coreOs`, `flatcar`.

Similarly, to destroy an instance (and the DNS records):

```sh
pnpm run destroy -d planx.pizza -i 9999
```
