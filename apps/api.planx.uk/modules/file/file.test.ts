import supertest from "supertest";
import type { Mocked } from "vitest";

import app from "../../server.js";
import { deleteFilesByURL } from "./service/deleteFile.js";
import { authHeader } from "../../tests/mockJWT.js";

import type * as s3Client from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let mockPutObject: Mocked<() => void>;
let mockGetObject: Mocked<() => void>;
let mockDeleteObjects: Mocked<() => void>;
let getObjectResponse = {};

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
    deleteObjects = mockDeleteObjects;
  }

  return {
    ...actualS3Client,
    S3: MockS3,
  };
});

const PRIVATE_ENDPOINT = "/file/private/upload";
const PUBLIC_ENDPOINT = "/file/public/upload";

describe("File upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPutObject = vi.fn(() => Promise.resolve());
  });

  describe.each([PRIVATE_ENDPOINT, PUBLIC_ENDPOINT])(
    "File type validation for %s",
    (ENDPOINT) => {
      it("should not upload a file with an invalid extension", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", Buffer.from("some data"), "some_file.xlxs")
          .expect(500)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
      });

      it("should not upload a file with an invalid MIME type", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", Buffer.from("some data"), {
            filename: "invalid_file.txt", // Invalid file type
            contentType: "text/plain", // Invalid MIME type
          })
          .expect(500)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
      });

      it("should not upload a file a valid file type, but invalid MIME type", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", Buffer.from("some data"), {
            filename: "invalid_file.png", // Valid file type
            contentType: "text/plain", // Invalid MIME type
          })
          .expect(500)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
      });

      it("should not upload a file a valid MIME type, but invalid file type", async () => {
        await supertest(app)
          .post(ENDPOINT)
          .field("filename", "")
          .attach("file", Buffer.from("some data"), {
            filename: "invalid_file.txt", // Invalid file type
            contentType: "application/pdf", // Valid MIME type
          })
          .expect(500)
          .then((res) => {
            expect(mockPutObject).not.toHaveBeenCalled();
            expect(res.body.error).toMatch(/Unsupported file type/);
          });
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

    it("should not upload a file with an invalid extension in the filename parameter (no attachment)", async () => {
      await supertest(app)
        .post(PRIVATE_ENDPOINT)
        .field("filename", "my_file.exe") // filename does not match multer.file.filename
        .attach("file", Buffer.from("some data"), {
          filename: "my_file.jpg",
          contentType: "image/jpg",
        })
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Unsupported file type/);
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

    it("should not upload a file with an invalid extension in the filename parameter (no attachment)", async () => {
      await supertest(app)
        .post(PUBLIC_ENDPOINT)
        .set(auth)
        .field("filename", "my_file.exe") // filename does not match multer.file.filename
        .attach("file", Buffer.from("some data"), {
          filename: "my_file.jpg",
          contentType: "image/jpg",
        })
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Unsupported file type/);
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
      LastModified:
        "Tue May 31 2022 12:21:37 GMT+0000 (Coordinated Universal Time)",
      ETag: "a4c57ed39e8d869d636ccf5fc34a65a1",
    };
    vi.clearAllMocks();

    mockGetObject = vi.fn(() => Promise.resolve(getObjectResponse));
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

      await supertest(app)
        .get(`/file/public/${filePath}`)
        .expect(500)
        .then((res) => {
          expect(mockGetObject).toHaveBeenCalledTimes(1);
          expect(res.body.error).toMatch(/Bad request/);
        });
    });

    it("should handle S3 error", async () => {
      mockGetObject = vi.fn(() => Promise.reject(new Error("S3 error!")));

      await supertest(app)
        .get("/file/public/someKey/someFile.txt")
        .expect(404)
        .then((res) => {
          expect(res.body.error).toMatch(/Missing file/);
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
        .expect(404)
        .then((res) => {
          expect(res.body.error).toMatch(/Missing file/);
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

    it("should not download if file is private", async () => {
      const filePath = "somekey/file_name.txt";
      getObjectResponse = {
        ...getObjectResponse,
        Metadata: {
          is_private: "true",
        },
      };

      await supertest(app)
        .get(`/file/public/${filePath}`)
        .expect(500)
        .then((res) => {
          expect(mockGetObject).toHaveBeenCalledTimes(1);
          expect(res.body.error).toMatch(/Bad request/);
        });
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
        .expect(404)
        .then((res) => {
          expect(res.body.error).toMatch(/Missing file/);
        });
      expect(mockGetObject).toHaveBeenCalledTimes(1);
    });
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
