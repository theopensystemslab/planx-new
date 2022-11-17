
import supertest from "supertest";

import app from "../server";

const mockPutObject = jest.fn(() => ({
  promise: () => Promise.resolve()
}))

let getObjectResponse = {};

const mockGetObject = jest.fn(() => ({
  promise: () => Promise.resolve(getObjectResponse)
}))

const mockGetSignedUrl = jest.fn((_operation, params) => (
  `https://test-bucket.s3.eu-west-2.amazonaws.com/${params.Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-SignedHeaders=host`
))

const s3Mock = () => {
  return {
    putObject: mockPutObject,
    getObject: mockGetObject,
    getSignedUrl: mockGetSignedUrl,
  };
};

jest.mock('aws-sdk/clients/s3', () => {
  return jest.fn().mockImplementation(() => {
    return s3Mock();
  })
});

describe("File upload", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("private-file-upload - should not upload without filename", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", '')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing filename")
      })
  });

  it("private-file-upload - should not upload without file", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", 'some filename')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing file")
      })
  });

  it("private-file-upload - should upload file", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", 'some_file.txt')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .then(res => {
        expect(res.body).toEqual({
          file_type: 'text/plain',
          fileUrl: expect.stringContaining('some_file.txt'),
        });
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });
  });

  it("public-file-upload - should not upload without file", async () => {
    await supertest(app)
      .post("/public-file-upload")
      .field("filename", 'some filename')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing file")
      })
  });

  it("public-file-upload - should upload file", async () => {
    await supertest(app)
      .post("/public-file-upload")
      .field("filename", 'some_file.txt')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .then(res => {
        expect(res.body).toEqual({
          file_type: 'text/plain',
          fileUrl: expect.stringContaining('some_file.txt'),
        });
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });
  });
});

describe("File download", () => {
  beforeEach(() => {
    getObjectResponse = {
      Body: Buffer.from('some data'),
      ContentLength: '633',
      ContentDisposition: 'inline;filename="some_file.txt"',
      ContentEncoding: 'undefined',
      CacheControl: 'undefined',
      Expires: 'undefined',
      LastModified: 'Tue May 31 2022 12:21:37 GMT+0000 (Coordinated Universal Time)',
      ETag: 'a4c57ed39e8d869d636ccf5fc34a65a1',
    };
    jest.clearAllMocks()
  })

  it("file/public - should not download with incomplete path", async () => {
    await supertest(app)
      .get("/file/public/somekey")
      .expect(404)
  });

  it("file/public - should download", async () => {
    await supertest(app)
      .get("/file/public/somekey/file_name.txt")
      .expect(200)
      .then(_res => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
      })
  });

  it("file/public - should not download private files", async () => {
    const filePath = 'somekey/file_name.txt'
    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/public/${filePath}`)
      .expect(400)
      .then(res => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
        expect(res.body.error).toBe("bad request")
      });
  });

  it("file/private - should not download if file is private", async () => {
    const filePath = 'somekey/file_name.txt'
    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/public/${filePath}`)
      .expect(400)
      .then(res => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
        expect(res.body.error).toBe("bad request")
      });
  });

  it("file/private - should download file", async () => {
    const filePath = 'somekey/file_name.txt'

    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/private/${filePath}`)
      .set({ 'api-key': 'test' })
      .expect(200)
      .then(() => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
      });
  });
});
