import { strict as assert } from "node:assert";

import { After, Before, Given, Then, When, World } from "@cucumber/cucumber";

import {
  callCopyEndpoint,
  cleanup,
  getFlowBySlug,
  getOperations,
  setup,
} from "./helpers.js";

export class CustomWorld extends World {
  teamId!: number;
  otherTeamId!: number;
  jwt!: string;
  otherTeamJwt!: string;
  sourceFlowId!: string;
  destinationSlug!: string;
  newFlowId?: string;
  response!: { status: number; body: Record<string, unknown> };
}

Before<CustomWorld>("@copy-flow", async function () {
  const world = await setup();
  Object.assign(this, world);
  this.destinationSlug = `e2e-copy-flow-destination-${Date.now()}`;
});

After("@copy-flow", async function () {
  await cleanup();
});

Given<CustomWorld>("a source flow exists", function () {
  assert.ok(this.sourceFlowId, "source flow should already be set up");
});

When<CustomWorld>("the flow is copied into its own team", async function () {
  this.response = await callCopyEndpoint({
    jwt: this.jwt,
    flowId: this.sourceFlowId,
    teamId: this.teamId,
    slug: this.destinationSlug,
  });
});

When<CustomWorld>(
  "a teamEditor copies the flow from a different team into their own team",
  async function () {
    this.response = await callCopyEndpoint({
      jwt: this.otherTeamJwt,
      flowId: this.sourceFlowId,
      teamId: this.otherTeamId,
      slug: this.destinationSlug,
    });
  },
);

When<CustomWorld>(
  "a teamEditor from a different team tries to copy the flow into that team",
  async function () {
    this.response = await callCopyEndpoint({
      jwt: this.otherTeamJwt,
      flowId: this.sourceFlowId,
      teamId: this.teamId,
      slug: this.destinationSlug,
    });
  },
);

When<CustomWorld>(
  "an unauthenticated request is made to copy the flow",
  async function () {
    this.response = await callCopyEndpoint({
      flowId: this.sourceFlowId,
      teamId: this.teamId,
      slug: this.destinationSlug,
    });
  },
);

Then<CustomWorld>(
  "the copy response status is {int}",
  function (expectedStatus: number) {
    assert.equal(
      this.response.status,
      expectedStatus,
      `Expected status ${expectedStatus}, got ${this.response.status}: ${JSON.stringify(this.response.body)}`,
    );
  },
);

Then<CustomWorld>(
  "a new flow exists with a copied operation",
  async function () {
    const flow = await getFlowBySlug(this.destinationSlug);
    assert.ok(flow, "Copied flow was not found by slug");
    this.newFlowId = flow.id;

    const operations = await getOperations(flow.id);
    assert.equal(
      operations.length,
      1,
      "Expected exactly one operations row for the copied flow",
    );
  },
);

Then<CustomWorld>(
  "the new flow belongs to the copying teamEditor's own team",
  async function () {
    const flow = await getFlowBySlug(this.destinationSlug);
    assert.ok(flow, "Copied flow was not found by slug");
    this.newFlowId = flow.id;
    assert.equal(
      flow.teamId,
      this.otherTeamId,
      `Expected copied flow to belong to team ${this.otherTeamId}, got ${flow.teamId}`,
    );
  },
);

Then<CustomWorld>("no new flow was created", async function () {
  const flow = await getFlowBySlug(this.destinationSlug);
  assert.equal(
    flow,
    undefined,
    `Expected no flow with slug "${this.destinationSlug}" to exist`,
  );
});
