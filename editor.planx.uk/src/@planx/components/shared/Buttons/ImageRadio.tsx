import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import React from "react";

export interface RadioProps {
  id?: string;
  responseKey?: string | number;
  title: string;
  description?: string;
  onChange:
    | ((event: React.SyntheticEvent<Element, Event>, checked: boolean) => void)
    | undefined;
}

const ImageRadio: React.FC<RadioProps> = ({
  responseKey,
  title,
  description,
  ...props
}) => {
  return (
    <Box>
      <FormControlLabel
        value={props.id}
        onChange={props.onChange}
        control={<Radio />}
        label={title}
      />
      {Boolean(description) && (
        <Typography
          variant="body2"
          // className={classes.subtitle}
          // id={descriptionId}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default ImageRadio;
