import { AdminPanelData } from "types";

export const mockTeams: AdminPanelData[] = [
  {
    id: "1",
    name: "Barking and Dagenham",
    slug: "barking",
    referenceCode: "BDD",
    liveFlows: [
      {
        name: "Find out if you need planning permission",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Apply for prior approval",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      { name: "Barking draft 2", firstOnlineAt: "2025-11-24T15:36:17Z" },
    ],
    planningDataEnabled: false,
    govpayEnabled: true,
    logo: undefined,
    favicon: undefined,
    primaryColour: "#000000",
    linkColour: "#000000",
    actionColour: "#000000",
    homepage: undefined,
    subdomain: undefined,
    article4sEnabled: true,
    govnotifyPersonalisation: {
      helpEmail: "example@council.co.uk",
      helpPhone: "(01234) 567890",
      emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
      helpOpeningHours: "Monday - Friday, 9am - 5pm",
    },
    powerAutomateEnabled: false,
    sendToEmailAddress: undefined,
    bopsSubmissionURL: undefined,
    isTrial: false,
  },
  {
    id: "2",
    name: "Doncaster",
    referenceCode: "DON",
    liveFlows: [
      {
        name: "Notify completion of planning application",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Find out if you need planning permission",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "apply for prior approval ",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Apply for service declarations",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      { name: "Article4", firstOnlineAt: "2025-11-24T15:36:17Z" },
    ],
    planningDataEnabled: true,
    govpayEnabled: true,
    logo: "https://path.to.logo.com/theopensystemslab/planx-team-logos/main/logo.svg",
    slug: "doncaster",
    article4sEnabled: false,
    powerAutomateEnabled: false,
    isTrial: true,
  },
  {
    id: "3",
    name: "Newcastle",
    referenceCode: "NCL",
    liveFlows: [
      { name: "Confirmation pages", firstOnlineAt: "2025-11-24T15:36:17Z" },
      {
        name: "Find out if you need planning permission",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Listed building pre application advice",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Apply for prior approval",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Apply for service declarations",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      { name: "Article4", firstOnlineAt: "2025-11-24T15:36:17Z" },
      {
        name: "Apply for a lawful development certificate",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
    ],
    planningDataEnabled: false,
    govpayEnabled: false,
    logo: "https://path.to.logo.com/theopensystemslab/planx-team-logos/main/logo.svg",
    slug: "newcastle",
    article4sEnabled: true,
    powerAutomateEnabled: true,
    isTrial: false,
  },
  {
    id: "4",
    name: "Tewkesbury",
    referenceCode: "TWK",
    liveFlows: [
      {
        name: "Listed building pre application advice",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      {
        name: "Apply for service declarations",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
      { name: "Article4", firstOnlineAt: "2025-11-24T15:36:17Z" },
      {
        name: "Apply for a lawful development certificate",
        firstOnlineAt: "2025-11-24T15:36:17Z",
      },
    ],
    planningDataEnabled: false,
    govpayEnabled: true,
    logo: "https://path.to.logo.com/theopensystemslab/planx-team-logos/main/logo.svg",
    slug: "tewkesbury",
    article4sEnabled: false,
    powerAutomateEnabled: false,
    isTrial: false,
  },
];
