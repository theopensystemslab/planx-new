import { resolveNotifyTemplate, sendEmail } from "./index.js";
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

describe("resolveNotifyTemplate", () => {
  it("returns the base template for 'application'", () => {
    expect(resolveNotifyTemplate("save", "application")).toBe("save");
    expect(resolveNotifyTemplate("resume", "application")).toBe("resume");
  });

  it("returns the general template for 'general'", () => {
    expect(resolveNotifyTemplate("save", "general")).toBe("general-save");
    expect(resolveNotifyTemplate("resume", "general")).toBe("general-resume");
    expect(resolveNotifyTemplate("reminder", "general")).toBe("general-reminder");
    expect(resolveNotifyTemplate("expiry", "general")).toBe("general-expiry");
    expect(resolveNotifyTemplate("confirmation", "general")).toBe("general-confirmation");
    expect(resolveNotifyTemplate("invite-to-pay", "general")).toBe("general-invite-to-pay");
    expect(resolveNotifyTemplate("invite-to-pay-agent", "general")).toBe("general-invite-to-pay-agent");
    expect(resolveNotifyTemplate("payment-reminder", "general")).toBe("general-payment-reminder");
    expect(resolveNotifyTemplate("payment-reminder-agent", "general")).toBe("general-payment-reminder-agent");
    expect(resolveNotifyTemplate("payment-expiry", "general")).toBe("general-payment-expiry");
    expect(resolveNotifyTemplate("payment-expiry-agent", "general")).toBe("general-payment-expiry-agent");
    expect(resolveNotifyTemplate("confirmation-agent", "general")).toBe("general-confirmation-agent");
    expect(resolveNotifyTemplate("confirmation-payee", "general")).toBe("general-confirmation-payee");
    expect(resolveNotifyTemplate("new-download-link", "general")).toBe("general-new-download-link");
  });

  it("falls back to the base template for unmapped templates", () => {
    expect(resolveNotifyTemplate("lps-login", "general")).toBe("lps-login");
  });
});

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
