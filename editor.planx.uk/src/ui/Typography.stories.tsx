import { useTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

const variants = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "button",
  "caption",
  "overline",
] as const;
type VariantTuple = typeof variants;
type Variant = VariantTuple[number];

const metadata: Meta = {
  title: "Design System/Typography",
};

const TypographySwatch: React.FC<{ variant: Variant }> = (props) => {
  const theme = useTheme();

  return (
    <TableRow>
      <TableCell>
        <Typography variant={props.variant}>{props.variant}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {theme.typography[props.variant].fontSize}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export const Variants = () => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="body2">Variant</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">Size</Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {variants.map((variant, i) => (
            <TypographySwatch variant={variant} key={i} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default metadata;
