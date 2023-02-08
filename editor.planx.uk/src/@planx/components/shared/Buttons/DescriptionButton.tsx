import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export interface Props extends ButtonProps {
  id?: string;
  responseKey: string | number;
  title: string;
  description?: string;
}

export default function DescriptionButton(props: Props) {
  const { title, description } = props;
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef<HTMLDivElement>();
  // rerender component on windowSize change
  useWindowSize();

  useEffect(() => {
    setButtonWidth(buttonRef.current?.offsetWidth || 0);
  });

  return (
    <ButtonBase {...props}>
      <Box
        ref={buttonRef}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        height="100%"
        minHeight={buttonWidth}
        width="100%"
        position="relative"
        p={2}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          pb={1}
        >
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography align="left" variant="body2">
          {description}
        </Typography>
      </Box>
    </ButtonBase>
  );
}
