import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { notFound, useLocation, useNavigate } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import { BackButton } from "pages/Preview/Questions";
import { FOOTER_ITEMS } from "types";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

function Layout(props: {
  heading?: string;
  content?: string;
  onClose: () => void;
  openLinksOnNewTab?: boolean;
}) {
  return (
    <Root>
      <Container maxWidth="contentWrap" sx={{ position: "relative" }}>
        <BackButton onClick={props.onClose} variant="link">
          <ArrowBackIcon fontSize="small" />
          Back
        </BackButton>
        <Container
          maxWidth="formWrap"
          sx={{ margin: 0, padding: "0 !important" }}
        >
          <Typography variant="h2" component="h1">
            {props.heading}
          </Typography>
          <ReactMarkdownOrHtml
            source={props.content}
            openLinksOnNewTab={props.openLinksOnNewTab}
          />
        </Container>
      </Container>
    </Root>
  );
}

function ContentPage(props: { page: string }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  if (!content) throw notFound();

  const handleClose = () => {
    const basePath = location.pathname.split("/pages/")[0];
    navigate({ to: basePath });
  };

  return (
    <Layout
      {...content}
      onClose={handleClose}
      openLinksOnNewTab={!isFooterItem}
    />
  );
}

export default ContentPage;
