import { FormLabel, RadioProps, styled } from "@material-ui/core";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import React from "react";

export interface Props {
  id?: string;
  title: string;
  description?: string;
  onChange: RadioProps["onChange"];
}

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  border: "2px lightgray solid",
  padding: theme.spacing(1.5),
  cursor: "pointer",
  display: "block",
  height: "100%",
}));

const ImageRadio: React.FC<Props> = ({ title, description, onChange, id }) => (
  <StyledFormLabel>
    <img
      src="https://placedog.net/250/250"
      width="120"
      height="90"
      alt="HTML Dog"
    />
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Radio value={id} onChange={onChange} />
      <Typography>{title}</Typography>
    </Box>
    {description && <Typography variant="body2">{description}</Typography>}
  </StyledFormLabel>
);

export default ImageRadio;
