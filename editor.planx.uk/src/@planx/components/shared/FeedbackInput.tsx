import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import ReactMarkdown from "react-markdown";
import CollapsibleInput from "ui/CollapsibleInput";

interface Props {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  text: string;
}

const StyledReactMarkdown = styled(ReactMarkdown)(() => ({
  "& p": {
    margin: 0,
  },
}));

const FeedbackInput: React.FC<Props> = ({ text, ...componentProps }: Props) => (
  <CollapsibleInput {...componentProps} name="feedback">
    <Typography variant="body2" color="inherit" component="div">
      <StyledReactMarkdown>{text}</StyledReactMarkdown>
    </Typography>
  </CollapsibleInput>
);

export default FeedbackInput;
