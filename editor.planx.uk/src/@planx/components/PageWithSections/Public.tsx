import { makeStyles } from "@material-ui/core/styles";
import React from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import { PageWithSections } from "./model";

const useStyles = makeStyles((theme) => ({
  table: {
    borderCollapse: "collapse",
    width: "100%",
  },
  cell: {
    padding: 10,
    "&:last-child": {
      textAlign: "right",
    },
    borderTop: "1px solid #ccc",
  },
}));

export type Props = PublicProps<PageWithSections>;

const Component: React.FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Card isValid handleSubmit={() => props.handleSubmit([])}>
      <h1>{props.title}</h1>
      <p role="description">{props.description}</p>
      <table className={classes.table}>
        <tbody>
          {props.sections.map((section) => (
            <tr key={section.id} onClick={section.handleClick}>
              <td className={classes.cell}>{section.title}</td>
              <td className={classes.cell}>{section.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.children}
    </Card>
  );
};

export default Component;
