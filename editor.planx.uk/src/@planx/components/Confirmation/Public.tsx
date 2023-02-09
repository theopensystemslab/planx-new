import Check from "@mui/icons-material/CheckCircleOutlineOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute } from "react-navi";
import Banner from "ui/Banner";
import FileDownload from "ui/FileDownload";
import NumberedList from "ui/NumberedList";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { makeCsvData } from "../Send/uniform";
import type { Confirmation } from "./model";

const useClasses = makeStyles((theme) => ({
  table: {
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
  },
  listHeading: {
    marginBottom: theme.spacing(2),
  },
}));

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const [breadcrumbs, flow, passport, sessionId] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
  ]);
  const route = useCurrentRoute();
  const flowName = route.data.flowName;

  // make a CSV data structure based on the payloads we Send to BOPs/Uniform
  const data = makeCsvData({
    breadcrumbs,
    flow,
    flowName,
    passport,
    sessionId,
  });

  const classes = useClasses();

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
            <Typography>{props.description}</Typography>
          </Box>
        )}
      </Banner>
      <Card>
        {props.details && (
          <table className={classes.table}>
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
          </table>
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
            <Typography
              variant="h3"
              component="h2"
              className={classes.listHeading}
            >
              What happens next?
            </Typography>
            <NumberedList items={props.nextSteps} heading="h3" />
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
              <Typography variant="h3">Contact us</Typography>
              <ReactMarkdownOrHtml source={props.contactInfo} />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}
