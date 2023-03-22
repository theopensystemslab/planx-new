import "isomorphic-fetch";

// Passport key comes from Digital Planning Schemas googlesheet
export const PASSPORT_FN = "road.classified";

export const classifiedRoadsSearch = async (req, res, next) => {
  if (!req.query.usrn)
    return next({ status: 401, message: "Missing required query param `?usrn=`" });

  // Create an OGC XML filter parameter value which will select the road features (lines) that match an USRN
  //   ref https://labs.os.uk/public/os-data-hub-examples/os-features-api/wfs-example-topo-toid-search#maplibre-gl-js
  const xml = `
    <ogc:Filter>
      <ogc:PropertyIsLike wildCard="%" singleChar="#" escapeChar="!">
        <ogc:PropertyName>FormsPartOf</ogc:PropertyName>
        <ogc:Literal>%Street#usrn${req.query.usrn}%</ogc:Literal>
      </ogc:PropertyIsLike>
    </ogc:Filter>
  `;

  // Define WFS parameters object
  const params = {
    service: "WFS",
    request: "GetFeature",
    version: "2.0.0",
    typeNames: "Highways_RoadLink", // sourced from OS MasterMap Highways Network, uniquely includes "RoadClassification" attribute
    outputFormat: "GEOJSON",
    srsName: "urn:ogc:def:crs:EPSG::4326",
    count: 1, // USRN can match many road segments, but all should share the same classification, so limit to first result
    filter: xml,
    key: process.env.ORDNANCE_SURVEY_API_KEY || "",
  };

  try {
    const url = `https://api.os.uk/features/v1/wfs?${new URLSearchParams(params).toString()}`;
    const features = await fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.features?.length) return;
        
        // Filter out any intersecting roads that are not classified
        //   find all possible values on page 43 https://www.ordnancesurvey.co.uk/documents/os-mastermap-highways-network-roads-technical-specification.pdf 
        //   XX in future consider doing this directly in XML using <ogc:PropertyIsNotEqualTo>
        const classifiedFeatures = data.features.filter((feature) => !["Unclassified", "Not Classified", "Unknown"].includes(feature.properties["RoadClassification"]));
        return classifiedFeatures;
      });

    // Return a response object that's the same shape as a planning constraint
    if (features?.length) {
      return res.json({
        [PASSPORT_FN]: {
          value: true,
          text: `is on a Classified Road (${features[0].properties["RoadName1"]} - ${features[0].properties["RoadClassification"]})`,
          data: features,
        }
      });
    } else {
      return res.json({
        [PASSPORT_FN]: {
          value: false,
          text: "is not on a Classified Road",
        }
      });
    }
  } catch (error) {
    return next({ message: "Failed to fetch classified roads: " + error?.message });
  }
};
