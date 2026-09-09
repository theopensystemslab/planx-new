/**
 * Single source of truth for file types accepted for upload across the stack.
 *
 * Some formats do not have reliable MIME types, so files are ultimately checked against extension only.
 *
 * Note that the MIME keys act as hints for the native file picker (so users may see some files which they cannot upload),
 * while react-dropzone 'accepts' a file if its browser-reported MIME type matches a key below, even if its extension does
 * not feature in the following list. We therefore roll our own validator to narrow the field - see the editor's extensionValidator.ts.
 *
 * Refer to MDN for common MIME types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
 * And IANA for the source of truth: https://www.iana.org/assignments/media-types/media-types.xhtml
 *
 * NB. Deliberately typed as a plain Record rather than react-dropzone's `Accept` type, so this package has no dependency
 * on react-dropzone (and can be safely imported by the backend). `Accept` is structurally compatible with this shape.
 */
export const ALLOWED_EXTENSIONS_BY_MIME_TYPE: Record<string, string[]> = {
  // PDFs
  "application/pdf": [".pdf"],
  // raster images
  "image/bmp": [".bmp"],
  "image/gif": [".gif"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/tiff": [".tif", ".tiff"],
  "image/vnd.microsoft.icon": [".ico"],
  "image/webp": [".webp"],
  "image/x-icon": [".ico"],
  // vector graphics
  "image/svg+xml": [".svg"],
  // CAD and BIM
  "image/vnd.dwg": [".dwg"],
  "image/vnd.dxf": [".dxf"],
  // text, MS Office documents and spreadsheets
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "application/rtf": [".rtf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  // videos
  "video/x-msvideo": [".avi"],
  "video/x-matroska": [".mkv"],
  "video/quicktime": [".mov"],
  "video/mp4": [".mp4"],
  "video/mpeg": [".mpg", ".mpeg"],
  "video/webm": [".webm"],
  "video/x-ms-wmv": [".wmv"],
  // GML (Geographic Markup Language)
  "application/gml+xml": [".gml"],
  // binary files with no registered and reliable MIME type, so we fall back to catchall octet-stream
  "application/octet-stream": [".bim", ".ifc", ".plt", ".rvt", ".skp"],
};

/**
 * MIME types we are willing to render as a thumbnail in the browser.
 *
 * Deliberately a hand-maintained allowlist rather than anything derived from the map above:
 * it covers only raster formats every browser can decode, so no other accepted type can start
 * being rendered inline just by being added to ALLOWED_EXTENSIONS_BY_MIME_TYPE.
 *
 * Notably excludes SVG. Although browsers disable scripting for SVGs loaded via <img>, SVG is
 * the one format we accept that can carry active content, and it is the one format `file-type`
 * cannot sniff - so its bytes are never validated. We would rather not lean on that single
 * browser behaviour. Also excludes TIFF and the CAD types, which browsers cannot render at all.
 */
export const PREVIEWABLE_MIME_TYPES: ReadonlySet<string> = new Set([
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Flat, deduplicated list of allowed extensions, derived from ALLOWED_EXTENSIONS_BY_MIME_TYPE above.
 * Used to 'validate' files by extension only (since MIME types are not reliable).
 */
export const ALLOWED_EXTENSIONS: string[] = Array.from(
  new Set(Object.values(ALLOWED_EXTENSIONS_BY_MIME_TYPE).flat()),
);

/**
 * Returns lowercased extension, with leading dot, e.g. '.pdf'.
 * Returns  "" for a filename with no extension, or for dotfiles ().
 *
 * Modelled on node's `path.extname`, which we avoid using so this package can be imported by the frontend.
 */
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf(".");
  return lastDot <= 0 ? "" : filename.slice(lastDot).toLowerCase();
};

/**
 * Single rule for whether we accept a file, shared by the API's upload middleware and frontend dropzones.
 */
export const isAllowedExtension = (filename: string): boolean =>
  ALLOWED_EXTENSIONS.includes(getFileExtension(filename));
