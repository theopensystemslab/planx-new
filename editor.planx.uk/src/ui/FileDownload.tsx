import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

export interface Props {
  filename: string;
  data: { question: string; responses: any; metadata?: any }[];
  text?: string;
}

const useClasses = makeStyles((theme) => ({
  download: {
    marginTop: theme.spacing(1),
    textAlign: "right",
    "& button": {
      background: "none",
      "border-style": "none",
      color: theme.palette.text.primary,
      cursor: "pointer",
      fontSize: "inherit",
      fontFamily: "inherit",
      textDecoration: "underline",
      padding: theme.spacing(2),
    },
    "& button:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

// Render a button which lets the applicant download their application data as a CSV
export default function FileDownload(props: Props): FCReturn {
  const classes = useClasses();

  const downloadCsv = (filename: string, content: string) => {
    const csv = "data:text/csv;charset=utf-8," + content;
    const data = encodeURI(csv);

    let link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", `${filename}.csv`);
    link.click();
  };

  return (
    <div className={classes.download}>
      <Button
        onClick={async () => {
          await fetch(`${process.env.REACT_APP_API_URL}/download-application`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(props.data),
          })
            .then((res) => res.text())
            .then((data) => downloadCsv(props.filename, data))
            .catch((error) => console.log(error));
        }}
      >
        {props.text || "Download your application"}
      </Button>
    </div>
  );
}
