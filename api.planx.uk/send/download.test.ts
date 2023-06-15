import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import * as helpers from "./helpers";

const mockGenerateCSVData = jest.fn().mockResolvedValue([
  {
    question: "Is this a test?",
    responses: [{ value: "Yes" }],
    metadata: {},
  },
]);

jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      getFiles: jest.fn().mockImplementation(() => []),
    })),
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      getDocumentTemplateNamesForSession: jest.fn(),
      generateCSVData: () => mockGenerateCSVData(),
    })),
  };
});

describe(`downloading application data received by email`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [{ sendToEmail: "planners@southwark.gov.uk" }],
      },
      variables: { slug: "southwark" },
    });

    queryMock.mockQuery({
      name: "GetSessionData",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: { data: { passport: { test: "dummy data" } } },
      },
      variables: { id: "123" },
    });
  });

  it("errors if required query params are missing", async () => {
    await supertest(app)
      .get("/download-application-files/123?email=planning_office@test.com")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing values required to access application files",
        });
      });
  });

  it("errors if email query param does not match the stored database value for this team", async () => {
    await supertest(app)
      .get(
        "/download-application-files/123?email=wrong@southwark.gov.uk&localAuthority=southwark"
      )
      .expect(403)
      .then((res) => {
        expect(res.body).toEqual({
          error:
            "Provided email address is not enabled to access application files",
        });
      });
  });

  it("calls addTemplateFilesToZip()", async () => {
    const spy = jest.spyOn(helpers, "addTemplateFilesToZip");

    await supertest(app)
      .get(
        "/download-application-files/123?email=planners@southwark.gov.uk&localAuthority=southwark"
      )
      .expect(200)
      .then(() => {
        expect(spy).toHaveBeenCalled();
      });
  });
});
