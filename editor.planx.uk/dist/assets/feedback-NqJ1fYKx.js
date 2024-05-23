import{Q as s,j as a,B as o,R as c,n as i,N as d,J as l,K as u,M as _,u as m,W as f,S as p,aa as b}from"./index-CFPw1vJP.js";const g=s`
  query GetFeedbackById($feedbackId: Int!) {
    feedback: feedback_summary(where: { feedback_id: { _eq: $feedbackId } }) {
      address
      createdAt: created_at
      device
      feedbackId: feedback_id
      feedbackType: feedback_type
      helpDefinition: help_definition
      helpSources: help_sources
      helpText: help_text
      intersectingConstraints: intersecting_constraints
      nodeData: node_data
      nodeId: node_id
      nodeText: node_text
      nodeTitle: node_title
      nodeType: node_type
      projectType: project_type
      serviceSlug: service_slug
      teamSlug: team_slug
      status
      uprn
      userComment: user_comment
      userContext: user_context
    }
  }
`,k=async e=>{const{data:{feedback:[t]}}=await d.query({query:g,variables:{feedbackId:e}});console.log(t)},y=({feedback:e})=>a.jsx(o,{sx:{fontSize:12,overflowY:"auto"},children:e.map(t=>a.jsxs(c.Fragment,{children:[a.jsx(o,{component:"pre",children:JSON.stringify(t,null,4)}),a.jsx(i,{onClick:()=>k(t.id),children:"Log out detailed info"})]},t.id))}),S=l(b(e=>({mountpath:e.mountpath})),u({"/":_(async e=>{const{team:t,flow:n}=e.params;if(!m.getState().canUserEditTeam(t))throw new f(`User does not have access to ${e.originalUrl}`);const{data:{feedback:r}}=await d.query({query:s`
          query GetFeebackForFlow($teamSlug: String!, $flowSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: asc }
              where: {
                team_slug: { _eq: $teamSlug }
                service_slug: { _eq: $flowSlug }
              }
            ) {
              id: feedback_id
              type: feedback_type
              nodeTitle: node_title
              nodeType: node_type
              userComment: user_comment
              userContext: user_context
              createdAt: created_at
            }
          }
        `,variables:{teamSlug:t,flowSlug:n}});return{title:p("Flow Feedback"),view:a.jsx(y,{feedback:r})}})}));export{S as default};
