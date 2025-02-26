# How to add a new Planning Data layer

## Context 🖼️
Planx queries planning.data.gov.uk to fetch data about constraints for councils participating in ODP. The Planning Data platform has many datasets already available, and a backlog of even more in the pipeline. Planx makes a subset of these datasets available to councils to query in their services (usually when the Planning Data team tells us a dataset is "ready"). 

## Process ⚙️
1. **Planning Data or ODP** - Shares a link to a newly available dataset on planning.data.gov.uk

2. **Planx** - Add an entry to the exported `const activePlanningConstraints` in `planx-core/src/types/planning-constraints.ts`
    - Reference the ODP Schema to find out what the Planx data value & name should be (see `open-digital-planning-applications/types/shared/constraints.ts`)

3. **Planx** - Bump planx-new to read latest planx-core change. Confirm the following points on this pizza:
    - The `PlanningConstraints` editor modal displays your newly added layer "de-selected" by default
    - If you select this layer, update your `PlanningConstraints` component, and publish your flow - then public interface `/gis` requests should include the new dataset (confirm the `vals` param includes the new data value) & there should be a new entry in the public interface confirming this constraint has a response from our API
    - Find an address that this constraint applies to (consider adding it to [Planx testing addresses googlesheet](https://docs.google.com/spreadsheets/d/1fHy952Ey-yOI5os_W9PxNR8l3qrAguXqWo_Dv-qrTEI/edit?usp=sharing)) and confirm that the response is a "positive intersection" as expected

## Exceptions
- In the rare event that the ODP Schema _does not_ have an entry for this dataset per #2, then raise to content team & in #planx-schemas. The team will decide on a new data value and begin the steps to queue up a new release of the schema before #3 can be completed
- If the data value associated with this constraint has attributes which should be assigned granular data values (eg listed building "grades", flood risk "zones", article 4s), then additional changes to our API logic will be required in `api.planx.uk/modules/gis/digitalLand.ts`
