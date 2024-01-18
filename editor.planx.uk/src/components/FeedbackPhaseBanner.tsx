import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.paper,
}));

const ReportButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  padding: "0.7em 1em",
}));

const Inner = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  padding: theme.spacing(0.75, 0),
}));

const PhaseWrap = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
  padding: theme.spacing(0.5, 1, 0.5, 0),
}));

const BetaFlag = styled(Box)(({ theme }) => ({
  betaIcon: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
      marginRight: theme.spacing(2),
    },
  },
}));

export default function FeedbackPhaseBanner(): FCReturn {
  return (
    <Root>
      <Container maxWidth="contentWrap">
        <Inner>
          <PhaseWrap>
            <BetaFlag
              bgcolor="primary.dark"
              color="white"
              display="flex"
              alignItems="flex-start"
              flexBasis={0}
              px={1}
              mr={1}
              py={0.5}
              fontSize={14}
              textAlign="center"
              whiteSpace="nowrap"
              fontWeight={600}
            >
              PUBLIC BETA
            </BetaFlag>
            <Typography
              variant="body2"
              color="textPrimary"
              textAlign="left"
              mt="0.2em"
            >
              This is a new service. Your <Link>feedback</Link> will help us
              improve it.
            </Typography>
          </PhaseWrap>
          <ReportButton>Report an issue with this page</ReportButton>
        </Inner>
      </Container>
    </Root>
  );
}
