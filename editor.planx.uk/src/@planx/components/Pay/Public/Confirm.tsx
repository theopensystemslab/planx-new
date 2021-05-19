import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Checkbox from "@material-ui/core/Checkbox";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";
import Input from "ui/Input";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  banner: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    textAlign: "center",
    padding: theme.spacing(4),
    width: "100%",
    marginTop: theme.spacing(3),
    "& p": {
      textAlign: "left",
    },
    "& a": {
      color: theme.palette.primary.contrastText,
    },
    "& .marginBottom": {
      marginBottom: theme.spacing(3),
    },
  },
  drawerPaper: {
    boxSizing: "border-box",
    width: 300,
    [theme.breakpoints.only("xs")]: {
      width: "100%",
    },
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
    padding: theme.spacing(2),
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "underline",
    cursor: "pointer",
  },
}));

interface Props {
  title?: string;
  description?: string;
  fee: number;
  buttonTitle?: string;
  onConfirm: () => void;
}

export default function Confirm(props: Props) {
  const classes = useStyles();

  return (
    <Box textAlign="left" width="100%">
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom align="left">
          {props.title}
        </Typography>
      </Container>

      <div className={classes.banner}>
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom className="marginBottom">
            The planning fee for this application is
          </Typography>
          <Typography variant="h1" gutterBottom className="marginBottom">
            {`£${props.fee.toFixed(2)}`}
          </Typography>

          <Typography variant="h4">
            <ReactMarkdownOrHtml source={props.description} />
          </Typography>
        </Container>
      </div>

      <Card>
        <div className={classes.root}>
          <Typography variant="h3">How to pay</Typography>
          <Box py={3}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={props.onConfirm}
            >
              {props.buttonTitle || "Pay using GOV.UK Pay"}
            </Button>
          </Box>

          <SuggestionDrawer />
        </div>
      </Card>
    </Box>
  );
}

function SuggestionDrawer() {
  const OTHER_OPTIONS = [
    { name: "Apple", label: "Apple Pay" },
    { name: "BACs", label: "Bank transfer by BACs" },
    { name: "Cheque", label: "Cheque" },
    { name: "PayPal", label: "PayPal" },
    { name: "Phone", label: "Phone" },
    { name: "Other", label: "Other" },
  ];

  const [isOpen, setIsOpen] = React.useState(false);
  const [checkboxes, setCheckboxes] = React.useState(
    // { [name]: false }
    Object.fromEntries(OTHER_OPTIONS.map(({ name }) => [name, false]))
  );
  const [text, setText] = React.useState("");

  const classes = useStyles();

  return (
    <>
      <a className={classes.link} onClick={() => setIsOpen((x) => !x)}>
        Tell us other ways you'd like to pay in the future
      </a>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div>
          <IconButton onClick={() => setIsOpen(false)} aria-label="Close Panel">
            <CloseIcon />
          </IconButton>
          <p>
            What other types of payment would you like this service to accept in
            the future:
          </p>
          <FormGroup row>
            {OTHER_OPTIONS.map((p, i) => (
              <FormControlLabel
                key={i}
                control={<Checkbox name={p.name} />}
                label={p.label}
                onChange={(event: React.ChangeEvent<{}>) => {
                  if (event.target) {
                    setCheckboxes((acc) => ({
                      ...acc,
                      [p.name]: (event.target as any).checked,
                    }));
                  }
                }}
              />
            ))}
          </FormGroup>
          <p>Why would you prefer to use this form of payment?</p>

          <Input
            bordered
            multiline={true}
            rows={3}
            style={{ width: "100%" }}
            onChange={(ev) => {
              setText(ev.target.value);
            }}
            value={text}
          />

          <p style={{ textAlign: "right" }}>
            <ButtonBase onClick={() => setIsOpen(false)}>Save</ButtonBase>
          </p>
        </div>
      </Drawer>
    </>
  );
}
