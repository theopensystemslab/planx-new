import React from "react";

import FindProperty from "./FindProperty";
import PropertyInformation from "./PropertyInformation";

export default FindPropertyMerged;

function FindPropertyMerged(args: any) {
  const [uprn, setUprn] = React.useState(undefined);
  if (!uprn) {
    return <FindProperty {...args} handleSubmit={setUprn} />;
  } else {
    return <PropertyInformation UPRN={uprn} {...args} />;
  }
}
