import { Session } from "types";

import { Store } from "./../../../../pages/FlowEditor/lib/store/index";
import { UniformPayload } from "./xml/model";

export function makeXmlString2(
  passport: Store.passport,
  sessionId: string,
  files: string[]
) {
  const session: Session = {
    passport: {},
    sessionId: "123",
    breadcrumbs: {},
    id: "abc",
  };
  const payload = new UniformPayload(session.sessionId, {}, []);
  console.log(payload);
  console.log(payload.buildXML());
  // console.log(xml2 === xml)
}
