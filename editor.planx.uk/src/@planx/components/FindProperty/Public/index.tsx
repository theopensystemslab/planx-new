import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import FeedbackInput from "@planx/components/shared/FeedbackInput";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import find from "lodash/find";
import { useStore } from "pages/FlowEditor/lib/store";
import { parse, toNormalised } from "postcode";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { TeamSettings } from "types";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import { fetchCurrentTeam } from "utils";

import type { FindProperty, SiteAddress } from "../model";
import { DEFAULT_TITLE } from "../model";

// these queries are exported because tests require them
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
  const startPage = "os-address";
  const [page, setPage] = useState<"os-address" | "new-address">(startPage);
  const [address, setAddress] = useState<SiteAddress | undefined>();
  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();
  const flow = useStore((state) => state.flow);
  const team = fetchCurrentTeam();

  // if we have an address point, check which local authority district(s) & region it's located in via Digital Land
  let options = new URLSearchParams({
    entries: "all", // includes historic
    geometry: `POINT(${address?.longitude} ${address?.latitude})`,
    geometry_relation: "intersects",
    limit: "100",
  });
  options.append("dataset", "local-authority-district");
  options.append("dataset", "region");

  // https://www.planning.data.gov.uk/docs#/Search%20entity
  const root = `https://www.planning.data.gov.uk/entity.json?`;
  const digitalLandEndpoint = root + options;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data } = useSWR(
    () =>
      address?.latitude && address?.longitude ? digitalLandEndpoint : null,
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  useEffect(() => {
    if (address && data) {
      if (data.count > 0) {
        const lads: string[] = [];
        const regions: string[] = [];
        data.entities.forEach((entity: any) => {
          if (entity.dataset === "local-authority-district") {
            lads.push(entity.name);
          } else if (entity.dataset === "region") {
            regions.push(entity.name);
          }
        });
        setLocalAuthorityDistricts([...new Set(lads)]);
        setRegions([...new Set(regions)]);
      }
    }
  }, [data]);

  if (!address && Boolean(team) && page === "os-address") {
    return (
      <GetAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
        teamSettings={team?.settings}
        id={props.id}
        setPage={setPage}
      />
    );
  } else if (!address && Boolean(team) && page === "new-address") {
    return (
      <PlotNewAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        teamSettings={team?.settings}
        id={props.id}
        setPage={setPage}
      />
    );
  } else if (address) {
    return (
      <PropertyInformation
        previousFeedback={props.previouslySubmittedData?.feedback}
        handleSubmit={({ feedback }: { feedback?: string }) => {
          if (flow && address) {
            const newPassportData: any = {};

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

            const passportData = {
              _address: address,
              ...newPassportData,
            };

            const submissionData: any = {
              data: passportData,
            };

            if (feedback) {
              submissionData.feedback = feedback;
            }

            props.handleSubmit?.(submissionData);
          } else {
            throw Error("Should not have been clickable");
          }
        }}
        lng={address.longitude}
        lat={address.latitude}
        title="About the property"
        description="This is the information we currently have about the property"
        propertyDetails={[
          {
            heading: "Address",
            detail: address.title,
          },
          {
            heading: "Postcode",
            detail: address.postcode,
          },
          {
            heading: "Local planning authority",
            detail: localAuthorityDistricts?.join(", ") || team?.name,
          },
          {
            heading: "Building type", // XXX: does this heading still make sense for infra?
            detail: address.planx_description,
          },
        ]}
        teamColor={team?.theme?.primary || "#2c2c2c"}
      />
    );
  } else {
    return <DelayedLoadingIndicator text="Fetching property information..." />;
  }
}

const AutocompleteWrapper = styled(Box)(({ theme }) => ({
  // Autocomplete style overrides
  "--autocomplete__label__font-size": "18px",
  "--autocomplete__input__padding": "6px 40px 7px 12px",
  "--autocomplete__input__font-size": "15px",
  "--autocomplete__input__height": "50px",
  "--autocomplete__dropdown-arrow-down__top": "16px",
  "--autocomplete__dropdown-arrow-down__z-index": "2",
  "--autocomplete__option__font-size": "15px",
  "--autocomplete__option__padding": "6px 12px 7px 12px",
  "--autocomplete__menu__max-height": "336px",
  "--autocomplete__option__border-bottom": `solid 1px ${theme.palette.grey[800]}`,
  "--autocomplete__option__hover-border-color": theme.palette.primary.main,
  "--autocomplete__option__hover-background-color": theme.palette.primary.main,
  "--autocomplete__font-family": theme.typography.fontFamily,
}));

