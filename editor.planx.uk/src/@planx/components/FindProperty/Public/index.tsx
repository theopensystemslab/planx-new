import React from "react";

import FindPropertyOld from "./FindProperty";
import PropertyInformation from "./PropertyInformation";

export default FindProperty;

function FindProperty(args: any) {
  const [uprn, setUprn] = React.useState(undefined);
  if (!uprn) {
    return <FindPropertyOld {...args} handleSubmit={setUprn} />;
  } else {
    return <PropertyInformation UPRN={uprn} {...args} />;
  }
}
