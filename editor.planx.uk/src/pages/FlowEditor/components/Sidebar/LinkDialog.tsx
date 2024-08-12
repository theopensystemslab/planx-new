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
import React, { useEffect, useState } from "react";

import { client } from "../../../../lib/graphql";
import Permission from "../../../../ui/editor/Permission";

interface DialogBaseProps {
  linkDialogOpen: boolean;
  teamDomain?: string;
  teamSlug: string;
  flowSlug: string;
  isFlowPublished: boolean;
  url: string;
  setLinkDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LinkProps {
  subdomain?: string;
  titleIcon?: SvgIconProps;
  title: string;
  link: string;
  description?: string;
  status?: string;
  type: "published" | "draft" | "preview";
  isPublished?: boolean;
}

type PublishedLinkProps = Pick<
  LinkProps,
  "status" | "subdomain" | "link" | "isPublished"
>;

const InactiveLink = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
}));

const PaddedText = styled(Typography)(({ theme }) => ({
  paddingLeft: "31px",
}));

const LinkBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
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
        sx={{ marginLeft: "8px" }}
      >
        <Typography
          display={"flex"}
          flexDirection={"row"}
          gap={"4px"}
          variant="body3"
        >
          <ContentCopyIcon style={{ width: "18px", height: "18px" }} />
          {copyMessage}
        </Typography>
      </Button>
    </Tooltip>
  );
};

const InactivePublishedLink = (props: any) => {
  return (
    <LinkBox>
      {" "}
      <PaddedText variant="h4">{props.title}</PaddedText>
      <InactiveLink pl={"31px"}>{props.message}</InactiveLink>{" "}
    </LinkBox>
  );
};

const ActivePublishedLink = (props: any) => {
  return (
    <LinkBox>
      {" "}
      <PaddedText variant="h4">
        {props.title} <CopyButton link={props.link} />
      </PaddedText>
      <Link pl="31px" href={props.link}>
        {props.link}
      </Link>
    </LinkBox>
  );
};

const PublishedLinkContent = (props: PublishedLinkProps) => {
  return (
    <Stack spacing={"15px"}>
      {props.subdomain && props.status === "online" && props.isPublished ? (
        <ActivePublishedLink title="With subdomain" link={props.subdomain} />
      ) : props.subdomain && props.status === "online" && !props.isPublished ? (
        <InactivePublishedLink
          title="With subdomain"
          message={props.subdomain}
        />
      ) : props.subdomain && props.status === "offline" && props.isPublished ? (
        <InactivePublishedLink
          title="With subdomain"
          message={props.subdomain}
        />
      ) : (
        <InactivePublishedLink
          title="With subdomain"
          message={"There is not a domain configured for this team"}
        />
      )}
      {props.isPublished && props.status === "online" ? (
        <ActivePublishedLink title="PlanX link" link={props.link} />
      ) : (
        <InactivePublishedLink title="PlanX link" message={props.link} />
      )}
    </Stack>
  );
};

const LinkContainer = (props: LinkProps) => {
  const infoPadding = "31px";
  return (
    <Box display={"flex"} flexDirection={"column"} gap={"15px"} mb={1}>
      <LinkBox>
        <Box
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          gap={"7px"}
        >
          <>{props.titleIcon}</>
          <Typography variant="h4" component={"h4"}>
            {props.title}
          </Typography>
          {props.type !== "published" && <CopyButton link={props.link} />}
        </Box>
        <Typography pl={infoPadding}>{props.description}</Typography>
        {props.status === "offline" && props.type === "published" && (
          <Typography pl={infoPadding}>
            You can switch it to “Online” in your{" "}
            <Link href={props.link.replace("/published", "/service")}>
              Service Settings
            </Link>
          </Typography>
        )}
      </LinkBox>
      {props.type === "published" ? (
        <PublishedLinkContent
          status={props.status}
          subdomain={props.subdomain}
          link={props.link}
          isPublished={props.isPublished}
        />
      ) : (
        <Link pl={"31px"} href={props.link}>
          {props.link}
        </Link>
      )}
    </Box>
  );
};

export default function LinkDialog(props: DialogBaseProps) {
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
      setFlowStatus(data.flows[0].status);
    };

    fetchFlowStatus();
  }, []);

  const unpublishedOfflineDescription =
    "The flow is not yet published and is not yet viewable by the public.";

  const publishedOfflineDescription =
    "The published version of this flow. It is not yet viewable by the public.";

  const publishedOnlineDescription =
    "The published version of the flow that is viewable by the public.";

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
            title={"Published"}
            link={props.url}
            description={
              !props.isFlowPublished && flowStatus !== "online"
                ? unpublishedOfflineDescription
                : props.isFlowPublished && flowStatus !== "online"
                ? publishedOfflineDescription
                : publishedOnlineDescription
            }
            type="published"
            isPublished={props.isFlowPublished}
            status={flowStatus}
            subdomain={
              props.teamDomain && `${props.teamDomain}/${props.flowSlug}`
            }
          />
          <LinkContainer
            titleIcon={<OpenInNewIcon />}
            title={"Preview"}
            link={props.url.replace("/published", "/preview")}
            description="This link is representative of what your next published version will look like. It contains the draft data of the main flow and the latest published version of nested flows. "
            type="preview"
          />{" "}
          <Permission.IsPlatformAdmin>
            <LinkContainer
              titleIcon={<OpenInNewOffIcon />}
              title={"Draft"}
              link={props.url.replace("/published", "/draft")}
              description="This link is not representative of what your next published version will look like. It contains the draft data of the main flow and the draft data of nested flows."
              type="draft"
            />
          </Permission.IsPlatformAdmin>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
