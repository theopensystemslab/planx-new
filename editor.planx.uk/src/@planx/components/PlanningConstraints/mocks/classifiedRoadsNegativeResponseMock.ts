// 2, WALLER ROAD, BEACONSFIELD, BUCKINGHAMSHIRE, HP9 2HE
// https://api.editor.planx.uk/roads?usrn=35200102
export default {
  sourceRequest:
    "https://api.os.uk/features/v1/wfs?service=WFS&request=GetFeature&version=2.0.0&typeNames=Highways_RoadLink&outputFormat=GEOJSON&srsName=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A4326&count=1&filter=%0A++++%3Cogc%3AFilter%3E%0A++++++%3Cogc%3APropertyIsLike+wildCard%3D%22%25%22+singleChar%3D%22%23%22+escapeChar%3D%22%21%22%3E%0A++++++++%3Cogc%3APropertyName%3EFormsPartOf%3C%2Fogc%3APropertyName%3E%0A++++++++%3Cogc%3ALiteral%3E%25Street%23usrn35200102%25%3C%2Fogc%3ALiteral%3E%0A++++++%3C%2Fogc%3APropertyIsLike%3E%0A++++%3C%2Fogc%3AFilter%3E%0A++&",
  metadata: {
    "road.classified": {
      name: "Classified road",
      plural: "Classified roads",
    },
  },
  constraints: {
    "road.classified": {
      fn: "road.classified",
      value: false,
      text: "is not on a Classified Road",
      category: "General policy",
    },
  },
};
