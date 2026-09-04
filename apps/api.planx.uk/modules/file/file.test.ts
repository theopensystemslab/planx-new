import type * as s3Client from "@aws-sdk/client-s3";
import { NoSuchKey, NotFound } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import supertest from "supertest";
import { fileURLToPath } from "url";
import type { Mocked } from "vitest";

import app from "../../server.js";
import { authHeader } from "../../tests/mockJWT.js";
import { deleteFilesByURL } from "./service/deleteFile.js";

let mockPutObject: Mocked<() => void>;
let mockGetObject: Mocked<() => void>;
let mockGetObjectTagging: Mocked<() => void>;
let mockHeadObject: Mocked<() => void>;
let mockDeleteObjects: Mocked<() => void>;
let getObjectResponse = {};

// tags as written by the Scanii callback Lambda for a file it scanned and cleared
const CLEAN_TAGS = {
  TagSet: [
    { Key: "ScaniiId", Value: "c13cedff8cd47119a538d4fa2202f97e" },
    { Key: "ScaniiFindings", Value: "None" },
  ],
};

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(() => {
    const randomFolderName = "nanoid";
    const modifiedKey = "modified%20key";
    return `https://test-bucket.s3.eu-west-2.amazonaws.com/${randomFolderName}/${modifiedKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-SignedHeaders=host`;
  }),
}));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actualS3Client = await importOriginal<typeof s3Client>();

  class MockS3 {
    putObject = mockPutObject;
    getObject = mockGetObject;
    getObjectTagging = mockGetObjectTagging;
    headObject = mockHeadObject;
    deleteObjects = mockDeleteObjects;
  }

  return {
    ...actualS3Client,
    S3: MockS3,
  };
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// real PNG bytes needed since file-type sniffs actual image/zip structure, not just a magic number
const PNG_FIXTURE = fs.readFileSync(
  path.join(__dirname, "fixtures", "planx-logo.png"),
);
const PRIVATE_ENDPOINT = "/file/private/upload";
const PUBLIC_ENDPOINT = "/file/public/upload";