function GetAddress(props: {
  setAddress: React.Dispatch<React.SetStateAction<SiteAddress | undefined>>;
  title?: string;
  description?: string;
  allowNewAddresses?: boolean;
  initialPostcode?: string;
  initialSelectedAddress?: Option;
  teamSettings?: TeamSettings;
  id?: string;
  setPage: React.Dispatch<React.SetStateAction<"os-address" | "new-address">>;
}) {
  const [postcode, setPostcode] = useState<string | null>(
    props.initialPostcode ?? null
  );
  const [sanitizedPostcode, setSanitizedPostcode] = useState<string | null>(
    (props.initialPostcode && toNormalised(props.initialPostcode.trim())) ??
      null
  );
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    props.initialSelectedAddress ?? undefined
  );
  const [showPostcodeError, setShowPostcodeError] = useState<boolean>(false);

  // Fetch blpu_codes records so that we can join address CLASSIFICATION_CODE to planx variable
  const { data: blpuCodes } = useQuery(FETCH_BLPU_CODES);

  useEffect(() => {
    // Handles mapping the raw Ordnance Survey record to planx's address model
    const addressSelectionHandler = ({
      detail,
    }: {
      detail: Record<"address", Record<string, any>>;
    }) => {
      const selectedAddress: Record<string, any> | undefined =
        detail?.address?.LPI;
      if (selectedAddress) {
        setSelectedOption({
          uprn: selectedAddress.UPRN.padStart(12, "0"),
          blpu_code: selectedAddress.BLPU_STATE_CODE,
          latitude: selectedAddress.LAT,
          longitude: selectedAddress.LNG,
          organisation: selectedAddress.ORGANISATION || null,
          sao: selectedAddress.SAO_TEXT,
          pao: [
            selectedAddress.PAO_START_NUMBER,
            selectedAddress.PAO_START_SUFFIX,
          ]
            .filter(Boolean)
            .join(""), // docs reference PAO_TEXT, but not found in response so roll our own
          street: selectedAddress.STREET_DESCRIPTION,
          town: selectedAddress.TOWN_NAME,
          postcode: selectedAddress.POSTCODE_LOCATOR,
          x: selectedAddress.X_COORDINATE,
          y: selectedAddress.Y_COORDINATE,
          planx_description:
            find(blpuCodes?.blpu_codes, {
              code: selectedAddress.CLASSIFICATION_CODE,
            })?.description || null,
          planx_value:
            find(blpuCodes?.blpu_codes, {
              code: selectedAddress.CLASSIFICATION_CODE,
            })?.value || null,
          single_line_address: selectedAddress.ADDRESS,
          title: selectedAddress.ADDRESS.split(
            `, ${selectedAddress.ADMINISTRATIVE_AREA}`
          )[0], // display value used in autocomplete dropdown & FindProperty
        });
      }
    };

    const autocomplete: any = document.getElementById("address-autocomplete");
    autocomplete?.addEventListener("addressSelection", addressSelectionHandler);

    return function cleanup() {
      autocomplete?.removeEventListener(
        "addressSelection",
        addressSelectionHandler
      );
    };
  }, [sanitizedPostcode, setSelectedOption]);

  const handleCheckPostcode = () => {
    if (!sanitizedPostcode) setShowPostcodeError(true);
  };

  // XXX: If you press a key on the keyboard, you expect something to show up on the screen,
  //      so this code attempts to validate postcodes without blocking any characters.
  const handlePostcodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Reset the address on change of postcode - ensures no visual mismatch between address and postcode
    if (selectedOption) {
      setSelectedOption(undefined);
    }

    // Validate and set Postcode
    const input = e.target.value;
    if (parse(input.trim()).valid) {
      setSanitizedPostcode(toNormalised(input.trim()));
      setPostcode(toNormalised(input.trim()));
    } else {
      setSanitizedPostcode(null);
      setPostcode(input.toUpperCase());
    }
  };

  return (
    <Card
      handleSubmit={() => props.setAddress(selectedOption)}
      isValid={Boolean(selectedOption)}
    >
      <QuestionHeader
        title={props.title || DEFAULT_TITLE}
        description={props.description || ""}
      />
      <AutocompleteWrapper>
        <InputLabel label="Postcode" htmlFor="postcode-input">
          <Input
            required
            bordered
            name="postcode"
            id="postcode-input"
            value={postcode || ""}
            errorMessage={
              showPostcodeError && !sanitizedPostcode
                ? "Enter a valid UK postcode"
                : ""
            }
            onChange={(e) => handlePostcodeInputChange(e)}
            onKeyUp={({ key }) => {
              if (key === "Enter") handleCheckPostcode();
            }}
            onBlur={handleCheckPostcode}
            style={{ marginBottom: "20px" }}
            inputProps={{
              maxLength: 8,
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                showPostcodeError && !sanitizedPostcode
                  ? `${ERROR_MESSAGE}-${props.id}`
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
        {sanitizedPostcode && (
          /* @ts-ignore */
          <address-autocomplete
            id="address-autocomplete"
            data-testid="address-autocomplete-web-component"
            postcode={sanitizedPostcode}
            initialAddress={selectedOption?.title || ""}
            osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
            arrowStyle="light"
            labelStyle="static"
          />
        )}
      </AutocompleteWrapper>
      {props.allowNewAddresses ? (
        <ExternalPlanningSiteDialog
          purpose={DialogPurpose.MissingAddress}
          teamSettings={props.teamSettings}
        ></ExternalPlanningSiteDialog>
      ) : (
        <Box sx={{ textAlign: "right" }}>
          <Link
            component="button"
            onClick={() => props.setPage("new-address")}
            disabled={Boolean(sanitizedPostcode) && Boolean(selectedOption)}
          >
            <Typography variant="body2">
              The site does not have an address
            </Typography>
          </Link>
        </Box>
      )}
    </Card>
  );
}

function PlotNewAddress(props: any) {
  const [longitude, setLongitude] = useState<number | undefined>();
  const [latitude, setLatitude] = useState<number | undefined>();

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson.features) {
        // only a single point can be drawn, so get first feature in geojson "FeatureCollection"
        const feature = geojson.features[0];
        const coordinates = feature?.geometry?.coordinates;
        setLongitude(coordinates[0]);
        setLatitude(coordinates[1]);
      } else {
        // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set boundary to undefined
        setLongitude(undefined);
        setLatitude(undefined);
      }
    };

    const map: any = document.getElementById("plot-new-address-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setLongitude, setLatitude]);

  return (
    <Card
      handleSubmit={() => console.log("continue")}
      isValid={Boolean(latitude) && Boolean(longitude)}
    >
      <QuestionHeader
        title={props.title || DEFAULT_TITLE}
        description={props.description || ""}
      />
      <MapContainer>
        <p style={visuallyHidden}>
          A static map centred on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="plot-new-address-map"
          zoom={14}
          drawMode
          drawType="Point"
          resetControlImage="trash"
          showScale
          showNorthArrow
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
        />
      </MapContainer>
      <InputRow>
        <InputLabel label="Easting (X)">
          <Input name="easting" bordered disabled id="easting" />
        </InputLabel>
        <InputLabel label="Northing (Y)">
          <Input name="northing" bordered disabled id="northing" />
        </InputLabel>
      </InputRow>
      <InputRow>
        <InputLabel label="Longitude">
          <Input
            name="longitude"
            bordered
            disabled
            value={longitude}
            id="longitude"
          />
        </InputLabel>
        <InputLabel label="Latitude">
          <Input
            name="latitude"
            bordered
            disabled
            value={latitude}
            id="latitude"
          />
        </InputLabel>
      </InputRow>
      <InputLabel label="Describe this site">
        <Input
          name="newAddress"
          bordered
          onChange={() => {
            console.log("change");
          }}
          id="newAddressInput"
        />
      </InputLabel>
      <Box sx={{ textAlign: "right" }}>
        <Link
          component="button"
          onClick={() => props.setPage("os-address")}
          disabled={false}
        >
          <Typography variant="body2">
            I want to select an existing address
          </Typography>
        </Link>
      </Box>
    </Card>
  );
}

