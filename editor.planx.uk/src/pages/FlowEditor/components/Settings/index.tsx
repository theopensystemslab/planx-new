import Close from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { HEADER_HEIGHT } from "components/Header";
import React  from "react";
import { Link, useNavigation } from "react-navi";

interface SettingsProps {
  currentTab: string,
  tabs: {
    route: string,
    name: string,
    Component: React.FC,
  }[]
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Container maxWidth="formWrap" disableGutters>
          <Box py={7}>{children}</Box>
        </Container>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

const StyledTab = styled(Tab)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  textTransform: "none",
  background: theme.palette.background.default,
})) as typeof Tab;

function LinkTab(props: LinkTabProps) {
  return (
    <StyledTab
      component="a"
      disableRipple
      onClick={(event) => {
        if (!event.metaKey) {
          event.preventDefault();
        }
      }}
      {...props}
    />
  );
}

const PREFIX = "Settings";

const classes = {
  tabs: `${PREFIX}-tabs`,
  tabIndicator: `${PREFIX}-tabIndicator`,
};

const Root = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  position: "absolute",
  top: HEADER_HEIGHT,
  left: 0,
  right: 0,
  minHeight: `calc(100% - ${HEADER_HEIGHT}px)`,
  zIndex: "2000",
  [`& .${classes.tabs}`]: {
    backgroundColor: theme.palette.border.main,
  },
  [`& .${classes.tabIndicator}`]: {
    height: "100%",
    backgroundColor: "#f2f2f2",
    zIndex: 0,
  },
}));

const Settings: React.FC<SettingsProps> = ({ currentTab, tabs }) => {
  const { navigate } = useNavigation();

  const handleChange = (event: React.ChangeEvent<any>) => {
    navigate(event.currentTarget.pathname);
  };

  const value = tabs.findIndex(({ route }) => route === currentTab);

  return (
    <Root>
      <AppBar position="static" color="default" enableColorOnDark elevation={0}>
        <Grid container wrap="nowrap">
          <Grid item xs={12}>
            <Tabs
              textColor="inherit"
              indicatorColor="primary"
              variant="fullWidth"
              value={value}
              onChange={handleChange}
              aria-label="settings tabs"
              classes={{
                root: classes.tabs,
                indicator: classes.tabIndicator,
              }}
            >
              {tabs.map(({ name, route }, index) =>
                <LinkTab
                  key={`${name}-LinkTab`}
                  label={name}
                  href={`./${route}`}
                  {...a11yProps(index)}
                />
              )}
            </Tabs>
          </Grid>
          <Grid item>
            <IconButton
              component={Link}
              href={"../../"}
              aria-label="Close"
              size="large"
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>
      {tabs.map(({ name, Component }, index) =>
        <TabPanel value={value} index={index} key={`${name}-TabPanel`}>
          <Component />
        </TabPanel>
      )}
    </Root>
  );
};

export default Settings;
