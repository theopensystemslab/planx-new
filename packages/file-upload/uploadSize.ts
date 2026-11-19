/**
 * Single source of truth for the max upload size of any file
 */
export const MAX_UPLOAD_SIZE_MB = 30;

export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1e6;

/**
 * Min upload size of any file - i.e. we reject empty files.
 *
 * Scanii won't scan an empty file (it fails to fetch it from S3), so it would never be tagged as scanned,
 * and would block the submission it belongs to from being downloaded.
 */
export const MIN_UPLOAD_SIZE_BYTES = 1;
