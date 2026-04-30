// local test script for flow_link_preview Lambda@Edge function
//
// usage:
//   node test_flow_link_preview.js [url]
//
// examples:
//   # run both default URL types:
//   node test_flow_link_preview.js
//   # planx.{dev,uk} domain:
//   node test_flow_link_preview.js https://editor.planx.uk/barnet/find-out-if-you-need-planning-permission/published
//   # custom domain:
//   node test_flow_link_preview.js https://planningservices.camden.gov.uk/find-out-if-you-need-planning-permission

const DEFAULT_HASURA_URL = "https://hasura.editor.planx.uk/v1/graphql";

if (!process.env.HASURA_URL) {
  console.warn("Warning: HASURA_URL not set, using default:", DEFAULT_HASURA_URL);
  process.env.HASURA_URL = DEFAULT_HASURA_URL;
}

const { handler } = require("./flow_link_preview");

// test both types of URLs; custom domain & planx.{dev,uk}
const DEFAULT_URLS = [
  "https://editor.planx.uk/barnet/find-out-if-you-need-planning-permission/published",
  "https://planningservices.camden.gov.uk/find-out-if-you-need-planning-permission",
];

const urlsToTest = process.argv[2] ? [process.argv[2]] : DEFAULT_URLS;

// Mock viewer-request event
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

function buildTests(host, uri) {
  return {
    "Crawler request (Slackbot)": {
      userAgent: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      host,
      uri,
      expectPreviewHtml: true,
    },
    "Normal browser request": {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      host,
      uri,
      expectPreviewHtml: false,
    },
    "Non-flow URL": {
      userAgent: "Slackbot-LinkExpanding 1.0",
      host,
      uri: "/",
      expectPreviewHtml: false,
    },
    // planx.{dev,uk} URLs have /published, /draft, /preview variants worth testing
    ...(uri.includes("/published") && {
      "Draft URL (crawler)": {
        userAgent: "Slackbot-LinkExpanding 1.0",
        host,
        uri: uri.replace("/published", "/draft"),
        expectPreviewHtml: false,
      },
      "Preview URL (crawler)": {
        userAgent: "Slackbot-LinkExpanding 1.0",
        host,
        uri: uri.replace("/published", "/preview"),
        expectPreviewHtml: false,
      },
    }),
  };
}

async function runTests(rawUrl) {
  const { host, pathname: uri } = new URL(rawUrl);
  const tests = buildTests(host, uri);

  console.log(`\n=== Testing URL: ${rawUrl} ===`);
  for (const [name, { userAgent, host, uri, expectPreviewHtml }] of Object.entries(tests)) {
    console.log(`\n*** Test: ${name}`);
    const result = await handler(makeEvent(userAgent, host, uri));

    if (expectPreviewHtml) {
      if (result.body) {
        console.log("Status:", result.status);
        console.log("HTML response:\n");
        console.log(result.body);
      } else {
        console.log("ERROR: Expected HTML but passed through");
      }
    } else {
      if (result.body) {
        console.log("ERROR: Should have passed through but got HTML response");
      } else {
        console.log("Correctly passed through");
      }
    }
  }
}

async function run() {
  for (const url of urlsToTest) {
    await runTests(url);
  }
}

run().catch(console.error);
