# How to enable planning constraints for a team and setup granular Article 4 responses

## Context 🖼️
Planx queries planning.data.gov.uk to fetch data about constraints for councils participating in ODP. The ability to query constraints via the Planning Constraints component in Planx is disabled by default for new teams. This is to prevent the component displaying "false negatives" for early testers - eg saying that the site does not overlap with any constraints, when actually there isn't yet a local available data source for it to check against. The Planning Data API response shape currently looks identical for a non-overlapping constraint with available data and for one without available data. 

Our /gis API sets the passport variable `article4` by default for _any_ entities in the `article-4-direction-area` dataset. But Article 4s are a unique case where individual entities within the _same_ dataset reflect _different_ policies. So, rather than `article4`, councils actually want each entity to correspond to its' own passport variable - eg `article4.council.something`.

## Process ⚙️
1. **Council** - Shares & publishes their data on planning.data.gov.uk

2. **Planx** - Updates `teams.settings` jsonb database record on production with `{ "hasPlanningData": true }` to enable queries. This will automatically sync to staging on the next scheduled Github Action run, or you can kick it off manually.

(Note that it's common for councils to be ready to complete steps 1 & 2 well before steps 3-5; that's completely okay for testing, but all steps should be completed before a service "goes live".)

3. **Council & Planx content team** - Write `article4` flow in Planx editor and fill out "GIS spreadsheet" googlesheet template. Content team creates a Trello ticket in "New requests" when this is complete.

4. **Planx** - Create a new metadata template in `api.planx.uk/modules/gis/service/local_authorities/metadata/{council}.ts`. 

It should be formatted like this:
```ts
/*
LAD20CD: 
LAD20NM: 
LAD20NMW:
FID:

https://docs.google.com/spreadsheets/d/this-council
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land {entity.reference}
    records: {
      "article4.council.something": "REF-1"
    },
  },
};

export { planningConstraints };

```

The dictionary of `records` should have one key/value pair per each unique granular passport variable defined in the spreadsheet. The key is the granular passport variable and the value is the "GIS identifier". GIS identifiers are ideally a direct match on a Planning Data entity's "reference", "name" or "notes", or a "startsWith" relationship to the entity "description" in a few historic edge cases.

The council should map their GIS identifiers themselves in the spreadsheet, but often this is partially complete or missing and simpler to quickly match against planning.data.gov.uk search results ourselves than start a communication back and forth (it's often not the same council person who knows the Article 4 rules as who understands the spatial data structure).

5. **Planx** - Add an entry for this council to the `localAuthorityMetadata` variable defined at the top of `api.planx.uk/modules/gis/service/digitalLand.ts`

Confirm that granular A4 variables are now being returned by the /gis endpoint and written to the passport when navigating a flow.

Create a PR for review, deploy to production, and let council know it's ready for testing.
