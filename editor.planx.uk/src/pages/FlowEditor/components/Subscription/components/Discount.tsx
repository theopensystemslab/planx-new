import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { formattedPriceWithCurrencySymbol } from "@planx/components/Pay/model";
import { DEFAULT_SERVICE_CHARGE_AMOUNT } from "@planx/components/SetFee/model";
import { getQuarter } from "date-fns";
import sumBy from "lodash/sumBy";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { SubscriptionProps } from "../types";
import {
  getUKFiscalYear,
  getUKFiscalYearQuarter,
  sumServiceCharges,
} from "../utils";

const DISCOUNT_THRESHOLD = 10_000; // £10k

export const Discount = ({ serviceCharges }: SubscriptionProps) => {
  // "This fiscal year" is relative to when you access this page
  const thisQuarter = getUKFiscalYearQuarter(getQuarter(new Date()));
  const thisFiscalYear = getUKFiscalYear(thisQuarter, new Date().getFullYear());

  const serviceChargesThisFiscalYear = serviceCharges.filter(
    (sc) => sc.fiscalYear === thisFiscalYear,
  );

  return (
    <SettingsSection background>
      <Typography variant="h3" component="h4" gutterBottom>
        Discount
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Service charges exceeding £10k per fiscal year count as a discount
        towards your next renewal cost of Plan✕. Upon reaching £10k, 50% of the
        excess amount is applied as a discount.
      </Typography>
      {serviceChargesThisFiscalYear.length > 0 ? (
        <DiscountProgress serviceCharges={serviceChargesThisFiscalYear} />
      ) : (
        <Typography variant="body1">{`No service charges found.`}</Typography>
      )}
    </SettingsSection>
  );
};

const DiscountProgress = ({ serviceCharges }: SubscriptionProps) => {
  const rawAmountCollected = sumBy(serviceCharges, "amount");
  const percentOfThreshold = (rawAmountCollected / DISCOUNT_THRESHOLD) * 100;

  const amountToGo = DISCOUNT_THRESHOLD - rawAmountCollected;
  const numberSubmissionsToGo = amountToGo / DEFAULT_SERVICE_CHARGE_AMOUNT;

  // Once threshold is exceeded, only 50% of excess amount is actually eligible for discount
  const amountExceeded = (rawAmountCollected - DISCOUNT_THRESHOLD) / 2;

  return (
    <Box sx={{ width: "100%" }}>
      <Gauge
        height={160}
        value={Math.min(percentOfThreshold, 100)}
        startAngle={-90}
        endAngle={90}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 20,
            transform: "translate(0px,-30px)",
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: (theme) =>
              percentOfThreshold < 100
                ? theme.palette.background.dark
                : theme.palette.success.main,
          },
        }}
        text={() => `${sumServiceCharges(serviceCharges)} / £10k`}
      />
      {percentOfThreshold < 100 ? (
        <Typography variant="body1" align="center" mt={2}>
          <strong>{formattedPriceWithCurrencySymbol(amountToGo)}</strong>
          {` (${numberSubmissionsToGo} submissions) to go until eligible for a discount.`}
        </Typography>
      ) : (
        <Typography variant="body1" align="center" mt={2}>
          {`Eligible for a discount of `}
          <strong>{formattedPriceWithCurrencySymbol(amountExceeded)}</strong>
          {` to-date on your next renewal.`}
        </Typography>
      )}
    </Box>
  );
};
