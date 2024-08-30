import { Feature } from "geojson";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Projection = "EPSG:3857" | "EPSG:27700";

export type GeoJSONChange = Record<Projection, { features: Feature[] }>;
export type GeoJSONChangeEvent = CustomEvent<GeoJSONChange>;

const isGeoJSONChangeEvent = (event: Event): event is GeoJSONChangeEvent => {
  return event instanceof CustomEvent;
};

type UseGeoJSONChange = (
  callback: (event: GeoJSONChangeEvent) => void,
) => [Feature[] | undefined, Dispatch<SetStateAction<Feature[] | undefined>>];

/**
 * Hook for interacting with @opensystemslab/map
 * Assign a callback function to be triggered on the "geojsonChange" event
 */
export const useGeoJSONChange: UseGeoJSONChange = (callback) => {
  const [features, setFeatures] = useState<Feature[] | undefined>(undefined);

  useEffect(() => {
    const geojsonChangeHandler: EventListener = (event) => {
      if (!isGeoJSONChangeEvent(event)) return;

      callback(event);
    };

    const map: HTMLElement | null =
      document.getElementById("map-and-label-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [callback]);

  return [features, setFeatures];
};
