import type { StripeConnectAccount } from "lib/api/stripe/types";
import { useSlackMessage } from "pages/FlowEditor/components/Settings/hooks/useSlackMessage";
import { useStore } from "pages/FlowEditor/lib/store";
import type { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_INVOICE_DETAILS_BY_ID,
  GET_TEAM_INVOICE_DETAILS,
  UPDATE_INVOICE_DETAILS_BY_ID,
  UPDATE_TEAM_INVOICE_DETAILS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamInvoiceDetailsData,
  InvoiceDetailsFormValues,
  InvoiceDetailsTarget,
  UpdateTeamInvoiceDetailsVariables,
} from "./types";

interface DetailsProps {
  account?: Pick<StripeConnectAccount, "name" | "invoiceDetailsId">;
}

const Details: React.FC<DetailsProps> = ({ account }) => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  const { mutate: sendSlackMessage } = useSlackMessage();

  const invoiceDetailsId = account?.invoiceDetailsId;
  const target: InvoiceDetailsTarget = invoiceDetailsId
    ? { id: invoiceDetailsId }
    : { teamId };

  return (
    <SettingsFormContainer<
      GetTeamInvoiceDetailsData,
      UpdateTeamInvoiceDetailsVariables,
      InvoiceDetailsFormValues
    >
      query={
        invoiceDetailsId ? GET_INVOICE_DETAILS_BY_ID : GET_TEAM_INVOICE_DETAILS
      }
      defaultValues={defaultValues}
      queryVariables={target}
      mutation={
        invoiceDetailsId
          ? UPDATE_INVOICE_DETAILS_BY_ID
          : UPDATE_TEAM_INVOICE_DETAILS
      }
      getInitialValues={({ teamInvoiceDetails: [teamInvoiceDetails] }) => ({
        organisationName: teamInvoiceDetails?.organisationName ?? "",
        emailAddress: teamInvoiceDetails?.emailAddress ?? "",
        companyRegistration: teamInvoiceDetails?.companyRegistration ?? "",
        vatNumber: teamInvoiceDetails?.vatNumber ?? "",
      })}
      getMutationVariables={(values) => ({
        ...target,
        teamInvoiceDetails: {
          organisation_name: values.organisationName,
          email_address: values.emailAddress,
          company_registration: values.companyRegistration || undefined,
          vat_number: values.vatNumber,
        },
      })}
      validationSchema={validationSchema}
      legend={account ? `Invoice details: ${account.name}` : "Invoice details"}
      description={
        <>
          These details will appear on invoices Plan✕ issues to applicants on
          your behalf.
        </>
      }
      onSuccess={(data, _formikHelpers, values) => {
        const oldEmail = data?.teamInvoiceDetails[0].emailAddress;
        const hasEmailUpdated = oldEmail && values.emailAddress !== oldEmail;
        if (hasEmailUpdated) {
          const forAccount = account ? ` for *${account.name}*` : "";
          const message = `:e-mail: *${teamSlug}* updated their invoice destination email${forAccount} to *${values.emailAddress}*.`; // TODO: copied this from Contact page--will we send invoices programmatically or is this notification of use?
          sendSlackMessage(message);
        }
      }}
    >
      {({ formik }) => (
        <>
          <InputLabel label="Organisation name" htmlFor="organisationName">
            <Input
              name="organisationName"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("organisationName", e.target.value)
              }
              value={formik.values.organisationName}
              errorMessage={formik.errors.organisationName}
              id="organisationName"
            />
          </InputLabel>

          <InputLabel label="Email address" htmlFor="emailAddress">
            <Input
              name="emailAddress"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("emailAddress", e.target.value)
              }
              value={formik.values.emailAddress}
              errorMessage={formik.errors.emailAddress}
              id="emailAddress"
            />
          </InputLabel>

          <InputLabel
            label="Company registration number (if applicable)"
            htmlFor="companyRegistration"
          >
            <Input
              name="companyRegistration"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("companyRegistration", e.target.value)
              }
              value={formik.values.companyRegistration}
              errorMessage={formik.errors.companyRegistration}
              id="companyRegistration"
            />
          </InputLabel>

          <InputLabel label="VAT number" htmlFor="vatNumber">
            <Input
              name="vatNumber"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("vatNumber", e.target.value)
              }
              value={formik.values.vatNumber}
              errorMessage={formik.errors.vatNumber}
              id="vatNumber"
            />
          </InputLabel>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default Details;
