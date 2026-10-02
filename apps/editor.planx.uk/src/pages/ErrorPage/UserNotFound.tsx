import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { cardBoxShadow } from "theme";
import WatermarkBackground from "ui/shared/WatermarkBackground";

const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
}));

const Header = styled("header")(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(6, 0, 4),
}));

const ErrorCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: cardBoxShadow,
  position: "relative",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

type Props = {
  emailAddress?: string;
};

const UserNotFound: React.FC<Props> = ({ emailAddress }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: ".." });
  };

  return (
    <Root>
      <WatermarkBackground variant="dark" opacity={0.05} />
      <Header>
        <Container maxWidth="formWrap" sx={{ position: "relative" }}>
          <Typography variant="h1" component="h1">
            Accessing the Plan✕ Editor
          </Typography>
          <Typography variant="h1" component="h2" sx={{ opacity: 0.75 }}>
            You are almost there…
          </Typography>
        </Container>
      </Header>
      <Box component="main" sx={{ py: { xs: 2, md: 3 } }}>
        <Container maxWidth="formWrap">
          <ErrorCard>
            <Stack spacing={1.5}>
              <Typography variant="h3">
                No user account found for{" "}
                {emailAddress ? emailAddress : "this email address"}
              </Typography>
              <Typography>
                We couldn't find a Plan✕ user account associated with the email
                address you're using to log in, which means your account hasn't
                been created yet.
              </Typography>
              <Typography>
                Please contact your Plan✕ lead, or your team admin, to request
                that they add you to your workspace.
              </Typography>
              <Typography>
                Still stuck? Message us on Slack in{" "}
                <Link
                  href="https://opendigitalplanning.slack.com/archives/C0241GWFG4B"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  #help-issues-odp-products
                </Link>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                type="reset"
                onClick={handleClick}
                sx={{ alignSelf: "flex-start" }}
              >
                Back to log in
              </Button>
            </Stack>
          </ErrorCard>
        </Container>
      </Box>
    </Root>
  );
};

export default UserNotFound;
