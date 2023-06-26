import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio, { RadioProps } from "@mui/material/Radio";
import { useRadioGroup } from "@mui/material/RadioGroup";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

export interface Props {
  id?: string;
  title: string;
  description?: string;
  onChange: RadioProps["onChange"];
}

interface StyledFormLabelProps {
  isSelected: boolean;
}

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<StyledFormLabelProps>(({ theme, isSelected }) => ({
  border: "2px solid",
  borderColor: isSelected
    ? theme.palette.primary.main
    : theme.palette.secondary.main,
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
}) => {
  const radioGroupState = useRadioGroup();
  const isSelected = radioGroupState?.value === id;

  return (
    <StyledFormLabel focused={false} isSelected={isSelected}>
      <Box sx={{ paddingBottom: 1, display: "flex", alignItems: "center" }}>
        <Radio value={id} onChange={onChange} />
        <Typography variant="body1">{title}</Typography>
      </Box>
      <Typography variant="body2">{description}</Typography>
    </StyledFormLabel>
  );
};

export default DescriptionRadio;
