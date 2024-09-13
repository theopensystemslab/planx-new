import * as Yup from "yup";

export const addNewEditorFormSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
});

export const editorFormSchema = Yup.object({
  firstName: Yup.string().required("Enter a first name"),
  lastName: Yup.string().required("Enter a last name"),
  email: Yup.string()
    .email(
      "Enter an email address in the correct format, like example@email.com",
    )
    .required("Enter a valid email address"),
});
