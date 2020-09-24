import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import React from "react";

interface IResultReason {
  children: (string | Element)[];
}

const ResultReason: React.FC<IResultReason> = ({ children }) => {
  return (
    <Box
      bgcolor="background.paper"
      display="flex"
      alignItems="flex-start"
      mb={0.5}
    >
      <Box px={1.5} py={1} flexGrow={1}>
        {children}
      </Box>
      <Box color="text.secondary">
        <Button color="inherit">change</Button>
      </Box>
    </Box>
  );
};
export default ResultReason;
