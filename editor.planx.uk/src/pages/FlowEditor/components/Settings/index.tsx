import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Close from "@material-ui/icons/Close";
import { HEADER_HEIGHT } from "components/Header";
import React from "react";
import { Link, useCurrentRoute, useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";
import type { FlowSettings } from "types";

import DataManagerSettings from "./DataManagerSettings";
import DesignSettings from "./DesignSettings";
import ServiceFlags from "./ServiceFlags";
import ServiceSettings from "./ServiceSettings";
import TeamSettings from "./TeamSettings";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
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
        <Container maxWidth="sm" disableGutters>
          <Box py={7}>{children}</Box>
        </Container>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

const tabStyles = makeStyles((theme: Theme) => ({
  tab: {
    position: "relative",
    zIndex: 1,
    textTransform: "none",
  },
}));

function LinkTab(props: LinkTabProps) {
  const classes = tabStyles();
  return (
    <Tab
      component="a"
      className={classes.tab}
      disableRipple
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!event.metaKey) {
          event.preventDefault();
        }
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f2f2f2",
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabs: {
    backgroundColor: "#ddd",
  },
  tabIndicator: {
    height: "100%",
    backgroundColor: "#f2f2f2",
    zIndex: 0,
  },
}));

const tabsOrder = ["team", "service", "flags", "design", "data-manager"];

const NavTabs: React.FC<{ tab?: string; settings?: FlowSettings }> = (
  props
) => {
  const classes = useStyles();
  const { navigate } = useNavigation();
  const { data } = useCurrentRoute();

  const flowBaseRoute = rootFlowPath(true);

  const makeHref = (path: any) =>
    [data.mountpath, path].filter(Boolean).join("/");

  const handleChange = (event: React.ChangeEvent<any>) => {
    navigate(event.currentTarget.pathname);
  };

  const value = tabsOrder.indexOf(props.tab || "");

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default" elevation={0}>
        <Grid container wrap="nowrap">
          <Grid item xs={12}>
            <Tabs
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
              <LinkTab label="Team" href={makeHref("")} {...a11yProps(0)} />
              <LinkTab
                label="Service"
                href={makeHref("service")}
                {...a11yProps(1)}
              />
              <LinkTab
                label="Flags"
                href={makeHref("flags")}
                {...a11yProps(2)}
              />
              <LinkTab
                label="Design"
                href={makeHref("design")}
                {...a11yProps(3)}
              />
              <LinkTab
                label="Data Manager"
                href={makeHref("data-manager")}
                {...a11yProps(4)}
              />
            </Tabs>
          </Grid>
          <Grid item>
            <IconButton
              component={Link}
              href={flowBaseRoute}
              aria-label="Close"
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>
      <TabPanel value={value} index={0}>
        <TeamSettings />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ServiceSettings settings={props.settings} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ServiceFlags
          flagSets={[
            {
              id: 1,
              name: "Flag set by others",
              dataField: "data field by others",
              flags: [
                {
                  title: "Flag 1",
                  dataValue: "data value",
                  color: "#FF0000",
                },
                {
                  title: "Flag 2",
                  dataValue: "data value",
                  color: "#579028",
                },
              ],
            },
          ]}
        />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <DesignSettings />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <DataManagerSettings />
      </TabPanel>
    </div>
  );
};

export default NavTabs;
