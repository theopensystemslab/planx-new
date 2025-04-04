import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { FeeBreakdown as IFeeBreakdown } from "@opensystemslab/planx-core/types";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { formattedPriceWithCurrencySymbol } from "../../model";
import { useFeeBreakdown } from "./useFeeBreakdown";

const StyledTable = styled(Table)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
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

type FeeBreakdownRow = React.FC<IFeeBreakdown>;

const Header: FeeBreakdownRow = ({ amount }) => (
  <TableHead>
    <BoldTableRow>
      <TableCell>Description</TableCell>
      <TableCell align="right">Amount</TableCell>
      {amount.payableVAT && (
        <TableCell align="right" sx={{ color: "GrayText" }}>
          VAT (20%)
        </TableCell>
      )}
    </BoldTableRow>
  </TableHead>
);

const ApplicationFee: FeeBreakdownRow = ({ amount }) => (
  <TableRow>
    <TableCell>Application fee</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount.calculated)}
    </TableCell>
    {amount.payableVAT && (
      <TableCell align="right" sx={{ color: "GrayText" }}>
        {amount.calculatedVAT
          ? formattedPriceWithCurrencySymbol(amount.calculatedVAT)
          : undefined}
      </TableCell>
    )}
  </TableRow>
);

const Reductions: FeeBreakdownRow = ({ amount, reductions }) => {
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
        <TableRow key={reduction}>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "GrayText", textTransform: "capitalize" }}>
              {reduction}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

/* TODO: Parse exemption descriptions from schema */
const Exemptions: FeeBreakdownRow = ({ exemptions, amount }) => {
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
        <TableRow key={exemption}>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 2, color: "GrayText", textTransform: "capitalize" }}>
              {exemption}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const FastTrackFee: FeeBreakdownRow = ({ amount }) => {
  if (!amount.fastTrack || !amount.fastTrackVAT) return null;

  return (
    <TableRow>
      <TableCell>Fast Track fee</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.fastTrack)}
      </TableCell>
      <TableCell align="right" sx={{ color: "GrayText" }}>
        {formattedPriceWithCurrencySymbol(amount.fastTrackVAT)}
      </TableCell>
    </TableRow>
  );
};

const ServiceCharge: FeeBreakdownRow = ({ amount }) => {
  if (!amount.serviceCharge || !amount.serviceChargeVAT) return null;

  return (
    <TableRow>
      <TableCell>Service charge</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.serviceCharge)}
      </TableCell>
      <TableCell align="right" sx={{ color: "GrayText" }}>
        {formattedPriceWithCurrencySymbol(amount.serviceChargeVAT)}
      </TableCell>
    </TableRow>
  );
};

const PaymentProcessingFee: FeeBreakdownRow = ({ amount }) => {
  if (!amount.paymentProcessing || !amount.paymentProcessingVAT) return null;

  return (
    <TableRow>
      <TableCell>Payment processing fee</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.paymentProcessing)}
      </TableCell>
      <TableCell align="right" sx={{ color: "GrayText" }}>
        {formattedPriceWithCurrencySymbol(amount.paymentProcessingVAT)}
      </TableCell>
    </TableRow>
  );
};

const Total: FeeBreakdownRow = ({ amount }) => (
  <BoldTableRow>
    <TableCell>Total{amount.payableVAT && ` (including VAT)`}</TableCell>
    <TableCell align="right">
      {formattedPriceWithCurrencySymbol(amount.payable)}
    </TableCell>
    <TableCell></TableCell>
    {/* {amount.payableVAT && (
      <TableCell align="right" sx={{ color: "GrayText" }}>
        {formattedPriceWithCurrencySymbol(amount.payableVAT)}
      </TableCell>
    )} */}
  </BoldTableRow>
);

export const FeeBreakdown: React.FC<{
  inviteToPayFeeBreakdown?: IFeeBreakdown;
}> = ({ inviteToPayFeeBreakdown }) => {
  const breakdown = useFeeBreakdown(inviteToPayFeeBreakdown);
  if (!breakdown) return null;

  return (
    <TableContainer sx={{ mt: 3 }}>
      <StyledTable data-testid="fee-breakdown-table">
        <Header {...breakdown} />
        <TableBody>
          <ApplicationFee {...breakdown} />
          <Reductions {...breakdown} />
          <Exemptions {...breakdown} />
          <FastTrackFee {...breakdown} />
          <ServiceCharge {...breakdown} />
          <PaymentProcessingFee {...breakdown} />
          <Total {...breakdown} />
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
