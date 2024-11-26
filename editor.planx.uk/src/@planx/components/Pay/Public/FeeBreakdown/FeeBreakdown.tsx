import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { formattedPriceWithCurrencySymbol } from "../../model";

const StyledTable = styled(Table)(() => ({
  [`& .${tableCellClasses.root}`]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const BoldTableRow = styled(TableRow)(() => ({
  [`& .${tableCellClasses.root}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

const VAT_RATE = 20;

const DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const Header = () => (
  <TableHead>
    <BoldTableRow>
      <TableCell>Description</TableCell>
      <TableCell align="right">Amount</TableCell>
    </BoldTableRow>
  </TableHead>
);

const ApplicationFee = () => (
  <TableRow>
    <TableCell>Application fee</TableCell>
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
  <BoldTableRow>
    <TableCell>Total</TableCell>
    <TableCell align="right">{formattedPriceWithCurrencySymbol(80)}</TableCell>
  </BoldTableRow>
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
        <StyledTable data-testid="fee-breakdown-table">
          <Header />
          <TableBody>
            <ApplicationFee />
            <ServiceCharge />
            <Exemptions />
            <Reductions />
            <VAT />
            <Total />
          </TableBody>
        </StyledTable>
      </TableContainer>
    </Box>
  );
};
