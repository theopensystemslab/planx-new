import{a7 as g,W as r,u as m,j as n,V as c,a8 as w,Q as f,a5 as p,J as d,K as h,M as l,U as y,Y as S,aa as b}from"./index-CFPw1vJP.js";import{C as _}from"./ContentPage-CXBZ_YBI.js";import{Q as x}from"./Questions-D-dg2tg0.js";import{P as F}from"./PublicLayout-CsB_Cq8y.js";import"./Header-p4OIyhRV.js";import"./Card-XAp8rL3L.js";import"./Chip-BB62kn49.js";import"./InputRowLabel-DT0xESl6.js";const C=async t=>{const o=t.params.flow.split(",")[0],a=t.params.team||await g(window.location.hostname),i=await D(o,a),e=i.flows[0];if(!e)throw new r;const u=await j(e.id),s=m.getState();return s.setFlow({id:e.id,flow:u,flowSlug:o}),s.setFlowNameFromSlug(o),s.setGlobalSettings(i.globalSettings[0]),s.setFlowSettings(e.settings),s.setTeam(e.team),n.jsx(F,{children:n.jsx(c,{})})},D=async(t,o)=>{try{return(await w.query({query:f`
        query GetSettingsForDraftView($flowSlug: String!, $teamSlug: String!) {
          flows(
            limit: 1
            where: {
              slug: { _eq: $flowSlug }
              team: { slug: { _eq: $teamSlug } }
            }
          ) {
            id
            team {
              theme {
                primaryColour: primary_colour
                actionColour: action_colour
                linkColour: link_colour
                logo
                favicon
              }
              name
              settings
              integrations {
                hasPlanningData: has_planning_data
              }
              slug
              notifyPersonalisation: notify_personalisation
              boundaryBBox: boundary_bbox
            }
            settings
            slug
          }
          globalSettings: global_settings {
            footerContent: footer_content
          }
        }
      `,variables:{flowSlug:t,teamSlug:o}})).data}catch(a){throw console.error(a),new r}},j=async t=>{const o=`http://localhost:7002/flows/${t}/flatten-data?draft=true`;try{const{data:a}=await p.get(o);return a}catch(a){throw console.log(a),new r}},B=d(b(async t=>({mountpath:t.mountpath})),S(async t=>await C(t)),h({"/":l({view:n.jsx(x,{previewEnvironment:"editor"})}),"/pages/:page":y(t=>l({view:()=>n.jsx(_,{page:t.params.page}),data:{isContentPage:!0}}))}));export{B as default};
