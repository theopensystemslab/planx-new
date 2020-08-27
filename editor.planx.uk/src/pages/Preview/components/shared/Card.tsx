import Box from "@material-ui/core/Box";
import React from "react";

const Card: React.FC<any> = ({ children, ...props }) => {
  return (
    <Box
      bgcolor="background.default"
      py={{ xs: 2, md: 4 }}
      px={{ xs: 2, md: 5 }}
      mb={4}
      width="100%"
      maxWidth={768}
      {...props}
    >
      {children}
    </Box>
  );
};
export default Card;
