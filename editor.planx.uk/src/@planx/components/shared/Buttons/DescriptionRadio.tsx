import { FormLabel, styled } from "@material-ui/core";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useRadioGroup } from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export interface Props {
  id?: string;
  responseKey: string | number;
  title: string;
  description?: string;
  onChange:
    | ((event: React.SyntheticEvent<Element, Event>, checked: boolean) => void)
    | undefined;
}

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  backgroundColor: "yellow",
  display: "block",
  cursor: "pointer",
}));

export default function DescriptionRadio(props: Props) {
  const { title, description } = props;
  const radio = useRadioGroup();

  return (
    <StyledFormLabel>
      {title}
      <Radio value={props.id} onChange={props.onChange} />
      {description}
    </StyledFormLabel>
  );
}
