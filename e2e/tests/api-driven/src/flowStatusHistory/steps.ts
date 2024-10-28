import { When, Then, World, After, Before, Given } from "@cucumber/cucumber";
import assert from "assert";
import { cleanup, getFlowStatus, getFlowStatusHistory, setup } from "./helpers";
import { createFlow } from "../globalHelpers";
import { $admin } from "../client";

export class CustomWorld extends World {
  teamId!: number;
  userId!: number;
  flowId!: string;
}

After("@flow-status-history", async function () {
  await cleanup();
});

Before<CustomWorld>("@flow-status-history", async function () {
  const { teamId, userId } = await setup();
  this.teamId = teamId;
  this.userId = userId;
});

Given<CustomWorld>("a flow exists", async function () {
  const flowId = await createFlow({
    teamId: this.teamId,
    slug: "test-flow",
    name: "Test Flow",
    userId: this.userId,
  });

  assert.ok(flowId, "flowId is not defined");

  this.flowId = flowId;
});

Then("the status of the flow is offline by default", async function () {
  const status = await getFlowStatus(this.flowId);

  assert.equal(
    status,
    "offline",
    `Flow status is ${status} - it should be "offline"`
  );
});

Then("a flow_status_history record is created", async function () {
  const flowStatusHistory = await getFlowStatusHistory(this.flowId);

  assert.notEqual(
    flowStatusHistory.length,
    0,
    "No records found for flow_status_history"
  );
  assert.equal(
    flowStatusHistory.length,
    1,
    "Multiple records found for flow_status_history"
  );
  assert.ok(flowStatusHistory[0], "flow_status_history record not created");
  assert.equal(
    flowStatusHistory[0].status,
    "offline",
    `Flow status is ${flowStatusHistory[0].status} - it should be "offline"`
  );
  assert.notEqual(
    flowStatusHistory[0].eventStart,
    null,
    "Event start should be set on INSERT"
  );
  assert.equal(
    flowStatusHistory[0].eventEnd,
    null,
    "Event end should not be set on INSERT"
  );
});

When("the flow status is changed to online", async function () {
  const flow = await $admin.flow.setStatus({
    flow: { id: this.flowId },
    status: "online",
  });
  assert.ok(flow, "Flow not defined after setStatus()");
  assert.equal(
    flow.status,
    "online",
    `Flow status is ${flow.status} - it should be "online`
  );
});

Then("the open flow_status_history record is updated", async function () {
  const flowStatusHistory = await getFlowStatusHistory(this.flowId);
  assert.ok(
    flowStatusHistory[0].eventEnd,
    "Event end should be set on update to status column"
  );
});

Then("a new flow_status_history record is created", async function () {
  const flowStatusHistory = await getFlowStatusHistory(this.flowId);
  assert.equal(flowStatusHistory.length, 2, "New record not created on UPDATE");
  assert.ok(flowStatusHistory[1], "flow_status_history record not created");
  assert.equal(
    flowStatusHistory[1].status,
    "online",
    `Flow status is ${flowStatusHistory[1].status} - it should be "online"`
  );
  assert.notEqual(
    flowStatusHistory[1].eventStart,
    null,
    "Event start should be set on INSERT"
  );
  assert.equal(
    flowStatusHistory[1].eventEnd,
    null,
    "Event end should not be set on INSERT"
  );
});
