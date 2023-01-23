import { useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import find from "lodash/find";
import { parse, toNormalised } from "postcode";
import React, { useEffect, useState } from "react";
import { TeamSettings } from "types";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";

import { DEFAULT_TITLE, SiteAddress } from "../model";
import { FETCH_BLPU_CODES } from ".";

interface PickOSAddressProps {
  title?: string;
  description?: string;
  allowNewAddresses?: boolean;
  initialPostcode?: string;
  initialSelectedAddress?: SiteAddress;
  teamSettings?: TeamSettings;
  id?: string;
  setAddress: React.Dispatch<React.SetStateAction<SiteAddress | undefined>>;
  setPage: React.Dispatch<React.SetStateAction<"os-address" | "new-address">>;
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

export default function PickOSAddress(props: PickOSAddressProps) {
  const [postcode, setPostcode] = useState<string | null>(
    props.initialPostcode ?? null
  );
  const [sanitizedPostcode, setSanitizedPostcode] = useState<string | null>(
    (props.initialPostcode && toNormalised(props.initialPostcode.trim())) ??
      null
  );
  const [selectedOption, setSelectedOption] = useState<SiteAddress | undefined>(
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
          source: "os",
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
      {!props.allowNewAddresses ? (
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
