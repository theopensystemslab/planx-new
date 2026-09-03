/**
 * One-off backfill of Scanii tags onto objects that predate the tagging Lambda.
 *
 * Anything Scanii flags is deleted at scan time, so an object still sitting in the
 * user-data bucket has by definition been scanned and passed. Tagging those survivors lets
 * us drop ENFORCE_SCAN_FROM back to an early date (or remove it altogether).
 *
 * Run with:
 *   pnpm tsx scripts/backfillScanTags.ts --dry-run
 *   pnpm tsx scripts/backfillScanTags.ts
 *
 * This routes through s3Factory(), so it follows NODE_ENV like the API does. Without
 * NODE_ENV set to a live value it targets Minio and reports success having tagged nothing
 * of consequence - so set both it and the bucket explicitly, e.g.
 *   NODE_ENV=staging AWS_S3_BUCKET=user-data-xxx pnpm tsx scripts/backfillScanTags.ts
 *   NODE_ENV=pizza AWS_S3_BUCKET=pizza-user-uploads pnpm tsx scripts/backfillScanTags.ts
 *
 * Safe to re-run: objects that already carry a ScaniiId are skipped.
 */
import { paginateListObjectsV2, type S3, type Tag } from "@aws-sdk/client-s3";

import {
  SCANII_FINDINGS_TAG,
  SCANII_ID_TAG,
} from "../modules/file/service/scanStatus.js";
import { s3Factory } from "../modules/file/service/utils.js";

/** Marks a tag as applied by this script rather than by a real Scanii scan */
const BACKFILL_SENTINEL = "legacy-backfill";

const BACKFILL_TAGS: Tag[] = [
  { Key: SCANII_ID_TAG, Value: BACKFILL_SENTINEL },
  { Key: SCANII_FINDINGS_TAG, Value: "" },
];

const backfill = async (dryRun: boolean) => {
  const s3 = s3Factory();
  const Bucket = process.env.AWS_S3_BUCKET;
  if (!Bucket) throw Error("Missing environment variable 'AWS_S3_BUCKET'");

  let scanned = 0;
  let tagged = 0;
  let skipped = 0;

  for await (const page of paginateListObjectsV2({ client: s3 }, { Bucket })) {
    for (const { Key } of page.Contents ?? []) {
      if (!Key) continue;
      scanned++;

      if (await isAlreadyTagged(s3, Bucket, Key)) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        await s3.putObjectTagging({
          Bucket,
          Key,
          Tagging: { TagSet: BACKFILL_TAGS },
        });
      }
      tagged++;

      if (tagged % 500 === 0) console.log(`  ...${tagged} tagged`);
    }
  }

  console.log(
    `${dryRun ? "[dry run] " : ""}Scanned ${scanned} objects: ${tagged} tagged, ${skipped} already tagged`,
  );
};

const isAlreadyTagged = async (s3: S3, Bucket: string, Key: string) => {
  const { TagSet } = await s3.getObjectTagging({ Bucket, Key });
  return Boolean(TagSet?.some((tag) => tag.Key === SCANII_ID_TAG));
};

const dryRun = process.argv.includes("--dry-run");

backfill(dryRun).catch((error) => {
  console.error(error);
  process.exit(1);
});
