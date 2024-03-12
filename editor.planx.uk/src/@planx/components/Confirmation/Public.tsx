import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { QuestionAndResponses } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Banner from "ui/public/Banner";
import FileDownload from "ui/public/FileDownload";
import NumberedList from "ui/public/NumberedList";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import type { Confirmation } from "./model";

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const [data, setData] = useState<QuestionAndResponses[]>([]);

  const [sessionId, saveToEmail, $public] = useStore((state) => [
    state.sessionId,
    state.saveToEmail,
    state.$public,
  ]);

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
    <Box width="100%">
      <Banner
        heading={props.heading || ""}
        color={props.color}
        Icon={Check}
        iconTitle={"Success"}
      >
        {props.description && (
          <Box mt={4}>
            <Typography maxWidth="formWrap">{props.description}</Typography>
          </Box>
        )}
      </Banner>
      <Card>
        {props.details && (
          <SummaryListTable>
            {Object.entries(props.details).map((item) => (
              <>
                <dt>{item[0]}</dt>
                <dd>{item[1]}</dd>
              </>
            ))}
          </SummaryListTable>
        )}

        {<FileDownload data={data} filename={sessionId || "application"} />}

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
          <>
            <Box py={1} color="primary.main">
              <Typography variant="h2" component="h3">
                Contact us
              </Typography>
              <ReactMarkdownOrHtml source={props.contactInfo} />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}
