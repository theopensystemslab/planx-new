import { createHash } from "crypto";
import { writeFileSync } from "fs";
import stringify from "json-stringify-pretty-compact";
import nock from "nock";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Attempts to load HTTP requests that have been made in previous tests.
 * If none are found this will record requests in the current test and save
 * them to a file which has a hash based on the hashKey parameter.
 * Must be called inside a describe() block
 *
 * @param {string} filename a filename-safe string, excluding the extension
 * @param {*} hashKey something to generate the deterministic file hash from
 */
function loadOrRecordNockRequests(filename, hashKey) {
  // get the shortened sha256 hash whatever the hashKey is
  const hash = createHash("sha256")
    .update(JSON.stringify(hashKey))
    .digest("hex")
    .slice(0, 8);

  // we can't directly access `__dirname` in ESM, so get equivalent using fileURLToPath
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory
  const filePath = path.join(__dirname, "nocks", `${filename}.${hash}.json`);

  const records = [];

  beforeAll(() => {
    try {
      // attempt to load existing recorded nocks
      nock.load(filePath);
    } catch (err) {
      // no existing nocks found, let's start recording HTTP requests
      // https://github.com/nock/nock#recording
      nock.recorder.rec({
        output_objects: true,
        logging: (content) => records.push(content),
        use_separator: false,
        enable_reqheaders_recording: false,
      });
    }
  });

  afterAll(() => {
    // if HTTP requests were made while recording then save them to a file
    if (records.length > 0) {
      // stringify formats the file so that it's git diffable,
      // but a bit more compact than JSON.stringify(records, null, 2)
      writeFileSync(filePath, stringify(records));
    }
  });
}

export default loadOrRecordNockRequests;
