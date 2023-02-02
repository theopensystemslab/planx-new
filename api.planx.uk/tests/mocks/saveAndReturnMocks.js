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
  },
  flow: {
    slug: "apply-for-a-lawful-development-certificate",
    team: mockTeam,
  },
  created_at: "2022-01-04T01:02:03.865452+00:00",
};

export const mockFlow = {
  slug: "slug",
  team: mockTeam,
};

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
    update_lowcal_sessions_by_pk: { id: 123 },
  },
  variables: {
    sessionId: 123,
  },
};

export const mockSetupEmailNotifications = {
  name: "SetupEmailNotifications",
  data: {
    update_lowcal_sessions_by_pk: { id: 123, has_user_saved: true },
  },
  variables: {
    sessionId: 123,
  },
};
