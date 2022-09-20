import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import OptionButton from "ui/OptionButton";
import SelectInput from "ui/SelectInput";

interface ITeam {}

export const teamStyles = makeStyles((theme) => ({
  root: {
    color: "currentColor",
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  grow: {
    flexGrow: 1,
  },
  inputLabel: {
    position: "absolute",
    color: theme.palette.text.primary,
    fontSize: 12,
    top: -18,
  },
}));

const TeamMember = ({ name, email, userRole }: any) => {
  const [role, setRole] = React.useState(userRole);
  const classes = teamStyles();
  return (
    <Box mb={1.5}>
      <Grid
        container
        spacing={2}
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item>
          <Avatar className={classes.avatar}>{name[0]}</Avatar>
        </Grid>
        <Grid item className={classes.grow}>
          <Typography variant="h5">{name}</Typography>
          <Box fontSize="h5.fontSize">{email}</Box>
        </Grid>
        <Grid item>
          <SelectInput
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="edit">Edit</MenuItem>
            <MenuItem value="view">View</MenuItem>
          </SelectInput>
        </Grid>
        <Grid item>
          <IconButton aria-label="Remove" size="large">
            <Close />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

const Team: React.FC<ITeam> = () => {
  const classes = teamStyles();
  const formik = useFormik({
    initialValues: {},
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h3" gutterBottom>
          <strong>Team</strong>
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service
        </Typography>
      </Box>
      <Box py={4} borderBottom={1}>
        <Box pb={3}>
          <TeamMember
            name="Alice Allenby"
            email="alice.a@council.gov.uk"
            userRole="admin"
          />
          <TeamMember
            name="Remy Sharp"
            email="alice.a@council.gov.uk"
            userRole="edit"
          />
          <TeamMember
            name="Travis Howard"
            email="alice.a@council.gov.uk"
            userRole="view"
          />
        </Box>
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item>
            <Avatar className={classes.avatar}>
              <Add />
            </Avatar>
          </Grid>
          <Grid item className={classes.grow}>
            <Box position="relative">
              <InputLabel className={classes.inputLabel}>Invite new</InputLabel>
              <Input placeholder="enter new email address" fullWidth />
            </Box>
          </Grid>
          <Grid item>
            <SelectInput value="admin">
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem>Edit</MenuItem>
              <MenuItem>Read</MenuItem>
            </SelectInput>
          </Grid>
          <Grid item>
            <Button>Add</Button>
          </Grid>
        </Grid>
      </Box>
      <Box py={3}>
        <Typography variant="h3" gutterBottom>
          <strong>Sharing</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Allow other teams on Plan✕ to find and use your service pattern
        </Typography>
        <Box pt={2}>
          <InputGroup>
            <InputRow>
              <OptionButton selected>Share</OptionButton>
              <InputRowItem width="60%">
                <SelectInput>
                  <MenuItem>Open Government Licence</MenuItem>
                </SelectInput>
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </Box>
      </Box>
    </form>
  );
};
export default Team;
