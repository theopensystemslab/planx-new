# How to add a schema to the List component

## Context
The List component allows us to ask many questions on the same page, and for the user to add many responses or items to each prompt - replacing the complex & dense tables for topics like residential units found in paper application forms. 

In order to support Minor Planning Permission service development quickly, we decided that the first iterations of the List component would read from controlled schemas maintained in code, rather than allow for fully customisable, generic schemas to be written in the Editor.

The ideal maintainers of these schemas are still the services team though, rather than developers. This doc details the process for adding new schemas or editing existing ones.

## Process
1. **GitHub** - Navigate to `editor.planx.uk/src/@planx/components/List/schemas`. Open an existing file, or add a `.ts` file directly to this folder or a subfolder within it. Folder organisation is flexible.

2. **GitHub** - In the `.ts` file, ensure the schema has this basic structure: 
```ts
import { Schema } from "@planx/components/List/model";

export const YourSchemasName: Schema = {
  type: "Title (singular if no max, plural if max = 1)",
  fields: [
    // List of questions to ask, see possible field types below
  ],
  min: 1,
  max: 10, // optional
} as const;
```

The fields of the schema can be one of 3 types: `question`, `text` or `number`. Questions will display as radio buttons when there are two options, and as select dropdowns when there are more than 2 options.

This is the possible shape of each varity of field:
```ts
{
  type: "question",
  required: true, // optional
  data: {
    title: "Are you planting a tree?",
    fn: "passportKey", // note that dot-separation is not supported yet
    options: [
      // id is internal ref, text is displayed to user, and val (optional) is recorded in passport if provided
      { id: "yes", data: { text: "Yes", val: "true" } },
      { id: "no", data: { text: "No", val: "false" } },
    ],
  },
},
{
  type: "text",
  required: true,
  data: {
    title: "What type of tree are you planting?",
    fn: "passportKey",
    type: "short", // must be one of: "short", "long", "extralong", "phone", "email"
  },
},
{
  type: "number",
  required: true,
  data: {
    title: "How tall is the tree you are planting?",
    fn: "passportKey",
    units: "m", // optional
    allowNegatives: false // optional
  },
},
```

3. **GitHub** - When your schema is finalised, you'll want to make it selectable from within the Editor modal. Add it to the `SCHEMAS` list in `editor.planx.uk/src/@planx/components/List/Editor.tsx` to do so.

4. **Editor** - "Update" or delete/recreate your List component to reference the new schema

## Good-to-knows & special cases

- When a schema sets `max: 1`, we'll hide the "+ Add another" button and index number from the title of the card. This allows the List component to essentially function like a single "Page" of questions, rather than many responses to the same prompt

- When your schema includes a field that sets `fn: identicalUnits`, we'll automatically sum the total number of _units_ and add it to the passport as `{listFn}.total.units`

- When your schema includes a field that sets `fn: identicalUnits` _and_ `fn: development`, we'll automatically sum all units _by their development type_. These passport variables will look like `{listFn}.total.units.{developmentType}`. Planx's Calculate component/MathJS cannot handle list iteration and grouping, so this exposes necessary complex sums that can then be further processed in the flow using Calculate later
