import { validationSchema } from "./model";

describe("ResponsiveChecklist - validation", () => {
  describe("uniqueness", () => {
    test("groups must have unique titles", async () => {
      await expect(() =>
        validationSchema.validate({
          text: "Test",
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

    test("groups must have unique titles - whitespace is stripped before checks", async () => {
      await expect(() =>
        validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Whitespace   ",
              children: [
                {
                  id: "abc",
                  data: { text: "ABC" },
                },
              ],
            },
            {
              title: "Whitespace",
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
      test("responsive checklists - unique options must be used", async () => {
        await expect(() =>
          validationSchema.validate({
            text: "Test",
            options: [
              {
                id: "a",
                data: {
                  text: "Non-unique label",
                  description: "Non-unique description",
                },
              },
              {
                id: "b",
                data: {
                  text: "Non-unique label",
                  description: "Non-unique description",
                },
              },
            ],
          }),
        ).rejects.toThrow(
          "Options must have unique labels, or unique descriptions if labels are conditionally shown",
        );
      });

      test("responsive checklists - unique options must be used (inc. whitespace)", async () => {
        await expect(() =>
          validationSchema.validate({
            text: "Test",
            options: [
              {
                id: "a",
                data: {
                  text: "Non-unique label     ",
                  description: "Non-unique description     ",
                },
              },
              {
                id: "b",
                data: {
                  text: "Non-unique label",
                  description: "Non-unique description",
                },
              },
            ],
          }),
        ).rejects.toThrow(
          "Options must have unique labels, or unique descriptions if labels are conditionally shown",
        );
      });

      test("responsive checklists - labels can be duplicated if descriptions differ", async () => {
        const result = validationSchema.validate({
          text: "Test",
          options: [
            {
              id: "a",
              data: { text: "Non-unique label", description: "A" },
            },
            {
              id: "b",
              data: { text: "Non-unique label", description: "B" },
            },
          ],
        });

        expect(result).toBeDefined();
      });

      test("grouped responsive checklists - options must be unique within groups", async () => {
        await expect(() =>
          validationSchema.validate({
            text: "Test",
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
          "Options within a single group must have unique labels, or descriptions if conditionally shown",
        );
      });

      test("grouped responsive checklists - options must be unique within groups (inc. whitespace)", async () => {
        await expect(() =>
          validationSchema.validate({
            text: "Test",
            groupedOptions: [
              {
                title: "Section 1",
                children: [
                  {
                    id: "a",
                    data: {
                      text: "Non-unique label    ",
                      description: "Non-unique description    ",
                    },
                  },
                  {
                    id: "b",
                    data: {
                      text: "Non-unique label",
                      description: "Non-unique description",
                    },
                  },
                ],
              },
            ],
          }),
        ).rejects.toThrow(
          "Options within a single group must have unique labels, or descriptions if conditionally shown",
        );
      });

      test("grouped responsive checklists - labels can be duplicated if descriptions differ within groups", async () => {
        const result = validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: {
                    text: "Non-unique label",
                    description: "Unique description A",
                  },
                },
                {
                  id: "a",
                  data: {
                    text: "Non-unique label",
                    description: "Unique description B",
                  },
                },
              ],
            },
          ],
        });

        expect(result).toBeDefined();
      });

      test("grouped responsive checklists - options can be repeated across groups", async () => {
        const result = validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: {
                    text: "Non-unique label",
                    description: "Non-unique description",
                  },
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
                  data: {
                    text: "Non-unique label",
                    description: "Non-unique description",
                  },
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

      test("grouped responsive checklists - options can be repeated across groups (inc. whitespace)", async () => {
        const result = validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: {
                    text: "Non-unique label    ",
                    description: "Non-unique description    ",
                  },
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
                  data: {
                    text: "Non-unique label",
                    description: "Non-unique description",
                  },
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
      test("responsive checklists - unique options must be used", async () => {
        const result = validationSchema.validate({
          text: "Test",
          options: [
            {
              id: "a",
              data: { text: "Non-unique label", description: "a", val: "a" },
            },
            {
              id: "b",
              data: { text: "Non-unique label", description: "b", val: "b" },
            },
          ],
        });

        expect(result).toBeDefined();
      });

      test("responsive checklists - repeated data values are allowed", async () => {
        const result = validationSchema.validate({
          text: "Test",
          options: [
            {
              id: "a",
              data: { text: "Flats", val: "residential.flat" },
            },
            {
              id: "b",
              data: { text: "Maisonettes", val: "residential.flat" },
            },
          ],
        });

        expect(result).toBeDefined();
      });

      test("grouped responsive checklists - data values can be repeated within groups", async () => {
        const result = validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Section 1",
              children: [
                {
                  id: "a",
                  data: { text: "Flats", val: "residential.flat" },
                },
                {
                  id: "b",
                  data: { text: "Maisonettes", val: "residential.flat" },
                },
              ],
            },
          ],
        });

        expect(result).toBeDefined();
      });

      test("grouped responsive checklists - labels can be repeated across groups", async () => {
        const result = validationSchema.validate({
          text: "Test",
          groupedOptions: [
            {
              title: "Common property types",
              children: [
                {
                  id: "a",
                  data: { text: "Houses", val: "residential.house" },
                },
                {
                  id: "b",
                  data: { text: "Maisonettes", val: "residential.flat" },
                },
              ],
            },
            {
              title: "Residential properties",
              children: [
                {
                  id: "c",
                  data: {
                    text: "Bungalow",
                    val: "residential.bungalow",
                  },
                },
                {
                  id: "d",
                  data: { text: "Maisonettes", val: "residential.flat" },
                },
              ],
            },
          ],
        });

        expect(result).toBeTruthy();
      });

      test("grouped responsive checklists - data values can be repeated across groups", async () => {
        const result = validationSchema.validate({
          text: "Test",
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
