import { createTeamCollection } from "./service.js";
import { getCollection } from "./getCollection.js";
import nock from "nock";
import { MetabaseError } from "../shared/client.js";
import { $api } from "../../../../client/index.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

describe("createTeamCollection", () => {
  beforeEach(() => {
    nock.cleanAll();
    vi.resetAllMocks();
  });

  test("creates new collection when metabase ID doesn't exist", async () => {
    // Mock getTeamIdAndMetabaseId response with null metabase_id
    vi.spyOn($api.client, "request").mockResolvedValueOnce({
      teams: [
        {
          id: 26,
          slug: "barnet",
          metabase_id: null,
        },
      ],
    });

    // Mock Metabase API calls
    const metabaseMock = nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        name: "Barnet",
      })
      .reply(200, {
        id: 123,
        name: "Barnet",
      });

    const collectionId = await createCollection({
      name: "Barnet",
    });

    expect(collectionId).toBe(123);
    expect(metabaseMock.isDone()).toBe(true);
  });

  test("successfully places new collection in parent", async () => {
    // Mock updateMetabaseId response
    vi.spyOn($api.client, "request").mockResolvedValueOnce({
      update_teams: {
        returning: [
          {
            id: 26,
            name: "Barnet",
            slug: "barnet",
            metabase_id: 123,
          },
        ],
      },
    });

    const testName = "Example Council";
    const metabaseMock = nock(process.env.METABASE_URL_EXT!);

    // Mock collection creation endpoint
    metabaseMock
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
    metabaseMock.get("/api/collection/123").reply(200, {
      id: 123,
      name: testName,
      parentId: 100,
    });

    const collectionId = await createCollection({
      name: testName,
      parentId: 100,
    });
    console.log({collectionId})

    // Check the ID is returned correctly
    expect(collectionId).toBe(123);

    // Verify the collection details using the service function
    const collection = await getCollection(collectionId);
    console.log({collection})
    expect(collection.parentId).toBe(100);
    expect(metabaseMock.isDone()).toBe(true);
  });

  test("returns collection correctly no matter collection slug case", async () => {
    vi.spyOn($api.client, "request").mockResolvedValueOnce({
      teams: [
        {
          id: 26,
          name: "Barnet",
          slug: "barnet",
          metabaseId: 20,
        },
      ],
    });

    const collection = await getTeamIdAndMetabaseId("BARNET");
    expect(collection.metabaseId).toBe(20);
  });

  test("throws error if network failure", async () => {
    nock(process.env.METABASE_URL_EXT!)
      .get("/api/collection/")
      .replyWithError("Network error occurred");

    await expect(
      createCollection({
        name: "Test Collection",
      }),
    ).rejects.toThrow("Network error occurred");
  });

  test("throws error if API error", async () => {
    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(400, {
      message: "Bad request",
    });

    await expect(
      createCollection({
        name: "Test Collection",
      }),
    ).rejects.toThrow(MetabaseError);
  });
});

describe("getTeamIdAndMetabaseId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successfully gets team and existing metabase id", async () => {
    vi.spyOn($api.client, "request").mockResolvedValue({
      teams: [
        {
          id: 26,
          name: "Barnet",
          slug: "barnet",
          metabaseId: 20,
        },
      ],
    });

    const teamAndMetabaseId = await getTeamIdAndMetabaseId("barnet");

    expect(teamAndMetabaseId.id).toEqual(26);
    expect(teamAndMetabaseId.metabaseId).toEqual(20);
  });

  test("handles team with null metabase id", async () => {
    vi.spyOn($api.client, "request").mockResolvedValue({
      teams: [
        {
          id: 26,
          slug: "barnet",
          metabaseId: null,
        },
      ],
    });

    const teamAndMetabaseId = await getTeamIdAndMetabaseId("Barnet");

    expect(teamAndMetabaseId.id).toEqual(26);
    expect(teamAndMetabaseId.metabaseId).toBeNull();
  });
});

describe("updateMetabaseId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successfully updates metabase ID", async () => {
    // Mock the GraphQL request
    vi.spyOn($api.client, "request").mockResolvedValue({
      update_teams: {
        returning: [
          {
            id: 1,
            slug: "testteam",
            metabase_id: 123,
          },
        ],
      },
    });

    const result = await updateMetabaseId(1, 123);

    expect(result).toEqual({
      update_teams: {
        returning: [
          {
            id: 1,
            slug: "testteam",
            metabase_id: 123,
          },
        ],
      },
    });

    expect($api.client.request).toHaveBeenCalledWith(expect.any(String), {
      id: 1,
      metabaseId: 123,
    });
  });

  test("handles GraphQL error", async () => {
    // Mock a failed GraphQL request
    vi.spyOn($api.client, "request").mockRejectedValue(
      new Error("GraphQL error"),
    );

    await expect(updateMetabaseId(1, 123)).rejects.toThrow("GraphQL error");
  });
});

describe("edge cases", () => {
  beforeEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test("handles missing slug", async () => {
    vi.spyOn($api.client, "request").mockRejectedValue(new Error("Invalid slug"));
    await expect(
      createTeamCollection({
        slug: "",
      }),
    ).rejects.toThrow();
  });

  test("handles name with special characters", async () => {
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

    const collection = await createCollection({
      name: specialName,
    });
    expect(collection).toBe(789);
  });

  test("handles very long slugs", async () => {
    const longSlug = "A".repeat(101);

    nock(process.env.METABASE_URL_EXT!).get("/api/collection/").reply(200, []);

    nock(process.env.METABASE_URL_EXT!)
      .post("/api/collection/", {
        slug: longSlug,
      })
      .reply(400, {
        message: "Slug too long",
      });
      vi.spyOn($api.client, "request").mockRejectedValue(new Error("Slug too long"));
    await expect(
      createTeamCollection({
        slug: longSlug,
      }),
    ).rejects.toThrow();
  });
});
