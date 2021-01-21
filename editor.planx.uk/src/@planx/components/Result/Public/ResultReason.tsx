import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import type { Node } from "./model";
interface IResultReason {
  id: string;
  question: Node;
  response: string;
}

const useClasses = makeStyles((theme: Theme) => ({
  moreInfo: {
    "& a": {
      color: theme.palette.text.disabled,
    },
  },
}));

const ResultReason: React.FC<IResultReason> = ({ id, question, response }) => {
  const record = useStore((state) => state.record);
  const [show, setShow] = React.useState(true);

  const classes = useClasses();

  const handleChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    record(id);
  };

  const toggleAdditionalInfo = () => setShow(!show);

  return (
    <Box
      bgcolor="background.paper"
      display="flex"
      alignItems="flex-start"
      flexDirection="column"
      mb={0.5}
      pl={1.5}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        onClick={toggleAdditionalInfo}
      >
        <Box flexGrow={1}>
          {question.data.text} <strong>{response}</strong>
        </Box>
        <Box color="secondary.dark">
          <Button color="inherit" onClick={handleChange}>
            change
          </Button>
        </Box>
      </Box>
      {question.data.info && (
        <Collapse in={show}>
          <Box py={1.5} color="background.dark" className={classes.moreInfo}>
            <Typography color="inherit">{question.data.info}</Typography>
            {question.data.policyRef && (
              <a href={question.data.policyRef} target="_blank">
                {question.data.policyRef}
              </a>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
export default ResultReason;
