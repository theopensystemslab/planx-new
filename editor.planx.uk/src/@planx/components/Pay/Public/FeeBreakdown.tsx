import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { formattedPriceWithCurrencySymbol } from "../model";

const VAT_RATE = 20;

const DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const Header = () => (
  <TableHead>
    <TableRow>
      <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        Description
      </TableCell>
      <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }} align="right">
        Amount
      </TableCell>
    </TableRow>
  </TableHead>
);

const PlanningFee = () => (
  <TableRow>
    <TableCell>Planning fee</TableCell>
    <TableCell align="right">{formattedPriceWithCurrencySymbol(100)}</TableCell>
  </TableRow>
);

const Exemptions = () => (
  <TableRow>
    <TableCell>Exemptions</TableCell>
    <TableCell align="right">{formattedPriceWithCurrencySymbol(-20)}</TableCell>
  </TableRow>
);

const Reductions = () => (
  <TableRow>
    <TableCell>Reductions</TableCell>
    <TableCell align="right">{formattedPriceWithCurrencySymbol(-30)}</TableCell>
  </TableRow>
);

const ServiceCharge = () => (
  <TableRow>
    <TableCell>Service charge</TableCell>
    <TableCell align="right">{formattedPriceWithCurrencySymbol(30)}</TableCell>
  </TableRow>
);

const VAT = () => (
  <TableRow>
    <TableCell>{`VAT (${VAT_RATE}%)`}</TableCell>
    <TableCell align="right">-</TableCell>
  </TableRow>
);

const Total = () => (
  <TableRow>
    <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>Total</TableCell>
    <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }} align="right">
      {formattedPriceWithCurrencySymbol(50)}
    </TableCell>
  </TableRow>
);

export const FeeBreakdown: React.FC = () => {
  if (!hasFeatureFlag("FEE_BREAKDOWN")) return null;

  return (
    <Box mt={3}>
      <Typography variant="h3" mb={1}>
        Fee breakdown
      </Typography>
      <Typography variant="body1" mb={2}>
        {DESCRIPTION}
      </Typography>
      <TableContainer>
        <Table data-testid="fee-breakdown-table">
          <Header />
          <TableBody>
            <PlanningFee />
            <ServiceCharge />
            <Exemptions />
            <Reductions />
            <VAT />
            <Total />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
