import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Check from "@material-ui/icons/CheckCircleOutlineOutlined";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import Banner from "ui/Banner";
import NumberedList from "ui/NumberedList";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import type { Confirmation } from "./model";

const useClasses = makeStyles((theme) => ({
  table: {
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
}));

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const classes = useClasses();

  return (
    <Box width="100%">
      <Banner heading={props.heading || ""} color={props.color} Icon={Check}>
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
