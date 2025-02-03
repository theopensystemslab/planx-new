import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { FeeBreakdown as IFeeBreakdown } from "@opensystemslab/planx-core/types";
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

type FeeBreakdownSection = React.FC<IFeeBreakdown>;

const Header = () => (
  <TableHead>
    <BoldTableRow>
      <TableCell>Description</TableCell>
      <TableCell align="right">Amount</TableCell>
    </BoldTableRow>
  </TableHead>
);

const ApplicationFee: FeeBreakdownSection = ({ amount }) => (
  <TableRow>
    <TableCell>Application fee</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount.calculated)}
    </TableCell>
  </TableRow>
);

const Reductions: FeeBreakdownSection = ({ amount, reductions }) => {
  if (!amount.reduction) return null;

  return (
    <>
      <TableRow>
        <TableCell>Reductions</TableCell>
        <TableCell align="right">
          {formattedPriceWithCurrencySymbol(-amount.reduction)}
        </TableCell>
      </TableRow>
      {reductions.map((reduction) => (
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "grey" }}>{reduction}</Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

/* TODO: Parse exemption descriptions from schema */
const Exemptions: FeeBreakdownSection = ({ exemptions, amount }) => {
  if (!amount.exemption) return null;

  return (
    <>
      <TableRow>
        <TableCell>Exemptions</TableCell>
        <TableCell align="right">
          {formattedPriceWithCurrencySymbol(-amount.exemption)}
        </TableCell>
      </TableRow>
      {exemptions.map((exemption) => (
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "grey", textTransform: "capitalize" }}>
              {exemption}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const VAT: FeeBreakdownSection = ({ amount }) => {
  if (!amount.vat) return null;

  return (
    <TableRow>
      <TableCell variant="footer">{`Includes VAT (${
        VAT_RATE * 100
      }%)`}</TableCell>
      <TableCell variant="footer" align="right">
        {formattedPriceWithCurrencySymbol(amount.vat)}
      </TableCell>
    </TableRow>
  );
};

const Total: FeeBreakdownSection = ({ amount }) => (
  <BoldTableRow>
    <TableCell>Total</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount.payable)}
    </TableCell>
  </BoldTableRow>
);

export const FeeBreakdown: React.FC<{
  inviteToPayFeeBreakdown?: IFeeBreakdown;
}> = ({ inviteToPayFeeBreakdown }) => {
  const passportFeeBreakdown = useFeeBreakdown();
  const breakdown = passportFeeBreakdown || inviteToPayFeeBreakdown;
  if (!breakdown) return null;

  return (
    <Box mt={3}>
      <Typography variant="h3" mb={1}>
        Fee
      </Typography>
      <Typography variant="body1" mb={2}>
        {DESCRIPTION}
      </Typography>
      <TableContainer>
        <StyledTable data-testid="fee-breakdown-table">
          <Header />
          <TableBody>
            <ApplicationFee {...breakdown} />
            <Reductions {...breakdown} />
            <Exemptions {...breakdown} />
            <Total {...breakdown} />
            <VAT {...breakdown} />
          </TableBody>
        </StyledTable>
      </TableContainer>
    </Box>
  );
};
