import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import {
  MapContainer,
  MapFooter,
} from "@planx/components/shared/Preview/MapContainer";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { multiPolygon, point } from "@turf/helpers";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { DEFAULT_NEW_ADDRESS_LABEL, SiteAddress } from "../model";

interface PlotNewAddressProps {
  setAddress: React.Dispatch<React.SetStateAction<SiteAddress | undefined>>;
  setPage: React.Dispatch<React.SetStateAction<"os-address" | "new-address">>;
  initialProposedAddress?: SiteAddress;
  id?: string;
  description?: string;
  descriptionLabel?: string;
  mapValidationError?: string;
  setMapValidationError: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  showSiteDescriptionError: boolean;
  setShowSiteDescriptionError: React.Dispatch<React.SetStateAction<boolean>>;
}

type Coordinates = {
  longitude: number;
  latitude: number;
  x: number;
  y: number;
};

export const DescriptionInput = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
}));

export interface GeocodeAutocompleteAddress {
  LPI: {
    LAT: number;
    LNG: number;
  };
}

export default function PlotNewAddress(props: PlotNewAddressProps): FCReturn {
  // `coordinates` refer to the point proposed/plotted by the user
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
    props.initialProposedAddress
      ? {
        longitude: props.initialProposedAddress.longitude,
        latitude: props.initialProposedAddress.latitude,
        x: props.initialProposedAddress.x,
        y: props.initialProposedAddress.y,
      }
      : undefined,
  );
  const [siteDescription, setSiteDescription] = useState<string | null>(
    props.initialProposedAddress?.title ?? null,
  );

  // `searchedPoint` is optionally used to position the map only (you shouldn't propose an existing address point)
  const [searchedPoint, setSearchedPoint] = useState<GeocodeAutocompleteAddress | undefined>(undefined);
  const [searchValidationError, setSearchValidationError] = useState<string | undefined>(undefined);

  const [environment, boundaryBBox] = useStore((state) => [
    state.previewEnvironment,
    state.teamSettings.boundaryBBox as unknown as any,
  ]);

  useEffect(() => {
    const geocodeAutocompleteSearchHandler = ({
      detail,
    }: {
      detail: Record<"address", GeocodeAutocompleteAddress>;
    }) => {
      const selectedAddress = detail?.address;
      if (selectedAddress) {
        if (boundaryBBox) {
          const searchedAddressIsWithinClip = booleanPointInPolygon(
            point([selectedAddress.LPI.LNG, selectedAddress.LPI.LAT]),
            multiPolygon(boundaryBBox?.geometry)
          );

          if (!searchedAddressIsWithinClip) {
            setSearchValidationError("Searched address is outside of map bounds, try another address");
            setSearchedPoint(undefined);
          } else {
            setSearchedPoint(selectedAddress)
          }
        }
      }
    };

    const geocodeAutocomplete: any = document.getElementById("geocode-autocomplete");
    geocodeAutocomplete?.addEventListener("addressSelection", geocodeAutocompleteSearchHandler);

    return function cleanup() {
      geocodeAutocomplete?.removeEventListener(
        "addressSelection",
        geocodeAutocompleteSearchHandler,
      );
    };
  }, [setSearchedPoint]);

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features && geojson["EPSG:27700"]?.features) {
        // only a single point can be plotted, so get first feature in geojson "FeatureCollection" per projection
        const [longitude, latitude] =
          geojson["EPSG:3857"].features[0]?.geometry?.coordinates;
        const [x, y] = geojson["EPSG:27700"].features[0]?.geometry?.coordinates;
        setCoordinates({ longitude, latitude, x, y });
      } else {
        // triggered if a user "clears" their point on the map
        setCoordinates(undefined);
      }
    };

    const map: any = document.getElementById("plot-new-address-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setCoordinates]);

  const mapValidationErrorRef = useRef(props.mapValidationError);
  useEffect(() => {
    mapValidationErrorRef.current = props.mapValidationError;
  }, [props.mapValidationError]);

  useEffect(() => {
    if (mapValidationErrorRef.current) {
      props.setMapValidationError(undefined);
    }
  }, [coordinates]);

  const searchValidationErrorRef = useRef(searchValidationError);
  useEffect(() => {
    searchValidationErrorRef.current = searchValidationError;
  }, [searchValidationError]);


  useEffect(() => {
    if (searchValidationErrorRef.current) {
      setSearchValidationError(undefined);
    }
  }, [searchedPoint]);

  useEffect(() => {
    // when we have all required address parts, call setAddress to enable the "Continue" button
    if (siteDescription && coordinates) {
      props.setAddress({
        ...coordinates,
        title: siteDescription,
        source: "proposed",
      });
    } else {
      props.setAddress(undefined);
    }
  }, [coordinates, siteDescription]);

  const handleSiteDescriptionCheck = () => {
    if (!siteDescription) props.setShowSiteDescriptionError(true);
  };

  const handleSiteDescriptionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value;
    setSiteDescription(input);
  };

  return (
    <>
      <ErrorWrapper
        error={searchValidationError}
        id="geocode-autocomplete"
      >
        {/* @ts-ignore */}
        <geocode-autocomplete
          id="geocode-autocomplete"
          label="Search for an address to position the map"
          osProxyEndpoint={`${import.meta.env.VITE_APP_API_URL}/proxy/ordnance-survey`}
        />
      </ErrorWrapper>
      <FullWidthWrapper>
        <ErrorWrapper
          error={props.mapValidationError}
          id="plot-new-address-map"
        >
          <MapContainer environment={environment} size="large">
            <p style={visuallyHidden}>
              An interactive map centred on the local authority district,
              showing the Ordnance Survey basemap. Click to place a point
              representing your proposed site location.
            </p>
            {/* @ts-ignore */}
            <my-map
              id="plot-new-address-map"
              ariaLabelOlFixedOverlay="An interactive map for providing your site location"
              data-testid="map-web-component"
              zoom={searchedPoint ? 18 : 10}
              latitude={searchedPoint && searchedPoint.LPI.LAT}
              longitude={searchedPoint && searchedPoint.LPI.LNG}
              drawMode
              drawType="Point"
              drawGeojsonData={
                coordinates &&
                JSON.stringify({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [
                      coordinates?.longitude,
                      coordinates?.latitude,
                    ],
                  },
                  properties: {},
                })
              }
              resetControlImage="trash"
              showScale
              showNorthArrow
              osProxyEndpoint={`${import.meta.env.VITE_APP_API_URL
                }/proxy/ordnance-survey`}
              clipGeojsonData={JSON.stringify(boundaryBBox)}
              osCopyright={`© Crown copyright and database rights ${new Date().getFullYear()} OS AC0000812160`}
              collapseAttributions={window.innerWidth < 500 ? true : undefined}
            />
          </MapContainer>
        </ErrorWrapper>
        <MapFooter>
          <Typography variant="body2">
            The coordinate location of your address point is:{" "}
            <strong>
              {`${(coordinates?.x && Math.round(coordinates.x)) || 0
                } Easting (X), ${(coordinates?.y && Math.round(coordinates.y)) || 0
                } Northing (Y)`}
            </strong>
          </Typography>
          <Link
            component="button"
            onClick={() => {
              props.setPage("os-address");
              props.setAddress(undefined);
            }}
          >
            <Typography variant="body2">
              I want to select an existing address
            </Typography>
          </Link>
        </MapFooter>
      </FullWidthWrapper>
      <DescriptionInput data-testid="new-address-input" mt={2}>
        <InputLabel
          label={props.descriptionLabel || DEFAULT_NEW_ADDRESS_LABEL}
          htmlFor={`${props.id}-siteDescription`}
        >
          <Input
            required
            bordered
            name="siteDescription"
            id={`${props.id}-siteDescription`}
            value={siteDescription || ""}
            errorMessage={
              props.showSiteDescriptionError && !siteDescription
                ? `Enter a site description such as "Land at..."`
                : ""
            }
            onChange={(e) => handleSiteDescriptionInputChange(e)}
            onKeyUp={({ key }) => {
              if (key === "Enter") handleSiteDescriptionCheck();
            }}
            onBlur={handleSiteDescriptionCheck}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                props.showSiteDescriptionError && !siteDescription
                  ? `${ERROR_MESSAGE}-${props.id}`
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
      </DescriptionInput>
    </>
  );
}
