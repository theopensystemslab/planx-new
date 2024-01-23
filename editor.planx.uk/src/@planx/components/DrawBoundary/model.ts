import { MoreInformation, parseMoreInformation } from "../shared";

export enum DrawBoundaryUserAction {
  Accept = "Accepted the title boundary",
  Amend = "Amended the title boundary",
  Draw = "Drew a custom boundary",
  Upload = "Uploaded a location plan",
}

export interface DrawBoundary extends MoreInformation {
  title: string;
  description: string;
  titleForUploading: string;
  descriptionForUploading: string;
  hideFileUpload?: boolean;
  dataFieldBoundary: string;
  dataFieldArea: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined,
): DrawBoundary => ({
  ...parseMoreInformation(data),
  title: data?.title || defaultContent?.["title"],
  description: data?.description || defaultContent?.["description"],
  titleForUploading:
    data?.titleForUploading || defaultContent?.["titleForUploading"],
  descriptionForUploading:
    data?.descriptionForUploading ||
    defaultContent?.["descriptionForUploading"],
  hideFileUpload: data?.hideFileUpload || defaultContent?.["hideFileUpload"],
  dataFieldBoundary:
    data?.dataFieldBoundary || defaultContent?.["dataFieldBoundary"],
  dataFieldArea: data?.dataFieldArea || defaultContent?.["dataFieldArea"],
  info: data?.info || defaultContent?.["info"],
  policyRef: data?.policyRef || defaultContent?.["policyRef"],
  howMeasured: data?.howMeasured || defaultContent?.["howMeasured"],
  definitionImg: data?.definitionImg || defaultContent?.["definitionImg"],
});

export const PASSPORT_UPLOAD_KEY = "proposal.drawing.locationPlan" as const; // not added to editor yet
export const PASSPORT_COMPONENT_ACTION_KEY = "drawBoundary.action" as const; // internal use only

// Default content as of Jan 2024 when title boundaries were introduced
//   Rather than editing HTML directly here, try updating component directly via editor rich text inputs then running
//   `copy(window.api.getState().flow["{your node id}"].data)` and pasting here
const defaultContent: DrawBoundary = {
  info: "<p>This outline identifies the location of the proposed changes on a map. This information is required for all planning applications. It is sometimes called a &apos;red line drawing&apos; or &apos;location plan&apos;.</p>",
  title: "Check or amend the outline of your property and works",
  policyRef:
    '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.legislation.gov.uk/uksi/2015/595/article/7">The Town and Country Planning (Development Management Procedure) (England) Order 2015</a>,</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.gov.uk/government/collections/planning-practice-guidance">Planning Practice Guidance (PPG)</a></p>',
  description:
    "<p>The red line shown below should include:</p><ul><li><p>the outline of your property boundary</p></li><li><p>any works outside the property boundary</p></li><li><p>areas that will be closed off or you&apos;ll need access to during the works</p></li></ul><p>If the red line already includes all these, tap continue. If it does not, tap <em>More information</em> for guidance on how to amend or redraw the outline.</p>",
  howMeasured:
    '<p>We have pre-populated the map with a red outline that includes the entire property, using information from Land Registry.</p><p>In some cases, this outline might not include all the works or the areas that will be closed off. This could be the case if you are proposing works to a public highway (such as a dropped kerb), doing works that involve multiple properties, or works to a building that is part of a larger estate.</p><p>In these cases, you should amend the red outline by dragging the edges, or erase it by clicking the 🗑-icon on the map and draw a new outline.</p><p></p><h1>How to draw and amend the outline</h1><ol><li><p>Move the cursor to the corner you want to start with and click or tap once.</p></li><li><p>Move the cursor to the next corner and click or tap.</p></li><li><p>Repeat until you have the shape you need.</p></li><li><p>Click or tap the last corner again to stop drawing.</p></li><li><p>To amend the outline, click or tap on a line and drag it into a new position.</p></li></ol><img src="https://api.editor.planx.uk/file/public/dni98ojg/Draw_Outline_2.gif">',
  dataFieldArea: "property.boundary.area",
  hideFileUpload: false,
  dataFieldBoundary: "property.boundary.site",
  titleForUploading: "Upload a location plan",
  descriptionForUploading:
    "<p>Your location plan must:</p><ul><li><p>be based on an accurate, recognisable map</p></li><li><p>be drawn to a scale, labelled, and/or marked with a scale bar</p></li><li><p>show the site outline in red</p></li><li><p>include a<strong> </strong>north point</p></li></ul>",
};
