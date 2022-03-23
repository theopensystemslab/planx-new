import "./map.css";

import { gql, useQuery } from "@apollo/client";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { visuallyHidden } from "@material-ui/utils";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import capitalize from "lodash/capitalize";
import find from "lodash/find";
import { useStore } from "pages/FlowEditor/lib/store";
import { parse, toNormalised } from "postcode";
import React, { useEffect, useState } from "react";
import { borderedFocusStyle } from "theme";
import { TeamSettings } from "types";
import CollapsibleInput from "ui/CollapsibleInput";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import { fetchCurrentTeam } from "utils";

import type { Address, FindProperty } from "../model";
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
  const [address, setAddress] = useState<Address | undefined>();
  const flow = useStore((state) => state.flow);
  const team = fetchCurrentTeam();

  if (!address && Boolean(team)) {
    return (
      <GetAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
        teamSettings={team?.settings}
        id={props.id}
      />
    );
  } else if (address) {
    let warning: {
      show: boolean;
      os_administrative_area: string;
      os_local_custodian_code: string;
      planx_team_name?: string;
    } = {
      show: false,
      os_administrative_area: address.administrative_area,
      os_local_custodian_code: address.local_custodian_code,
    };

    if (team?.name) {
      // if neither admin area nor LCC match team, then show warning error msg
      warning.show = ![
        address.administrative_area,
        address.local_custodian_code,
      ].includes(team.name.toUpperCase());
      warning.planx_team_name = team.name.toUpperCase();
    }

    return (
      <PropertyInformation
        handleSubmit={(feedback?: string) => {
          if (flow && address) {
            const newPassportData: any = {};

            if (address?.planx_value) {
              newPassportData["property.type"] = [address.planx_value];
            }

            const passportData = {
              _address: address,
              _addressWarning: warning,
              ...newPassportData,
            };

            props.handleSubmit?.({
              data: passportData,
            });
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
            heading: "District",
            detail: team?.name,
          },
          {
            heading: "Building type", // XXX: does this heading still make sense for infra?
            detail: address.planx_description,
          },
        ]}
        team={team}
        teamColor={team?.theme?.primary || "#2c2c2c"}
        error={warning.show}
      />
    );
  } else {
    return (
      <DelayedLoadingIndicator
        msDelayBeforeVisible={0}
        text="Fetching property information..."
      />
    );
  }
}

function GetAddress(props: {
  setAddress: React.Dispatch<React.SetStateAction<Address | undefined>>;
  title?: string;
  description?: string;
  initialPostcode?: string;
  initialSelectedAddress?: Option;
  teamSettings?: TeamSettings;
  id?: string;
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
            find(blpuCodes.blpu_codes, {
              code: selectedAddress.CLASSIFICATION_CODE,
            })?.description || null,
          planx_value:
            find(blpuCodes.blpu_codes, {
              code: selectedAddress.CLASSIFICATION_CODE,
            })?.value || null,
          single_line_address: selectedAddress.ADDRESS,
          administrative_area: selectedAddress.ADMINISTRATIVE_AREA, // local highway authority name (proxy for local authority?)
          local_custodian_code:
            selectedAddress.LOCAL_CUSTODIAN_CODE_DESCRIPTION, // similar to GSS_CODE, but may not reflect merged councils
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

  // Autocomplete overrides
  const useStyles = makeStyles((theme) => ({
    autocomplete: {
      "--autocomplete__input__padding": "6px 12px 7px 12px",
      "--autocomplete__input__font-size": "15px",
      "--autocomplete__input__height": "50px",
      "--autocomplete__dropdown-arrow-down__top": "16px",
      "--autocomplete__dropdown-arrow-down__z-index": "2",
      "--autocomplete__option__font-size": "15px",
      "--autocomplete__option__padding": "6px 12px 7px 12px",
      "--autocomplete__menu__max-height": "336px",
      "--autocomplete__option__border-bottom": `solid 1px ${theme.palette.grey[800]}`,
      "--autocomplete__option__hover-border-color": theme.palette.primary.main,
      "--autocomplete__option__hover-background-color":
        theme.palette.primary.main,
      "--autocomplete__font-family": theme.typography.fontFamily,
    },
  }));
  const classes = useStyles();

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
      <Box className={classes.autocomplete}>
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
            osPlacesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          />
        )}
      </Box>
      <ExternalPlanningSiteDialog
        purpose={DialogPurpose.MissingAddress}
        teamSettings={props.teamSettings}
      ></ExternalPlanningSiteDialog>
    </Card>
  );
}

interface Option extends Address {
  title: string;
}

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
  constraint: {
    borderLeft: `3px solid rgba(0,0,0,0.3)`,
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
  },
  propertyDetail: {
    display: "flex",
    justifyContent: "flex-start",
    borderBottom: `1px solid ${theme.palette.background.paper}`,
  },
}));

export function PropertyInformation(props: any) {
  const {
    title,
    description,
    propertyDetails,
    lat,
    lng,
    handleSubmit,
    team,
    teamColor,
    error,
  } = props;
  const styles = useClasses();
  const formik = useFormik({
    initialValues: {
      feedback: "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(values.feedback, {
          reason: "Inaccurate property details",
          property: propertyDetails,
        });
      }
      handleSubmit?.();
    },
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <Box className={styles.map}>
        <p style={visuallyHidden}>
          A static map centered on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="property-information-map"
          zoom={19.5}
          latitude={lat}
          longitude={lng}
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          hideResetControl
          showFeaturesAtPoint
          osFeaturesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          featureColor={teamColor}
          featureFill
        />
      </Box>
      <Box component="dl" mb={3}>
        {propertyDetails.map(({ heading, detail }: any) => (
          <Box className={styles.propertyDetail} key={heading}>
            <Box component="dt" fontWeight={700} flex={"0 0 35%"} py={1}>
              {heading}
            </Box>
            <Box component="dd" flexGrow={1} py={1}>
              {detail}
            </Box>
          </Box>
        ))}
      </Box>
      {error && team?.name && (
        <Box role="status">
          <Typography variant="body1" color="error">
            This address may not be in {capitalize(team.name)}, are you sure you
            want to continue using this service?
          </Typography>
        </Box>
      )}
      <Box color="text.secondary" textAlign="right">
        <CollapsibleInput
          handleChange={formik.handleChange}
          name="feedback"
          value={formik.values.feedback}
        >
          <Typography variant="body2" color="inherit">
            Report an inaccuracy
          </Typography>
        </CollapsibleInput>
      </Box>
    </Card>
  );
}
