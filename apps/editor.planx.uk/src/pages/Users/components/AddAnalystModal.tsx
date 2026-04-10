import { useMutation } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { ModalActions } from "pages/FlowEditor/components/Team/components/ModalActions";
import { upsertMemberSchema } from "pages/FlowEditor/components/Team/formSchema";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import { GET_ANALYSTS_QUERY, INSERT_ANALYST } from "../hooks/queries";

export interface NewAnalyst {
  email: string;
  firstName: string;
  lastName: string;
}

interface InsertAnalystResponse {
  analyst: {
    firstName: string;
    lastName: string;
  };
}

interface Props {
  onClose: () => void;
}

export const AddAnalystModal: React.FC<Props> = ({ onClose }) => {
  const toast = useToast();

  const [insertAnalyst, { loading }] = useMutation<InsertAnalystResponse, NewAnalyst>(
    INSERT_ANALYST,
    {
      onCompleted: ({ analyst: { firstName, lastName } }) => {
        onClose();
        toast.success(`Successfully added ${firstName} ${lastName}`);
      },
      onError: () => toast.error("Failed to add analyst, try again"),
      refetchQueries: [
        { query: GET_ANALYSTS_QUERY }
      ],
    },
  );

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-add-user"
      open
      onClose={onClose}
    >
      <Formik<NewAnalyst>
        initialValues={{ firstName: "", lastName: "", email: "" }}
        validationSchema={upsertMemberSchema}
        onSubmit={(analyst) => insertAnalyst({ variables: analyst })}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, getFieldProps, touched, errors }) => (
          <Form>
            <DialogTitle variant="h3" component="h1" id="dialog-heading">
              Add analyst
            </DialogTitle>
            <DialogContent dividers data-testid="modal-create-analyst">
              <InputGroup flowSpacing>
                <InputLabel label="Email address" htmlFor="email">
                  <Input
                    type="email"
                    {...getFieldProps("email")}
                    errorMessage={
                      touched.email && errors.email ? errors.email : undefined
                    }
                  />
                </InputLabel>
                <InputLabel label="First name" htmlFor="firstName">
                  <Input
                    type="text"
                    {...getFieldProps("firstName")}
                    errorMessage={
                      touched.firstName && errors.firstName ? errors.firstName : undefined
                    }
                  />
                </InputLabel>
                <InputLabel label="Last name" htmlFor="lastName">
                  <Input
                    type="text"
                    {...getFieldProps("lastName")}
                    errorMessage={
                      touched.lastName && errors.lastName ? errors.lastName : undefined
                    }
                  />
                </InputLabel>
              </InputGroup>
            </DialogContent>
            <DialogActions>
              <ModalActions
                submitButtonText="Add analyst"
                submitDataTestId="modal-create-user-button"
                isSubmitting={isSubmitting || loading}
                onCancel={onClose}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};