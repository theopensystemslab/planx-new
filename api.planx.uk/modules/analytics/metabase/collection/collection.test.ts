import { $api } from "../../../../client/index.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";

describe("getTeamIdAndMetabaseId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successfully gets team and existing metabase id", async () => {
    vi.spyOn($api.client, "request").mockResolvedValue({
      teams: [
        {
          id: 26,
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
