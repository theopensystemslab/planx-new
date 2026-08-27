import camelCase from "lodash/camelCase.js";

import * as adurWorthing from "./local_authorities/metadata/adurWorthing.js";
import * as barkingAndDagenham from "./local_authorities/metadata/barkingAndDagenham.js";
import * as barnet from "./local_authorities/metadata/barnet.js";
import * as birmingham from "./local_authorities/metadata/birmingham.js";
import * as brent from "./local_authorities/metadata/brent.js";
import * as bristol from "./local_authorities/metadata/bristol.js";
import * as buckinghamshire from "./local_authorities/metadata/buckinghamshire.js";
import * as camden from "./local_authorities/metadata/camden.js";
import * as canterbury from "./local_authorities/metadata/canterbury.js";
import * as coventry from "./local_authorities/metadata/coventry.js";
import * as doncaster from "./local_authorities/metadata/doncaster.js";
import * as eastRidingOfYorkshire from "./local_authorities/metadata/eastRidingOfYorkshire.js";
import * as epsomAndEwell from "./local_authorities/metadata/epsomAndEwell.js";
import * as gateshead from "./local_authorities/metadata/gateshead.js";
import * as gloucester from "./local_authorities/metadata/gloucester.js";
import * as greaterCambridgeSharedPlanning from "./local_authorities/metadata/greaterCambridgeSharedPlanning.js";
import * as horsham from "./local_authorities/metadata/horsham.js";
import * as lambeth from "./local_authorities/metadata/lambeth.js";
import * as liverpool from "./local_authorities/metadata/liverpool.js";
import * as medway from "./local_authorities/metadata/medway.js";
import * as newcastle from "./local_authorities/metadata/newcastle.js";
import * as northumberland from "./local_authorities/metadata/northumberland.js";
import * as southGloucestershire from "./local_authorities/metadata/southGloucestershire.js";
import * as southStaffordshire from "./local_authorities/metadata/southStaffordshire.js";
import * as southwark from "./local_authorities/metadata/southwark.js";
import * as stAlbans from "./local_authorities/metadata/stAlbans.js";
import * as stockport from "./local_authorities/metadata/stockport.js";
import * as stokeOnTrent from "./local_authorities/metadata/stokeOnTrent.js";
import * as swale from "./local_authorities/metadata/swale.js";
import * as tewkesbury from "./local_authorities/metadata/tewkesbury.js";
import * as torbay from "./local_authorities/metadata/torbay.js";
import * as walthamForest from "./local_authorities/metadata/walthamForest.js";
import * as waverly from "./local_authorities/metadata/waverly.js";
import * as westBerkshire from "./local_authorities/metadata/westBerkshire.js";
import * as westminster from "./local_authorities/metadata/westminster.js";

export interface LocalAuthorityMetadata {
  planningConstraints: {
    articleFour: {
      records: Record<string, string>;
    };
  };
}

/**
 * When a team publishes their granular Article 4 data, add them to this list. Key must match team slug, value should by camelCased slug
 * The database column team_setting.has_article4_schema also needs to be updated via the Hasura console
 */
export const localAuthorityMetadata: Record<string, LocalAuthorityMetadata> = {
  "adur-worthing": adurWorthing,
  "barking-and-dagenham": barkingAndDagenham,
  barnet,
  birmingham,
  brent,
  bristol,
  buckinghamshire,
  camden,
  canterbury,
  coventry,
  doncaster,
  "east-riding-of-yorkshire": eastRidingOfYorkshire,
  "epsom-and-ewell": epsomAndEwell,
  gateshead,
  gloucester,
  "greater-cambridge-shared-planning": greaterCambridgeSharedPlanning,
  horsham,
  lambeth,
  liverpool,
  medway,
  newcastle,
  northumberland,
  "south-gloucestershire": southGloucestershire,
  "south-staffordshire": southStaffordshire,
  southwark,
  "st-albans": stAlbans,
  stockport,
  "stoke-on-trent": stokeOnTrent,
  swale,
  tewkesbury,
  torbay,
  "waltham-forest": walthamForest,
  waverly,
  "west-berkshire": westBerkshire,
  westminster,
};

// Return the full metadata, if applicable, for a local authority
export const getLocalAuthorityMetadata = (
  localAuthority?: string,
): LocalAuthorityMetadata | undefined => {
  if (
    !localAuthority ||
    !Object.keys(localAuthorityMetadata).includes(localAuthority)
  )
    return undefined;

  return localAuthorityMetadata[localAuthority];
};

// Return the granular article four data values, if applicable, for a local authority
export const getLocalAuthorityArticleFourSchema = (
  localAuthority?: string,
): string[] | undefined => {
  if (
    !localAuthority ||
    !Object.keys(localAuthorityMetadata).includes(localAuthority)
  )
    return undefined;

  const granularValues = [
    ...Object.keys(
      localAuthorityMetadata[localAuthority]["planningConstraints"][
        "articleFour"
      ]["records"],
    ),
    ...[`articleFour.${camelCase(localAuthority)}.caz`],
  ];

  return granularValues.sort();
};
