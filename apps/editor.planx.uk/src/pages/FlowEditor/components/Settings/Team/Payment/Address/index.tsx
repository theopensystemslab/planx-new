import { useStore } from "pages/FlowEditor/lib/store";
import type { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_TEAM_INVOICE_ADDRESS,
  UPDATE_TEAM_INVOICE_ADDRESS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamInvoiceAddressData,
  InvoiceAddressFormValues,
  UpdateTeamInvoiceAddressVariables,
} from "./types";

const Address: React.FC = () => {
  const [teamId] = useStore((state) => [state.teamId]);

  return (
    <SettingsFormContainer<
      GetTeamInvoiceAddressData,
      UpdateTeamInvoiceAddressVariables,
      InvoiceAddressFormValues
    >
      query={GET_TEAM_INVOICE_ADDRESS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_INVOICE_ADDRESS}
      getInitialValues={({ teamInvoiceAddress: [teamInvoiceAddress] }) => ({
        addressLine1: teamInvoiceAddress?.addressLine1 ?? "",
        addressLine2: teamInvoiceAddress?.addressLine2 ?? "",
        townCity: teamInvoiceAddress?.townCity ?? "",
        county: teamInvoiceAddress?.county ?? "",
        postcode: teamInvoiceAddress.postcode ?? "",
      })}
      getMutationVariables={(values) => ({
        teamId,
        teamInvoiceAddress: {
          address_line1: values.addressLine1,
          address_line2: values.addressLine2,
          town_city: values.townCity,
          county: values.county,
          postcode: values.postcode,
        },
      })}
      validationSchema={validationSchema}
      legend="Contact information"
      description={
        <>
          Populates Gov UK Notify templates for email replies and footer contact
          information. Gov UK Notify templates apply to all submission services.
        </>
      }
    >
      {({ formik }) => (
        <>
          <InputLabel label="Address line 1" htmlFor="addressLine1">
            <Input
              name="addressLine1"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("addressLine1", e.target.value)
              }
              value={formik.values.addressLine1}
              errorMessage={formik.errors.addressLine1}
              id="addressLine1"
            />
          </InputLabel>

          <InputLabel label="Address line 2 (optional)" htmlFor="addressLine2">
            <Input
              name="addressLine2"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("addressLine2", e.target.value)
              }
              value={formik.values.addressLine2}
              errorMessage={formik.errors.addressLine2}
              id="addressLine2"
            />
          </InputLabel>

          <InputLabel label="Town or city" htmlFor="townCity">
            <Input
              name="townCity"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("townCity", e.target.value)
              }
              value={formik.values.townCity}
              errorMessage={formik.errors.townCity}
              id="townCity"
            />
          </InputLabel>

          <InputLabel label="County (optional)" htmlFor="county">
            <Input
              name="county"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("county", e.target.value)
              }
              value={formik.values.county}
              errorMessage={formik.errors.county}
              id="county"
            />
          </InputLabel>

          <InputLabel label="Postcode" htmlFor="postcode">
            <Input
              name="postcode"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("postcode", e.target.value)
              }
              value={formik.values.postcode}
              errorMessage={formik.errors.postcode}
              id="postcode"
            />
          </InputLabel>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default Address;
