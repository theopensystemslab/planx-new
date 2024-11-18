import supertest from "supertest";
import express from "express";
import { metabaseClient } from "../shared/client.js";
import { checkCollections, newCollection } from "./service.js";
import {
  checkCollectionsController,
  newCollectionController,
} from "./controller.js";
import { validate } from "../../../../shared/middleware/validate.js";
import { newCollectionSchema } from "./types.js";

// Mock metabaseClient & error
vi.mock("../shared/client", () => ({
  MetabaseError: class MetabaseError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public response?: unknown,
    ) {
      super(message);
      this.name = "MetabaseError";
    }
  },
  metabaseClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Metabase collection module", () => {
  const app = express();
  app.use(express.json());

  // Set up test routes
  app.get("/collections/check", checkCollectionsController);
  app.post(
    "/collections/new",
    validate(newCollectionSchema),
    newCollectionController,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Services", () => {
    describe("checkCollections", () => {
      it("should return collection ID when collection exists", async () => {
        const mockCollections = [
          { id: 1, name: "Test Council" },
          { id: 2, name: "Another Council" },
        ];

        vi.mocked(metabaseClient.get).mockResolvedValueOnce({
          data: mockCollections,
        });

        const result = await checkCollections("test council");
        expect(result).toBe(1);
      });

      it("should return false when collection doesn't exist", async () => {
        vi.mocked(metabaseClient.get).mockResolvedValueOnce({
          data: [],
        });

        const result = await checkCollections("nonexistent");
        expect(result).toBe(false);
      });

      it("should handle API errors", async () => {
        vi.mocked(metabaseClient.get).mockRejectedValueOnce(
          new Error("API Error"),
        );

        await expect(checkCollections("test")).rejects.toThrow("API Error");
      });
    });

    describe("newCollection", () => {
      const mockCollection = {
        name: "Test Collection",
        description: "Test Description",
        parent_id: 1,
      };

      it("should create a new collection successfully", async () => {
        vi.mocked(metabaseClient.post).mockResolvedValueOnce({
          data: { id: 1, name: mockCollection.name },
        });

        const result = await newCollection(mockCollection);
        expect(result).toBe(1);
      });

      it("should handle API errors", async () => {
        vi.mocked(metabaseClient.post).mockRejectedValueOnce(
          new Error("Creation failed"),
        );

        await expect(newCollection(mockCollection)).rejects.toThrow(
          "Creation failed",
        );
      });
    });
  });

  describe("Controllers", () => {
    describe("GET /collections/check", () => {
      it("should return 400 if name parameter is missing", async () => {
        const response = await supertest(app).get("/collections/check");
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Name parameter is required");
      });

      it("should return 200 and collection ID if found", async () => {
        vi.mocked(metabaseClient.get).mockResolvedValueOnce({
          data: [{ id: 1, name: "Test Council" }],
        });

        const response = await supertest(app)
          .get("/collections/check")
          .query({ name: "test council" });

        expect(response.status).toBe(200);
        expect(response.body).toBe(1);
      });

      it("should handle server errors", async () => {
        vi.mocked(metabaseClient.get).mockRejectedValueOnce(
          new Error("Server error"),
        );

        const response = await supertest(app)
          .get("/collections/check")
          .query({ name: "test" });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to fetch collections");
      });
    });

    describe("POST /collections/new", () => {
      const validRequest = {
        name: "Test Collection",
        description: "Test Description",
        parentId: 1,
      };

      it("should create a new collection with valid data", async () => {
        vi.mocked(metabaseClient.post).mockResolvedValueOnce({
          data: { id: 1, name: validRequest.name },
        });

        const response = await supertest(app)
          .post("/collections/new")
          .send(validRequest);

        expect(response.status).toBe(201);
        expect(response.body.data).toBeDefined();
      });

      it("should handle validation errors", async () => {
        const response = await supertest(app).post("/collections/new").send({});

        expect(response.status).toBe(400);
      });

      it("should handle service errors", async () => {
        vi.mocked(metabaseClient.post).mockRejectedValueOnce(
          new Error("Service error"),
        );

        const response = await supertest(app)
          .post("/collections/new")
          .send(validRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Service error");
      });
    });
  });
});