describe("File upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPutObject = vi.fn(() => Promise.resolve());
  });

  describe.each([PRIVATE_ENDPOINT, PUBLIC_ENDPOINT])(
    "File size validation for %s",
    (ENDPOINT) => {
      it("should return 413 when file exceeds the 30MB limit", async () => {
        const oversizedBuffer = Buffer.alloc(31 * 1024 * 1024); // 31MB
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", oversizedBuffer, "large_file.pdf")
          .expect(413)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/File too large/);
          });
      });

      it("should return 400 when file is attached to an unexpected field", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("wrong_field", Buffer.from("some data"), "some_file.pdf")
          .expect(400)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unexpected field/);
          });
      });
    },
  );

  describe.each([PRIVATE_ENDPOINT, PUBLIC_ENDPOINT])(
    "File type validation for %s",
    (ENDPOINT) => {
      it("should not upload a file with an unsupported extension", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "some_file.exe")
          .attach("file", Buffer.from("some data"), "some_file.exe")
          .expect(415)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
      });

      it("should reject an unsupported extension even with a valid-looking MIME type", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", Buffer.from("some data"), {
            filename: "malicious_file.exe",
            contentType: "application/pdf", // Valid MIME type
          })
          .expect(415)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
      });
    },
  );

  describe.each([PRIVATE_ENDPOINT, PUBLIC_ENDPOINT])(
    "File content validation for %s",
    (ENDPOINT) => {
      const auth = authHeader({ role: "teamEditor" });
      const PDF_HEADER = Buffer.from("%PDF-1.4\n%some minimal content");

      it("should reject content whose magic number doesn't match the claimed extension", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.pdf")
          .attach("file", PNG_FIXTURE, "some_file.pdf") // real PNG bytes, claimed as PDF
          .expect(415)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(
              /File content does not match given extension/,
            );
          });
      });

      it("should allow content whose magic number matches the claimed extension", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.pdf")
          .attach("file", PDF_HEADER, "some_file.pdf")
          .expect(200);
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });

      // file-type has no doc/xls entries - legacy Office files are OLE compound documents, which are
      // reported as "cfb" - without the CONTAINER_TYPES mapping these would skip validation altogether
      const CFB_HEADER = Buffer.concat([
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
        Buffer.alloc(512),
      ]);
      const EXE_HEADER = Buffer.concat([
        Buffer.from("MZ\x90\x00", "binary"),
        Buffer.alloc(512),
      ]);

      it("should reject an executable disguised as a legacy Office file", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.doc")
          .attach("file", EXE_HEADER, "some_file.doc")
          .expect(415)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(
              /File content does not match given extension/,
            );
          });
      });

      it("should reject an image disguised as a legacy Office file", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.xls")
          .attach("file", PNG_FIXTURE, "some_file.xls")
          .expect(415);
        expect(mockPutObject).not.toHaveBeenCalled();
      });

      it("should allow a genuine OLE compound document as .doc", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.doc")
          .attach("file", CFB_HEADER, "some_file.doc")
          .expect(200);
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });

      // file-type cannot identify plain text, so these are allowed through unchecked - we only
      // reject confirmed mismatches rather than penalising formats we cannot verify
      it("should allow a newly-enabled extension file-type cannot sniff", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .set(auth)
          .field("filename", "some_file.csv")
          .attach("file", Buffer.from("a,b,c\n1,2,3"), "some_file.csv")
          .expect(200);
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });
    },
  );

  describe("Private", () => {
    it("should not upload without filename", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "")
        .attach("file", Buffer.from("some data"), "some_file.jpg")
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should not upload without file", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_filename.png")
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Missing file/);
        });
    });

    it("should not upload when the filename parameter has an unsupported extension", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "my_file.exe") // filename does not match multer.file.filename
        .attach("file", Buffer.from("some data"), {
          filename: "my_file.jpg",
          contentType: "image/jpeg",
        })
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should upload JPG", async () => {
      vi.stubEnv("API_URL_EXT", "https://api.editor.planx.dev");
      vi.stubEnv("AWS_S3_BUCKET", "myBucketName");

      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.jpg")
        .attach("file", Buffer.from("some data"), "some_file.jpg")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "image/jpeg",
            // Bucket name stripped from URL
            fileUrl:
              "https://api.editor.planx.dev/file/private/nanoid/modified%20key",
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should upload PDF", async () => {
      vi.stubEnv("API_URL_EXT", "https://api.editor.planx.dev");
      vi.stubEnv("AWS_S3_BUCKET", "myBucketName");

      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.pdf")
        .attach("file", Buffer.from("some data"), "some_file.pdf")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "application/pdf",
            // Bucket name stripped from URL
            fileUrl:
              "https://api.editor.planx.dev/file/private/nanoid/modified%20key",
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should upload SVG", async () => {
      vi.stubEnv("API_URL_EXT", "https://api.editor.planx.dev");
      vi.stubEnv("AWS_S3_BUCKET", "myBucketName");

      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.svg")
        .attach("file", Buffer.from("some data"), "some_file.svg")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "image/svg+xml",
            // Bucket name stripped from URL
            fileUrl:
              "https://api.editor.planx.dev/file/private/nanoid/modified%20key",
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should upload a file with a supported extension despite an unexpected MIME type", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.png")
        .attach("file", Buffer.from("some data"), {
          filename: "some_file.png", // Supported extension will be privileged over MIME
          contentType: "application/octet-stream", // Unreliable MIME type will be ignored
        })
        .expect(200);
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    // objects are written with a public-read ACL, so what we persist is what a client fetching
    // straight from S3 would be handed - it should match what the API itself would serve
    it("should store headers we chose, not ones the client supplied", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.png")
        .attach("file", Buffer.from("some data"), {
          filename: "some_file.png",
          contentType: "text/html", // an uploader's claim about their own bytes
        })
        .expect(200);

      expect(mockPutObject).toHaveBeenCalledWith(
        expect.objectContaining({
          ContentType: "image/png",
          ContentDisposition: 'attachment;filename="some_file.png"',
        }),
      );
    });

    it.each([
      "drawing.plt",
      "model.gml",
      "report.docx",
      "schedule.xlsx",
      "notes.txt",
      "walkthrough.mp4",
    ])("should upload newly supported format %s", async (filename) => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", filename)
        .attach("file", Buffer.from("some data"), filename)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty("fileUrl");
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should handle S3 error", async () => {
      mockPutObject = vi.fn(() => Promise.reject(new Error("S3 error!")));

      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.jpg")
        .attach("file", Buffer.from("some data"), "some_file.jpg")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/S3 error!/);
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
    });

    it("should generate a correct URL on production", async () => {
      vi.stubEnv("API_URL_EXT", "https://api.editor.planx.uk");
      vi.stubEnv("NODE_ENV", "production");

      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "some_file.jpg")
        .attach("file", Buffer.from("some data"), "some_file.jpg")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "image/jpeg",
            fileUrl:
              "https://api.editor.planx.uk/file/private/nanoid/modified%20key",
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe("Public", () => {
    const auth = authHeader({ role: "teamEditor" });

    it("returns an error if authorization headers are not set", async () => {
      await supertest(app)
        .post("/flows/1/move/new-team")
        .expect(401)
        .then((res) => {
          expect(res.body).toEqual({
            error: "No authorization token was found",
          });
        });
    });

    it("should not upload without filename", async () => {
      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "")
        .attach("file", Buffer.from("some data"), "some_file.pdf")
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should not upload without file", async () => {
      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "some_filename.jpg")
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Missing file/);
        });
    });

    it("should not upload when the filename parameter has an unsupported extension", async () => {
      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "my_file.exe") // filename does not match multer.file.filename
        .attach("file", Buffer.from("some data"), {
          filename: "my_file.jpg",
          contentType: "image/jpeg",
        })
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should upload file", async () => {
      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "some_file.pdf")
        .attach("file", Buffer.from("some data"), "some_file.pdf")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "application/pdf",
            fileUrl: expect.stringContaining(
              "file/public/nanoid/modified%20key",
            ),
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should handle S3 error", async () => {
      mockPutObject = vi.fn(() => Promise.reject(new Error("S3 error!")));

      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "some_file.pdf")
        .attach("file", Buffer.from("some data"), "some_file.pdf")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/S3 error!/);
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
    });
  });
});

