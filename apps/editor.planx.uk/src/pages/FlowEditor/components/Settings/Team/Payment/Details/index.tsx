import { useSlackMessage } from "pages/FlowEditor/components/Settings/hooks/useSlackMessage";
import { useStore } from "pages/FlowEditor/lib/store";
import type { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_TEAM_INVOICE_DETAILS,
  UPDATE_TEAM_INVOICE_DETAILS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamInvoiceDetailsData,
  InvoiceDetailsFormValues,
  UpdateTeamInvoiceDetailsVariables,
} from "./types";

const Details: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  const { mutate: sendSlackMessage } = useSlackMessage();

  return (
    <SettingsFormContainer<
      GetTeamInvoiceDetailsData,
      UpdateTeamInvoiceDetailsVariables,
      InvoiceDetailsFormValues
    >
      query={GET_TEAM_INVOICE_DETAILS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_INVOICE_DETAILS}
      getInitialValues={({ teamInvoiceDetails: [teamInvoiceDetails] }) => ({
        businessName: teamInvoiceDetails?.businessName ?? "",
        emailAddress: teamInvoiceDetails?.emailAddress ?? "",
        companyRegistration: teamInvoiceDetails?.companyRegistration ?? "",
        vatNumber: teamInvoiceDetails?.vatNumber ?? "",
      })}
      getMutationVariables={(values) => ({
        teamId,
        teamInvoiceDetails: {
          business_name: values.businessName,
          email_address: values.emailAddress,
          company_registration: values.companyRegistration || undefined,
          vat_number: values.vatNumber,
        },
      })}
      validationSchema={validationSchema}
      legend="Invoice details"
      description={
        <>These are the details that PlanX invoices will be made out to.</>
      }
      onSuccess={(data, _formikHelpers, values) => {
        const oldEmail = data?.teamInvoiceDetails[0].emailAddress;
        const hasEmailUpdated = oldEmail && values.emailAddress !== oldEmail;
        if (hasEmailUpdated) {
          const message = `:e-mail: *${teamSlug}* updated their invoice destination email to *${values.emailAddress}*.`; // TODO: copied this from Contact page--will we send invoices programmatically or is this notification of use?
          sendSlackMessage(message);
        }
      }}
    >
      {({ formik }) => (
        <>
          <InputLabel label="Business name" htmlFor="businessName">
            <Input
              name="businessName"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("businessName", e.target.value)
              }
              value={formik.values.businessName}
              errorMessage={formik.errors.businessName}
              id="businessName"
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
            label="Company registration (optional)"
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
