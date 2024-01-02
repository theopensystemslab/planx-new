import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Meta } from "@storybook/react";
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
