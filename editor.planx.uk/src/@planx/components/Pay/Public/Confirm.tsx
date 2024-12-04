import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PaymentStatus } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import SaveResumeButton from "@planx/components/shared/Preview/SaveResumeButton";
import { hasFeatureFlag } from "lib/featureFlags";
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
import { FeeBreakdown } from "./FeeBreakdown";
import InviteToPayForm, { InviteToPayFormProps } from "./InviteToPayForm";
import { PAY_API_ERROR_UNSUPPORTED_TEAM } from "./Pay";

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

const PayBody: React.FC<PayBodyProps> = (props) => {
  const path = useStore((state) => state.path);
  const isSaveReturn = path === ApplicationPath.SaveAndReturn;
  const defaults = getDefaultContent();

  if (props.error) {
    if (props.error.startsWith(PAY_API_ERROR_UNSUPPORTED_TEAM)) {
      return (
        <Card handleSubmit={props.onConfirm} isValid>
          <ErrorSummary
            format="error"
            heading={props.error}
            message="Click continue to skip payment and proceed with your application for testing."
          />
        </Card>
      );
    } else {
      return (
        <Card>
          <ErrorSummary
            format="error"
            heading={props.error}
            message="This error has been logged and our team will see it soon. You can safely close this tab and try resuming again soon by returning to this URL."
          />
        </Card>
      );
    }
  }

  return (
    <Card>
      <PayText>
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
          {props.hidePay
            ? "Continue"
            : props.buttonTitle || "Pay now using GOV.UK Pay"}
        </Button>
        {!props.hidePay && props.showInviteToPay && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={props.changePage}
            disabled={Boolean(props?.paymentStatus)}
            data-testid="invite-page-link"
          >
            {"Invite someone else to pay for this application"}
          </Button>
        )}
        {isSaveReturn && <SaveResumeButton />}
      </PayText>
    </Card>
  );
};

export default function Confirm(props: Props) {
  const theme = useTheme();
  const [page, setPage] = useState<"Pay" | "InviteToPay">("Pay");

  const defaults = getDefaultContent();

  const changePage = () => {
    if (page === "Pay" && !props.paymentStatus) {
      setPage("InviteToPay");
    } else {
      setPage("Pay");
    }
  };

  const inviteToPayFormProps: InviteToPayFormProps = {
    nomineeTitle: props.nomineeTitle,
    nomineeDescription: props.nomineeDescription,
    yourDetailsTitle: props.yourDetailsTitle,
    yourDetailsDescription: props.yourDetailsDescription,
    yourDetailsLabel: props.yourDetailsLabel,
    paymentStatus: props.paymentStatus,
    changePage,
  };

  return (
    <Box textAlign="left" width="100%">
      <>
        <Container maxWidth="contentWrap">
          <Typography variant="h2" component="h1" align="left" pb={3}>
            {page === "Pay" ? props.title : props.secondaryPageTitle}
          </Typography>
        </Container>
        {page === "Pay" && !props.hideFeeBanner && (
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
            {hasFeatureFlag("FEE_BREAKDOWN") && <FeeBreakdown />}
          </Banner>
        )}
        {page === "Pay" ? (
          <PayBody changePage={changePage} {...props} />
        ) : (
          <InviteToPayForm {...inviteToPayFormProps} />
        )}
      </>
    </Box>
  );
}
