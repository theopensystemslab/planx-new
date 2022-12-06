import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";
import Banner from "ui/Banner";
import ChecklistItem from "ui/ChecklistItem";
import Input from "ui/Input";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { formattedPriceWithCurrencySymbol } from "../model";

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  drawerPaper: {
    boxSizing: "border-box",
    width: 300,
    [theme.breakpoints.only("xs")]: {
      width: "100%",
    },
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
    padding: theme.spacing(2),
  },
  errorSummary: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(3),
    border: `5px solid #E91B0C`,
  },
}));

interface Props {
  title?: string;
  description?: string;
  fee: number;
  buttonTitle?: string;
  onConfirm: () => void;
  error?: string;
}

export default function Confirm(props: Props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box textAlign="left" width="100%">
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom align="left">
          {props.title}
        </Typography>
      </Container>

      <Banner
        color={{
          background: theme.palette.primary.main,
          text: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h5"
            gutterBottom
            className="marginBottom"
            component="h2"
          >
            The planning fee for this application is
          </Typography>
          <Typography
            variant="h1"
            gutterBottom
            className="marginBottom"
            component="span"
          >
            {formattedPriceWithCurrencySymbol(props.fee)}
          </Typography>
          <Typography variant="h4" component="span">
            <ReactMarkdownOrHtml source={props.description} openLinksOnNewTab />
          </Typography>
        </Container>
      </Banner>

      {!props.error ? (
        <Card>
          <div className={classes.root}>
            <Typography variant="h3">How to pay</Typography>
            <Box py={3}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={props.onConfirm}
              >
                {props.buttonTitle || "Pay using GOV.UK Pay"}
              </Button>
            </Box>

            <SuggestionDrawer />
          </div>
        </Card>
      ) : (
        <Card handleSubmit={props.onConfirm} isValid>
          <div className={classes.errorSummary} role="status">
            <Typography variant="h5" component="h3" gutterBottom>
              {props.error}
            </Typography>
            <Typography variant="body2">
              Click continue to skip payment and proceed with your application
              for testing.
            </Typography>
          </div>
        </Card>
      )}
    </Box>
  );
}

function SuggestionDrawer() {
  const OTHER_OPTIONS = [
    { name: "Apple", label: "Apple Pay" },
    { name: "BACs", label: "Bank transfer by BACs" },
    { name: "Cheque", label: "Cheque" },
    { name: "PayPal", label: "PayPal" },
    { name: "Phone", label: "Phone" },
    { name: "Other", label: "Other" },
  ];

  const [isOpen, setIsOpen] = React.useState(false);
  const [checkboxes, setCheckboxes] = React.useState<{
    [key: string]: boolean;
  }>(Object.fromEntries(OTHER_OPTIONS.map(({ name }) => [name, false])));
  const [text, setText] = React.useState("");

  const classes = useStyles();

  const handleLinkClick = () => {
    setIsOpen((x) => !x);
  };

  return (
    <>
      <Link component="button" onClick={handleLinkClick}>
        <Typography variant="body2">
          Tell us other ways you'd like to pay in the future
        </Typography>
      </Link>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div>
          <IconButton
            onClick={() => setIsOpen(false)}
            aria-label="Close Panel"
            size="large"
          >
            <CloseIcon />
          </IconButton>
          <p>
            What other types of payment would you like this service to accept in
            the future:
          </p>
          <FormGroup row>
            {OTHER_OPTIONS.map((option) => (
              <ChecklistItem
                label={option.label}
                checked={checkboxes[option.name]}
                id={option.name}
                key={option.name}
                onChange={() =>
                  setCheckboxes({
                    ...checkboxes,
                    [option.name]: !checkboxes[option.name],
                  })
                }
              />
            ))}
          </FormGroup>
          <p>Why would you prefer to use this form of payment?</p>

          <Input
            aria-label="Reason for selected form of payments"
            bordered
            multiline={true}
            rows={3}
            style={{ width: "100%" }}
            onChange={(ev) => {
              setText(ev.target.value);
            }}
            value={text}
          />
          <p style={{ textAlign: "right" }}>
            <Link component="button" onClick={() => setIsOpen(false)}>
              Save
            </Link>
          </p>
        </div>
      </Drawer>
    </>
  );
}