describe("File download", () => {
  beforeEach(() => {
    getObjectResponse = {
      Body: { transformToByteArray: () => new ArrayBuffer(24) },
      ContentLength: "633",
      ContentDisposition: "inline;filename='some_file.txt'",
      ContentEncoding: "undefined",
      CacheControl: "undefined",
      Expires: "undefined",
      LastModified: new Date("2022-05-31T12:21:37Z"),
      ETag: "a4c57ed39e8d869d636ccf5fc34a65a1",
      TagCount: 2,
    };
    vi.clearAllMocks();

    mockGetObject = vi.fn(() => Promise.resolve(getObjectResponse));
    mockGetObjectTagging = vi.fn(() => Promise.resolve(CLEAN_TAGS));
  });

  // we set Content-Type and Content-Disposition ourselves rather than echoing what S3 holds
  describe.each([
    ["public", "/file/public", {}],
    ["private", "/file/private", { "api-key": "test" }],
  ])("response headers on the %s route", (_name, route, headers) => {
    const get = (key: string) =>
      supertest(app).get(`${route}/${key}`).set(headers);

    it("serves as an attachment rather than inline", async () => {
      const res = await get("somekey/file_name.txt").expect(200);

      expect(res.headers["content-disposition"]).toBe(
        'attachment; filename="file_name.txt"',
      );
    });

    /**
     * S3 keys use the %-encoded filename, and the signed-URL we build API URLs from
     * escapes that again - so a real request path is double-encoded. Express decodes
     * path params once, leaving our own encoding for the handler to undo.
     */
    const requestPathFor = (filename: string) =>
      `somekey/${encodeURIComponent(encodeURIComponent(filename))}`;

    it.each([
      "my plan.pdf",
      "my file (1).pdf",
      "it's a plan.pdf",
      "star*.png",
      "plain.png",
    ])("serves %j under its decoded name", async (original) => {
      const res = await get(requestPathFor(original)).expect(200);

      expect(res.headers["content-disposition"]).toBe(
        `attachment; filename="${original}"`,
      );
    });

    it("derives Content-Type from the extension, ignoring what S3 stored", async () => {
      getObjectResponse = {
        ...getObjectResponse,
        // as if an uploader had claimed their .png was HTML
        ContentType: "text/html",
      };

      const res = await get("somekey/picture.png").expect(200);
      expect(res.headers["content-type"]).toMatch(/^image\/png/);
    });

    it("serves an SVG as an attachment, so it is never loaded as a document", async () => {
      const res = await get("somekey/drawing.svg").expect(200);

      expect(res.headers["content-disposition"]).toMatch(/^attachment/);
      expect(res.headers["content-type"]).toMatch(/^image\/svg\+xml/);
    });

    it("falls back to octet-stream for an extension with no known type", async () => {
      const res = await get("somekey/model.ifc").expect(200);
      expect(res.headers["content-type"]).toMatch(/^application\/octet-stream/);
    });

    it("sets nosniff so the browser cannot second-guess our Content-Type", async () => {
      const res = await get("somekey/file_name.txt").expect(200);
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("allows cross-origin embedding, which the editor relies on for public images", async () => {
      const res = await get("somekey/file_name.txt").expect(200);
      expect(res.headers["cross-origin-resource-policy"]).toBe("cross-site");
    });

    it("emits a valid HTTP-date for Last-Modified, and no phantom headers", async () => {
      const res = await get("somekey/file_name.txt").expect(200);

      expect(res.headers["last-modified"]).toBe(
        "Tue, 31 May 2022 12:21:37 GMT",
      );
      // absent S3 fields used to be echoed as the literal string "undefined"
      expect(res.headers["cache-control"]).not.toBe("undefined");
      expect(res.headers["expires"]).not.toBe("undefined");
      expect(res.headers["content-encoding"]).toBeUndefined();
    });
  });

  // useNoCache runs before the controller, so echoing S3's (absent) Cache-Control and Expires
  // used to overwrite both - meaning private files were served without no-store at all
  it("does not let echoed S3 headers overwrite the private route's no-store", async () => {
    const res = await supertest(app)
      .get("/file/private/somekey/file_name.txt")
      .set({ "api-key": "test" })
      .expect(200);

    expect(res.headers["cache-control"]).toBe(
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    expect(res.headers["expires"]).toBe("0");
    expect(res.headers["surrogate-control"]).toBe("no-store");
  });

  describe("Public", () => {
    it("should not download with incomplete path", async () => {
      await supertest(app).get("/file/public/someKey").expect(404);
    });

    it("should download", async () => {
      await supertest(app)
        .get("/file/public/somekey/file_name.txt")
        .expect(200)
        .then((_res) => {
          expect(mockGetObject).toHaveBeenCalledTimes(1);
        });
    });

    it("should not download private files", async () => {
      const filePath = "somekey/file_name.txt";
      getObjectResponse = {
        ...getObjectResponse,
        Metadata: {
          is_private: "true",
        },
      };

      // Indistinguishable from a missing file, so the public route can't be used to probe
      // for the existence of private ones
      await supertest(app)
        .get(`/file/public/${filePath}`)
        .expect(404)
        .then((res) => {
          expect(mockGetObject).toHaveBeenCalledTimes(1);
          expect(res.body.error).toBe("FILE_NOT_FOUND");
        });
    });

    it("should 404 when the file is not in S3", async () => {
      const noSuchKey = new NoSuchKey({
        message: "The specified key does not exist.",
        $metadata: { httpStatusCode: 404 },
      });
      mockGetObject = vi.fn(() => Promise.reject(noSuchKey));

      await supertest(app)
        .get("/file/public/someKey/someFile.txt")
        .expect(404)
        .then((res) => {
          expect(res.body.error).toBe("FILE_NOT_FOUND");
        });
      expect(mockGetObject).toHaveBeenCalledTimes(1);
    });

    it("should handle S3 error", async () => {
      mockGetObject = vi.fn(() => Promise.reject(new Error("S3 error!")));

      // An unexpected S3 failure is a 500
      await supertest(app)
        .get("/file/public/someKey/someFile.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to download file/);
        });
      expect(mockGetObject).toHaveBeenCalledTimes(1);
    });

    it("should handle an empty file body", async () => {
      mockGetObject = vi.fn(() =>
        Promise.resolve({
          ...getObjectResponse,
          Body: undefined,
        }),
      );

      await supertest(app)
        .get("/file/public/someKey/someFile.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to download file/);
        });
      expect(mockGetObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("Private", () => {
    it("should not download with incomplete path", async () => {
      await supertest(app)
        .get("/file/private/someKey")
        .set({ "api-key": "test" })
        .expect(404);
    });

    it("should not download if user is unauthorised", async () => {
      const filePath = "somekey/file_name.txt";

      getObjectResponse = {
        ...getObjectResponse,
        Metadata: {
          is_private: "true",
        },
      };

      await supertest(app)
        .get(`/file/private/${filePath}`)
        .set({ "api-key": "INVALID" })
        .expect(401);
    });

    it("should download file", async () => {
      const filePath = "somekey/file_name.txt";

      getObjectResponse = {
        ...getObjectResponse,
        Metadata: {
          is_private: "true",
        },
      };

      await supertest(app)
        .get(`/file/private/${filePath}`)
        .set({ "api-key": "test" })
        .expect(200)
        .then(() => {
          expect(mockGetObject).toHaveBeenCalledTimes(1);
        });
    });

    it("should handle S3 error", async () => {
      mockGetObject = vi.fn(() => Promise.reject(new Error("S3 error!")));

      await supertest(app)
        .get("/file/private/someKey/someFile.txt")
        .set({ "api-key": "test" })
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to download file/);
        });
      expect(mockGetObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("Scanii verification", () => {
    const FILE_PATH = "somekey/file_name.txt";
    const get = () =>
      supertest(app)
        .get(`/file/private/${FILE_PATH}`)
        .set({ "api-key": "test" });

    it("serves any file when ENFORCE_SCAN_FROM is unset", async () => {
      // The guard is off by default - this is the state in local development and in e2e
      getObjectResponse = { ...getObjectResponse, TagCount: 0 };

      await get().expect(200);
      expect(mockGetObjectTagging).not.toHaveBeenCalled();
    });

    describe("with enforcement enabled", () => {
      beforeEach(() => {
        vi.stubEnv("ENFORCE_SCAN_FROM", "2024-01-01T00:00:00Z");
      });

      afterEach(() => vi.unstubAllEnvs());

      it("serves a file tagged as scanned and clean", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
        };

        await get().expect(200);
        expect(mockGetObjectTagging).toHaveBeenCalledTimes(1);
      });

      it("returns 503 FILE_SCAN_PENDING for an untagged file", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
          TagCount: 0,
        };

        await get()
          .expect(503)
          .then((res) => {
            expect(res.body.error).toBe("FILE_SCAN_PENDING");
            expect(res.headers["retry-after"]).toBe("30");
          });
        expect(mockGetObjectTagging).not.toHaveBeenCalled();
      });

      it("returns 503 FILE_SCAN_PENDING when non-Scanii tags are present", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
        };
        mockGetObjectTagging = vi.fn(() =>
          Promise.resolve({ TagSet: [{ Key: "Team", Value: "barnet" }] }),
        );

        await get()
          .expect(503)
          .then((res) => expect(res.body.error).toBe("FILE_SCAN_PENDING"));
      });

      it("returns 404 when Scanii recorded findings", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
        };
        mockGetObjectTagging = vi.fn(() =>
          Promise.resolve({
            TagSet: [
              { Key: "ScaniiId", Value: "abc123" },
              {
                Key: "ScaniiFindings",
                Value: "content.malicious.eicar-test-signature",
              },
            ],
          }),
        );

        await get()
          .expect(404)
          .then((res) => expect(res.body.error).toBe("FILE_FLAGGED"));
      });

      // regression: "None" is what the Lambda actually writes for a clean file
      // Reading it as a 'finding' meant every scanned file 404'd on staging
      it.each(["None", "none", "NONE", " None ", ""])(
        "serves a file whose findings tag is %j",
        async (findings) => {
          getObjectResponse = {
            ...getObjectResponse,
            LastModified: new Date("2026-08-01T00:00:00Z"),
          };
          mockGetObjectTagging = vi.fn(() =>
            Promise.resolve({
              TagSet: [
                { Key: "ScaniiId", Value: "abc123" },
                { Key: "ScaniiFindings", Value: findings },
              ],
            }),
          );

          await get().expect(200);
        },
      );

      // an unrecognised findings format must fail closed rather than be waved through
      it("returns 404 when the findings tag holds something we don't recognise", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
        };
        mockGetObjectTagging = vi.fn(() =>
          Promise.resolve({
            TagSet: [
              { Key: "ScaniiId", Value: "abc123" },
              { Key: "ScaniiFindings", Value: "unexpected-new-format" },
            ],
          }),
        );

        await get()
          .expect(404)
          .then((res) => expect(res.body.error).toBe("FILE_FLAGGED"));
      });

      it("serves an untagged file uploaded before the cutoff", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2023-06-01T00:00:00Z"),
          TagCount: 0,
        };

        await get().expect(200);
        expect(mockGetObjectTagging).not.toHaveBeenCalled();
      });

      it("serves an API-generated file marked scan_exempt in metadata", async () => {
        getObjectResponse = {
          ...getObjectResponse,
          LastModified: new Date("2026-08-01T00:00:00Z"),
          TagCount: 0,
          Metadata: { is_private: "true", scan_exempt: "true" },
        };

        await get().expect(200);
        expect(mockGetObjectTagging).not.toHaveBeenCalled();
      });

      it("fails when ENFORCE_SCAN_FROM is malformed", async () => {
        vi.stubEnv("ENFORCE_SCAN_FROM", "not-a-date");

        await get().expect(500);
      });
    });
  });
});

