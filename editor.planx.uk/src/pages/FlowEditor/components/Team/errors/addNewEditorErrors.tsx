export const AddNewEditorErrors = {
  USER_ALREADY_EXISTS: {
    regex: /violates unique constraint "users_email_key"/i,
    errorMessage: "User already exists",
  },
};
export const isUserAlreadyExistsError = (error: string) =>
  AddNewEditorErrors.USER_ALREADY_EXISTS.regex.test(error);
