import path from "path";

/**
 * Returns a lowercased extension, keeping the leading dot, e.g. ".pdf", ".xlsx".
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};
