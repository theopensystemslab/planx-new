import { encrypt } from "@opensystemslab/planx-core";

/**
 * Encrypt a secret
 * Currently used to generate secure secrets for the team_integrations table
 * e.g converting plain text 3rd-part API keys (such as BOPS tokens) to encrypted strings
 *
 * @param secret - The secret to be encrypted.
 * @param encryptionKey - The encryption key - a 32-byte string
 * @returns The encrypted secret and initialization vector in the format ${secret}:${iv}
 * @example pnpm encode <secret> <encryptionKey> 
 */
function main() {
  try {
    if (process.argv.length < 4) {
      console.error("Usage: pnpm encode <secret> <encryptionKey>");
      process.exit(1);
    }

    const secret = process.argv[2];
    const encryptionKey = process.argv[3];
    const encrypted = encrypt(secret, encryptionKey);

    console.log("Success!");
    console.log(encrypted);
  } catch (error) {
    console.log("Error!")
    console.error(error);
    process.exit(1);
  }
}

main();
