import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LanguageIcon from "@mui/icons-material/Language";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import { prop, props } from "ramda";
import React, { FC, ReactNode, useEffect, useState } from "react";
import Permission from "ui/editor/Permission";

interface DialogTeamTheme {
  logo: string | null;
  primaryColour: string;
}

interface DialogBaseProps {
  linkDialogOpen: boolean;
  teamSlug: string;
  flowSlug: string;
  isFlowPublished: boolean;
  url: string;
  setLinkDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DialogPropsWithTheme {
  containsTheme: true;
  teamTheme: DialogTeamTheme;
  teamDomain?: string;
}

type DialogProps = DialogBaseProps & DialogPropsWithTheme;

const InactiveLink = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
}));

const PaddedText = styled(Typography)(({ theme }) => ({
  paddingLeft: "31px",
}));

const CopyButton = (props: any) => {
  const [copyMessage, setCopyMessage] = useState<"copy" | "copied">("copy");
  return (
    <Tooltip title={copyMessage}>
      <Button
        component={"button"}
        variant="help"
        onMouseLeave={() => {
          setTimeout(() => {
            setCopyMessage("copy");
          }, 500);
        }}
        onClick={() => {
          setCopyMessage("copied");
          navigator.clipboard.writeText(props.link);
        }}
      >
        <Typography
          display={"flex"}
          flexDirection={"row"}
          gap={"4px"}
          variant="body2"
        >
          <ContentCopyIcon />
          {copyMessage}
        </Typography>
      </Button>
    </Tooltip>
  );
};

const PublishedLink = (props: {
  status?: string;
  subdomain?: string;
  link: string;
  isPublished: boolean;
}) => {
  return (
    <>
      <PaddedText variant="h4" mr={1}>
        {"Subdomain"}
      </PaddedText>
      <Link pl={"31px"} href={props.subdomain}>
        {props.subdomain}
      </Link>
      <PaddedText variant="h4" mr={1}>
        {"Published"}
      </PaddedText>
      <Link pl={"31px"} href={props.link}>
        {props.link}
      </Link>{" "}
    </>
  );
};

const BaseLink = (props: { link: string }) => {
  return (
    <>
      <Link pl={"31px"} href={props.link}>
        {props.link}
      </Link>
    </>
  );
};

const LinkContainer = (props: {
  subdomain?: string;
  titleIcon?: SvgIconProps;
  title: string;
  link: string;
  description?: string;
  status?: string;
  linkComponent: ReactNode;
}) => {
  const infoPadding = "31px";
  return (
    <Box display={"flex"} flexDirection={"column"} gap={"8px"} mb={1}>
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        gap={"7px"}
      >
        <>{props.titleIcon}</>
        <Typography variant="h4" component={"h4"} mr={1}>
          {props.title}
        </Typography>
        <CopyButton link={props.link} />
      </Box>
      <Typography pl={infoPadding}>{props.description}</Typography>
      {props.linkComponent}
    </Box>
  );
};

export default function LinkDialog(props: DialogProps) {
  const [flowStatus, setFlowStatus] = useState<string | undefined>();
  // Retrieving flow status to determine which links to show in View Links
  useEffect(() => {
    const fetchFlowStatus = async () => {
      const { data } = await client.query<any>({
        query: gql`
          query GetFlow($slug: String!, $team_slug: String!) {
            flows(
              limit: 1
              where: {
                slug: { _eq: $slug }
                team: { slug: { _eq: $team_slug } }
              }
            ) {
              status
            }
          }
        `,
        variables: {
          slug: props.flowSlug,
          team_slug: props.teamSlug,
        },
      });
      console.log();
      setFlowStatus(data.flows[0].status);
    };

    fetchFlowStatus();
  }, []);

  return (
    <Dialog
      open={props.linkDialogOpen}
      onClose={() => props.setLinkDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="md"
    >
      <Box padding={1} mb={1} display={"block"} textAlign={"end"}>
        <Button
          variant="text"
          style={{ boxShadow: "none" }}
          onClick={() => {
            props.setLinkDialogOpen(false);
          }}
        >
          <CloseIcon color="action" />
        </Button>
        <Divider />
      </Box>
      <DialogTitle mb={"25px"} variant="h3" component="h3">
        {`Share this flow`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={"25px"} mb={"30px"}>
          <LinkContainer
            titleIcon={<LanguageIcon />}
            title={"Published flow"}
            link={props.url}
            description="View of the currently published version of this flow."
            linkComponent={
              <PublishedLink
                subdomain="thisisasubdomain"
                status={flowStatus}
                link={props.url}
                isPublished={props.isFlowPublished}
              />
            }
          />
          <LinkContainer
            titleIcon={<OpenInNewIcon />}
            title={"Preview flow"}
            link={props.url.replace("/published", "/preview")}
            description="View of the draft data of the main flow and the latest published version of nested flows. This link is representative of what your next published version will look like."
            linkComponent={
              <BaseLink link={props.url.replace("/published", "/draft")} />
            }
          />{" "}
          <Permission.IsPlatformAdmin>
            <LinkContainer
              titleIcon={<OpenInNewOffIcon />}
              title={"Draft flow"}
              link={props.url.replace("/published", "/draft")}
              description="View of the draft data of the main flow and the draft data of nested flows.This link is not representative of what your next published version will look like."
              linkComponent={
                <BaseLink link={props.url.replace("/published", "/draft")} />
              }
            />
          </Permission.IsPlatformAdmin>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
