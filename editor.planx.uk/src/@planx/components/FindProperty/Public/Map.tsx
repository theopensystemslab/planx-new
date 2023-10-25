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
import { GeoJSONObject } from "@turf/helpers";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";

import { DEFAULT_NEW_ADDRESS_LABEL, SiteAddress } from "../model";

interface PlotNewAddressProps {
  setAddress: React.Dispatch<React.SetStateAction<SiteAddress | undefined>>;
  setPage: React.Dispatch<React.SetStateAction<"os-address" | "new-address">>;
  initialProposedAddress?: SiteAddress;
  boundary?: GeoJSONObject | undefined;
  id?: string;
  description?: string;
  descriptionLabel?: string;
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

export default function PlotNewAddress(props: PlotNewAddressProps): FCReturn {
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
  const [showSiteDescriptionError, setShowSiteDescriptionError] =
    useState<boolean>(false);

  const [environment, boundaryBBox] = useStore((state) => [
    state.previewEnvironment,
    state.boundaryBBox,
  ]);

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
    if (!siteDescription) setShowSiteDescriptionError(true);
  };

  const handleSiteDescriptionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value;
    setSiteDescription(input);
  };

  return (
    <>
      <MapContainer environment={environment} size="large">
        <p style={visuallyHidden}>
          An interactive map centred on the local authority district, showing
          the Ordnance Survey basemap. Click to place a point representing your
          proposed site location.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="plot-new-address-map"
          data-testid="map-web-component"
          zoom={14}
          drawMode
          drawType="Point"
          geojsonData={JSON.stringify(props?.boundary)}
          geojsonColor="#efefef"
          geojsonBuffer="10"
          resetControlImage="trash"
          showScale
          showNorthArrow
          osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
          clipGeojsonData={JSON.stringify(boundaryBBox)}
        />
        <MapFooter>
          <Typography variant="body2">
            The coordinate location of your address point is:{" "}
            <strong>
              {`${
                (coordinates?.x && Math.round(coordinates.x)) || 0
              } Easting (X), ${
                (coordinates?.y && Math.round(coordinates.y)) || 0
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
      </MapContainer>
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
              showSiteDescriptionError && !siteDescription
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
                showSiteDescriptionError && !siteDescription
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
