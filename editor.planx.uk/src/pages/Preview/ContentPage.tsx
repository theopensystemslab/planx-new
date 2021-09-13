import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import { NotFoundError } from "navi";
import { PreviewContext } from "pages/Preview/Context";
import React from "react";
import { useNavigation } from "react-navi";
import { FOOTER_ITEMS } from "types";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const useClasses = makeStyles((theme) => ({
  content: {
    marginTop: theme.spacing(2),
    whiteSpace: "pre-line",
  },
  close: {
    position: "absolute",
    right: 20,
    top: 20,
  },
}));

function Layout(props: {
  heading?: string;
  content?: string;
  onClose: () => void;
  openLinksOnNewTab?: boolean;
}) {
  const classes = useClasses();

  return (
    <Box
      width="100%"
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt={2}
      pb={10}
    >
      <IconButton
        onClick={props.onClose}
        className={classes.close}
        size="medium"
      >
        <Close />
      </IconButton>
      <Container maxWidth="md">
        <Typography variant="h1">{props.heading}</Typography>
        <ReactMarkdownOrHtml
          source={props.content}
          openLinksOnNewTab={props.openLinksOnNewTab}
        />
      </Container>
    </Box>
  );
}

function ContentPage(props: { page: string }) {
  const navigation = useNavigation();
  const context = React.useContext(PreviewContext);
  const isFooterItem = FOOTER_ITEMS.includes(props.page);
  // Determine if the content is a flow setting or a global setting, and only show it if it isn't hidden
  const content = (() => {
    if (isFooterItem) {
      const flowSetting = context?.flow.settings?.elements?.[props.page];

      if (!flowSetting?.show) return;

      return {
        heading: flowSetting.heading,
        content: flowSetting.content,
      };
    } else {
      return context?.globalSettings?.footerContent?.[props.page];
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
