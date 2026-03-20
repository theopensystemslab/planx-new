// local test script for flow_link_preview Lambda@Edge function
//
// usage:
//   HASURA_URL=https://hasura.editor.planx.uk/v1/graphql node testFlowLinkPreview.js [teamSlug] [flowSlug]
//
// example:
//   HASURA_URL=https://hasura.editor.planx.uk/v1/graphql node testFlowLinkPreview.js southwark apply-for-a-lawful-development-certificate

const { handler } = require("./flow_link_preview");

const teamSlug = process.argv[2] || "southwark";
const flowSlug = process.argv[3] || "apply-for-a-lawful-development-certificate";

// Mock viewer-request event
function makeEvent(userAgent, uri) {
  return {
    Records: [
      {
        cf: {
          request: {
            uri,
            headers: {
              host: [{ value: `planningservices.${teamSlug}.gov.uk` }],
              "user-agent": [{ value: userAgent }],
            },
          },
        },
      },
    ],
  };
}

const tests = {
  "Crawler request (Slackbot)": {
    userAgent: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    uri: `/${teamSlug}/${flowSlug}/published`,
    expectPreviewHtml: true,
  },
  "Normal browser request": {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    uri: `/${teamSlug}/${flowSlug}/published`,
    expectPreviewHtml: false,
  },
  "Draft URL (crawler)": {
    userAgent: "Slackbot-LinkExpanding 1.0",
    uri: `/${teamSlug}/${flowSlug}/draft`,
    expectPreviewHtml: false,
  },
  "Preview URL (crawler)": {
    userAgent: "Slackbot-LinkExpanding 1.0",
    uri: `/${teamSlug}/${flowSlug}/preview`,
    expectPreviewHtml: false,
  },
  "Non-flow URL": {
    userAgent: "Slackbot-LinkExpanding 1.0",
    uri: "/",
    expectPreviewHtml: false,
  },
};

async function run() {
  for (const [name, { userAgent, uri, expectPreviewHtml }] of Object.entries(tests)) {
    console.log(`\n*** Test: ${name}`);
    const result = await handler(makeEvent(userAgent, uri));

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

run().catch(console.error);
