/**
 * Single source of truth for file types accepted for upload.
 *
 * Some formats do not have reliable MIME types, so files are ultimately checked API-side against extension only
 * (see ALLOWED_EXTENSIONS below). The MIME keys are best-effort hints for the native file picker on the frontend.
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
  "image/webp": [".webp"],
  // vector graphics
  "image/svg+xml": [".svg"],
  // CAD and BIM
  "image/vnd.dwg": [".dwg"],
  "image/vnd.dxf": [".dxf"],
  // Text, MS Office documents and spreadsheets
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/rtf": [".rtf"],
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
  // binary files without custom MIME, for which we fall back to catchall octet-stream
  "application/octet-stream": [".bim", ".ifc", ".plt", ".rvt", ".skp"],
};

/**
 * Flat, deduplicated list of allowed extensions, derived from ALLOWED_EXTENSIONS_BY_MIME_TYPE above.
 * Used by the backend to validate uploads by extension (since MIME types are not reliable).
 */
export const ALLOWED_EXTENSIONS: string[] = Array.from(
  new Set(Object.values(ALLOWED_EXTENSIONS_BY_MIME_TYPE).flat()),
);
