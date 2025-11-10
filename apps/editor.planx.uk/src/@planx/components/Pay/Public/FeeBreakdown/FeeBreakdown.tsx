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

type FeeBreakdownRow = React.FC<IFeeBreakdown>;

// TODO - Eventually read these from ODP JSON Schema
const exemptionsReductionLookup: Record<string, string> = {
  resubmission: "Resubmission",
  disability: "Access for disabled persons",
  demolition: "Relevant demolition in a conservation area",
  parishCouncil: "Parish or community council",
  alternative: "Alternative proposal",
  sports: "Sports club",
  local: "Local",
};

// FeeBreakdown table displays 2 or 4 columns depending if VAT-able line items
function showAdditionalVATColumns(amount: IFeeBreakdown["amount"]): boolean {
  return amount.payableVAT > 0 || amount.calculatedVAT ? true : false;
}

const Header: FeeBreakdownRow = ({ amount }) => (
  <TableHead>
    <BoldTableRow>
      <TableCell>Description</TableCell>
      <TableCell align="right">
        Amount {amount.payableVAT > 0 ? ` (excl VAT)` : ``}
      </TableCell>
      {showAdditionalVATColumns(amount) && (
        <>
          <TableCell
            align="right"
            sx={(theme) => ({ color: theme.palette.text.secondary })}
          >
            VAT (20%)
          </TableCell>
          <TableCell align="right">
            <strong>Total</strong>
          </TableCell>
        </>
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
    {showAdditionalVATColumns(amount) && (
      <>
        <TableCell
          align="right"
          sx={(theme) => ({ color: theme.palette.text.secondary })}
        >
          {amount.calculatedVAT > 0
            ? formattedPriceWithCurrencySymbol(amount.calculatedVAT)
            : undefined}
        </TableCell>
        <TableCell align="right">
          <strong>
            {amount.calculatedVAT > 0
              ? formattedPriceWithCurrencySymbol(
                  amount.calculated + amount.calculatedVAT,
                )
              : formattedPriceWithCurrencySymbol(amount.calculated)}
          </strong>
        </TableCell>
      </>
    )}
  </TableRow>
);

const Reductions: FeeBreakdownRow = ({ amount, reductions }) => {
  if (reductions.length === 0) return null;

  return (
    <>
      <TableRow>
        <TableCell>
          {amount.reduction > 0 ? `Modifications` : `Reductions`}
        </TableCell>
        <TableCell align="right">
          {formattedPriceWithCurrencySymbol(amount.reduction)}
        </TableCell>
        {showAdditionalVATColumns(amount) && (
          <>
            <TableCell
              align="right"
              sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
              {amount.reductionVAT !== 0
                ? formattedPriceWithCurrencySymbol(amount.reductionVAT)
                : ``}
            </TableCell>
            <TableCell align="right">
              <strong>
                {amount.reductionVAT !== 0
                  ? formattedPriceWithCurrencySymbol(
                      amount.reduction + amount.reductionVAT,
                    )
                  : formattedPriceWithCurrencySymbol(amount.reduction)}
              </strong>
            </TableCell>
          </>
        )}
      </TableRow>
      {reductions.map((reduction) => (
        <TableRow key={reduction}>
          <TableCell colSpan={amount.payableVAT ? 4 : 2}>
            <Box
              sx={(theme) => ({
                pl: theme.spacing(2),
                color: theme.palette.text.secondary,
              })}
            >
              {exemptionsReductionLookup[reduction]}
            </Box>
          </TableCell>
          {showAdditionalVATColumns(amount) && (
            <>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </>
          )}
        </TableRow>
      ))}
    </>
  );
};

const Exemptions: FeeBreakdownRow = ({ exemptions, amount }) => {
  if (exemptions.length === 0) return null;

  return (
    <>
      <TableRow>
        <TableCell>Exemptions</TableCell>
        <TableCell align="right">
          {formattedPriceWithCurrencySymbol(amount.exemption)}
        </TableCell>
        {showAdditionalVATColumns(amount) && (
          <>
            <TableCell
              align="right"
              sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
              {amount.exemptionVAT !== 0
                ? formattedPriceWithCurrencySymbol(amount.exemptionVAT)
                : ``}
            </TableCell>
            <TableCell align="right">
              <strong>
                {amount.exemptionVAT !== 0
                  ? formattedPriceWithCurrencySymbol(
                      amount.exemption + amount.exemptionVAT,
                    )
                  : formattedPriceWithCurrencySymbol(amount.exemption)}
              </strong>
            </TableCell>
          </>
        )}
      </TableRow>
      {exemptions.map((exemption) => (
        <TableRow key={exemption}>
          <TableCell colSpan={amount.payableVAT ? 4 : 2}>
            <Box
              sx={(theme) => ({
                pl: theme.spacing(2),
                color: theme.palette.text.secondary,
              })}
            >
              {exemptionsReductionLookup[exemption]}
            </Box>
          </TableCell>
          {showAdditionalVATColumns(amount) && (
            <>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </>
          )}
        </TableRow>
      ))}
    </>
  );
};

const FastTrackFee: FeeBreakdownRow = ({ amount }) => {
  if (!amount.fastTrack || !amount.fastTrackVAT) return null;

  // Always VAT-able
  return (
    <TableRow>
      <TableCell>Fast Track fee</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.fastTrack)}
      </TableCell>
      <TableCell
        align="right"
        sx={(theme) => ({ color: theme.palette.text.secondary })}
      >
        {formattedPriceWithCurrencySymbol(amount.fastTrackVAT)}
      </TableCell>
      <TableCell align="right">
        <strong>
          {formattedPriceWithCurrencySymbol(
            amount.fastTrack + amount.fastTrackVAT,
          )}
        </strong>
      </TableCell>
    </TableRow>
  );
};

