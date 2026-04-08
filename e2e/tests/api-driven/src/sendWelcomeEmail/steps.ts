import { When, Then, Before, After, World } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { callWelcomeEndpoint, cleanup, setUpMocks, setup } from "./helpers.js";

export class CustomWorld extends World {
  teamId!: number;
  userId!: number;
  response!: { status: number; body: { message?: string; error?: string } };
}

Before("@send-welcome-email", async function () {
  await setUpMocks();
  const { teamId, userId } = await setup({ isTrial: false });
  this.teamId = teamId;
  this.userId = userId;
});

After("@send-welcome-email", async function () {
  await cleanup();
});

When(
  "a welcome email request is made without authentication",
  async function (this: CustomWorld) {
    this.response = await callWelcomeEndpoint({
      includeAuth: false,
    });
  },
);

When(
  "a welcome email request is made with valid authentication and payload",
  async function (this: CustomWorld) {
    this.response = await callWelcomeEndpoint({
      payload: { defaultTeamId: this.teamId },
    });
  },
);

When(
  "a welcome email request is made with an invalid payload",
  async function (this: CustomWorld) {
    this.response = await callWelcomeEndpoint({
      payload: {
        email: "not-an-email",
        userId: undefined as unknown as number,
      },
    });
  },
);

Then(
  "the response status is {int}",
  function (this: CustomWorld, expectedStatus: number) {
    assert.equal(
      this.response.status,
      expectedStatus,
      `Expected status ${expectedStatus}, got ${this.response.status}: ${JSON.stringify(this.response.body)}`,
    );
  },
);

Then(
  "the response message indicates the email was sent successfully",
  function (this: CustomWorld) {
    assert.ok(
      this.response.body.message?.includes("sent successfully"),
      `Expected success message, got: ${JSON.stringify(this.response.body)}`,
    );
  },
);
