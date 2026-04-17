import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { Feature, type Polygon } from "geojson";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import type { Entity } from "./planningData/types";

type Projection = "EPSG:3857" | "EPSG:27700";

export type GeoJSONChange = Record<Projection, { features: Feature[] }>;
export type GeoJSONChangeEvent = CustomEvent<GeoJSONChange>;

const isGeoJSONChangeEvent = (event: Event): event is GeoJSONChangeEvent => {
  return event instanceof CustomEvent;
};

type UseGeoJSONChange = (
  mapId: string,
  callback: (event: GeoJSONChangeEvent) => void,
) => [Feature[] | undefined, Dispatch<SetStateAction<Feature[] | undefined>>];

/**
 * Hook for interacting with @opensystemslab/map
 * Assign a callback function to be triggered on the "geojsonChange" event
 */
export const useGeoJSONChange: UseGeoJSONChange = (mapId, callback) => {
  const [features, setFeatures] = useState<Feature[] | undefined>(undefined);

  useEffect(() => {
    const geojsonChangeHandler: EventListener = (event) => {
      if (!isGeoJSONChangeEvent(event)) return;

      callback(event);
    };

    const map: HTMLElement | null = document.getElementById(mapId);
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [callback, mapId]);

  return [features, setFeatures];
};

export type GeocodeAutocompleteAddress = {
  LPI: {
    LAT: number;
    LNG: number;
  };
}

export type GeocodeChangeEvent = CustomEvent<GeocodeAutocompleteAddress>;

const isGeocodeChangeEvent = (event: Event): event is GeocodeChangeEvent => {
  return event instanceof CustomEvent;
};

type UseGeocodeChange = (
  inputId: string,
  callback: (event: GeocodeChangeEvent) => void,
) => [GeocodeAutocompleteAddress | undefined, Dispatch<SetStateAction<GeocodeAutocompleteAddress | undefined>>];

/**
 * Hook for interacting with @opensystemslab/map geocode-autocomplete
 * Assign a callback function to be triggered on the "addressSelection" event
 */
export const useGeocodeChange: UseGeocodeChange = (inputId, callback) => {
  const [selectedAddress, setSelectedAddress] = useState<GeocodeAutocompleteAddress | undefined>(undefined);

  useEffect(() => {
    const geocodeAutocompleteSearchHandler: EventListener = (event) => {
      if (!isGeocodeChangeEvent(event)) return;

      callback(event);
    }

    const geocodeAutocomplete: HTMLElement | null = document.getElementById("geocode-autocomplete");
    geocodeAutocomplete?.addEventListener("addressSelection", geocodeAutocompleteSearchHandler);

    return function cleanup() {
      geocodeAutocomplete?.removeEventListener(
        "addressSelection",
        geocodeAutocompleteSearchHandler,
      );
    };
  }, [callback, inputId]);

  return [selectedAddress, setSelectedAddress];
};

/**
 * Convert a complex local authority boundary to a simplified bounding box
 */
export const convertToBoundingBox = (feature: Entity): Feature<Polygon> =>
  bboxPolygon(bbox(feature));