const ServiceCharge: FeeBreakdownRow = ({ amount }) => {
  if (!amount.serviceCharge || !amount.serviceChargeVAT) return null;

  // Always VAT-able
  return (
    <TableRow>
      <TableCell>Service charge</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.serviceCharge)}
      </TableCell>
      <TableCell
        align="right"
        sx={(theme) => ({ color: theme.palette.text.secondary })}
      >
        {formattedPriceWithCurrencySymbol(amount.serviceChargeVAT)}
      </TableCell>
      <TableCell align="right">
        <strong>
          {formattedPriceWithCurrencySymbol(
            amount.serviceCharge + amount.serviceChargeVAT,
          )}
        </strong>
      </TableCell>
    </TableRow>
  );
};

const PaymentProcessingFee: FeeBreakdownRow = ({ amount }) => {
  if (!amount.paymentProcessing || !amount.paymentProcessingVAT) return null;

  // Always VAT-able
  return (
    <TableRow>
      <TableCell>Payment processing fee (1%)</TableCell>
      <TableCell align="right">
        {formattedPriceWithCurrencySymbol(amount.paymentProcessing)}
      </TableCell>
      <TableCell
        align="right"
        sx={(theme) => ({ color: theme.palette.text.secondary })}
      >
        {formattedPriceWithCurrencySymbol(amount.paymentProcessingVAT)}
      </TableCell>
      <TableCell align="right">
        <strong>
          {formattedPriceWithCurrencySymbol(
            amount.paymentProcessing + amount.paymentProcessingVAT,
          )}
        </strong>
      </TableCell>
    </TableRow>
  );
};

const Total: FeeBreakdownRow = ({ amount }) => (
  <BoldTableRow>
    <TableCell>Total</TableCell>
    <TableCell align="right">
      {amount.payableVAT > 0
        ? formattedPriceWithCurrencySymbol(amount.payable - amount.payableVAT)
        : formattedPriceWithCurrencySymbol(amount.payable)}
    </TableCell>
    {showAdditionalVATColumns(amount) && (
      <>
        <TableCell
          align="right"
          sx={(theme) => ({ color: theme.palette.text.secondary })}
        >
          {amount.payableVAT >= 0
            ? formattedPriceWithCurrencySymbol(amount.payableVAT)
            : undefined}
        </TableCell>
        <TableCell align="right">
          {formattedPriceWithCurrencySymbol(amount.payable)}
        </TableCell>
      </>
    )}
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
