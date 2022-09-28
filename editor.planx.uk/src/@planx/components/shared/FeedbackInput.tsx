import Typography from "@mui/material/Typography";
import React from "react";
import ReactMarkdown from "react-markdown";
import CollapsibleInput from "ui/CollapsibleInput";

interface Props {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
