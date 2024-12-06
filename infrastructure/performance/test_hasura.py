import os
import random
import time

from locust import (
  constant_pacing,
  task,
)

from base_workload import OpenWorkloadBase
from utils import (
  get_nested_key,
  get_target_host,
)


TASK_INVOCATION_RATE_SECONDS = 10
HOST_BY_ENV = {
  "local": os.getenv("HASURA_GRAPHQL_URL", "http://localhost:7100"),
  "staging": "https://hasura.editor.planx.dev",
}
HASURA_GRAPHQL_ENDPOINT = "/v1/graphql"


class HasuraWorkload(OpenWorkloadBase):
  wait_time = constant_pacing(TASK_INVOCATION_RATE_SECONDS)
  host = get_target_host(HOST_BY_ENV)

  @task
  def get_random_flow_metadata(self) -> None:
    # first we simulate hitting the splash page (for a logged in user), where teams are listed
    teams = None
    with self.rest(
      "POST",
      HASURA_GRAPHQL_ENDPOINT,
      name="GetTeams",
      json={
        "operationName": "GetTeams",
        "query": """
          query GetTeams {
            teams(order_by: {name: asc}) {
              id
              name
            }
          }
          """,
      },
    ) as resp:
      teams = get_nested_key(resp.js, "data", "teams")
    # we choose a team at random to fetch flows for, as if to display the list of services
    team_id = random.choice(teams)["id"]
    # then we sleep for a bit to simulate the user choosing from the list of teams
    time.sleep(2)

    flows = None
    with self.rest(
      "POST",
      HASURA_GRAPHQL_ENDPOINT,
      name="GetFlows",
      json={
        "operationName": "GetFlows",
        "variables": {"team_id": team_id},
        "query": """
          query GetFlows($team_id: Int!) {
            flows(where: {team_id: {_eq: $team_id}}) {
              id
              name
              slug
              updated_at
            }
          }
          """,
      },
    ) as resp:
      flows = get_nested_key(resp.js, "data", "flows")
    if not flows:
      return
    # now we choose a random flow from that team to get more information about
    flow_slug = random.choice(flows)["slug"]
    time.sleep(2)

    flow_id, aggregate_count = None, None
    with self.rest(
      "POST",
      HASURA_GRAPHQL_ENDPOINT,
      name="GetFlowMetadata",
      json={
        "operationName": "GetFlowMetadata",
        "variables": {
          "team_id": team_id,
          "slug": flow_slug,
        },
        "query": """
          query GetFlowMetadata($team_id: Int!, $slug: String!) {
            flows(where: {team_id: {_eq: $team_id}, slug: {_eq: $slug}}) {
              id
              published_flows_aggregate {
                aggregate {
                  count
                }
              }
            }
          }
          """,
      },
    ) as resp:
      flows = get_nested_key(resp.js, "data", "flows")
      if flows:
        flow_id = flows[0]["id"]
        aggregate_count = get_nested_key(
          flows[0], "published_flows_aggregate", "aggregate", "count"
        )
    # it may be that the flow is not published (in which case aggregate count will be 0)
    if not aggregate_count:
      return

    # this last request comes immediately after the last
    with self.rest(
      "POST",
      HASURA_GRAPHQL_ENDPOINT,
      name="GetLastPublishedFlow",
      json={
        "operationName": "GetLastPublishedFlow",
        "variables": {
          "id": flow_id,
        },
        "query": """
          query GetLastPublishedFlow($id: uuid) {
            flows(where: {id: {_eq: $id}}) {
              published_flows(limit: 1, order_by: {data: asc, created_at: desc}) {
                created_at
              }
            }
          }
          """,
      },
    ) as resp:
      flows = get_nested_key(resp.js, "data", "flows")
      if flows:
        published_flows = flows[0]["published_flows"]
        assert published_flows[0]["created_at"] is not None
