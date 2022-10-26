import assert from "assert";

// check runtime env requirements
assert(process.env.GOVUK_NOTIFY_API_KEY);
assert(process.env.HASURA_PLANX_API_KEY);
assert(process.env.BOPS_API_ROOT_DOMAIN);
assert(process.env.BOPS_API_TOKEN);
assert(process.env.UNIFORM_TOKEN_URL);
assert(process.env.UNIFORM_SUBMISSION_URL);
assert(process.env.GOVUK_NOTIFY_API_KEY);
["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].forEach((authority) => {
  assert(process.env[`GOV_UK_PAY_TOKEN_${authority}`]);
});
assert(process.env.SLACK_WEBHOOK_URL);
