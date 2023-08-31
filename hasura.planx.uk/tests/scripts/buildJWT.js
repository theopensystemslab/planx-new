const { buildJWTForRole } = require("../utils.js");

/**
 * @description 
 *   Build a signed JWT for the provided role and userId. 
 *   Useful for testing permissions in the Hasura console at a finer-grained level than the introspection tests currently allow.
 * @usage pnpm build-jwt <ROLE> <USER_ID>
 * @example pnpm build-jwt teamAdmin 123
 * @returns A JWT which can be copy/pasted to the Hasura admin console as a the "authorization" header
 */
const buildJWT = () => {
  const [role, userId] = process.argv.slice(2);
  const jwt = buildJWTForRole(role, userId);
  console.log(`Bearer ${jwt}`)
}

buildJWT();
