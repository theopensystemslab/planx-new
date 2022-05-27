const mockTeam = {
  slug: "test-team",
  name: "Test Team",
  notifyPersonalisation: {
    helpEmail: "example@council.gov.uk",
    helpPhone: "(01234) 567890",
    emailReplyToId: "testID",
    helpOpeningHours: "Monday - Friday, 9am - 5pm"
  }
};

const mockLowcalSession = {
  id: 123,
  data: {
    passport: {
      data: {
        _address: {
          single_line_address: "1 High Street"
        },
        "proposal.projectType": ["house"]
      }
    }
  },
  flow: {
    slug: "apply-for-a-lawful-development-certificate",
    team: mockTeam,
  },
  created_at: "2022-01-04T01:02:03.865452+00:00",
};

const mockFlow = {
  slug: "slug", 
  team: mockTeam,
};

module.exports = { mockFlow, mockLowcalSession, mockTeam }