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
  expiry_date: "1900-01-01T01:01:01.865452+00:00",
};

module.exports = { mockFlow, mockLowcalSession }