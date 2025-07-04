import type { LowCalSession } from "../../../types.js";
import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import {
  mockLowcalSession,
  mockTeam,
} from "../../../tests/mocks/saveAndReturnMocks.js";
import { buildContentFromSessions } from "./resumeApplication.js";
import type { PartialDeep } from "type-fest";
import type { Team } from "@opensystemslab/planx-core/types";
import { NOTIFY_TEST_EMAIL } from "../../../lib/notify/utils.js";

const ENDPOINT = "/resume-application";

describe("buildContentFromSessions function", () => {
  it("should return correctly formatted content for a single session", async () => {
    const sessions: PartialDeep<LowCalSession>[] = [
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "1 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "123",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
    ];

    const result = `Service: Apply for a Lawful Development Certificate
      Address: 1 High Street
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=123`;
    expect(
      await buildContentFromSessions(
        sessions as LowCalSession[],
        { slug: "team" } as Team,
      ),
    ).toEqual(result);
  });

  it("should return correctly formatted content for multiple session", async () => {
    const sessions: PartialDeep<LowCalSession>[] = [
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "1 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "123",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "2 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "456",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "3 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "789",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
    ];
    const result = `Service: Apply for a Lawful Development Certificate
      Address: 1 High Street
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=123\n\nService: Apply for a Lawful Development Certificate
      Address: 2 High Street
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=456\n\nService: Apply for a Lawful Development Certificate
      Address: 3 High Street
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=789`;
    expect(
      await buildContentFromSessions(
        sessions as LowCalSession[],
        { slug: "team" } as Team,
      ),
    ).toEqual(result);
  });

  it("should filter out expired sessions", async () => {
    const sessions: PartialDeep<LowCalSession>[] = [
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "1 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "123",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "2 High Street",
              },
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "456",
        created_at: "2022-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
    ];
    const result = `Service: Apply for a Lawful Development Certificate
      Address: 1 High Street
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=123`;
    expect(
      await buildContentFromSessions(
        sessions as LowCalSession[],
        { slug: "team" } as Team,
      ),
    ).toEqual(result);
  });

  it("should handle an empty address field", async () => {
    const sessions: PartialDeep<LowCalSession>[] = [
      {
        data: {
          passport: {
            // Missing address
            data: {
              "proposal.projectType": ["new.office"],
            },
          },
        },
        id: "123",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
    ];

    const result = `Service: Apply for a Lawful Development Certificate
      Address: Address not submitted
      Project type: New offices
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=123`;
    expect(
      await buildContentFromSessions(
        sessions as LowCalSession[],
        { slug: "team" } as Team,
      ),
    ).toEqual(result);
  });

  it("should handle an empty project type field", async () => {
    const sessions: PartialDeep<LowCalSession>[] = [
      {
        data: {
          passport: {
            data: {
              _address: {
                single_line_address: "1 High Street",
              },
            },
          },
        },
        id: "123",
        created_at: "2026-05-01T01:02:03.865452+00:00",
        flow: {
          slug: "apply-for-a-lawful-development-certificate",
          name: "Apply for a Lawful Development Certificate",
        },
      },
    ];

    const result = `Service: Apply for a Lawful Development Certificate
      Address: 1 High Street
      Project type: Project type not submitted
      Expiry Date: 29 May 2026
      Link: https://www.example.com/team/apply-for-a-lawful-development-certificate/published?sessionId=123`;
    expect(
      await buildContentFromSessions(
        sessions as LowCalSession[],
        { slug: "team" } as Team,
      ),
    ).toEqual(result);
  });
});

describe("Resume Application endpoint", () => {
  it("throws an error for if required data is missing", async () => {
    const missingEmail = { payload: { teamSlug: "test" } };
    const missingTeamSlug = { payload: { email: "test" } };

    for (const invalidBody of [missingEmail, missingTeamSlug]) {
      await supertest(app)
        .post(ENDPOINT)
        .send(invalidBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    }
  });

  it("throws an error if a teamSlug is invalid", async () => {
    const body = {
      payload: { teamSlug: "not-a-team", email: NOTIFY_TEST_EMAIL },
    };

    queryMock.mockQuery({
      name: "ValidateRequest",
      data: { teams: null, lowcalSessions: null },
      variables: body.payload,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body).toHaveProperty(
          "error",
          'Failed to send "Resume" email. Unable to validate request',
        );
      });
  });

  it("sends a Notify email on successful resume", async () => {
    const body = {
      payload: { teamSlug: "test-team", email: NOTIFY_TEST_EMAIL },
    };

    queryMock.mockQuery({
      name: "ValidateRequest",
      data: {
        lowcalSessions: [mockLowcalSession],
        teams: [mockTeam],
      },
      variables: body.payload,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("message", "Success");
      });
  });

  it("give a successful response even if there is not a matching session", async () => {
    const body = {
      payload: { teamSlug: "test-team", email: NOTIFY_TEST_EMAIL },
    };

    queryMock.mockQuery({
      name: "ValidateRequest",
      data: { teams: [mockTeam], lowcalSessions: [] },
      variables: body.payload,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("message", "Success");
      });
  });
});
