/**
 * Body returned by the OS Data Hub Places API (via our `/proxy/ordnance-survey`
 * endpoint) when it responds with a 500. The `<address-autocomplete />` web
 * component surfaces `fault.faultstring` to the user, e.g. "Warning Datastore Error".
 */
const osDatastoreErrorMock = {
  fault: {
    faultstring: "Datastore Error",
    detail: {
      errorcode: "Internal Server Error",
    },
  },
};

export default osDatastoreErrorMock;
