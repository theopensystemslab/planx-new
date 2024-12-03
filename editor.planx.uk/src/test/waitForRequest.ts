import { matchRequestUrl, MockedRequest } from "msw";

import { server } from "./server";

/* A helper that should be used sparingly.

We almost always prefer testing user perceivable outcomes than testing request specifics,
so this is only for scenarios where it is absolutely essential to our test confidence that we test the request body.

Based on https://mswjs.io/docs/extensions/life-cycle-events#asserting-request-payload */
const waitForRequest = (method: string, pathname: string): Promise<Request> => {
  let matchedRequestId = "";
  return new Promise((resolve, reject) => {
    server.events.on(
      "request:start",
      ({
        request,
        requestId,
      }: {
        request: Readonly<MockedRequest>;
        requestId: string;
      }) => {
        const matchesMethod =
          request.method.toLowerCase() === method.toLowerCase();
        const matchesUrl = matchRequestUrl(request.url, pathname);

        if (matchesMethod && matchesUrl.matches) {
          matchedRequestId = requestId;
        }
      },
    );

    server.events.on("request:match", ({ request, requestId }) => {
      if (requestId === matchedRequestId) {
        resolve(request);
      }
    });

    server.events.on("request:unhandled", ({ request, requestId }) => {
      if (requestId === matchedRequestId) {
        reject(
          new Error(
            `The ${request.method} ${
              new URL(request.url).href
            } request was unhandled.`,
          ),
        );
      }
    });
  });
};

export default waitForRequest;
