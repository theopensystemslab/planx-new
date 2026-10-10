import Box from "@mui/material/Box";
import { getValidSchemaDictionary } from "@opensystemslab/planx-core";
import type { GovUKPayment } from "@opensystemslab/planx-core/types";
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
  if (govUkPayment?.payment_id) return govUkPayment.payment_id;

  const stripeReference = passport?.data?.[STRIPE_PASSPORT_KEY];
  return stripeReference;
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
    "Paid at":
      govUkPayment?.created_date &&
      new Date(govUkPayment.created_date).toLocaleDateString("en-gb", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
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
