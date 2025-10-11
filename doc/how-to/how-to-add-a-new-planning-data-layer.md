# How to add a new Planning Data layer

## Context 🖼️
Planx queries planning.data.gov.uk to fetch data about constraints for councils participating in ODP. The Planning Data platform has many datasets already available, and a backlog of even more in the pipeline. Planx makes a subset of these datasets available to councils to query in their services (usually when the Planning Data team tells us a dataset is "ready"). 

## Process ⚙️
1. **Planning Data or ODP** - Shares a link to a newly available dataset on planning.data.gov.uk

2. **Planx** - Add an entry to the exported `const activePlanningConstraints` in `planx-core/src/types/planning-constraints.ts`
    - Reference the ODP Schema to find out what the Planx data value & name should be (see `open-digital-planning-applications/types/shared/constraints.ts`)

3. **Planx** - Bump planx-new to read latest planx-core change. Confirm the following points on this pizza:
    - [Editor] The `PlanningConstraints` modal displays your newly added layer
      - It should be selected-by-default for _new_ components and existing components with "all" constraints selected by default
      - It should be deselected for any existing components that have previously edited which constraints are checked (eg tewkesbury/drop-kerbs)
    - [Public] Publish a flow with this layer selected, then navigate to a public route
      - Find an address that this constraint applies to (consider adding it to [Planx testing addresses googlesheet](https://docs.google.com/spreadsheets/d/1fHy952Ey-yOI5os_W9PxNR8l3qrAguXqWo_Dv-qrTEI/edit?usp=sharing))
      - At the Planning Constraints card, inspect the `/gis` response in the network tab; the response object should have an entry for this data value with a "true" intersection result
      - The UI should also display an "applicable" entry for this constraint in the assigned category
      - Repeat for a non-intersecting address

## Exceptions
- In the rare event that the ODP Schema _does not_ have an entry for this dataset per #2, then raise to content team & in #planx-schemas. The team will decide on a new data value and begin the steps to queue up a new release of the schema before #3 can be completed
- If the data associated with this constraint has attributes which should be assigned granular data values (eg listed building "grades", flood risk "zones", article 4s), then additional changes to our API logic will be required in `apps/api.planx.uk/modules/gis/digitalLand.ts`. These are handled on a case-by-case basis
