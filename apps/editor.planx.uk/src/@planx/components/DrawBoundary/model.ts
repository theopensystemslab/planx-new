import { richText } from "lib/yupExtensions";
import { boolean, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export enum DrawBoundaryUserAction {
  Accept = "Accepted the title boundary",
  Amend = "Amended the title boundary",
  Draw = "Drew a custom boundary",
  Upload = "Uploaded a location plan",
}

export interface DrawBoundary extends BaseNodeData {
  title: string;
  description: string;
  titleForUploading: string;
  descriptionForUploading: string;
  hideFileUpload?: boolean;
  fn: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined,
): DrawBoundary => ({
  ...parseBaseNodeData(data),
  title: data?.title || defaultContent?.["title"],
  description: data?.description || defaultContent?.["description"],
  titleForUploading:
    data?.titleForUploading || defaultContent?.["titleForUploading"],
  descriptionForUploading:
    data?.descriptionForUploading ||
    defaultContent?.["descriptionForUploading"],
  hideFileUpload: data?.hideFileUpload || defaultContent?.["hideFileUpload"],
  fn: defaultContent?.["fn"], // input is disabled, no need to account for data?.fn
  info: data?.info || defaultContent?.["info"],
  policyRef: data?.policyRef || defaultContent?.["policyRef"],
  howMeasured: data?.howMeasured || defaultContent?.["howMeasured"],
  definitionImg: data?.definitionImg || defaultContent?.["definitionImg"],
});

export const PASSPORT_UPLOAD_KEY = "locationPlan" as const; // not added to editor yet
export const PASSPORT_COMPONENT_ACTION_KEY = "drawBoundary.action" as const; // internal use only

// Default content as of July 2025
//   Rather than editing HTML directly here, try updating component directly via editor rich text inputs then running
//   `copy(window.api.getState().flow["{your node id}"].data)` and pasting here
const defaultContent: DrawBoundary = {
  info: "<p>This outline identifies the location of the proposed changes on a map. This information is required for all planning applications. It is sometimes called a &apos;red line drawing&apos; or &apos;location plan&apos;.</p>",
  title: "Confirm your location plan",
  policyRef:
    '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.legislation.gov.uk/uksi/2015/595/article/7">The Town and Country Planning (Development Management Procedure) (England) Order 2015</a>,</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.gov.uk/government/collections/planning-practice-guidance">Planning Practice Guidance (PPG)</a></p>',
  description:
    "<p>The red line shown below should include:</p><ul><li><p>the outline of your property boundary</p></li><li><p>any works outside the property boundary</p></li><li><p>areas that will be closed off or you&apos;ll need access to during the works</p></li></ul><p>If the red line already includes all these, select continue. If not, select <strong>More information</strong> for guidance on how to amend or redraw the outline.</p>",
  howMeasured: `<p>We have pre-populated the map with a red outline that includes the entire property using information from Land Registry.</p><p>In some cases, this outline might not include all the works or the areas that will be closed off. This might be because you're proposing works to a public highway (such as a dropped kerb), doing works that involve multiple properties, or works to a building that is part of a larger estate.</p><p>In these cases, you should amend the red outline by dragging the edges, or erase it by selecting the 🗑️-icon on the map and draw a new outline.</p><p></p><h1>How to draw and amend the outline</h1><ol><li><p>Move the cursor to the corner you want to start with and click or tap once.<br><br></p><img alt="Move the cursor to the corner you want to start with and click or tap once." src="https://api.editor.planx.uk/file/public/9axlxbxo/Draw%20boundary_step%201.png"><p><br></p></li><li><p>Move the cursor to the next corner and click or tap.<br><br></p><img alt="Move the cursor to the next corner and click or tap." src="https://api.editor.planx.uk/file/public/5npyu7aq/Draw%20boundary_step%202.png"><p><br></p></li><li><p>Repeat until you have the shape you need.<br><br></p><img alt="Repeat until you have the shape you need." src="https://api.editor.planx.uk/file/public/3ddotc4q/Draw%20boundary_step%203.png"><p><br></p></li><li><p>Click or tap the last corner again to stop drawing.<br><br></p><img alt="Click or tap the last corner again to stop drawing." src="https://api.editor.planx.uk/file/public/pen82j73/Draw%20boundary_step%204.png"><p><br></p></li><li><p>To amend the outline, click or tap on a line and drag it into a new position.<br><br></p><img alt="To amend the outline, click or tap on a line and drag it into a new position" src="https://api.editor.planx.uk/file/public/ko11wuez/Draw%20boundary_step%205.png"><p></p></li></ol>`,
  hideFileUpload: false,
  fn: "proposal.site",
  titleForUploading: "Upload a location plan",
  descriptionForUploading:
    "<p>Your location plan must:</p><ul><li><p>be based on an accurate, recognisable map</p></li><li><p>be drawn to a scale, labelled, and/or marked with a scale bar</p></li><li><p>show the site outline in red</p></li><li><p>include a north point</p></li></ul>",
};

export const validationSchema: SchemaOf<DrawBoundary> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText().required(),
      titleForUploading: string().required(),
      descriptionForUploading: richText().required(),
      hideFileUpload: boolean(),
      fn: string().nullable().required(),
    }),
  );
