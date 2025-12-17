import Box from "@mui/material/Box";
import { getValidSchemaDictionary } from "@opensystemslab/planx-core";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { type Store,useStore } from "pages/FlowEditor/lib/store";
import { Fragment } from "react";
import React from "react";

const getWorkStatus = (passport: Store.Passport): string | undefined => {
  const schema = getValidSchemaDictionary("ApplicationType");
  const description = schema?.[passport?.data?.["application.type"]];

  return description;
}

const ApplicationSummary: React.FC = () => {
  const [sessionId, passport, govUkPayment, flowName] =
    useStore((state) => [
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
      getWorkStatus(passport),
    ]
      .filter(Boolean)
      .join(" - "),
    "GOV.UK payment reference": govUkPayment?.payment_id,
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
    <SummaryListTable>
      {Object.entries(applicableDetails).map(([k, v], i) => (
        <Fragment key={`detail-${i}`}>
          <Box component="dt">{k}</Box>
          <Box component="dd">{v}</Box>
        </Fragment>
      ))}
    </SummaryListTable>
  )
}

export default ApplicationSummary;