import Typography from "@material-ui/core/Typography";
import React from "react";
import ReactMarkdown from "react-markdown";
import CollapsibleInput from "ui/CollapsibleInput";

interface Props {
  handleChange: (_: unknown) => void;
  value: string;
  text: string;
}

const FeedbackInput: React.FC<Props> = ({ text, ...componentProps }: Props) => (
  <CollapsibleInput {...componentProps} name="feedback">
    <Typography variant="body2" color="inherit" component="div">
      <ReactMarkdown>{text}</ReactMarkdown>
    </Typography>
  </CollapsibleInput>
);

export default FeedbackInput;
