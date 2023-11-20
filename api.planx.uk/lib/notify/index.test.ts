import { sendEmail } from ".";
import { NotifyClient } from "notifications-node-client";
import { NotifyConfig } from "../../types";

jest.mock("notifications-node-client");

const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk";
const mockConfig: NotifyConfig = {
  personalisation: {
    teamName: "test",
    emailReplyToId: "test",
    helpEmail: "test",
    helpOpeningHours: "test",
    helpPhone: "test",
  },
};

describe("sendEmail", () => {
  it("throws an error if an invalid template is used", async () => {
    // @ts-expect-error Argument of type "invalidTemplate" is not assignable to parameter
    await expect(
      sendEmail("invalidTemplate", "test@example.com", {}),
    ).rejects.toThrow();
  });

  it("throw an error if an error is thrown within sendEmail()", async () => {
    const mockNotifyClient = NotifyClient.mock.instances[0];
    mockNotifyClient.sendEmail.mockRejectedValue(new Error());
    await expect(sendEmail("save", TEST_EMAIL, mockConfig)).rejects.toThrow();
  });

  it("throw an error if the NotifyClient errors", async () => {
    const mockNotifyClient = NotifyClient.mock.instances[0];
    mockNotifyClient.sendEmail.mockRejectedValue({
      response: { data: { errors: ["Invalid email"] } },
    });
    await expect(sendEmail("save", TEST_EMAIL, mockConfig)).rejects.toThrow();
  });
});
