import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React from "react";
import ReactHtmlParser from "react-html-parser";

import Constraint from "./Constraint";
import SimpleExpand from "./SimpleExpand";

const PropertyConstraints = ({ constraintsData }: any) => {
  const { title, constraints } = constraintsData;
  const visibleConstraints = constraints
    .filter((x: any, i: number) => i < 3)
    .map((con: any) => (
      <Constraint key={con.text} color={con.color || ""}>
        {ReactHtmlParser(con.text)}
      </Constraint>
    ));
  const hiddenConstraints = constraints
    .filter((x: any, i: number) => i >= 3)
    .map((con: any) => (
      <Constraint key={con.text} color={con.color || ""}>
        {ReactHtmlParser(con.text)}
      </Constraint>
    ));

  return (
    <Box mb={3}>
      <Box pb={2}>
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
      </Box>
      {visibleConstraints}
      <SimpleExpand buttonText={{ open: "Show all", closed: "Show less" }}>
        {hiddenConstraints}
      </SimpleExpand>
    </Box>
  );
};
export default PropertyConstraints;
