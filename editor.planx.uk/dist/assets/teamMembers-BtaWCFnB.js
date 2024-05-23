import{s as j,ai as g,j as e,a1 as b,B as y,T as o,J as v,K as T,M as w,u as h,W as A,N as _,Q as N,b9 as S,S as E,aa as k}from"./index-CFPw1vJP.js";import{E as d}from"./EditorRow-Cyc30Qxl.js";import{aJ as M}from"./Header-p4OIyhRV.js";import{c as f,a as x,b as u,d as i,T as R,e as B}from"./TableRow-twy3mylU.js";import{C as q}from"./Chip-BB62kn49.js";import"./Card-XAp8rL3L.js";const C=j(M)(({theme:t})=>({background:t.palette.background.dark,color:t.palette.common.white,fontSize:"1em",fontWeight:g,marginRight:t.spacing(1)})),p=j(f)(({theme:t})=>({"&:nth-of-type(even)":{background:t.palette.background.paper}})),U={platformAdmin:"Admin",teamEditor:"Editor",teamViewer:"Viewer"},c=({members:t})=>{const n=s=>U[s]||s;return t.length===0?e.jsx(x,{children:e.jsx(u,{children:e.jsx(f,{children:e.jsx(i,{children:e.jsx("strong",{children:"No members found"})})})})}):e.jsx(R,{children:e.jsxs(x,{children:[e.jsx(u,{children:e.jsxs(p,{children:[e.jsx(i,{sx:{width:300},children:e.jsx("strong",{children:"User"})}),e.jsx(i,{sx:{width:200},children:e.jsx("strong",{children:"Role"})}),e.jsx(i,{children:e.jsx("strong",{children:"Email"})})]})}),e.jsx(B,{children:t.map(s=>e.jsxs(p,{children:[e.jsxs(i,{sx:{display:"flex",flexDirection:"row",alignItems:"center"},children:[e.jsxs(C,{children:[s.firstName[0],s.lastName[0]]}),s.firstName," ",s.lastName]}),e.jsx(i,{children:e.jsx(q,{label:n(s.role),size:"small",sx:{background:"#ddd"}})}),e.jsx(i,{children:s.email})]},s.id))})]})})},W=({teamMembersByRole:t})=>{const n=(t.platformAdmin||[]).filter(a=>a.email),s=Object.keys(t).filter(a=>a!=="platformAdmin").reduce((a,r)=>a.concat(t[r]),[]),m=s.filter(a=>a.email),l=s.filter(a=>a.role!=="platformAdmin"&&!a.email);return e.jsx(b,{maxWidth:"contentWrap",children:e.jsxs(y,{py:7,children:[e.jsxs(d,{children:[e.jsx(o,{variant:"h2",component:"h3",gutterBottom:!0,children:"Team editors"}),e.jsx(o,{variant:"body1",children:"Editors have access to edit your services."}),e.jsx(c,{members:m})]}),e.jsxs(d,{children:[e.jsx(o,{variant:"h2",component:"h3",gutterBottom:!0,children:"Admins"}),e.jsx(o,{variant:"body1",children:"Admins have editor access across all teams."}),e.jsx(c,{members:n})]}),l.length>0&&e.jsxs(d,{children:[e.jsx(o,{variant:"h2",component:"h3",gutterBottom:!0,children:"Archived team editors"}),e.jsx(o,{variant:"body1",children:"Past team members who no longer have access to the Editor, but may be part of the edit history of your services."}),e.jsx(c,{members:l})]})]})})},P=v(k(t=>({mountpath:t.mountpath})),T({"/":w(async t=>{if(!h.getState().canUserEditTeam(t.params.team))throw new A(`User does not have access to ${t.originalUrl}`);const s=h.getState().teamSlug,{data:{users:m}}=await _.query({query:N`
          query GetUsersForTeam($teamSlug: String!) {
            users(
              where: {
                _or: [
                  { is_platform_admin: { _eq: true } }
                  { teams: { team: { slug: { _eq: $teamSlug } } } }
                ]
              }
              order_by: { first_name: asc }
            ) {
              id
              firstName: first_name
              lastName: last_name
              isPlatformAdmin: is_platform_admin
              email
              teams(where: { team: { slug: { _eq: $teamSlug } } }) {
                role
              }
            }
          }
        `,variables:{teamSlug:s}}),l=m.map(r=>({firstName:r.firstName,lastName:r.lastName,email:r.email,id:r.id,role:r.isPlatformAdmin?"platformAdmin":r.teams[0].role})),a=S.groupBy(l,"role");return{title:E("Team Members"),view:e.jsx(W,{teamMembersByRole:a})}})}));export{P as default};