describe("DELETE /file/public/:fileKey/:fileName", () => {
  const FILE_PATH = "somekey/file_name.txt";
  const del = () =>
    supertest(app)
      .delete(`/file/public/${FILE_PATH}`)
      .set(authHeader({ role: "platformAdmin" }));

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeadObject = vi.fn(() => Promise.resolve({ Metadata: {} }));
    mockDeleteObjects = vi.fn(() => Promise.resolve());
  });

  it("deletes a public file", async () => {
    await del().expect(204);

    // Metadata-only read: no reason to pull bytes we're about to throw away
    expect(mockHeadObject).toHaveBeenCalledTimes(1);
    expect(mockGetObject).not.toHaveBeenCalled();
    expect(mockDeleteObjects).toHaveBeenCalledTimes(1);
  });

  it("deletes a file whose scan is still pending", async () => {
    vi.stubEnv("ENFORCE_SCAN_FROM", "2024-01-01T00:00:00Z");
    mockHeadObject = vi.fn(() =>
      Promise.resolve({ Metadata: {}, TagCount: 0 }),
    );

    await del().expect(204);

    expect(mockDeleteObjects).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });

  it("refuses to delete a private file", async () => {
    mockHeadObject = vi.fn(() =>
      Promise.resolve({ Metadata: { is_private: "true" } }),
    );

    await del()
      .expect(404)
      .then((res) => expect(res.body.error).toBe("FILE_NOT_FOUND"));

    expect(mockDeleteObjects).not.toHaveBeenCalled();
  });

  it("404s when the file is not in S3", async () => {
    const notFound = new NotFound({
      message: "Not Found",
      $metadata: { httpStatusCode: 404 },
    });
    mockHeadObject = vi.fn(() => Promise.reject(notFound));

    await del()
      .expect(404)
      .then((res) => expect(res.body.error).toBe("FILE_NOT_FOUND"));

    expect(mockDeleteObjects).not.toHaveBeenCalled();
  });

  it("requires platformAdmin", async () => {
    await supertest(app)
      .delete(`/file/public/${FILE_PATH}`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(403);
  });
});

describe("File delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes files by URL", async () => {
    mockDeleteObjects = vi.fn(() => Promise.resolve());

    const fileURLs = [
      "https://api.planx.dev/file/private/abc/123",
      "https://api.planx.dev/file/private/def/456",
    ];
    const result = await deleteFilesByURL(fileURLs);

    expect(result).toHaveLength(2);
    expect(mockDeleteObjects).toHaveBeenCalledTimes(1);
    expect(mockDeleteObjects).toHaveBeenCalledWith(
      expect.objectContaining({
        Delete: expect.objectContaining({
          Objects: expect.arrayContaining([
            expect.objectContaining({ Key: "abc/123" }),
            expect.objectContaining({ Key: "def/456" }),
          ]),
        }),
      }),
    );
  });

  it("throw an error if S3 fails to delete the file", async () => {
    mockDeleteObjects = vi.fn(() => {
      throw Error();
    });

    const fileURLs = [
      "https://api.planx.dev/file/private/abc/123",
      "https://api.planx.dev/file/private/def/456",
    ];

    await expect(deleteFilesByURL(fileURLs)).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(/Failed to delete S3 files/),
      }),
    );
  });
});
