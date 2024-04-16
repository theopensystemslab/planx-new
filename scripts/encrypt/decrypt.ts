import { decrypt } from "@opensystemslab/planx-core";

/**
 * Decrypt a secret
 * Currently used to read secure secrets from the team_integrations table back to plain text
 * e.g using API keys in another context, checking values
 *
 * @param encryptionKey - The encryption key - a 32-byte string
 * @param secret - The encrypted secret and initialization vector in the format ${secret}:${iv}
 * @returns The decrypted secret
 * @example pnpm decrypt <encryptionKey> <secret>
 */
function main() {
  try {
    if (process.argv.length < 4) {
      console.error("Usage: pnpm decrypt <encryptionKey> <secret>");
      process.exit(1);
    }
    
    const encryptionKey = process.argv[2];
    const secret = process.argv[3];
    const decrypted = decrypt(secret, encryptionKey);

    console.log("Success!");
    console.log(decrypted);
  } catch (error) {
    console.log("Error!");
    console.error(error);
    process.exit(1);
  }
}

main();
