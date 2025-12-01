import type { GetFlowStatus } from "../../types";

export const offlinePublished: GetFlowStatus = {
  flow: {
    id: "abc123",
    status: "offline",
    hasPrivacyPage: true,
    team: {
      settings: {
        isTrial: false,
      },
    },
    templatedFrom: null,
    publishedFlows: [
      {
        id: "4",
      },
    ],
    firstOnlineAt: null,
  },
};

export const onlineUnpublished: GetFlowStatus = {
  flow: {
    id: "abc123",
    status: "online",
    hasPrivacyPage: true,
    team: {
      settings: {
        isTrial: false,
      },
    },
    templatedFrom: null,
    publishedFlows: [],
    firstOnlineAt: null,
  },
};

export const offlineUnpublished: GetFlowStatus = {
  flow: {
    id: "abc123",
    status: "offline",
    hasPrivacyPage: true,
    team: {
      settings: {
        isTrial: false,
      },
    },
    templatedFrom: null,
    publishedFlows: [],
    firstOnlineAt: null,
  },
};

export const onlinePublished: GetFlowStatus = {
  flow: {
    id: "abc123",
    status: "online",
    hasPrivacyPage: true,
    team: {
      settings: {
        isTrial: false,
      },
    },
    templatedFrom: null,
    publishedFlows: [
      {
        id: "4",
      },
    ],
    firstOnlineAt: null,
  },
};
