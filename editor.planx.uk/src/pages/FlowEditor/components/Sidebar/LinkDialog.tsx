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
import React, { useState } from "react";
import Permission from "ui/editor/Permission";

interface DialogTeamTheme {
  logo: string | null;
  primaryColour: string;
}

interface DialogBaseProps {
  linkDialogOpen: boolean;
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

const ImageWrapper = styled(Box)(() => ({
  height: 24,
  width: 24,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2px",
}));

const InactiveLink = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
}));

const LinkComponent = (props: {
  linkType: "published" | "draft" | "subdomain" | "preview";
  primaryColour?: string;
  titleIcon?: string | SvgIconProps;
  title: string;
  link: string;
  description?: string;
  isPublished?: boolean;
}) => {
  const [copyMessage, setCopyMessage] = useState<"copy" | "copied">("copy");

  return (
    <Box display={"flex"} flexDirection={"column"} gap={"8px"} mb={1}>
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        gap={"7px"}
      >
        {typeof props.titleIcon === "string" ? (
          <ImageWrapper sx={{ backgroundColor: props.primaryColour }}>
            <img
              height={"auto"}
              width={20}
              src={props.titleIcon || undefined}
              alt="Local authority logo"
            />
          </ImageWrapper>
        ) : (
          <>{props.titleIcon}</>
        )}

        <Typography variant="h4" component={"h4"} mr={1}>
          {props.title}
        </Typography>
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
            disabled={props.linkType === "published" && !props.isPublished}
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
      </Box>
      <Typography>{props.description}</Typography>
      {}
      {props.linkType === "published" && !props.isPublished ? (
        <InactiveLink variant="body1">{props.link}</InactiveLink>
      ) : (
        <Link
          href={props.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ "&:hover": { cursor: "pointer" } }}
        >
          {props.link}
        </Link>
      )}
    </Box>
  );
};

export default function LinkDialog(props: DialogProps) {
  console.log(props.linkDialogOpen);
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
          {props.teamDomain && props.teamTheme ? (
            <LinkComponent
              linkType="subdomain"
              primaryColour={props.teamTheme.primaryColour}
              titleIcon={props.teamTheme.logo || undefined}
              title={"Published flow with subdomain"}
              link={`${props.teamDomain}/${props.flowSlug}`}
            />
          ) : null}
          <LinkComponent
            linkType="published"
            titleIcon={<LanguageIcon />}
            title={"Published flow"}
            isPublished={props.isFlowPublished}
            link={props.url}
            description="View of the currently published version of this flow."
          />
          <LinkComponent
            linkType="preview"
            titleIcon={<OpenInNewIcon />}
            title={"Preview flow"}
            link={props.url.replace("/published", "/preview")}
            description="View of the draft data of the main flow and the latest published version of nested flows. This link is representative of what your next published version will look like."
          />{" "}
          <Permission.IsPlatformAdmin>
            <LinkComponent
              linkType="draft"
              titleIcon={<OpenInNewOffIcon />}
              title={"Draft flow"}
              link={props.url.replace("/published", "/draft")}
              description="View of the draft data of the main flow and the draft data of nested flows.This link is not representative of what your next published version will look like."
            />
          </Permission.IsPlatformAdmin>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
