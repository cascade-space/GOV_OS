(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,43164,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return o}});let o=e=>{}},50257,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o={DecodeError:function(){return v},MiddlewareNotFoundError:function(){return S},MissingStaticPage:function(){return x},NormalizeError:function(){return y},PageNotFoundError:function(){return b},SP:function(){return g},ST:function(){return h},WEB_VITALS:function(){return n},execOnce:function(){return i},getDisplayName:function(){return d},getLocationOrigin:function(){return c},getURL:function(){return u},isAbsoluteUrl:function(){return l},isResSent:function(){return p},loadGetInitialProps:function(){return f},normalizeRepeatedSlashes:function(){return m},stringifyError:function(){return k}};for(var a in o)Object.defineProperty(r,a,{enumerable:!0,get:o[a]});let n=["CLS","FCP","FID","INP","LCP","TTFB"];function i(e){let t,r=!1;return(...o)=>(r||(r=!0,t=e(...o)),t)}let s=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=e=>s.test(e);function c(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function u(){let{href:e}=window.location,t=c();return e.substring(t.length)}function d(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function p(e){return e.finished||e.headersSent}function m(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function f(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await f(t.Component,t.ctx)}:{};let o=await e.getInitialProps(t);if(r&&p(r))return o;if(!o)throw Object.defineProperty(Error(`"${d(e)}.getInitialProps()" should resolve to an object. But found "${o}" instead.`),"__NEXT_ERROR_CODE",{value:"E1025",enumerable:!1,configurable:!0});return o}let g="u">typeof performance,h=g&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class v extends Error{}class y extends Error{}class b extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class x extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class S extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function k(e){return JSON.stringify({message:e.message,stack:e.stack})}},51897,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o={assign:function(){return l},searchParamsToUrlQuery:function(){return n},urlQueryToSearchParams:function(){return s}};for(var a in o)Object.defineProperty(r,a,{enumerable:!0,get:o[a]});function n(e){let t={};for(let[r,o]of e.entries()){let e=t[r];void 0===e?t[r]=o:Array.isArray(e)?e.push(o):t[r]=[e,o]}return t}function i(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function s(e){let t=new URLSearchParams;for(let[r,o]of Object.entries(e))if(Array.isArray(o))for(let e of o)t.append(r,i(e));else t.set(r,i(o));return t}function l(e,...t){for(let r of t){for(let t of r.keys())e.delete(t);for(let[t,o]of r.entries())e.append(t,o)}return e}},73150,e=>{"use strict";let t;var r=e.i(79195);let o=e=>{let t,r=new Set,o=(e,o)=>{let a="function"==typeof e?e(t):e;if(!Object.is(a,t)){let e=t;t=(null!=o?o:"object"!=typeof a||null===a)?a:Object.assign({},t,a),r.forEach(r=>r(t,e))}},a=()=>t,n={setState:o,getState:a,getInitialState:()=>i,subscribe:e=>(r.add(e),()=>r.delete(e))},i=t=e(o,a,n);return n},a=e=>{let t=e?o(e):o,a=e=>(function(e,t=e=>e){let o=r.default.useSyncExternalStore(e.subscribe,r.default.useCallback(()=>t(e.getState()),[e,t]),r.default.useCallback(()=>t(e.getInitialState()),[e,t]));return r.default.useDebugValue(o),o})(t,e);return Object.assign(a,t),a},n=(t=(e,t)=>({sidebarOpen:!0,setSidebarOpen:t=>e({sidebarOpen:t}),user:null,setUser:t=>{if(e({user:t}),t){let e=JSON.stringify(t);localStorage.setItem("govos_auth",e),localStorage.setItem("govos_auth_token",t.token),localStorage.setItem("civicpath_token",t.token),t.tenantId&&localStorage.setItem("govos_tenant_id",t.tenantId);let r=Math.max(0,Math.floor((t.expiresAt-Date.now())/1e3));document.cookie=`govos_auth=${encodeURIComponent(e)}; path=/; max-age=${r}; SameSite=Lax`}else localStorage.removeItem("govos_auth"),document.cookie="govos_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"},clearAuth:()=>{e({user:null}),localStorage.removeItem("govos_auth"),document.cookie="govos_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT",localStorage.removeItem("civicpath_user"),localStorage.removeItem("civic_user"),localStorage.removeItem("civic_token"),localStorage.removeItem("civicpath_token"),localStorage.removeItem("officer_session"),localStorage.removeItem("civicpath_superadmin"),localStorage.removeItem("govos_auth_token"),localStorage.removeItem("govos_tenant_id")},filters:{status:"all",priority:"all",search:""},setFilters:t=>e(e=>({filters:{...e.filters,...t}})),notifications:[{id:"1",title:"New Complaint",message:"New road issue reported in Ward 12",type:"info",read:!1}],addNotification:t=>e(e=>({notifications:[{...t,id:Math.random().toString(),read:!1},...e.notifications]})),markAsRead:t=>e(e=>({notifications:e.notifications.map(e=>e.id===t?{...e,read:!0}:e)})),hasRole:e=>{let r=t().user;return null!==r&&e.includes(r.role)},isAuthenticated:()=>{let e=t().user;return!!e&&Date.now()<e.expiresAt}}))?a(t):a;e.s(["useAppStore",0,n],73150)},11617,e=>{"use strict";let t,r;var o,a=e.i(79195);let n={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,s=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",o="",a="";for(let n in e){let i=e[n];"@"==n[0]?"i"==n[1]?r=n+" "+i+";":o+="f"==n[1]?c(i,n):n+"{"+c(i,"k"==n[1]?"":t)+"}":"object"==typeof i?o+=c(i,t?t.replace(/([^,])+/g,e=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):n):null!=i&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(n,i):n+":"+i+";")}return r+(t&&a?t+"{"+a+"}":a)+o},u={},d=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+d(e[r]);return t}return e};function p(e){let t,r,o=this||{},a=e.call?e(o.p):e;return((e,t,r,o,a)=>{var n;let p=d(e),m=u[p]||(u[p]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(p));if(!u[m]){let t=p!==e?e:(e=>{let t,r,o=[{}];for(;t=i.exec(e.replace(s,""));)t[4]?o.shift():t[3]?(r=t[3].replace(l," ").trim(),o.unshift(o[0][r]=o[0][r]||{})):o[0][t[1]]=t[2].replace(l," ").trim();return o[0]})(e);u[m]=c(a?{["@keyframes "+m]:t}:t,r?"":"."+m)}let f=r&&u.g?u.g:null;return r&&(u.g=u[m]),n=u[m],f?t.data=t.data.replace(f,n):-1===t.data.indexOf(n)&&(t.data=o?n+t.data:t.data+n),m})(a.unshift?a.raw?(t=[].slice.call(arguments,1),r=o.p,a.reduce((e,o,a)=>{let n=t[a];if(n&&n.call){let e=n(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;n=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+o+(null==n?"":n)},"")):a.reduce((e,t)=>Object.assign(e,t&&t.call?t(o.p):t),{}):a,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n})(o.target),o.g,o.o,o.k)}p.bind({g:1});let m,f,g,h=p.bind({k:1});function v(e,t){let r=this||{};return function(){let o=arguments;function a(n,i){let s=Object.assign({},n),l=s.className||a.className;r.p=Object.assign({theme:f&&f()},s),r.o=/ *go\d+/.test(l),s.className=p.apply(r,o)+(l?" "+l:""),t&&(s.ref=i);let c=e;return e[0]&&(c=s.as||e,delete s.as),g&&c[0]&&g(s),m(c,s)}return t?t(a):a}}var y=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),x=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},S="default",k=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:o}=t;return k(e,{type:+!!e.toasts.find(e=>e.id===o.id),toast:o});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+n}))}}},I=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},_=(e,t=S)=>{E[t]=k(E[t]||w,e),I.forEach(([e,r])=>{e===t&&r(E[t])})},T=e=>Object.keys(E).forEach(t=>_(e,t)),N=(e=S)=>t=>{_(t,e)},O={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},A=(e={},t=S)=>{let[r,o]=(0,a.useState)(E[t]||w),n=(0,a.useRef)(E[t]);(0,a.useEffect)(()=>(n.current!==E[t]&&o(E[t]),I.push([t,o]),()=>{let e=I.findIndex(([e])=>e===t);e>-1&&I.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,o,a;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(o=e[t.type])?void 0:o.duration)||(null==e?void 0:e.duration)||O[t.type],style:{...e.style,...null==(a=e[t.type])?void 0:a.style,...t.style}}});return{...r,toasts:i}},P=e=>(t,r)=>{let o,a=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||b()}))(t,e,r);return N(a.toasterId||(o=a.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===o))))({type:2,toast:a}),a.id},C=(e,t)=>P("blank")(e,t);C.error=P("error"),C.success=P("success"),C.loading=P("loading"),C.custom=P("custom"),C.dismiss=(e,t)=>{let r={type:3,toastId:e};t?N(t)(r):T(r)},C.dismissAll=e=>C.dismiss(void 0,e),C.remove=(e,t)=>{let r={type:4,toastId:e};t?N(t)(r):T(r)},C.removeAll=e=>C.remove(void 0,e),C.promise=(e,t,r)=>{let o=C.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?y(t.success,e):void 0;return a?C.success(a,{id:o,...r,...null==r?void 0:r.success}):C.dismiss(o),e}).catch(e=>{let a=t.error?y(t.error,e):void 0;a?C.error(a,{id:o,...r,...null==r?void 0:r.error}):C.dismiss(o)}),e};var j=1e3,$=(e,t="default")=>{let{toasts:r,pausedAt:o}=A(e,t),n=(0,a.useRef)(new Map).current,i=(0,a.useCallback)((e,t=j)=>{if(n.has(e))return;let r=setTimeout(()=>{n.delete(e),s({type:4,toastId:e})},t);n.set(e,r)},[]);(0,a.useEffect)(()=>{if(o)return;let e=Date.now(),a=r.map(r=>{if(r.duration===1/0)return;let o=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(o<0){r.visible&&C.dismiss(r.id);return}return setTimeout(()=>C.dismiss(r.id,t),o)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[r,o,t]);let s=(0,a.useCallback)(N(t),[t]),l=(0,a.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),c=(0,a.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),u=(0,a.useCallback)(()=>{o&&s({type:6,time:Date.now()})},[o,s]),d=(0,a.useCallback)((e,t)=>{let{reverseOrder:o=!1,gutter:a=8,defaultPosition:n}=t||{},i=r.filter(t=>(t.position||n)===(e.position||n)&&t.height),s=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<s&&e.visible).length;return i.filter(e=>e.visible).slice(...o?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+a,0)},[r]);return(0,a.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=n.get(e.id);t&&(clearTimeout(t),n.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:u,calculateOffset:d}}},D=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,L=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,M=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,R=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,F=v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${R} 1s linear infinite;
`,z=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,J=h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,B=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${J} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,G=v("div")`
  position: absolute;
`,H=v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Z=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Z} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,W=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return void 0!==t?"string"==typeof t?a.createElement(q,null,t):t:"blank"===r?null:a.createElement(H,null,a.createElement(F,{...o}),"loading"!==r&&a.createElement(G,null,"error"===r?a.createElement(M,{...o}):a.createElement(B,{...o})))},V=v("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,K=v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=a.memo(({toast:e,position:t,style:r,children:o})=>{let n=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[o,a]=x()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${h(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},i=a.createElement(W,{toast:e}),s=a.createElement(K,{...e.ariaProps},y(e.message,e));return a.createElement(V,{className:e.className,style:{...n,...r,...e.style}},"function"==typeof o?o({icon:i,message:s}):a.createElement(a.Fragment,null,i,s))});o=a.createElement,c.p=void 0,m=o,f=void 0,g=void 0;var X=({id:e,className:t,style:r,onHeightUpdate:o,children:n})=>{let i=a.useCallback(t=>{if(t){let r=()=>{o(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return a.createElement("div",{ref:i,className:t,style:r},n)},Y=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;e.s(["CheckmarkIcon",0,B,"ErrorIcon",0,M,"LoaderIcon",0,F,"ToastBar",0,Q,"ToastIcon",0,W,"Toaster",0,({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:n,toasterId:i,containerStyle:s,containerClassName:l})=>{let{toasts:c,handlers:u}=$(r,i);return a.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(r=>{let i,s,l=r.position||t,c=u.calculateOffset(r,{reverseOrder:e,gutter:o,defaultPosition:t}),d=(i=l.includes("top"),s=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:x()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(i?1:-1)}px)`,...i?{top:0}:{bottom:0},...s});return a.createElement(X,{id:r.id,key:r.id,onHeightUpdate:u.updateHeight,className:r.visible?Y:"",style:d},"custom"===r.type?y(r.message,r):n?n(r):a.createElement(Q,{toast:r,position:l}))}))},"default",0,C,"resolveValue",0,y,"toast",0,C,"useToaster",0,$,"useToasterStore",0,A],11617)},43760,e=>{"use strict";var t=e.i(81589);let r="govos_auth";function o(e){try{let t=e.split(".")[1],r=atob(t.replace(/-/g,"+").replace(/_/g,"/"));return JSON.parse(r)}catch{throw Error("Invalid JWT format")}}function a(e){let t=JSON.stringify(e);localStorage.setItem(r,t),localStorage.setItem("govos_auth_token",e.token),localStorage.setItem("civicpath_token",e.token),e.tenantId&&localStorage.setItem("govos_tenant_id",e.tenantId);let o=Math.max(0,Math.floor((e.expiresAt-Date.now())/1e3));document.cookie=`${r}=${encodeURIComponent(t)}; path=/; max-age=${o}; SameSite=Lax`}function n(){localStorage.removeItem(r),document.cookie=`${r}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,localStorage.removeItem("civicpath_user"),localStorage.removeItem("civic_user"),localStorage.removeItem("civic_token"),localStorage.removeItem("civicpath_token"),localStorage.removeItem("officer_session"),localStorage.removeItem("civicpath_superadmin"),localStorage.removeItem("govos_auth_token"),localStorage.removeItem("govos_tenant_id")}let i={requestOtp:async e=>t.default.post("/auth/otp/request",{identifier:e}),loginWithOtp:async(e,r,n)=>{let i=await t.default.post("/auth/otp/verify",{identifier:e,otp:r});if(!i.accessToken)throw Error("Login failed: no token returned from server");let s=o(i.accessToken),l={id:s.sub,name:n||i.user?.fullName||i.user?.displayName||e,role:s.rid,tenantId:s.tid,wardId:s.wid||void 0,email:i.user?.email,phone:i.user?.phone||e,avatarUrl:i.user?.avatarUrl,token:i.accessToken,refreshToken:i.refreshToken||"",expiresAt:1e3*s.exp};return a(l),l},login:async e=>{let r=await t.default.post("/auth/login",e);if(!r.accessToken&&!r.token)throw Error("Login failed: no token returned");let n=r.accessToken||r.token,i=o(n),s={id:i.sub,name:r.user?.fullName||r.user?.displayName||e.email||"",role:i.rid,tenantId:i.tid,wardId:i.wid||void 0,email:r.user?.email,phone:r.user?.phone,avatarUrl:r.user?.avatarUrl,token:n,refreshToken:r.refreshToken||"",expiresAt:1e3*i.exp};return a(s),s},logout:()=>{n()},getCurrentUser:()=>{let e=localStorage.getItem(r);if(!e)return null;try{let t=JSON.parse(e);if(Date.now()>=t.expiresAt)return n(),null;return t}catch{return null}},refreshToken:async()=>{let e=i.getCurrentUser();if(!e?.refreshToken)return null;try{let r=await t.default.post("/auth/refresh",{refreshToken:e.refreshToken});if(!r.accessToken)return null;let n=o(r.accessToken),i={...e,token:r.accessToken,refreshToken:r.refreshToken||e.refreshToken,expiresAt:1e3*n.exp};return a(i),i}catch{return i.logout(),null}},getToken:()=>i.getCurrentUser()?.token??null,isAuthenticated:()=>null!==i.getCurrentUser()};e.s(["authService",0,i,"clearSession",0,n,"persistSession",0,a])},26802,e=>{"use strict";var t=e.i(73391),r=e.i(79195);let o=(0,r.createContext)(void 0);e.s(["LanguageProvider",0,function({children:a}){let[n,i]=(0,r.useState)("en"),[s,l]=(0,r.useState)({});return(0,r.useEffect)(()=>{let e=localStorage.getItem("locale");e&&["en","hi","kn"].includes(e)&&i(e)},[]),(0,r.useEffect)(()=>{e.f({"../../messages/en.json":{id:()=>72326,module:()=>e.A(72326)},"../../messages/hi.json":{id:()=>96432,module:()=>e.A(96432)},"../../messages/kn.json":{id:()=>59078,module:()=>e.A(59078)}}).import(`../../messages/${n}.json`).then(e=>l(e.default)).catch(()=>l({}))},[n]),(0,t.jsx)(o.Provider,{value:{locale:n,setLocale:e=>{i(e),localStorage.setItem("locale",e)},t:e=>{let t=e.split("."),r=s;for(let o of t)if(!r||"object"!=typeof r)return e;else r=r[o];return"string"==typeof r?r:e}},children:a})},"useLanguage",0,function(){let e=(0,r.useContext)(o);if(!e)throw Error("useLanguage must be used within a LanguageProvider");return e}])},256,e=>{"use strict";var t=e.i(73391),r=e.i(79195),o=e.i(73150),a=e.i(43760);let n=(0,r.createContext)(void 0);e.s(["LoginProvider",0,function({children:e}){let{user:i,setUser:s,clearAuth:l}=(0,o.useAppStore)(),[c,u]=(0,r.useState)(null),[d,p]=(0,r.useState)(!0),m=()=>{try{p(!0);let e=localStorage.getItem("govos_auth");if(e)try{let t=JSON.parse(e);if(Date.now()<t.expiresAt){let e={id:t.id,email:t.email,phone:t.phone,fullName:t.name,name:t.name,role:t.role,loginTime:new Date().toISOString()};u(e),i||s(t);return}}catch{}let t=localStorage.getItem("civicpath_token"),r=localStorage.getItem("civicpath_user");if(t&&r)try{let e=JSON.parse(r);u(e);let o={id:e.id||"usr-legacy-citizen",name:e.fullName||e.name||e.phone||"Citizen",role:e.role||"CITIZEN",tenantId:"00000000-0000-0000-0000-000000000001",phone:e.phone,email:e.email,token:t,refreshToken:"",expiresAt:Date.now()+864e5};(0,a.persistSession)(o),s(o);return}catch{localStorage.removeItem("civicpath_user"),localStorage.removeItem("civicpath_token")}u(null)}catch(e){console.error("Session check failed:",e),u(null)}finally{p(!1)}};return(0,r.useEffect)(()=>{m()},[]),(0,r.useEffect)(()=>{i&&u({id:i.id,name:i.name,fullName:i.name,email:i.email,phone:i.phone,role:i.role,loginTime:new Date().toISOString()})},[i]),(0,t.jsx)(n.Provider,{value:{user:c,loading:d,login:(e,t)=>{let r="admin"===t.role||"TENANT_ADMIN"===t.role?"TENANT_ADMIN":"mla"===t.role||"REP"===t.role?"REP":"officer"===t.role||"OFFICER"===t.role?"OFFICER":"superadmin"===t.role||"SUPER_ADMIN"===t.role?"SUPER_ADMIN":"CITIZEN",o={id:t.id||`usr-${Date.now()}`,name:t.fullName||t.name||t.displayName||t.phone||"GovOS User",role:r,tenantId:t.tenantId||"00000000-0000-0000-0000-000000000001",wardId:t.wardId,email:t.email,phone:t.phone,avatarUrl:t.avatarUrl,token:e,refreshToken:t.refreshToken||"",expiresAt:Date.now()+864e5};(0,a.persistSession)(o),s(o);let n={...t,role:r,loginTime:new Date().toISOString()};localStorage.setItem("civicpath_user",JSON.stringify(n)),localStorage.setItem("civicpath_token",e),u(n)},logout:()=>{(0,a.clearSession)(),l(),u(null)},checkExistingSession:m},children:e})},"useLogin",0,function(){let e=(0,r.useContext)(n);if(void 0===e)throw Error("useLogin must be used within LoginProvider");return e}])},72326,e=>{e.v(t=>Promise.all(["static/chunks/11hn0_6yvwilo.js"].map(t=>e.l(t))).then(()=>t(2433)))},96432,e=>{e.v(t=>Promise.all(["static/chunks/1f4v5t30p1y1o.js"].map(t=>e.l(t))).then(()=>t(5794)))},59078,e=>{e.v(t=>Promise.all(["static/chunks/1e34o684kqwnl.js"].map(t=>e.l(t))).then(()=>t(17408)))}]);