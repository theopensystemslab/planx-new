const mockFlow = {
  slug: "slug", team: {
    slug: "teamName",
    notifyPersonalisation: {
      helpPhone: "test",
      helpEmail: "test",
      helpOpeningHours: "test",
    }
  },
};

const mockLowcalSession = {
  id: 123,
  data: {
    passport: {
      data: {
        _address: {
          single_line_address: "1 High Street"
        },
        "property.type": ["house"]
      }
    }
  },
  expiry_date: "2022-05-04T01:02:03.865452+00:00",
};

module.exports = { mockFlow, mockLowcalSession }