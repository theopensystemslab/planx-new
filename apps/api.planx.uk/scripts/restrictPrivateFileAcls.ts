/**
 * STATUS: in development + not run against any environment yet
 *
 * One-off remediation: strip the public-read ACL from user-uploaded ("private") objects.
 * Safe to re-run: any object whose ACL grants nothing to AllUsers is skipped.
 *
 * Run like:
 *   NODE_ENV=staging AWS_PROFILE=... AWS_S3_BUCKET=user-data-xxx pnpm tsx scripts/restrictPrivateFileAcls.ts --dry-run
 *   NODE_ENV=staging AWS_PROFILE=... AWS_S3_BUCKET=user-data-xxx pnpm tsx scripts/restrictPrivateFileAcls.ts
 *   NODE_ENV=pizza   AWS_PROFILE=... AWS_S3_BUCKET=pizza-user-uploads pnpm tsx scripts/restrictPrivateFileAcls.ts
 *
 * Where AWS_PROFILE is the env-specific value in your AWS config (usually at ~/.aws/config).
 */
import { paginateListObjectsV2, S3 } from "@aws-sdk/client-s3";
import { fromSSO } from "@aws-sdk/credential-providers";

import { isLiveEnv } from "../lib/env.js";

// AllUsers is the canonical group URI by which AWS means "anyone on the internet"
// See: https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html
const ALL_USERS_URI = "http://acs.amazonaws.com/groups/global/AllUsers";

const restrict = async (dryRun: boolean) => {
  if (!isLiveEnv())
    throw Error(
      `Refusing to run against a non-live environment (NODE_ENV="${process.env.NODE_ENV ?? ""}"). ` +
        `Without a live NODE_ENV this targets the local S3 emulator and may report success despite being a no-op.`,
    );

  const Bucket = process.env.AWS_S3_BUCKET;
  if (!Bucket) throw Error("Missing environment variable 'AWS_S3_BUCKET'");

  const s3 = new S3({
    credentials: fromSSO(),
  });

  let pageIndex = 0;
  let scanned = 0;
  let restricted = 0;
  let publicByDesign = 0;
  let alreadyPrivate = 0;
  let unclassified = 0;

  console.log(
    `${dryRun ? "[dry run] " : ""}Restricting private objects in ${Bucket}...`,
  );

  // see https://github.com/aws/aws-sdk-js/issues/3131#issuecomment-1091723976 for inspiration
  for await (const page of paginateListObjectsV2(
    { client: s3, pageSize: 1000 },
    { Bucket },
  )) {
    console.log(`  ...scanning page ${pageIndex}`);
    pageIndex++;
    for (const { Key } of page.Contents ?? []) {
      if (!Key) continue;
      scanned++;

      const { Metadata } = await s3.headObject({ Bucket, Key });

      if (!Metadata || !("is_private" in Metadata)) {
        unclassified++;
        continue;
      }

      if (Metadata.is_private === "false") {
        publicByDesign++;
        continue;
      }

      if (!(await isPubliclyReadable(s3, Bucket, Key))) {
        alreadyPrivate++;
        continue;
      }

      if (!dryRun) await s3.putObjectAcl({ Bucket, Key, ACL: "private" });
      restricted++;
    }
    console.log(`  ...${restricted} restricted`);
  }
  console.log(
    [
      `${dryRun ? "[dry run] " : ""}Scanned ${scanned} objects in total:`,
      `${restricted} private objects restricted with private ACL,`,
      `${alreadyPrivate} already have private ACL (no action),`,
      `${publicByDesign} objects marked as public (no action),`,
      `${unclassified} unclassified objects (no action)`,
    ].join(" "),
  );
};

const isPubliclyReadable = async (s3: S3, Bucket: string, Key: string) => {
  const { Grants } = await s3.getObjectAcl({ Bucket, Key });
  return Boolean(Grants?.some(({ Grantee }) => Grantee?.URI === ALL_USERS_URI));
};

const dryRun = process.argv.includes("--dry-run");

restrict(dryRun).catch((error) => {
  console.error(error);
  process.exit(1);
});
