# 2. Create reverse proxy for Hasura

Date: 2022-08-17

## Status

Accepted

## Context

Following a penetration test on PlanX, it was made clear that we needed to be able to control and modify the response headers from Hasura. This is not natively possible from Hasura Core.

## Decision

- Implement a reverse proxy to modify response headers from Hasura
- Caddy is one of the recommendations by Hasura, and after much trial and error I'm confident it's a good match for the requirements
- Naming conventions -  
  - `HasuraServer` is the public facing service, all requests will be routed through this
  - `HasuraGraphQLEngine` is the Hasura we know and love, and is not publicly exposed
- In local dev & Pizza (test) environments, we spin up a brand new independent `HasuraServer`
- In staging/prod, we compose the `Hasura` Fargate service of two tightly coupled containers which can communicate with each other

**AWS Architecture Diagram**
![AWS Architecture Diagram](https://user-images.githubusercontent.com/20502206/185238027-df7c167b-e469-4518-b8a4-7e9bb691cd7e.jpg)

## Consequences

**Local Dev & Pizza environments**

It is not entirely required to make any changes to the docker-compose configuration which controls these environments as part of this proposal. However, unless there proved to be a significant overhead of having the additional service running locally, I would argue that having a development environment that closely resembles staging/production is likely to be beneficial. If this becomes an issue, we could look at using a profile in the docker-compose file which only spins up `hasuraServer` on demand.

**Staging & Production environments**

Having `HasuraServer` and `HasuraGraphQLEngine` be tightly coupled may not prove be ideal if both need to scale independently. We could mitigate this in a number of ways if it proves to be necessary - 
 - Increase memory available to one of the containers
 - Refactor into two separate services, and address a more complex Fargate networking setup

Currently, these two containers are interdependent so the tight coupling should not be an issue (e.g. if one goes down, the other should not function anyway).

