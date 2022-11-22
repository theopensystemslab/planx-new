import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import React from "react";

export interface Props {
  filename: string;
  data: { question: string; responses: any; metadata?: any }[];
  text?: string;
}

const Root = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(1),
  textAlign: "right",
  "& button": {
    background: "none",
    borderStyle: "none",
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
}));

// Render a button which lets the applicant download their application data as a CSV
export default function FileDownload(props: Props): FCReturn {
  const downloadCsv = (filename: string, content: string) => {
    const csv = "data:text/csv;charset=utf-8," + content;
    const data = encodeURI(csv);

    let link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", `${filename}.csv`);
    link.click();
  };

  return (
    <Root>
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
        {props.text || "Download your application (.csv)"}
      </Button>
    </Root>
  );
}
