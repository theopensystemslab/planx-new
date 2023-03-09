import { v4 as uuidV4 } from "uuid";

export const mockTeam = {
  slug: "test-team",
  name: "Test Team",
  notifyPersonalisation: {
    helpEmail: "example@council.gov.uk",
    helpPhone: "(01234) 567890",
    helpOpeningHours: "Monday - Friday, 9am - 5pm",
    emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
  },
};

export const mockLowcalSession = {
  id: 123,
  email: "mock@email.com",
  has_user_saved: false,
  data: {
    passport: {
      data: {
        _address: {
          single_line_address: "1 High Street",
        },
        "proposal.projectType": ["new.office"],
      },
    },
    breadcrumbs: {},
  },
  flow: {
    slug: "apply-for-a-lawful-development-certificate",
    team: mockTeam,
  },
  updated_at: "2022-01-04T01:02:03.865452+00:00",
  created_at: "2022-01-04T01:02:03.865452+00:00",
};

export const mockFlow = {
  id: "dcfd4f07-76da-4b67-9822-2aca92b27551",
  slug: "slug",
  team: mockTeam,
};

export const mockFindSession = {
  name: "FindSession",
  data: {
    lowcal_sessions: [mockLowcalSession],
  },
  variables: {
    sessionId: mockLowcalSession.id,
  },
};

export const mockNotFoundSession = {
  name: "FindSession",
  data: {
    lowcal_sessions: [],
  },
  variables: {
    sessionId: "not-found-id",
  },
};

export const mockGetMostRecentPublishedFlow = (data) => ({
  name: "GetMostRecentPublishedFlow",
  data: {
    flows_by_pk: {
      published_flows: [
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

export const mockGetPublishedFlowByDate = (data) => ({
  name: "GetPublishedFlowByDate",
  data: {
    flows_by_pk: {
      published_flows: [
        {
          data,
        },
      ],
    },
  },
  matchOnVariables: false,
});

export const mockGetHumanReadableProjectType = {
  name: "GetHumanReadableProjectType",
  data: {
    project_types: [{ description: "New office premises" }],
  },
  variables: {
    rawList: ["new.office"],
  },
};

export const mockValidateSingleSessionRequest = {
  name: "ValidateSingleSessionRequest",
  data: {
    flows_by_pk: mockFlow,
    lowcal_sessions: [mockLowcalSession],
  },
};

export const mockSoftDeleteLowcalSession = {
  name: "SoftDeleteLowcalSession",
  data: {
    update_lowcal_sessions_by_pk: {
      id: 123,
    },
  },
  variables: {
    sessionId: 123,
  },
};

export const mockSetupEmailNotifications = {
  name: "SetupEmailNotifications",
  data: {
    update_lowcal_sessions_by_pk: {
      id: 123,
      has_user_saved: true,
    },
  },
  variables: {
    sessionId: 123,
  },
};
