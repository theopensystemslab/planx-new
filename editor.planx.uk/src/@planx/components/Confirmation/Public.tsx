import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import classnames from "classnames";
import React from "react";
import Banner from "ui/Banner";

const useClasses = makeStyles((theme) => ({
  table: {
    borderCollapse: "collapse",
    "& tr": {
      borderBottom: "1px solid black",
      "&:last-of-type": {
        border: "none",
      },

      "& td": {
        padding: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`,
      },
    },
  },
}));

export default function Confirmation() {
  const classes = useClasses();

  return (
    <Box>
      <Banner heading="Application sent">
        <Box mt={4}>
          <Typography>
            A payment receipt has been emailed to you. You will also receive an
            email to confirm when your application has been received.
          </Typography>
        </Box>
      </Banner>
      <Card>
        <table className={classes.table}>
          <tbody>
            <tr>
              <td>Planning Application Reference</td>
              <td>
                <b>LBL-LDCP-123456</b>
              </td>
            </tr>
            <tr>
              <td>Property Address</td>
              <td>
                <b>45, Greenfield Road, London SE22 7FF</b>
              </td>
            </tr>
            <tr>
              <td>GOV.UK Payment Reference</td>
              <td>
                <b>qe817o3kds9474rfkfldfHSK874JB</b>
              </td>
            </tr>
          </tbody>
        </table>

        <Box height={500}></Box>
      </Card>
    </Box>
  );
}
