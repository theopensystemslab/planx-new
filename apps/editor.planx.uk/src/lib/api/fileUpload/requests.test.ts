import { http, HttpResponse } from "msw";
import server from "test/mockServer";

import { waitForPublicFile } from "./requests";

const FILE_URL = `${import.meta.env.VITE_APP_API_URL}/file/public/abc12345/logo.png`;
let requestCount = 0;

// answers each successive request with the next given status, repeating the last one thereafter
const serve = (
  ...responses: Array<{ status: number; retryAfter?: number }>
) => {
  requestCount = 0;

  return http.get(FILE_URL, () => {
    const { status, retryAfter } =
      responses[Math.min(requestCount, responses.length - 1)];
    requestCount++;

    if (status === 200) {
      return new HttpResponse("image-bytes", {
        status,
        headers: { "Content-Type": "image/png" },
      });
    }

    return HttpResponse.json(
      { error: status === 503 ? "FILE_SCAN_PENDING" : "FILE_FLAGGED" },
      {
        status,
        headers:
          retryAfter === undefined
            ? undefined
            : { "Retry-After": String(retryAfter) },
      },
    );
  });
};

describe("waitForPublicFile", () => {
  it("resolves as ready when the file is served straight away", async () => {
    server.use(serve({ status: 200 }));

    await expect(waitForPublicFile(FILE_URL)).resolves.toEqual({
      status: "ready",
    });
    expect(requestCount).toBe(1);
  });

  it("retries while the scan is pending, then resolves as ready", async () => {
    server.use(serve({ status: 503 }, { status: 503 }, { status: 200 }));

    await expect(
      waitForPublicFile(FILE_URL, { delaysMs: [0, 0, 0] }),
    ).resolves.toEqual({ status: "ready" });
    expect(requestCount).toBe(3);
  });

  it("gives up as pending once the schedule is exhausted", async () => {
    server.use(serve({ status: 503 }));

    await expect(
      waitForPublicFile(FILE_URL, { delaysMs: [0, 0] }),
    ).resolves.toEqual({ status: "pending" });
    // one attempt per delay, plus the initial one
    expect(requestCount).toBe(3);
  });

  it("does not retry a file the scan has rejected", async () => {
    server.use(serve({ status: 404 }));

    await expect(
      waitForPublicFile(FILE_URL, { delaysMs: [0, 0] }),
    ).resolves.toEqual({ status: "rejected" });
    expect(requestCount).toBe(1);
  });

  it("waits no longer than Retry-After asks for", async () => {
    server.use(serve({ status: 503, retryAfter: 0 }, { status: 200 }));

    await expect(
      waitForPublicFile(FILE_URL, { delaysMs: [30_000] }),
    ).resolves.toEqual({ status: "ready" });
    expect(requestCount).toBe(2);
  });
});
