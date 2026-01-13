import type { Success, LocalPlanningAuthorityFeature } from "./types.js";

export const findLpaWales = async (
  lon: number,
  lat: number,
): Promise<Success> => {
  const filterXml = `
    <fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
      <fes:Intersects>
        <fes:ValueReference>wkb_geometry</fes:ValueReference>
        <gml:Point srsName="EPSG:4326">
          <gml:pos>${lon} ${lat}</gml:pos>
        </gml:Point>
      </fes:Intersects>
    </fes:Filter>
  `;

  const params: Record<string, string> = {
    service: "WFS",
    request: "GetFeature",
    version: "2.0.0",
    typeNames: "inspire-wg:localauthorities",
    outputFormat: "application/json",
    propertyName: "name_en,name_cy,code",
    filter: filterXml,
  };

  const url = `https://datamap.gov.wales/geoserver/wfs?${new URLSearchParams(params).toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`DataMapWales WFS request failed: ${response.statusText}`);
  }

  const data = await response.json();

  interface WalesLpaFeature {
    properties: {
      name_cy: string;
      name_en: string;
      code: string;
    };
  }

  const entities: LocalPlanningAuthorityFeature[] =
    data.features?.map((feature: WalesLpaFeature) => ({
      name: feature.properties.name_cy, // Use Welsh name
      entity: 0, // Wales doesn't have Digital Land entity numbers
      reference: feature.properties.code, // W06000023 format
      "organisation-entity": "", // Not available in Wales data
    })) || [];

  return {
    sourceRequest: url.split("typeNames=")[0],
    entities,
  };
};
