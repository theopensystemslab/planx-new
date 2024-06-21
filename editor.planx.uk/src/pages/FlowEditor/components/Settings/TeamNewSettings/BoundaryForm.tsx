import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, useState } from "react";
import EditorRow from "ui/editor/EditorRow";
import InputDescription from "ui/editor/InputDescription";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { NewSettingsForm } from "./newSettingsForm";

export default function BoundaryForm() {
  const [boundaryState, setBoundaryState] = useState("");

  const boundaryOriginal = (
    <EditorRow
      background
      children={
        <>
          <InputGroup flowSpacing>
            <InputLegend>Boundary</InputLegend>
            <InputDescription>
              The boundary URL is used to retrieve the outer boundary of your
              council area. This can then help users define whether they are
              within your council area.
              <br />
              <br />
              The boundary should be given as a link from:{" "}
              <a
                href="https://www.planning.data.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.planning.data.gov.uk/
              </a>
            </InputDescription>
          </InputGroup>
          <InputGroup flowSpacing>
            <Typography mr={2} variant="body2" component="label">
              Boundary URL
            </Typography>
            <InputRow>
              <InputRowItem>
                <RichTextInput
                  name="boundary"
                  value={boundaryState}
                  onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                    setBoundaryState(ev.target.value);
                  }}
                />
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </>
      }
    />
  );

  const newBoundary = (
    <NewSettingsForm
      legend="Boundary"
      description={
        <InputDescription>
          The boundary URL is used to retrieve the outer boundary of your
          council area. This can then help users define whether they are within
          your council area.
          <br />
          <br />
          The boundary should be given as a link from:{" "}
          <a
            href="https://www.planning.data.gov.uk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.planning.data.gov.uk/
          </a>
        </InputDescription>
      }
      input={
        <>
          <InputRow>
            <InputRowLabel>Logo:</InputRowLabel>
            <RichTextInput
              name="boundary"
              value={boundaryState}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                setBoundaryState(ev.target.value);
              }}
            />
          </InputRow>
        </>
      }
    />
  );
  return newBoundary;
}
