import supertest from "supertest";
import { Mocked } from "vitest";

import app from "../../server.js";
import { deleteFilesByURL } from "./service/deleteFile.js";
import { authHeader } from "../../tests/mockJWT.js";

let mockPutObject: Mocked<() => void>;
let mockGetObject: Mocked<() => void>;
let mockDeleteObjects: Mocked<() => void>;
let getObjectResponse = {};

const mockGetSignedUrl = vi.fn(() => {
  const randomFolderName = "nanoid";
  const modifiedKey = "modified%20key";
  return `
    https://test-bucket.s3.eu-west-2.amazonaws.com/${randomFolderName}/${modifiedKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-SignedHeaders=host
  `;
});

const s3Mock = () => {
  return {
    putObject: mockPutObject,
    getObject: mockGetObject,
    getSignedUrl: mockGetSignedUrl,
    deleteObjects: mockDeleteObjects,
  };
};

vi.mock("aws-sdk/clients/s3", () => ({
  default: vi.fn().mockImplementation(() => {
    return s3Mock();
  }),
}));

describe("File upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPutObject = vi.fn(() => ({
      promise: () => Promise.resolve(),
    }));
  });

  describe("Private", () => {
    const ENDPOINT = "/file/private/upload";

    it("should not upload without filename", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .field("filename", "")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should not upload without file", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .field("filename", "some filename")
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Missing file/);
        });
    });

    it("should upload file", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "text/plain",
            fileUrl: expect.stringContaining(
              "/file/private/nanoid/modified%20key",
            ),
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should handle S3 error", async () => {
      mockPutObject = vi.fn(() => ({
        promise: () => Promise.reject(new Error("S3 error!")),
      }));

      await supertest(app)
        .post("/file/private/upload")
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/S3 error!/);
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("Public", () => {
    const ENDPOINT = "/file/public/upload";

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
        .post(ENDPOINT)
        .set(auth)
        .field("filename", "")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(400)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("should not upload without file", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .set(auth)
        .field("filename", "some filename")
        .expect(500)
        .then((res) => {
          expect(mockPutObject).not.toHaveBeenCalled();
          expect(res.body.error).toMatch(/Missing file/);
        });
    });

    it("should upload file", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .set(auth)
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .then((res) => {
          expect(res.body).toEqual({
            fileType: "text/plain",
            fileUrl: expect.stringContaining(
              "file/public/nanoid/modified%20key",
            ),
          });
        });
      expect(mockPutObject).toHaveBeenCalledTimes(1);
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("should handle S3 error", async () => {
      mockPutObject = vi.fn(() => ({
        promise: () => Promise.reject(new Error("S3 error!")),
      }));

      await supertest(app)
        .post(ENDPOINT)
        .set(auth)
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
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
      Body: Buffer.from("some data"),
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

    mockGetObject = vi.fn(() => ({
      promise: () => Promise.resolve(getObjectResponse),
    }));
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
      mockGetObject = vi.fn(() => ({
        promise: () => Promise.reject(new Error("S3 error!")),
      }));

      await supertest(app)
        .get("/file/public/someKey/someFile.txt")
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/S3 error!/);
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
      mockGetObject = vi.fn(() => ({
        promise: () => Promise.reject(new Error("S3 error!")),
      }));

      await supertest(app)
        .get("/file/private/someKey/someFile.txt")
        .set({ "api-key": "test" })
        .field("filename", "some_file.txt")
        .attach("file", Buffer.from("some data"), "some_file.txt")
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/S3 error!/);
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
    mockDeleteObjects = vi.fn(() => ({
      promise: () => Promise.resolve(),
    }));
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
    mockDeleteObjects = vi.fn(() => ({
      promise: () => {
        throw Error();
      },
    }));
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
