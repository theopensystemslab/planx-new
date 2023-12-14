import { gql } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import area from "@turf/area";
import { Feature, GeoJSONObject } from "@turf/helpers";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";

import {
  DEFAULT_NEW_ADDRESS_TITLE,
  DEFAULT_TITLE,
  FindProperty,
  SiteAddress,
} from "../model";
import PickOSAddress from "./Autocomplete";
import PlotNewAddress from "./Map";

// This query is exported because tests require it
export const FETCH_BLPU_CODES = gql`
  {
    blpu_codes {
      code
      description
      value
    }
  }
`;

type Props = PublicProps<FindProperty>;

export default Component;

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const previouslySubmittedAddressSource =
    props.previouslySubmittedData?.data?._address?.source;

  const startPage =
    previouslySubmittedAddressSource === "proposed"
      ? "new-address"
      : "os-address";
  const [page, setPage] = useState<"os-address" | "new-address">(startPage);

  const [address, setAddress] = useState<SiteAddress | undefined>(
    previouslySubmittedData?._address,
  );
  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();
  const [titleBoundary, setTitleBoundary] = useState<Feature | undefined>();
  const [boundary, setBoundary] = useState<GeoJSONObject | undefined>();

  const teamSettings = useStore((state) => state.teamSettings);

  // Use the address point to fetch the Local Authority District(s) & region via Digital Land
  const options = new URLSearchParams({
    entries: "all", // includes historic for pre-merger LADs (eg Wycombe etc for Uniform connector mappings)
    geometry: `POINT(${address?.longitude} ${address?.latitude})`,
    geometry_relation: "intersects",
    limit: "100",
  });
  options.append("dataset", "local-authority-district");
  options.append("dataset", "region"); // proxy for Greater London Authority (GLA) boundary
  options.append("dataset", "title-boundary");

  // https://www.planning.data.gov.uk/docs#/Search%20entity
  const root = `https://www.planning.data.gov.uk/entity.geojson?`;
  const digitalLandEndpoint = root + options;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, isValidating } = useSWR(
    () =>
      address?.latitude && address?.longitude ? digitalLandEndpoint : null,
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    },
  );

  // if allowNewAddresses is on, fetch the boundary geojson for this team to position the map view or default to London
  //   example value for team.settings.boundary is https://www.planning.data.gov.uk/entity/8600093.geojson
  const { data: geojson } = useSWR(
    () =>
      props.allowNewAddresses && teamSettings?.boundary
        ? teamSettings.boundary
        : null,
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    },
  );

  useEffect(() => {
    if (address && data?.features?.length > 0) {
      const lads: string[] = [];
      const regions: string[] = [];
      let title: Feature | undefined;
      data.features.forEach((feature: any) => {
        if (feature.properties.dataset === "local-authority-district") {
          lads.push(feature.properties.name);
        } else if (feature.properties.dataset === "region") {
          regions.push(feature.properties.name);
        } else if (feature.properties.dataset === "title-boundary") {
          title = feature;
        }
      });
      setLocalAuthorityDistricts([...new Set(lads)]);
      setRegions([...new Set(regions)]);
      setTitleBoundary(title);
    }
  }, [data, address]);

  useEffect(() => {
    if (geojson) setBoundary(geojson);
  }, [geojson]);

  function getPageBody() {
    if (props.allowNewAddresses && page === "new-address") {
      return (
        <>
          <QuestionHeader
            title={props.newAddressTitle || DEFAULT_NEW_ADDRESS_TITLE}
            description={props.newAddressDescription || ""}
          />
          <PlotNewAddress
            setAddress={setAddress}
            setPage={setPage}
            initialProposedAddress={
              previouslySubmittedData?._address?.source === "proposed" &&
              previouslySubmittedData?._address
            }
            boundary={boundary}
            id={props.id}
            description={props.newAddressDescription || ""}
            descriptionLabel={props.newAddressDescriptionLabel || ""}
          />
        </>
      );
    } else {
      // default to page === "os-address"
      return (
        <>
          <QuestionHeader
            title={props.title || DEFAULT_TITLE}
            description={props.description || ""}
          />
          <PickOSAddress
            setAddress={setAddress}
            initialPostcode={
              previouslySubmittedData?._address?.source === "os" &&
              previouslySubmittedData?._address.postcode
            }
            initialSelectedAddress={
              previouslySubmittedData?._address?.source === "os" &&
              previouslySubmittedData?._address
            }
            id={props.id}
            description={props.description || ""}
          />
          {!props.allowNewAddresses ? (
            <ExternalPlanningSiteDialog
              purpose={DialogPurpose.MissingAddress}
            ></ExternalPlanningSiteDialog>
          ) : (
            <Box sx={{ textAlign: "right" }}>
              <Link
                component="button"
                onClick={() => {
                  setPage("new-address");
                  setAddress(undefined);
                }}
              >
                <Typography variant="body1">
                  The site does not have an address
                </Typography>
              </Link>
            </Box>
          )}
          {Boolean(address) && isValidating && (
            <DelayedLoadingIndicator
              msDelayBeforeVisible={50}
              text="Fetching data..."
            />
          )}
        </>
      );
    }
  }

  return (
    <Card
      isValid={Boolean(address) && !isValidating}
      handleSubmit={() => {
        if (address) {
          const newPassportData: any = {};
          newPassportData["_address"] = address;
          if (address?.planx_value) {
            newPassportData["property.type"] = [address.planx_value];
          }

          if (localAuthorityDistricts) {
            newPassportData["property.localAuthorityDistrict"] =
              localAuthorityDistricts;
          }
          if (regions) {
            newPassportData["property.region"] = regions;
          }
          if (titleBoundary) {
            const areaSquareMetres =
              Math.round(area(titleBoundary as Feature) * 100) / 100;
            newPassportData["property.boundary.title"] = titleBoundary;
            newPassportData["property.boundary.title.area"] = areaSquareMetres;
            newPassportData["property.boundary.title.area.hectares"] =
              areaSquareMetres / 10000;
          }

          props.handleSubmit?.({ data: { ...newPassportData } });
        }
      }}
    >
      {getPageBody()}
    </Card>
  );
}
