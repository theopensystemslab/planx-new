// Lambda@Edge viewer request handler for flow link previews
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html
// Intercepts link preview requests and returns skeleton HTML with meta tags
// so that Slack, Teams, Discord, iMessage, Twitter etc. show rich previews.

// Lambda@Edge functions can't use environment variables, 
// so the correct Hasura URL is replaced at build time
const HASURA_URL =
  process.env.HASURA_URL || "__HASURA_URL__";

// crawler user agents to detect; sourced from
// https://github.com/monperrus/crawler-user-agents/blob/master/crawler-user-agents.json
const CRAWLER_USER_AGENTS = [
  /Slackbot/i,            // Slack
  /Twitterbot/i,          // X (Twitter)
  /facebookexternalhit/i, // Facebook
  /LinkedInBot/i,         // LinkedIn
  /Discordbot/i,          // Discord
  /TelegramBot/i,         // Telegram
  /WhatsApp/i,            // WhatsApp
  /Applebot/i,            // iMessage, Safari, Siri
  /Googlebot/i,           // Google Search
];

// urls matching /{teamSlug}/{flowSlug}/published will be intercepted
const FLOW_URL_PATTERN = /^\/([a-z-]+)\/([a-z-]+)\/published/;

// GraphQL query to fetch flow metadata for the preview
const QUERY = `
  query GetFlowMetadata($flowSlug: String!, $teamSlug: String!) {
    flows(
      limit: 1
      where: {
        slug: { _eq: $flowSlug }
        team: { slug: { _eq: $teamSlug } }
      }
    ) {
      name
      summary
      team {
        name
      }
    }
  }
`;

// Fetches flow metadata from Hasura based on team and flow slugs
async function fetchFlowMetadata(teamSlug, flowSlug) {
  const res = await fetch(HASURA_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: QUERY,
      variables: { flowSlug, teamSlug },
    }),
  });

  if (!res.ok) return null;

  const json = await res.json();
  const flow = json.data?.flows?.[0];
  if (!flow) return null;

  return {
    flowName: flow.name,
    flowSummary: flow.summary || "",
    teamName: flow.team.name,
  };
}

function buildPreviewHtml({ teamName, flowName, flowSummary }, url) {
  const title = `${teamName}: ${flowName}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(flowSummary)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(flowSummary)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:locale" content="en_GB" />
</head>
<body></body>
</html>`;
}

// Simple HTML escaping to prevent issues with special characters in metadata
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

exports.handler = async (event) => {
  // Extract the incoming request from the CloudFront viewer-request event
  const request = event.Records[0].cf.request;
  const userAgent = request.headers["user-agent"]?.[0]?.value || "";

  // only intercept crawler requests
  const isCrawler = CRAWLER_USER_AGENTS.some((ua) => ua.test(userAgent));
  if (!isCrawler) return request;

  // only intercept URLs matching the flow pattern
  const match = request.uri.match(FLOW_URL_PATTERN);
  if (!match) return request;

  const [fullMatch, teamSlug, flowSlug] = match;

  try {
    const metadata = await fetchFlowMetadata(teamSlug, flowSlug);
    if (!metadata) return request;

    // Reconstruct the full URL from the request
    const host = request.headers.host?.[0]?.value || "";
    const url = `https://${host}${request.uri}`;

    // 200 response with preview HTML
    return {
      status: "200",
      statusDescription: "OK",
      headers: {
        "content-type": [{ value: "text/html; charset=utf-8" }],
        "cache-control": [{ value: "public, max-age=300" }],
      },
      body: buildPreviewHtml(metadata, url),
    };
  } catch {
    // on any error, return the original request
    return request;
  }
};

