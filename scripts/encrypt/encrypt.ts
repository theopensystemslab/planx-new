import { encrypt } from "@opensystemslab/planx-core";

/**
 * Encrypt a secret
 * Currently used to generate secure secrets for the team_integrations table
 * e.g converting plain text 3rd-part API keys (such as BOPS tokens) to encrypted strings
 *
 * @param encryptionKey - The encryption key - a 32-byte string
 * @param secret - The secret to be encrypted.
 * @returns The encrypted secret and initialization vector in the format ${secret}:${iv}
 * @example pnpm encrypt <encryptionKey> <secret>
 */
function main() {
  try {
    if (process.argv.length < 4) {
      console.error("Usage: pnpm encrypt <encryptionKey> <secret>");
      process.exit(1);
    }

    const encryptionKey = process.argv[2];
    const secret = process.argv[3];
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
