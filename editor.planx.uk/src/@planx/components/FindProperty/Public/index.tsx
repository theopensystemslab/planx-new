import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Card from "@planx/components/shared/Preview/Card";
import FormInput from "@planx/components/shared/Preview/FormInput";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import useAxios from "axios-hooks";
import natsort from "natsort";
import { handleSubmit } from "pages/Preview/Node";
import { parse, toNormalised } from "postcode";
import React from "react";

import Map from "./Map";

const sorter = natsort({ insensitive: true });

const AddressList: React.FC<{
  postcode: string;
  handleSubmit: handleSubmit;
}> = ({ postcode, handleSubmit }) => {
  const [{ data }] = useAxios(
    `https://llpg.planx.uk/addresses?limit=100&postcode=eq.${escape(postcode)}`
  );

  if (!data) return null;

  const options = data.map((address: any) => ({
    title: [
      address.sao,
      [address.pao, address.street].filter(Boolean).join(" "),
      address.town,
    ]
      .filter(Boolean)
      .join(", "),
    uprn: address.UPRN,
  }));

  return (
    <Autocomplete
      options={options.sort((a: any, b: any) => sorter(a.title, b.title))}
      getOptionLabel={(option: any) => option.title}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Address"
          variant="outlined"
          style={{ marginTop: 20 }}
          autoFocus
        />
      )}
      onChange={(_e, option) => {
        handleSubmit(option);
      }}
    />
  );
};

const FindProperty = ({ handleSubmit: handleSubmit }) => {
  const [boundary, setBoundary] = React.useState(null);
  const [useMap, setUseMap] = React.useState(false);
  const [postcode, setPostcode] = React.useState("");
  const [address, setAddress] = React.useState(undefined);
  const [validPostcode, setValidPostcode] = React.useState(false);

  return (
    <Card
      handleSubmit={() => handleSubmit((address as any).uprn)}
      isValid={!!address}
    >
      <QuestionHeader
        title="Find the property"
        description={
          useMap ? "Please select the property or draw its boundary" : ""
        }
      />
      {useMap ? (
        <Box>
          <Map
            zoom={17.5}
            lat={51.2754385}
            lng={1.0848595}
            setBoundary={(val: any) => setBoundary(val)}
          />

          {boundary && (
            <>
              <Box mb={3}>
                The boundary you have drawn is{" "}
                <strong>
                  {(boundary as any).area}m<sup>2</sup>
                </strong>
              </Box>
              <Button variant="contained" size="large" color="primary">
                Continue
              </Button>
            </>
          )}
        </Box>
      ) : (
        <>
          <Box pb={2}>
            <FormInput
              placeholder="Enter the postcode of the property"
              value={postcode}
              onChange={(e: any) => {
                const postcode = parse(e.target.value);
                if (postcode.valid) {
                  setValidPostcode(true);
                  setPostcode(toNormalised(e.target.value) as string);
                } else {
                  setValidPostcode(false);
                  setPostcode(e.target.value.toUpperCase());
                }
              }}
            />
            {validPostcode && (
              <AddressList postcode={postcode} handleSubmit={setAddress} />
            )}
          </Box>

          <Box pb={2} color="text.primary">
            <a
              href="!#"
              style={{ color: "inherit" }}
              onClick={(e) => {
                e.preventDefault();
                setUseMap(true);
              }}
            >
              Find the property on a map
            </a>
          </Box>
        </>
      )}
    </Card>
  );
};
export default FindProperty;
