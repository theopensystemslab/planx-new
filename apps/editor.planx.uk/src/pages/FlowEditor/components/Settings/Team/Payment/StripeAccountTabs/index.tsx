import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { StripeConnectAccount } from "lib/api/stripe/types";
import React, { useState } from "react";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";
import StyledTab from "ui/editor/StyledTab";

import Address from "../Address";
import ConnectAccount from "../ConnectAccount";
import Details from "../Details";
import Onboarding from "../Onboarding";

const TabList = styled(Box)(() => ({
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

const tabId = (index: number) => `stripe-account-tab-${index}`;
const panelId = (index: number) => `stripe-account-panel-${index}`;

interface StripeAccountTabsProps {
  accounts: StripeConnectAccount[];
}

/**
 * For a team with multiple Stripe accounts, a tab for each account, then one to connect another
 */
export const StripeAccountTabs: React.FC<StripeAccountTabsProps> = ({
  accounts,
}) => {
  const [selected, setSelected] = useState(0);

  // The last tab connects another account - start on it if the team has none yet
  const connectTab = accounts.length;
  const tab = Math.min(selected, connectTab);
  const account = accounts[tab];

  return (
    <NewSettingsSection>
      <Typography variant="h3" component="h2">
        Connected accounts
      </Typography>
      <SettingsDescription>
        <p>
          This team has several Stripe accounts, e.g. one for each council. Each
          payment is paid into the account named after the site's local
          authority district.
        </p>
      </SettingsDescription>
      <TabList>
        <Tabs
          value={tab}
          onChange={(_event, value: number) => setSelected(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Stripe accounts"
          sx={{
            minHeight: 0,
            borderBottom: 1,
            borderColor: "border.main",
          }}
        >
          {accounts.map(({ name }, index) => (
            <StyledTab
              key={name}
              label={name}
              value={index}
              size="large"
              id={tabId(index)}
              aria-controls={panelId(index)}
            />
          ))}
          <StyledTab
            label="Connect an account"
            value={connectTab}
            size="large"
            icon={<AddIcon />}
            iconPosition="start"
            id={tabId(connectTab)}
            aria-controls={panelId(connectTab)}
          />
        </Tabs>
      </TabList>
      <Box role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)}>
        {account ? (
          <Stack key={account.name} spacing={2}>
            <Onboarding account={account.name} />
            <Details account={account} />
            <Address account={account} />
          </Stack>
        ) : (
          <ConnectAccount existingNames={accounts.map(({ name }) => name)} />
        )}
      </Box>
    </NewSettingsSection>
  );
};

export default StripeAccountTabs;
