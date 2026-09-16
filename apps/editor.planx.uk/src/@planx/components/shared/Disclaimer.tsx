import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useId } from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

export const Disclaimer = ({ text }: { text: string }) => {
  const disclaimerId = useId();

  return (
    <WarningContainer aria-labelledby={disclaimerId}>
      <ErrorOutline />
      <Typography
        id={disclaimerId}
        variant="body2"
        component="div"
        sx={{ ml: 2, "& p:first-of-type": { marginTop: 0 } }}
      >
        <ReactMarkdownOrHtml source={text} openLinksOnNewTab />
      </Typography>
    </WarningContainer>
  );
};
