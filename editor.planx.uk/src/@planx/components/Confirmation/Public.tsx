import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/public/Banner";
import FileDownload from "ui/public/FileDownload";
import NumberedList from "ui/public/NumberedList";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { makeCsvData } from "../Send/uniform";
import type { Confirmation } from "./model";

const Table = styled("table")(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  "& tr": {
    borderBottom: `1px solid ${theme.palette.grey[400]}`,
    "&:last-of-type": {
      border: "none",
    },
    "& td": {
      padding: theme.spacing(1.5, 1),
    },
  },
}));

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const [breadcrumbs, flow, passport, sessionId, flowName] = useStore(
    (state) => [
      state.breadcrumbs,
      state.flow,
      state.computePassport(),
      state.sessionId,
      state.flowName,
    ],
  );

  // make a CSV data structure based on the payloads we Send to BOPs/Uniform
  const data = makeCsvData({
    breadcrumbs,
    flow,
    flowName,
    passport,
    sessionId,
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
          <Table>
            <tbody>
              {Object.entries(props.details).map((item, i) => (
                <tr key={i}>
                  <td>{item[0]}</td>
                  <td>
                    <b>{item[1]}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {
          <FileDownload
            data={data}
            filename={
              props.details?.["Planning Application Reference"] || "application"
            }
          />
        }

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
