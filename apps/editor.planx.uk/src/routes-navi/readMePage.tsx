// import { compose, mount, route, withData } from "navi";
// import { useStore } from "pages/FlowEditor/lib/store";
// import { ReadMePage } from "pages/FlowEditor/ReadMePage/ReadMePage";
// import React from "react";

// import { makeTitle } from "./utils";

// const getFlowInformation = useStore.getState().getFlowInformation;

// const readMePageRoutes = compose(
//   withData((req) => ({
//     mountpath: req.mountpath,
//     flow: req.params.flow.split(",")[0],
//   })),

//   mount({
//     "/": route(async (req) => {
//       const { team: teamSlug, flow: flowSlug } = req.params;

//       const data = await getFlowInformation(req.params.flow, req.params.team);

//       return {
//         title: makeTitle("About this page"),
//         view: (
//           <ReadMePage
//             teamSlug={teamSlug}
//             flowSlug={flowSlug}
//             flowInformation={data}
//           />
//         ),
//       };
//     }),
//   }),
// );

// export default readMePageRoutes;
