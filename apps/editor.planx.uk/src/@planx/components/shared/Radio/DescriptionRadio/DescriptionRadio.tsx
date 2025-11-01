import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio, { RadioProps } from "@mui/material/Radio";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { Response } from "../..";

export interface Props extends Response {
  onChange: RadioProps["onChange"];
}

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(1),
  cursor: "pointer",
}));

const DescriptionRadio: React.FC<Props> = ({
  text,
  description,
  onChange,
  id,
}) => {
  return (
    <StyledFormLabel focused={false}>
      <Radio value={id} onChange={onChange} />
      <Box>
        <Typography color="text.primary" variant="body1" pt={0.95}>
          {text}
        </Typography>
        <Typography variant="body2" pt={0.5}>
          {description}
        </Typography>
      </Box>
    </StyledFormLabel>
  );
};

export default DescriptionRadio;
