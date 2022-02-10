import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Check from "@material-ui/icons/CheckCircleOutlineOutlined";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import omit from "lodash/omit";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/Banner";
import NumberedList from "ui/NumberedList";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { getParams } from "../Send/bops";
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
        padding: `${theme.spacing(1.5)}px ${theme.spacing(1)}px`,
      },
    },
  },
  listHeading: {
    marginBottom: theme.spacing(2),
  },
  download: {
    marginTop: theme.spacing(1),
    textAlign: "right",
    "& button": {
      background: "none",
      "border-style": "none",
      color: theme.palette.text.primary,
      cursor: "pointer",
      fontSize: "inherit",
      fontFamily: "inherit",
      textDecoration: "underline",
      padding: theme.spacing(2),
    },
    "& button:hover": {
      backgroundColor: theme.palette.background.paper,
    },
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

  // recreate the payload we sent to BOPs for download
  const sentData = getParams(breadcrumbs, flow, passport, sessionId);
  const files = sentData["files"];

  // format dedicated BOPs properties as list of questions & responses to match proposal_details,
  //   omitting debug data and keys that are duplicated in confirmation details
  const summary: any = {
    ...omit(props.details, "Property Address"),
    ...omit(sentData, [
      "planx_debug_data",
      "application_type",
      "files",
      "proposal_details",
    ]),
  };
  const formattedSummary: { question: string; responses: any }[] = [];
  Object.keys(summary).forEach((key) => {
    formattedSummary.push({
      question: key,
      responses: summary[key],
    });
  });

  // create a single list of questions & responses
  const data = formattedSummary.concat(sentData["proposal_details"] || []);

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
          <div className={classes.download}>
            <a
              href={`${
                process.env.REACT_APP_API_URL
              }/download-application?ref=${
                props.details?.["Planning Application Reference"] ||
                "application"
              }&data=${JSON.stringify(data)}&files=${JSON.stringify(files)}`}
            >
              <button>Download your application data (.zip)</button>
            </a>
          </div>
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
