import * as Controller from "./controller.js";

const mockMigrateToStripe = vi.fn();

vi.mock("./service.js", () => ({
  migrateToStripe: (...args: unknown[]) => mockMigrateToStripe(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildRes = (): any => ({
  locals: { team: { id: 1, slug: "lambeth" } },
  status: vi.fn().mockReturnThis(),
  send: vi.fn(),
});

beforeEach(() => {
  mockMigrateToStripe.mockReset();
});

describe("successfully migrates", () => {
  it("returns a 200 and no blockers", async () => {
    mockMigrateToStripe.mockReturnValue({ canMigrate: true, blockers: [] });

    const res = buildRes();
    const next = vi.fn();

    await Controller.migrate({} as never, res, next);

    expect(mockMigrateToStripe).toHaveBeenCalledWith(1, "lambeth");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ canMigrate: true, blockers: [] });
  });
});

describe("blocked migration", () => {
  it("returns a 409 and list of blockers", async () => {
    const blockedResult = {
      canMigrate: false,
      blockers: [{ reason: "stripeNotConnected" }],
    };
    mockMigrateToStripe.mockResolvedValue(blockedResult);

    const res = buildRes();
    const next = vi.fn();

    await Controller.migrate({} as never, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(blockedResult);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("error", () => {
  it("creates a ServerError", async () => {
    mockMigrateToStripe.mockRejectedValue(new Error("Something happened"));

    const res = buildRes();
    const next = vi.fn();

    await Controller.migrate({} as never, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to migrate to Stripe" }),
    );
  });
});
