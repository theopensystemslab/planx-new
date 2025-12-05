import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { QuestionAndResponses } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { PublicProps } from "@planx/components/shared/types";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Banner from "ui/public/Banner";
import NumberedList from "ui/public/NumberedList";
import ViewApplicationLink from "ui/public/ViewApplicationLink";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import type { Confirmation } from "./model";

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const [data, setData] = useState<QuestionAndResponses[]>([]);

  const [sessionId, saveToEmail, $public, passport, govUkPayment, flowName] =
    useStore((state) => [
      state.sessionId,
      state.saveToEmail,
      state.$public,
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

  useEffect(() => {
    const makeCsvData = async () => {
      if (sessionId && saveToEmail) {
        const csvData = await $public({
          session: { sessionId: sessionId, email: saveToEmail },
        }).export.csvData(sessionId);
        setData(csvData);
      }
    };

    if (data?.length < 1) {
      makeCsvData();
    }
  });

  return (
    <Presentational
      {...props}
      applicableDetails={applicableDetails}
      data={data}
      sessionId={sessionId}
    />
  );
}

interface PresentationalProps extends Props {
  sessionId: string;
  applicableDetails: Record<string, string>;
  data: QuestionAndResponses[];
}

export function Presentational(props: PresentationalProps) {
  const isFinalCard = useStore().isFinalCard();
  const theme = useTheme();
  return (
    <Box width="100%">
      <Banner
        heading={props.heading || ""}
        color={{
          background: theme.palette.success.light,
          text: theme.palette.text.primary,
        }}
        Icon={Check}
        iconTitle={"Success"}
      >
        {props.description && (
          <Box mt={2} maxWidth="formWrap">
            <ReactMarkdownOrHtml source={props.description} openLinksOnNewTab />
          </Box>
        )}
      </Banner>
      <Card handleSubmit={isFinalCard ? undefined : props.handleSubmit}>
        <SummaryListTable>
          {Object.entries(props.applicableDetails).map(([k, v], i) => (
            <React.Fragment key={`detail-${i}`}>
              <Box component="dt">{k}</Box>
              <Box component="dd">{v}</Box>
            </React.Fragment>
          ))}
        </SummaryListTable>
        <ViewApplicationLink />
        {props.nextSteps && Boolean(props.nextSteps?.length) && (
          <Box pt={3}>
            <Typography variant="h2" mb={2}>
              What happens next?
            </Typography>
            <NumberedList items={props.nextSteps} heading="h2" />
          </Box>
        )}
        {props.moreInfo && (
          <>
            <Box py={1}>
              <ReactMarkdownOrHtml source={props.moreInfo} />
            </Box>
            <hr />
          </>
        )}
        {props.contactInfo && (
          <Box py={1}>
            <Typography variant="h2" component="h3" gutterBottom>
              Contact us
            </Typography>
            <ReactMarkdownOrHtml source={props.contactInfo} openLinksOnNewTab />
          </Box>
        )}
      </Card>
    </Box>
  );
}

// TODO - Retire in favor of ODP Schema application type descriptions or fallback to flowName
function getWorkStatus(passport: Store.Passport): string | undefined {
  switch (passport?.data?.["application.type"]?.toString()) {
    case "ldc.existing":
      return "existing";
    case "ldc.proposed":
      return "proposed";
  }
}
