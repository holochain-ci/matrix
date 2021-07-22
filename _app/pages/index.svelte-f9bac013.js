import{S as e,i as t,s as n,H as r,j as s,m as a,o,G as l,x as i,u as c,v as u,I as A,J as f}from"../chunks/vendor-9d42eb34.js";function h(e){let t,n;return t=new r({props:{columns:e[1],rows:e[0],iconAsc:"↑",iconDesc:"↓"}}),{c(){s(t.$$.fragment)},l(e){a(t.$$.fragment,e)},m(e,r){o(t,e,r),n=!0},p:l,i(e){n||(i(t.$$.fragment,e),n=!0)},o(e){c(t.$$.fragment,e),n=!1},d(e){u(t,e)}}}var p=function(e,t,n,r){return new(n||(n=Promise))((function(s,a){function o(e){try{i(r.next(e))}catch(t){a(t)}}function l(e){try{i(r.throw(e))}catch(t){a(t)}}function i(e){var t;e.done?s(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,l)}i((r=r.apply(e,t||[])).next())}))};const d=({fetch:e})=>p(void 0,void 0,void 0,(function*(){const t=yield e("/index.json");if(t.ok){const e=yield t.json();return{props:{repos:yield e.repos}}}const{message:n}=yield t.json();return{error:new Error(n)}}));function m(e,t,n){A.extend(f);let{repos:r}=t;const s=r,a=[{key:"repo",title:"Repo",value:e=>e.full_name,renderValue:e=>`<a href="https://github.com/${e.full_name}">${e.full_name}</a>`,sortable:!0},{key:"github_workflows",title:"Github Actions",renderValue:e=>e.workflows.map((t=>`\n            <a href="https://github.com/${e.full_name}/actions/${t.path.replace(/\.github\//,"")}" >\n              <img\n                src="${t.badge_url}?branch=${e.default_branch}"\n                alt="Github Actions status for ${e.full_name}"\n              />\n            </a>\n            `)).join(" "),sortable:!1},{key:"circleci",title:"Circle CI",renderValue:e=>`<a href="https://circleci.com/gh/${e.full_name}">\n          <img\n            src="https://circleci.com/gh/${e.full_name}.svg?style=svg"\n            alt="CircleCI build status for ${e.full_name}"\n            onError="this.parentElement.href = '#'; this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII='"\n          />\n        </a>\n`,sortable:!1},{key:"last_push",title:"Last Push",value:e=>e.pushed_at,renderValue:e=>{const t=A(e.pushed_at).fromNow();return`<div title="${e.pushed_at}">${t}</div>`},sortable:!0}];return e.$$set=e=>{"repos"in e&&n(2,r=e.repos)},[s,a,r]}export default class extends e{constructor(e){super(),t(this,e,m,h,n,{repos:2})}}export{d as load};
