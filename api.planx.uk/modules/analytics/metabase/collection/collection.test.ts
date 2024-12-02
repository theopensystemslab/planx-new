import { newCollection, getCollection } from "./service.js";
import nock from "nock";
import { MetabaseError } from "../shared/client.js";

describe("newCollection", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  test("returns a collection ID if collection exists", async () => {
    // Mock collection check endpoint
    nock(process.env.METABASE_URL_EXT!)
      .get("/api/collection/")
      .reply(200, [
        { id: 20, name: "Barnet" },
        { id: 21, name: "Another collection" },
      ]);

    const collection = await newCollection({
      name: "Barnet",
    });
    console.log("HERE IS THE COLLECTION: ", collection);
    expect(collection).toBe(20);
  });

  test("successfully places new collection in parent", async () => {
    const testName = "Example council";

    // Mock collection check endpoint
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    // Mock collection creation endpoint
    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        name: testName,
        parent_id: 100,
      })
      .reply(200, {
        id: 123,
        name: testName,
        parent_id: 100,
      });

    // Mock GET request for verifying the new collection
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/123").reply(200, {
      id: 123,
      name: testName,
      parent_id: 100,
    });

    const collectionId = await newCollection({
      name: testName,
      parentId: 100,
    });

    // Check the ID is returned correctly
    expect(collectionId).toBe(123);

    // Verify the collection details using the service function
    const collection = await getCollection(collectionId);
    expect(collection.parent_id).toBe(100);
  });

  test("returns collection correctly no matter collection name case", async () => {
    // Mock collection check endpoint
    nock(process.env.METABASE_URL_EXT!)
      .get("/api/collection/")
      .reply(200, [
        { id: 20, name: "Barnet" },
        { id: 21, name: "Another collection" },
      ]);

    const collection = await newCollection({
      name: "BARNET",
    });
    expect(collection).toBe(20);
  });

  test("successfully creates a new collection and returns its ID", async () => {
    const testName = "Example council";

    // Mock collection check endpoint
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    // Mock collection creation endpoint
    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        name: testName,
      })
      .reply(200, {
        id: 123,
        name: testName,
      });

    const collection = await newCollection({
      name: testName,
    });

    expect(collection).toBe(123);
  });

  test("throws error if network failure", async () => {
    nock(process.env.METABASE_URL_EXT!)
      .get("/api/collection/")
      .replyWithError("Network error occurred");

    await expect(
      newCollection({
        name: "Test Collection",
      }),
    ).rejects.toThrow("Network error occurred");
  });

  test("throws error if API error", async () => {
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(400, {
      message: "Bad request",
    });

    await expect(
      newCollection({
        name: "Test Collection",
      }),
    ).rejects.toThrow(MetabaseError);
  });

  test("correctly transforms request to snake case", async () => {
    const testData = {
      name: "Test Collection",
      parentId: 123, // This should become parent_id
    };

    // Mock the check for existing collections
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    // Create a variable to store the request body
    let capturedBody: any;

    // Mock and verify the POST request, capturing the body
    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", (body) => {
        capturedBody = body;
        return true; // Return true to indicate the request matches
      })
      .reply(200, { id: 456 });

    await newCollection(testData);

    // Verify the transformation
    expect(capturedBody).toHaveProperty("parent_id", 123);
    expect(capturedBody).not.toHaveProperty("parentId");
  });
});

describe("edge cases", () => {
  test("handles missing name", async () => {
    await expect(
      newCollection({
        name: "",
      }),
    ).rejects.toThrow();
  });

  test("handles names with special characters", async () => {
    const specialName = "@#$%^&*";

    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        name: specialName,
      })
      .reply(200, {
        id: 789,
        name: specialName,
      });

    const collection = await newCollection({
      name: specialName,
    });
    expect(collection).toBe(789);
  });

  test("handles very long names", async () => {
    const longName = "A".repeat(101);

    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        name: longName,
      })
      .reply(400, {
        message: "Name too long",
      });

    await expect(
      newCollection({
        name: longName,
      }),
    ).rejects.toThrow();
  });
});
