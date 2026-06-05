const { test } = require("node:test");
const assert = require("node:assert/strict");
const { handler } = require("./lps_url_rewrite");

// Mock viewer-request event
function makeEvent(uri) {
  return { Records: [{ cf: { request: { uri, headers: {} } } }] };
}

const CASES = [
  { 
    description: "Root navigates to index document", 
    uri: "/",
    expected: "/index.html"
  },
  { 
    description: "Extensionless page", 
    uri: "/about",
    expected: "/about.html"
  },
  { 
    description: "Trailing slash", 
    uri: "/about/",
    expected: "/about.html"
  },
  { 
    description: "Nested extensionless page", 
    uri: "/nested/page",
    expected: "/nested/page.html"
  },
  { 
    description: "Error page key", 
    uri: "/404",
    expected: "/404.html"
  },
  { 
    description: "Hashed assets are unchanged", 
    uri: "/_astro/index.abc123.js",
    expected: "/_astro/index.abc123.js"
  },
  { 
    description: "XML files are unchanged", 
    uri: "/sitemap-index.xml",
    expected: "/sitemap-index.xml"
  },
  { 
    description: "Icon files are unchanged", 
    uri: "/favicon.ico",
    expected: "/favicon.ico"
  },
  { 
    description: "HTML files are unchanged", 
    uri: "/about.html",
    expected: "/about.html"
  },
];

for (const { uri, expected, description } of CASES) {
  test(description, async () => {
    const result = await handler(makeEvent(uri));
    assert.strictEqual(result.uri, expected);
  });
}