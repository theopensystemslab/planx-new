import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useNavigation } from "react-navi";
import { FOOTER_ITEMS } from "types";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const CloseIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 20,
  top: 20,
}));

function Layout(props: {
  heading?: string;
  content?: string;
  onClose: () => void;
  openLinksOnNewTab?: boolean;
}) {
  return (
    <Root>
      <CloseIconButton onClick={props.onClose} size="medium" aria-label="Close">
        <Close />
      </CloseIconButton>
      <Container maxWidth="md">
        <Typography variant="h1">{props.heading}</Typography>
        <ReactMarkdownOrHtml
          source={props.content}
          openLinksOnNewTab={props.openLinksOnNewTab}
        />
      </Container>
    </Root>
  );
}

function ContentPage(props: { page: string }) {
  const navigation = useNavigation();
  const { flowSettings, globalSettings } = useStore();
  const isFooterItem = FOOTER_ITEMS.includes(props.page);
  // Determine if the content is a flow setting or a global setting, and only show it if it isn't hidden
  const content = (() => {
    if (isFooterItem) {
      const flowSetting = flowSettings?.elements?.[props.page];

      if (!flowSetting?.show) return;

      return {
        heading: flowSetting.heading,
        content: flowSetting.content,
      };
    } else {
      return globalSettings?.footerContent?.[props.page];
    }
  })();

  if (!content) throw new NotFoundError();

  return (
    <Layout
      {...content}
      onClose={() => navigation.goBack()}
      openLinksOnNewTab={!isFooterItem}
    />
  );
}

export default ContentPage;
