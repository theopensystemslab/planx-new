const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const { handler } = require("./flow_link_preview");

const DEFAULT_HASURA_URL = "https://hasura.editor.planx.uk/v1/graphql";
if (!process.env.HASURA_URL) {
  process.env.HASURA_URL = DEFAULT_HASURA_URL;
}

// Intercept native fetch calls to Hasura
mock.method(globalThis, "fetch", async () => {
  return new Response(
    JSON.stringify({
      data: {
        flows: [
          {
            name: "Find out if you need planning permission",
            summary: "Mocked link preview description.",
            team: { name: "PlanX Testing Authority" },
          },
        ],
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
});

// Mock viewer-request event generator
function makeEvent(userAgent, host, uri) {
  return {
    Records: [
      {
        cf: {
          request: {
            uri,
            headers: {
              host: [{ value: host }],
              "user-agent": [{ value: userAgent }],
            },
          },
        },
      },
    ],
  };
}

const TEST_MATRIX = [
  // PlanX domain tests
  {
    name: "PlanX - Crawler request (Slackbot)",
    host: "editor.planx.uk",
    uri: "/barnet/find-out-if-you-need-planning-permission/published",
    userAgent: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    expectPreviewHtml: true,
  },
  {
    name: "PlanX - Normal browser request",
    host: "editor.planx.uk",
    uri: "/barnet/find-out-if-you-need-planning-permission/published",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    expectPreviewHtml: false,
  },
  {
    name: "PlanX - Non-flow URL",
    host: "editor.planx.uk",
    uri: "/",
    userAgent: "Slackbot-LinkExpanding 1.0",
    expectPreviewHtml: false,
  },
  {
    name: "PlanX - Draft URL (crawler)",
    host: "editor.planx.uk",
    uri: "/barnet/find-out-if-you-need-planning-permission/draft",
    userAgent: "Slackbot-LinkExpanding 1.0",
    expectPreviewHtml: false,
  },
  {
    name: "PlanX - Preview URL (crawler)",
    host: "editor.planx.uk",
    uri: "/barnet/find-out-if-you-need-planning-permission/preview",
    userAgent: "Slackbot-LinkExpanding 1.0",
    expectPreviewHtml: false,
  },

  // Custom domain tests
  {
    name: "Custom Domain - Crawler request (Slackbot)",
    host: "planningservices.camden.gov.uk",
    uri: "/find-out-if-you-need-planning-permission",
    userAgent: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    expectPreviewHtml: true,
  },
  {
    name: "Custom Domain - Normal browser request",
    host: "planningservices.camden.gov.uk",
    uri: "/find-out-if-you-need-planning-permission",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    expectPreviewHtml: false,
  },
  {
    name: "Custom Domain - Non-flow URL",
    host: "planningservices.camden.gov.uk",
    uri: "/",
    userAgent: "Slackbot-LinkExpanding 1.0",
    expectPreviewHtml: false,
  },
];

for (const scenario of TEST_MATRIX) {
  test(scenario.name, async () => {
    const event = makeEvent(scenario.userAgent, scenario.host, scenario.uri);
    const result = await handler(event);

    if (scenario.expectPreviewHtml) {
      assert.ok(result.body, "Expected an HTML preview response body, but request passed through");
      assert.match(result.body, /<html/i, "Response body should be a valid HTML string");
      assert.match(result.body, /PlanX Testing Authority/i, "HTML should include mocked team metadata");
    } else {
      assert.ok(!result.body, "Expected request to pass through smoothly, but received a mock HTML response body");
      assert.ok(result.uri, "Expected to pass back a valid CloudFront request configuration object");
    }
  });
}