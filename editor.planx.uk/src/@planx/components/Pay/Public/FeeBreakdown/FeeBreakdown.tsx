import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { formattedPriceWithCurrencySymbol } from "../../model";
import { useFeeBreakdown } from "./useFeeBreakdown";

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

const VAT_RATE = 0.2;

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

const ApplicationFee: React.FC<{ amount: number }> = ({ amount }) => (
  <TableRow>
    <TableCell>Application fee</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount)}
    </TableCell>
  </TableRow>
);

const Reductions: React.FC<{ amount?: number, reductions: string[] }> = ({ amount, reductions }) => {
  if (!amount) return null;

  return (
    <>
    <TableRow>
      <TableCell>Reductions</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(-amount)}
      </TableCell>
    </TableRow>
    {
      reductions.map((reduction) => (
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "grey" }}>{reduction}</Box>
          </TableCell>
        </TableRow>
      ))
    }
    </>
  );
};

// TODO: This won't show as if a fee is 0, we hide the whole Pay component from the user
const Exemptions: React.FC<{ amount: number, exemptions: string[] }> = ({ amount, exemptions }) => {
  if (!exemptions.length) return null;

  return (
    <>
    <TableRow>
      <TableCell>Exemptions</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(-amount)}
      </TableCell>
    </TableRow>
    {
        exemptions.map((exemption) => (
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "grey" }}>{exemption}</Box>
          </TableCell>
        </TableRow>
      ))
    }
    </>
  );
};

const VAT: React.FC<{ amount?: number }> = ({ amount }) => {
  if (!amount) return null;

  return (
    <TableRow>
      <TableCell variant="footer">{`Includes VAT (${
        VAT_RATE * 100
      }%)`}</TableCell>
      <TableCell variant="footer" align="right">
        {formattedPriceWithCurrencySymbol(amount)}
      </TableCell>
    </TableRow>
  );
};

const Total: React.FC<{ amount: number }> = ({ amount }) => (
  <BoldTableRow>
    <TableCell>Total</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount)}
    </TableCell>
  </BoldTableRow>
);

export const FeeBreakdown: React.FC = () => {
  const breakdown = useFeeBreakdown();
  if (!breakdown) return null;

  const { amount, reductions, exemptions } = breakdown;

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
            <ApplicationFee amount={amount.calculated} />
            <Reductions amount={amount.reduction} reductions={reductions}/>
            <Exemptions amount={amount.payable} exemptions={exemptions}/>
            <Total amount={amount.payable} />
            <VAT amount={amount.vat} />
          </TableBody>
        </StyledTable>
      </TableContainer>
    </Box>
  );
};
