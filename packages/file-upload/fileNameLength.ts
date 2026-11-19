/**
 * Max length of a user-uploaded file name, as typed
 */
export const MAX_FILENAME_LENGTH = 75;

/**
 * Applicant uploaded files are stored %-encoded as `${nanoid}-${filename}`. Since they end up on
 * council filesystems, we cap this at the usual limit of 255, also accounting for the nanoid and hyphen.
 */
export const MAX_ENCODED_FILENAME_LENGTH = 255 - 8 - 1;

export const isFilenameTooLong = (filename: string): boolean =>
  filename.length >= MAX_FILENAME_LENGTH;

/**
 * MAX_FILENAME_LENGTH assumes encoding at most triples a name, which holds for ASCII,
 * but non-ASCII characters can stretch to x9 (e.g. curly apostrophe) or even x12 (e.g. emoji).
 */
export const isEncodedFilenameTooLong = (filename: string): boolean =>
  encodeURIComponent(filename).length > MAX_ENCODED_FILENAME_LENGTH;
