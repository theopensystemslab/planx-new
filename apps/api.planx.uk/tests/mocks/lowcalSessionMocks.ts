export const MOCK_UUID = "12345678-abcd-0def-9876-abcdef123456";

export const mockSoftDeleteLowcalSession = {
  name: "SoftDeleteLowcalSession",
  data: {
    session: {
      id: MOCK_UUID,
    },
  },
  variables: {
    sessionId: MOCK_UUID,
  },
  matchOnVariables: true,
};
