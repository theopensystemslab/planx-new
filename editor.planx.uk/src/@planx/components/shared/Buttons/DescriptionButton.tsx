import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React from "react";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

interface Props extends ButtonProps {
  responseKey: string | number;
  title: string;
  description?: string;
}

export default function DescriptionButton(props: Props) {
  const { responseKey, title, description } = props;

  return (
    <ButtonBase {...props}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        height={0}
        width="100%"
        pt="100%"
        position="relative"
      >
        <Box position="absolute" top={0} left={0} width="100%" p={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            pb={1}
          >
            <Typography variant="h6">{title}</Typography>
            {responseKey && (
              <Typography variant="body2">
                {String(responseKey).toUpperCase()}
              </Typography>
            )}
          </Box>
          <Typography align="left" variant="body2">
            {description}
          </Typography>
        </Box>
      </Box>
    </ButtonBase>
  );
}
