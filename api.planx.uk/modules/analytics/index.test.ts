import supertest from "supertest";
import app from "../../server";
import { queryMock } from "../../tests/graphqlQueryMock";

describe("Logging analytics", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "SetAnalyticsEndedDate",
      matchOnVariables: false,
      data: {
        update_analytics_by_pk: {
          id: 12345,
        },
      },
    });
  });

  it("validates that analyticsLogId is present in the query", async () => {
    await supertest(app)
      .post("/analytics/log-user-exit")
      .query({})
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("logs a user exit", async () => {
    queryMock.mockQuery({
      name: "UpdateAnalyticsLogUserExit",
      variables: {
        id: 123,
        user_exit: true,
      },
      data: {
        update_analytics_logs_by_pk: {
          analytics_id: 12345,
        },
      },
    });

    await supertest(app)
      .post("/analytics/log-user-exit")
      .query({ analyticsLogId: "123" })
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });

  it("logs a user resume", async () => {
    queryMock.mockQuery({
      name: "UpdateAnalyticsLogUserExit",
      variables: {
        id: 456,
        user_exit: false,
      },
      data: {
        update_analytics_logs_by_pk: {
          analytics_id: 12345,
        },
      },
    });

    await supertest(app)
      .post("/analytics/log-user-resume")
      .query({ analyticsLogId: "456" })
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });

  it("handles errors whilst writing analytics records", async () => {
    queryMock.mockQuery({
      name: "UpdateAnalyticsLogUserExit",
      matchOnVariables: false,
      data: {
        update_analytics_logs_by_pk: {
          analytics_id: 12345,
        },
      },
      graphqlErrors: [
        {
          message: "Something went wrong",
        },
      ],
    });

    await supertest(app)
      .post("/analytics/log-user-resume")
      .query({ analyticsLogId: "456" })
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });
});
