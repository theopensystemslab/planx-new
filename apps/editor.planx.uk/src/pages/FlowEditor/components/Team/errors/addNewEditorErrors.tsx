export const AddNewMemberErrors = {
  USER_ALREADY_EXISTS: {
    regex: /violates unique constraint "users_email_key"/i,
    errorMessage: "User already exists",
  },
};
export const isUserAlreadyExistsError = (error: string) =>
  AddNewMemberErrors.USER_ALREADY_EXISTS.regex.test(error);