interface Option extends SiteAddress {
  title: string;
}

const MapContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& my-map": {
    width: "100%",
    height: "50vh",
  },
}));

const PropertyDetail = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
}));

export function PropertyInformation(props: any) {
  const {
    title,
    description,
    propertyDetails,
    lat,
    lng,
    handleSubmit,
    teamColor,
    previousFeedback,
  } = props;
  const formik = useFormik({
    initialValues: {
      feedback: previousFeedback || "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(
          values.feedback,
          "Inaccurate property details",
          propertyDetails
        );
      }
      handleSubmit?.(values);
    },
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <MapContainer>
        <p style={visuallyHidden}>
          A static map centred on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="property-information-map"
          zoom={19.5}
          latitude={lat}
          longitude={lng}
          osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
          hideResetControl
          showMarker
          markerLatitude={lat}
          markerLongitude={lng}
          // markerColor={teamColor} // defaults to black
        />
      </MapContainer>
      <Box component="dl" mb={3}>
        {propertyDetails.map(({ heading, detail }: any) => (
          <PropertyDetail key={heading}>
            <Box component="dt" fontWeight={700} flex={"0 0 35%"} py={1}>
              {heading}
            </Box>
            <Box component="dd" flexGrow={1} py={1}>
              {detail}
            </Box>
          </PropertyDetail>
        ))}
      </Box>
      <Box textAlign="right">
        <FeedbackInput
          text="Report an inaccuracy"
          handleChange={formik.handleChange}
          value={formik.values.feedback}
        />
      </Box>
    </Card>
  );
}
