import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Check from "@material-ui/icons/CheckCircleOutlineOutlined";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import React, { useEffect } from "react";
import Banner from "ui/Banner";
import CollapsibleInput from "ui/CollapsibleInput";
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
  feedback: {
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const formik = useFormik({
    initialValues: {
      feedback: "",
    },
    onSubmit: (values, { resetForm }) => {
      if (values.feedback) {
        submitFeedback(values.feedback, {
          reason: "Confirmation",
        });
        resetForm();
      }
      props.handleSubmit?.();
    },
  });

  const classes = useClasses();

  const [showButton, setShowButton] = React.useState<boolean>(
    !!props.handleSubmit
  );

  useEffect(() => {
    if (props.handleSubmit) return;

    setShowButton(formik.values.feedback.length > 0);
  }, [formik.values.feedback]);

  return (
    <Box width="100%">
      <Banner heading={props.heading || ""} color={props.color} Icon={Check}>
        {props.description && (
          <Box mt={4}>
            <Typography>{props.description}</Typography>
          </Box>
        )}
      </Banner>
      <Card handleSubmit={showButton ? formik.handleSubmit : undefined} isValid>
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
            <Typography variant="h3" className={classes.listHeading}>
              What happens next?
            </Typography>
            <NumberedList items={props.nextSteps} />
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
            <hr />
          </>
        )}

        {props.feedbackCTA && (
          <CollapsibleInput
            handleChange={formik.handleChange}
            name="feedback"
            value={formik.values.feedback}
          >
            <Typography
              variant="body2"
              color="primary"
              className={classes.feedback}
            >
              {props.feedbackCTA}
            </Typography>
          </CollapsibleInput>
        )}
      </Card>
    </Box>
  );
}
