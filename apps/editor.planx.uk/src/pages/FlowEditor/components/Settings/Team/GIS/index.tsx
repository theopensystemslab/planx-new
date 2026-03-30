import React from "react";
import Permission from "ui/editor/Permission";

import Boundary from "./Boundary";
import Constraints from "./Constraints";
import ReferenceCode from "./ReferenceCode";

const GISSettings: React.FC = () => (
  <>
    <Permission.IsPlatformAdmin>
      <Constraints />
    </Permission.IsPlatformAdmin>
    <ReferenceCode />
    <Boundary />
  </>
);

export default GISSettings;
