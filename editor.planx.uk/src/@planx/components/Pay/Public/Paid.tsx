import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DownloadIcon from "@material-ui/icons/GetApp";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";

export default Component;

const useStyles = makeStyles({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
    },
    "& p": {},
    "& p span": {
      fontWeight: 700,
      marginRight: "2rem",
    },
  },
  banner: {
    background: "#F0F9FA",
    marginBottom: "30px",
    padding: "13px",
    "& p": {
      margin: "20px 0",
    },
  },
  capitalize: {
    textTransform: "capitalize",
  },
});

interface Props {
  handleSubmit: () => void;
  amount: number;
  date: string;
  govUkRef: string;
  applicationId?: string;
  status?: string;
}

function Component(props: Props) {
  const c = useStyles();

  const formattedDate = () => {
    const date = new Date(props.date);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <div className={c.root}>
        <div className={c.banner}>
          <Typography variant="h3">Payment summary</Typography>
          <Typography>Amount</Typography>
          <Typography variant="h1">{`£${props.amount}`}</Typography>
        </div>
        <p>
          <span>Created</span>
          {formattedDate()}
        </p>
        <p>
          <span>Status</span>
          {props.status}
        </p>
        <p>
          <span>GOV.UK Payment reference</span>
          {props.govUkRef}
        </p>
        <p>
          <span>Application reference</span>
          {props.applicationId}
        </p>
        <br />
        <br />
        <div style={{ textAlign: "right" }}>
          <Button endIcon={<DownloadIcon />} color="default">
            Download this application
          </Button>
        </div>
      </div>
    </Card>
  );
}
