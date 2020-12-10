import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React from "react";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

interface Props extends ButtonProps {
  response: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  };
}

export default function DescriptionButton(props: Props) {
  const { response } = props;

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
            <Typography variant="h6">{response.title}</Typography>
            <Typography variant="body2">
              {response.responseKey.toUpperCase()}
            </Typography>
          </Box>
          <Typography align="left" variant="body2">
            {response.description}
          </Typography>
        </Box>
      </Box>
    </ButtonBase>
  );
}
