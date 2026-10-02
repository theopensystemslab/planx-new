import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getContrastTextColor } from "styleUtils";
import { Icon, type TablerIcon } from "ui/icons/Icon";

interface BannerProps {
  heading?: string;
  headingId?: string;
  Icon?: TablerIcon;
  iconTitle?: string;
  color?: { background: string; text: string };
  children?: React.ReactNode;
}

interface RootProps {
  bgcolor?: string;
  color?: string;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "bgcolor" && prop !== "color",
})<RootProps>(({ theme, bgcolor, color }) => ({
  display: "flex",
  justifyContent: "center",
  textAlign: "left",
  padding: theme.spacing(6, 0),
  position: "relative",
  width: "100%",
  minHeight: theme.spacing(10),
  "& a": {
    color: getContrastTextColor(
      bgcolor || theme.palette.background.paper,
      theme.palette.primary.main,
    ),
  },
  ...(!color && {
    backgroundColor: theme.palette.background.paper,
    color: "currentColor",
  }),
  ...(bgcolor && { backgroundColor: bgcolor }),
  ...(color && { color: color }),
}));

function Banner(props: BannerProps) {
  return (
    <Root bgcolor={props.color?.background} color={props.color?.text}>
      <Container
        maxWidth="contentWrap"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {props.Icon && (
          <Icon
            icon={props.Icon}
            sx={{
              marginBottom: (theme: Theme) => theme.spacing(1),
              height: (theme: Theme) => theme.spacing(5),
              width: (theme: Theme) => theme.spacing(5),
              border: "3px solid",
              borderRadius: "50%",
            }}
            titleAccess={props.iconTitle}
          />
        )}
        {props.heading && (
          <Typography
            variant="h1"
            id={props.headingId}
            sx={{ textWrap: "balance" }}
          >
            {props.heading}
          </Typography>
        )}
        {props.children}
      </Container>
    </Root>
  );
}

export default Banner;
