import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import type { Node } from "../../../../types";

interface IResultReason {
  id: string;
  question: Node;
  response: string;
}

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    cursor: "pointer",
    "&:hover": {
      background: theme.palette.grey,
    },
  },
  moreInfo: {
    "& a": {
      color: theme.palette.text.disabled,
    },
    "& p": {
      color: theme.palette.text.secondary,
    },
  },
  responseText: {
    whiteSpace: "nowrap",
  },
  changeButton: {
    marginLeft: theme.spacing(1),
    padding: 0,
  },
}));

const ResultReason: React.FC<IResultReason> = ({ id, question, response }) => {
  const record = useStore((state) => state.record);
  const [showMoreInfo, setShowMoreInfo] = React.useState(false);

  const classes = useClasses();

  const hasMoreInfo = question.data.info ?? question.data.policyRef;
  const toggleAdditionalInfo = () => setShowMoreInfo(!showMoreInfo);

  return (
    <Box
      bgcolor="background.paper"
      display="flex"
      alignItems="flex-start"
      flexDirection="column"
      mb={0.5}
      px={1.5}
      className={classes.root}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        onClick={toggleAdditionalInfo}
        py={1}
      >
        <Box
          flexGrow={1}
          display="flex"
          alignItems="center"
          color="secondary.dark"
        >
          <Typography variant="body2" color="textPrimary">
            {question.data.text}{" "}
            <strong className={classes.responseText}>{response}</strong>
          </Typography>
          <Button
            color="inherit"
            className={classes.changeButton}
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              e.stopPropagation();
              record(id);
            }}
          >
            change
          </Button>
        </Box>
        {hasMoreInfo && <Caret expanded={showMoreInfo} />}
      </Box>
      {hasMoreInfo && (
        <Collapse in={showMoreInfo}>
          <Box
            pt={{ xs: 1, md: 0 }}
            pb={{ xs: 1, md: 3 }}
            color="background.dark"
            className={classes.moreInfo}
          >
            {question.data.info && (
              <ReactMarkdownOrHtml source={question.data.info} />
            )}
            {question.data.policyRef && (
              <ReactMarkdownOrHtml source={question.data.policyRef} />
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
export default ResultReason;
