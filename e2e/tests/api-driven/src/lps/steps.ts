import { strict as assert } from "node:assert";
import { Given, When, Then, Before, After, World } from "@cucumber/cucumber";
import {
  cleanup,
  getApplications,
  getLatestMagicLink,
  login,
  setup,
} from "./helpers.js";

export class CustomWorld extends World {
  sessionIds!: string[];
  token!: string;
  email!: string;
  applications!: { id: string }[];
}

Before<CustomWorld>("@lps-magic-links", async function () {
  this.email = "me@example.com";

  const sessionIds = await setup({ email: this.email });
  this.sessionIds = sessionIds;
});

After<CustomWorld>("@lps-magic-links", async function () {
  await cleanup();
});

Given<CustomWorld>("a magic link is generated", async function () {
  await login(this.email);
  const { token, email, usedAt } = await getLatestMagicLink();

  assert.equal(
    email,
    this.email,
    "Generated magic link does not match test user",
  );
  assert(token, "Failed to fetch magic link token");
  assert.equal(usedAt, null, "Magic link should not be consumed");

  this.token = token;
});

When<CustomWorld>("an invalid token is provided", async function () {
  const invalidToken = "bca15271-3ebf-4d57-aab2-799bfa3e41ce";
  this.applications = await getApplications(this.email, invalidToken);
});

When<CustomWorld>("an invalid email address is provided", async function () {
  this.applications = await getApplications(
    "wrongEmail@example.com",
    this.token,
  );
});

When<CustomWorld>("the expiry time has passed", async function () {
  // Sleep over the 3s expiry length in test envs
  await new Promise((resolve) => setTimeout(resolve, 3_500));

  this.applications = await getApplications(this.email, this.token);
});

When<CustomWorld>("the correct details are provided", async function () {
  this.applications = await getApplications(this.email, this.token);
});

Then<CustomWorld>("applications can't be accessed", function () {
  assert.equal(this.applications.length, 0);
});

Then<CustomWorld>("applications can be accessed", async function () {
  assert.equal(this.applications.length, 3);

  // Each application returned corresponds with the user's sessions
  this.applications.forEach(({ id }) => {
    assert.equal(this.sessionIds.includes(id), true);
  });
});

Then<CustomWorld>("the link cannot be reused", async function () {
  this.applications = await getApplications(this.email, this.token);
  assert.equal(this.applications.length, 0);

  const { usedAt } = await getLatestMagicLink();
  assert.notEqual(usedAt, null, "Magic link should be marked as consumed");
});
