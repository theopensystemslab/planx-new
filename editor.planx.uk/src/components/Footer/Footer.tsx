import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatServiceLastUpdated } from "pages/FlowEditor/utils";
import React from "react";
import { Link as ReactNaviLink } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const Root = styled("footer")(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.common.black,
  padding: theme.spacing(2, 0),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3, 0),
  },
  "@media print": {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.common.white,
  },
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  columnGap: theme.spacing(3),
  textTransform: "capitalize",
  display: "flex",
  flexWrap: "wrap",
  [theme.breakpoints.up("xs")]: {
    flexDirection: "column",
  },
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

interface Item {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
}

export interface Props {
  items?: Item[];
  children?: React.ReactNode;
}

export default function Footer(props: Props) {
  const { items, children } = props;

  const [lastPublishedDate] = useStore((state) => [state.lastPublishedDate]);

  return (
    <Root>
      <Container maxWidth={false}>
        <Box display={"flex"} justifyContent={"space-between"}>
          {items && items.length > 0 && (
            <ButtonGroup py={0.5}>
              {items
                ?.filter((item) => item.title)
                .map((item) => <FooterItem {...item} key={item.title} />)}
            </ButtonGroup>
          )}
          <Box py={0.5}>
            <Typography variant="body2">
              {formatServiceLastUpdated(lastPublishedDate)}
            </Typography>
          </Box>
        </Box>
        <Box py={2}>{children}</Box>
      </Container>
    </Root>
  );
}

function FooterItem(props: {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
  newTab?: boolean;
}) {
  const title = (
    <Typography
      variant="body2"
      sx={{ fontWeight: props.bold ? FONT_WEIGHT_SEMI_BOLD : "regular" }}
    >
      {props.title.toLowerCase()}
    </Typography>
  );
  return props.href ? (
    <Link
      color="inherit"
      component={ReactNaviLink}
      href={props.href}
      prefetch={false}
      target={props.newTab ? "_blank" : ""}
      rel={props.newTab ? "noopener" : ""}
    >
      {title}
    </Link>
  ) : (
    <Link color="inherit" component="button" onClick={props.onClick}>
      {title}
    </Link>
  );
}
