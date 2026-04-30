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
  /SkypeUriPreview/i,     // MS Teams/Skype
];

// planx.{uk,dev} domains: regex for identifying team-hosted domains and extracting team and flow slugs from path
const PLANX_DOMAIN_FLOW_URL_PATTERN = /^\/([a-z-]+)\/([a-z-]+)\/published/;

// custom domains: regex for identifying council-hosted domains and extracting flow slug from path
const CUSTOM_DOMAIN_PATTERN = /^planningservices\.[^.]+\.gov\.uk$/;
const CUSTOM_DOMAIN_FLOW_URL_PATTERN = /^\/([a-z-]+)/;

// GraphQL query for planx.{uk,dev} where team is identified by slug
const QUERY_BY_SLUG = `
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

// GraphQL query for custom domains where team is identified by domain
const QUERY_BY_DOMAIN = `
  query GetFlowMetadata($flowSlug: String!, $teamDomain: String!) {
    flows(
      limit: 1
      where: {
        slug: { _eq: $flowSlug }
        team: { domain: { _eq: $teamDomain } }
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

// Fetches flow metadata from Hasura, looking up the team by slug or domain
async function fetchFlowMetadata({ teamSlug, teamDomain }, flowSlug) {

  // differing queries, based on teamSlug vs teamDomain
  const [query, variables] = teamSlug
    ? [QUERY_BY_SLUG, { flowSlug, teamSlug }]
    : [QUERY_BY_DOMAIN, { flowSlug, teamDomain }];

  const res = await fetch(HASURA_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
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
  <meta property="og:type" content="website" />
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

  // get host in order to branch on custom domain vs planx.{uk,dev}
  const host = request.headers.host?.[0]?.value || "";
  const url = `https://${host}${request.uri}`;

  try {
    let metadata;

    // branch for custom domains vs planx.{uk,dev} domains
    if (CUSTOM_DOMAIN_PATTERN.test(host)) {
      // custom domain => use extracted teamDomain and match /{flowSlug}
      const match = request.uri.match(CUSTOM_DOMAIN_FLOW_URL_PATTERN);
      if (!match) return request;
      const [fullMatch, flowSlug] = match;
      metadata = await fetchFlowMetadata({ teamDomain: host }, flowSlug);
    } else {
      // planx.{uk,dev} => match to `/{teamSlug}/{flowSlug}/published`
      const match = request.uri.match(PLANX_DOMAIN_FLOW_URL_PATTERN);
      if (!match) return request;
      const [fullMatch, teamSlug, flowSlug] = match;
      metadata = await fetchFlowMetadata({ teamSlug }, flowSlug);
    }

    if (!metadata) return request;

    // 200 response with preview HTML
    return {
      status: "200",
      statusDescription: "OK",
      headers: {
        "content-type": [{ value: "text/html; charset=utf-8" }],
        "cache-control": [{ value: "public, max-age=172800" }],
      },
      body: buildPreviewHtml(metadata, url),
    };
  } catch {
    // on any error, return the original request
    return request;
  }
};

