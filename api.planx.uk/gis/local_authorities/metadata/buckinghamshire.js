/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135

https://maps.buckscc.gov.uk/arcgis/rest/services/PLANNING/RIPA_BOPS/MapServer/
https://environment.data.gov.uk/arcgis/rest/services
https://inspire.wycombe.gov.uk/ (legacy)
*/

const bucksDomain = "https://maps.buckscc.gov.uk";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 5,
    fields: ["OBJECTID", "INT_ID", "DEV_TYPE", "DESCRIPTIO", "DISTRICT"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.DESCRIPTIO,
    }),
    records: { // planx value to "DEV_TYPE" lookup
      "article4.buckinghamshire.AD186731": "186731", // INT_ID
      "article4.buckinghamshire.AD285884": "285884", // INT_ID
      "article4.buckinghamshire.AD287247": "287247", // INT_ID
      "article4.buckinghamshire.AD390975": "390975", // INT_ID
      "article4.buckinghamshire.amershamroad": "Land to north-west of Amersham Road, Beaconsfield - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "article4.buckinghamshire.amershamroadeast": "Land East of Amersham Road including OS parcel 0006. Means of enclosure.", // line break
      "article4.buckinghamshire.asheridgeroad": "Land Surrounding Asheridge Road Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.bakerswood": "Land at Bakers Wood, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "article4.buckinghamshire.bakerswoodbrokengate": "Land between Bakers Wood and Broken Gate Lane, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure.",
      "article4.buckinghamshire.ballingerroad": "Land to the South of Ballinger Road - Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.ballingerroadnorth": "Land to north of Ballinger Road - Means of enclosure.", // line break
      "article4.buckinghamshire.bangorsroadnorth": "Sunrise, Bangors Road North, Iver - Agricultural",
      "article4.buckinghamshire.beamondendfarm": "Land at Beamond End Farm Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.blackthornelane": "Land to the North of Blackthorne Lane, Ballinger - Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.boismoorroad": "Land at the rear of 157-165 Bois Moor Road, Chesham - Means of enclosure.", // line break
      "article4.buckinghamshire.botleyroad": "Land off Botley Road, Chesham - Agricultural Buildings.", // line break
      "article4.buckinghamshire.boundaryroad": "Boundary Road, Land at Hill Farm, Taplow - Agricultural",
      "article4.buckinghamshire.bourneend": "Off Upper Thames Way, Bourne End - Gates etc, Markets, Racing", // different in airtable
      "article4.buckinghamshire.bovingdonheights.a": "North of Bovingdon Heights, Marlow - Gates, Fences, Walls etc", // different in airtable
      "article4.buckinghamshire.bovingdonheights.b": "North of Bovingdon Heights, Marlow - Caravan Sites", // different in airtable
      "article4.buckinghamshire.broadviewchesham": "Land off Broadview Chesham - Agricultural buildings.", // line break
      "article4.buckinghamshire.bryantsbottomroad.a": "Adj Bryants Bottom Road, Hughenden - Gates etc, Markets, Racing", // split a/b, different in airtable
      "article4.buckinghamshire.bryantsbottomroad.b": "Bryants Bottom Road, Hughenden - Agricultural Use", // split a/b, different in airtable
      "article4.buckinghamshire.burtonslane": "Land north of Burtons Lane extending to Carpenters and Hillas Woods Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.chalklaneanhydehealth": "Land below Chalk Lane, Hyde Heath Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.chartridgelane": "Land off Chartridge Lane, Chartridge Agricultural Buildings.", // line break
      "article4.buckinghamshire.cheshamroad": "Land off Chesham Road, Bellingdon Agricultural buildings.", // line break
      "article4.buckinghamshire.chessfieldparkenclosure": "Land at rear of Chessfield Park - Means of enclosure.", // line break
      "article4.buckinghamshire.churchlane": "Church lane, Wexham - Agricultural",
      "article4.buckinghamshire.collegeplantation": "College Plantation, Speen - Motor car and motorcycle racing", // line break, different in airtable
      "article4.buckinghamshire.collumgreen": "Land at Collum Green, Beaconsfield Road, Farnham Common - Agricultural",
      "article4.buckinghamshire.commonwood": "Common Wood - Penn Road, Hazlemere (b) - Agricultural Use", // different in airtable
      "article4.buckinghamshire.commonwoodagri": "Land at Common Wood, Penn. Agricultural buildings.", // line break
      "article4.buckinghamshire.commonwoodandpennroad": "Land between Common Wood and Penn Road, Hazlemere Agricultural buildings.", // line break
      "article4.buckinghamshire.commonwoodenclosure": "Land at Common Wood, Penn - Means of enclosure.", // line break
      "article4.buckinghamshire.commonwoodpennroad": "Land between Common Wood and Penn Road, Hazelmere Means of enclosure.", // line break
      "article4.buckinghamshire.coneybankwood": "Land South of Coneybank Wood, Great Missenden - Agricultural Buildings.", // line break
      "article4.buckinghamshire.copperkinslanecaravan": "Land off Copperkins Lane, Amersham - Caravan sites", // line break
      "article4.buckinghamshire.cooperkinslaneenclosure": "Land Off Copperkins Lane, Amersham - Means of enclosure", // line break, variable typo in airtable, check content
      "article4.buckinghamshire.coppicesouthheathcaravan": "Land at The Coppice, South Heath - Caravan Sites", // line break
      "article4.buckinghamshire.cryershillroad": "Valley Road/Cryers Hill Road, Hughenden - Caravan Sites", // different in airtable
      "article4.buckinghamshire.deanfield": "Part Fields SW of Deanfield, Saunderton (b) - Caravan sites", // different in airtable
      "article4.buckinghamshire.DO10fulmer": "", // no clear gis match
      "article4.buckinghamshire.dorneywoodroad": "Dorney Wood Road, Burnham - Agricultural",
      "article4.buckinghamshire.eastamershamroadOS0006": "Land East of Amersham Road including OS parcel 0006. Agricultural Buildings.", // line break
      "article4.buckinghamshire.eastamershamroadOS9269": "Land East of Amersham Road including OS Parcel 9269 Agricultural buildings.", // line break
      "article4.buckinghamshire.eastjasonshill": "Land to the East of Jasons Hill, Ley Hill Agricultural buildings.", // line break
      "article4.buckinghamshire.eastlatimervillage": "Land on East side of Latimer Village, adjoining Bucks/Herts border Agricultural Buildings.", // line break
      "article4.buckinghamshire.eastlodgelaneagri": "Land East of Lodge Lane Agricultural buildings.", // line break, variable typo in airtable, check content
      "article4.buckinghamshire.eastlodgelanecaravan": "Small parcel of land East of Lodge Lane Caravan sites.", // line break
      "article4.buckinghamshire.eastmarishlane": "Land adjoining the east side of Marish Lane and Slade Oak Lane and the north side of Mirrie Lane, Denham - Agricultural",
      "article4.buckinghamshire.eastvaleroad": "Land on East Side of Vale Road - Agricultural buildings and mineral working.", // line break
      "article4.buckinghamshire.ferrylane": "Water Meadows, Ferry Lane, Medmenham (a) - Gates, Fences, Walls etc", // different in airtable
      "article4.buckinghamshire.fourwinds": "Four Winds, Slough Road, Iver Heath - Agricultural",
      "article4.buckinghamshire.fulmer": "Land in Fulmer, Bucks - Agricultural",
      "article4.buckinghamshire.fulmerplacefarm": "Fulmer Place Farm, Fulmer - Agricultural",
      "article4.buckinghamshire.georgegreen": "",
      "article4.buckinghamshire.gravellyway": "",
      "article4.buckinghamshire.greenacres": "",
      "article4.buckinghamshire.greenstreetdarmagri": "",
      "article4.buckinghamshire.greenstreetfarm": "",
      "article4.buckinghamshire.hampdenroad": "",
      "article4.buckinghamshire.hollybushcorner": "",
      "article4.buckinghamshire.johnsonsfarm": "",
      "article4.buckinghamshire.junctionhughendenroad": "",
      "article4.buckinghamshire.lakeendroad": "",
      "article4.buckinghamshire.littlekingsash": "",
      "article4.buckinghamshire.lodgelane": "",
      "article4.buckinghamshire.lodgelaneagri": "",
      "article4.buckinghamshire.lodgelaneenclosure": "",
      "article4.buckinghamshire.manorfarm": "",
      "article4.buckinghamshire.mansionlanesouth": "",
      "article4.buckinghamshire.mansionlanewest": "",
      "article4.buckinghamshire.millfarm": "",
      "article4.buckinghamshire.ministrywharf": "",
      "article4.buckinghamshire.nightingaleslane": "",
      "article4.buckinghamshire.northandsouthhollowway": "",
      "article4.buckinghamshire.northballingerroadvaravan": "",
      "article4.buckinghamshire.northlongpark": "",
      "article4.buckinghamshire.northorbitalroad": "",
      "article4.buckinghamshire.northpark": "",
      "article4.buckinghamshire.northsidesevenhills": "",
      "article4.buckinghamshire.northwelderslane": "",
      "article4.buckinghamshire.officetoresi": "", // contains, not equality match
      "article4.buckinghamshire.OS1178": "",
      "article4.buckinghamshire.os262": "",
      "article4.buckinghamshire.OS3100": "",
      "article4.buckinghamshire.OS3313": "",
      "article4.buckinghamshire.OS4729": "",
      "article4.buckinghamshire.os5200": "",
      "article4.buckinghamshire.os6961": "",
      "article4.buckinghamshire.os8050": "",
      "article4.buckinghamshire.OS8349": "",
      "article4.buckinghamshire.parkspringwood": "",
      "article4.buckinghamshire.parslowshillock": "",
      "article4.buckinghamshire.pednorhighroad": "",
      "article4.buckinghamshire.pednorroadanddrydelllane": "",
      "article4.buckinghamshire.pednorroadcaravan": "",
      "article4.buckinghamshire.pednorroaddrydelllane": "",
      "article4.buckinghamshire.pednorroadenclosure": "",
      "article4.buckinghamshire.pennroad": "",
      "article4.buckinghamshire.phillipshillarm": "",
      "article4.buckinghamshire.phillipshillfarm": "",
      "article4.buckinghamshire.potkilnlaneandlayternsgreen": "",
      "article4.buckinghamshire.potterrowcaravan": "",
      "article4.buckinghamshire.potterrowenclosure": "",
      "article4.buckinghamshire.poultry": "", // contains, not equality match
      "article4.buckinghamshire.purtonlane": "",
      "article4.buckinghamshire.rearuplands": "",
      "article4.buckinghamshire.robertswooddrive": "",
      "article4.buckinghamshire.ruralwycombe": "",
      "article4.buckinghamshire.saunderton": "",
      "article4.buckinghamshire.sedgesfarm": "",
      "article4.buckinghamshire.sheepcotedellroad": "",
      "article4.buckinghamshire.sibleyscoppice": "",
      "article4.buckinghamshire.skimmersorchard": "",
      "article4.buckinghamshire.southA413": "",
      "article4.buckinghamshire.southchartridge": "",
      "article4.buckinghamshire.southeastfinchlane": "",
      "article4.buckinghamshire.southkilnlane": "",
      "article4.buckinghamshire.southlittlemissenden": "",
      "article4.buckinghamshire.southpenfoldlane": "",
      "article4.buckinghamshire.southpenfoldlaneOS262": "",
      "article4.buckinghamshire.southsheepcoteroad": "",
      "article4.buckinghamshire.southsidekiln": "",
      "article4.buckinghamshire.southswanbottom": "",
      "article4.buckinghamshire.stokenchurch": "",
      "article4.buckinghamshire.threeoaksfarm": "",
      "article4.buckinghamshire.turnerswood": "",
      "article4.buckinghamshire.turvillevalley": "",
      "article4.buckinghamshire.valleyroad": "",
      "article4.buckinghamshire.wellcottage": "",
      "article4.buckinghamshire.westledgelanecaravan": "",
      "article4.buckinghamshire.weststhubertslane": "",
      "article4.buckinghamshire.westwexhamstreet": "",
      "article4.buckinghamshire.wholedistrictpoultry": "",
      "article4.buckinghamshire.widmerfarm": "",
      "article4.buckinghamshire.wigginton": "",
      "article4.buckinghamshire.wiltonlane": "",
      "article4.buckinghamshire.wooburngreen": "",
      "article4.buckinghamshire.woodlandsmeadow": "",
      "article4.buckinghamshire.wyburnwood": "",
      "article4.buckinghamshire.wyburnwoodagri": "",
      "article4.buckinghamshire.wyburnwoodforestry": "",
      "article4.buckinghamshire.wycombehealthfarmnortheast": "",
      "article4.buckinghamshire.wycombehealthfarmspurlands": "",
      "article4.buckinghamshire.wycombeheathfarm": "",
      "article4.buckinghamshire.wycombeheathfarmcaravan": ""
    },
  },
  listed: {
    key: "listed",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 2,
    fields: ["OBJECTID", "GRADE", "DESCRIPTIO", "ADDRESS"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.DESCRIPTIO,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 1,
    fields: ["OBJECTID", "Name", "Desc_", "Grade"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.Name,
    }),
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 4,
    fields: ["OBJECTID", "NAME", "DESCRIPTIO"],
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: (data) => ({
      text: "is in an Area of Outstanding Natural Beauty",
      description: data.NAME,
    }),
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Bucks
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Bucks
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: "manual", // there are no WHS in Bucks
    neg: "is not an UNESCO World Heritage Site",
  },
  "designated.monument": {
    key: "designated.monument",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 3,
    fields: ["OBJECTID", "Name", "Desc_"],
    neg: "is not the site of a Scheduled Ancient Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Ancient Monument",
      description: data.Name,
    }),
  },
  tpo: {
    key: "tpo",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 6,
    fields: ["OBJECTID", "ORDERREF", "STATUS", "COMMENTS"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.COMMENTS,
    }),
  },
  "nature.SSSI": {
    key: "nature.SSSI",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 0,
    fields: ["OBJECTID", "sssi_name"],
    neg: "is not a Site of Special Scientific Interest",
    pos: (data) => ({
      text: "is a Site of Special Scientific Interest",
      description: data.sssi_name,
    }),
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

module.exports = {
  planningConstraints,
};
