import { gql } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { squareMetresToHectares } from "@planx/components/shared/utils";
import area from "@turf/area";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { Feature } from "geojson";
import { Store } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/public/ExternalPlanningSiteDialog";

import {
  FindProperty,
  FindPropertyUserAction,
  PASSPORT_COMPONENT_ACTION_KEY,
  SiteAddress,
} from "../model";
import PickOSAddress from "./Autocomplete";
import { useFindPropertyData } from "./hooks/useFindPropertyData";
import PlotNewAddress from "./Map";
import { AddressLoadingWrap } from "./styles";

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

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const previouslySubmittedAddressSource =
    props.previouslySubmittedData?.data?._address?.source;

  const startPage =
    previouslySubmittedAddressSource === "proposed"
      ? "new-address"
      : "os-address";
  const [page, setPage] = useState<"os-address" | "new-address">(startPage);

  const [mapValidationError, setMapValidationError] = useState<string>();
  const [showSiteDescriptionError, setShowSiteDescriptionError] =
    useState<boolean>(false);

  const [address, setAddress] = useState<SiteAddress | undefined>(
    previouslySubmittedData?._address,
  );

  const {
    localAuthorityDistricts,
    localPlanningAuthorities,
    regions,
    wards,
    titleBoundary,
    isPending,
  } = useFindPropertyData(address);

  const validateAndSubmit = () => {
    // TODO `if (isPending)` on either page, wrap Continue button in error mesage?

    if (page === "new-address") {
      if (address?.x === undefined && address?.y === undefined)
        setMapValidationError("Click or tap to place a point on the map");

      if (address?.title === undefined) setShowSiteDescriptionError(true);
    }

    if (address) {
      const newPassportData: Store.UserData["data"] = {};
      newPassportData["_address"] = address;
      if (address?.planx_value) {
        newPassportData["property.type"] = [address.planx_value];
      }

      // Set unclassified as a fallback if we have no property.type value
      if (
        !newPassportData["property.type"] ||
        newPassportData["property.type"].length === 0
      ) {
        newPassportData["property.type"] = ["unclassified"];
      }

      if (localAuthorityDistricts) {
        newPassportData["property.localAuthorityDistrict"] =
          localAuthorityDistricts;
      }

      if (localPlanningAuthorities) {
        newPassportData["property.localPlanningAuthority"] =
          localPlanningAuthorities;
      }

      if (regions) {
        newPassportData["property.region"] = regions;
      }

      if (wards) {
        newPassportData["property.ward"] = wards;
      }

      if (titleBoundary) {
        const areaSquareMetres =
          Math.round(area(titleBoundary as Feature) * 100) / 100;
        newPassportData["property.boundary"] = titleBoundary;
        newPassportData["property.boundary.area"] = areaSquareMetres;
        newPassportData["property.boundary.area.hectares"] =
          squareMetresToHectares(areaSquareMetres);
      }

      newPassportData[PASSPORT_COMPONENT_ACTION_KEY] =
        address?.source === "os"
          ? FindPropertyUserAction.Existing
          : FindPropertyUserAction.New;

      props.handleSubmit?.({ data: { ...newPassportData } });
    }
  };

  const getValidStatus = () => {
    // Continue button enabled unless actively fetching
    if (page === "new-address") return !address || !isPending;

    // Continue button enabled once we have an address and not actively fetching
    if (page === "os-address") return Boolean(address) && !isPending;
  };

  const isValid = getValidStatus();

  return (
    <Card
      sx={{ marginBottom: "220px" }}
      handleSubmit={validateAndSubmit}
      isValid={isValid}
    >
      {getBody()}
    </Card>
  );

  function getBody() {
    if (props.allowNewAddresses && page === "new-address") {
      return (
        <>
          <CardHeader
            title={props.newAddressTitle}
            description={props.newAddressDescription || ""}
          />
          <PlotNewAddress
            setAddress={setAddress}
            setPage={setPage}
            initialProposedAddress={
              previouslySubmittedData?._address?.source === "proposed" &&
              previouslySubmittedData?._address
            }
            id={props.id}
            description={props.newAddressDescription || ""}
            descriptionLabel={props.newAddressDescriptionLabel || ""}
            mapValidationError={mapValidationError}
            setMapValidationError={setMapValidationError}
            showSiteDescriptionError={showSiteDescriptionError}
            setShowSiteDescriptionError={setShowSiteDescriptionError}
          />
          {Boolean(address) && isPending && (
            <DelayedLoadingIndicator
              msDelayBeforeVisible={50}
              text="Fetching data..."
            />
          )}
        </>
      );
    } else {
      // default to page === "os-address"
      return (
        <>
          <CardHeader
            title={props.title}
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
          <AddressLoadingWrap>
            {Boolean(address) && isPending && (
              <DelayedLoadingIndicator
                msDelayBeforeVisible={50}
                text="Finding information about the property"
                inline
              />
            )}
          </AddressLoadingWrap>
        </>
      );
    }
  }
}

export default Component;
