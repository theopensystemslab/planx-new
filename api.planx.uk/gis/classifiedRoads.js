import "isomorphic-fetch";

const PASSPORT_FN = "roads.classified";

export const classifiedRoadsSearch = async (
  req,
  res,
  next
) => {
  try {
    if (!req.query.geom)
      return next({ status: 401, message: "Missing required query param `?geom=`" });

    // Create an OGC XML filter parameter value which will select the road features (lines)
    //   that intersect with the buffered site boundary (polygon) coordinates
    //   ref https://labs.os.uk/public/os-data-hub-examples/os-features-api/wfs-example-intersects#maplibre-gl-js
    const xml = `
      <ogc:Filter">
        <ogc:Intersects>
        <ogc:PropertyName>SHAPE</ogc:PropertyName>
          <gml:Polygon srsName="EPSG:4326">
            <gml:outerBoundaryIs>
              <gml:LinearRing>
                <gml:coordinates>${req.query.geom}</gml:coordinates>
              </gml:LinearRing>
            </gml:outerBoundaryIs>
          </gml:Polygon>
        </ogc:Intersects>
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
      filter: xml,
      key: process.env.ORDNANCE_SURVEY_API_KEY || "",
    };

    const url = `https://api.os.uk/features/v1/wfs?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url)
      .then(res => res.json())
      .catch(error => console.log(error));

    // format the response to align with "planning constraints"
    return res.json({
      [PASSPORT_FN]: {
        value: true,
        text: "is on a Classified Road",
        data: response?.features,
      }
    });
  } catch (error) {
    return next({ message: "Failed to fetch classified roads: " + error?.message });
  }
};
