import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

export interface Props {
  filename: string;
  data: { question: string; responses: any; metadata?: any }[];
  text?: string;
}

const Root = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  textAlign: "right",
}));

// Render a button which lets the applicant download their application data as a CSV
export default function FileDownload(props: Props): FCReturn {
  const downloadCsv = (filename: string, content: string) => {
    const csv = "data:text/csv;charset=utf-8," + content;
    const data = encodeURI(csv);

    const link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", `${filename}.csv`);
    link.click();
  };

  return (
    <Root>
      <Link
        component="button"
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
        <Typography variant="body2">
          {props.text || "Download your application (.csv)"}
        </Typography>
      </Link>
    </Root>
  );
}
