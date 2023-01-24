import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import styled from "@mui/styles/styled";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import {
  MapContainer,
  MapFooter,
} from "@planx/components/shared/Preview/MapContainer";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { TeamSettings } from "types";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";

import { DEFAULT_NEW_ADDRESS_TITLE, SiteAddress } from "../model";

interface PlotNewAddressProps {
  title?: string;
  description?: string;
  initialProposedAddress?: SiteAddress;
  teamSettings?: TeamSettings;
  id?: string;
  setAddress: React.Dispatch<React.SetStateAction<SiteAddress | undefined>>;
  setPage: React.Dispatch<React.SetStateAction<"os-address" | "new-address">>;
}

export const DescriptionInput = styled(Box)(({ theme }) => ({
  display: "flex",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export default function PlotNewAddress(props: PlotNewAddressProps) {
  const [siteDescription, setSiteDescription] = useState<string | undefined>(
    props.initialProposedAddress?.title ?? undefined
  );
  const [proposedAddress, setProposedAddress] = useState<
    SiteAddress | undefined
  >(props.initialProposedAddress ?? undefined);

  const environment = useStore((state) => state.previewEnvironment);

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features && geojson["EPSG:27700"]?.features) {
        setProposedAddress({
          // only a single point can be plotted, so get first feature in geojson "FeatureCollection" per projection
          longitude: geojson["EPSG:3857"].features[0]?.geometry?.coordinates[0],
          latitude: geojson["EPSG:3857"].features[0]?.geometry?.coordinates[1],
          x: geojson["EPSG:27700"].features[0]?.geometry?.coordinates[0],
          y: geojson["EPSG:27700"].features[0]?.geometry?.coordinates[1],
          title: siteDescription || "",
          source: "proposed",
        });
      } else {
        // triggered if a user "clears" their point on the map
        setProposedAddress(undefined);
      }
    };

    const map: any = document.getElementById("plot-new-address-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setProposedAddress]);

  return (
    <Card
      handleSubmit={() => {
        //@ts-ignore
        props.setAddress({ ...proposedAddress, title: siteDescription });
      }}
      isValid={Boolean(proposedAddress) && Boolean(siteDescription)}
    >
      <QuestionHeader
        title={props.title || DEFAULT_NEW_ADDRESS_TITLE}
        description={props.description || ""}
      />
      <MapContainer environment={environment} interactive>
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
          resetControlImage="trash"
          showScale
          showNorthArrow
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
        />
        <MapFooter>
          <Typography variant="body2">
            The coordinate location of your address point is:{" "}
            <strong>
              {proposedAddress?.x?.toFixed(5) || 0} Easting (X),{" "}
              {proposedAddress?.y?.toFixed(5) || 0} Northing (Y)
            </strong>
          </Typography>
          <Link
            component="button"
            onClick={() => props.setPage("os-address")}
            disabled={false}
          >
            <Typography variant="body2">
              I want to select an existing address
            </Typography>
          </Link>
        </MapFooter>
      </MapContainer>
      <DescriptionInput data-testid="new-address-input">
        <InputLabel label="Describe this site">
          <Input
            name="newAddress"
            bordered
            onChange={(e) => {
              setSiteDescription(e.target.value);
            }}
            value={siteDescription}
            id="newAddressInput"
          />
        </InputLabel>
      </DescriptionInput>
    </Card>
  );
}
