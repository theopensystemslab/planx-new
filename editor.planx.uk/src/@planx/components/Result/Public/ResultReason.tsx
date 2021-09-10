import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import type { Node } from "../../../../types";

interface IResultReason {
  id: string;
  question: Node;
  response: string;
  showChangeButton?: boolean;
}

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    cursor: "pointer",
    marginBottom: theme.spacing(0.5),
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

const ResultReason: React.FC<IResultReason> = ({
  id,
  question,
  response,
  showChangeButton = false,
}) => {
  const record = useStore((state) => state.record);
  const [showMoreInfo, setShowMoreInfo] = React.useState(false);

  const classes = useClasses();

  const hasMoreInfo = question.data.info ?? question.data.policyRef;
  const toggleAdditionalInfo = () => setShowMoreInfo(!showMoreInfo);

  return (
    <ButtonBase
      selected={false}
      className={classes.root}
      aria-label="Expand for more information about this question"
      onClick={() => hasMoreInfo && toggleAdditionalInfo()}
    >
      <Box
        bgcolor="background.paper"
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
        width="100%"
        px={1.5}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          py={1}
        >
          <Box
            flexGrow={1}
            display="flex"
            alignItems="center"
            color="text.primary"
          >
            <Typography variant="body2" color="textPrimary">
              {question.data.text}{" "}
              <strong className={classes.responseText}>{response}</strong>
            </Typography>
            {showChangeButton && (
              <Button
                color="inherit"
                aria-label="Change your answer"
                className={classes.changeButton}
                onClick={(
                  e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                ) => {
                  e.stopPropagation();
                  record(id);
                }}
              >
                change
              </Button>
            )}
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
    </ButtonBase>
  );
};
export default ResultReason;
