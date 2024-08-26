import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { QuestionAndResponses } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { PublicProps } from "@planx/components/ui";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Banner from "ui/public/Banner";
import FileDownload from "ui/public/FileDownload";
import NumberedList from "ui/public/NumberedList";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

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
  return (
    <Box width="100%">
      <Banner
        heading={props.heading || ""}
        color={props.color}
        Icon={Check}
        iconTitle={"Success"}
      >
        {props.description && (
          <Box mt={2} maxWidth="formWrap">
            <ReactMarkdownOrHtml source={props.description} openLinksOnNewTab />
          </Box>
        )}
      </Banner>
      <Card>
        <SummaryListTable>
          {Object.entries(props.applicableDetails).map(([k, v], i) => (
            <React.Fragment key={`detail-${i}`}>
              <Box component="dt">{k}</Box>
              <Box component="dd">{v}</Box>
            </React.Fragment>
          ))}
        </SummaryListTable>
        <FileDownload
          data={props.data}
          filename={props.sessionId || "application"}
        />
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
function getWorkStatus(passport: Store.passport): string | undefined {
  switch (passport?.data?.["application.type"]?.toString()) {
    case "ldc.existing":
      return "existing";
    case "ldc.proposed":
      return "proposed";
  }
}
