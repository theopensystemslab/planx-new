# How to add fields to the Editor search index

## Overview

This guide outlines the process of adding new searchable fields to the PlanX Editors' frontend search functionality, which uses Fuse.js for indexing and searching. This is a required step with adding a new component to PlanX, or adding new fields to an existing component.

## Background

- Search is currently implemented in the frontend using Fuse.js
- Only certain fields are searchable:
  - Text fields (simple text)
  - Rich text fields (HTML)
  - Data values (e.g. `data.fn`)

## Process

### 1. Update facets configuration

Location: `src/pages/FlowEditor/components/Sidebar/Search/facets.ts`

#### Guidelines:
- Use key paths to the new fields (e.g. `data.myNewField`)
- Wrap rich text fields with `richTextField()` helper - this strips HTML tags
- Add data fields to `DATA_FACETS`
- Add text fields to `ALL_FACETS`
- Avoid adding duplicate values already held in `ALL_FACETS` (e.g., `data.title`, `data.description`)

#### Example:

```ts
// facets.ts

const myNewComponent: SearchFacets = [
  richTextField("data.myRichTextField"),
  "data.myPlainTextField"
];

export const ALL_FACETS: SearchFacets = [
  ...otherComponents,
  ...myNewComponent,
  ...DATA_FACETS,
];
```

### 2. Assign display values

Location: `src/pages/FlowEditor/components/Sidebar/Search/SearchResultCard/getDisplayDetailsForResult.tsx`

#### Add key formatters:

```ts
// getDisplayDetailsForResult.tsx

const keyFormatters: KeyMap = {
  ...existingFormatters,
  "data.myNewField": {
    getDisplayKey: () => "My New Field",
  },
};
```

### 3. Update tests

Locations: 
- `src/pages/FlowEditor/components/Sidebar/Search/SearchResultCard/allFacets.test.ts`
- `src/pages/FlowEditor/components/Sidebar/Search/SearchResultCard/dataFacets.test.ts`

#### Test steps:
1. Add new component to `mockFlow`
2. Create mock search result 
   - Example: `mockMyComponentResult: SearchResult<IndexedNode>`

### Debugging tip

A search result can be easily logged to the console from `SearchResultCard`. Simply search for one of your new fields, and click on the card.

```ts
// SearchResultCard/index.tsx

const handleClick = () => {
  const url = getURLForNode(result.item.id);
  // Temporarily disable navigation
  // navigate(url);
  
  // Log the full search result to console
  console.log({ result });
};
```