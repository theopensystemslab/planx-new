import Box from "@material-ui/core/Box";
import React from "react";

import { propertyDetailStyles } from "./styles";

const PropertyDetail = ({ heading, detail, ...props }: any) => {
  const classes = propertyDetailStyles();
  return (
    <Box className={classes.propertyDetail} {...props}>
      <Box fontWeight={700} flex={"0 0 35%"} py={1}>
        {heading}
      </Box>
      <Box flexGrow={1} py={1}>
        {detail}
      </Box>
    </Box>
  );
};
export default PropertyDetail;
