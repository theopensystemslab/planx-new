/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135

https://maps.buckscc.gov.uk/arcgis/rest/services/PLANNING/RIPA_BOPS/MapServer/
https://environment.data.gov.uk/arcgis/rest/services
https://inspire.wycombe.gov.uk/ (legacy)
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Buck's source data in the following ways:
    //   * exact match of Digital Land entity.name after removing line break/return characters (aka "DEV_TYPE" in source data)
    //   * exact match of DL entity.json.notes ("INT_ID")
    //   * "starts with" DL entity.json.description ("DESCRIPTIO")
    records: {
      "articleFour.buckinghamshire.twyfordgrange": "309", // INT_ID
      "articleFour.buckinghamshire.ivylane": "318", // INT_ID
      "articleFour.buckinghamshire.ruralaylesbury": "320", // INT_ID
      "articleFour.buckinghamshire.piddingtonroad": "186731", // INT_ID
      "articleFour.buckinghamshire.rockylane": "285884", // INT_ID
      "articleFour.buckinghamshire.bridgestreet": "287247", // INT_ID
      "articleFour.buckinghamshire.winslowroad": "390975", // INT_ID
      "articleFour.buckinghamshire.amershamroad":
        "Land to north-west of Amersham Road, Beaconsfield - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "articleFour.buckinghamshire.amershamroadeast":
        "Land East of Amersham Road including OS parcel 0006. Means of enclosure.",
      "articleFour.buckinghamshire.asheridgeroad":
        "Land Surrounding Asheridge Road Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.bakerswood":
        "Land at Bakers Wood, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "articleFour.buckinghamshire.bakerswoodbrokengate":
        "Land between Bakers Wood and Broken Gate Lane, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure.",
      "articleFour.buckinghamshire.ballingerroad":
        "Land to the South of Ballinger Road - Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.ballingerroadnorth":
        "Land to north of Ballinger Road - Means of enclosure.",
      "articleFour.buckinghamshire.bangorsroadnorth":
        "Sunrise, Bangors Road North, Iver - Agricultural",
      "articleFour.buckinghamshire.beamondendfarm":
        "Land at Beamond End Farm Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.blackthornelane":
        "Land to the North of Blackthorne Lane, Ballinger - Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.boismoorroad":
        "Land at the rear of 157-165 Bois Moor Road, Chesham - Means of enclosure.",
      "articleFour.buckinghamshire.botleyroad":
        "Land off Botley Road, Chesham - Agricultural Buildings.",
      "articleFour.buckinghamshire.boundaryroad":
        "Boundary Road, Land at Hill Farm, Taplow - Agricultural",
      "articleFour.buckinghamshire.bourneend":
        "Off Upper Thames Way, Bourne End - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.bovingdonheights.a":
        "North of Bovingdon Heights, Marlow - Gates, Fences, Walls etc",
      "articleFour.buckinghamshire.bovingdonheights.b":
        "North of Bovingdon Heights, Marlow - Caravan Sites",
      "articleFour.buckinghamshire.broadviewchesham":
        "Land off Broadview Chesham - Agricultural buildings.",
      "articleFour.buckinghamshire.bryantsbottomroad.a":
        "Adj Bryants Bottom Road, Hughenden - Gates etc, Markets, Racing", // split a/b, different in airtable
      "articleFour.buckinghamshire.bryantsbottomroad.b":
        "Bryants Bottom Road, Hughenden - Agricultural Use", // split a/b, different in airtable
      "articleFour.buckinghamshire.burtonslane":
        "Land north of Burtons Lane extending to Carpenters and Hillas Woods Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.chalklaneanhydehealth":
        "Land below Chalk Lane, Hyde Heath Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.chartridgelane":
        "Land off Chartridge Lane, Chartridge Agricultural Buildings.",
      "articleFour.buckinghamshire.cheshamroad":
        "Land off Chesham Road, Bellingdon Agricultural buildings.",
      "articleFour.buckinghamshire.chessfieldparkenclosure":
        "Land at rear of Chessfield Park - Means of enclosure.",
      "articleFour.buckinghamshire.churchlane":
        "Church lane, Wexham - Agricultural",
      "articleFour.buckinghamshire.collegeplantation":
        "College Plantation, Speen - Motor car and motorcycle racing",
      "articleFour.buckinghamshire.collumgreen":
        "Land at Collum Green, Beaconsfield Road, Farnham Common - Agricultural",
      "articleFour.buckinghamshire.commonwood":
        "Common Wood - Penn Road, Hazlemere (b) - Agricultural Use",
      "articleFour.buckinghamshire.commonwoodagri":
        "Land at Common Wood, Penn. Agricultural buildings.",
      "articleFour.buckinghamshire.commonwoodandpennroad":
        "Land between Common Wood and Penn Road, Hazlemere Agricultural buildings.",
      "articleFour.buckinghamshire.commonwoodenclosure":
        "Land at Common Wood, Penn - Means of enclosure.",
      "articleFour.buckinghamshire.commonwoodpennroad":
        "Land between Common Wood and Penn Road, Hazelmere Means of enclosure.",
      "articleFour.buckinghamshire.coneybankwood":
        "Land South of Coneybank Wood, Great Missenden - Agricultural Buildings.",
      "articleFour.buckinghamshire.copperkinslanecaravan":
        "Land off Copperkins Lane, Amersham - Caravan sites",
      "articleFour.buckinghamshire.cooperkinslaneenclosure":
        "Land Off Copperkins Lane, Amersham - Means of enclosure", // variable typo in airtable, check content
      "articleFour.buckinghamshire.coppicesouthheathcaravan":
        "Land at The Coppice, South Heath - Caravan Sites",
      "articleFour.buckinghamshire.cryershillroad":
        "Valley Road/Cryers Hill Road, Hughenden - Caravan Sites",
      "articleFour.buckinghamshire.deanfield":
        "Part Fields SW of Deanfield, Saunderton (b) - Caravan sites",
      "articleFour.buckinghamshire.DOTenfulmer": "Fulmer - Agricultural",
      "articleFour.buckinghamshire.dorneywoodroad":
        "Dorney Wood Road, Burnham - Agricultural",
      "articleFour.buckinghamshire.eastamershamroadOSZeroZeroZeroSix":
        "Land East of Amersham Road including OS parcel 0006. Agricultural Buildings.",
      "articleFour.buckinghamshire.eastamershamroadOSNineTwoSixNine":
        "Land East of Amersham Road including OS Parcel 9269 Agricultural buildings.",
      "articleFour.buckinghamshire.eastjasonshill":
        "Land to the East of Jasons Hill, Ley Hill Agricultural buildings.",
      "articleFour.buckinghamshire.eastjordanslane":
        "OS parcel 449a and 447 East off Jordans Lane Breeding and keeping of poultry.",
      "articleFour.buckinghamshire.eastlatimervillage":
        "Land on East side of Latimer Village, adjoining Bucks/Herts border Agricultural Buildings.",
      "articleFour.buckinghamshire.eastlodgelaneagri":
        "Land East of Lodge Lane Agricultural buildings.", // variable typo in airtable, check content
      "articleFour.buckinghamshire.eastlodgelanecaravan":
        "Small parcel of land East of Lodge Lane Caravan sites.",
      "articleFour.buckinghamshire.eastmarishlane":
        "Land adjoining the east side of Marish Lane and Slade Oak Lane and the north side of Mirrie Lane, Denham - Agricultural",
      "articleFour.buckinghamshire.eastvaleroad":
        "Land on East Side of Vale Road - Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.ferrylane":
        "Water Meadows, Ferry Lane, Medmenham (a) - Gates, Fences, Walls etc",
      "articleFour.buckinghamshire.ferrylaneagri":
        "Water Meadows, Ferry Lane, Medmenham (b) - Agricultural & Fish Farming",
      "articleFour.buckinghamshire.fourwinds":
        "Four Winds, Slough Road, Iver Heath - Agricultural",
      "articleFour.buckinghamshire.fulmer":
        "Land in Fulmer, Bucks - Agricultural",
      "articleFour.buckinghamshire.fulmerplacefarm":
        "Fulmer Place Farm, Fulmer - Agricultural",
      "articleFour.buckinghamshire.georgegreen":
        "Land at George Green, Wexham, Bucks - Development",
      "articleFour.buckinghamshire.gravellyway":
        "Land at Gravelly Way, adjacent Common Wood, Penn Bottom - Means of enclosure.",
      "articleFour.buckinghamshire.greenacres":
        "All that piece of land known as Greenacres, Buslins Lane, north east of the Chartridge/Chesham Road Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.greenstreetfarmagri":
        "Land at Green Street Farm, Herts and Bucks border - Agricultural buildings.",
      "articleFour.buckinghamshire.greenstreetfarm.a":
        "Land at Green Street Farm, Herts and Bucks border Agricultural buildings.", // split a/b
      "articleFour.buckinghamshire.greenstreetfarm.b":
        "Land at Green Street Farm, Herts and Bucks border Highway access.", // split a/b
      "articleFour.buckinghamshire.hampdenroad":
        "Part Field West of Hampden Road - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.hollybushcorner":
        "Land South of Hollybush Corner, Farnham Common - Agricultural",
      "articleFour.buckinghamshire.johnsonsfarm":
        "Land at Johnsons Farm, North of Chesham Road, Bellingdon - Agricultural buildings.",
      "articleFour.buckinghamshire.junctionhughendenroad":
        "Junction Hughenden Rd & Cryers Hill Rd - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.lakeendroad":
        "Land between Lake End road and Huntercombe Lane South, Burnham - Development",
      "articleFour.buckinghamshire.littlekingsash":
        "Land know as Little Kings Ash Farm and adjoining land at Kingsash and Lee Gate - Agricultural buildings.",
      "articleFour.buckinghamshire.lodgelane":
        "Land East of Lodge Lane Means of enclosure.",
      "articleFour.buckinghamshire.lodgelaneagri":
        "3 parcels of land surrounding Lodge Lane Agricultural buildings.",
      "articleFour.buckinghamshire.lodgelaneenclosure":
        "Small parcel of Land East of Lodge Lane Means of enclosure.",
      "articleFour.buckinghamshire.lodgelanewestenclosure":
        "Land West of Lodge Lane Means of enclosure.",
      "articleFour.buckinghamshire.manorfarm":
        "Manor Farm, Coates Lane - Agricultural Use",
      "articleFour.buckinghamshire.mansionlanesouth":
        "Land West of Mansion Lane, Immediately South of Iverdale Close, Iver - Development",
      "articleFour.buckinghamshire.mansionlanewest":
        "Land West of Mansion Lane - immediately to the west and south row of cottages No's 110-148 Mansion Lane, Iver - Development",
      "articleFour.buckinghamshire.millfarm":
        "Land North of Mill Farm, Chenies Bottom - Agricultural Buildings.",
      "articleFour.buckinghamshire.ministrywharf":
        "NW of Ministry Wharf, Saunderton - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.nightingaleslanestrip":
        "Land surrounding Nightingales Lane, 2290 metre long strip. - Means of enclosure.",
      "articleFour.buckinghamshire.northAFourZeroFour":
        "Land north of A404 Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.northandsouthhollowway":
        "Land north and south of Hollow Way between Chesham and Pednor - Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.northballingerroadvaravan":
        "Land to north of Ballinger Road - Caravan sites.",
      "articleFour.buckinghamshire.northjordansfarm":
        "Land east of Jordans Lane and north of Jordans Farm Agricultural buildings.",
      "articleFour.buckinghamshire.northlongpark":
        "Land to the north of Long Park, Chesham Bois - Agricultural buildings.", // no clear gis match
      "articleFour.buckinghamshire.northorbitalroad":
        "Land off North Orbital Road, Denham - Caravan Site",
      "articleFour.buckinghamshire.northpark":
        "Land to north of North Park and West of St Andrews Church, Iver - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure.",
      "articleFour.buckinghamshire.northsidesevenhills":
        "Land on the North Side of Seven Hills Road, Iver - Agricultural",
      "articleFour.buckinghamshire.northwelderslane":
        "Land North of Welders Lane, South of Jordans Way Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.officetoresi":
        "Change of use from offices to residential", // DESCRIPTIO starts with, no DEV_TYPE match
      "articleFour.buckinghamshire.osOneOneSevenEight":
        "OS parcel 1178, 1179, 1180 nr Asheridge Farm Agricultural Buildings",
      "articleFour.buckinghamshire.osTwoSixTwo":
        "OS Parcel 262, Penfolds Lane, Holmer Green Means of enclosure.",
      "articleFour.buckinghamshire.osThreeOneZeroZero":
        "OS Parcels 3100, 2829 - Means of enclosure and agricultural buildings.",
      "articleFour.buckinghamshire.osThreeThreeOneThree.a":
        "OS parcel 3313 north of Welders Lane Caravan sites.", // split a/b
      "articleFour.buckinghamshire.osThreeThreeOneThree.b":
        "OS parcel 3313 north of Welders Lane Means of enclosure.", // split a/b
      "articleFour.buckinghamshire.osFourSevenTwoNine":
        "O.S. Parcel No. 4729 at Swan Bottom Agricultural Buildings.",
      "articleFour.buckinghamshire.osFiveTwoZeroZero":
        "OS Parcel 5200, Windsor Lane, Little Kingshill Means of enclosure.",
      "articleFour.buckinghamshire.osSixNineSixOne":
        "OS parcel 6961 to West of Amersham Road, Chalfont St Giles Means of enclosure.",
      "articleFour.buckinghamshire.osEightZeroFiveZero":
        "Land West of Amersham Road OS parcels 8050 and 8750 Means of enclosure.",
      "articleFour.buckinghamshire.osEightThreeFourNine":
        "OS parcel 8349, 6265, 7466, off Bellingdon Road Agricultural buildings.",
      "articleFour.buckinghamshire.parkspringwood":
        "Parkspring Wood, Fulmer - Agricultural",
      "articleFour.buckinghamshire.parslowshillock":
        "Parslow's Hillock to Loosley Row, Lacey Green - Agricultural Use",
      "articleFour.buckinghamshire.pednorhighroad":
        "Land Surrounding Pednor High Road Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.pednorroadanddrydelllane":
        "Land between Pednor Road and Drydell Lane - Caravan sites.",
      "articleFour.buckinghamshire.pednorroadcaravan":
        "Land off Pednor Road, Chesham - Caravan Sites.",
      "articleFour.buckinghamshire.pednorroaddrydelllane":
        "Land between Pednor Road and Drydell Lane - Means of enclosure.",
      "articleFour.buckinghamshire.pednorroadenclosure":
        "Land off Pednor Road, Chesham - Means of enclosure.",
      "articleFour.buckinghamshire.pennroad":
        "Common Wood - Penn Road, Hazlemere (a) - Gates, Fences, Walls etc",
      "articleFour.buckinghamshire.pennwood":
        "Land at Penn Wood, Penn Street - Off road vehicles.",
      "articleFour.buckinghamshire.phillipshillfarm.a":
        "Land at Phillipshill Farm off Old Shire Lane and Burtons Lane Agricultural Buildings.", // split a/b, variable typo in airtable, check content
      "articleFour.buckinghamshire.phillipshillfarm.b":
        "Land at Phillipshill Farm off Old Shire Lane and Burtons Lane Means of enclosure.", // split a/b
      "articleFour.buckinghamshire.piggery":
        "Buildings for use as piggery on agricultural land", // DESCRIPTIO starts with, no DEV_TYPE match
      "articleFour.buckinghamshire.potkilnlaneandlaytersgreen":
        "Land between Potkiln Lane and Layters Green Lane Agricultural Buildings.",
      "articleFour.buckinghamshire.potterrowcaravan":
        "Land East of Potter Row, Great Missenden - Caravan sites.",
      "articleFour.buckinghamshire.potterrowenclosure":
        "Land East of Potter Row, Great Missenden - Means of enclosure",
      "articleFour.buckinghamshire.poultry":
        "Former Wycombe Rural District - Poultry Production",
      "articleFour.buckinghamshire.purtonlane":
        "Purton Lane/Farnham Park Lane, Farnham Royal - Agricultural",
      "articleFour.buckinghamshire.rearuplands":
        "Land at the rear of Uplands, Swan Bottom (OS Parcel 2216) - Agricultural Buildings and means of enclosure.",
      "articleFour.buckinghamshire.robertswooddrive":
        "Land East of Roberts Wood Drive Means of enclosure.",
      "articleFour.buckinghamshire.ruralwycombe":
        "The whole of the Rural District of Wycombe in the county of Buckingham which includes the Area of Watchet Road, High Wycombe, edge of Chiltern District Council area - Poultry production",
      "articleFour.buckinghamshire.saunderton":
        "Part Fields SW of Deanfield, Saunderton (a) - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.sedgesfarm":
        "Strip Land at Sedges Farm, Great Missenden - Means of enclosure.",
      "articleFour.buckinghamshire.sheepcotedellroad":
        "Land South of Sheepcote Dell Road, Holmer Green, including Land East of Earl Howe Road Means of enclosure.",
      "articleFour.buckinghamshire.shepherdsfold":
        "Land south of Penfold Lane and adjoining the rear of properties in Shepherds Fold and Winters Way Agricultural Buildings.",
      "articleFour.buckinghamshire.sibleyscoppice":
        "Land at Sibleys Coppice, South Heath - Means of enclosure.",
      "articleFour.buckinghamshire.skimmersorchard.a":
        "Land at Skimmers Orchard, Holmer Green (a) Holding of Markets (b) Motor Racing.", // split a/b/c
      "articleFour.buckinghamshire.skimmersorchard.b":
        "Land at Skimmers Orchard, Holmer Green Caravan Site", // split a/b/c
      "articleFour.buckinghamshire.skimmersorchard.c":
        "Land at Skimmers Orchard, Holmer Green Means of Enclosure.", // split a/b/c
      "articleFour.buckinghamshire.southAFourOneThree":
        "Land South of A413 in Little Missenden Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.southchartridge":
        "Southern side Chartridge Lane between Chartridge-Pednor Bottom. Agricultural buildings and mineral working. OS parcels 1348, 1347, 1369, 1367, Southern side Chartridge Lane Agricultural buildings and mineral working. OS parcels 1274, 1279, 1328, Northern",
      "articleFour.buckinghamshire.southeastfinchlane":
        "Land Southeast of Finch Lane Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.southkilnlane":
        "Land to South of Kiln Lane, Ley Hill Agricultural Buildings.",
      "articleFour.buckinghamshire.southlittlemissenden":
        "Land to the South of Little Missenden Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.southpenfoldlane.a":
        "Land south of Penfold Lane and adjoining the rear of properties in Shepherds Fold and Winters Way Agricultural Buildings.", // split a/b
      "articleFour.buckinghamshire.southpenfoldlane.b":
        "Land to the South of Penfold Lane Agricultural Buildings.", // split a/b
      "articleFour.buckinghamshire.southpenfoldlaneOSTwoSixTwo":
        "Land south of Penfold Lane (OS Parcel 262) Caravan Sites.",
      "articleFour.buckinghamshire.southsheepcoteroad":
        "Land South of Sheepcote Dell Road, Holmer Green, including Land East of Earl Howe Road Agricultural Buildings.",
      "articleFour.buckinghamshire.southsidekiln":
        "Land on South Side of Kiln Lane Hedgerley - Agricultural",
      "articleFour.buckinghamshire.southswanbottom":
        "Land on the south side of Swan Bottom Road - Agricultural buildings.",
      "articleFour.buckinghamshire.stokenchurch":
        "North of A40, Stokenchurch - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.threeoaksfarm":
        "Land formally known as Three Oaks Farm, East Side, Roberts Lane Means of enclosure.",
      "articleFour.buckinghamshire.turnerswood":
        "Land at Turners Wood on the NE side of Amersham Road, Chalfont St Giles Agricultural buildings.",
      "articleFour.buckinghamshire.turvillevalley":
        "Turville Valley - Agricultural Use",
      "articleFour.buckinghamshire.valleyroad":
        "Valley Road (formerly pt Hitchenden Farm) - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.wellcottage":
        "N of Well Cottage, Church Ln, Lacey Green - Gates etc, Markets, Racing",
      "articleFour.buckinghamshire.westledgelanecaravan":
        "Land West of Lodge Lane Caravan sites.",
      "articleFour.buckinghamshire.weststhubertslane":
        "Land on the West and North-East sides of St Huberts Lane, Gerrards Cross - Agricultural",
      "articleFour.buckinghamshire.westwexhamstreet":
        "Land to the west of Wexham Street, Stoke Poges - Markets",
      "articleFour.buckinghamshire.wholedistrictpoultry":
        "Whole District excluding the Town of Chesham - Poultry production.",
      "articleFour.buckinghamshire.widmerfarm":
        "Widmer Farm, Lacey Green - Agricultural Use",
      "articleFour.buckinghamshire.wigginton":
        "In the area of Wigginton - Agricultural buildings.",
      "articleFour.buckinghamshire.wiltonlane":
        "Land at Wilton Lane, Seer Green - Agricultural buildings and mineral working.",
      "articleFour.buckinghamshire.wooburngreen":
        "Wooburn Green - Agricultural Use",
      "articleFour.buckinghamshire.woodlandsmeadow":
        "Land at Woodlands Meadow, Jasons Hill, Ley Hill Means of enclosure.",
      "articleFour.buckinghamshire.wyburnwood":
        "Land at Wyburn Wood off Amersham Road - Means of enclosure.",
      "articleFour.buckinghamshire.wyburnwoodagri":
        "Land at Wyburn Wood off Amersham Road - Agricultural Buildings.",
      "articleFour.buckinghamshire.wyburnwoodforestry":
        "Land at Wyburn Wood off Amersham Road - Forestry.",
      "articleFour.buckinghamshire.wycombehealthfarmnortheast":
        "Land to NE of Wycombe Heath Farm, Spurlands End Lane, Holmer Green Means of enclosure.",
      "articleFour.buckinghamshire.wycombehealthfarmspurlands":
        "Land at Wycombe Heath Farm, Spurlands End Means of enclosure.",
      "articleFour.buckinghamshire.wycombeheathfarm":
        "Land to NE of Wycombe Heath Farm, Spurlands End Lane, Holmer Green Caravan sites.",
      "articleFour.buckinghamshire.wycombeheathfarmcaravan":
        "Land at Wycombe Heath Farm, Spurlands End Caravan sites.",
    },
  },
};

export { planningConstraints };
