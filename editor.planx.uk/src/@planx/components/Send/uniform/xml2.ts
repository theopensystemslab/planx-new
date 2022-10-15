import { Store } from "./../../../../pages/FlowEditor/lib/store/index";
import { UniformPayload } from "./xml/model";

// TODO: object args
export function makeXmlString2(
  passport: Store.passport,
  sessionId: string,
  files: string[],
  hasBoundary: boolean,
) {
  const payload = new UniformPayload(sessionId, passport, files);
  const xml = payload.buildXML();
  return xml;
}
