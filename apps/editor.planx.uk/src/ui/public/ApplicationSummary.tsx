import Box from "@mui/material/Box";
import { getValidSchemaDictionary } from "@opensystemslab/planx-core";
import type { GovUKPayment } from "@opensystemslab/planx-core/types";
import { EXTERNAL_PAY_PASSPORT_KEY } from "@planx/components/Pay/model";
import { STRIPE_PASSPORT_KEY } from "@planx/components/Pay/Public/providers/types";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { type Store, useStore } from "pages/FlowEditor/lib/store";
import { Fragment } from "react";

const getApplicationTypeDescriptionFromPassportValue = (
  passport: Store.Passport,
): string | undefined => {
  const schema = getValidSchemaDictionary("ApplicationType");
  const description = schema?.[passport?.data?.["application.type"]];

  return description;
};

const getPaymentReference = (
  passport: Store.Passport,
  govUkPayment?: GovUKPayment,
): string | undefined => {
  // Check for Gov Pay, Stripe or "External pay" reference in order, or return `undefined` if none of the above
  return (
    govUkPayment?.payment_id ??
    passport?.data?.[STRIPE_PASSPORT_KEY] ??
    passport?.data?.[EXTERNAL_PAY_PASSPORT_KEY]
  );
};

const getPaymentDate = (govUkPayment?: GovUKPayment): string | undefined => {
  if (govUkPayment?.created_date) {
    return new Date(govUkPayment.created_date).toLocaleDateString("en-gb", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // TODO handle Stripe and external pay (breadcrumb `created` which set passport key? do we actually need to show date here, is reference enough??)
  return undefined;
};

interface Props {
  titleId?: string;
}

const ApplicationSummary: React.FC<Props> = ({ titleId }) => {
  const [sessionId, passport, govUkPayment, flowName] = useStore((state) => [
    state.sessionId,
    state.computePassport(),
    state.govUkPayment,
    state.flowName,
  ]);

  const details = {
    "Application reference": sessionId,
    "Property address": passport.data?._address?.title,
    "Application type": [
      flowName.replace("Apply", "Application"),
      getApplicationTypeDescriptionFromPassportValue(passport),
    ]
      .filter(Boolean)
      .join(" - "),
    "Payment reference": getPaymentReference(passport, govUkPayment),
    "Paid at": getPaymentDate(govUkPayment),
  };

  const applicableDetails = objectWithoutNullishValues(details) as Record<
    string,
    string
  >;

  return (
    <SummaryListTable aria-labelledby={titleId}>
      {Object.entries(applicableDetails).map(([k, v], i) => (
        <Fragment key={`detail-${i}`}>
          <Box component="dt">{k}</Box>
          <Box component="dd">{v}</Box>
        </Fragment>
      ))}
    </SummaryListTable>
  );
};

export default ApplicationSummary;
