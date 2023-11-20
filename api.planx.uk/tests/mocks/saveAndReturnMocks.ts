import { v4 as uuidV4 } from "uuid";
import type { LowCalSession, Flow } from "../../types";

export const mockTeam = {
  id: 1,
  slug: "test-team",
  name: "Test Team",
  notifyPersonalisation: {
    helpEmail: "example@council.gov.uk",
    helpPhone: "(01234) 567890",
    helpOpeningHours: "Monday - Friday, 9am - 5pm",
    emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
  },
};

export const mockFlow: Flow = {
  id: "dcfd4f07-76da-4b67-9822-2aca92b27551",
  slug: "slug",
  team_id: mockTeam.id,
  data: {
    _root: {
      edges: ["one"],
    },
    one: {
      data: {},
    },
  },
};

export const mockLowcalSession: LowCalSession = {
  id: "123",
  email: "mock@email.com",
  has_user_saved: false,
  data: {
    passport: {
      data: {
        _address: {
          single_line_address: "1 High Street",
        },
        "proposal.projectType": ["new.office"],
        "property.boundary.site": {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.07626448954420499, 51.48571252157308],
                [-0.0762916416717913, 51.48561932090584],
                [-0.07614058275089933, 51.485617225458554],
                [-0.07611118911905082, 51.4857099488319],
                [-0.07626448954420499, 51.48571252157308],
              ],
            ],
          },
          properties: null,
        },
      },
    },
    breadcrumbs: {},
    id: "123",
  },
  flow: {
    slug: "apply-for-a-lawful-development-certificate",
    team: mockTeam,
  },
  flow_id: mockFlow.id,
  updated_at: "2022-01-04T01:02:03.865452+00:00",
  created_at: "2022-01-04T01:02:03.865452+00:00",
  submitted_at: null,
  deleted_at: null,
};

export const mockFindSession = (breadcrumbs = {}) => ({
  name: "FindSession",
  data: {
    sessions: [
      {
        ...mockLowcalSession,
        data: {
          ...mockLowcalSession.data,
          breadcrumbs,
        },
      },
    ],
  },
  variables: {
    sessionId: mockLowcalSession.id,
    email: mockLowcalSession.email,
  },
});

export const mockNotFoundSession = {
  name: "FindSession",
  data: {
    sessions: [],
  },
  variables: {
    sessionId: "not-found-id",
    email: mockLowcalSession.email,
  },
};

export const mockLockedSession = {
  name: "FindSession",
  data: {
    sessions: [
      {
        lockedAt: "2023-01-02-11.22.33.444444",
      },
    ],
  },
  variables: {
    sessionId: "locked-id",
    email: mockLowcalSession.email,
  },
};

export const mockErrorSession = {
  name: "FindSession",
  data: {},
  graphqlErrors: [
    {
      message: "Something went wrong",
    },
  ],
};

export const mockGetMostRecentPublishedFlow = (data: Flow["data"]) => ({
  name: "GetMostRecentPublishedFlow",
  data: {
    flow: {
      publishedFlows: [
        {
          data,
        },
      ],
    },
  },
  matchOnVariables: false,
});

export const stubInsertReconciliationRequests = {
  name: "InsertReconciliationRequests",
  data: {
    id: uuidV4(),
  },
  matchOnVariables: false,
};

export const stubUpdateLowcalSessionData = {
  name: "UpdateLowcalSessionData",
  data: {
    lowcal_sessions: [{ data: mockLowcalSession.data }],
  },
  matchOnVariables: false,
};

export const mockGetFlowDiff = (diff: Flow["data"] | null) => ({
  name: "GetFlowDiff",
  data: {
    diff_latest_published_flow: {
      data: diff,
    },
  },
  matchOnVariables: false,
});

export const mockValidateSingleSessionRequest = {
  name: "ValidateSingleSessionRequest",
  data: {
    flows_by_pk: mockFlow,
    lowcalSessions: [mockLowcalSession],
  },
  variables: {
    sessionId: mockLowcalSession.id,
  },
};

export const mockSoftDeleteLowcalSession = {
  name: "SoftDeleteLowcalSession",
  data: {
    session: {
      id: "123",
    },
  },
  variables: {
    sessionId: "123",
  },
};

export const mockSetupEmailNotifications = {
  name: "SetupEmailNotifications",
  data: {
    session: {
      id: "123",
      hasUserSaved: true,
    },
  },
  variables: {
    sessionId: "123",
  },
};
