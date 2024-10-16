import { Page } from "@playwright/test";

export const mockOSPlacesResponse = {
  header: {
    uri: "https://api.os.uk/search/places/v1/postcode?postcode=SW1%201AA&dataset=LPI&maxResults=100&output_srs=EPSG%3A4326&lr=EN&offset=0",
    query: "postcode=SW1 1AA",
    offset: 0,
    totalresults: 22,
    format: "JSON",
    dataset: "LPI",
    lr: "EN",
    maxresults: 100,
    epoch: "100",
    lastupdate: "2023-04-27",
    output_srs: "EPSG:4326",
  },
  results: [
    {
      LPI: {
        UPRN: "000080000000",
        ADDRESS: "123, Test Street, Testville, East Testshire",
        USRN: "00000000",
        LPI_KEY: "0000L000000000",
        PAO_START_NUMBER: "1",
        STREET_DESCRIPTION: "Test Street",
        TOWN_NAME: "Testville",
        ADMINISTRATIVE_AREA: "East Testshire",
        POSTCODE_LOCATOR: "SW1 1AA",
        RPC: "1",
        X_COORDINATE: 12345,
        Y_COORDINATE: 54321,
        LNG: -0.6336819,
        LAT: 51.6055791,
        STATUS: "APPROVED",
        LOGICAL_STATUS_CODE: "1",
        CLASSIFICATION_CODE: "RD03",
        CLASSIFICATION_CODE_DESCRIPTION: "Semi-Detached",
        LOCAL_CUSTODIAN_CODE: 440,
        LOCAL_CUSTODIAN_CODE_DESCRIPTION: "East Testshire",
        COUNTRY_CODE: "E",
        COUNTRY_CODE_DESCRIPTION: "This record is within England",
        POSTAL_ADDRESS_CODE: "D",
        POSTAL_ADDRESS_CODE_DESCRIPTION: "A record which is linked to PAF",
        BLPU_STATE_CODE: "2",
        BLPU_STATE_CODE_DESCRIPTION: "In use",
        TOPOGRAPHY_LAYER_TOID: "osgb0000000000000000",
        LAST_UPDATE_DATE: "22/06/2022",
        ENTRY_DATE: "02/10/2003",
        BLPU_STATE_DATE: "24/04/2001",
        STREET_STATE_CODE: "2",
        STREET_STATE_CODE_DESCRIPTION: "Open",
        STREET_CLASSIFICATION_CODE: "8",
        STREET_CLASSIFICATION_CODE_DESCRIPTION: "All vehicles",
        LPI_LOGICAL_STATUS_CODE: "1",
        LPI_LOGICAL_STATUS_CODE_DESCRIPTION: "APPROVED",
        LANGUAGE: "EN",
        MATCH: 1,
        MATCH_DESCRIPTION: "EXACT",
      },
    },
  ],
};
export async function setupOSMockResponse(page: Page) {
  const ordnanceSurveryPlacesEndpoint = new RegExp(
    /proxy\/ordnance-survey\/search\/places\/v1\/postcode\/*/,
  );
  await page.route(ordnanceSurveryPlacesEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockOSPlacesResponse),
    });
  });
}
