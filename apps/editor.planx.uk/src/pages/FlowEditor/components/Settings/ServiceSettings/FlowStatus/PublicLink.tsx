import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import SettingsDescription from "ui/editor/SettingsDescription";

export const CopyButton = (props: { link: string; isActive: boolean }) => {
  const [copyMessage, setCopyMessage] = useState<"copy" | "copied">("copy");
  return (
    <Button
      disabled={!props.isActive}
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
      sx={{ marginLeft: 0.5 }}
    >
      <ContentCopyIcon style={{ width: "18px", height: "18px" }} />
      <Typography ml={0.5} variant="body3">
        {copyMessage}
      </Typography>
    </Button>
  );
};

const TitledLink: React.FC<{
  link: string;
  isActive: boolean;
  helpText: string | undefined;
}> = ({ link, isActive, helpText }) => {
  return (
    <Box paddingBottom={0.5} mt={1}>
      <Typography mb={0.5} variant="h4">
        Your public link
        <CopyButton isActive={isActive} link={link} />
      </Typography>
      <SettingsDescription>
        <Typography variant="body2">{helpText}</Typography>
      </SettingsDescription>
      {isActive ? (
        <Link
          variant="body2"
          href={link}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          {link}
        </Link>
      ) : (
        <Typography
          style={{ color: "GrayText", textDecoration: "underline" }}
          variant="body2"
        >
          {link}
        </Typography>
      )}
    </Box>
  );
};

export const PublicLink: React.FC<{
  isFlowPublished: boolean;
  status: FlowStatus;
  subdomain: string;
  publishedLink: string;
}> = ({ isFlowPublished, status, subdomain, publishedLink }) => {
  const isFlowPublic = isFlowPublished && status === "online";
  const hasSubdomain = Boolean(subdomain);

  const publicLinkHelpText = () => {
    const isFlowOnline = status === "online";
    switch (true) {
      case isFlowPublished && isFlowOnline:
        return undefined;
      case !isFlowPublished && isFlowOnline:
        return "Publish your flow to activate the public link.";
      case isFlowPublished && !isFlowOnline:
        return "Switch your flow to 'online' to activate the public link.";
      case !isFlowPublished && !isFlowOnline:
        return "Publish your flow and switch it to 'online' to activate the public link.";
    }
  };

  switch (true) {
    case isFlowPublic && hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={true}
          link={subdomain}
        />
      );
    case isFlowPublic && !hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={true}
          link={publishedLink}
        />
      );
    case !isFlowPublic && hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={false}
          link={subdomain}
        />
      );
    case !isFlowPublic && !hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={false}
          link={publishedLink}
        />
      );
  }
};
