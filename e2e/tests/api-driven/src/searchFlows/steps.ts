import { strict as assert } from "node:assert";

import { After, Before, Given, Then, When, World } from "@cucumber/cucumber";

import type { SearchFlowResult } from "./helpers.js";
import {
  cleanup,
  createSearchableFlow,
  searchFlows,
  setup,
} from "./helpers.js";

export class CustomWorld extends World {
  teamId!: number;
  flowsByName: Record<string, string> = {};
  results!: SearchFlowResult[];
}

Before<CustomWorld>("@search-flows", async function () {
  const { teamId } = await setup();
  this.teamId = teamId;
  this.flowsByName = {};
});

After("@search-flows", async function () {
  await cleanup();
});

Given<CustomWorld>("a flow named {string} exists", async function (name) {
  const id = await createSearchableFlow({ teamId: this.teamId, name });
  this.flowsByName[name] = id;
});

Given<CustomWorld>(
  "a flow named {string} with summary {string} exists",
  async function (name, summary) {
    const id = await createSearchableFlow({
      teamId: this.teamId,
      name,
      summary,
    });
    this.flowsByName[name] = id;
  },
);

Given<CustomWorld>(
  "a flow named {string} with description {string} exists",
  async function (name, description) {
    const id = await createSearchableFlow({
      teamId: this.teamId,
      name,
      description,
    });
    this.flowsByName[name] = id;
  },
);

Given<CustomWorld>(
  "a deleted flow named {string} exists",
  async function (name) {
    const id = await createSearchableFlow({
      teamId: this.teamId,
      name,
      deleted: true,
    });
    this.flowsByName[name] = id;
  },
);

Given<CustomWorld>(
  "a template flow named {string} exists",
  async function (name) {
    const id = await createSearchableFlow({
      teamId: this.teamId,
      name,
      isTemplate: true,
    });
    this.flowsByName[name] = id;
  },
);

When<CustomWorld>("flows are searched for {string}", async function (search) {
  this.results = await searchFlows(search, {
    id: { _in: Object.values(this.flowsByName) },
  });
});

When<CustomWorld>(
  "flows are searched for {string} filtered to templates only",
  async function (search) {
    this.results = await searchFlows(search, {
      id: { _in: Object.values(this.flowsByName) },
      is_template: { _eq: true },
    });
  },
);

When<CustomWorld>(
  "flows are searched for {string} filtered to non-templates only",
  async function (search) {
    this.results = await searchFlows(search, {
      id: { _in: Object.values(this.flowsByName) },
      is_template: { _eq: false },
    });
  },
);

Then<CustomWorld>(
  "the flow named {string} is ranked above the flow named {string}",
  function (higherName, lowerName) {
    const ids = this.results.map((r) => r.id);
    const higherIndex = ids.indexOf(this.flowsByName[higherName]);
    const lowerIndex = ids.indexOf(this.flowsByName[lowerName]);

    assert.notEqual(higherIndex, -1, `"${higherName}" not found in results`);
    assert.notEqual(lowerIndex, -1, `"${lowerName}" not found in results`);
    assert.ok(
      higherIndex < lowerIndex,
      `Expected "${higherName}" to rank above "${lowerName}"`,
    );
  },
);

Then<CustomWorld>(
  "the flow named {string} is not included in the results",
  function (name) {
    const ids = this.results.map((r) => r.id);
    assert.ok(
      !ids.includes(this.flowsByName[name]),
      `"${name}" should not be in the results`,
    );
  },
);

Then<CustomWorld>("only the flow named {string} is returned", function (name) {
  assert.deepEqual(
    this.results.map((r) => r.id),
    [this.flowsByName[name]],
  );
});

Then<CustomWorld>("no results are returned", function () {
  assert.equal(this.results.length, 0);
});
