import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio, { RadioProps } from "@mui/material/Radio";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

export interface Props {
  id?: string;
  title: string;
  description?: string;
  onChange: RadioProps["onChange"];
}

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  // Missing logic for border change when selected
  border: `2px solid ${theme.palette.secondary.main}`,
  padding: theme.spacing(1.5),
  cursor: "pointer",
  display: "block",
  height: "100%",
  color: theme.palette.text.primary,
  "& > p": {
    color: theme.palette.text.secondary,
  },
}));

const DescriptionRadio: React.FC<Props> = ({
  title,
  description,
  onChange,
  id,
}) => (
  <StyledFormLabel focused={false}>
    <Box sx={{ paddingBottom: 1, display: "flex", alignItems: "center" }}>
      <Radio value={id} onChange={onChange} />
      <Typography variant="body1">{title}</Typography>
    </Box>
    <Typography variant="body2">{description}</Typography>
  </StyledFormLabel>
);

export default DescriptionRadio;
