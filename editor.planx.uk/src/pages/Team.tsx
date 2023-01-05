import { gql } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import CallSplitOutlined from "@mui/icons-material/CallSplitOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";

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

const flowInfoHelper = (time: any, operations: any[] = []) => {
  let str = `Edited ${formatDistanceToNow(new Date(time))} ago`;
  // there will always be an user attached to every sharedb
  // operation soon, so the if statement won't be necessary
  if (operations[0]?.actor) {
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
      <Button onClick={onConfirm} color="primary">
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

function AddButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}): FCReturn {
  const classes = useAddButtonStyles();
  return (
    <ButtonBase className={classes.addButton} onClick={onClick}>
      <Add className={classes.icon} /> {children}
    </ButtonBase>
  );
}

const FooterLinks = () => (
  <List>
    <ListItem button disabled>
      <ListItemIcon>
        <CallSplitOutlined titleAccess="Flows" />
      </ListItemIcon>
      <ListItemText>Flows</ListItemText>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <FolderOutlined titleAccess="Archive" />
      </ListItemIcon>
      <ListItemText>Archive</ListItemText>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <DeleteOutline titleAccess="Trash" />
      </ListItemIcon>
      <ListItemText>Trash</ListItemText>
    </ListItem>
  </List>
);

interface FlowItemProps {
  flow: any;
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowItem: React.FC<FlowItemProps> = ({
  flow,
  teamId,
  teamSlug,
  refreshFlows,
}) => {
  const classes = useStyles();
  const [deleting, setDeleting] = useState(false);
  const handleDelete = () => {
    useStore
      .getState()
      .deleteFlow(teamId, flow.slug)
      .then(() => {
        setDeleting(false);
        refreshFlows();
      });
  };
  const handleCopy = () => {
    useStore
      .getState()
      .copyFlow(flow.id)
      .then(() => {
        refreshFlows();
      });
  };
  const handleMove = (newTeam: string) => {
    useStore
      .getState()
      .moveFlow(flow.id, newTeam)
      .then(() => {
        refreshFlows();
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
        <SimpleMenu
          className={classes.menu}
          items={[
            {
              onClick: async () => {
                const newSlug = prompt("New name", flow.slug);
                if (newSlug && slugify(newSlug) !== flow.slug) {
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
                      newSlug: slugify(newSlug),
                    },
                  });

                  refreshFlows();
                }
              },
              label: "Rename",
            },
            {
              label: "Copy",
              onClick: () => {
                handleCopy();
              },
            },
            {
              label: "Move",
              onClick: () => {
                const newTeam = prompt("New team");
                if (newTeam) {
                  if (slugify(newTeam) === teamSlug) {
                    alert(
                      `This flow already belongs to ${teamSlug}, skipping move`
                    );
                  } else {
                    handleMove(slugify(newTeam));
                  }
                }
              },
            },
            {
              label: "Delete",
              onClick: () => {
                setDeleting(true);
              },
              error: true,
            },
          ]}
        />
      </li>
    </>
  );
};

const Team: React.FC<{ id: number; slug: string }> = ({ id, slug }) => {
  const classes = useStyles();
  const [flows, setFlows] = useState<any[] | null>(null);
  const navigation = useNavigation();
  const fetchFlows = useCallback(() => {
    useStore
      .getState()
      .getFlows(id)
      .then((res: { flows: any[] }) => {
        setFlows(res.flows);
      });
  }, [id, setFlows]);
  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);
  return (
    <Box className={classes.root}>
      <Box className={classes.dashboard}>
        <Box pl={2} pb={2}>
          <Typography variant="h1" gutterBottom>
            My services
          </Typography>
        </Box>
        {flows && (
          <ul className={classes.dashboardList}>
            {flows.map((flow: any) => (
              <FlowItem
                flow={flow}
                key={flow.slug}
                teamId={id}
                teamSlug={slug}
                refreshFlows={() => {
                  fetchFlows();
                }}
              />
            ))}
            <AddButton
              onClick={() => {
                const newFlowName = prompt("Service name");
                if (newFlowName) {
                  const newFlowSlug = slugify(newFlowName);
                  useStore
                    .getState()
                    .createFlow(id, newFlowSlug)
                    .then((newId: string) => {
                      navigation.navigate(`/${slug}/${newId}`);
                    });
                }
              }}
            >
              Add a new service
            </AddButton>
          </ul>
        )}
        <FooterLinks />
      </Box>
    </Box>
  );
};

export default Team;
