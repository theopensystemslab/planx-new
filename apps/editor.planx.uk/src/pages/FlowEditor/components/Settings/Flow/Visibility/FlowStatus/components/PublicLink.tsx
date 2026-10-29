import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { FlowStatus } from "@opensystemslab/planx-core/types";
import React from "react";
import { CopyButton } from "ui/editor/CopyButton";
import SettingsDescription from "ui/editor/SettingsDescription";

const TitledLink: React.FC<{
  link: string;
  isActive: boolean;
  helpText: string | undefined;
}> = ({ link, isActive, helpText }) => {
  return (
    <Box sx={{ paddingBottom: 0.5, mt: 1 }}>
      <Typography sx={{ mb: 0.5 }} variant="h4">
        Your public link
        <CopyButton isActive={isActive} value={link} />
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
        return "Publish your service to activate the public link.";
      case isFlowPublished && !isFlowOnline:
        return "Switch your service status to 'online' to activate the public link.";
      case !isFlowPublished && !isFlowOnline:
        return "Publish your service and switch it to 'online' to activate the public link.";
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
