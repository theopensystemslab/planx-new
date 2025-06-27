import { sendEmail } from "./index.js";
import { NotifyClient } from "notifications-node-client";
import type { TemplateRegistry } from "./templates/index.js";
import { NOTIFY_TEST_EMAIL } from "./utils.js";

vi.mock("notifications-node-client");

const mockConfig: TemplateRegistry["save"]["config"] = {
  emailReplyToId: "test",
  personalisation: {
    serviceName: "test",
    sessionId: "test",
    address: "test",
    projectType: "test",
    resumeLink: "test",
    expiryDate: "test",
    helpEmail: "test",
    helpOpeningHours: "test",
    helpPhone: "test",
  },
};

describe("sendEmail", () => {
  it("throws an error if an invalid template is used", async () => {
    await expect(
      // @ts-expect-error Argument of type "invalidTemplate" is not assignable to parameter
      sendEmail("invalidTemplate", "test@example.com", {}),
    ).rejects.toThrow();
  });

  it("throw an error if an error is thrown within sendEmail()", async () => {
    const mockNotifyClient = NotifyClient.mock.instances[0];
    mockNotifyClient.sendEmail.mockRejectedValue(new Error());
    await expect(
      sendEmail("save", NOTIFY_TEST_EMAIL, mockConfig),
    ).rejects.toThrow();
  });

  it("throw an error if the NotifyClient errors", async () => {
    const mockNotifyClient = NotifyClient.mock.instances[0];
    mockNotifyClient.sendEmail.mockRejectedValue({
      response: { data: { errors: ["Invalid email"] } },
    });
    await expect(
      sendEmail("save", NOTIFY_TEST_EMAIL, mockConfig),
    ).rejects.toThrow();
  });
});
