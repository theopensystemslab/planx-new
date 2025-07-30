import { checklistInputValidationSchema, validationSchema } from "./model";

describe("Checklist - validation", () => {
  describe("optional checklist fields in schema", () => {
    const validationSchema = checklistInputValidationSchema({
      data: {
        options: [
          { id: "test1", data: { text: "Test 1", val: "test1" } },
          { id: "test2", data: { text: "Test 2", val: "test2" } },
        ],
        allRequired: true,
      },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const undefinedResult = await validationSchema.validate(undefined);
      expect(undefinedResult).toBeUndefined();

      const arrayResult = await validationSchema.validate([]);
      expect(arrayResult).toHaveLength(0);
    });

    it("validates optional fields with a value", async () => {
      await expect(() => validationSchema.validate(["test1"])).rejects.toThrow(
        /All options must be checked/,
      );
    });
  });
});

describe("Editor validation", () => {
  test("both 'allRequired' and 'exclusiveOr' cannot be toggled on together", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        allRequired: true,
        options: [
          {
            id: "a",
            data: { text: "Option A", exclusive: true },
          },
        ],
      }),
    ).rejects.toThrow(
      'Cannot configure exclusive "or" option alongside "all required" setting',
    );
  });

  test("only one exclusive option is permitted", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        allRequired: false,
        options: [
          {
            id: "a",
            data: { text: "Option A", exclusive: true },
          },
          {
            id: "b",
            data: { text: "Option B", exclusive: true },
          },
        ],
      }),
    ).rejects.toThrow(
      "There should be a maximum of one exclusive option configured",
    );
  });

  test("options must set data values if the component does", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        fn: "topLevelFn",
        allRequired: false,
        options: [
          {
            id: "a",
            data: { text: "Option A" },
          },
          {
            id: "b",
            data: { text: "Option B" },
          },
        ],
      }),
    ).rejects.toThrow("At least one option must also set a data field");
  });

  test("fn is required for alwaysAutoAnswerBlank", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        alwaysAutoAnswerBlank: true,
        fn: null,
        options: [
          {
            id: "a",
            data: { text: "Option A" },
          },
          {
            id: "b",
            data: { text: "Option B" },
          },
        ],
      }),
    ).rejects.toThrow(
      "Set a data field for the Checklist and all options but one when never putting to user",
    );
  });

  test("alwaysAutoAnswerBlank allows only one blank value", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        alwaysAutoAnswerBlank: true,
        fn: "test",
        options: [
          {
            id: "a",
            data: { text: "Option A", val: "A" },
          },
          {
            id: "b",
            data: { text: "Option B" },
          },
          {
            id: "c",
            data: { text: "Option C" },
          },
        ],
      }),
    ).rejects.toThrow(
      "Exactly one option should have a blank data field when never putting to user",
    );
  });

  test("checklists - data fields can be set for each option", async () => {
    const result = validationSchema.validate({
      allRequired: false,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      description: "",
      fn: "test",
      groupedOptions: [
        {
          title: "Section 1",
          children: [
            {
              data: {
                val: "abc",
                text: "ABC",
              },
            },
          ],
        },
        {
          title: "Section 2 ",
          children: [
            {
              data: {
                val: "def",
                text: "DEF",
              },
            },
          ],
        },
      ],
      text: "Test",
    });

    expect(result).toBeDefined();
  });

  test("grouped checklists - data fields can be set for each option", async () => {
    const result = validationSchema.validate({
      title: "Test",
      alwaysAutoAnswerBlank: false,
      fn: "test",
      options: [
        {
          id: "a",
          data: { text: "Option A", val: "A" },
        },
        {
          id: "b",
          data: { text: "Option B", val: "B" },
        },
      ],
    });

    expect(result).toBeDefined();
  });

  describe("unique labels", () => {
    test("groups must have unique titles", async () => {
      await expect(() =>
        validationSchema.validate({
          title: "Test",
          groupedOptions: [
            {
              title: "Repeated group name",
              children: [
                {
                  id: "abc",
                  data: { text: "ABC" },
                },
              ],
            },
            {
              title: "Repeated group name",
              children: [
                {
                  id: "123",
                  data: { text: "123" },
                },
              ],
            },
          ],
        }),
      ).rejects.toThrow("Groups must have unique titles");
    });

    describe("options without data values", () => {
      test("checklists - unique labels must be used for each option", async () => {
        await expect(() =>
          validationSchema.validate({
            title: "Test",
            options: [
              {
                id: "a",
                data: { text: "Non-unique label" },
              },
              {
                id: "b",
                data: { text: "Non-unique label" },
              },
            ],
          }),
        ).rejects.toThrow("Options must have unique labels");
      });

      test("grouped checklists - labels must be unique within groups", async () => {
        await expect(() =>
          validationSchema.validate({
            title: "Test",
            groupedOptions: [
              {
                title: "Section 1",
                children: [
                  {
                    id: "a",
                    data: { text: "Non-unique label" },
                  },
                  {
                    id: "b",
                    data: { text: "Non-unique label" },
                  },
                ],
              },
            ],
          }),
        ).rejects.toThrow(
          "Options within a single group must have unique labels",
        );
      });

      test("grouped checklists - labels can be repeated across groups", async () => {
        const result = validationSchema.validate({
          title: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: { text: "Non-unique label" },
                },
                {
                  id: "b",
                  data: { text: "Foo" },
                },
              ],
            },
            {
              title: "Section 2",
              children: [
                {
                  id: "a",
                  data: { text: "Non-unique label" },
                },
                {
                  id: "b",
                  data: { text: "Bar" },
                },
              ],
            },
          ],
        });

        expect(result).toBeTruthy();
      });
    });

    describe("options with data values", () => {
      test("checklists - unique labels must be used for each option", async () => {
        await expect(() =>
          validationSchema.validate({
            title: "Test",
            options: [
              {
                id: "a",
                data: { text: "Non-unique label", val: "a" },
              },
              {
                id: "b",
                data: { text: "Non-unique label", val: "b" },
              },
            ],
          }),
        ).rejects.toThrow("Options must have unique labels");
      });

      test("grouped checklists - labels must be unique within groups", async () => {
        await expect(() =>
          validationSchema.validate({
            title: "Test",
            groupedOptions: [
              {
                title: "Section 1",
                children: [
                  {
                    id: "a",
                    data: { text: "Non-unique label", val: "a" },
                  },
                  {
                    id: "b",
                    data: { text: "Non-unique label", val: "b" },
                  },
                ],
              },
            ],
          }),
        ).rejects.toThrow(
          "Options within a single group must have unique labels",
        );
      });

      test("grouped checklists - labels can be repeated across groups", async () => {
        const result = validationSchema.validate({
          title: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: { text: "Non-unique label", val: "a" },
                },
                {
                  id: "b",
                  data: { text: "Foo", val: "b" },
                },
              ],
            },
            {
              title: "Section 2",
              children: [
                {
                  id: "a",
                  data: { text: "Non-unique label", val: "c" },
                },
                {
                  id: "b",
                  data: { text: "Bar", val: "d" },
                },
              ],
            },
          ],
        });

        expect(result).toBeTruthy();
      });
    });
  });
});
