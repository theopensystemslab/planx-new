import proj4 from "proj4";

proj4.defs([
  ["WGS84", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"],
  [
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
  ],
]);

const projections = {
  standard: new proj4.Proj("WGS84"),
  ordnanceSurvey: new proj4.Proj("EPSG:27700"),
};

export const convertOrdnanceSurveyToStandard = (x: number, y: number) => {
  const { x: lng, y: lat } = proj4.transform(
    projections.ordnanceSurvey,
    projections.standard,
    [x, y]
  );
  return { lng, lat };
};

export const convertStandardToOrdnanceSurvey = (lng: number, lat: number) => {
  const { x, y } = proj4.transform(
    projections.standard,
    projections.ordnanceSurvey,
    [lng, lat]
  );
  return { x, y };
};
