/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135

https://maps.buckscc.gov.uk/arcgis/rest/services/PLANNING/RIPA_BOPS/MapServer/
https://environment.data.gov.uk/arcgis/rest/services
https://inspire.wycombe.gov.uk/ (legacy)
*/

const planningConstraints = {
  article4: {
    // Planx granular values link to Buck's source data in the following ways:
    //   * exact match of Digital Land entity.name after removing line break/return characters (aka "DEV_TYPE" in source data)
    //   * exact match of DL entity.json.notes ("INT_ID")
    //   * "starts with" DL entity.json.description ("DESCRIPTIO")
    records: {
      "article4.buckinghamshire.twyfordgrange": "309", // INT_ID
      "article4.buckinghamshire.ivylane": "318", // INT_ID
      "article4.buckinghamshire.ruralaylesbury": "320", // INT_ID
      "article4.buckinghamshire.piddingtonroad": "186731", // INT_ID
      "article4.buckinghamshire.rockylane": "285884", // INT_ID
      "article4.buckinghamshire.bridgestreet": "287247", // INT_ID
      "article4.buckinghamshire.winslowroad": "390975", // INT_ID
      "article4.buckinghamshire.amershamroad":
        "Land to north-west of Amersham Road, Beaconsfield - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "article4.buckinghamshire.amershamroadeast":
        "Land East of Amersham Road including OS parcel 0006. Means of enclosure.",
      "article4.buckinghamshire.asheridgeroad":
        "Land Surrounding Asheridge Road Agricultural buildings and mineral working.",
      "article4.buckinghamshire.bakerswood":
        "Land at Bakers Wood, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure",
      "article4.buckinghamshire.bakerswoodbrokengate":
        "Land between Bakers Wood and Broken Gate Lane, Denham - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure.",
      "article4.buckinghamshire.ballingerroad":
        "Land to the South of Ballinger Road - Agricultural buildings and mineral working.",
      "article4.buckinghamshire.ballingerroadnorth":
        "Land to north of Ballinger Road - Means of enclosure.",
      "article4.buckinghamshire.bangorsroadnorth":
        "Sunrise, Bangors Road North, Iver - Agricultural",
      "article4.buckinghamshire.beamondendfarm":
        "Land at Beamond End Farm Agricultural buildings and mineral working.",
      "article4.buckinghamshire.blackthornelane":
        "Land to the North of Blackthorne Lane, Ballinger - Agricultural buildings and mineral working.",
      "article4.buckinghamshire.boismoorroad":
        "Land at the rear of 157-165 Bois Moor Road, Chesham - Means of enclosure.",
      "article4.buckinghamshire.botleyroad":
        "Land off Botley Road, Chesham - Agricultural Buildings.",
      "article4.buckinghamshire.boundaryroad":
        "Boundary Road, Land at Hill Farm, Taplow - Agricultural",
      "article4.buckinghamshire.bourneend":
        "Off Upper Thames Way, Bourne End - Gates etc, Markets, Racing",
      "article4.buckinghamshire.bovingdonheights.a":
        "North of Bovingdon Heights, Marlow - Gates, Fences, Walls etc",
      "article4.buckinghamshire.bovingdonheights.b":
        "North of Bovingdon Heights, Marlow - Caravan Sites",
      "article4.buckinghamshire.broadviewchesham":
        "Land off Broadview Chesham - Agricultural buildings.",
      "article4.buckinghamshire.bryantsbottomroad.a":
        "Adj Bryants Bottom Road, Hughenden - Gates etc, Markets, Racing", // split a/b, different in airtable
      "article4.buckinghamshire.bryantsbottomroad.b":
        "Bryants Bottom Road, Hughenden - Agricultural Use", // split a/b, different in airtable
      "article4.buckinghamshire.burtonslane":
        "Land north of Burtons Lane extending to Carpenters and Hillas Woods Agricultural buildings and mineral working.",
      "article4.buckinghamshire.chalklaneanhydehealth":
        "Land below Chalk Lane, Hyde Heath Agricultural buildings and mineral working.",
      "article4.buckinghamshire.chartridgelane":
        "Land off Chartridge Lane, Chartridge Agricultural Buildings.",
      "article4.buckinghamshire.cheshamroad":
        "Land off Chesham Road, Bellingdon Agricultural buildings.",
      "article4.buckinghamshire.chessfieldparkenclosure":
        "Land at rear of Chessfield Park - Means of enclosure.",
      "article4.buckinghamshire.churchlane":
        "Church lane, Wexham - Agricultural",
      "article4.buckinghamshire.collegeplantation":
        "College Plantation, Speen - Motor car and motorcycle racing",
      "article4.buckinghamshire.collumgreen":
        "Land at Collum Green, Beaconsfield Road, Farnham Common - Agricultural",
      "article4.buckinghamshire.commonwood":
        "Common Wood - Penn Road, Hazlemere (b) - Agricultural Use",
      "article4.buckinghamshire.commonwoodagri":
        "Land at Common Wood, Penn. Agricultural buildings.",
      "article4.buckinghamshire.commonwoodandpennroad":
        "Land between Common Wood and Penn Road, Hazlemere Agricultural buildings.",
      "article4.buckinghamshire.commonwoodenclosure":
        "Land at Common Wood, Penn - Means of enclosure.",
      "article4.buckinghamshire.commonwoodpennroad":
        "Land between Common Wood and Penn Road, Hazelmere Means of enclosure.",
      "article4.buckinghamshire.coneybankwood":
        "Land South of Coneybank Wood, Great Missenden - Agricultural Buildings.",
      "article4.buckinghamshire.copperkinslanecaravan":
        "Land off Copperkins Lane, Amersham - Caravan sites",
      "article4.buckinghamshire.cooperkinslaneenclosure":
        "Land Off Copperkins Lane, Amersham - Means of enclosure", // variable typo in airtable, check content
      "article4.buckinghamshire.coppicesouthheathcaravan":
        "Land at The Coppice, South Heath - Caravan Sites",
      "article4.buckinghamshire.cryershillroad":
        "Valley Road/Cryers Hill Road, Hughenden - Caravan Sites",
      "article4.buckinghamshire.deanfield":
        "Part Fields SW of Deanfield, Saunderton (b) - Caravan sites",
      "article4.buckinghamshire.DO10fulmer": "Fulmer - Agricultural",
      "article4.buckinghamshire.dorneywoodroad":
        "Dorney Wood Road, Burnham - Agricultural",
      "article4.buckinghamshire.eastamershamroadOS0006":
        "Land East of Amersham Road including OS parcel 0006. Agricultural Buildings.",
      "article4.buckinghamshire.eastamershamroadOS9269":
        "Land East of Amersham Road including OS Parcel 9269 Agricultural buildings.",
      "article4.buckinghamshire.eastjasonshill":
        "Land to the East of Jasons Hill, Ley Hill Agricultural buildings.",
      "article4.buckinghamshire.eastjordanslane":
        "OS parcel 449a and 447 East off Jordans Lane Breeding and keeping of poultry.",
      "article4.buckinghamshire.eastlatimervillage":
        "Land on East side of Latimer Village, adjoining Bucks/Herts border Agricultural Buildings.",
      "article4.buckinghamshire.eastlodgelaneagri":
        "Land East of Lodge Lane Agricultural buildings.", // variable typo in airtable, check content
      "article4.buckinghamshire.eastlodgelanecaravan":
        "Small parcel of land East of Lodge Lane Caravan sites.",
      "article4.buckinghamshire.eastmarishlane":
        "Land adjoining the east side of Marish Lane and Slade Oak Lane and the north side of Mirrie Lane, Denham - Agricultural",
      "article4.buckinghamshire.eastvaleroad":
        "Land on East Side of Vale Road - Agricultural buildings and mineral working.",
      "article4.buckinghamshire.ferrylane":
        "Water Meadows, Ferry Lane, Medmenham (a) - Gates, Fences, Walls etc",
      "article4.buckinghamshire.ferrylaneagri":
        "Water Meadows, Ferry Lane, Medmenham (b) - Agricultural & Fish Farming",
      "article4.buckinghamshire.fourwinds":
        "Four Winds, Slough Road, Iver Heath - Agricultural",
      "article4.buckinghamshire.fulmer": "Land in Fulmer, Bucks - Agricultural",
      "article4.buckinghamshire.fulmerplacefarm":
        "Fulmer Place Farm, Fulmer - Agricultural",
      "article4.buckinghamshire.georgegreen":
        "Land at George Green, Wexham, Bucks - Development",
      "article4.buckinghamshire.gravellyway":
        "Land at Gravelly Way, adjacent Common Wood, Penn Bottom - Means of enclosure.",
      "article4.buckinghamshire.greenacres":
        "All that piece of land known as Greenacres, Buslins Lane, north east of the Chartridge/Chesham Road Agricultural buildings and mineral working.",
      "article4.buckinghamshire.greenstreetfarmagri":
        "Land at Green Street Farm, Herts and Bucks border - Agricultural buildings.",
      "article4.buckinghamshire.greenstreetfarm.a":
        "Land at Green Street Farm, Herts and Bucks border Agricultural buildings.", // split a/b
      "article4.buckinghamshire.greenstreetfarm.b":
        "Land at Green Street Farm, Herts and Bucks border Highway access.", // split a/b
      "article4.buckinghamshire.hampdenroad":
        "Part Field West of Hampden Road - Gates etc, Markets, Racing",
      "article4.buckinghamshire.hollybushcorner":
        "Land South of Hollybush Corner, Farnham Common - Agricultural",
      "article4.buckinghamshire.johnsonsfarm":
        "Land at Johnsons Farm, North of Chesham Road, Bellingdon - Agricultural buildings.",
      "article4.buckinghamshire.junctionhughendenroad":
        "Junction Hughenden Rd & Cryers Hill Rd - Gates etc, Markets, Racing",
      "article4.buckinghamshire.lakeendroad":
        "Land between Lake End road and Huntercombe Lane South, Burnham - Development",
      "article4.buckinghamshire.littlekingsash":
        "Land know as Little Kings Ash Farm and adjoining land at Kingsash and Lee Gate - Agricultural buildings.",
      "article4.buckinghamshire.lodgelane":
        "Land East of Lodge Lane Means of enclosure.",
      "article4.buckinghamshire.lodgelaneagri":
        "3 parcels of land surrounding Lodge Lane Agricultural buildings.",
      "article4.buckinghamshire.lodgelaneenclosure":
        "Small parcel of Land East of Lodge Lane Means of enclosure.",
      "article4.buckinghamshire.lodgelanewestenclosure":
        "Land West of Lodge Lane Means of enclosure.",
      "article4.buckinghamshire.manorfarm":
        "Manor Farm, Coates Lane - Agricultural Use",
      "article4.buckinghamshire.mansionlanesouth":
        "Land West of Mansion Lane, Immediately South of Iverdale Close, Iver - Development",
      "article4.buckinghamshire.mansionlanewest":
        "Land West of Mansion Lane - immediately to the west and south row of cottages No's 110-148 Mansion Lane, Iver - Development",
      "article4.buckinghamshire.millfarm":
        "Land North of Mill Farm, Chenies Bottom - Agricultural Buildings.",
      "article4.buckinghamshire.ministrywharf":
        "NW of Ministry Wharf, Saunderton - Gates etc, Markets, Racing",
      "article4.buckinghamshire.nightingaleslanestrip":
        "Land surrounding Nightingales Lane, 2290 metre long strip. - Means of enclosure.",
      "article4.buckinghamshire.northA404":
        "Land north of A404 Agricultural buildings and mineral working.",
      "article4.buckinghamshire.northandsouthhollowway":
        "Land north and south of Hollow Way between Chesham and Pednor - Agricultural buildings and mineral working.",
      "article4.buckinghamshire.northballingerroadvaravan":
        "Land to north of Ballinger Road - Caravan sites.",
      "article4.buckinghamshire.northjordansfarm":
        "Land east of Jordans Lane and north of Jordans Farm Agricultural buildings.",
      "article4.buckinghamshire.northlongpark":
        "Land to the north of Long Park, Chesham Bois - Agricultural buildings.", // no clear gis match
      "article4.buckinghamshire.northorbitalroad":
        "Land off North Orbital Road, Denham - Caravan Site",
      "article4.buckinghamshire.northpark":
        "Land to north of North Park and West of St Andrews Church, Iver - the erection, construction, maintenance, improvement or alteration of a gate, fence, wall or other means of enclosure.",
      "article4.buckinghamshire.northsidesevenhills":
        "Land on the North Side of Seven Hills Road, Iver - Agricultural",
      "article4.buckinghamshire.northwelderslane":
        "Land North of Welders Lane, South of Jordans Way Agricultural buildings and mineral working.",
      "article4.buckinghamshire.officetoresi":
        "Change of use from offices to residential", // DESCRIPTIO starts with, no DEV_TYPE match
      "article4.buckinghamshire.os1178":
        "OS parcel 1178, 1179, 1180 nr Asheridge Farm Agricultural Buildings",
      "article4.buckinghamshire.os262":
        "OS Parcel 262, Penfolds Lane, Holmer Green Means of enclosure.",
      "article4.buckinghamshire.os3100":
        "OS Parcels 3100, 2829 - Means of enclosure and agricultural buildings.",
      "article4.buckinghamshire.os3313.a":
        "OS parcel 3313 north of Welders Lane Caravan sites.", // split a/b
      "article4.buckinghamshire.os3313.b":
        "OS parcel 3313 north of Welders Lane Means of enclosure.", // split a/b
      "article4.buckinghamshire.os4729":
        "O.S. Parcel No. 4729 at Swan Bottom Agricultural Buildings.",
      "article4.buckinghamshire.os5200":
        "OS Parcel 5200, Windsor Lane, Little Kingshill Means of enclosure.",
      "article4.buckinghamshire.os6961":
        "OS parcel 6961 to West of Amersham Road, Chalfont St Giles Means of enclosure.",
      "article4.buckinghamshire.os8050":
        "Land West of Amersham Road OS parcels 8050 and 8750 Means of enclosure.",
      "article4.buckinghamshire.os8349":
        "OS parcel 8349, 6265, 7466, off Bellingdon Road Agricultural buildings.",
      "article4.buckinghamshire.parkspringwood":
        "Parkspring Wood, Fulmer - Agricultural",
      "article4.buckinghamshire.parslowshillock":
        "Parslow's Hillock to Loosley Row, Lacey Green - Agricultural Use",
      "article4.buckinghamshire.pednorhighroad":
        "Land Surrounding Pednor High Road Agricultural buildings and mineral working.",
      "article4.buckinghamshire.pednorroadanddrydelllane":
        "Land between Pednor Road and Drydell Lane - Caravan sites.",
      "article4.buckinghamshire.pednorroadcaravan":
        "Land off Pednor Road, Chesham - Caravan Sites.",
      "article4.buckinghamshire.pednorroaddrydelllane":
        "Land between Pednor Road and Drydell Lane - Means of enclosure.",
      "article4.buckinghamshire.pednorroadenclosure":
        "Land off Pednor Road, Chesham - Means of enclosure.",
      "article4.buckinghamshire.pennroad":
        "Common Wood - Penn Road, Hazlemere (a) - Gates, Fences, Walls etc",
      "article4.buckinghamshire.pennwood":
        "Land at Penn Wood, Penn Street - Off road vehicles.",
      "article4.buckinghamshire.phillipshillfarm.a":
        "Land at Phillipshill Farm off Old Shire Lane and Burtons Lane Agricultural Buildings.", // split a/b, variable typo in airtable, check content
      "article4.buckinghamshire.phillipshillfarm.b":
        "Land at Phillipshill Farm off Old Shire Lane and Burtons Lane Means of enclosure.", // split a/b
      "article4.buckinghamshire.piggery":
        "Buildings for use as piggery on agricultural land", // DESCRIPTIO starts with, no DEV_TYPE match
      "article4.buckinghamshire.potkilnlaneandlaytersgreen":
        "Land between Potkiln Lane and Layters Green Lane Agricultural Buildings.",
      "article4.buckinghamshire.potterrowcaravan":
        "Land East of Potter Row, Great Missenden - Caravan sites.",
      "article4.buckinghamshire.potterrowenclosure":
        "Land East of Potter Row, Great Missenden - Means of enclosure",
      "article4.buckinghamshire.poultry":
        "Former Wycombe Rural District - Poultry Production",
      "article4.buckinghamshire.purtonlane":
        "Purton Lane/Farnham Park Lane, Farnham Royal - Agricultural",
      "article4.buckinghamshire.rearuplands":
        "Land at the rear of Uplands, Swan Bottom (OS Parcel 2216) - Agricultural Buildings and means of enclosure.",
      "article4.buckinghamshire.robertswooddrive":
        "Land East of Roberts Wood Drive Means of enclosure.",
      "article4.buckinghamshire.ruralwycombe":
        "The whole of the Rural District of Wycombe in the county of Buckingham which includes the Area of Watchet Road, High Wycombe, edge of Chiltern District Council area - Poultry production",
      "article4.buckinghamshire.saunderton":
        "Part Fields SW of Deanfield, Saunderton (a) - Gates etc, Markets, Racing",
      "article4.buckinghamshire.sedgesfarm":
        "Strip Land at Sedges Farm, Great Missenden - Means of enclosure.",
      "article4.buckinghamshire.sheepcotedellroad":
        "Land South of Sheepcote Dell Road, Holmer Green, including Land East of Earl Howe Road Means of enclosure.",
      "article4.buckinghamshire.shepherdsfold":
        "Land south of Penfold Lane and adjoining the rear of properties in Shepherds Fold and Winters Way Agricultural Buildings.",
      "article4.buckinghamshire.sibleyscoppice":
        "Land at Sibleys Coppice, South Heath - Means of enclosure.",
      "article4.buckinghamshire.skimmersorchard.a":
        "Land at Skimmers Orchard, Holmer Green (a) Holding of Markets (b) Motor Racing.", // split a/b/c
      "article4.buckinghamshire.skimmersorchard.b":
        "Land at Skimmers Orchard, Holmer Green Caravan Site", // split a/b/c
      "article4.buckinghamshire.skimmersorchard.c":
        "Land at Skimmers Orchard, Holmer Green Means of Enclosure.", // split a/b/c
      "article4.buckinghamshire.southA413":
        "Land South of A413 in Little Missenden Agricultural buildings and mineral working.",
      "article4.buckinghamshire.southchartridge":
        "Southern side Chartridge Lane between Chartridge-Pednor Bottom. Agricultural buildings and mineral working. OS parcels 1348, 1347, 1369, 1367, Southern side Chartridge Lane Agricultural buildings and mineral working. OS parcels 1274, 1279, 1328, Northern",
      "article4.buckinghamshire.southeastfinchlane":
        "Land Southeast of Finch Lane Agricultural buildings and mineral working.",
      "article4.buckinghamshire.southkilnlane":
        "Land to South of Kiln Lane, Ley Hill Agricultural Buildings.",
      "article4.buckinghamshire.southlittlemissenden":
        "Land to the South of Little Missenden Agricultural buildings and mineral working.",
      "article4.buckinghamshire.southpenfoldlane.a":
        "Land south of Penfold Lane and adjoining the rear of properties in Shepherds Fold and Winters Way Agricultural Buildings.", // split a/b
      "article4.buckinghamshire.southpenfoldlane.b":
        "Land to the South of Penfold Lane Agricultural Buildings.", // split a/b
      "article4.buckinghamshire.southpenfoldlaneOS262":
        "Land south of Penfold Lane (OS Parcel 262) Caravan Sites.",
      "article4.buckinghamshire.southsheepcoteroad":
        "Land South of Sheepcote Dell Road, Holmer Green, including Land East of Earl Howe Road Agricultural Buildings.",
      "article4.buckinghamshire.southsidekiln":
        "Land on South Side of Kiln Lane Hedgerley - Agricultural",
      "article4.buckinghamshire.southswanbottom":
        "Land on the south side of Swan Bottom Road - Agricultural buildings.",
      "article4.buckinghamshire.stokenchurch":
        "North of A40, Stokenchurch - Gates etc, Markets, Racing",
      "article4.buckinghamshire.threeoaksfarm":
        "Land formally known as Three Oaks Farm, East Side, Roberts Lane Means of enclosure.",
      "article4.buckinghamshire.turnerswood":
        "Land at Turners Wood on the NE side of Amersham Road, Chalfont St Giles Agricultural buildings.",
      "article4.buckinghamshire.turvillevalley":
        "Turville Valley - Agricultural Use",
      "article4.buckinghamshire.valleyroad":
        "Valley Road (formerly pt Hitchenden Farm) - Gates etc, Markets, Racing",
      "article4.buckinghamshire.wellcottage":
        "N of Well Cottage, Church Ln, Lacey Green - Gates etc, Markets, Racing",
      "article4.buckinghamshire.westledgelanecaravan":
        "Land West of Lodge Lane Caravan sites.",
      "article4.buckinghamshire.weststhubertslane":
        "Land on the West and North-East sides of St Huberts Lane, Gerrards Cross - Agricultural",
      "article4.buckinghamshire.westwexhamstreet":
        "Land to the west of Wexham Street, Stoke Poges - Markets",
      "article4.buckinghamshire.wholedistrictpoultry":
        "Whole District excluding the Town of Chesham - Poultry production.",
      "article4.buckinghamshire.widmerfarm":
        "Widmer Farm, Lacey Green - Agricultural Use",
      "article4.buckinghamshire.wigginton":
        "In the area of Wigginton - Agricultural buildings.",
      "article4.buckinghamshire.wiltonlane":
        "Land at Wilton Lane, Seer Green - Agricultural buildings and mineral working.",
      "article4.buckinghamshire.wooburngreen":
        "Wooburn Green - Agricultural Use",
      "article4.buckinghamshire.woodlandsmeadow":
        "Land at Woodlands Meadow, Jasons Hill, Ley Hill Means of enclosure.",
      "article4.buckinghamshire.wyburnwood":
        "Land at Wyburn Wood off Amersham Road - Means of enclosure.",
      "article4.buckinghamshire.wyburnwoodagri":
        "Land at Wyburn Wood off Amersham Road - Agricultural Buildings.",
      "article4.buckinghamshire.wyburnwoodforestry":
        "Land at Wyburn Wood off Amersham Road - Forestry.",
      "article4.buckinghamshire.wycombehealthfarmnortheast":
        "Land to NE of Wycombe Heath Farm, Spurlands End Lane, Holmer Green Means of enclosure.",
      "article4.buckinghamshire.wycombehealthfarmspurlands":
        "Land at Wycombe Heath Farm, Spurlands End Means of enclosure.",
      "article4.buckinghamshire.wycombeheathfarm":
        "Land to NE of Wycombe Heath Farm, Spurlands End Lane, Holmer Green Caravan sites.",
      "article4.buckinghamshire.wycombeheathfarmcaravan":
        "Land at Wycombe Heath Farm, Spurlands End Caravan sites.",
    },
  },
};

export { planningConstraints };
