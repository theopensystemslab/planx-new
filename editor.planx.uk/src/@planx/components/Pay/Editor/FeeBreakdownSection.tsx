import HelpIcon from "@mui/icons-material/Help";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { BoldTableRow } from "@planx/components/shared/Table/TableRow";
import { useFormikContext } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { PropsWithChildren } from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { Pay } from "../model";
import { VAT_RATE } from "../Public/FeeBreakdown";

const DataField: React.FC<PropsWithChildren> = ({ children }) => (
  <Typography variant="data" sx={(theme) => ({ fontSize: theme.typography.body3.fontSize, pr: 2 })}>{children}</Typography>
);

const HelpTooltip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip title={text} placement="bottom-end">
    <HelpIcon color="primary"/>
  </Tooltip>
)

const ExampleTable: React.FC = () => (
  <TableContainer>
    <Table sx={{ [`& .${tableCellClasses.root}`]: { px: 0 } }} >
      <TableHead>
        <BoldTableRow>
          <TableCell>Description</TableCell>
          <TableCell align="right">Passport field</TableCell>
        </BoldTableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Application fee</TableCell>
          <TableCell align="right" sx={{ display: "flex", alignItems: "center"}}>
            <HelpTooltip text="The fee will be the calculated amount (if set), or the payable amount" />
            <DataField>£ application.fee.calculated</DataField>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Reduction</TableCell>
          <TableCell align="right" sx={{ display: "flex", alignItems: "center" }}>
            <HelpTooltip text="This is the sum of all reductions applied to the application fee. The list of reductions will be listed below" />
            <DataField>- £ (calculated - payable)</DataField>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.reduction.x.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.reduction.y.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.reduction.z.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Exemptions</TableCell>
          <TableCell align="right" sx={{ display: "flex", alignItems: "center" }}>
            <HelpTooltip text="Exemptions will set the fee to £0.00, and list the reasons below" />
            <DataField>- £ application.fee.payable</DataField>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.exemption.x.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.exemption.y.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2}>
            <Box sx={{ pl: 4 }}>
              <DataField>application.fee.exemption.z.reason</DataField>
            </Box>
          </TableCell>
        </TableRow>
        <BoldTableRow>
          <TableCell>Total</TableCell>
          <TableCell align="right" sx={{ display: "flex", alignItems: "center" }}>
            <HelpTooltip text="This is the sum the applicant will pay via GovPay" />
            <DataField>£ application.fee.payable</DataField>
          </TableCell>
        </BoldTableRow>
        <TableRow>
          <TableCell>VAT ({VAT_RATE * 100}%)</TableCell>
          <TableCell align="right" sx={{ display: "flex", alignItems: "center"}}>
            <HelpTooltip text='If this value is set to "true" in the flow, we will display the calculated VAT amount' />
            <DataField>application.fee.payable.includesVAT</DataField>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
)

const Details: React.FC = () => (
  <>
    <Typography variant="body2" py={2}>The table below describes the structure and passport variables that describe how the fee breakdown is displayed to the user. A validation check will run at publish to ensure the necessary fields are set by your service.</Typography>
    <ExampleTable />
  </>
);

export const FeeBreakdownSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Pay>();

  if (!hasFeatureFlag("FEE_BREAKDOWN")) return null;

  return (
    <ModalSection>
      <ModalSectionContent title="Fee breakdown" Icon={ReceiptLongIcon}>
        <InputRow>
          <Switch
            checked={values.showFeeBreakdown}
            onChange={() =>
              setFieldValue("showFeeBreakdown", !values.showFeeBreakdown)
            }
            label="Display a breakdown of the fee to the applicant"
          />
        </InputRow>
        <>
          {values.showFeeBreakdown && <Details /> }
        </>
      </ModalSectionContent>
    </ModalSection>
  );
};
