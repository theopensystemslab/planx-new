import { gql } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { AddNewEditorModalProps } from "../types";

const createUser = async (
  email: string,
  firstName: string,
  lastName: string,
  isPlatformAdmin?: boolean,
) => {
  const response = (await client.mutate({
    mutation: gql`
      mutation CreateUser(
        $email: String!
        $firstName: String!
        $lastName: String!
        $isPlatformAdmin: Boolean
      ) {
        insert_users_one(
          object: {
            email: $email
            first_name: $firstName
            last_name: $lastName
            is_platform_admin: $isPlatformAdmin
          }
        ) {
          id
          email
          first_name
          last_name
          is_platform_admin
        }
      }
    `,
    variables: {
      email,
      firstName,
      lastName,
      isPlatformAdmin,
    },
  })) as any;
  const { id, email: emailAddress } = response.data.insert_users_one;

  console.log("created a user with id: ", id, "and email: ", emailAddress);
  return { id, emailAddress };
};

const addUserToTeam = async (teamId: number, userId: number) => {
  const response = await client.mutate({
    mutation: gql`
      mutation AddUserToTeam($teamId: Int!, $userId: Int!) {
        insert_team_members_one(
          object: { team_id: $teamId, user_id: $userId, role: teamEditor }
        ) {
          team_id
          user_id
          role
        }
      }
    `,
    variables: {
      teamId,
      userId,
    },
  });

  const res = response.data.insert_team_members_one;
  console.log(res);
  return res;
};
export const AddNewEditorModal = ({
  showModal,
  setShowModal,
}: AddNewEditorModalProps) => {
  const handleSubmit = async (
    values: { email: string; firstName: string; lastName: string },
    { resetForm }: any,
  ) => {
    const fetchedTeam = await useStore.getState().fetchCurrentTeam(); // TODO: error handling if unable to fetch team

    const teamId = fetchedTeam.id;

    // TODO: do I need to use a store?
    await createUser(
      values.email,
      values.firstName,
      values.lastName,
      false, // TODO: sort out isPlatformAdmin
      // ).then(console.log);
      // .then add team member
    )
      .then((values) => addUserToTeam(teamId, values.id))
      .then(console.log);

    // use generic role?

    setShowModal(false);
    resetForm({ values }); // TODO: onSuccess
    // TODO: refresh list of users automatically or optimistically update
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      PaperProps={{
        sx: (theme) => ({
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
          margin: theme.spacing(2),
        }),
      }}
      open={showModal}
      onClose={() => setShowModal(false)}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 1, mb: 4 }}>
            <Typography variant="h3" component="h2" id="dialog-heading">
              Add a new editor
            </Typography>
          </Box>
          <InputGroup flowSpacing>
            <InputLabel label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                type="text"
                {...formik.getFieldProps("firstName")}
                errorMessage={formik.errors.firstName}
              />
            </InputLabel>
            <InputLabel label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                type="text"
                {...formik.getFieldProps("lastName")}
                errorMessage={formik.errors.lastName}
              />
            </InputLabel>
            <InputLabel label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                errorMessage={formik.errors.email}
              />
            </InputLabel>
          </InputGroup>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            padding: 2,
          }}
        >
          <Box>
            <Button
              variant="contained"
              color="prompt"
              type="submit"
              data-testid="modal-create-user-button"
            >
              Create user
            </Button>
            <Button
              variant="contained"
              color="secondary"
              type="reset"
              sx={{ ml: 1.5 }}
              onClick={() => setShowModal(false)}
              data-testid="modal-cancel-button"
            >
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
