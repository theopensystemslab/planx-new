import supertest from "supertest";
import app from "../../../server.js";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { $api } from "../../../client/index.js";
import { mockLowcalSession } from "../../../tests/mocks/saveAndReturnMocks.js";
import axios, { type AxiosRequestConfig } from "axios";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";

const sessionId = "3188f052-a032-4755-be63-72b0ba497eb6";
const mockPowerAutomateWebhookURL = "http://www.example.com";
const mockPowerAutomateAPIKey = "my-power-automate-api-key";

vi.mock("../../saveAndReturn/service/utils", () => ({
  markSessionAsSubmitted: vi.fn(),
}));

vi.mock("../../file/service/uploadFile.js", () => ({
  uploadPrivateFile: vi
    .fn()
    .mockResolvedValue({ fileUrl: "https://my-file-url.com" }),
}));

vi.mock("../../client/index.js");

vi.mock("axios", () => ({
  default: vi.fn(),
}));
const mockedAxios = vi.mocked(axios, true);

describe("uploading an application to S3", () => {
  beforeEach(() => {
    $api.team.getIntegrations = vi.fn().mockResolvedValue({
      powerAutomateWebhookURL: mockPowerAutomateWebhookURL,
      powerAutomateAPIKey: mockPowerAutomateAPIKey,
    });

    $api.session.find = vi.fn().mockResolvedValue(mockLowcalSession);

    $api.export.digitalPlanningDataPayload = vi
      .fn()
      .mockResolvedValue(expectedPlanningPermissionPayload);

    mockedAxios.mockResolvedValue({ data: { success: true }, status: 200 });

    queryMock.mockQuery({
      name: "CreateS3Application",
      matchOnVariables: false,
      data: {
        insertS3Application: { id: 1 },
      },
    });

    queryMock.mockQuery({
      name: "FindApplication",
      matchOnVariables: false,
      data: {
        s3Applications: [],
      },
      variables: {
        session_id: sessionId,
      },
    });
  });

  describe("request validation", () => {
    it("requires auth", async () => {
      await supertest(app)
        .post("/upload-submission/barnet")
        .send({ payload: { sessionId: "123" } })
        .expect(401);
    });

    it("throws an error if payload is missing", async () => {
      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({ payload: null })
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("throws an error if powerAutomateWebhookURL is not set", async () => {
      $api.team.getIntegrations = vi.fn().mockResolvedValueOnce({
        powerAutomateWebhookURL: null,
        powerAutomateAPIKey: "some-key",
      });

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(400)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Upload to S3 is not enabled for this local authority/,
          );
        });
    });

    it("throws an error if powerAutomateAPIKey is not set", async () => {
      $api.team.getIntegrations = vi.fn().mockResolvedValueOnce({
        powerAutomateWebhookURL: "https://www.example.com",
        powerAutomateAPIKey: null,
      });

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(400)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Upload to S3 is not enabled for this local authority/,
          );
        });
    });

    it("does not an throw error if Power Automate details are missing but ?notify=false", async () => {
      $api.team.getIntegrations = vi.fn().mockResolvedValueOnce({
        powerAutomateWebhookURL: null,
        powerAutomateAPIKey: null,
      });

      await supertest(app)
        .post("/upload-submission/barnet?notify=false")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(200);
    });

    it("throws an error if this session was already submitted", async () => {
      $api.team.getIntegrations = vi.fn().mockResolvedValueOnce({
        powerAutomateWebhookURL: mockPowerAutomateWebhookURL,
        powerAutomateAPIKey: mockPowerAutomateAPIKey,
      });

      queryMock.mockQuery({
        name: "FindApplication",
        matchOnVariables: false,
        data: {
          s3Applications: [
            {
              status: 202,
            },
          ],
        },
        variables: {
          session_id: sessionId,
        },
      });

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(200)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Skipping send, already successfully submitted/,
          );
        });
    });
  });

  describe("payload validation", () => {
    it("validates statutory payloads", async () => {
      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        });

      // Verify mock session is a statutory application
      expect(
        mockLowcalSession.data.passport.data?.["application.type"]?.[0],
      ).toBe("ldc.proposed");

      expect($api.export.digitalPlanningDataPayload).toHaveBeenCalledTimes(1);
      expect($api.export.digitalPlanningDataPayload).toHaveBeenCalledWith(
        sessionId,
        false, // Validation not skipped
      );

      // Validation status passed to webhook
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            payload: "Validated ODP Schema",
          }),
        }),
      );
    });

    it("does not validate discretionary payloads", async () => {
      // Set up mock discretionary payload
      const mockDiscretionarySession = structuredClone(mockLowcalSession);
      mockDiscretionarySession.data.passport.data["application.type"][0] =
        "reportAPlanningBreach";
      $api.session.find = vi
        .fn()
        .mockResolvedValueOnce(mockDiscretionarySession);

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        });

      expect($api.export.digitalPlanningDataPayload).toHaveBeenCalledTimes(1);
      expect($api.export.digitalPlanningDataPayload).toHaveBeenCalledWith(
        sessionId,
        true, // Validation skipped
      );

      // Validation status passed to webhook
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            payload: "Discretionary",
          }),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("throws an error if the webhook request fails", async () => {
      mockedAxios.mockRejectedValueOnce(
        new Error(
          "Something went wrong with the webhook request to Power Automate",
        ),
      );

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Failed to send submission notification/,
          );
        });
    });

    it("throws an error if an internal process fails", async () => {
      $api.session.find = vi
        .fn()
        .mockRejectedValueOnce(new Error("Something went wrong!"));

      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to upload submission to S3/);
        });
    });
  });

  describe("success", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const callAPI = async () =>
      await supertest(app)
        .post("/upload-submission/barnet")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        });

    const callAPIWithoutNotification = async () =>
      await supertest(app)
        .post("/upload-submission/barnet?notify=false")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: { sessionId },
        });

    it("makes a request to the configured Power Automate webhook", async () => {
      await callAPI();

      expect(mockedAxios).toHaveBeenCalledOnce();
      const request = mockedAxios.mock.calls[0][0] as AxiosRequestConfig;
      expect(request.url).toEqual(mockPowerAutomateWebhookURL);
    });

    it("sets Power Automate API key in request header", async () => {
      await callAPI();

      expect(mockedAxios).toHaveBeenCalledOnce();
      const request = mockedAxios.mock.calls[0][0] as AxiosRequestConfig;
      expect(request.headers).toHaveProperty("apiKey", mockPowerAutomateAPIKey);
    });

    it("uploads to S3 but skips Power Automate notification when ?notify=false", async () => {
      await callAPIWithoutNotification();

      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it("generates the expected body for the Power Automate webhook", async () => {
      await callAPI();

      expect(mockedAxios).toHaveBeenCalledOnce();
      const request = mockedAxios.mock.calls[0][0] as AxiosRequestConfig;
      expect(request.data).toEqual({
        message: "New submission from PlanX",
        environment: "staging",
        file: "https://my-file-url.com",
        payload: "Validated ODP Schema",
        service: "Apply for a Lawful Development Certificate",
      });
    });

    it("passes along the correct application environment details", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");

      await callAPI();

      expect(mockedAxios).toHaveBeenCalledOnce();
      const request = mockedAxios.mock.calls[0][0] as AxiosRequestConfig;
      expect(request.data.environment).toEqual("production");
    });

    it("marks a session as submitted", async () => {
      await callAPI();

      expect(markSessionAsSubmitted).toHaveBeenCalledExactlyOnceWith(sessionId);
    });

    it("marks a session as submitted when ?notify=false", async () => {
      await callAPIWithoutNotification();

      expect(markSessionAsSubmitted).toHaveBeenCalledExactlyOnceWith(sessionId);
    });

    it("writes an audit record to the s3_applications table", async () => {
      await callAPI();

      const graphQLCalls = queryMock.getCalls();

      expect(graphQLCalls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "CreateS3Application",
          }),
        ]),
      );
    });

    it("writes an audit record to the s3_applications table when ?notify=false", async () => {
      await callAPIWithoutNotification();

      const graphQLCalls = queryMock.getCalls();

      expect(graphQLCalls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "CreateS3Application",
          }),
        ]),
      );
    });

    it("returns a success message upon completion", async () => {
      const res = await callAPI();

      expect($api.export.digitalPlanningDataPayload).toHaveBeenCalledWith(
        sessionId,
        false,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message:
          "Successfully uploaded submission to S3: https://my-file-url.com",
        payload: "Validated ODP Schema",
        webhookResponse: 200,
        auditEntryId: 1,
      });
    });
  });
});
