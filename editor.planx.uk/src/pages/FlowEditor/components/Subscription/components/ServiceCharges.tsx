import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
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

import { ServiceCharge, SubscriptionProps } from "../types";

export const ServiceCharges = ({ serviceCharges }: SubscriptionProps) => {
  return (
    <SettingsSection background>
      <Typography variant="h3" component="h4" gutterBottom>
        Service charges
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Summary of service charges collected by your team on behalf of OSL.
        Service charges are transferred to OSL quarterly.
      </Typography>
      {serviceCharges.length > 0 ? (
        <ActiveServiceCharges serviceCharges={serviceCharges} />
      ) : (
        <InactiveServiceCharges />
      )}
    </SettingsSection>
  );
};

const InactiveServiceCharges = () => (
  <Typography variant="body1">No service charges found.</Typography>
);

const ActiveServiceCharges = ({ serviceCharges }: SubscriptionProps) => {
  const years = Array.from(new Set(serviceCharges.map((sc) => sc.paidAtYear)));
  const [activeYear, setActiveYear] = useState<number>(years[0]);

  const serviceChargesInActiveYear = serviceCharges.filter(
    (sc) => sc.paidAtYear === activeYear,
  );

  return (
    <>
      <Typography variant="h4" component="h5" mt={2} gutterBottom>
        Service charges due this quarter
      </Typography>
      <Typography variant="body1" gutterBottom>
        [Coming soon]
      </Typography>
      <Typography variant="h4" component="h5" mt={2} gutterBottom>
        Total service charges collected
      </Typography>
      <AnnualServiceChargeCards
        serviceCharges={serviceCharges}
        years={years}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
      />
      <Box mt={2}>
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
      <Box sx={{ marginTop: (theme) => theme.spacing(1), textAlign: "right" }}>
        <Link component="button" onClick={() => console.log("todo")}>
          <Typography variant="body2">
            {"Download service charge payment records (.csv)"}
          </Typography>
        </Link>
      </Box>
    </>
  );
};

interface AnnualServiceChargeCardProps extends SubscriptionProps {
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
      gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))",
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
              borderBottom: (theme) => `5px solid ${theme.palette.info.main}`,
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
            <Typography variant="h3" component="div" gutterBottom>
              {year}
            </Typography>
            <Typography variant="body2" mt={2}>
              <strong>
                {sumServiceCharges(
                  serviceCharges.filter((sc) => sc.paidAtYear === year),
                )}
              </strong>
              {` ${new Date().getFullYear() === year ? `year-to-date` : `total`}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    ))}
  </Box>
);

const ServiceChargesByQuarterAccordion = ({
  serviceCharges,
}: SubscriptionProps) => {
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

const ServiceChargesByMonthAccordion = ({
  serviceCharges,
}: SubscriptionProps) => {
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

const ServiceChargeByFlowAccordion = ({
  serviceCharges,
}: SubscriptionProps) => {
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
      <TableCell></TableCell>
      <TableCell align="right">Amount (excl VAT)</TableCell>
    </BoldTableRow>
  </TableHead>
);

const TotalRow = ({ serviceCharges }: SubscriptionProps) => (
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
