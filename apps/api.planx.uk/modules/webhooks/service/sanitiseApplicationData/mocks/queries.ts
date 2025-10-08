export const mockIds = ["id1", "id2", "id3"];

export const mockSanitiseLowcalSessionsMutation = {
  name: "SanitiseLowcalSessions",
  matchOnVariables: false,
  data: {
    sessions: {
      returning: mockIds,
    },
  },
};

export const mockSanitiseUniformApplicationsMutation = {
  name: "SanitiseUniformApplications",
  matchOnVariables: false,
  data: {
    uniformApplications: {
      returning: mockIds,
    },
  },
};

export const mockSanitiseBOPSApplicationsMutation = {
  name: "SanitiseBOPSApplications",
  matchOnVariables: false,
  data: {
    bopsApplications: {
      returning: mockIds,
    },
  },
};

export const mockSanitiseEmailApplicationsMutation = {
  name: "SanitiseEmailApplications",
  matchOnVariables: false,
  data: {
    emailApplications: {
      returning: mockIds,
    },
  },
};

export const mockDeleteReconciliationRequestsMutation = {
  name: "DeleteReconciliationRequests",
  matchOnVariables: false,
  data: {
    reconciliationRequests: {
      returning: mockIds,
    },
  },
};

export const mockDeletePaymentRequests = {
  name: "DeletePaymentRequests",
  matchOnVariables: false,
  data: {
    paymentRequests: {
      returning: mockIds,
    },
  },
};

export const mockGetExpiredSessionIdsQuery = {
  name: "GetExpiredSessionIds",
  matchOnVariables: false,
  data: {
    lowcal_sessions: [{ id: "id1" }, { id: "id2" }, { id: "id3" }],
  },
};

export const mockDeleteFeedbackMutation = {
  name: "DeleteFeedback",
  matchOnVariables: false,
  data: {
    feedback: {
      returning: mockIds,
    },
  },
};
