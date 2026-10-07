import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import SettingsSection from "ui/editor/SettingsSection";
import CheckCircleIcon from "ui/icons/CheckCircle";

import { type Access, PERMISSION_SECTIONS, ROLES } from "./data";

const StyledTable = styled(Table)(({ theme }) => ({
  [`& .${tableCellClasses.head}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    verticalAlign: "bottom",
    position: "sticky",
    top: 0,
  },
  [`& .${tableCellClasses.root}`]: {
    borderBottom: `1px solid ${theme.palette.border.light}`,
  },
}));

const SectionHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  [`& .${tableCellClasses.root}`]: {
    color: theme.palette.common.white,
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    paddingTop: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

const ACCESS_DISPLAY: Record<
  string,
  {
    Icon: React.ElementType;
    color: "success" | "disabled" | "warning";
    label: string;
  }
> = {
  true: { Icon: CheckCircleIcon, color: "success", label: "Has access" },
  false: { Icon: CloseIcon, color: "disabled", label: "No access" },
  inconsistent: {
    Icon: WarningIcon,
    color: "warning",
    label: "Inconsistent access (see description)",
  },
};

const AccessCell: React.FC<{ access: Access }> = ({ access }) => {
  const { Icon, color, label } = ACCESS_DISPLAY[String(access)];

  return (
    <TableCell align="center">
      <Icon fontSize="small" color={color} aria-hidden />
      <Box component="span" sx={visuallyHidden}>
        {label}
      </Box>
    </TableCell>
  );
};

export const Permissions: React.FC = () => (
  <Container maxWidth="contentWrap">
    <SettingsSection>
      <Typography variant="h2" component="h1" gutterBottom>
        Permissions
      </Typography>
      <Box
        component="ul"
        sx={{ display: "flex", gap: 3, p: 0, mt: 2, listStyle: "none" }}
      >
        {Object.values(ACCESS_DISPLAY).map(({ Icon, color, label }) => (
          <Box component="li" key={label} sx={{ display: "flex", gap: 1 }}>
            <Icon fontSize="small" color={color} aria-hidden /> {label}
          </Box>
        ))}
      </Box>
    </SettingsSection>
    <SettingsSection>
      <StyledTable size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Function</TableCell>
            {ROLES.map(({ role, label }) => (
              <TableCell key={role} align="center">
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PERMISSION_SECTIONS.map(({ title, permissions }) => (
            <React.Fragment key={title}>
              <SectionHeaderRow>
                <TableCell
                  component="th"
                  scope="rowgroup"
                  colSpan={ROLES.length + 1}
                >
                  {title}
                </TableCell>
              </SectionHeaderRow>
              {permissions.map(({ name, description, access }) => (
                <TableRow key={name}>
                  <TableCell component="th" scope="row">
                    {name}
                    {description && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {description}
                      </Typography>
                    )}
                  </TableCell>
                  {ROLES.map(({ role }) => (
                    <AccessCell key={role} access={access[role]} />
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </StyledTable>
    </SettingsSection>
  </Container>
);
