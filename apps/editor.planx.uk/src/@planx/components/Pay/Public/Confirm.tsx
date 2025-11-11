import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PaymentStatus } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import SaveResumeButton from "@planx/components/shared/Preview/SaveResumeButton";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { ApplicationPath } from "types";
import Banner from "ui/public/Banner";
import FormWrapper from "ui/public/FormWrapper";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import {
  formattedPriceWithCurrencySymbol,
  getDefaultContent,
  Pay,
} from "../model";
import { FeeBreakdown } from "./FeeBreakdown/FeeBreakdown";
import InviteToPayForm, { InviteToPayFormProps } from "./InviteToPayForm";
import { PAY_API_ERROR_UNSUPPORTED_TEAM } from "./Pay";

type ComponentState =
  | "error"
  | "informationOnly"
  | "inviteToPay"
  | "zeroFee"
  | "pay";

export interface Props extends Omit<Pay, "title" | "fn" | "govPayMetadata"> {
  title?: string;
  fee: number;
  showInviteToPay?: boolean;
  paymentStatus?: PaymentStatus;
  buttonTitle?: string;
  onConfirm: () => void;
  error?: string;
  hideFeeBanner?: boolean;
}

interface PayBodyProps extends Props {
  changePage: () => void;
}

const PayText = styled(Box)(({ theme }) => ({
  gap: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  "& > *": {
    alignSelf: "self-start",
  },
}));

/**
 * Displayed when component is in an error state
 * Relies on props.error being set
 */
const Error: React.FC<Props> = ({ onConfirm, error }) => {
  if (error?.startsWith(PAY_API_ERROR_UNSUPPORTED_TEAM)) {
    return (
      <Card handleSubmit={onConfirm} isValid>
        <ErrorSummary
          format="error"
          heading={error}
          message="Click continue to skip payment and continue testing."
        />
      </Card>
    );
  }

  return (
    <Card>
      <ErrorSummary
        format="error"
        heading={error}
        message="This error has been logged and our team will see it soon. You can safely close this tab and try resuming again soon by returning to this URL."
      />
    </Card>
  );
};

/**
 * Main functionality
 * Allows users to make a payment via GovUK Pay
 */
const PayBody: React.FC<PayBodyProps> = (props) => {
  const defaults = getDefaultContent();

  return (
    <>
      <Typography variant="h2" component={props.hideFeeBanner ? "h2" : "h3"}>
        {props.instructionsTitle || defaults.instructionsTitle}
      </Typography>
      <ReactMarkdownOrHtml
        source={
          props.instructionsDescription || defaults.instructionsDescription
        }
        openLinksOnNewTab
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={props.onConfirm}
      >
        {props.buttonTitle || "Pay now using GOV.UK Pay"}
      </Button>
      {props.showInviteToPay && (
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={props.changePage}
          disabled={Boolean(props?.paymentStatus)}
          data-testid="invite-page-link"
        >
          {"Invite someone else to pay"}
        </Button>
      )}
    </>
  );
};

/**
 * Display information only - does not allow users to pay
 * Generally used at the end of guidance services as an illustrative example of what you could pay
 */
const InformationOnly: React.FC<Props> = (props) => {
  const defaults = getDefaultContent();

  return (
    <>
      <Typography variant="h2" component={props.hideFeeBanner ? "h2" : "h3"}>
        {props.instructionsTitle || defaults.instructionsTitle}
      </Typography>
      <ReactMarkdownOrHtml
        source={
          props.instructionsDescription || defaults.instructionsDescription
        }
        openLinksOnNewTab
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={props.onConfirm}
      >
        Continue
      </Button>
    </>
  );
};

/**
 * Displayed if the fee is calculated as £0
 * Still displays component and fee breakdown, but allows user to continue without making a payment
 */
const ZeroFee: React.FC<Props> = (props) => (
  <Button
    variant="contained"
    color="primary"
    size="large"
    onClick={props.onConfirm}
  >
    Continue
  </Button>
);

const getInitialState = (props: Props): ComponentState => {
  if (props.error) return "error";
  if (props.hidePay) return "informationOnly";
  if (props.fee === 0) return "zeroFee";

  return "pay";
};

export default function Confirm(props: Props) {
  const theme = useTheme();
  const [componentState, setComponentState] = useState<ComponentState>(
    getInitialState(props),
  );

  const toggleToPayPage = () => setComponentState("pay");
  const toggleToInviteToPayPage = () => setComponentState("inviteToPay");

  const defaults = getDefaultContent();

  const path = useStore((state) => state.path);
  const isSaveReturn = path === ApplicationPath.SaveAndReturn;

  const inviteToPayFormProps: InviteToPayFormProps = {
    nomineeTitle: props.nomineeTitle,
    nomineeDescription: props.nomineeDescription,
    yourDetailsTitle: props.yourDetailsTitle,
    yourDetailsDescription: props.yourDetailsDescription,
    yourDetailsLabel: props.yourDetailsLabel,
    paymentStatus: props.paymentStatus,
    changePage: toggleToPayPage,
  };

  return (
    <Box textAlign="left" width="100%">
      <Container maxWidth="contentWrap">
        <Typography variant="h2" component="h1" align="left" pb={3}>
          {componentState === "inviteToPay"
            ? props.secondaryPageTitle
            : props.title}
        </Typography>
      </Container>
      {componentState !== "inviteToPay" && !props.hideFeeBanner && (
        <Banner
          color={{
            background: theme.palette.info.light,
            text: theme.palette.text.primary,
          }}
        >
          <FormWrapper>
            <Typography
              variant="h3"
              gutterBottom
              className="marginBottom"
              component="h2"
            >
              {props.bannerTitle || defaults.bannerTitle}
            </Typography>
            <Typography
              variant="h1"
              gutterBottom
              className="marginBottom"
              component="span"
            >
              {isNaN(props.fee)
                ? "Unknown"
                : formattedPriceWithCurrencySymbol(props.fee)}
            </Typography>
            <Typography variant="subtitle1" component="span" color="inherit">
              <ReactMarkdownOrHtml
                source={props.description}
                openLinksOnNewTab
              />
            </Typography>
          </FormWrapper>
          <FeeBreakdown />
        </Banner>
      )}
      <Card>
        <PayText>
          {
            {
              pay: <PayBody {...props} changePage={toggleToInviteToPayPage} />,
              informationOnly: <InformationOnly {...props} />,
              inviteToPay: <InviteToPayForm {...inviteToPayFormProps} />,
              error: <Error {...props} />,
              zeroFee: <ZeroFee {...props} />,
            }[componentState]
          }
          {isSaveReturn && <SaveResumeButton />}
        </PayText>
      </Card>
    </Box>
  );
}
