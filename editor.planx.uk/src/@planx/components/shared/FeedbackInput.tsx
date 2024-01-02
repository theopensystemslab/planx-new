import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import ReactMarkdown from "react-markdown";
import CollapsibleInput from "ui/public/CollapsibleInput";

interface Props {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  text: string;
}

const StyledReactMarkdown = styled(ReactMarkdown)(() => ({
  "& p": {
    margin: 0,
    textAlign: "left",
  },
}));

const FeedbackInput: React.FC<Props> = ({ text, ...componentProps }: Props) => (
  <CollapsibleInput {...componentProps} name="feedback" ariaLabel={text}>
    <Typography variant="body1" color="inherit" component="div">
      <StyledReactMarkdown>{text}</StyledReactMarkdown>
    </Typography>
  </CollapsibleInput>
);

export default FeedbackInput;
