import type { TemplateRegistry } from "./templates/index.js";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

const { sendEmail } = await import("./index.js");

const submitVariables: TemplateRegistry["submit"]["variables"] = {
  serviceName: "Report a planning breach",
  sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
  applicantName: "Jane Doe",
  applicantEmail: "jane@example.com",
  address: "1 High Street",
  projectType: "New build",
  fee: "£123",
  downloadLink: "https://example.com/download?token=abc",
};

describe("sendEmail (Resend wrapper)", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("returns a success message and forwards the idempotency key", async () => {
    mockSend.mockResolvedValue({ data: { id: "resend-id" }, error: null });

    const result = await sendEmail(
      "submit",
      "planning.office@council.gov.uk",
      submitVariables,
      { idempotencyKey: "submit-33d373d4" },
    );

    expect(result).toEqual({ message: "submit email sent successfully" });
    expect(mockSend).toHaveBeenCalledWith(expect.any(Object), {
      idempotencyKey: "submit-33d373d4",
    });
  });

  it("sends an undefined idempotency key when none is supplied", async () => {
    mockSend.mockResolvedValue({ data: { id: "resend-id" }, error: null });

    await sendEmail(
      "submit",
      "planning.office@council.gov.uk",
      submitVariables,
    );

    expect(mockSend).toHaveBeenCalledWith(expect.any(Object), {
      idempotencyKey: undefined,
    });
  });

  it("throws a classified error and logs a transient failure", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockSend.mockResolvedValue({
      data: null,
      error: {
        name: "application_error",
        statusCode: 500,
        message: "Something went wrong",
      },
    });

    await expect(
      sendEmail("submit", "planning.office@council.gov.uk", submitVariables),
    ).rejects.toThrow(/\[application_error\]/);

    expect(consoleError).toHaveBeenCalledWith(
      "Resend send failed",
      expect.objectContaining({ code: "application_error", isTransient: true }),
    );

    consoleError.mockRestore();
  });

  it("classifies a validation error as critical (non-transient)", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockSend.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 400,
        message: "Invalid `from` field",
      },
    });

    await expect(
      sendEmail("submit", "planning.office@council.gov.uk", submitVariables),
    ).rejects.toThrow(/\[validation_error\]/);

    expect(consoleError).toHaveBeenCalledWith(
      "Resend send failed",
      expect.objectContaining({ code: "validation_error", isTransient: false }),
    );

    consoleError.mockRestore();
  });
});
