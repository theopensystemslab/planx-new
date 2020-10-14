import { gql } from "@apollo/client";
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  Add,
  CallSplitOutlined,
  DeleteOutline,
  FolderOutlined,
  MoreVert,
} from "@material-ui/icons";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import React from "react";
import { Link } from "react-navi";
import { client } from "../lib/graphql";
import { api } from "./FlowEditor/lib/store";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    width: "100%",
    flex: 1,
    justifyContent: "flex-start",
    // paddingTop: "calc(12vh + 75px)",
    alignItems: "center",
  },
  back: {
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
    padding: theme.spacing(1, 2, 1, 1),
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  },
  dashboard: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    width: "100%",
    maxWidth: 600,
    margin: "auto",
    padding: theme.spacing(8, 0, 4, 0),
  },
  dashboardList: {
    padding: theme.spacing(0, 0, 3),
    borderBottom: "1px solid #fff",
    margin: 0,
    "& li": {
      listStyle: "none",
    },
  },
  dashboardListItem: {
    position: "relative",
    padding: theme.spacing(3, 2),
  },
  dashboardLink: {
    display: "block",
    fontSize: theme.typography.h3.fontSize,
    textDecoration: "none",
    color: "currentColor",
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
    marginTop: 0,
  },
  menu: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(1),
  },
  linkSubText: {
    color: "#aaa",
    "& a": {
      color: "#fff",
    },
    "& + $linkSubText": {
      marginTop: theme.spacing(1),
    },
  },
}));

const flowInfoHelper = (time, operations = []) => {
  let str = `Edited ${formatDistanceToNow(new Date(time))} ago`;
  // there will always be an user attached to every sharedb
  // operation soon, so the if statement won't be necessary
  if (operations[0].actor) {
    const { first_name, last_name } = operations[0].actor;
    str += ` by ${first_name} ${last_name}`;
  }
  return str;
};

const Confirm = ({
  title,
  content,
  submitLabel,
  open,
  onClose,
  onConfirm,
}: {
  title: string;
  content: string;
  submitLabel: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Dialog
    open={open}
    onClose={() => {
      onClose();
    }}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="primary" autoFocus>
        {submitLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

const useAddButtonStyles = makeStyles((theme) => ({
  addButton: {
    width: "100%",
    padding: theme.spacing(6),
    fontSize: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    display: "block",
    textAlign: "left",
    marginTop: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(3),
    verticalAlign: "middle",
  },
}));

const AddButton = ({ children, ...props }) => {
  const classes = useAddButtonStyles();
  return (
    <ButtonBase className={classes.addButton} {...props}>
      <Add className={classes.icon} /> {children}
    </ButtonBase>
  );
};

const FooterLinks = () => (
  <List>
    <ListItem button disabled>
      <ListItemIcon>
        <CallSplitOutlined />
      </ListItemIcon>
      <ListItemText>Flows</ListItemText>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <FolderOutlined />
      </ListItemIcon>
      <ListItemText>Archive</ListItemText>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <DeleteOutline />
      </ListItemIcon>
      <ListItemText>Trash</ListItemText>
    </ListItem>
  </List>
);

const FlowItem = ({ flow, teamId }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const handleDelete = () => {
    api
      .getState()
      .deleteFlow(teamId, flow.slug)
      .then(() => {
        setDeleting(false);
        setAnchorEl(null);

        // TODO: remove flow from list rather than this hard refresh
        window.location.reload();
      });
  };
  return (
    <>
      {deleting && (
        <Confirm
          title="Confirm Delete"
          open={deleting}
          content="Deleting a service cannot be reversed."
          onClose={() => {
            setDeleting(false);
          }}
          onConfirm={handleDelete}
          submitLabel="Delete Service"
        />
      )}
      <li key={flow.slug} className={classes.dashboardListItem}>
        <Link
          href={`./${flow.slug}`}
          className={classes.dashboardLink}
          prefetch={false}
        >
          {flow.slug}
        </Link>
        <Box className={classes.linkSubText}>
          {flowInfoHelper(flow.updated_at, flow.operations)}
        </Box>
        <div>
          <IconButton
            color="inherit"
            className={classes.menu}
            size="small"
            onClick={(ev) => {
              setAnchorEl(ev.currentTarget);
            }}
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem
              onClick={async () => {
                const newSlug = prompt("New name", flow.slug);
                if (newSlug && newSlug !== flow.slug) {
                  await client.mutate({
                    mutation: gql`
                      mutation MyMutation(
                        $teamId: Int
                        $slug: String
                        $newSlug: String
                      ) {
                        update_flows(
                          where: {
                            team: { id: { _eq: $teamId } }
                            slug: { _eq: $slug }
                          }
                          _set: { slug: $newSlug }
                        ) {
                          affected_rows
                        }
                      }
                    `,
                    variables: {
                      teamId: teamId,
                      slug: flow.slug,
                      newSlug: newSlug,
                    },
                  });

                  window.location.reload();
                }
              }}
            >
              Rename
            </MenuItem>

            <MenuItem
              style={{ color: "red" }}
              onClick={() => {
                setDeleting(true);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
      </li>
    </>
  );
};

const Team: React.FC<{ flows: any[]; id }> = ({ flows, id }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.dashboard}>
        <Box pl={2} pb={2}>
          <Typography variant="h1" gutterBottom>
            My services
          </Typography>
        </Box>
        <ul className={classes.dashboardList}>
          {flows.map((flow: any) => (
            <FlowItem flow={flow} key={flow.slug} teamId={id} />
          ))}
          <AddButton
            onClick={() => {
              const newFlowName = prompt("Service name");
              if (newFlowName) {
                api
                  .getState()
                  // .createFlow(id, newFlowName);
                  .createFlow(id, newFlowName, { _root: {} });
              }
            }}
          >
            Add a new service
          </AddButton>
        </ul>
        <FooterLinks />
      </Box>
    </Box>
  );
};

export default Team;
