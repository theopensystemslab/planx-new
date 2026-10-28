import { contactValidationSchema } from "./model";

describe("ContactInput - validation", () => {
  it("enables optional fields", async () => {
    const validationSchema = contactValidationSchema({
      titleRequired: false,
      organisationRequired: false,
      phoneRequired: false,
      emailRequired: false,
    });

    const contact = {
      title: "",
      firstName: "Jane",
      lastName: "Doe",
      organisation: "",
      phone: "",
      email: "",
    };

    await expect(validationSchema.isValid(contact)).resolves.toBe(true);
  });
  it("enforces required fields", async () => {
    const validationSchema = contactValidationSchema({
      titleRequired: true,
      organisationRequired: true,
      phoneRequired: true,
      emailRequired: true,
    });

    const contact = {
      firstName: "Jane",
      lastName: "Doe",
      title: "",
      organisation: "",
      phone: "",
      email: "",
    };

    await expect(validationSchema.isValid(contact)).resolves.toBe(false);

    await expect(
      validationSchema.validate(contact, { abortEarly: false }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Enter a title",
        "Enter a phone number",
        "Enter an email address",
      ]),
    });
  });
});
