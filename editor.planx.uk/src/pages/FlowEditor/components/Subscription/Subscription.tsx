import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import sumBy from "lodash/sumBy";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import SettingsSection from "ui/editor/SettingsSection";

import { ServiceCharge } from "./types";

interface Props {
  serviceCharges: ServiceCharge[];
}

export const Subscription = ({ serviceCharges }: Props) => {
  const years = Array.from(new Set(serviceCharges.map((sc) => sc.paidAtYear)));
  const [activeYear, setActiveYear] = useState<number>(years[0]);

  const serviceChargesInActiveYear = serviceCharges.filter(
    (sc) => sc.paidAtYear === activeYear,
  );

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Subscription
        </Typography>
        <Typography variant="body1">
          Details about your Plan✕ software subscription.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <Typography variant="h3" component="h4" gutterBottom>
          Service charges
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Summary of service charges paid by applicants. Service charges count
          as a discount towards your next renewal cost of Plan✕ and are invoiced
          by OSL quarterly.
        </Typography>
        <AnnualServiceChargeCards
          serviceCharges={serviceCharges}
          years={years}
          activeYear={activeYear}
          setActiveYear={setActiveYear}
        />
        <Box>
          <Typography variant="h4" component="h5" mt={4} gutterBottom>
            {`${activeYear} ${new Date().getFullYear() === activeYear ? "year-to-date" : ""} service charges`}
          </Typography>
          <ServiceChargesByQuarterAccordion
            serviceCharges={serviceChargesInActiveYear}
          />
          <ServiceChargesByMonthAccordion
            serviceCharges={serviceChargesInActiveYear}
          />
          <ServiceChargeByFlowAccordion
            serviceCharges={serviceChargesInActiveYear}
          />
        </Box>
        <Box
          sx={{ marginTop: (theme) => theme.spacing(1), textAlign: "right" }}
        >
          <Link component="button" onClick={() => console.log("todo")}>
            <Typography variant="body2">
              {"Download service charge payment records (.csv)"}
            </Typography>
          </Link>
        </Box>
      </SettingsSection>
      <SettingsSection background>
        <Typography variant="h3" component="h4" gutterBottom>
          Invoices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your next invoice date.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <Typography variant="h3" component="h4" gutterBottom>
          SSL renewal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your expiration date for your SSL certificate. An active SSL
          certificate is required to host your sevices on a custom subdomain.
        </Typography>
      </SettingsSection>
    </Container>
  );
};

interface AnnualServiceChargeCardProps extends Props {
  years: number[];
  activeYear: number;
  setActiveYear: React.Dispatch<React.SetStateAction<number>>;
}

const AnnualServiceChargeCards = ({
  serviceCharges,
  years,
  activeYear,
  setActiveYear,
}: AnnualServiceChargeCardProps) => (
  <Box
    sx={{
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
      gap: 2,
    }}
  >
    {years.map((year) => (
      <Card>
        <CardActionArea
          onClick={() => setActiveYear(year)}
          data-active={activeYear === year ? "" : undefined}
          sx={{
            height: "100%",
            border: (theme) => `1px solid ${theme.palette.border.main}`,
            "&[data-active]": {
              borderBottom: (theme) =>
                `5px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => theme.palette.background.default,
              "&:hover": {
                backgroundColor: "action.selectedHover",
              },
            },
          }}
          disableRipple
          disableTouchRipple
        >
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="h2" component="div">
              {year}
            </Typography>
            <Typography variant="body2" mt={3}>
              <strong>
                {sumServiceCharges(
                  serviceCharges.filter((sc) => sc.paidAtYear === year),
                )}
              </strong>
              {` in service charges ${new Date().getFullYear() === year ? `year-to-date` : `in ${year}`}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    ))}
  </Box>
);

const ServiceChargesByQuarterAccordion = ({ serviceCharges }: Props) => {
  const quarters = Array.from(
    new Set(serviceCharges.map((sc) => sc.paidAtQuarter)),
  );

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="by-quarter-content"
        id="by-quarter-header"
      >
        <Typography component="span" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
          By quarter
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <StyledTable>
            <Header unit={"Quarter"} />
            {quarters.map((q) => (
              <StyledTableRow>
                <TableCell>{`Q${q}`}</TableCell>
                <TableCell align="right">
                  <strong>
                    {sumServiceCharges(
                      serviceCharges.filter((sc) => sc.paidAtQuarter === q),
                    )}
                  </strong>
                </TableCell>
              </StyledTableRow>
            ))}
            <TotalRow serviceCharges={serviceCharges} />
          </StyledTable>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

const ServiceChargesByMonthAccordion = ({ serviceCharges }: Props) => {
  const months = Array.from(
    new Set(serviceCharges.map((sc) => sc.paidAtMonthText)),
  );

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="by-month-content"
        id="by-month-header"
      >
        <Typography component="span" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
          By month
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <StyledTable>
            <Header unit={"Month"} />
            {months.map((m) => (
              <StyledTableRow>
                <TableCell>{m}</TableCell>
                <TableCell align="right">
                  <strong>
                    {sumServiceCharges(
                      serviceCharges.filter((sc) => sc.paidAtMonthText === m),
                    )}
                  </strong>
                </TableCell>
              </StyledTableRow>
            ))}
            <TotalRow serviceCharges={serviceCharges} />
          </StyledTable>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

const ServiceChargeByFlowAccordion = ({ serviceCharges }: Props) => {
  const flows = Array.from(new Set(serviceCharges.map((sc) => sc.flowName)));

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="by-service-content"
        id="by-service-header"
      >
        <Typography component="span" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
          By service
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <StyledTable>
            <Header unit={"Service"} />
            {flows.map((f) => (
              <StyledTableRow>
                <TableCell>{f}</TableCell>
                <TableCell align="right">
                  <strong>
                    {sumServiceCharges(
                      serviceCharges.filter((sc) => sc.flowName === f),
                    )}
                  </strong>
                </TableCell>
              </StyledTableRow>
            ))}
            <TotalRow serviceCharges={serviceCharges} />
          </StyledTable>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

const StyledTable = styled(Table)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.contentWrap,
  [`& .${tableCellClasses.root}`]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const BoldTableRow = styled(TableRow)(({ theme }) => ({
  background: theme.palette.background.paper,
  [`& .${tableCellClasses.root}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  background: theme.palette.background.default,
  "&:nth-of-type(even)": {
    background: theme.palette.background.paper,
  },
}));

const Header = ({ unit }: { unit: string }) => (
  <TableHead>
    <BoldTableRow>
      <TableCell>{unit}</TableCell>
      <TableCell align="right">Amount (excl VAT)</TableCell>
    </BoldTableRow>
  </TableHead>
);

const TotalRow = ({ serviceCharges }: Props) => (
  <StyledTableRow>
    <TableCell>
      <strong>Total</strong>
    </TableCell>
    <TableCell align="right">
      <strong>{sumServiceCharges(serviceCharges)}</strong>
    </TableCell>
  </StyledTableRow>
);

const sumServiceCharges = (serviceCharges: ServiceCharge[]) => {
  const sum = sumBy(serviceCharges, "amount");
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(sum);
};
