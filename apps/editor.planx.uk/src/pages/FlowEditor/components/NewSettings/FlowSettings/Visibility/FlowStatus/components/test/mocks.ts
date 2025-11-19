import { GET_FLOW_STATUS } from "../../queries";

export const offlinePublished = [
  {
    request: {
      query: GET_FLOW_STATUS,
      variables: {
        flowId: "abc123",
      },
    },
    result: {
      data: {
        flow: {
          id: "abc123",
          status: "offline",
          hasPrivacyPage: true,
          team: {
            settings: {
              isTrial: false,
              __typename: "team_settings"
            },
            __typename: "teams"
          },
          templatedFrom: null,
          publishedFlows: [
            {
              id: 4,
              __typename: "published_flows"
            }
          ],
          __typename: "flows"
        }
      }
    }
  },
];

export const onlineUnpublished = [
  {
    request: {
      query: GET_FLOW_STATUS,
      variables: {
        flowId: "abc123",
      },
    },
    result: {
      data: {
        flow: {
          id: "abc123",
          status: "online",
          hasPrivacyPage: true,
          team: {
            settings: {
              isTrial: false,
              __typename: "team_settings"
            },
            __typename: "teams"
          },
          templatedFrom: null,
          publishedFlows: [],
          __typename: "flows"
        }
      }
    }
  },
];

export const offlineUnpublished = [
  {
    request: {
      query: GET_FLOW_STATUS,
      variables: {
        flowId: "abc123",
      },
    },
    result: {
      data: {
        flow: {
          id: "abc123",
          status: "offline",
          hasPrivacyPage: true,
          team: {
            settings: {
              isTrial: false,
              __typename: "team_settings"
            },
            __typename: "teams"
          },
          templatedFrom: null,
          publishedFlows: [],
          __typename: "flows"
        }
      }
    }
  },
];

export const onlinePublished = [
  {
    request: {
      query: GET_FLOW_STATUS,
      variables: {
        flowId: "abc123",
      },
    },
    result: {
      data: {
        flow: {
          id: "abc123",
          status: "online",
          hasPrivacyPage: true,
          team: {
            settings: {
              isTrial: false,
              __typename: "team_settings"
            },
            __typename: "teams"
          },
          templatedFrom: null,
          publishedFlows: [
            {
              id: 4,
              __typename: "published_flows"
            }
          ],
          __typename: "flows"
        }
      }
    }
  },
];