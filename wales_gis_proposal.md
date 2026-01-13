# proposal to integrate Wales GIS data

## question: are there Wales equivalents to what we check with Planning Data?

Generally I am looking at:
- [“What we check”](https://opensystemslab.notion.site/How-Planning-constraints-work-06b64035fe6b40279387375ef3de49e4#2a4d72fb0aee4fb4b4e669a9c5c65b60)
- `activePlanningConstraints` ([code](https://github.com/theopensystemslab/planx-core/blob/44052a58ba670485967a050ef6bc0f309c079aef/src/types/planning-constraints.ts#L92-L93)) from `planx-core/src/types/planning-constraints.ts`: a sort of configuration file for querying Planning Data
- `planx-new/api.planx.uk/modules/gis/service/digitalLand.ts`: the module that actually makes the calls and computes the values
- George’s [Wales vs England](https://docs.google.com/spreadsheets/d/1ePihRD37-2071Wq6t2Y7QtBt7juySWuVP6SAF6T-0vo/edit?gid=197337445#gid=197337445) google sheet

### General policy
#### Article 4 areas
- 2 layers available on DMW:
  - https://datamap.gov.wales/layers/geonode:torfaen_article_4_direction
  - https://datamap.gov.wales/layers/geonode:monmouthshire_article4

#### Archaelogical priority areas: `archaeologicalPriorityArea`
- No direct DMW equivalent found

#### Brownfields: `brownfieldSite`
- No direct DMW equivalent found

### Heritage and conservation
#### Battlefield: `battlefield`
- No direct DMW equivalent found

#### AONB: `designated.AONB`
- Can be queried at DMW: [Area of Outstanding Natural Beauty \(AONB\) | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_AONB)
- Name: `NAME_AONB`

#### Conservation area: `designated.conservationArea`
- Can be queried at DMW: [Conservation Area Boundaries | DataMapWales](https://datamap.gov.wales/layers/geonode:conservation_areas_wales)
- Name: `sitename`

#### Greenbelt: `greenBelt`
- One area exists; perhaps a direct intersect query?
- Can’t find a digital representation of this greenbelt, only analog

#### National parks: `designated.nationalPark`
- Can be queried at DMW: https://datamap.gov.wales/layers/inspire-nrw:NRW_NATIONAL_PARK
- Name field: `np_name`

#### Listed buildings: `listed.grade.{I,II,II*}`
- Can be queried at DMW: [Listed Buildings | DataMapWales](https://datamap.gov.wales/layers/inspire-wg:Cadw_ListedBuildings)
- Name: `Name`/`Name_cy`
- has `Grade` field for determining `listed.grade.{I,II,II*}`

#### Locally listed buildings: `locallyListed`
- No direct DMW equivalent found

#### World heritage site: `designated.WHS`
- Can be queried at DMW: [World Heritage Sites in Wales | DataMapWales](https://datamap.gov.wales/layergroups/inspire-wg:WorldHeritageSites)
- Name: `Name` field

#### Monument: `monument`
- Can be queried at DMW: [Scheduled Monuments | DataMapWales](https://datamap.gov.wales/layers/inspire-wg:Cadw_SAM)
- Name: `Name`/`Name_cy` fields

#### Registered park and garden: `registeredPark`
- Can be queried at DMW: https://datamap.gov.wales/layergroups/geonode:registered_historic_parks_and_gardens
  - 3 sublayers: “Significant View”, “Registered Areas”, “Garden/Kitchen Garden”; assuming the relevant sublayer is “Registered Areas”
- Name: `site_name_en`/`site_name_cy`

### Trees
#### Tree preservation orders:
- No direct equivalent on DMW

### Ecology
#### Ancient Semi-Natural Woodlands: `nature.ANSW`
- Can be queried at DMW: [Ancient Woodland Inventory 2021 | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_ANCIENT_WOODLAND_INVENTORY_2021)
- where `category_name == 'Ancient Semi Natural Woodland’`
- Name: no field

#### SSSI: `nature.SSSI`
- Can be queried at DMW: [Sites of Special Scientific Interest \(SSSI\) | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SSSI)
- Name: `sssi_name`

#### Special Areas of Conservation: `nature.SAC`
- Can be queried at DMW: [Special Areas of Conservation \(SAC\) | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SAC)
- Name: `SAC_name`

#### Special Protection Areas: `nature.SPA`
- Can be queried at DMW: [Special Protection Areas \(SPA\) | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SPA)
- Name: `SPA_Name`

#### Ramsar sites: `nature.ramsarSite`
- Can be queried at DMW: [Ramsar Wetlands of international importance | DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_RAMSAR)
- name: `RAM_name`

#### Priority habitats: `nature.priorityHabitat`
- This DMW layer exists: [Glastir Woodland Creation - Sensitivity Layer - Priority Habitats | DataMapWales](https://datamap.gov.wales/layers/inspire-wg:GWC_NRW_SensitiveHabitats) 
- Not fully sure if this is truly representative of “priority habitats”
- Name: `habitat`

### Flooding
#### Flood zone: `flood.zone.{2,3}`
- Can be queried at DMW: [Flood Map for Planning Flood Zones 2 and 3 | DataMapWales](https://datamap.gov.wales/layergroups/inspire-nrw:FloodMapforPlanningFloodZones2and3)
  - sublayers for River, Sea, and Surface Water/Small Water Courses
- Name: none
- `risk` field denotes whether zone 2 or 3

### Military and defence
#### Explosives & ordnance storage: `defence.explosives`
- No data on DMW
#### Safeguarded land: `defence.safeguarded`
- No data on DMW

### Other
#### 3km of aerodrome: `aerodrome.3km`
- No aerodrome data on DMW

## Implementation
- create a new module along the lines of `digitalLand.ts` — this will handle the many requests to DMW: `dataMapWales.ts`? conceptually similar to removed `scotland.js` except we’d be querying WFS endpoints, not Esri feature services
- a key difference here is that `dataMapWales.ts` must make many requests instead of just one. could there be time-out issues with many calls being made? i see some references to that in the older code
- `dataMapWales.ts` should return a `GISResponse` (although there will be many `sourceRequest`s instead of just one?)
- update [locationSearch](https://github.com/theopensystemslab/planx-new/blob/05286527b9b88082151eb823df1d1721ff1023bd/apps/api.planx.uk/modules/gis/service/index.js#L27-L28) to use the new module when the localAuthority is in Wales (perhaps this is an allow list of localAuthority names, or a new attribute on [LocalAuthorityMetadata](https://github.com/theopensystemslab/planx-new/blob/05286527b9b88082151eb823df1d1721ff1023bd/apps/api.planx.uk/modules/gis/service/digitalLand.ts#L33-L34)?)
- estimated effort: 3-4 days of work. most of the queries seem straightforward to write
- England and Wales’ data and requirements seem quite similar, but maybe a more generic/abstract approach is better if it is likely that there will be future teams that aren’t in these jurisdictions