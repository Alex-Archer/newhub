"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var Z=(e,t,r)=>{if(!t.has(e))throw TypeError("Cannot "+r)},T=(e,t,r)=>(Z(e,t,"read from private field"),r?r.call(e):t.get(e)),qe=(e,t,r)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,r)},Te=(e,t,r,n)=>(Z(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),g;class ee{constructor(t){this.message=t}toString(){return`Cancel${this.message?`: ${this.message}`:""}`}}function U(e){return e instanceof ee}const te=class{constructor(t){qe(this,g,void 0);let r;const n=new Promise(o=>{r=u=>{T(this,g)||(Te(this,g,new ee(u)),o(T(this,g)))}});this.onCancel=n.then.bind(n),t(r)}static source(){let t;return{token:new te(r=>{t=r}),cancel:t}}throwIfRequested(){if(T(this,g))throw T(this,g)}};let I=te;g=new WeakMap;function re(e){return e instanceof I}let ne=class extends Error{constructor(t,r,n,o){super(t),this.config=r,this.request=o,this.response=n}};function xe(e,t,r,n){return new ne(e,t,r,n)}function oe(e){return e instanceof ne}const se=["options","trace","connect"],ae=["head","get","delete"],_=["post","put","patch"],Ce=new RegExp(`^(${_.join("|")})`,"i"),L=Object.prototype.toString;function ke(e){return e===null}function x(e){return typeof e=="undefined"}function H(e){return typeof e=="string"||L.call(e)==="[object String]"}function v(e){return L.call(e)==="[object Object]"}function ie(e){return Array.isArray(e)}function Se(e){return L.call(e)==="[object Date]"}function h(e){return typeof e=="function"}function b(e,t){e||Re(t)}function Re(e){throw new Error(`[axios-miniprogram]: ${e}`)}function De(e){return v(e)?e:{}}const Me=/\/:([^/?]+)/g;function ue(e,t={},r={}){const n=De(r);return e.replace(Me,(o,u)=>{var l;const i=(l=t[u])!=null?l:n[u];return u in t&&delete t[u],`/${i}`})}function q(...e){const t={};for(const r of e.filter(v))for(const[n,o]of Object.entries(r))if(v(o)){const u=t[n];t[n]=v(u)?q(u,o):q(o)}else t[n]=o;return t}var Fe=Object.defineProperty,ce=Object.getOwnPropertySymbols,We=Object.prototype.hasOwnProperty,Ue=Object.prototype.propertyIsEnumerable,le=(e,t,r)=>t in e?Fe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,Ie=(e,t)=>{for(var r in t||(t={}))We.call(t,r)&&le(e,r,t[r]);if(ce)for(var r of ce(t))Ue.call(t,r)&&le(e,r,t[r]);return e};function z(e,...t){const r=Ie({},e);return N(r,t),r}function N(e,t){for(const r of t)delete e[r]}const fe="common",_e=[fe].concat(se,ae,_);function Le(e){var t;const r=(t=e.headers)!=null?t:{},n=q(r[fe],r[e.method],r);return z(n,..._e)}function He(e,t,r){return ie(r)||(h(r)?r=[r]:r=[]),r.forEach(n=>{e=n(e,t)}),e}function ze(e="",t={},r=Ne){const n=r(t);return n&&(e=`${e}${e.indexOf("?")===-1?"?":"&"}${n}`),e}function Ne(e){const t=[];function r(n,o){t.push(`${de(n)}=${de(o)}`)}for(const[n,o]of Object.entries(e))if(!ke(o)&&!x(o)&&o===o)if(v(o))for(const[u,l]of Object.entries(o))r(`${n}[${u}]`,l);else if(ie(o)){const u=`${n}[]`;for(const l of o)r(u,l)}else Se(o)?r(n,o.toISOString()):r(n,o);return t.join("&")}function de(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}const Be=/^([a-z][\w-.]*:)\/\//i;function Ge(e){return Be.test(e)}function pe(e="",t=""){return t?Ge(t)?t:`${e.replace(/\/+$/,"")}/${t.replace(/^\/+/,"")}`:e}function he(e){const t=pe(e.baseURL,e.url);return ze(t,e.params,e.paramsSerializer)}function Ke(e){let t="request";return e.download&&/^GET/i.test(e.method)?t="download":e.upload&&/^POST/i.test(e.method)&&(t="upload"),t}var Je=Object.defineProperty,Qe=Object.defineProperties,Ve=Object.getOwnPropertyDescriptors,me=Object.getOwnPropertySymbols,Xe=Object.prototype.hasOwnProperty,Ye=Object.prototype.propertyIsEnumerable,ve=(e,t,r)=>t in e?Je(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,Ze=(e,t)=>{for(var r in t||(t={}))Xe.call(t,r)&&ve(e,r,t[r]);if(me)for(var r of me(t))Ye.call(t,r)&&ve(e,r,t[r]);return e},et=(e,t)=>Qe(e,Ve(t));function rt(e){return new Promise((t,r)=>{const n=et(Ze({},e),{type:Ke(e),url:he(e),method:e.method.toUpperCase(),success:u,fail:l});let o;try{o=e.adapter(n)}catch(s){l({status:400,statusText:"Bad Adapter"}),console.error(s)}function u(s){var f,p,d;const c=s;c.status=(f=c.status)!=null?f:200,c.statusText=(p=c.statusText)!=null?p:"OK",c.headers=(d=c.headers)!=null?d:{},c.config=e,c.request=o;const{validateStatus:w}=e;!h(w)||w(c.status)?t(c):i("validate status error",c)}function l(s){var f,p,d;const c=s;c.isFail=!0,c.status=(f=c.status)!=null?f:400,c.statusText=(p=c.statusText)!=null?p:"Fail",c.headers=(d=c.headers)!=null?d:{},c.config=e,c.request=o,i("request fail",c)}function i(s,f){r(xe(s,e,f,o))}v(o)&&ye(n,o.onProgressUpdate);const{cancelToken:a}=e;re(a)&&a.onCancel(s=>{v(o)&&(ye(n,o.offProgressUpdate),h(o.abort)&&o.abort()),r(s)})})}function ye(e,t){if(h(t)){const{type:r,onUploadProgress:n,onDownloadProgress:o}=e;switch(r){case"upload":h(n)&&t(n);break;case"download":h(o)&&t(o);break}}}function nt(e){B(e),b(h(e.adapter),"adapter \u4E0D\u662F\u4E00\u4E2A function"),b(H(e.url),"url \u4E0D\u662F\u4E00\u4E2A string"),b(H(e.method),"method \u4E0D\u662F\u4E00\u4E2A string"),e.url=ue(e.url,e.params,e.data),e.headers=Le(e),Ce.test(e.method)?n(e,e.transformRequest):delete e.data;function t(o){return B(e),n(o,e.transformResponse),o}function r(o){return U(o)||(B(e),n(o.response,e.transformResponse)),Promise.reject(o)}function n(o,u){o.data=He(o.data,o.headers,u)}return rt(e).then(t,r)}function B(e){const{cancelToken:t}=e;re(t)&&t.throwIfRequested()}var we=(e,t,r)=>{if(!t.has(e))throw TypeError("Cannot "+r)},$=(e,t,r)=>(we(e,t,"read from private field"),r?r.call(e):t.get(e)),be=(e,t,r)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,r)},ot=(e,t,r,n)=>(we(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),st=(e,t,r,n)=>({set _(o){ot(e,t,o,r)},get _(){return $(e,t,n)}}),C,E;let ge=class{constructor(){be(this,C,0),be(this,E,new Map)}get size(){return $(this,E).size}use(t,r){return $(this,E).set(++st(this,C)._,{resolved:t,rejected:r}),$(this,C)}eject(t){return $(this,E).delete(t)}clear(){$(this,E).clear()}forEach(t){$(this,E).forEach(t)}};C=new WeakMap,E=new WeakMap;var at=(e,t,r)=>{if(!t.has(e))throw TypeError("Cannot "+r)},$e=(e,t,r)=>(at(e,t,"read from private field"),r?r.call(e):t.get(e)),it=(e,t,r)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,r)},ut=(e,t,r)=>new Promise((n,o)=>{var u=a=>{try{i(r.next(a))}catch(s){o(s)}},l=a=>{try{i(r.throw(a))}catch(s){o(s)}},i=a=>a.done?n(a.value):Promise.resolve(a.value).then(u,l);i((r=r.apply(e,t)).next())}),k;let ct=class{constructor(){it(this,k,[])}use(t){b(h(t),"middleware \u4E0D\u662F\u4E00\u4E2A function"),$e(this,k).push(t)}createContext(t){return{req:t,res:null}}run(t,r){const n=[...$e(this,k),r];function o(){return ut(this,null,function*(){yield n.shift()(t,o)})}return o()}enhanceRun(t){return(r,n)=>t(r,()=>this.run(r,n))}};k=new WeakMap;const lt={url:!0,data:!0,upload:!0,download:!0},ft={headers:!0,params:!0};function S(e={},t={}){const r={},n=Array.from(new Set([...Object.keys(e),...Object.keys(t)]));for(const o of n){const u=e[o],l=t[o];lt[o]?x(l)||(r[o]=l):ft[o]?v(u)&&v(l)?r[o]=q(u,l):v(l)?r[o]=l:v(u)&&(r[o]=u):x(l)?x(u)||(r[o]=u):r[o]=l}return r}var G=(e,t,r)=>{if(!t.has(e))throw TypeError("Cannot "+r)},m=(e,t,r)=>(G(e,t,"read from private field"),r?r.call(e):t.get(e)),O=(e,t,r)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,r)},dt=(e,t,r,n)=>(G(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),R=(e,t,r)=>(G(e,t,"access private method"),r),Ee=(e,t,r)=>new Promise((n,o)=>{var u=a=>{try{i(r.next(a))}catch(s){o(s)}},l=a=>{try{i(r.throw(a))}catch(s){o(s)}},i=a=>a.done?n(a.value):Promise.resolve(a.value).then(u,l);i((r=r.apply(e,t)).next())}),y,A,D,K,M,J,Q,V,F;class j{constructor(t,r){O(this,D),O(this,M),O(this,y,void 0),this.interceptors={request:new ge,response:new ge},O(this,A,new ct),this.request=(n,o={})=>{var u,l;H(n)?o.url=n:o=n,o=S(this.defaults,o),o.method=(l=(u=o.method)==null?void 0:u.toLowerCase())!=null?l:"get";const i={resolved:m(this,Q)},a={rejected:o.errorHandler},s=[];return R(this,D,K).call(this,f=>{s.unshift(f)}),s.push(i),R(this,M,J).call(this,f=>{s.push(f)}),s.push(a),s.reduce((f,{resolved:p,rejected:d})=>f.then(p,d),Promise.resolve(o))},this.use=n=>(m(this,A).use(n),this),O(this,Q,n=>Ee(this,null,function*(){const o=m(this,A).createContext(n);return yield m(this,F).call(this,o,m(this,V)),o.res})),O(this,V,n=>Ee(this,null,function*(){n.res=yield nt(n.req)})),O(this,F,(n,o)=>m(this,y)?m(this,A).enhanceRun(m(m(this,y),F))(n,o):m(this,A).run(n,o)),this.defaults=t,dt(this,y,r)}}y=new WeakMap,A=new WeakMap,D=new WeakSet,K=function(e){var t;this.interceptors.request.forEach(e),m(this,y)&&R(t=m(this,y),D,K).call(t,e)},M=new WeakSet,J=function(e){var t;this.interceptors.response.forEach(e),m(this,y)&&R(t=m(this,y),M,J).call(t,e)},Q=new WeakMap,V=new WeakMap,F=new WeakMap;for(const e of se)j.prototype[e]=function(t,r={}){return r.method=e,this.request(t,r)};for(const e of ae)j.prototype[e]=function(t,r,n={}){return n.method=e,n.params=q(r,n.params),this.request(t,n)};for(const e of _)j.prototype[e]=function(t,r,n={}){return n.method=e,n.data=r,this.request(t,n)};function X(e,t){const r=new j(e,t),n=r.request;return n.getUri=function(o){return o.url=ue(o.url,o.params,o.data),he(S(e,o))},n.create=function(o){return X(S(e,o))},n.extend=function(o){return o.baseURL=pe(e.baseURL,o.baseURL),X(S(e,o),r)},Object.assign(n,r),Object.setPrototypeOf(n,j.prototype),n}var pt=Object.defineProperty,ht=Object.defineProperties,mt=Object.getOwnPropertyDescriptors,W=Object.getOwnPropertySymbols,Oe=Object.prototype.hasOwnProperty,je=Object.prototype.propertyIsEnumerable,Pe=(e,t,r)=>t in e?pt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,vt=(e,t)=>{for(var r in t||(t={}))Oe.call(t,r)&&Pe(e,r,t[r]);if(W)for(var r of W(t))je.call(t,r)&&Pe(e,r,t[r]);return e},yt=(e,t)=>ht(e,mt(t)),wt=(e,t)=>{var r={};for(var n in e)Oe.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(e!=null&&W)for(var n of W(e))t.indexOf(n)<0&&je.call(e,n)&&(r[n]=e[n]);return r};function Y(e){b(v(e),"platform \u4E0D\u662F\u4E00\u4E2A object"),b(h(e.request),"request \u4E0D\u662F\u4E00\u4E2A function"),b(h(e.upload),"upload \u4E0D\u662F\u4E00\u4E2A function"),b(h(e.download),"download \u4E0D\u662F\u4E00\u4E2A function");function t(i){const a=r(i);switch(i.type){case"request":return o(e.request,a);case"download":return u(e.download,a);case"upload":return l(e.upload,a)}}function r(i){return yt(vt({},i),{header:i.headers,success(a){const s=n(a);i.success(s)},fail(a){var s,f,p,d,c;const w=Object.assign(n(a),{data:{errno:(p=(f=(s=a.errno)!=null?s:a.error)!=null?f:a.errCode)!=null?p:a.errNo,errMsg:(c=(d=a.errString)!=null?d:a.errMsg)!=null?c:a.errorMessage}});i.fail(w)}})}function n(i){var a,s;return Object.assign(z(i,"statusCode","header","errno","error","errCode","errNo","errMsg","errorMessage","errString"),{status:(a=i.status)!=null?a:i.statusCode,headers:(s=i.headers)!=null?s:i.header})}function o(i,a){return i(a)}function u(i,a){const s=a,{params:f,success:p}=s;return s.filePath=f==null?void 0:f.filePath,s.success=d=>{var c;const w=Object.assign(z(d,"tempFilePath","apFilePath","filePath","fileSize"),{data:{filePath:d.filePath,tempFilePath:(c=d.tempFilePath)!=null?c:d.apFilePath,fileSize:d.fileSize}});p(w)},N(s,["params"]),i(s)}function l(i,a){const s=a,f=s.data,{name:p,filePath:d,fileType:c}=f,w=wt(f,["name","filePath","fileType"]);return s.name=p,s.filePath=d,s.formData=w,s.fileName=p,s.fileType=c,N(s,["params","data"]),i(s)}return t}function bt(){const e=$t(gt());if(Et(e))return Y(e)}function gt(){const e="undefined";if(typeof wx!==e)return wx;if(typeof my!==e)return my;if(typeof swan!==e)return swan;if(typeof tt!==e)return tt;if(typeof qq!==e)return qq;if(typeof qh!==e)return qh;if(typeof ks!==e)return ks;if(typeof dd!==e)return dd;if(typeof jd!==e)return jd;if(typeof xhs!==e)return xhs}function $t(e){var t,r,n;if(e)return{request:(t=e.request)!=null?t:e.httpRequest,upload:(r=e.upload)!=null?r:e.uploadFile,download:(n=e.download)!=null?n:e.downloadFile}}function Et(e){return v(e)&&h(e.request)&&h(e.upload)&&h(e.download)}const Ot={adapter:bt(),headers:{common:{Accept:"application/json, text/plain, */*"},options:{},get:{},head:{},post:{},put:{},patch:{},delete:{},trace:{},connect:{}},validateStatus(e){return e>=200&&e<300},dataType:"json",responseType:"text",timeout:1e4},Ae="2.7.0",P=X(Ot);P.version=Ae,P.Axios=j,P.CancelToken=I,P.createAdapter=Y,P.isCancel=U,P.isAxiosError=oe,exports.Axios=j,exports.CancelToken=I,exports.createAdapter=Y,exports.default=P,exports.isAxiosError=oe,exports.isCancel=U,exports.version=Ae;