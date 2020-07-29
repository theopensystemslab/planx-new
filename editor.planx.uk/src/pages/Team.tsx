import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import MoreVert from "@material-ui/icons/MoreVert";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import React from "react";
import { Link } from "react-navi";
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
  },
  dashboardList: {
    padding: theme.spacing(0, 0, 3),
    // borderBottom: "1px solid #fff",
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
          prefetch={false}
          href={`./${flow.slug}`}
          className={classes.dashboardLink}
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
          <li className={classes.dashboardListItem}>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                const newFlowName = prompt("Service name");
                if (newFlowName) api.getState().createFlow(id, newFlowName);
              }}
            >
              Create a new Service
            </Button>
          </li>
          {flows.map((flow: any) => (
            <FlowItem flow={flow} key={flow.slug} teamId={id} />
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default Team;
