import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React, { useRef } from "react";
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
  const buttonRef = useRef<HTMLDivElement>();
  // rerender component on windowSize change
  useWindowSize();

  return (
    <ButtonBase {...props}>
      <Box
        // @ts-ignore-next-line - material ui did not include `ref` to the types definition
        ref={buttonRef}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        height="100%"
        minHeight={buttonRef.current?.offsetWidth}
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
