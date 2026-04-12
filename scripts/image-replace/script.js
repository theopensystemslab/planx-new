const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const API_ROOT = "https://api.editor.planx.uk";
const UPLOAD_ENDPOINT = "/file/public/upload";
const TEMP_DIR = "./temp_images";

// Configuration
const INPUT_CSV = "input.csv";
const OUTPUT_CSV = "output.csv";
const URL_COLUMN = "url";
const JWT = process.env.JWT;

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Detects MIME type and Extension based on content
 */
function getFileInfo(buffer) {
  const textHeader = buffer.toString("utf8", 0, 100).toLowerCase();
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return { ext: ".jpg", mime: "image/jpeg" };
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return { ext: ".png", mime: "image/png" };
  if (textHeader.includes("<svg") || textHeader.includes("<?xml")) return { ext: ".svg", mime: "image/svg+xml" };
  return { ext: ".png", mime: "image/png" };
}

/**
 * Downloads and extracts the true filename from Google Drive
 */
async function downloadImage(url) {
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  // Capture filename from Content-Disposition header (after redirects)
  const cd = response.headers.get("content-disposition");
  let filename = null;
  if (cd) {
    // Regex covers standard filename and UTF-8 encoded filename*
    const match = cd.match(/filename\*?=[""]?(?:UTF-8"")?([^;"\n" ]*)[""]?/i);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, filename };
}

/**
 * Uploads with explicit Mime-Type to avoid "application/octet-stream" errors
 */
async function uploadFile(filepath) {
  const fileBuffer = await fsPromises.readFile(filepath);
  const filename = path.basename(filepath);
  const { mime } = getFileInfo(fileBuffer);

  const formData = new FormData();

  // Explicitly setting the Blob type ensures the Content-Type header is sent correctly
  const blob = new Blob([fileBuffer], { type: mime });

  formData.append("file", blob, filename);
  formData.append("filename", filename);

  const response = await fetch(`${API_ROOT}${UPLOAD_ENDPOINT}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${JWT}` },
    body: formData
  });

  const responseText = await response.text();
  if (!response.ok) throw new Error(`Upload failed: ${response.status} - ${responseText}`);

  return JSON.parse(responseText);
}

async function processCSV() {
  console.log(`Reading CSV: ${INPUT_CSV}`);
  const fileContent = await fsPromises.readFile(INPUT_CSV, "utf-8");
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });
  const results = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const oldUrl = record[URL_COLUMN];

    if (!oldUrl) {
      results.push({ ...record, local_filename: "", new_url: "" });
      continue;
    }

    console.log(`\nProcessing ${i + 1}/${records.length}: ${oldUrl}`);

    try {
      const { buffer, filename: serverFilename } = await downloadImage(oldUrl);

      const { ext } = getFileInfo(buffer);
      const finalFilename = serverFilename || `image_${i + 1}${ext}`;
      const tempPath = path.join(TEMP_DIR, finalFilename);

      await fsPromises.writeFile(tempPath, buffer);
      console.log(`  ✓ Saved: ${finalFilename}`);

      const response = await uploadFile(tempPath);
      const newUrl = response.fileUrl || response.url;
      console.log(`  ✓ Uploaded: ${newUrl}`);

      results.push({
        ...record,
        local_filename: finalFilename,
        new_url: newUrl
      });

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      results.push({
        ...record,
        local_filename: "N/A",
        new_url: `ERROR: ${error.message}`
      });
    }

    // Safety delay - API has rate limiting in place
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nWriting results to: ${OUTPUT_CSV}`);
  const output = stringify(results, { header: true });
  await fsPromises.writeFile(OUTPUT_CSV, output);
  console.log("✓ Done!");
}

processCSV().catch(console.error);