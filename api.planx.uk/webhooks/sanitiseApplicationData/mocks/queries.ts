export const mockIds = [
  "id1", "id2", "id3"
];

export const mockSanitiseLowcalSessionsMutation = {
  name: "SanitiseLowcalSessions",
  matchOnVariables: false,
  data: {
    update_lowcal_sessions: {
      returning: mockIds,
    }
  },
};

export const mockSanitiseSessionBackupsMutation = {
  name: "SanitiseSessionBackups",
  matchOnVariables: false,
  data: {
    update_session_backups: {
      returning: mockIds,
    }
  },
};

export const mockSanitiseUniformApplicationsMutation = {
  name: "SanitiseUniformApplications",
  matchOnVariables: false,
  data: {
    update_uniform_applications: {
      returning: mockIds,
    }
  },
};

export const mockSanitiseBOPSApplicationsMutation = {
  name: "SanitiseBOPSApplications",
  matchOnVariables: false,
  data: {
    update_bops_applications: {
      returning: mockIds,
    }
  },
};

export const mockSanitiseReconciliationRequestsMutation = {
  name: "SanitiseReconciliationRequests",
  matchOnVariables: false,
  data: {
    update_reconciliation_requests: {
      returning: mockIds,
    }
  },
};