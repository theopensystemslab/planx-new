import { strict as assert } from "node:assert";
import { Given, When, Then, Before, After, World } from "@cucumber/cucumber";
import {
  cleanup,
  getApplications,
  getLatestMagicLink,
  login,
  setup,
} from "./helpers.js";

interface Success {
  status: 200;
  drafts: { id: string }[];
  submitted: { id: string }[];
}

interface Error {
  status: 404 | 410 | 500;
  error: string;
  message: string;
}

export class CustomWorld extends World {
  sessionIds!: string[];
  token!: string;
  email!: string;
  response!: Success | Error;
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
  this.response = await getApplications(this.email, invalidToken);
});

When<CustomWorld>("an invalid email address is provided", async function () {
  this.response = await getApplications("wrongEmail@example.com", this.token);
});

When<CustomWorld>("the expiry time has passed", async function () {
  // Sleep over the 3s expiry length in test envs
  await new Promise((resolve) => setTimeout(resolve, 3_500));

  this.response = await getApplications(this.email, this.token);
});

When<CustomWorld>("the correct details are provided", async function () {
  this.response = await getApplications(this.email, this.token);
});

When<CustomWorld>("the link is reused", async function () {
  this.response = await getApplications(this.email, this.token);
});

Then<CustomWorld>("applications can't be accessed", function () {
  assert.equal(this.response.status, 200);
  assert.equal(this.response.drafts.length, 0);
  assert.equal(this.response.submitted.length, 0);
});

Then<CustomWorld>("an invalid link error message is returned", function () {
  assert.equal(this.response.status, 404);
  assert.equal(this.response.error, "LINK_INVALID");
  assert.equal(this.response.message, "Magic link not found or invalid");
});

Then<CustomWorld>("an expired link error message is returned", function () {
  assert.equal(this.response.status, 410);
  assert.equal(this.response.error, "LINK_EXPIRED");
  assert.equal(this.response.message, "This magic link has expired");
});

Then<CustomWorld>("applications can be accessed", async function () {
  assert.equal(this.response.status, 200);

  assert.equal(this.response.drafts.length, 2);
  assert.equal(this.response.submitted.length, 1);

  // Each application returned corresponds with the user's sessions
  this.response.drafts.forEach(({ id }) => {
    assert.equal(this.sessionIds.includes(id), true);
  });

  this.response.submitted.forEach(({ id }) => {
    assert.equal(this.sessionIds.includes(id), true);
  });
});

Then<CustomWorld>(
  "a consumed link error message is returned",
  async function () {
    assert.equal(this.response.status, 410);
    assert.equal(this.response.error, "LINK_CONSUMED");
    assert.equal(
      this.response.message,
      "This magic link has already been used",
    );
  },
);

Then<CustomWorld>(
  "the link is marked as consumed in the database",
  async function () {
    const { usedAt } = await getLatestMagicLink();
    assert.notEqual(usedAt, null, "Magic link should be marked as consumed");
  },
);
