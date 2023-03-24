import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormGroup from "@mui/material/FormGroup";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import MoreInfo from "@planx/components/shared/Preview/MoreInfo";
import { emailRegex } from "@planx/components/TextInput/model";
import { submitFeedback } from "lib/feedback";
import React, { useState } from "react";
import { PaymentStatus } from "types";
import Banner from "ui/Banner";
import ChecklistItem from "ui/ChecklistItem";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { formattedPriceWithCurrencySymbol } from "../model";

const ErrorSummary = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid ${theme.palette.error.main}`,
}));

interface Props {
  title?: string;
  bannerTitle?: string;
  description?: string;
  fee: number;
  instructionsTitle?: string;
  instructionsDescription?: string;
  showInviteToPay?: boolean;
  inviteToPayTitle?: string;
  inviteToPayDescription?: string;
  paymentStatus?: PaymentStatus;
  buttonTitle?: string;
  onConfirm: () => void;
  error?: string;
}

const PayText = styled(Box)(({ theme }) => ({
  gap: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  "& > *": {
    alignSelf: "self-start",
  },
}));

export default function Confirm(props: Props) {
  const theme = useTheme();

  const [page, setPage] = useState<"Pay" | "InviteToPay">("Pay");
  const [nomineeName, setNomineeName] = useState<string | undefined>();
  const [nomineeEmail, setNomineeEmail] = useState<string | undefined>();
  const [validatedNomineeEmail, setValidatedNomineeEmail] = useState<
    string | undefined
  >();
  const [showNomineeEmailError, setShowNomineeEmailError] =
    useState<boolean>(false);

  const changePage = () => {
    if (page === "Pay" && !Boolean(props.paymentStatus)) {
      setPage("InviteToPay");
    } else {
      setPage("Pay");
    }
  };

  const handleNomineeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const input = e.target.value;
    if (name === "nomineeName") {
      setNomineeName(input);
    } else if (name === "nomineeEmail") {
      setNomineeEmail(input);
    }
  };

  const handleNomineeEmailCheck = () => {
    if (!nomineeEmail || !emailRegex.test(nomineeEmail)) {
      setShowNomineeEmailError(true);
    } else {
      setValidatedNomineeEmail(nomineeEmail);
    }
  };

  const payBody = () => (
    <>
      {!props.error ? (
        <Card>
          <PayText>
            <Typography variant="h3">
              {props.instructionsTitle || "How to pay"}
            </Typography>
            <Typography variant="body2">
              <ReactMarkdownOrHtml
                source={
                  props.instructionsDescription ||
                  `<p>You can pay for your application by using GOV.UK Pay.</p>\
                   <p>Your application will be sent after you have paid the fee. \
                   Wait until you see an application sent message before closing your browser.</p>`
                }
                openLinksOnNewTab
              />
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={props.onConfirm}
            >
              {props.buttonTitle || "Pay using GOV.UK Pay"}
            </Button>
            {props.showInviteToPay ? (
              <>
                <Typography variant="body2">or</Typography>
                <Link
                  component="button"
                  onClick={changePage}
                  disabled={Boolean(props?.paymentStatus)}
                  data-testid="nominate-page-link"
                >
                  <Typography variant="body2">
                    Nominate someone else to pay for this application
                  </Typography>
                </Link>
              </>
            ) : (
              <SuggestionDrawer />
            )}
          </PayText>
        </Card>
      ) : (
        <Card handleSubmit={props.onConfirm} isValid>
          <ErrorSummary role="status" data-testid="error-summary">
            <Typography variant="h5" component="h3" gutterBottom>
              {props.error}
            </Typography>
            <Typography variant="body2">
              Click continue to skip payment and proceed with your application
              for testing.
            </Typography>
          </ErrorSummary>
        </Card>
      )}
    </>
  );

  const nominateBody = () => (
    <Card>
      <Typography variant="h3">{props.inviteToPayTitle}</Typography>
      <Typography variant="body2">
        <ReactMarkdownOrHtml
          source={props.inviteToPayDescription}
          openLinksOnNewTab
        />
      </Typography>
      <Box>
        <InputLabel label="Full name (optional)" htmlFor="nomineeName">
          <Input
            bordered
            name="nomineeName"
            id="nomineeName"
            value={nomineeName || ""}
            onChange={(e) => handleNomineeInputChange(e, "nomineeName")}
            inputProps={{
              "aria-describedby":
                "Nominate someone else to pay for this application - full name",
            }}
          />
        </InputLabel>
      </Box>
      <Box sx={{ marginBottom: theme.spacing(2) }}>
        <InputLabel label="Email" htmlFor="nomineeEmail">
          <Input
            required
            bordered
            name="nomineeEmail"
            id="nomineeEmail"
            value={nomineeEmail || ""}
            errorMessage={
              showNomineeEmailError && !validatedNomineeEmail
                ? `Enter an email address in the correct format, like name@example.com`
                : ""
            }
            onChange={(e) => handleNomineeInputChange(e, "nomineeEmail")}
            onKeyUp={({ key }) => {
              if (key === "Enter") handleNomineeEmailCheck();
            }}
            onBlur={handleNomineeEmailCheck}
            inputProps={{
              "aria-describedby": [
                "Nominate someone else to pay for this application - email",
                showNomineeEmailError && !validatedNomineeEmail
                  ? `Enter an email address in the correct format`
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => console.log("TODO")}
      >
        {"Email your nominee"}
      </Button>
      {props.showInviteToPay && (
        <>
          <Typography variant="body2">or</Typography>
          <Link
            component="button"
            onClick={changePage}
            disabled={Boolean(props?.paymentStatus)}
          >
            <Typography variant="body2">
              Pay for this application myself instead
            </Typography>
          </Link>
        </>
      )}
    </Card>
  );

  return (
    <Box textAlign="left" width="100%">
      <>
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
              {props.bannerTitle || "The planning fee for this application is"}
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
              <ReactMarkdownOrHtml
                source={props.description}
                openLinksOnNewTab
              />
            </Typography>
          </Container>
        </Banner>
        {page === "Pay" ? payBody() : nominateBody()}
      </>
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

  const sendFeedback = () => {
    submitFeedback(text, "Alternate payment methods", checkboxes);
    setIsOpen(false);
  };

  return (
    <>
      <Link component="button" onClick={() => setIsOpen(!isOpen)}>
        <Typography variant="body2">
          Tell us other ways you'd like to pay in the future
        </Typography>
      </Link>
      <MoreInfo open={isOpen} handleClose={() => setIsOpen(!isOpen)}>
        <Box>
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
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => sendFeedback()}
            >
              Save
            </Link>
          </Box>
        </Box>
      </MoreInfo>
    </>
  );
}
