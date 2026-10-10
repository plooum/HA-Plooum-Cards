(function () {
  'use strict';

  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$3=globalThis,e$3=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$3),i$6=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$3)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$3.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$3=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const{is:i$5,defineProperty:e$2,getOwnPropertyDescriptor:h$2,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$2=a$1.trustedTypes,l$1=c$2?c$2.emptyScript:"",p$2=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$3={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$5(t,s),b$1={attribute:true,type:String,converter:u$3,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$2(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$3(s));}else void 0!==s&&i.push(c$3(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$3).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$3;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$2?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$2=globalThis,i$4=t=>t,s$2=t$2.trustedTypes,e$1=s$2?s$2.createPolicy("lit-html",{createHTML:t=>t}):void 0,h$1="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c$1=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u$2=Array.isArray,d=t=>u$2(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v$1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u$2(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v$1;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v$1?"!--"===u[1]?c=_:void 0!==u[1]?c=m$1:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p$1):void 0!==u[3]&&(c=p$1):c===p$1?">"===u[0]?(c=n??v$1,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p$1:'"'===u[3]?$:g):c===$||c===g?c=p$1:c===_||c===m$1?c=v$1:(c=p$1,n=void 0);const x=c===p$1&&t[i+1].startsWith("/>")?" ":"";l+=c===v$1?s+r:d>=0?(e.push(a),s.slice(0,d)+h$1+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h$1)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$2?s$2.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c$1()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c$1());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M$1(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M$1(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M$1(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u$2(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c$1()),this.O(c$1()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$4(t).nextSibling;i$4(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M$1(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M$1(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M$1(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M$1(this,t);}}const j={I:k},B=t$2.litHtmlPolyfillSupport;B?.(S,k),(t$2.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c$1(),t),t,void 0,s??{});}return h._$AI(t),h};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const s$1=globalThis;let i$3 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$3._$litElement$=true,i$3["finalized"]=true,s$1.litElementHydrateSupport?.({LitElement:i$3});const o=s$1.litElementPolyfillSupport;o?.({LitElement:i$3});(s$1.litElementVersions??=[]).push("4.2.2");

  /* ==========================================================================
     MAIN CARD : ha-plooum-buttonbadge-card
     ========================================================================== */
  class HaPlooumButtonBadgeCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    static getConfigElement() {
      return document.createElement("ha-plooum-buttonbadge-card-editor");
    }

    static getStubConfig() {
      return {
        entity: "",
        name: "My Button",
        icon: "mdi:lightbulb",
        font_size: "13px",
        icon_size: "24px",
        badge_icon_size: "20px",
        text_padding_left: "24px",
        icon_padding_left: "-4px",
        icon_align: "flex-start",
        active_color: "#FFC107",
        inactive_color: "#FFFFFF",
        tap_action_type: "toggle",
        hold_action_type: "none",
        badge_tap_action_type: "toggle",
        badge_hold_action_type: "none",
      };
    }

    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      this.config = { ...config };
    }

    // --- Action Handler ---
    _handleAction(actionPrefix, defaultEntity) {
      const actionType = this.config[`${actionPrefix}_type`] || "toggle";

      if (actionType === "toggle" && defaultEntity) {
        const domain = defaultEntity.split(".")[0];
        this.hass.callService(domain, "toggle", { entity_id: defaultEntity });
      } 
      else if (actionType === "navigate") {
        const path = this.config[`${actionPrefix}_path`];
        if (path) {
          window.history.pushState(null, "", path);
          window.dispatchEvent(new CustomEvent("location-changed"));
        }
      } 
      else if (actionType === "execute_script") {
        const scriptEntity = this.config[`${actionPrefix}_script`];
        if (scriptEntity) {
          const scriptId = scriptEntity.replace("script.", "");
          this.hass.callService("script", scriptId);
        }
      }
    }

    // --- Tap / Hold Events ---
    _startTimer(e, target) {
      this.longPress = false;
      this.timer = setTimeout(() => {
        this.longPress = true;
        const actionPrefix = target === 'badge' ? 'badge_hold_action' : 'hold_action';
        const entity = target === 'badge' ? this.config.badge_entity : this.config.entity;
        this._handleAction(actionPrefix, entity);
      }, 500);
    }

    _stopTimer(e, target) {
      clearTimeout(this.timer);
      if (!this.longPress) {
        const actionPrefix = target === 'badge' ? 'badge_tap_action' : 'tap_action';
        const entity = target === 'badge' ? this.config.badge_entity : this.config.entity;
        this._handleAction(actionPrefix, entity);
      }
    }

    render() {
      if (!this.config || !this.hass) return b``;

      // -- Main Button Calculations --
      const stateObj = this.config.entity ? this.hass.states[this.config.entity] : undefined;
      const isActive = stateObj && stateObj.state !== "off" && stateObj.state !== "unavailable";
      
      const color = isActive 
        ? (this.config.active_color || "#FFC107") 
        : (this.config.inactive_color || "#FFFFFF");

      const showIcon = !!this.config.icon;
      const showName = !!this.config.name;
      const fontSize = this.config.font_size || "13px";
      const iconSize = this.config.icon_size || "24px";
      const badgeIconSize = this.config.badge_icon_size || "20px";
      const textPaddingLeft = this.config.text_padding_left || "24px";
      const iconPaddingLeft = this.config.icon_padding_left !== undefined ? this.config.icon_padding_left : "-4px";
      const iconAlign = this.config.icon_align || "flex-start";

      // -- Badge Calculations --
      const hasBadge = !!(this.config.badge_entity || this.config.badge_icon);
      let badgeHtml = b``;

      if (hasBadge) {
        const badgeStateObj = this.config.badge_entity ? this.hass.states[this.config.badge_entity] : undefined;
        const isBadgeActive = badgeStateObj && badgeStateObj.state !== "off" && badgeStateObj.state !== "unavailable";
        const badgeBgColor = isBadgeActive 
          ? (this.config.badge_active_color || "#FFC107") 
          : (this.config.badge_inactive_color || "rgba(255, 255, 255, 0.25)");

        badgeHtml = b`
        <div class="badge" 
             style="background: ${badgeBgColor};"
             @pointerdown="${(e) => { e.stopPropagation(); this._startTimer(e, 'badge'); }}"
             @pointerup="${(e) => { e.stopPropagation(); this._stopTimer(e, 'badge'); }}"
             @pointercancel="${(e) => { e.stopPropagation(); clearTimeout(this.timer); }}"
             @contextmenu="${(e) => e.preventDefault()}">
          ${this.config.badge_icon ? b`<ha-icon icon="${this.config.badge_icon}" style="--mdc-icon-size: ${badgeIconSize}; width: ${badgeIconSize}; height: ${badgeIconSize};"></ha-icon>` : ""}
        </div>
      `;
      }

      return b`
      <ha-card class="plooum-card ${hasBadge ? 'has-badge' : ''}"
               @pointerdown="${(e) => this._startTimer(e, 'main')}"
               @pointerup="${(e) => this._stopTimer(e, 'main')}"
               @pointercancel="${(e) => clearTimeout(this.timer)}"
               @contextmenu="${(e) => e.preventDefault()}">
        
        <div class="content" style="justify-content: ${iconAlign};">
          ${showIcon ? b`<ha-icon class="main-icon" icon="${this.config.icon}" style="color: ${color}; --mdc-icon-size: ${iconSize}; width: ${iconSize}; height: ${iconSize}; margin-left: ${iconPaddingLeft};"></ha-icon>` : ""}
          ${showName ? b`<span class="main-text" style="color: ${color}; font-size: ${fontSize}; padding-left: ${textPaddingLeft};">${this.config.name}</span>` : ""}
        </div>

        ${badgeHtml}
      </ha-card>
    `;
    }

    static get styles() {
      return i$6`
      .plooum-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        padding: 6px 8px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        position: relative;
        min-height: 56px;
        overflow: visible;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .plooum-card.has-badge {
        padding-right: 20px;
      }
      .content {
        position: relative;
        width: 100%;
        min-height: 44px;
        display: flex;
        align-items: center;
      }
      .main-icon {
        flex-shrink: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .main-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
        font-weight: 700;
        white-space: normal;
        word-break: normal;
        overflow-wrap: normal;
        z-index: 2;
        pointer-events: none;
      }
      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        z-index: 3;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        touch-action: manipulation;
      }
      .badge ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }
    `;
    }
  }

  /* ==========================================================================
     CARD EDITOR
     ========================================================================== */
  class HaPlooumButtonBadgeCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { type: Object },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this._loadHAElements();
    }

    async _loadHAElements() {
      if (customElements.get("ha-entity-picker") && customElements.get("ha-selector")) return;

      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers) {
          await helpers.createCardElement({ type: "button" });
          this.requestUpdate();
        }
      }
    }

    setConfig(config) {
      this._config = config;
    }

    _valueChanged(ev, key) {
      if (!this._config || !this.hass) return;
      
      let newValue;
      if (ev.detail && ev.detail.value !== undefined) {
        newValue = ev.detail.value;
      } else if (ev.target && ev.target.value !== undefined) {
        newValue = ev.target.value;
      }

      if (this._config[key] === newValue) return;

      const newConfig = { ...this._config, [key]: newValue };

      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }

    _renderColorPicker(labelTitle, key, defaultColor) {
      const val = this._config[key] !== undefined ? this._config[key] : defaultColor;
      
      let hexColor = "#000000";
      if (val && val.match(/^#[0-9A-Fa-f]{6}$/)) {
        hexColor = val;
      } else if (val && val.match(/^#[0-9A-Fa-f]{3}$/)) {
        hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      }

      return b`
      <div class="input-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input
            type="color"
            .value=${hexColor}
            @input=${(e) => this._valueChanged(e, key)}
          />
          <input
            type="text"
            .value=${val}
            placeholder=${defaultColor}
            @input=${(e) => this._valueChanged(e, key)}
          />
        </div>
      </div>
    `;
    }

    _renderActionConfig(actionPrefix, labelTitle) {
      const typeKey = `${actionPrefix}_type`;
      const pathKey = `${actionPrefix}_path`;
      const scriptKey = `${actionPrefix}_script`;

      const actionType = this._config[typeKey] || "toggle";

      return b`
      <div class="action-group">
        <h4>${labelTitle}</h4>
        <select
          .value=${actionType}
          @change=${(e) => this._valueChanged(e, typeKey)}
        >
          <option value="toggle">Toggle</option>
          <option value="navigate">Navigate</option>
          <option value="execute_script">Execute a script</option>
          <option value="none">No action</option>
        </select>

        ${actionType === "navigate"
          ? b`
              <div class="input-field" style="margin-top: 6px;">
                <label>Navigation path</label>
                ${customElements.get("ha-selector")
                  ? b`
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{ navigation: {} }}
                        .value=${this._config[pathKey] || ""}
                        @value-changed=${(e) => this._valueChanged(e, pathKey)}
                      ></ha-selector>
                    `
                  : b`
                      <input
                        type="text"
                        placeholder="/lovelace/home"
                        .value=${this._config[pathKey] || ""}
                        @input=${(e) => this._valueChanged(e, pathKey)}
                      />
                    `}
              </div>
            `
          : ""}

        ${actionType === "execute_script"
          ? b`
              <ha-entity-picker
                .label=${"Script to execute"}
                .hass=${this.hass}
                .value=${this._config[scriptKey] || ""}
                .includeDomains=${["script"]}
                @value-changed=${(e) => this._valueChanged(e, scriptKey)}
                allow-custom-entity
              ></ha-entity-picker>
            `
          : ""}
      </div>
    `;
    }

    render() {
      if (!this.hass || !this._config) return b``;

      return b`
      <div class="card-config">
        <h3>Main Button</h3>
        
        <ha-entity-picker
          .label=${"Main entity"}
          .hass=${this.hass}
          .value=${this._config.entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="input-field">
          <label>Button text</label>
          <input
            type="text"
            placeholder="Name displayed on the button"
            .value=${this._config.name || ""}
            @input=${(e) => this._valueChanged(e, "name")}
          />
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Font size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Text left padding</label>
            <input
              type="text"
              placeholder="24px"
              .value=${this._config.text_padding_left || "24px"}
              @input=${(e) => this._valueChanged(e, "text_padding_left")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="24px"
              .value=${this._config.icon_size || "24px"}
              @input=${(e) => this._valueChanged(e, "icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icon left offset</label>
            <input
              type="text"
              placeholder="-4px"
              .value=${this._config.icon_padding_left !== undefined ? this._config.icon_padding_left : "-4px"}
              @input=${(e) => this._valueChanged(e, "icon_padding_left")}
            />
          </div>
        </div>

        <div class="input-field">
          <label>Icon alignment</label>
          <select
            .value=${this._config.icon_align || "flex-start"}
            @change=${(e) => this._valueChanged(e, "icon_align")}
          >
            <option value="flex-start">Left (Default)</option>
            <option value="center">Center</option>
          </select>
        </div>

        <ha-icon-picker
          .label=${"Main icon"}
          .hass=${this.hass}
          .value=${this._config.icon || ""}
          @value-changed=${(e) => this._valueChanged(e, "icon")}
        ></ha-icon-picker>

        ${this._renderColorPicker("Active color", "active_color", "#FFC107")}
        ${this._renderColorPicker("Inactive color", "inactive_color", "#FFFFFF")}

        ${this._renderActionConfig("tap_action", "Tap action (Main)")}
        ${this._renderActionConfig("hold_action", "Hold action (Main)")}

        <hr />

        <h3>Badge (Optional)</h3>

        <ha-entity-picker
          .label=${"Badge entity"}
          .hass=${this.hass}
          .value=${this._config.badge_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "badge_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="input-field">
          <label>Badge icon size</label>
          <input
            type="text"
            placeholder="20px"
            .value=${this._config.badge_icon_size || "20px"}
            @input=${(e) => this._valueChanged(e, "badge_icon_size")}
          />
        </div>

        <ha-icon-picker
          .label=${"Badge icon"}
          .hass=${this.hass}
          .value=${this._config.badge_icon || ""}
          @value-changed=${(e) => this._valueChanged(e, "badge_icon")}
        ></ha-icon-picker>

        ${this._renderColorPicker("Badge active background color", "badge_active_color", "#FFC107")}
        ${this._renderColorPicker("Badge inactive background color", "badge_inactive_color", "rgba(255, 255, 255, 0.25)")}

        ${this._renderActionConfig("badge_tap_action", "Tap action (Badge)")}
        ${this._renderActionConfig("badge_hold_action", "Hold action (Badge)")}
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      h3 {
        margin: 12px 0 4px 0;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      h4 {
        margin: 4px 0;
        font-size: 0.95em;
        color: var(--secondary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch {
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
      }
      .color-input-group input[type="text"] {
        flex-grow: 1;
      }

      input[type="text"],
      select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker,
      ha-icon-picker,
      ha-selector {
        width: 100%;
        display: block;
      }
      .action-group {
        border-left: 3px solid var(--primary-color);
        padding-left: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 16px 0;
      }
    `;
    }
  }

  /* ==========================================================================
     HOME ASSISTANT REGISTRATION
     ========================================================================== */
  if (!customElements.get('ha-plooum-buttonbadge-card')) {
    customElements.define('ha-plooum-buttonbadge-card', HaPlooumButtonBadgeCard);
  }
  if (!customElements.get('ha-plooum-buttonbadge-card-editor')) {
    customElements.define('ha-plooum-buttonbadge-card-editor', HaPlooumButtonBadgeCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === 'ha-plooum-buttonbadge-card')) {
    window.customCards.push({
      type: 'ha-plooum-buttonbadge-card',
      name: 'Ha Plooum Button Badge Card',
      description: 'A custom button card to show a custom badge on it.',
      preview: true,
    });
  }

  var haPlooumCoverCard = {};

  var hasRequiredHaPlooumCoverCard;

  function requireHaPlooumCoverCard () {
  	if (hasRequiredHaPlooumCoverCard) return haPlooumCoverCard;
  	hasRequiredHaPlooumCoverCard = 1;
  	// ha-plooum-cover-card.js

  	// ==========================================
  	// 1. SAFE LOADING OF LITELEMENT
  	// ==========================================
  	const getLit = () => {
  	  if (window.LitElement) {
  	    return window.LitElement;
  	  }
  	  const elements = ["hui-masonry-view", "ha-panel-lovelace", "hui-view"];
  	  for (let i = 0; i < elements.length; i++) {
  	    const ce = customElements.get(elements[i]);
  	    if (ce) {
  	      return Object.getPrototypeOf(ce);
  	    }
  	  }
  	  return null;
  	};

  	const LitElement = getLit();
  	let html = window.html;
  	let css = window.css;
  	if (LitElement) {
  	  if (LitElement.prototype.html) {
  	    html = LitElement.prototype.html;
  	  }
  	  if (LitElement.prototype.css) {
  	    css = LitElement.prototype.css;
  	  }
  	}

  	// ==========================================
  	// 2. CONFIGURATION UI (EDITOR)
  	// ==========================================
  	class PlooumCoverCardEditor extends LitElement {
  	  static get properties() {
  	    return { hass: {}, _config: {} };
  	  }

  	  setConfig(config) {
  	    this._config = Object.assign({}, config);
  	    if (!this._config.covers) {
  	      this._config.covers = [];
  	    } else {
  	      this._config.covers = this._config.covers.map(cover => {
  	        return Object.assign({
  	          slider_bg_color: "#222222",
  	          slider_progress_color: "#888888",
  	          slider_thumb_color: "#ffffff",
  	          name_color: "#ffffff"
  	        }, cover);
  	      });
  	    }
  	  }

  	  _valueChanged(ev, key) {
  	    if (!this._config) return;
  	    if (!this.hass) return;
  	    const value = ev.detail !== undefined && ev.detail.value !== undefined ? ev.detail.value : ev.target.value;
  	    if (this._config[key] === value) return;

  	    const newConfig = Object.assign({}, this._config);
  	    newConfig[key] = value;
  	    this._config = newConfig;
  	    this._fireConfigChanged();
  	  }

  	  _coverValueChanged(ev, index, key) {
  	    if (!this._config) return;
  	    if (!this.hass) return;
  	    const value = ev.detail !== undefined && ev.detail.value !== undefined ? ev.detail.value : ev.target.value;
  	    const covers = Array.from(this._config.covers);
  	    const updatedCover = Object.assign({}, covers[index]);
  	    updatedCover[key] = value;
  	    covers[index] = updatedCover;

  	    const newConfig = Object.assign({}, this._config);
  	    newConfig.covers = covers;
  	    this._config = newConfig;
  	    this._fireConfigChanged();
  	  }

  	  _renderColorPicker(index, labelTitle, key, defaultColor) {
  	    const cover = this._config.covers[index] || {};
  	    const val = cover[key] !== undefined ? cover[key] : defaultColor;

  	    let hexColor = "#000000";
  	    if (val && val.match(/^#[0-9A-Fa-f]{6}$/)) {
  	      hexColor = val;
  	    } else if (val && val.match(/^#[0-9A-Fa-f]{3}$/)) {
  	      hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
  	    }

  	    return html`
      <div class="input-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input
            type="color"
            .value=${hexColor}
            @input=${(e) => this._coverValueChanged(e, index, key)}
          />
          <input
            type="text"
            .value=${val}
            placeholder=${defaultColor}
            @input=${(e) => this._coverValueChanged(e, index, key)}
          />
        </div>
      </div>
    `;
  	  }

  	  _addCover() {
  	    let baseCovers = this._config.covers;
  	    if (!baseCovers) {
  	      baseCovers = [];
  	    }
  	    const covers = Array.from(baseCovers);
  	    covers.push({
  	      entity: "",
  	      show_name: true,
  	      name_color: "#ffffff",
  	      name_font_size: 14,
  	      percentage_font_size: 16,
  	      slider_width: 54,
  	      slider_bg_color: "#222222",
  	      slider_progress_color: "#888888",
  	      slider_thumb_color: "#ffffff",
  	      icon_up: "mdi:arrow-up",
  	      icon_down: "mdi:arrow-down",
  	      icon_stop: "mdi:square"
  	    });

  	    const newConfig = Object.assign({}, this._config);
  	    newConfig.covers = covers;
  	    this._config = newConfig;
  	    this._fireConfigChanged();
  	  }

  	  _removeCover(index) {
  	    const covers = Array.from(this._config.covers);
  	    covers.splice(index, 1);

  	    const newConfig = Object.assign({}, this._config);
  	    newConfig.covers = covers;
  	    this._config = newConfig;
  	    this._fireConfigChanged();
  	  }

  	  _fireConfigChanged() {
  	    const event = new Event("config-changed", { bubbles: true, composed: true });
  	    event.detail = { config: this._config };
  	    this.dispatchEvent(event);
  	  }

  	  render() {
  	    if (!this.hass) return html``;
  	    if (!this._config) return html``;

  	    // The lock is enabled by default
  	    const lockEnabled = this._config.lock_enabled !== false;

  	    let lockDuration = Number(this._config.lock_duration);
  	    if (!isFinite(lockDuration) || lockDuration < 0) {
  	      lockDuration = 0;
  	    }

  	    let lockMsg = this._config.lock_message;
  	    if (lockMsg === undefined) {
  	      lockMsg = "Are you sure ?";
  	    }

  	    let spacing = this._config.vertical_spacing;
  	    if (spacing === undefined) {
  	      spacing = 6;
  	    }

  	    let coversList = this._config.covers;
  	    if (!coversList) {
  	      coversList = [];
  	    }

  	    return html`
      <div class="card-config">
        <h3>General settings</h3>

        <ha-selector
          .hass=${this.hass}
          .selector=${{ boolean: {} }}
          .value=${lockEnabled}
          .label=${"Enable lock"}
          .helper=${"Ask for a confirmation before sending any command."}
          @value-changed=${(ev) => this._valueChanged(ev, "lock_enabled")}
        ></ha-selector>

        ${lockEnabled ? html`
          <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${lockMsg}
            .label=${"Unlock message"}
            @value-changed=${(ev) => this._valueChanged(ev, "lock_message")}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .selector=${{ number: { min: 0, max: 3600, step: 1, mode: "box", unit_of_measurement: "s" } }}
            .value=${lockDuration}
            .label=${"Unlock duration (seconds)"}
            .helper=${"0 = the card is locked again after each action (confirmation every time)."}
            @value-changed=${(ev) => this._valueChanged(ev, "lock_duration")}
          ></ha-selector>
        ` : ""}

        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { min: 0, max: 50, step: 1, mode: "slider" } }}
          .value=${spacing}
          .label=${"Vertical spacing (px)"}
          @value-changed=${(ev) => this._valueChanged(ev, "vertical_spacing")}
        ></ha-selector>

        <h3>Covers (${coversList.length})</h3>${coversList.map((cover, index) => {
	          let coverName = cover.name;
	          if (!coverName) coverName = "";

	          let showName = cover.show_name;
	          if (showName === undefined) showName = true;

	          let nameFontSize = cover.name_font_size;
	          if (nameFontSize === undefined) nameFontSize = 14;

	          let pctFontSize = cover.percentage_font_size;
	          if (pctFontSize === undefined) pctFontSize = 16;

	          let sliderWidth = cover.slider_width;
	          if (sliderWidth === undefined) sliderWidth = 54;

	          let iconUp = cover.icon_up;
	          if (!iconUp) iconUp = "mdi:arrow-up";

	          let iconStop = cover.icon_stop;
	          if (!iconStop) iconStop = "mdi:square";

	          let iconDown = cover.icon_down;
	          if (!iconDown) iconDown = "mdi:arrow-down";

	          return html`
            <div class="cover-config">
              <div class="cover-header">
                <span>Cover ${index + 1}</span>
                <ha-icon-button label="Remove" @click=${() => this._removeCover(index)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </ha-icon-button>
              </div>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: "cover" } }}
                .value=${cover.entity}
                .label=${"Cover entity"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "entity")}
              ></ha-selector>

              <div class="input-field">
                <label>Custom name (empty = default name)</label>
                <input
                  type="text"
                  .value=${coverName}
                  @input=${(e) => this._coverValueChanged(e, index, "name")}
                />
              </div>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${showName}
                .label=${"Show name"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "show_name")}
              ></ha-selector>

              ${this._renderColorPicker(index, "Name text color", "name_color", "#ffffff")}

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 8, max: 32, step: 1, mode: "slider" } }}
                .value=${nameFontSize}
                .label=${"Name text size (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "name_font_size")}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 8, max: 32, step: 1, mode: "slider" } }}
                .value=${pctFontSize}
                .label=${"Percentage text size (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "percentage_font_size")}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 20, max: 120, step: 1, mode: "slider" } }}
                .value=${sliderWidth}
                .label=${"Slider / column width (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "slider_width")}
              ></ha-selector>

              ${this._renderColorPicker(index, "Slider background color", "slider_bg_color", "#222222")}
              ${this._renderColorPicker(index, "Progress bar color", "slider_progress_color", "#888888")}
              ${this._renderColorPicker(index, "Thumb color", "slider_thumb_color", "#ffffff")}

              <div class="icon-column">
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconUp} .label=${"Up icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_up")}></ha-selector>
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconStop} .label=${"Stop icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_stop")}></ha-selector>
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconDown} .label=${"Down icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_down")}></ha-selector>
              </div>
            </div>
          `;
	        })}

        <mwc-button raised @click=${this._addCover}>+ Add cover</mwc-button>
      </div>
    `;
  	  }

  	  static get styles() {
  	    return css`
      .card-config { display: flex; flex-direction: column; gap: 15px; }
      .cover-config { border: 1px solid var(--divider-color); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
      .cover-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
      .icon-column { display: flex; flex-direction: column; gap: 10px; }
      .input-field { display: flex; flex-direction: column; gap: 4px; }
      .input-field label { font-size: 0.85em; color: var(--secondary-text-color); }
      .color-input-group { display: flex; align-items: center; gap: 8px; }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
      .color-input-group input[type="color"]::-webkit-color-swatch { border: 1px solid var(--divider-color, #ccc); border-radius: 4px; }
      .color-input-group input[type="text"] { flex-grow: 1; }
      input[type="text"] {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
    `;
  	  }
  	}

  	// ==========================================
  	// 3. MAIN CARD
  	// ==========================================
  	const SLIDER_LENGTH = 220;   // slider length (height) in px
  	const THUMB_SIZE = 6;        // thumb thickness in px
  	const PENDING_TIMEOUT = 5000; // max time to wait for a state confirmation (ms)

  	class PlooumCoverCard extends LitElement {
  	  static get properties() {
  	    return {
  	      hass: {},
  	      config: {},
  	      _drag: {}
  	    };
  	  }

  	  constructor() {
  	    super();
  	    this._unlockedUntil = 0;  // timestamp at which the unlock expires
  	    this._drag = null;        // { entity, pointerId, value } while dragging
  	    this._ignorePointerUntil = 0; // ignore stray events right after a dialog
  	    this._pending = {};       // { [entity]: { value, from, timer } } command sent, state not received yet
  	  }

  	  disconnectedCallback() {
  	    super.disconnectedCallback();
  	    this._drag = null;
  	    Object.keys(this._pending).forEach((id) => this._clearPending(id));
  	  }

  	  static getConfigElement() {
  	    return document.createElement("ha-plooum-cover-card-editor");
  	  }

  	  static getStubConfig() {
  	    return {
  	      lock_enabled: true,
  	      lock_duration: 0,
  	      lock_message: "Are you sure ?",
  	      vertical_spacing: 6,
  	      covers: []
  	    };
  	  }

  	  getCardSize() {
  	    return 6;
  	  }

  	  setConfig(config) {
  	    if (!config.covers) {
  	      throw new Error("You must define at least one cover.");
  	    }
  	    this.config = Object.assign({}, config, {
  	      covers: config.covers.map(cover => Object.assign({
  	        slider_bg_color: "#222222",
  	        slider_progress_color: "#888888",
  	        slider_thumb_color: "#ffffff",
  	        name_color: "#ffffff"
  	      }, cover))
  	    });
  	    // A config change resets the unlock state
  	    this._unlockedUntil = 0;
  	  }

  	  // ------------------------------------------
  	  // Lock
  	  // ------------------------------------------
  	  _lockEnabled() {
  	    // Enabled by default
  	    return this.config.lock_enabled !== false;
  	  }

  	  _lockDurationMs() {
  	    const seconds = Number(this.config.lock_duration);
  	    if (!isFinite(seconds) || seconds <= 0) return 0;
  	    return seconds * 1000;
  	  }

  	  // Returns true if the action can be executed
  	  _checkLock() {
  	    if (!this._lockEnabled()) return true;

  	    const duration = this._lockDurationMs();
  	    if (duration > 0 && Date.now() < this._unlockedUntil) return true;

  	    let msg = this.config.lock_message;
  	    if (msg === undefined) {
  	      msg = "Are you sure ?";
  	    }
  	    if (!window.confirm(msg)) return false;

  	    // Duration 0: nothing is remembered, the next action will require confirmation again
  	    if (duration > 0) {
  	      this._unlockedUntil = Date.now() + duration;
  	    }
  	    return true;
  	  }

  	  // ------------------------------------------
  	  // Services
  	  // ------------------------------------------
  	  _callService(domain, service, entityId, data = {}) {
  	    if (!this._checkLock()) return;
  	    const serviceData = Object.assign({ entity_id: entityId }, data);
  	    return this.hass.callService(domain, service, serviceData);
  	  }

  	  // ------------------------------------------
  	  // Slider synchronisation
  	  // ------------------------------------------
  	  _positionOf(stateObj) {
  	    const p = stateObj.attributes.current_position;
  	    if (typeof p === "number" && isFinite(p)) {
  	      return Math.min(100, Math.max(0, Math.round(p)));
  	    }
  	    // Cover without position support
  	    if (stateObj.state === "open") return 100;
  	    return 0;
  	  }

  	  _clearPending(entityId) {
  	    const pending = this._pending[entityId];
  	    if (pending) {
  	      clearTimeout(pending.timer);
  	      delete this._pending[entityId];
  	    }
  	  }

  	  _setPending(entityId, value, from) {
  	    this._clearPending(entityId);
  	    const timer = setTimeout(() => {
  	      delete this._pending[entityId];
  	      this.requestUpdate();
  	    }, PENDING_TIMEOUT);
  	    this._pending[entityId] = { value: value, from: from, timer: timer };
  	  }

  	  // Value to display: drag in progress > pending command > actual state.
  	  // The display is always derived, so it cannot get stuck on a stale value.
  	  _displayPosition(entityId, realPosition) {
  	    if (this._drag && this._drag.entity === entityId) {
  	      return this._drag.value;
  	    }
  	    const pending = this._pending[entityId];
  	    if (pending) {
  	      if (pending.from === realPosition) {
  	        return pending.value; // HA has not answered yet
  	      }
  	      this._clearPending(entityId); // the state changed: follow the actual state again
  	    }
  	    return realPosition;
  	  }

  	  _valueFromPointer(e, el) {
  	    const rect = el.getBoundingClientRect();
  	    const inset = THUMB_SIZE / 2;
  	    const usable = rect.height - 2 * inset;
  	    if (usable <= 0) return 0;
  	    const ratio = (rect.bottom - inset - e.clientY) / usable;
  	    return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  	  }

  	  _onSliderDown(e, entityId) {
  	    if (e.pointerType === "mouse" && e.button !== 0) return;
  	    if (Date.now() < this._ignorePointerUntil) return; // stray click after the confirmation dialog
  	    if (this._drag) return; // only one drag at a time
  	    e.preventDefault();
  	    // A new gesture cancels any "pending" value from a previous action:
  	    // if this gesture is cancelled, we must go back to the actual state, not to the old setpoint.
  	    this._clearPending(entityId);
  	    const el = e.currentTarget;
  	    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  	    this._drag = {
  	      entity: entityId,
  	      pointerId: e.pointerId,
  	      value: this._valueFromPointer(e, el)
  	    };
  	  }

  	  _onSliderMove(e) {
  	    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
  	    if (e.pointerType === "mouse" && e.buttons === 0) {
  	      this._drag = null; // button released without pointerup: abandon the drag
  	      return;
  	    }
  	    const value = this._valueFromPointer(e, e.currentTarget);
  	    if (value !== this._drag.value) {
  	      this._drag = Object.assign({}, this._drag, { value: value });
  	    }
  	  }

  	  _onSliderUp(e) {
  	    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
  	    const entityId = this._drag.entity;
  	    const value = this._valueFromPointer(e, e.currentTarget);
  	    this._drag = null;
  	    this._commitPosition(entityId, value);
  	  }

  	  _onSliderCancel(e) {
  	    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
  	    this._drag = null; // back to the actual state
  	  }

  	  _onSliderKey(e, entityId, current) {
  	    let value = null;
  	    if (e.key === "ArrowUp" || e.key === "ArrowRight") value = current + 5;
  	    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") value = current - 5;
  	    else if (e.key === "PageUp") value = current + 10;
  	    else if (e.key === "PageDown") value = current - 10;
  	    else if (e.key === "Home") value = 0;
  	    else if (e.key === "End") value = 100;
  	    if (value === null) return;
  	    e.preventDefault();
  	    this._commitPosition(entityId, Math.min(100, Math.max(0, value)));
  	  }

  	  _commitPosition(entityId, value) {
  	    const stateObj = this.hass.states[entityId];
  	    if (!stateObj) return;
  	    const real = this._positionOf(stateObj);
  	    if (value === real) return;

  	    // Keep the displayed value during the confirmation
  	    this._setPending(entityId, value, real);
  	    this.requestUpdate();

  	    // The confirmation is opened AFTER the pointer event has ended,
  	    // so that the dialog does not disturb the gesture in progress.
  	    setTimeout(() => {
  	      const allowed = this._checkLock();
  	      // Ignore stray events that follow the dialog closing
  	      this._ignorePointerUntil = Date.now() + 500;
  	      this._drag = null;

  	      if (!allowed) {
  	        // Declined: no command, explicit return to the actual state
  	        this._clearPending(entityId);
  	        this.requestUpdate();
  	        return;
  	      }

  	      this._setPending(entityId, value, real); // restart the wait timeout
  	      let result;
  	      try {
  	        result = this.hass.callService("cover", "set_cover_position", {
  	          entity_id: entityId,
  	          position: value
  	        });
  	      } catch (err) {
  	        this._clearPending(entityId);
  	        this.requestUpdate();
  	        return;
  	      }
  	      Promise.resolve(result).catch(() => {
  	        // Service call failed: immediately go back to the actual state
  	        this._clearPending(entityId);
  	        this.requestUpdate();
  	      });
  	    }, 0);
  	  }

  	  // ------------------------------------------
  	  // Rendering
  	  // ------------------------------------------
  	  render() {
  	    if (!this.config) return html``;
  	    if (!this.hass) return html``;

  	    let spacing = this.config.vertical_spacing;
  	    if (spacing === undefined) {
  	      spacing = 6;
  	    }

  	    return html`
      <ha-card style="--card-spacing: ${spacing}px;">
        <div class="covers-container">
          ${this.config.covers.map((coverConfig) => this._renderCover(coverConfig))}
        </div>
      </ha-card>
    `;
  	  }

  	  _renderCover(cover) {
  	    const stateObj = this.hass.states[cover.entity];
  	    if (!stateObj) return html`<div class="cover-column">Entity not found</div>`;

  	    const realPosition = this._positionOf(stateObj);
  	    const position = this._displayPosition(cover.entity, realPosition);
  	    const unavailable = stateObj.state === "unavailable";

  	    let displayName = cover.name;
  	    if (!displayName) {
  	      if (stateObj.attributes.friendly_name) {
  	        displayName = stateObj.attributes.friendly_name;
  	      } else {
  	        displayName = cover.entity;
  	      }
  	    }

  	    let sliderWidth = cover.slider_width;
  	    if (sliderWidth === undefined) sliderWidth = 54;

  	    let nameFontSize = cover.name_font_size;
  	    if (nameFontSize === undefined) nameFontSize = 14;

  	    let percentageFontSize = cover.percentage_font_size;
  	    if (percentageFontSize === undefined) percentageFontSize = 16;

  	    let textColor = cover.name_color;
  	    if (!textColor) {
  	      textColor = "#ffffff";
  	    }

  	    let sliderBgColor = cover.slider_bg_color;
  	    if (!sliderBgColor) sliderBgColor = "#222222";

  	    let sliderProgColor = cover.slider_progress_color;
  	    if (!sliderProgColor) sliderProgColor = "#888888";

  	    let sliderThumbColor = cover.slider_thumb_color;
  	    if (!sliderThumbColor) sliderThumbColor = "#ffffff";

  	    let iconUp = cover.icon_up;
  	    if (!iconUp) iconUp = "mdi:arrow-up";

  	    let iconDown = cover.icon_down;
  	    if (!iconDown) iconDown = "mdi:arrow-down";

  	    let iconStop = cover.icon_stop;
  	    if (!iconStop) iconStop = "mdi:square";

  	    let showName = cover.show_name;
  	    if (showName === undefined) showName = true;

  	    return html`
      <div class="cover-column">

        <!-- Position in % -->
        <div class="percentage" style="font-size: ${percentageFontSize}px;">${position}%</div>

        <!-- Up button -->
        <ha-icon
          class="control-icon"
          .icon=${iconUp}
          @click=${() => this._callService('cover', 'open_cover', cover.entity)}>
        </ha-icon>

        <!-- Slider (pointer events, touch-action: none => never scrolls the page) -->
        <div class="slider-wrapper" style="--slider-width: ${sliderWidth}px; --slider-bg: ${sliderBgColor}; --slider-prog: ${sliderProgColor}; --slider-thumb: ${sliderThumbColor};">
          <div
            class="slider ${unavailable ? "disabled" : ""}"
            role="slider"
            tabindex=${unavailable ? "-1" : "0"}
            aria-label=${displayName}
            aria-orientation="vertical"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow=${position}
            @pointerdown=${(e) => this._onSliderDown(e, cover.entity)}
            @pointermove=${(e) => this._onSliderMove(e)}
            @pointerup=${(e) => this._onSliderUp(e)}
            @pointercancel=${(e) => this._onSliderCancel(e)}
            @keydown=${(e) => this._onSliderKey(e, cover.entity, position)}
          >
            <div class="slider-fill" style="height: calc((100% - ${THUMB_SIZE}px) * ${position} / 100 + ${THUMB_SIZE / 2}px);"></div>
            <div class="slider-thumb" style="bottom: calc((100% - ${THUMB_SIZE}px) * ${position} / 100);"></div>
          </div>
        </div>

        <!-- Down button -->
        <ha-icon
          class="control-icon"
          .icon=${iconDown}
          @click=${() => this._callService('cover', 'close_cover', cover.entity)}>
        </ha-icon>

        <!-- Stop button -->
        <ha-icon
          class="control-icon stop-icon"
          .icon=${iconStop}
          @click=${() => this._callService('cover', 'stop_cover', cover.entity)}>
        </ha-icon>

        <!-- Cover name -->
        ${showName ? html`
          <div class="cover-name" style="color: ${textColor}; font-size:${nameFontSize}px;">
            ${displayName}
          </div>
        ` : ""}
      </div>
    `;
  	  }

  	  static get styles() {
  	    return css`
      ha-card {
        padding: 20px 10px;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 16px;
      }
      .covers-container {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        width: 100%;
      }
      .cover-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--card-spacing);
      }
      .percentage {
        color: #4fc3f7;
        font-weight: bold;
      }
      .control-icon {
        color: var(--primary-text-color, white);
        cursor: pointer;
        --mdc-icon-size: 28px;
      }
      .stop-icon {
        --mdc-icon-size: 16px;
      }

      .slider-wrapper {
        position: relative;
        width: var(--slider-width, 54px);
        height: ${SLIDER_LENGTH}px;
        touch-action: none;
      }

      .slider {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--slider-bg, #222222);
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        /* Prevent any scroll / zoom / selection during the gesture */
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .slider:focus-visible {
        box-shadow: 0 0 0 2px var(--primary-color, #03a9f4);
      }
      .slider.disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      .slider-fill {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--slider-prog, #888888);
        pointer-events: none;
      }
      .slider-thumb {
        position: absolute;
        left: 0;
        right: 0;
        height: ${THUMB_SIZE}px;
        background: var(--slider-thumb, #ffffff);
        pointer-events: none;
      }

      .cover-name {
        font-weight: bold;
        text-align: center;
        max-width: 120px;
        word-wrap: break-word;
      }
    `;
  	  }
  	}

  	// ==========================================
  	// 4. SAFE REGISTRATION
  	// ==========================================
  	if (LitElement) {
  	  if (!customElements.get("ha-plooum-cover-card-editor")) {
  	    customElements.define("ha-plooum-cover-card-editor", PlooumCoverCardEditor);
  	  }
  	  if (!customElements.get("ha-plooum-cover-card")) {
  	    customElements.define("ha-plooum-cover-card", PlooumCoverCard);
  	  }
  	}

  	// Lovelace registration
  	if (!window.customCards) {
  	  window.customCards = [];
  	}
  	let cardExists = false;
  	for (let i = 0; i < window.customCards.length; i++) {
  	  if (window.customCards[i].type === "ha-plooum-cover-card") {
  	    cardExists = true;
  	    break;
  	  }
  	}

  	if (!cardExists) {
  	  window.customCards.push({
  	    type: "ha-plooum-cover-card",
  	    name: "Plooum Cover Card",
  	    preview: true,
  	    description: "Customizable card to control several roller shutters."
  	  });
  	}
  	return haPlooumCoverCard;
  }

  requireHaPlooumCoverCard();

  /* ==========================================================================
     MAIN CARD : ha-plooum-dpad-card
     ========================================================================== */
  class HaPlooumDpadCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    static getConfigElement() {
      return document.createElement("ha-plooum-dpad-card-editor");
    }

    static getStubConfig() {
      return {
        theme: "round",
        card_size: "200px",
        icon_size: "44px",
        bg_color: "rgba(0, 0, 0, 0.3)",
        icon_color: "#ffffff",
        card_alignment: "center",
        card_padding: "0",
        
        // Default configurations for the 5 buttons
        up_icon: "mdi:chevron-up",
        up_action_type: "press",
        
        left_icon: "mdi:chevron-left",
        left_action_type: "press",
        
        center_icon: "mdi:checkbox-blank-circle-outline",
        center_action_type: "execute_script",
        
        right_icon: "mdi:chevron-right",
        right_action_type: "press",
        
        down_icon: "mdi:chevron-down",
        down_action_type: "press",
      };
    }

    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      this.config = { ...config };
    }

    // --- Action Handler ---
    _handleAction(btnKey) {
      const actionType = this.config[`${btnKey}_action_type`] || "none";
      if (actionType === "none") return;

      if (actionType === "toggle") {
        const entity = this.config[`${btnKey}_entity`];
        if (entity) {
          const domain = entity.split(".")[0];
          this.hass.callService(domain, "toggle", { entity_id: entity });
        }
      } 
      else if (actionType === "press") {
        const entity = this.config[`${btnKey}_entity`];
        if (entity) {
          const domain = entity.split(".")[0];
          // Typical service for a button domain is 'press', but we support others dynamically
          const service = domain === "button" ? "press" : "turn_on"; 
          this.hass.callService(domain, service, { entity_id: entity });
        }
      } 
      else if (actionType === "navigate") {
        const path = this.config[`${btnKey}_path`];
        if (path) {
          window.history.pushState(null, "", path);
          window.dispatchEvent(new CustomEvent("location-changed"));
        }
      } 
      else if (actionType === "execute_script") {
        const scriptEntity = this.config[`${btnKey}_script`];
        if (scriptEntity) {
          const scriptId = scriptEntity.replace("script.", "");
          this.hass.callService("script", scriptId);
        }
      }
    }

    render() {
      if (!this.config || !this.hass) return b``;

      const theme = this.config.theme || "round";
      const cardSize = this.config.card_size || "200px";
      const iconSize = this.config.icon_size || "44px";
      const bgColor = this.config.bg_color || "rgba(0, 0, 0, 0.3)";
      const iconColor = this.config.icon_color || "#ffffff";
      const alignment = this.config.card_alignment || "center";
      const cardPadding = this.config.card_padding !== undefined ? this.config.card_padding : "0";

      // Alignment logic for the outer container
      const alignMap = {
        "left": "flex-start",
        "center": "center",
        "right": "flex-end"
      };
      const justifyContent = alignMap[alignment] || "center";

      const renderButton = (btnKey, defaultIcon, gridArea) => {
        const icon = this.config[`${btnKey}_icon`] || defaultIcon;
        return b`
        <div class="remote-btn" style="grid-area: ${gridArea};"
             @pointerup="${(e) => { e.stopPropagation(); this._handleAction(btnKey); }}"
             @contextmenu="${(e) => e.preventDefault()}">
          <ha-icon icon="${icon}" style="--mdc-icon-size: ${iconSize}; color:${iconColor};"></ha-icon>
        </div>
      `;
      };

      return b`
      <ha-card class="plooum-remote-card" style="justify-content: ${justifyContent}; padding:${cardPadding};">
        <div class="remote-container theme-${theme}" 
             style="--card-size: ${cardSize}; --bg-color:${bgColor};">
          ${renderButton("up", "mdi:chevron-up", "up")}
          ${renderButton("left", "mdi:chevron-left", "left")}
          ${renderButton("center", "mdi:checkbox-blank-circle-outline", "center")}
          ${renderButton("right", "mdi:chevron-right", "right")}
          ${renderButton("down", "mdi:chevron-down", "down")}
        </div>
      </ha-card>
    `;
    }

    static get styles() {
      return i$6`
      .plooum-remote-card {
        background: transparent;
        border: none;
        box-shadow: none;
        display: flex;
        width: 100%;
        box-sizing: border-box;
      }
      .remote-container {
        display: grid;
        /* Use minmax(0, 1fr) so that oversized icons do not shift the grid */
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: repeat(3, minmax(0, 1fr));
        grid-template-areas: 
          ". up ."
          "left center right"
          ". down .";
        width: var(--card-size);
        height: var(--card-size);
        position: relative;
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
      }
      
      /* THEMES */
      .theme-round {
        background-color: var(--bg-color);
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
      .theme-square {
        background-color: var(--bg-color);
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
      .theme-minimal {
        background-color: transparent;
      }

      /* BUTTONS */
      .remote-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.2s ease;
        /* Optional, but guards against visual overflow if the icon is huge */
        width: 100%;
        height: 100%;
      }
      .remote-btn ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .remote-btn:active {
        background-color: rgba(255, 255, 255, 0.15);
      }
    `;
    }
  }

  /* ==========================================================================
     CARD EDITOR
     ========================================================================== */
  class HaPlooumDpadCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { type: Object },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this._loadHAElements();
    }

    async _loadHAElements() {
      if (customElements.get("ha-entity-picker") && customElements.get("ha-selector")) return;
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers) {
          await helpers.createCardElement({ type: "button" });
          this.requestUpdate();
        }
      }
    }

    setConfig(config) {
      this._config = config;
    }

    _valueChanged(ev, key) {
      if (!this._config || !this.hass) return;
      let newValue = ev.detail && ev.detail.value !== undefined ? ev.detail.value : ev.target?.value;
      if (this._config[key] === newValue) return;

      const newConfig = { ...this._config, [key]: newValue };
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    }

    _renderColorPicker(labelTitle, key, defaultColor) {
      const val = this._config[key] !== undefined ? this._config[key] : defaultColor;
      let hexColor = "#000000";
      if (val && val.match(/^#[0-9A-Fa-f]{6}$/)) hexColor = val;
      else if (val && val.match(/^#[0-9A-Fa-f]{3}$/)) hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];

      return b`
      <div class="input-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input type="color" .value=${hexColor} @input=${(e) => this._valueChanged(e, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._valueChanged(e, key)} />
        </div>
      </div>
    `;
    }

    _renderButtonSection(btnKey, labelTitle) {
      const typeKey = `${btnKey}_action_type`;
      const entityKey = `${btnKey}_entity`;
      const scriptKey = `${btnKey}_script`;
      const pathKey = `${btnKey}_path`;
      const iconKey = `${btnKey}_icon`;

      const actionType = this._config[typeKey] || "none";

      return b`
      <div class="button-section">
        <h4>${labelTitle}</h4>
        
        <ha-icon-picker
          .label=${"Icon"}
          .hass=${this.hass}
          .value=${this._config[iconKey] || ""}
          @value-changed=${(e) => this._valueChanged(e, iconKey)}
        ></ha-icon-picker>

        <div class="input-field" style="margin-top: 8px;">
          <label>Action type</label>
          <select .value=${actionType} @change=${(e) => this._valueChanged(e, typeKey)}>
            <option value="none">No action</option>
            <option value="press">Press Button (Button / Switch)</option>
            <option value="toggle">Toggle Entity</option>
            <option value="execute_script">Execute a Script</option>
            <option value="navigate">Navigate</option>
          </select>
        </div>

        ${(actionType === "toggle" || actionType === "press") ? b`
          <ha-entity-picker
            style="margin-top: 8px;"
            .label=${"Entity"}
            .hass=${this.hass}
            .value=${this._config[entityKey] || ""}
            @value-changed=${(e) => this._valueChanged(e, entityKey)}
            allow-custom-entity
          ></ha-entity-picker>
        ` : ""}

        ${actionType === "execute_script" ? b`
          <ha-entity-picker
            style="margin-top: 8px;"
            .label=${"Script to execute"}
            .hass=${this.hass}
            .value=${this._config[scriptKey] || ""}
            .includeDomains=${["script"]}
            @value-changed=${(e) => this._valueChanged(e, scriptKey)}
            allow-custom-entity
          ></ha-entity-picker>
        ` : ""}

        ${actionType === "navigate" ? b`
          <div class="input-field" style="margin-top: 8px;">
            <label>Navigation path</label>
            <input type="text" placeholder="/lovelace/home" .value=${this._config[pathKey] || ""} @input=${(e) => this._valueChanged(e, pathKey)} />
          </div>
        ` : ""}
      </div>
    `;
    }

    render() {
      if (!this.hass || !this._config) return b``;

      return b`
      <div class="card-config">
        <h3>Global Settings</h3>
        
        <div class="input-field">
          <label>Theme</label>
          <select .value=${this._config.theme || "round"} @change=${(e) => this._valueChanged(e, "theme")}>
            <option value="round">Round (Default)</option>
            <option value="square">Square</option>
            <option value="minimal">Minimalist (Transparent)</option>
          </select>
        </div>

        <div class="input-field">
          <label>Card alignment</label>
          <select .value=${this._config.card_alignment || "center"} @change=${(e) => this._valueChanged(e, "card_alignment")}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Total card size</label>
            <input type="text" placeholder="200px" .value=${this._config.card_size || "200px"} @input=${(e) => this._valueChanged(e, "card_size")} />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icons size</label>
            <input type="text" placeholder="44px" .value=${this._config.icon_size || "44px"} @input=${(e) => this._valueChanged(e, "icon_size")} />
          </div>
        </div>

        <div class="input-field">
          <label>Card padding</label>
          <input type="text" placeholder="0" .value=${this._config.card_padding !== undefined ? this._config.card_padding : "0"} @input=${(e) => this._valueChanged(e, "card_padding")} />
        </div>

        ${this._renderColorPicker("Background color (Round/Square)", "bg_color", "rgba(0, 0, 0, 0.3)")}
        ${this._renderColorPicker("Icons color", "icon_color", "#ffffff")}

        <hr />
        <h3>Buttons Configuration</h3>
        
        ${this._renderButtonSection("up", "⬆️ Up Button")}
        ${this._renderButtonSection("left", "⬅️ Left Button")}
        ${this._renderButtonSection("center", "⏺️ Center Button")}
        ${this._renderButtonSection("right", "➡️ Right Button")}
        ${this._renderButtonSection("down", "⬇️ Down Button")}
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      h3 {
        margin: 12px 0 4px 0;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      .button-section {
        border-left: 3px solid var(--primary-color);
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 0 8px 8px 0;
        margin-bottom: 8px;
      }
      .button-section h4 {
        margin: 0 0 12px 0;
        color: var(--primary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
      .color-input-group input[type="color"]::-webkit-color-swatch {
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
      }
      .color-input-group input[type="text"], input[type="text"], select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker, ha-icon-picker, ha-selector {
        width: 100%;
        display: block;
      }
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
    `;
    }
  }

  /* ==========================================================================
     HOME ASSISTANT REGISTRATION
     ========================================================================== */
  if (!customElements.get('ha-plooum-dpad-card')) {
    customElements.define('ha-plooum-dpad-card', HaPlooumDpadCard);
  }
  if (!customElements.get('ha-plooum-dpad-card-editor')) {
    customElements.define('ha-plooum-dpad-card-editor', HaPlooumDpadCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === 'ha-plooum-dpad-card')) {
    window.customCards.push({
      type: 'ha-plooum-dpad-card',
      name: 'Ha Plooum D-Pad Card',
      description: 'A customizable D-Pad style remote control card for cameras and more.',
      preview: true,
    });
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$1={CHILD:2},e=t=>(...e)=>({_$litDirective$:t,values:e});let i$2 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const {I:t}=j,i$1=o=>o,s=()=>document.createComment(""),v=(o,n,e)=>{const l=o._$AA.parentNode,d=void 0===n?o._$AB:n._$AA;if(void 0===e){const i=l.insertBefore(s(),d),n=l.insertBefore(s(),d);e=new t(i,n,o,o.options);}else {const t=e._$AB.nextSibling,n=e._$AM,c=n!==o;if(c){let t;e._$AQ?.(o),e._$AM=o,void 0!==e._$AP&&(t=o._$AU)!==n._$AU&&e._$AP(t);}if(t!==d||c){let o=e._$AA;for(;o!==t;){const t=i$1(o).nextSibling;i$1(l).insertBefore(o,d),o=t;}}}return e},u$1=(o,t,i=o)=>(o._$AI(t,i),o),m={},p=(o,t=m)=>o._$AH=t,M=o=>o._$AH,h=o=>{o._$AR(),o._$AA.remove();};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=e(class extends i$2{constructor(e){if(super(e),e.type!==t$1.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return {values:o,keys:l}}render(e,s,t){return this.dt(e,s,t).values}update(s,[t,r,c]){const d=M(s),{values:p$1,keys:a}=this.dt(t,r,c);if(!Array.isArray(d))return this.ut=a,p$1;const h$1=this.ut??=[],v$1=[];let m,y,x=0,j=d.length-1,k=0,w=p$1.length-1;for(;x<=j&&k<=w;)if(null===d[x])x++;else if(null===d[j])j--;else if(h$1[x]===a[k])v$1[k]=u$1(d[x],p$1[k]),x++,k++;else if(h$1[j]===a[w])v$1[w]=u$1(d[j],p$1[w]),j--,w--;else if(h$1[x]===a[w])v$1[w]=u$1(d[x],p$1[w]),v(s,v$1[w+1],d[x]),x++,w--;else if(h$1[j]===a[k])v$1[k]=u$1(d[j],p$1[k]),v(s,d[x],d[j]),j--,k++;else if(void 0===m&&(m=u(a,k,w),y=u(h$1,x,j)),m.has(h$1[x]))if(m.has(h$1[j])){const e=y.get(a[k]),t=void 0!==e?d[e]:null;if(null===t){const e=v(s,d[x]);u$1(e,p$1[k]),v$1[k]=e;}else v$1[k]=u$1(t,p$1[k]),v(s,d[x],t),d[e]=null;k++;}else h(d[j]),j--;else h(d[x]),x++;for(;k<=w;){const e=v(s,v$1[w+1]);u$1(e,p$1[k]),v$1[k++]=e;}for(;x<=j;){const e=d[x++];null!==e&&h(e);}return this.ut=a,p(s,v$1),E}});

  const CARD_VERSION$2 = '1.7.0';

  const UNAVAILABLE_STATES$2 = ['unavailable', 'unknown'];
  const HOLD_DELAY$1 = 500; // ms before a press on an entity opens its more-info dialog
  const PREVIEW_LEAVE_MS = 200; // ms a hovered camera's preview stays once the mouse leaves its marker
  const COVER_PENDING_MS = 5000; // how long a dragged cover position is shown while waiting for the state
  const WINDOW_LENGTH = 1.5; // default window length on a wall (grid units)
  const WALL_SNAP = 0.75; // max distance for a cover to snap onto a wall in the editor (grid units)
  const ON_WALL_EPS = 0.05; // tolerance to consider a point lies on a wall (grid units)
  const ROOM_SNAP = 0.5; // room corners snap to this step (grid units)
  const ENTITY_SNAP = 0.25; // entity positions snap to this step (grid units)
  const EDGE_DRAW_ZONE = 0.3; // in the editor, a drag starting this close to a wall draws a room (grid units)
  const PALETTE_LIMIT = 80; // max entities listed at once in the editor palette
  const PALETTE_OPEN_KEY = 'ha-plooum-floorplan-palette-open'; // localStorage key: the editor's entity list is unfolded ('1') or folded ('0')

  // Whether the editor's entity list was left unfolded on this device (unfolded by default).
  function readPaletteOpen() {
    try {
      return localStorage.getItem(PALETTE_OPEN_KEY) !== '0';
    } catch (err) {
      return true;
    }
  }
  const CARD_PADDING = 12; // px, inside ha-card around the plan
  const ZOOM_MARGIN = 0.5; // space kept around a zoomed room, so its walls and windows stay visible (grid units)
  const ZOOM_MAX = 2.5; // max zoom on a room
  const ZOOM_MAX_HEIGHT = 1.2; // the plan can grow up to this ratio of its width while zoomed
  const ZOOM_ITEM_GROWTH = 1.3; // markers and labels grow at most this much while zoomed

  const DEFAULT_LIGHT_RGB = [255, 196, 107];
  // Floor color scale, from temp_min (0) to temp_max (1).
  const TEMP_STOPS = [
    [0, [91, 141, 239]],
    [0.35, [73, 193, 179]],
    [0.65, [242, 177, 74]],
    [1, [239, 90, 60]],
  ];

  const TOGGLE_DOMAINS$1 = ['light', 'switch', 'fan', 'input_boolean', 'automation', 'siren', 'humidifier'];
  const RUN_SERVICES = {
    scene: 'turn_on',
    script: 'turn_on',
    button: 'press',
    input_button: 'press',
  };
  const OPENING_CLASSES = ['door', 'window', 'garage_door', 'opening'];
  const PRESENCE_CLASSES = ['motion', 'occupancy', 'presence'];
  // Domains offered by the editor's "Suggested" filter and used by "Generate from my areas".
  const SUGGESTED_DOMAINS = [
    'light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'lock', 'vacuum', 'input_boolean',
    'humidifier', 'water_heater', 'valve', 'siren', 'scene', 'script', 'button', 'camera',
  ];

  const PALETTE_FILTERS = [
    { id: 'suggested', label: 'Suggested' },
    { id: 'lights', label: 'Lights' },
    { id: 'covers', label: 'Covers' },
    { id: 'cameras', label: 'Cameras' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'switches', label: 'Switches' },
    { id: 'all', label: 'All' },
  ];

  // Card options shown in the editor with their default value, and left out of the config when unchanged.
  const CARD_DEFAULTS = { view: '2d', camera_view: 'snapshot', camera_previews: 'hover', projection_picture: 'frozen', screen_mode: 'world', roof: true };
  // Where camera screens are shown in 3D: in the scene in front of their camera, floating flat on the
  // view next to it, or nowhere (the camera bar still flies to them).
  const SCREEN_MODES = ['world', 'billboard', 'none'];

  // Cameras (2D cone and 3D screen). Angles in degrees; `direction` is clockwise from the top of the plan.
  const CAMERA_FOV = 90;
  const CAMERA_HEIGHT = 2.2; // above the floor (grid units)
  const CAMERA_TILT = 15; // downwards
  const CAMERA_REACH = 2.5; // 2D cone length when no wall is in front of the camera
  const SCREEN_SIZE = 2.4; // max screen width in 3D (grid units)
  const SCREEN_DISTANCE = 2.5; // max distance from the camera to its screen in 3D (grid units)
  const SCREEN_PX = 480; // width of a camera screen's texture in 3D: keeps the image sharp when zoomed in
  const PROJECTING_SCREEN = { size: 0.55, alpha: 0.35 }; // screen of a camera projecting its picture in 3D: smaller and faint
  const SHORT_BEAM = 0.7; // beam length when the screen isn't in the scene (grid units)
  const STRIP_HEIGHT = 44; // px kept free at the bottom of the 3D view for the camera bar
  const PICTURE_PX = 1024; // max width of a camera picture projected in 3D (texture)
  const PROJ_REACH = 25; // projected pictures stop this far from their camera (grid units)
  const REFRESH_INTERVAL = 3; // s between two snapshots of a camera
  const THUMB_INTERVAL = 300; // s between two snapshots of the thumbnails always shown in 2D (`camera_previews: always`)
  const THUMB_CHECK = 30; // s between two checks for thumbnails older than THUMB_INTERVAL
  const THUMB_STORE = 'ha-plooum-floorplan-thumbs'; // localStorage key of the thumbnails kept between visits
  const THUMB_STORE_PX = 320; // width of a thumbnail kept in localStorage (JPEG)
  const THUMB_PX = 96; // thumbnail width in 2D (px, before the plan's zoom)
  // Sides a thumbnail can be put on (a camera's `preview_position`), as directions from its camera.
  const THUMB_SIDES = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };
  const BLACK_LEVEL = 20; // a snapshot whose brightest pixel is darker than this (0-255) is considered black
  const PROJECTION_PICTURES = ['frozen', 'live', 'snapshot']; // `projection_picture` values
  const LIVE_PROJECTION_INTERVAL = 300; // s between two snapshots checked for `projection_picture: live`
  const MATCH_W = 64; // px: pictures are compared at this size (`projection_picture: live`)
  const MATCH_H = 36;
  const MATCH_MIN = 0.5; // edge correlation under which a snapshot no longer looks like the reference (a turn of ~3% of the picture)
  const MOVED_MESSAGE = 'Camera moved? Re-align it';
  const AIM_HANDLE = 1.25; // distance from a camera to its aim handle in the editor (grid units)
  // Camera options left out of the config when they keep their default value.
  const CAMERA_KEYS = ['fov', 'tilt', 'height', 'screen_size', 'screen_distance'];
  const DISTORTION_RANGE = [-0.9, 0.3]; // lens distortion (`distortion`, see cameraPose())
  // Correction of the plan as a camera sees it (see cameraPose()): its settings, their default
  // values and ranges (stretches, then shifts in grid units).
  const CORRECTION_KEYS = ['stretch_x', 'stretch_y', 'stretch_z', 'shift_x', 'shift_y'];
  const CORRECTION_NONE = [1, 1, 1, 0, 0];
  const CORRECTION_LO = [0.7, 0.7, 0.7, -2, -2];
  const CORRECTION_HI = [1.3, 1.3, 1.3, 2, 2];
  const X_SCALE_RANGE = [0.7, 1.4]; // horizontal scale of a camera's picture (`x_scale`, see cameraPose())
  const X_SCALE_PINS = 4; // pinned corners from which the editor's fit also sets it
  const LENS_PINS = 5; // pinned corners from which the editor's fit also sets the lens distortion
  const MAX_PINS = 16; // pinned corners of a camera (`pins`): the shader's warp takes this many

  // 3D view. Grid units are meant as meters: walls are 2.5 units high by default.
  const U3 = 100; // px per grid unit of the 3D view (orbit distances, perspective, overlays)
  const ORBIT_EASE_MS = 800; // the 3D view eases this long to a new point of view
  const WALL_HEIGHT = 2.5;
  const SLAB = 0.25; // thickness between two floors
  const WALL_CAP = 0.12; // wall thickness, drawn as a cap on top of each wall
  const CUT_HEIGHT = 0.35; // height of the walls cut away in front of the viewer
  const ROOF_PITCH = 0.7; // rise per run (35°)
  const ROOF_OVERHANG = 0.25;
  const GROUND_MARGIN = 4; // lawn around the home (grid units)
  const ORBIT_DEFAULT = { az: -25, tilt: 55 };
  const TILT_MIN = 0;
  const TILT_MAX = 88;

  // -------------------------------------------------------------------------
  // Pure helpers (shared by the card and its editor)
  // -------------------------------------------------------------------------

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const snap = (v, step) => Math.round(v / step) * step;
  const round2 = (v) => Math.round(v * 100) / 100;
  const num = (v, fallback = 0) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const rgba = (c, a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
  const domainOf = (entityId) => (entityId || '').split('.')[0];

  function isUnavailable(st) {
    return !st || UNAVAILABLE_STATES$2.includes(st.state);
  }

  // A loaded snapshot read through a canvas: `black` when it is (almost) all black (a camera that
  // sends a black frame), and `data`, a small JPEG copy (data URL) to keep between visits. An image
  // the canvas can't read (another origin) is not black and has no copy.
  function readSnapshot(img) {
    try {
      const probe = document.createElement('canvas');
      probe.width = 32;
      probe.height = 18;
      const ctx = probe.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, probe.width, probe.height);
      const px = ctx.getImageData(0, 0, probe.width, probe.height).data;
      let black = true;
      for (let i = 0; i < px.length && black; i += 4) {
        if (Math.max(px[i], px[i + 1], px[i + 2]) >= BLACK_LEVEL) black = false;
      }
      if (black) return { black, data: null };
      const copy = document.createElement('canvas');
      copy.width = Math.min(img.naturalWidth, THUMB_STORE_PX);
      copy.height = Math.max(1, Math.round((copy.width * img.naturalHeight) / img.naturalWidth));
      copy.getContext('2d').drawImage(img, 0, 0, copy.width, copy.height);
      return { black, data: copy.toDataURL('image/jpeg', 0.75) };
    } catch (err) {
      return { black: false, data: null };
    }
  }

  // URL of a picture uploaded through Home Assistant's image upload (a camera's reference picture).
  const uploadedImageUrl = (id) => `/api/image/serve/${encodeURIComponent(id)}/original`;

  // Edges of a loaded picture scaled down to MATCH_W x MATCH_H: the brightness gradient (x and y) of
  // each pixel, blurred a little (a camera that shakes slightly still matches), with a unit norm, so
  // that two pictures' edges compare by a dot product whatever their brightness. Unlike colors, edges
  // hardly change with the light of the day, nor in a gray infrared night view; a turn of a few
  // degrees moves all of them. Also `black` (see readSnapshot()). Null when the canvas can't read the
  // picture (another origin).
  function pictureEdges(img) {
    const w = MATCH_W;
    const h = MATCH_H;
    let px;
    try {
      const [c, ctx] = canvas2d(w, h);
      ctx.drawImage(img, 0, 0, w, h);
      px = ctx.getImageData(0, 0, w, h).data;
      c.width = 0;
    } catch (err) {
      return null;
    }
    const gray = new Float32Array(w * h);
    let brightest = 0;
    for (let i = 0; i < w * h; i++) {
      const [r, g, b] = [px[4 * i], px[4 * i + 1], px[4 * i + 2]];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      brightest = Math.max(brightest, r, g, b);
    }
    const grad = new Float32Array(2 * w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        grad[2 * i] = gray[i + 1] - gray[i - 1];
        grad[2 * i + 1] = gray[i + w] - gray[i - w];
      }
    }
    const edges = new Float32Array(2 * w * h);
    let norm = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let k = 0; k < 2; k++) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += grad[2 * (clamp(y + dy, 0, h - 1) * w + clamp(x + dx, 0, w - 1)) + k];
          edges[2 * (y * w + x) + k] = sum;
          norm += sum * sum;
        }
      }
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < edges.length; i++) edges[i] /= norm;
    return { edges, black: brightest < BLACK_LEVEL };
  }

  // Whether a snapshot still shows what the reference picture shows (their pictureEdges()):
  // `match`, `moved` (the camera turned), or `rejected` (black or unreadable), which tells nothing
  // about the camera. A gray infrared night view is compared like any other.
  function matchPicture(ref, snap) {
    if (!ref || !snap || snap.black) return 'rejected';
    let corr = 0;
    for (let i = 0; i < ref.edges.length; i++) corr += ref.edges[i] * snap.edges[i];
    return corr >= MATCH_MIN ? 'match' : 'moved';
  }

  // Loads a picture: resolves with the Image, or null when it fails.
  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      if (new URL(url, location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Thumbnails of the 2D plan (`camera_previews: always`), shared by every card of the page and kept
  // in localStorage between visits, so that opening a dashboard again shows them at once instead of
  // loading them again. Camera id -> { url, aspect, time } (time of the snapshot, ms), plus while in
  // use { tried, loading, force, cards } (the cards showing it, redrawn when a new one has loaded).
  const thumbCache = (() => {
    let entries = {};
    try {
      entries = JSON.parse(localStorage.getItem(THUMB_STORE)) || {};
    } catch (err) {
      entries = {};
    }
    return {
      get(id) {
        const e = entries[id] || (entries[id] = { url: null, aspect: null, time: 0 });
        if (!e.cards) Object.assign(e, { tried: 0, loading: false, force: false, cards: new Set() });
        return e;
      },
      // Keeps the thumbnails that have a JPEG copy; drops the oldest when localStorage is full.
      save() {
        const kept = Object.entries(entries)
          .filter(([, e]) => e.url && e.url.startsWith('data:'))
          .sort((a, b) => b[1].time - a[1].time)
          .map(([id, e]) => [id, { url: e.url, aspect: e.aspect, time: e.time }]);
        for (let n = kept.length; n > 0; n--) {
          try {
            localStorage.setItem(THUMB_STORE, JSON.stringify(Object.fromEntries(kept.slice(0, n))));
            return;
          } catch (err) {
            // Quota exceeded: try with fewer thumbnails.
          }
        }
        try {
          localStorage.removeItem(THUMB_STORE);
        } catch (err) {
          // localStorage unavailable: thumbnails are only kept for this page.
        }
      },
    };
  })();

  function isActive(st) {
    if (isUnavailable(st)) return false;
    switch (domainOf(st.entity_id)) {
      case 'cover':
        return st.state !== 'closed';
      case 'lock':
        return st.state !== 'locked';
      case 'media_player':
        return !['off', 'idle', 'standby'].includes(st.state);
      case 'climate':
      case 'water_heater':
        return st.state !== 'off';
      case 'vacuum':
        return ['cleaning', 'returning'].includes(st.state);
      case 'valve':
        return st.state === 'open';
      default:
        return st.state === 'on';
    }
  }

  // Role of an entity on the plan, guessed from its domain and device class.
  function entityRole(entityId, st) {
    const domain = domainOf(entityId);
    const dc = st && st.attributes.device_class;
    if (domain === 'light') return 'light';
    if (domain === 'cover') return 'cover';
    if (domain === 'camera') return 'camera';
    if (domain === 'sensor' && dc === 'temperature') return 'temperature';
    if (domain === 'sensor' && dc === 'humidity') return 'humidity';
    if (domain === 'sensor') return 'sensor';
    if (domain === 'binary_sensor' && OPENING_CLASSES.includes(dc)) return 'opening';
    if (domain === 'binary_sensor' && PRESENCE_CLASSES.includes(dc)) return 'presence';
    return 'device';
  }

  // Role on the plan once the entity's `light` option is applied: `light: true` makes an on/off device
  // (a plug powering a lamp…) light up its room like a light, `light: false` stops a light from doing so.
  function itemRole(conf, st) {
    const role = entityRole(conf.entity, st);
    if (conf.light === true && role === 'device') return 'light';
    if (conf.light === false && role === 'light') return 'device';
    return role;
  }

  function lightRgb(st) {
    const a = (st && st.attributes) || {};
    if (Array.isArray(a.rgb_color)) return a.rgb_color;
    if (a.color_temp_kelvin) return a.color_temp_kelvin < 3500 ? [255, 180, 92] : [255, 236, 210];
    return DEFAULT_LIGHT_RGB;
  }

  function tempRgb(value, min, max) {
    const t = clamp((value - min) / (max - min || 1), 0, 1);
    for (let i = 1; i < TEMP_STOPS.length; i++) {
      const [p1, c1] = TEMP_STOPS[i];
      const [p0, c0] = TEMP_STOPS[i - 1];
      if (t <= p1) {
        const k = (t - p0) / (p1 - p0);
        return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      }
    }
    return TEMP_STOPS[TEMP_STOPS.length - 1][1];
  }

  function coverPosition(st) {
    const p = st.attributes.current_position;
    if (typeof p === 'number') return p;
    return st.state === 'closed' ? 0 : 100;
  }

  function supportsSetPosition(st) {
    return ((st.attributes.supported_features || 0) & 4) !== 0;
  }

  function friendlyName(hass, entityId) {
    const st = hass.states[entityId];
    return (st && st.attributes.friendly_name) || entityId;
  }

  function formatState(hass, st) {
    return hass.formatEntityState ? hass.formatEntityState(st) : st.state;
  }

  function normalizeRoom(r, index) {
    return {
      index,
      name: r.name || '',
      icon: r.icon || '',
      x: num(r.x),
      y: num(r.y),
      w: Math.max(ROOM_SNAP, num(r.w, 1)),
      h: Math.max(ROOM_SNAP, num(r.h, 1)),
      outdoor: !!r.outdoor,
      // Sensors of the room that don't need to be placed on the plan (picked from its area when generated).
      temperature: r.temperature || '',
      humidity: r.humidity || '',
    };
  }

  function roomContains(r, x, y, eps = ON_WALL_EPS) {
    return x >= r.x - eps && x <= r.x + r.w + eps && y >= r.y - eps && y <= r.y + r.h + eps;
  }

  // Index of the smallest room containing the point, or -1.
  function roomAt(rooms, x, y) {
    let best = -1;
    let bestArea = Infinity;
    rooms.forEach((r, i) => {
      if (roomContains(r, x, y) && r.w * r.h < bestArea) {
        best = i;
        bestArea = r.w * r.h;
      }
    });
    return best;
  }

  // The 4 walls of a room: horizontal ones at `at` = y, from a to b along x (and the reverse for vertical).
  function roomEdges(r) {
    return [
      { o: 'h', at: r.y, a: r.x, b: r.x + r.w },
      { o: 'h', at: r.y + r.h, a: r.x, b: r.x + r.w },
      { o: 'v', at: r.x, a: r.y, b: r.y + r.h },
      { o: 'v', at: r.x + r.w, a: r.y, b: r.y + r.h },
    ];
  }

  // Group of a room (see groupZones()): the room itself when it isn't grouped.
  const groupOf = (r) => (r.group !== undefined ? r.group : r);

  // Zones of one room: the rooms of a floor with the same name (all indoor, or all outdoor) make a
  // single room (an L-shaped room, the garden around the home), shown once, with the sensors, lights
  // and devices of all its zones and no wall between them. Each zone gets `group` (index of the
  // largest zone, the room's main one), `zones` (all of them), `main` and `bbox` (the room's bounding box).
  function groupZones(rooms) {
    const byKey = new Map();
    for (const r of rooms) {
      const key = r.name ? `${r.outdoor ? 'out' : 'in'}:${r.name}` : `#${r.index}`;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(r);
    }
    for (const zones of byKey.values()) {
      const main = zones.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a));
      const x0 = Math.min(...zones.map((z) => z.x));
      const y0 = Math.min(...zones.map((z) => z.y));
      const x1 = Math.max(...zones.map((z) => z.x + z.w));
      const y1 = Math.max(...zones.map((z) => z.y + z.h));
      for (const z of zones) Object.assign(z, { group: main.index, zones, main: z === main, bbox: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } });
    }
    return rooms;
  }

  // Walls of a zone, minus what it shares with the other zones of its room (see groupZones()).
  function zoneEdges(r) {
    const out = [];
    for (const e of roomEdges(r)) {
      let parts = [[e.a, e.b]];
      for (const other of r.zones || []) {
        if (other === r) continue;
        for (const oe of roomEdges(other)) {
          if (oe.o === e.o && Math.abs(oe.at - e.at) < ON_WALL_EPS) parts = subtractInterval(parts, oe.a, oe.b);
        }
      }
      for (const [a, b] of parts) if (b - a > ON_WALL_EPS) out.push({ o: e.o, at: e.at, a, b });
    }
    return out;
  }

  // SVG path of wall segments (see roomEdges()).
  const edgesPath = (edges) =>
    edges.map((e) => (e.o === 'h' ? `M ${e.a} ${e.at} H ${e.b}` : `M ${e.at} ${e.a} V ${e.b}`)).join(' ');

  // Closest wall to a point within maxDist, with the point projected onto it.
  function nearestWall(rooms, x, y, maxDist) {
    let best = null;
    for (const r of rooms) {
      for (const e of roomEdges(r)) {
        const along = e.o === 'h' ? x : y;
        const across = e.o === 'h' ? y : x;
        if (along < e.a - ON_WALL_EPS || along > e.b + ON_WALL_EPS) continue;
        const dist = Math.abs(across - e.at);
        if (dist <= maxDist && (!best || dist < best.dist)) {
          const pos = clamp(along, e.a, e.b);
          best = { ...e, dist, pos, x: e.o === 'h' ? pos : e.at, y: e.o === 'h' ? e.at : pos };
        }
      }
    }
    return best;
  }

  function subtractInterval(intervals, a, b) {
    const out = [];
    for (const [s, e] of intervals) {
      if (b <= s || a >= e) {
        out.push([s, e]);
        continue;
      }
      if (a > s) out.push([s, a]);
      if (b < e) out.push([b, e]);
    }
    return out;
  }

  // Wall portions not shared with another room: drawn thicker, as the outer walls of the home.
  function exteriorSegments(rooms) {
    const segments = [];
    rooms.forEach((r, i) => {
      for (const e of roomEdges(r)) {
        let parts = [[e.a, e.b]];
        rooms.forEach((other, j) => {
          if (i === j) return;
          for (const oe of roomEdges(other)) {
            if (oe.o === e.o && Math.abs(oe.at - e.at) < ON_WALL_EPS) {
              parts = subtractInterval(parts, oe.a, oe.b);
            }
          }
        });
        for (const [a, b] of parts) {
          if (b - a > ON_WALL_EPS) segments.push({ o: e.o, at: e.at, a, b });
        }
      }
    });
    return segments;
  }

  // Everything the card needs to draw one floor, derived from its config and the current states.
  function resolveFloor(hass, floor) {
    const rooms = groupZones(
      ((floor && floor.rooms) || []).map((r, i) => ({
        ...normalizeRoom(r, i),
        items: [],
        temps: [],
        hums: [],
        lights: [],
        presence: false,
      }))
    );
    // The zones of a room share its lists: whatever stands in one zone belongs to the whole room.
    for (const r of rooms) {
      const main = rooms[r.group];
      for (const key of ['items', 'temps', 'hums', 'lights']) r[key] = main[key];
    }
    // Outdoor rooms (garden, terrace) have no walls: no windows on them, no outer wall around them.
    const indoor = rooms.filter((r) => !r.outdoor);
    const items = ((floor && floor.entities) || []).map((e, index) => {
      const id = e.entity;
      const st = hass.states[id];
      const role = itemRole(e, st);
      const x = num(e.x);
      const y = num(e.y);
      const wall = role === 'cover' ? nearestWall(indoor, x, y, ON_WALL_EPS * 2) : null;
      // roomIndex: the zone it stands in; room: its room's main zone (see groupZones()).
      const roomIndex = roomAt(rooms, x, y);
      const room = roomIndex >= 0 ? rooms[roomIndex].group : -1;
      return { index, id, st, role, x, y, wall, roomIndex, room, icon: e.icon, name: e.name, length: e.length, conf: e };
    });

    for (const item of items) {
      if (item.room < 0) continue;
      const room = rooms[item.room];
      room.items.push(item);
      if (isUnavailable(item.st)) continue;
      const value = parseFloat(item.st.state);
      if (item.role === 'temperature' && Number.isFinite(value)) room.temps.push(item);
      if (item.role === 'humidity' && Number.isFinite(value)) room.hums.push(item);
      if (item.role === 'presence' && item.st.state === 'on') room.presence = true;
      if (item.role === 'light') room.lights.push(item);
    }
    // The room's own `temperature` / `humidity` sensors, unless they are also placed in it.
    for (const zone of rooms) {
      const room = rooms[zone.group];
      for (const [key, list] of [['temperature', room.temps], ['humidity', room.hums]]) {
        const id = zone[key];
        const st = id && hass.states[id];
        if (!st || isUnavailable(st) || !Number.isFinite(parseFloat(st.state)) || list.some((it) => it.id === id)) continue;
        list.push({ id, st, role: key, conf: { entity: id } });
      }
    }

    // Thermostats feed the room temperature when no temperature sensor is placed in it.
    for (const room of rooms) {
      if (room.temps.length) continue;
      const climate = room.items.find(
        (it) => domainOf(it.id) === 'climate' && it.st && typeof it.st.attributes.current_temperature === 'number'
      );
      if (climate) room.climateTemp = climate;
    }
    for (const r of rooms) Object.assign(r, { presence: rooms[r.group].presence, climateTemp: rooms[r.group].climateTemp });

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const r of rooms) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.w);
      maxY = Math.max(maxY, r.y + r.h);
    }
    for (const it of items) {
      minX = Math.min(minX, it.x - 0.5);
      minY = Math.min(minY, it.y - 0.5);
      maxX = Math.max(maxX, it.x + 0.5);
      maxY = Math.max(maxY, it.y + 0.5);
    }
    const bounds = Number.isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 8, maxY: 5 };

    for (const it of items) {
      if (it.role === 'camera') it.camera = cameraSetup(it, rooms, indoor);
    }

    return { rooms, indoor, items, bounds, exterior: exteriorSegments(indoor) };
  }

  function roomTemperature(room) {
    if (room.temps.length) {
      return room.temps.reduce((s, it) => s + parseFloat(it.st.state), 0) / room.temps.length;
    }
    if (room.climateTemp) return room.climateTemp.st.attributes.current_temperature;
    return null;
  }

  // Texts of a room's temperature and humidity ('' when it has none): the sensor's own state when
  // there is one, else the average.
  function roomClimate(hass, room) {
    const t = roomTemperature(room);
    let temp = '';
    if (room.temps.length === 1) temp = formatState(hass, room.temps[0].st);
    else if (t !== null) {
      const unit = room.temps.length ? room.temps[0].st.attributes.unit_of_measurement || '' : hass.config.unit_system.temperature;
      temp = `${t.toFixed(1)} ${unit}`;
    }
    let hum = '';
    if (room.hums.length === 1) hum = formatState(hass, room.hums[0].st);
    else if (room.hums.length > 1) hum = `${Math.round(room.hums.reduce((s, it) => s + parseFloat(it.st.state), 0) / room.hums.length)} %`;
    return { temp, hum };
  }

  // --- Cameras ----------------------------------------------------------------

  const isNum = (v) => v !== undefined && v !== null && v !== '' && Number.isFinite(parseFloat(v));
  const toRad = (deg) => (deg * Math.PI) / 180;
  // Plan direction (clockwise from the top of the plan) of a vector, rounded to 5°.
  const directionOf = (dx, dy) => ((Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI) / 5) * 5) % 360 + 360) % 360;

  // Distance from (x, y) along the unit vector (dx, dy) to the first wall further than `skip`, or null.
  function raycast(rooms, x, y, dx, dy, skip = 0.15) {
    let best = null;
    for (const e of wallSegments(rooms)) {
      let t;
      let along;
      if (e.o === 'h') {
        if (Math.abs(dy) < 1e-9) continue;
        t = (e.at - y) / dy;
        along = x + t * dx;
      } else {
        if (Math.abs(dx) < 1e-9) continue;
        t = (e.at - x) / dx;
        along = y + t * dy;
      }
      if (t > skip && along >= e.a - 1e-6 && along <= e.b + 1e-6 && (best === null || t < best)) best = t;
    }
    return best;
  }

  // Where a camera looks by default: the middle of its room, or away from the home when outdoors.
  function defaultCameraDirection(rooms, indoor, x, y) {
    const room = rooms[roomAt(rooms, x, y)];
    let tx;
    let ty;
    if (room && !room.outdoor) {
      const b = room.bbox || room;
      tx = b.x + b.w / 2 - x;
      ty = b.y + b.h / 2 - y;
    } else if (indoor.length) {
      const x1 = Math.min(...indoor.map((r) => r.x));
      const y1 = Math.min(...indoor.map((r) => r.y));
      const x2 = Math.max(...indoor.map((r) => r.x + r.w));
      const y2 = Math.max(...indoor.map((r) => r.y + r.h));
      tx = x - (x1 + x2) / 2;
      ty = y - (y1 + y2) / 2;
    } else {
      return 180;
    }
    return Math.hypot(tx, ty) < 0.01 ? 180 : directionOf(tx, ty);
  }

  // Middle of the rooms' bounding box ([x, y]), or [0, 0] without rooms.
  function planCenter(rooms) {
    if (!rooms.length) return [0, 0];
    const x0 = Math.min(...rooms.map((r) => r.x));
    const y0 = Math.min(...rooms.map((r) => r.y));
    const x1 = Math.max(...rooms.map((r) => r.x + r.w));
    const y1 = Math.max(...rooms.map((r) => r.y + r.h));
    return [(x0 + x1) / 2, (y0 + y1) / 2];
  }

  // Orientation of a placed camera and how far it sees on the plan (up to the first wall).
  function cameraSetup(item, rooms, indoor) {
    const c = item.conf || {};
    const direction = isNum(c.direction) ? num(c.direction) : defaultCameraDirection(rooms, indoor, item.x, item.y);
    const a = toRad(direction);
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    // Indoors when it stands in a room and looks into it; a camera on an outer wall looking out is outdoors.
    const inside = roomAt(indoor, item.x, item.y) >= 0 && roomAt(indoor, item.x + dx * 0.25, item.y + dy * 0.25) >= 0;
    return {
      direction,
      dx,
      dy,
      indoor: inside,
      fov: clamp(num(c.fov, CAMERA_FOV), 10, 170),
      height: isNum(c.height) ? num(c.height) : null, // default depends on the wall height (3D only)
      tilt: clamp(num(c.tilt, CAMERA_TILT), -45, 89),
      distortion: clamp(num(c.distortion, 0), ...DISTORTION_RANGE),
      xScale: clamp(num(c.x_scale, 1), ...X_SCALE_RANGE),
      correction: CORRECTION_KEYS.map((key, i) => clamp(num(c[key], CORRECTION_NONE[i]), CORRECTION_LO[i], CORRECTION_HI[i])),
      pins: readPins(c.pins),
      center: planCenter(indoor),
      hit: raycast(indoor, item.x, item.y, dx, dy),
    };
  }

  // Key of a world point: pinned corners and the editor's handles are matched by it.
  const pointKey = (P) => P.map(round2).join(',');

  // Corners pinned on a camera's picture (`pins`: [{ x, y, z, u, v }], u and v from 0 to 1 across and
  // down the picture): [{ key, P, u, v }].
  function readPins(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => p && ['x', 'y', 'z', 'u', 'v'].every((k) => isNum(p[k])))
      .slice(0, MAX_PINS)
      .map((p) => {
        const P = [num(p.x), num(p.y), num(p.z)];
        return { key: pointKey(P), P, u: num(p.u), v: num(p.v) };
      });
  }

  // 2D view cone of a camera, as an SVG path (plan coordinates).
  function conePath(item) {
    const cam = item.camera;
    const reach = cam.hit !== null ? Math.min(cam.hit, 8) : CAMERA_REACH;
    const half = toRad(Math.min(cam.fov, 160) / 2);
    const a = toRad(cam.direction);
    const p = (ang) => [item.x + Math.sin(ang) * reach, item.y - Math.cos(ang) * reach].map(round2);
    const [x1, y1] = p(a - half);
    const [x2, y2] = p(a + half);
    return `M ${item.x} ${item.y} L ${x1} ${y1} A ${reach} ${reach} 0 0 1 ${x2} ${y2} Z`;
  }

  // --- 3D geometry -------------------------------------------------------------
  // The scene is drawn with WebGL (see GlScene). World axes: x and y as on the plan (y downwards),
  // z upwards, in grid units. The view is that of a CSS perspective of `vp.p` px on a scene of U3 px
  // per grid unit (see viewMatrix()), which _project() and the overlays follow.

  const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm3 = (a) => mul3(a, 1 / (len3(a) || 1));
  const LIGHT_DIR = norm3([-0.5, -0.75, 0.6]);

  // Corners of the parallelogram with a corner at `o` and edges `u` and `v`, in order.
  const quad = (o, u, v) => [o, add3(o, u), add3(add3(o, u), v), add3(o, v)];
  const UV_QUAD = [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]];

  // Brightness (0-1) of a face of normal `n` lit by a fixed light, whichever side is seen.
  const shade = (n, min = 58) => (min + (100 - min) * Math.abs(dot3(n, LIGHT_DIR))) / 100;
  // A color (RGBA, 0-1) darkened by `k`, with alpha `a`.
  const darken = (c, k, a = c[3]) => [c[0] * k, c[1] * k, c[2] * k, a];
  const mix = (c, d, k) => c.map((x, i) => x + (d[i] - x) * k);

  // Wall segments of a floor: shared walls (`normal` null) and outer walls with their outward normal.
  // Two zones of the same room (see groupZones()) have no wall between them.
  function wallSegments(rooms) {
    const lines = new Map();
    const add = (o, at, a, b, side, group) => {
      const key = `${o}:${round2(at)}`;
      if (!lines.has(key)) lines.set(key, { o, at, spans: [] });
      lines.get(key).spans.push({ a, b, side, group });
    };
    for (const r of rooms) {
      // `side`: +1 when the room lies after the line (larger x or y), -1 before it.
      const g = groupOf(r);
      add('h', r.y, r.x, r.x + r.w, 1, g);
      add('h', r.y + r.h, r.x, r.x + r.w, -1, g);
      add('v', r.x, r.y, r.y + r.h, 1, g);
      add('v', r.x + r.w, r.y, r.y + r.h, -1, g);
    }
    const out = [];
    for (const { o, at, spans } of lines.values()) {
      const points = [...new Set(spans.flatMap((s) => [s.a, s.b]))].sort((p, q) => p - q);
      let current = null;
      for (let i = 0; i + 1 < points.length; i++) {
        const a = points[i];
        const b = points[i + 1];
        const mid = (a + b) / 2;
        const covering = spans.filter((s) => s.a < mid && s.b > mid);
        if (!covering.length) {
          current = null;
          continue;
        }
        const after = covering.some((s) => s.side > 0);
        const before = covering.some((s) => s.side < 0);
        if (after && before && covering.every((s) => s.group === covering[0].group)) {
          current = null;
          continue;
        }
        let normal = null;
        if (!(after && before)) {
          const k = after ? -1 : 1; // outwards: towards the side without a room
          normal = o === 'h' ? [0, k] : [k, 0];
        }
        const same = current && current.b === a && String(current.normal) === String(normal);
        if (same) current.b = b;
        else {
          current = { o, at, a, b, normal };
          out.push(current);
        }
      }
    }
    return out;
  }

  // Rectangles covering a floor's roof: the floor's footprint minus what the floors above cover.
  // They may overlap: hip roofs of the same pitch on overlapping rectangles meet like a real roof.
  function roofRects(rooms, above) {
    const xs = [...new Set([...rooms, ...above].flatMap((r) => [r.x, r.x + r.w]))].sort((a, b) => a - b);
    const ys = [...new Set([...rooms, ...above].flatMap((r) => [r.y, r.y + r.h]))].sort((a, b) => a - b);
    const nx = xs.length - 1;
    const ny = ys.length - 1;
    const strictly = (r, x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const fp = [];
    for (let i = 0; i < nx; i++) {
      fp.push([]);
      for (let j = 0; j < ny; j++) {
        const cx = (xs[i] + xs[i + 1]) / 2;
        const cy = (ys[j] + ys[j + 1]) / 2;
        fp[i].push(rooms.some((r) => strictly(r, cx, cy)) && !above.some((r) => strictly(r, cx, cy)));
      }
    }
    const covered = fp.map((col) => col.map(() => false));
    const rowFull = (j, i0, i1) => {
      for (let i = i0; i <= i1; i++) if (!fp[i][j]) return false;
      return true;
    };
    const rects = [];
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        if (!fp[i][j] || covered[i][j]) continue;
        // Largest rectangle of the footprint containing this cell.
        let lo = i;
        let hi = i;
        while (lo > 0 && fp[lo - 1][j]) lo--;
        while (hi < nx - 1 && fp[hi + 1][j]) hi++;
        let best = null;
        for (let i0 = lo; i0 <= i; i0++) {
          for (let i1 = i; i1 <= hi; i1++) {
            let j0 = j;
            let j1 = j;
            while (j0 > 0 && rowFull(j0 - 1, i0, i1)) j0--;
            while (j1 < ny - 1 && rowFull(j1 + 1, i0, i1)) j1++;
            const area = (xs[i1 + 1] - xs[i0]) * (ys[j1 + 1] - ys[j0]);
            if (!best || area > best.area) best = { i0, i1, j0, j1, area };
          }
        }
        for (let a = best.i0; a <= best.i1; a++) for (let b = best.j0; b <= best.j1; b++) covered[a][b] = true;
        rects.push({ x: xs[best.i0], y: ys[best.j0], w: xs[best.i1 + 1] - xs[best.i0], h: ys[best.j1 + 1] - ys[best.j0] });
      }
    }
    const inside = (a, b) => a !== b && a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    return rects.filter((a) => !rects.some((b) => inside(a, b)));
  }

  // The 4 slopes of a hip roof on a rectangle whose walls stop at height z: their corners, normal,
  // and plane (top-left corner at the eave, unit edges, upward normal) for projected pictures.
  function hipRoof(rect, z) {
    const o = ROOF_OVERHANG;
    const x0 = rect.x - o;
    const y0 = rect.y - o;
    const x1 = rect.x + rect.w + o;
    const y1 = rect.y + rect.h + o;
    const eave = z - o * ROOF_PITCH;
    const run = Math.min(x1 - x0, y1 - y0) / 2;
    const sides = [
      { p: [x0, y0], q: [x1, y0], d: [0, 1] },
      { p: [x1, y0], q: [x1, y1], d: [-1, 0] },
      { p: [x1, y1], q: [x0, y1], d: [0, -1] },
      { p: [x0, y1], q: [x0, y0], d: [1, 0] },
    ];
    return sides.map(({ p, q, d }) => {
      const u = [q[0] - p[0], q[1] - p[1], 0];
      const v = [d[0] * run, d[1] * run, run * ROOF_PITCH];
      const k = run / len3(u);
      const O = [p[0], p[1], eave];
      return {
        pts: [O, add3(O, u), add3(add3(O, v), mul3(u, 1 - k)), add3(add3(O, v), mul3(u, k))],
        n: norm3(cross3(u, v)),
        plane: { o: O, a: norm3(u), b: norm3(v), up: norm3(cross3(u, v)) },
      };
    });
  }

  // Side of a roof rectangle that leans on a floor above: the floor above stands beyond it, along
  // all of it or partly (the rest being more of this roof). Null when there's none, or when a lean-to
  // roof against it would reach higher than the wall above.
  function leanSide(rect, rooms, above) {
    const strictly = (r, x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const eps = 0.01;
    const sides = [
      { n: [0, -1], a: [rect.x, rect.y], u: [rect.w, 0], depth: rect.h },
      { n: [1, 0], a: [rect.x + rect.w, rect.y], u: [0, rect.h], depth: rect.w },
      { n: [0, 1], a: [rect.x, rect.y + rect.h], u: [rect.w, 0], depth: rect.h },
      { n: [-1, 0], a: [rect.x, rect.y], u: [0, rect.h], depth: rect.w },
    ];
    let best = null;
    for (const side of sides) {
      const length = Math.abs(side.u[0] + side.u[1]);
      // Its lean-to roof rises up to the hips' run (half the doubled rectangle's smaller side).
      if ((Math.min(length, 2 * side.depth) / 2) * ROOF_PITCH > SLAB + WALL_HEIGHT * 0.8) continue;
      const steps = Math.max(2, Math.ceil(length / 0.25));
      let leaning = 0;
      let open = false;
      for (let i = 0; i < steps; i++) {
        const t = (i + 0.5) / steps;
        const x = side.a[0] + side.u[0] * t + side.n[0] * eps;
        const y = side.a[1] + side.u[1] * t + side.n[1] * eps;
        if (above.some((r) => strictly(r, x, y))) leaning++;
        else if (!rooms.some((r) => strictly(r, x, y))) open = true;
      }
      if (!open && leaning && (!best || leaning / steps > best.share)) best = { ...side, share: leaning / steps };
    }
    return best;
  }

  // Slopes of the roof on a rectangle whose walls stop at height z (see hipRoof()). A rectangle that
  // leans on a floor above gets a lean-to roof: half of a hip roof twice as deep, its ridge against
  // the wall above (a hip roof would leave a ledge along that wall).
  function roofSlopes(rect, z, lean) {
    if (!lean) return hipRoof(rect, z);
    const [nx, ny] = lean.n;
    const doubled = {
      x: rect.x + Math.min(0, nx) * rect.w,
      y: rect.y + Math.min(0, ny) * rect.h,
      w: rect.w * (1 + Math.abs(nx)),
      h: rect.h * (1 + Math.abs(ny)),
    };
    // Keep what lies on the rectangle's side of the wall line.
    const keep = (P) => -((P[0] - lean.a[0]) * nx + (P[1] - lean.a[1]) * ny);
    const out = [];
    for (const slope of hipRoof(doubled, z)) {
      const pts = [];
      slope.pts.forEach((P, i) => {
        const Q = slope.pts[(i + 1) % slope.pts.length];
        const kp = keep(P);
        const kq = keep(Q);
        if (kp >= -1e-9) pts.push(P);
        if ((kp > 1e-9 && kq < -1e-9) || (kp < -1e-9 && kq > 1e-9)) pts.push(add3(P, mul3(sub3(Q, P), kp / (kp - kq))));
      });
      if (pts.length >= 3) out.push({ ...slope, pts });
    }
    return out;
  }

  // Every roof slope of a floor whose walls stop at height z, under the floors above.
  const floorRoof = (rooms, above, z) => roofRects(rooms, above).flatMap((rect) => roofSlopes(rect, z, leanSide(rect, rooms, above)));

  // The 6 faces of a box centered on c, with half-extent vectors X, Y, Z. The +X face comes first.
  function boxFaces(c, X, Y, Z) {
    const p = (sx, sy, sz) => add3(add3(add3(c, mul3(X, sx)), mul3(Y, sy)), mul3(Z, sz));
    return [
      [p(1, -1, 1), mul3(Y, 2), mul3(Z, -2)],
      [p(-1, -1, 1), mul3(Y, 2), mul3(Z, -2)],
      [p(-1, -1, 1), mul3(X, 2), mul3(Y, 2)],
      [p(-1, 1, -1), mul3(X, 2), mul3(Y, -2)],
      [p(-1, -1, 1), mul3(X, 2), mul3(Z, -2)],
      [p(-1, 1, 1), mul3(X, 2), mul3(Z, -2)],
    ].map(([o, u, v]) => ({ pts: quad(o, u, v), n: norm3(cross3(u, v)), w: len3(u), h: len3(v) }));
  }

  // Do segments p1-p2 and q1-q2 (2D) cross?
  function segmentsCross(p1, p2, q1, q2) {
    const orient = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    return orient(p1, p2, q1) * orient(p1, p2, q2) < 0 && orient(q1, q2, p1) * orient(q1, q2, p2) < 0;
  }

  // --- Camera model ------------------------------------------------------------
  // A pinhole camera, with an optional lens distortion and a correction of the plan. Picture coordinates
  // are in picture widths: the picture is 1 wide and 1 / aspect high, (0, 0) at its top-left corner,
  // y downwards.
  //
  // Lens distortion (`distortion`, k): the division model, around the picture's center, in half
  // picture widths: a picture point d shows the undistorted (pinhole) point u = d / (1 + k |d|²), so
  // d = u · 2 / (1 + sqrt(1 - 4 k |u|²)). k < 0 is a barrel distortion (wide-angle lenses: straight
  // lines bulge out from the center; the whole field in front of the camera fits in a disk of radius
  // 1 / sqrt(-k), like a fisheye), k > 0 a pincushion one. One parameter, never folding back, and
  // both ways in closed form.
  //
  // Picture's horizontal scale (`x_scale`, sx): a stream scaled to another ratio than the sensor's (or
  // with non-square pixels) shows everything sx times wider: the distorted point's x is scaled by sx
  // around the picture's center.
  //
  // Correction of the plan (`stretch_x`, `stretch_y`, `stretch_z`, `shift_x`, `shift_y`): makes up
  // for a plan measured a little wrong (or a camera placed a little off on it), as this camera sees
  // it: the camera sees the plan's point P at base + (P - base) · stretch + shift, the base being the
  // middle of its floor's indoor rooms, on the floor (the camera itself doesn't move). Only its
  // picture (projection, editor) follows it.
  //
  // Pinned corners (`pins`, see readPins()): world points pinned on the picture in the editor. The
  // model above never fits them exactly (a plan measured a little wrong, a lens it doesn't describe):
  // on top of it, the picture is warped so that each one falls exactly where it was pinned. The
  // offsets from where the model puts them to their pins are interpolated smoothly over the picture
  // (see pinWarp()); the model alone still says what lies behind what (the shadow maps).

  function cameraHeight(cam, wallHeight) {
    return cam.height !== null && cam.height !== undefined ? cam.height : Math.min(CAMERA_HEIGHT, wallHeight - 0.3);
  }

  // Camera standing at C (world), on a floor at height z0: the picture's x follows `right`, its y
  // follows -`up`, and `f` is the focal length in picture widths. `cam` needs dx, dy (plan direction),
  // tilt and fov; `distortion`, `correction` (values of CORRECTION_KEYS) and its base (`center`,
  // [x, y]), and `pins` (see readPins()) are optional.
  function cameraPose(cam, C, z0 = 0) {
    const t = toRad(cam.tilt);
    const fwd = [cam.dx * Math.cos(t), cam.dy * Math.cos(t), -Math.sin(t)];
    const right = [-cam.dy, cam.dx, 0];
    return {
      C,
      fwd,
      right,
      up: cross3(fwd, right),
      f: 0.5 / Math.tan(toRad(cam.fov) / 2),
      k: cam.distortion || 0,
      sx: cam.xScale || 1,
      base: [...(cam.center || C.slice(0, 2)), z0],
      stretch: (cam.correction || CORRECTION_NONE).slice(0, 3),
      shift: [...(cam.correction || CORRECTION_NONE).slice(3, 5), 0],
      pins: cam.pins || [], // their points are on the floor's plan: z0 lifts them to it
      z0,
    };
  }

  const poseOf = (direction, tilt, fov, C, more = {}) =>
    cameraPose({ dx: Math.sin(toRad(direction)), dy: -Math.cos(toRad(direction)), tilt, fov, ...more }, C);

  // A plan's point as the camera sees it (see the correction above), and back.
  const stretched = (pose, P) => P.map((v, i) => pose.base[i] + (v - pose.base[i]) * pose.stretch[i] + pose.shift[i]);
  const unstretched = (pose, P) => P.map((v, i) => pose.base[i] + (v - pose.shift[i] - pose.base[i]) / pose.stretch[i]);

  // Where a world point shows in the picture, or null when it is behind the camera (or out of the
  // field of a pincushion lens).
  function toPicture(pose, P, aspect) {
    const uv = modelPicture(pose, P, aspect);
    const warp = uv && pinWarp(pose, aspect);
    return warp ? warpPoint(warp, uv) : uv;
  }

  // toPicture() by the model alone, without the warp of the pinned corners.
  function modelPicture(pose, P, aspect) {
    const d = sub3(stretched(pose, P), pose.C);
    const z = dot3(d, pose.fwd);
    if (z < 1e-3) return null;
    // Undistorted point, in half picture widths from the center (y up).
    const ux = (2 * pose.f * dot3(d, pose.right)) / z;
    const uy = (2 * pose.f * dot3(d, pose.up)) / z;
    const s = 1 - 4 * pose.k * (ux * ux + uy * uy);
    if (s < 0) return null;
    const g = 2 / (1 + Math.sqrt(s));
    return [0.5 + 0.5 * ux * g * pose.sx, 0.5 / aspect - 0.5 * uy * g];
  }

  // Thin-plate spline kernel: r² log r, from r².
  const tps = (r2) => (r2 > 1e-12 ? 0.5 * r2 * Math.log(r2) : 0);

  // Warp of the picture that brings each pinned corner of the pose from where the model shows it to
  // its pin, in picture widths: the offset at a model point p is a0 + ax p.x + ay p.y + Σ w_i tps(|p - pts_i|²).
  // One pin shifts the picture, two move it as a similarity (shift, turn, scale), from three on a
  // thin-plate spline bends it as little as possible between them. Null without pins. Cached per
  // pose and aspect.
  function pinWarp(pose, aspect) {
    if (!pose.pins || !pose.pins.length) return null;
    if (pose.warpCache && pose.warpCache.aspect === aspect) return pose.warpCache.warp;
    const m = [];
    const d = [];
    for (const pin of pose.pins) {
      const uv = modelPicture(pose, add3(pin.P, [0, 0, pose.z0]), aspect);
      if (!uv) continue;
      m.push(uv);
      d.push([pin.u - uv[0], pin.v / aspect - uv[1]]);
    }
    const warp = fitWarp(m, d);
    pose.warpCache = { aspect, warp };
    return warp;
  }

  function fitWarp(m, d) {
    const n = m.length;
    const none = [0, 0];
    if (!n) return null;
    const shift = { pts: [], w: [], a0: d.reduce((s, v) => [s[0] + v[0] / n, s[1] + v[1] / n], [0, 0]), ax: none, ay: none };
    // Similarity bringing m[i] to m[i] + d[i] and m[j] to m[j] + d[j] (complex numbers: z -> α z + β).
    const similarity = (i, j) => {
      const [ax, ay] = [m[j][0] - m[i][0], m[j][1] - m[i][1]];
      const [bx, by] = [ax + d[j][0] - d[i][0], ay + d[j][1] - d[i][1]];
      const den = ax * ax + ay * ay;
      if (den < 1e-8) return shift;
      const re = (bx * ax + by * ay) / den;
      const im = (by * ax - bx * ay) / den;
      // Offset: (α - 1) p + β, with β = m[i] + d[i] - α m[i].
      const t = [m[i][0] + d[i][0] - (re * m[i][0] - im * m[i][1]), m[i][1] + d[i][1] - (im * m[i][0] + re * m[i][1])];
      return { pts: [], w: [], a0: t, ax: [re - 1, im], ay: [-im, re - 1] };
    };
    if (n === 1) return shift;
    if (n === 2) return similarity(0, 1);
    // Thin-plate spline: [K P; Pᵀ 0] [w; c] = [d; 0], for each coordinate.
    const size = n + 3;
    const A = [];
    for (let i = 0; i < size; i++) {
      const row = new Array(size).fill(0);
      if (i < n) {
        for (let j = 0; j < n; j++) row[j] = tps((m[i][0] - m[j][0]) ** 2 + (m[i][1] - m[j][1]) ** 2);
        row[n] = 1;
        row[n + 1] = m[i][0];
        row[n + 2] = m[i][1];
      } else {
        for (let j = 0; j < n; j++) row[j] = i === n ? 1 : m[j][i - n - 1];
      }
      A.push(row);
    }
    const sx = solveLinear(A, [...d.map((v) => v[0]), 0, 0, 0]);
    const sy = solveLinear(A, [...d.map((v) => v[1]), 0, 0, 0]);
    if (!sx || !sy) {
      // Pins in a line: the similarity of the two farthest apart.
      let best = [0, 1];
      let far = -1;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const dist = (m[i][0] - m[j][0]) ** 2 + (m[i][1] - m[j][1]) ** 2;
        if (dist > far) [far, best] = [dist, [i, j]];
      }
      return similarity(...best);
    }
    return {
      pts: m,
      w: m.map((_, i) => [sx[i], sy[i]]),
      a0: [sx[n], sy[n]],
      ax: [sx[n + 1], sy[n + 1]],
      ay: [sx[n + 2], sy[n + 2]],
    };
  }

  function warpPoint(warp, p) {
    let x = p[0] + warp.a0[0] + warp.ax[0] * p[0] + warp.ay[0] * p[1];
    let y = p[1] + warp.a0[1] + warp.ax[1] * p[0] + warp.ay[1] * p[1];
    warp.pts.forEach((q, i) => {
      const k = tps((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2);
      x += warp.w[i][0] * k;
      y += warp.w[i][1] * k;
    });
    return [x, y];
  }

  // Direction (world, not normalized) of the line of sight through the picture point `uv`.
  function fromPicture(pose, uv, aspect) {
    const dx = (2 * (uv[0] - 0.5)) / pose.sx;
    const dy = 2 * (0.5 / aspect - uv[1]);
    const g = 1 / Math.max(0.05, 1 + pose.k * (dx * dx + dy * dy));
    return add3(add3(pose.fwd, mul3(pose.right, (dx * g) / (2 * pose.f))), mul3(pose.up, (dy * g) / (2 * pose.f)));
  }

  // How much wider than the picture (undistorted, in each direction) the field of a camera with a
  // barrel distortion, or a picture squeezed horizontally (sx < 1), is: the shadow map must cover all
  // of it. Capped for fisheye-like lenses.
  const shadowScale = (proj) => Math.min(4, fieldScale(proj.k, proj.aspect) * Math.max(1, 1 / (proj.sx || 1)));

  function fieldScale(k, aspect) {
    if (k >= 0) return 1;
    let m = 1;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      // Points along the picture's edges (half widths): its right edge, then its bottom edge.
      for (const [x, y] of [[1, t / aspect], [t, 1 / aspect]]) {
        const den = 1 + k * (x * x + y * y);
        if (den <= 0.25) return 4;
        m = Math.max(m, x / den, (y / den) * aspect);
      }
    }
    return Math.min(4, m * 1.02);
  }

  // --- WebGL renderer ------------------------------------------------------------
  // The scene is a few hundred triangles in meshes, rebuilt for each frame. A depth buffer sorts
  // them; only the transparent meshes (inner walls, beams) are sorted, back to front.

  // How a mesh's fragments are colored. Vertices carry a color and 4 numbers (`uv`) used by the mode.
  const MODE = {
    flat: 0, // the color
    glow: 1, // the color, fading out from uv (0, 0) to a distance of 1
    texture: 2, // the color times the texture at uv
    stripes: 3, // the color, darkened by uv.w where fract(uv.y) > uv.z
    lens: 4, // a camera lens drawn over the color, centered on uv (0, 0)
    picture: 5, // the camera picture that `proj` casts onto the mesh
  };

  const GL_VERTEX = `
attribute vec3 aPos;
attribute vec4 aColor;
attribute vec4 aUV;
uniform mat4 uView;
varying vec3 vPos;
varying vec4 vColor;
varying vec4 vUV;
void main() {
  vPos = aPos;
  vColor = aColor;
  vUV = aUV;
  gl_Position = uView * vec4(aPos, 1.0);
}`;

  const GL_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform int uMode;
uniform sampler2D uTex;
uniform vec3 uC;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform float uF;
uniform float uAspect;
uniform float uReach;
uniform float uK;
uniform vec3 uBase;
uniform vec3 uStretch;
uniform vec3 uShift;
uniform sampler2D uShadow;
uniform int uShadowOn;
uniform float uShadowScale;
uniform float uXScale;
uniform int uWarpN;
uniform vec2 uWarpP[${MAX_PINS}];
uniform vec2 uWarpW[${MAX_PINS}];
uniform vec2 uWarpA0;
uniform vec2 uWarpAx;
uniform vec2 uWarpAy;
varying vec3 vPos;
varying vec4 vColor;
varying vec4 vUV;
void main() {
  vec4 c = vColor;
  if (uMode == 1) {
    c.a *= max(0.0, 1.0 - length(vUV.xy));
  } else if (uMode == 2) {
    c *= texture2D(uTex, vUV.xy);
  } else if (uMode == 3) {
    if (fract(vUV.y) > vUV.z) c.rgb *= vUV.w;
  } else if (uMode == 4) {
    float d = length(vUV.xy);
    if (d < 0.2) c.rgb = vec3(0.62, 0.85, 1.0);
    else if (d < 0.44) c.rgb = vec3(0.063, 0.086, 0.11);
  } else if (uMode == 5) {
    // Same as toPicture(): the corrected point, undistorted (u) then distorted (q) in half picture
    // widths, then in texture coordinates (p, from the top-left corner).
    vec3 d = uBase + (vPos - uBase) * uStretch + uShift - uC;
    float z = dot(d, uFwd);
    if (z < 0.001) discard;
    vec2 u = vec2(dot(d, uRight), dot(d, uUp)) * (2.0 * uF / z);
    float s = 1.0 - 4.0 * uK * dot(u, u);
    if (s < 0.0) discard;
    vec2 q = u * (2.0 / (1.0 + sqrt(s)));
    // Then the warp of the pinned corners (see warpPoint()), in picture widths.
    vec2 w = vec2(0.5 + 0.5 * q.x * uXScale, 0.5 / uAspect - 0.5 * q.y);
    vec2 dw = uWarpA0 + uWarpAx * w.x + uWarpAy * w.y;
    for (int i = 0; i < ${MAX_PINS}; i++) {
      if (i >= uWarpN) break;
      vec2 e = w - uWarpP[i];
      float r2 = dot(e, e);
      if (r2 > 1e-12) dw += uWarpW[i] * (0.5 * r2 * log(r2));
    }
    w += dw;
    vec2 p = vec2(w.x, w.y * uAspect);
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) discard;
    // Hidden from the camera by something nearer to it (see GL_DEPTH_FRAGMENT). The shadow map is
    // undistorted, and as much wider than the picture as its distortion needs (uShadowScale).
    if (uShadowOn == 1) {
      vec2 sp = 0.5 + 0.5 * vec2(u.x, u.y * uAspect) / uShadowScale;
      float near = dot(texture2D(uShadow, sp), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)) * uReach;
      if (z > near + 0.08 + 0.01 * z) discard;
    }
    c *= texture2D(uTex, p);
    c.a *= 0.92 * clamp((uReach - z) / (0.3 * uReach), 0.0, 1.0);
  }
  if (c.a < 0.004) discard;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

  // Shadow maps: the distance from a camera to the nearest surface it sees (in its reach, packed
  // into the 4 bytes of a color), for each point of its picture.
  const GL_DEPTH_VERTEX = `
attribute vec3 aPos;
uniform mat4 uView;
uniform vec3 uBase;
uniform vec3 uStretch;
uniform vec3 uShift;
varying vec3 vPos;
void main() {
  vPos = uBase + (aPos - uBase) * uStretch + uShift;
  gl_Position = uView * vec4(vPos, 1.0);
}`;

  const GL_DEPTH_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec3 uC;
uniform vec3 uFwd;
uniform float uReach;
varying vec3 vPos;
void main() {
  float v = clamp(dot(vPos - uC, uFwd) / uReach, 0.0, 0.999999);
  vec4 e = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
  gl_FragColor = e - e.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
}`;

  const SHADOW_PX = 1024; // width of a shadow map

  // Matrix (column-major) from world to clip coordinates for a camera's picture (`proj`, undistorted
  // and widened by its fieldScale()), with depths from 30 cm (the wall a camera is mounted on doesn't
  // hide what it films) to its reach: the shadow map's x follows the picture's, its y is upside down
  // (rows of a WebGL texture go up).
  function pictureMatrix(proj) {
    const { C, fwd, right, up, aspect, reach } = proj;
    const f = proj.f / shadowScale(proj);
    const near = 0.3;
    const A = (reach + near) / (reach - near);
    const B = (-2 * reach * near) / (reach - near);
    const form = (v, k) => [...mul3(v, k), -dot3(C, v) * k];
    const depth = form(fwd, 1);
    const rows = [form(right, 2 * f), form(up, 2 * f * aspect), depth.map((v, i) => A * v + (i === 3 ? B : 0)), depth];
    const m = new Float32Array(16);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) m[c * 4 + r] = rows[r][c];
    return m;
  }

  const GL_FLOATS = 11; // per vertex: position (3), color (4), uv (4)
  const UV_NONE = [0, 0, 0, 0];

  // Triangles drawn together. `opts`: `transparent` (sorted, doesn't hide what is behind it),
  // `tex` ({ key, source }: the texture, made from the canvas or image `source()` returns, once per key)
  // and `proj` (for MODE.picture: the camera pose, picture aspect and reach; with `shadow`, a `key`
  // naming the camera, and what the occluders hide from it is left out). Overlays are drawn
  // right after it, on top of it (they lie in its plane).
  class Mesh {
    constructor(mode = MODE.flat, opts = {}) {
      this.mode = mode;
      this.data = [];
      this.overlays = [];
      Object.assign(this, opts);
    }

    // A convex polygon (a fan of triangles). `color`: one RGBA color, or one per corner; `uvs`: one per corner.
    poly(pts, color, uvs = null) {
      const each = Array.isArray(color[0]);
      for (let i = 1; i + 1 < pts.length; i++) {
        for (const j of [0, i, i + 1]) {
          const p = pts[j];
          const c = each ? color[j] : color;
          const uv = uvs ? uvs[j] : UV_NONE;
          this.data.push(p[0], p[1], p[2], c[0], c[1], c[2], c[3], uv[0], uv[1], uv[2], uv[3]);
        }
      }
      return this;
    }

    overlay(mesh) {
      if (mesh.data.length) this.overlays.push(mesh);
      return mesh;
    }

    center() {
      const c = [0, 0, 0];
      const n = this.data.length / GL_FLOATS;
      for (let i = 0; i < this.data.length; i += GL_FLOATS) for (let k = 0; k < 3; k++) c[k] += this.data[i + k] / n;
      return c;
    }
  }

  // Matrix (column-major) from world to clip coordinates for a point of view: the same projection as
  // _project(), with depths from `near` to `far` (px from the viewer).
  function viewMatrix(orbit, vp, near, far) {
    const a = toRad(orbit.az);
    const t = toRad(orbit.tilt);
    const [ca, sa, ct, st] = [Math.cos(a), Math.sin(a), Math.cos(t), Math.sin(t)];
    const [tx, ty, tz] = orbit.target;
    // Linear forms [x, y, z, 1] of the view's axes (px): across, down the view, and depth.
    const x1 = [U3 * ca, -U3 * sa, 0, -U3 * (ca * tx - sa * ty)];
    const y1 = [U3 * sa, U3 * ca, 0, -U3 * (sa * tx + ca * ty)];
    const z1 = [0, 0, U3, -U3 * tz];
    const down = x1.map((_, i) => ct * y1[i] - st * z1[i]);
    const depth = x1.map((_, i) => (i === 3 ? orbit.dist : 0) - st * y1[i] - ct * z1[i]);
    const A = (far + near) / (far - near);
    const B = (-2 * far * near) / (far - near);
    const rows = [
      x1.map((v) => (v * 2 * vp.p) / vp.w),
      down.map((v) => (-v * 2 * vp.p) / vp.h),
      depth.map((v, i) => A * v + (i === 3 ? B : 0)),
      depth,
    ];
    const m = new Float32Array(16);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) m[c * 4 + r] = rows[r][c];
    return m;
  }

  // The WebGL context of a canvas, its shader and the textures of the scene.
  class GlScene {
    constructor(canvas, onRestored) {
      this.canvas = canvas;
      this.textures = new Map(); // key -> { tex, frame }
      this.shadows = new Map(); // camera key -> { fb, tex, rb, w, h, frame }
      this.frame = 0;
      this.lost = false;
      canvas.addEventListener('webglcontextlost', (ev) => {
        ev.preventDefault();
        this.lost = true;
        this.textures.clear();
        this.shadows.clear();
      });
      canvas.addEventListener('webglcontextrestored', () => {
        this.lost = false;
        this._init();
        onRestored();
      });
      this._init();
    }

    get ok() {
      return !!this.gl && !this.lost;
    }

    _init() {
      const opts = { alpha: true, antialias: true, premultipliedAlpha: true, depth: true };
      const gl = this.canvas.getContext('webgl', opts) || this.canvas.getContext('experimental-webgl', opts);
      this.gl = gl;
      if (!gl) return;
      const shader = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      // Both programs read the same vertices: their attributes get the same locations.
      const attributes = [['aPos', 3, 0], ['aColor', 4, 3], ['aUV', 4, 7]];
      const program = (vertex, fragment, uniforms) => {
        const prog = gl.createProgram();
        gl.attachShader(prog, shader(gl.VERTEX_SHADER, vertex));
        gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fragment));
        attributes.forEach(([name], loc) => gl.bindAttribLocation(prog, loc, name));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(prog));
        const u = { prog };
        for (const name of uniforms) u[name] = gl.getUniformLocation(prog, name);
        return u;
      };
      this.depth = program(GL_DEPTH_VERTEX, GL_DEPTH_FRAGMENT, ['uView', 'uC', 'uFwd', 'uReach', 'uBase', 'uStretch', 'uShift']);
      this.u = program(GL_VERTEX, GL_FRAGMENT, [
        'uView', 'uMode', 'uTex', 'uC', 'uFwd', 'uRight', 'uUp', 'uF', 'uAspect', 'uReach', 'uK', 'uBase', 'uStretch', 'uShift', 'uShadow', 'uShadowOn', 'uShadowScale',
        'uXScale', 'uWarpN', 'uWarpP', 'uWarpW', 'uWarpA0', 'uWarpAx', 'uWarpAy',
      ]);
      gl.useProgram(this.u.prog);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      const stride = GL_FLOATS * 4;
      attributes.forEach(([, size, offset], loc) => {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
      });
      gl.uniform1i(this.u.uTex, 0);
      gl.uniform1i(this.u.uShadow, 1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.polygonOffset(-1, -2);
      this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
      this.anisoMax = this.aniso ? Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 1;
    }

    // The texture of `spec` ({ key, source }), made once per key; null when it can't be made.
    // It is resized to powers of 2 for mipmaps: without them, pictures seen far away or at a grazing
    // angle (the lawn) shimmer.
    _texture(spec) {
      let t = this.textures.get(spec.key);
      if (!t) {
        const src = spec.source();
        if (!src) return null;
        const gl = this.gl;
        const pot = (n) => clamp(2 ** Math.round(Math.log2(n)), 1, 2048);
        const [c, ctx] = canvas2d(pot(src.width || src.naturalWidth), pot(src.height || src.naturalHeight));
        ctx.drawImage(src, 0, 0, c.width, c.height);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, this.anisoMax);
          t = { tex };
        } catch (err) {
          // A picture from another origin without CORS headers can't be used.
          gl.deleteTexture(tex);
          t = { tex: null };
        }
        this.textures.set(spec.key, t);
      }
      t.frame = this.frame;
      return t.tex;
    }

    // The shadow map of a camera (`proj`), drawn from the occluders' vertices (`first`, `count`
    // in the buffer); null when it can't be made.
    _shadow(proj, first, count) {
      const gl = this.gl;
      const w = SHADOW_PX;
      const h = Math.max(1, Math.round(SHADOW_PX / proj.aspect));
      let sm = this.shadows.get(proj.key);
      if (sm && (sm.w !== w || sm.h !== h)) {
        this._freeShadow(sm);
        sm = null;
      }
      if (!sm) {
        sm = { w, h, fb: gl.createFramebuffer(), tex: gl.createTexture(), rb: gl.createRenderbuffer() };
        gl.bindTexture(gl.TEXTURE_2D, sm.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // Packed distances can't be blended: no filtering.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindRenderbuffer(gl.RENDERBUFFER, sm.rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, sm.fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sm.tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sm.rb);
        sm.ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        this.shadows.set(proj.key, sm);
      }
      sm.frame = this.frame;
      if (!sm.ok) return null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, sm.fb);
      gl.viewport(0, 0, w, h);
      gl.clearColor(1, 1, 1, 1); // farther than anything
      gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.depth.prog);
      gl.uniformMatrix4fv(this.depth.uView, false, pictureMatrix(proj));
      gl.uniform3fv(this.depth.uC, proj.C);
      gl.uniform3fv(this.depth.uFwd, proj.fwd);
      gl.uniform1f(this.depth.uReach, proj.reach);
      gl.uniform3fv(this.depth.uBase, proj.base);
      gl.uniform3fv(this.depth.uStretch, proj.stretch);
      gl.uniform3fv(this.depth.uShift, proj.shift);
      gl.disable(gl.BLEND);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.drawArrays(gl.TRIANGLES, first, count);
      gl.enable(gl.BLEND);
      gl.useProgram(this.u.prog);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return sm.tex;
    }

    _freeShadow(sm) {
      const gl = this.gl;
      gl.deleteFramebuffer(sm.fb);
      gl.deleteTexture(sm.tex);
      gl.deleteRenderbuffer(sm.rb);
    }

    // Draws `meshes` (opaque ones in their order, then the transparent ones from the farthest from
    // `eye`) on a canvas of `w` x `h` CSS px, with the `view` matrix. `occluders` (a mesh) hide
    // from the cameras the parts of the scene their pictures don't reach.
    draw(meshes, view, w, h, eye, occluders = null) {
      const gl = this.gl;
      this.frame++;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const cw = Math.max(1, Math.round(w * dpr));
      const ch = Math.max(1, Math.round(h * dpr));
      if (this.canvas.width !== cw || this.canvas.height !== ch) {
        this.canvas.width = cw;
        this.canvas.height = ch;
      }
      const opaque = meshes.filter((m) => !m.transparent);
      const far = meshes
        .filter((m) => m.transparent)
        .map((m) => ({ m, d: len3(sub3(m.center(), eye)) }))
        .sort((a, b) => b.d - a.d)
        .map((x) => x.m);
      const list = [];
      for (const m of [...opaque, ...far]) {
        list.push({ m, over: false });
        for (const o of m.overlays) list.push({ m: o, over: true, transparent: m.transparent });
      }
      const occ = { m: occluders || new Mesh() };
      let total = occ.m.data.length;
      for (const x of list) total += x.m.data.length;
      const data = new Float32Array(total);
      let at = 0;
      for (const x of [...list, occ]) {
        x.first = at / GL_FLOATS;
        x.count = x.m.data.length / GL_FLOATS;
        data.set(x.m.data, at);
        at += x.m.data.length;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      // Shadow maps first: they use the framebuffer.
      const shadows = new Map();
      for (const x of list) {
        const p = x.m.proj;
        if (p && p.shadow && occ.count && !shadows.has(p.key)) shadows.set(p.key, this._shadow(p, occ.first, occ.count));
      }

      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(this.u.uView, false, view);

      for (const x of list) {
        const m = x.m;
        if (!x.count) continue;
        if (m.tex) {
          const tex = this._texture(m.tex);
          if (!tex) continue;
          gl.bindTexture(gl.TEXTURE_2D, tex);
        }
        if (m.proj) {
          const p = m.proj;
          gl.uniform3fv(this.u.uC, p.C);
          gl.uniform3fv(this.u.uFwd, p.fwd);
          gl.uniform3fv(this.u.uRight, p.right);
          gl.uniform3fv(this.u.uUp, p.up);
          gl.uniform1f(this.u.uF, p.f);
          gl.uniform1f(this.u.uAspect, p.aspect);
          gl.uniform1f(this.u.uReach, p.reach);
          gl.uniform1f(this.u.uK, p.k);
          gl.uniform3fv(this.u.uBase, p.base);
          gl.uniform3fv(this.u.uStretch, p.stretch);
          gl.uniform3fv(this.u.uShift, p.shift);
          gl.uniform1f(this.u.uShadowScale, shadowScale(p));
          gl.uniform1f(this.u.uXScale, p.sx || 1);
          const warp = p.warp || { pts: [], w: [], a0: [0, 0], ax: [0, 0], ay: [0, 0] };
          const flat = (list) => {
            const a = new Float32Array(2 * MAX_PINS);
            list.slice(0, MAX_PINS).forEach((v, i) => a.set(v, 2 * i));
            return a;
          };
          gl.uniform1i(this.u.uWarpN, Math.min(MAX_PINS, warp.pts.length));
          gl.uniform2fv(this.u.uWarpP, flat(warp.pts));
          gl.uniform2fv(this.u.uWarpW, flat(warp.w));
          gl.uniform2fv(this.u.uWarpA0, warp.a0);
          gl.uniform2fv(this.u.uWarpAx, warp.ax);
          gl.uniform2fv(this.u.uWarpAy, warp.ay);
          const shadow = p.shadow ? shadows.get(p.key) : null;
          gl.uniform1i(this.u.uShadowOn, shadow ? 1 : 0);
          if (shadow) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, shadow);
            gl.activeTexture(gl.TEXTURE0);
          }
        }
        gl.uniform1i(this.u.uMode, m.mode);
        // Overlays and transparent meshes don't hide what is drawn after them.
        gl.depthMask(!x.over && !m.transparent);
        if (x.over) gl.enable(gl.POLYGON_OFFSET_FILL);
        else gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.drawArrays(gl.TRIANGLES, x.first, x.count);
      }

      // Textures not used by this frame (an old snapshot, a label no longer shown) are freed.
      for (const [key, t] of this.textures) {
        if (t.frame !== this.frame) {
          if (t.tex) gl.deleteTexture(t.tex);
          this.textures.delete(key);
        }
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.activeTexture(gl.TEXTURE0);
      for (const [key, sm] of this.shadows) {
        if (sm.frame !== this.frame) {
          this._freeShadow(sm);
          this.shadows.delete(key);
        }
      }
    }

    // Frees the context right away (browsers only keep a few of them).
    destroy() {
      if (!this.gl) return;
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      this.gl = null;
      this.textures.clear();
      this.shadows.clear();
    }
  }

  // A canvas of `w` x `h` px and its 2D context, for textures.
  function canvas2d(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return [c, c.getContext('2d')];
  }

  // An image scaled down to `maxWidth` px at most, as a canvas.
  function scaledPicture(img, maxWidth) {
    const k = Math.min(1, maxWidth / img.naturalWidth);
    const [c, ctx] = canvas2d(img.naturalWidth * k, img.naturalHeight * k);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  // Text cut with an ellipsis to fit `maxWidth` px in a 2D context.
  function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (ctx.measureText(`${text.slice(0, mid)}…`).width <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return `${text.slice(0, lo)}…`;
  }

  // Draws an icon (an SVG path in a 24 x 24 box) of `size` px at (x, y).
  function drawIcon(ctx, path, x, y, size) {
    if (!path) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.fill(new Path2D(path));
    ctx.restore();
  }

  // A CSS color as RGBA (0-1).
  let colorProbe = null;
  function parseColor(value, fallback = [0, 0, 0, 1]) {
    colorProbe = colorProbe || canvas2d(1, 1)[1];
    colorProbe.fillStyle = '#000';
    colorProbe.fillStyle = (value || '').trim() || '#000';
    const s = colorProbe.fillStyle;
    if (s[0] === '#') return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255).concat(1);
    const m = s.match(/[\d.]+/g);
    if (!m || m.length < 3) return fallback;
    return [m[0] / 255, m[1] / 255, m[2] / 255, m.length > 3 ? +m[3] : 1];
  }

  // CSS matrix3d() placing an element of `w` x `h` px onto the quadrilateral `q` (4 points, px, in the
  // order of its corners from the top-left one, clockwise).
  function rectToQuad(w, h, q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2;
    const dx2 = x3 - x2;
    const dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2;
    const dy2 = y3 - y2;
    const dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = den ? (dx3 * dy2 - dx2 * dy3) / den : 0;
    const hh = den ? (dx1 * dy3 - dx3 * dy1) / den : 0;
    const a = (x1 - x0 + g * x1) / w;
    const b = (x3 - x0 + hh * x3) / h;
    const d = (y1 - y0 + g * y1) / w;
    const e = (y3 - y0 + hh * y3) / h;
    const n = (v) => +v.toPrecision(8);
    return `matrix3d(${n(a)},${n(d)},0,${n(g / w)},${n(b)},${n(e)},0,${n(hh / h)},0,0,1,0,${n(x0)},${n(y0)},0,1)`;
  }

  // Solves A x = b (Gaussian elimination), or null when A is singular.
  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-14) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const k = M[r][c] / M[c][c];
        for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  }

  // Settings of a camera standing at (x, y) that best show each world point `P` at `uv` (picture),
  // with weight `w` (default 1): Levenberg-Marquardt least squares from `start`, the settings
  // [direction, tilt, fov, height, distortion, ...the plan's correction, x_scale]. Only the settings whose indexes are
  // in `free` change. A slight pull towards `start` keeps the camera's angles and height steady where
  // the points leave them undetermined; the lens distortion, the plan's correction and the picture's
  // horizontal scale are pulled towards none, so that a few points can't bend or stretch the picture
  // wildly.
  // `rms` is the remaining error of the points, in picture widths.
  const SOLVE_LO = [-Infinity, -45, 20, 0.1, DISTORTION_RANGE[0], ...CORRECTION_LO, X_SCALE_RANGE[0]];
  const SOLVE_HI = [Infinity, 89, 170, 10, DISTORTION_RANGE[1], ...CORRECTION_HI, X_SCALE_RANGE[1]];
  const SOLVE_PULL = [1e-4, 1e-4, 1e-4, 1e-3, 0.01, 0.05, 0.05, 0.05, 0.01, 0.01, 0.05]; // per degree, per unit
  const SOLVE_REST = [null, null, null, null, 0, ...CORRECTION_NONE, 1]; // what each setting is pulled to (null: its start)
  const SOLVE_STEP = [1e-3, 1e-3, 1e-3, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4]; // for the derivatives

  const solvedPose = (q, x, y, center) =>
    poseOf(q[0], q[1], q[2], [x, y, q[3]], { distortion: q[4], correction: q.slice(5, 10), xScale: q[10], center });

  // `center`: the base of the plan's correction (see cameraPose()).
  function solveCamera(start, x, y, center, pairs, aspect, free = [0, 1, 2, 3]) {
    const full = (p) => {
      const q = [...start];
      free.forEach((j, k) => (q[j] = p[k]));
      return q;
    };
    const errors = (q) => {
      const pose = solvedPose(q, x, y, center);
      return pairs.flatMap(({ P, uv, w = 1 }) => {
        const s = toPicture(pose, P, aspect);
        return s ? [(s[0] - uv[0]) * w, (s[1] - uv[1]) * w] : [3 * w, 3 * w];
      });
    };
    const rest = (j) => (SOLVE_REST[j] === null ? start[j] : SOLVE_REST[j]);
    const residuals = (p) => [...errors(full(p)), ...free.map((j, k) => (p[k] - rest(j)) * SOLVE_PULL[j])];
    const cost = (r) => r.reduce((sum, v) => sum + v * v, 0);
    let p = free.map((j) => clamp(start[j], SOLVE_LO[j], SOLVE_HI[j]));
    let r = residuals(p);
    let c = cost(r);
    let lambda = 1e-3;
    for (let iter = 0; iter < 100 && c > 1e-14; iter++) {
      // J[k][i]: derivative of residual i by free parameter k.
      const J = p.map((_, k) => {
        const h = SOLVE_STEP[free[k]];
        const rp = residuals(p.map((v, l) => (l === k ? v + h : v)));
        const rm = residuals(p.map((v, l) => (l === k ? v - h : v)));
        return rp.map((v, i) => (v - rm[i]) / (2 * h));
      });
      const A = J.map((Jk) => J.map((Jl) => Jk.reduce((sum, v, i) => sum + v * Jl[i], 0)));
      const g = J.map((Jk) => -Jk.reduce((sum, v, i) => sum + v * r[i], 0));
      let next = null;
      while (lambda < 1e10) {
        const step = solveLinear(A.map((row, k) => row.map((v, l) => (k === l ? v + lambda * (v || 1e-9) : v))), g);
        if (step) {
          const pn = p.map((v, k) => clamp(v + step[k], SOLVE_LO[free[k]], SOLVE_HI[free[k]]));
          const rn = residuals(pn);
          if (cost(rn) < c) {
            next = { p: pn, r: rn };
            break;
          }
        }
        lambda *= 4;
      }
      if (!next) break;
      const gain = c - cost(next.r);
      ({ p, r } = next);
      c = cost(r);
      lambda = Math.max(lambda / 3, 1e-12);
      if (gain < 1e-16) break;
    }
    const q = full(p);
    const e = errors(q).map((v, i) => v / (pairs[i >> 1].w || 1));
    return { q: [((q[0] % 360) + 360) % 360, ...q.slice(1)], rms: Math.sqrt(cost(e) / pairs.length) };
  }

  // Corners of rooms to line the camera's picture up with: floor corners, and the tops of the walls
  // indoors. Rooms sharing a corner give it once. With `outline` (an outdoor camera), only the corners
  // where the outline of the indoor rooms turns, the ones seen from outside.
  function planCorners(rooms, wallHeight, outline = false) {
    const indoor = rooms.filter((r) => !r.outdoor);
    const turns = (x, y) => {
      const inside = [[-1, -1], [1, -1], [1, 1], [-1, 1]].filter(([sx, sy]) => indoor.some((r) => roomContains(r, x + sx * 0.05, y + sy * 0.05, 0))).length;
      return inside === 1 || inside === 3;
    };
    const corners = new Map();
    for (const r of rooms) {
      for (const [x, y] of [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]) {
        if (outline && !r.outdoor && !turns(x, y)) continue;
        for (const z of r.outdoor ? [0] : [0, wallHeight]) {
          const P = [round2(x), round2(y), round2(z)];
          corners.set(pointKey(P), P);
        }
      }
    }
    return [...corners].map(([key, P]) => ({ key, P }));
  }

  // Lines of a floor's rooms, as seen by its cameras: floor outlines, and the corners and tops of the
  // walls. A room drawn as several zones has no line between them.
  function planLines(rooms, wallHeight) {
    const lines = [];
    const corners = new Set(planCorners(rooms, 0, true).map((c) => c.key));
    for (const r of rooms) {
      for (const e of r.zones ? zoneEdges(r) : roomEdges(r)) {
        const [p, q] = e.o === 'h' ? [[e.a, e.at], [e.b, e.at]] : [[e.at, e.a], [e.at, e.b]];
        lines.push({ P: [...p, 0], Q: [...q, 0], outdoor: r.outdoor });
        if (r.outdoor) continue;
        lines.push({ P: [...p, wallHeight], Q: [...q, wallHeight] });
        for (const c of [p, q]) {
          const key = `${round2(c[0])},${round2(c[1])},0`;
          if (!corners.has(key)) continue;
          corners.delete(key); // once
          lines.push({ P: [...c, 0], Q: [...c, wallHeight] });
        }
      }
    }
    return lines;
  }

  // Lines of a floor as an outdoor camera standing at C sees them: the outer walls facing it (outward
  // normal towards it, as for its projection), their foot, top and ends; and the outlines of the
  // outdoor rooms, on the ground.
  function facingLines(rooms, wallHeight, C) {
    const lines = [];
    for (const seg of wallSegments(rooms.filter((r) => !r.outdoor))) {
      const k = seg.o === 'h' ? 1 : 0;
      if (!seg.normal || (C[k] - seg.at) * seg.normal[k] <= 0.05) continue;
      const at = (t, z) => (seg.o === 'h' ? [t, seg.at, z] : [seg.at, t, z]);
      lines.push(
        { P: at(seg.a, 0), Q: at(seg.b, 0) },
        { P: at(seg.a, wallHeight), Q: at(seg.b, wallHeight) },
        { P: at(seg.a, 0), Q: at(seg.a, wallHeight) },
        { P: at(seg.b, 0), Q: at(seg.b, wallHeight) }
      );
    }
    for (const r of rooms) {
      if (!r.outdoor) continue;
      const c = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
      c.forEach((p, i) => lines.push({ P: [...p, 0], Q: [...c[(i + 1) % 4], 0], outdoor: true }));
    }
    return lines;
  }

  // The 4 corners (foot and top of both ends) of the outer wall an outdoor camera sees best: the one
  // facing it that is largest in its picture (counting only its part in the picture, and less when
  // the house hides some of its corners). Empty when it sees none.
  function facadeCorners(indoor, wallHeight, pose, aspect, hidden) {
    const C = pose.C;
    let best = null;
    for (const seg of wallSegments(indoor)) {
      const k = seg.o === 'h' ? 1 : 0;
      if (!seg.normal || (C[k] - seg.at) * seg.normal[k] <= 0.05) continue;
      const at = (t, z) => (seg.o === 'h' ? [t, seg.at, z] : [seg.at, t, z]);
      const P = [at(seg.a, 0), at(seg.b, 0), at(seg.b, wallHeight), at(seg.a, wallHeight)].map((X) => X.map(round2));
      const uv = P.map((X) => toPicture(pose, X, aspect));
      if (uv.some((q) => !q)) continue;
      const q = uv.map(([u, v]) => [clamp(u, 0, 1), clamp(v, 0, 1 / aspect)]);
      let area = 0;
      q.forEach((a, i) => {
        const b = q[(i + 1) % 4];
        area += a[0] * b[1] - b[0] * a[1];
      });
      const seen = hidden ? P.filter((X) => !hidden(X)).length : 4;
      const score = (Math.abs(area) / 2) * (0.25 + seen / 4);
      if (score > 1e-6 && (!best || score > best.score)) best = { score, P };
    }
    return best ? best.P.map((P) => ({ key: pointKey(P), P })) : [];
  }

  // What hides a floor from its outdoor cameras: its indoor rooms and those of the floors above
  // (`above`: [{ rooms, z0 }], z0 from this floor's), as boxes slightly smaller than them (their walls
  // don't hide what lies on them), and their roofs.
  function planOccluders(rooms, above, wallHeight) {
    const e = 0.02;
    const floors = [{ rooms: rooms.filter((r) => !r.outdoor), z0: 0 }, ...above];
    const boxes = [];
    const slopes = [];
    floors.forEach(({ rooms: fr, z0 }, i) => {
      const bottom = i ? z0 - SLAB : 0;
      for (const r of fr) boxes.push([r.x + e, r.y + e, bottom + e, r.x + r.w - e, r.y + r.h - e, z0 + wallHeight - e]);
      slopes.push(...floorRoof(fr, floors.slice(i + 1).flatMap((f) => f.rooms), z0 + wallHeight));
    });
    return { boxes, slopes };
  }

  // Whether the occluders (see planOccluders()) hide the point P from a camera standing at C. A roof
  // close to P doesn't count: the corners at the top of the walls stand right under its eaves.
  function sightBlocked(occ, C, P) {
    const d = sub3(P, C);
    for (const b of occ.boxes) {
      let t0 = 0;
      let t1 = 1;
      for (let i = 0; i < 3 && t0 < t1; i++) {
        if (Math.abs(d[i]) < 1e-12) {
          if (C[i] <= b[i] || C[i] >= b[i + 3]) t1 = -1;
          continue;
        }
        const ta = (b[i] - C[i]) / d[i];
        const tb = (b[i + 3] - C[i]) / d[i];
        t0 = Math.max(t0, Math.min(ta, tb));
        t1 = Math.min(t1, Math.max(ta, tb));
      }
      if (t0 < t1) return true;
    }
    const L = len3(d);
    for (const { pts, n } of occ.slopes) {
      const den = dot3(n, d);
      if (Math.abs(den) < 1e-9) continue;
      const t = dot3(n, sub3(pts[0], C)) / den;
      if (t <= 0 || t >= 1 || (1 - t) * L < 0.4) continue;
      const X = add3(C, mul3(d, t));
      const sides = pts.map((A, i) => Math.sign(dot3(cross3(sub3(pts[(i + 1) % pts.length], A), sub3(X, A)), n)));
      if (sides.every((v) => v >= 0) || sides.every((v) => v <= 0)) return true;
    }
    return false;
  }

  // A world segment in the picture: polylines (curved by the lens distortion), cut where the segment
  // passes behind the camera and, with `hidden` (a world point -> whether the camera can't see it),
  // where it is hidden (to about 10 cm).
  function segmentToPicture(pose, P, Q, aspect, hidden = null) {
    const near = 0.05;
    const depth = (X) => dot3(sub3(stretched(pose, X), pose.C), pose.fwd);
    const dP = depth(P);
    const dQ = depth(Q);
    if (dP < near && dQ < near) return [];
    const cut = (A, B, dA, dB) => (dA >= near ? A : add3(A, mul3(sub3(B, A), (near - dA) / (dB - dA))));
    const A = cut(P, Q, dP, dQ);
    const B = cut(Q, P, dQ, dP);
    const steps = hidden || pose.k || pose.pins.length ? clamp(Math.ceil(len3(sub3(B, A)) / 0.1), 1, 100) : 1;
    const lines = [];
    let line = null;
    for (let i = 0; i <= steps; i++) {
      const X = add3(A, mul3(sub3(B, A), i / steps));
      const uv = hidden && hidden(X) ? null : toPicture(pose, X, aspect);
      if (!uv) {
        line = null;
        continue;
      }
      if (!line) lines.push((line = []));
      line.push(uv);
    }
    return lines.filter((l) => l.length > 1);
  }

  // --- "Generate from my areas" ---------------------------------------------

  // Entities suggested by default: the ones that make sense on a floor plan.
  function isSuggested(entityId, st) {
    const domain = domainOf(entityId);
    if (SUGGESTED_DOMAINS.includes(domain)) return true;
    const role = entityRole(entityId, st);
    return ['temperature', 'humidity', 'opening', 'presence'].includes(role);
  }

  // Visible entities of the registry, with the area they belong to (directly or through their device).
  function registryEntries(hass) {
    const out = [];
    for (const [id, e] of Object.entries(hass.entities || {})) {
      if (e.hidden || e.entity_category) continue;
      const device = e.device_id && hass.devices ? hass.devices[e.device_id] : null;
      out.push({ id, areaId: e.area_id || (device && device.area_id) || null });
    }
    return out;
  }

  // Splits a rectangle into one room per area, rooms sharing their walls.
  function layoutAreas(areas, x, y, w, h, out) {
    if (!areas.length) return;
    if (areas.length === 1) {
      out.push({ ...areas[0], x, y, w, h });
      return;
    }
    const total = areas.reduce((s, a) => s + a.weight, 0);
    let k = 1;
    let acc = areas[0].weight;
    let bestDiff = Math.abs(total / 2 - acc);
    for (let i = 2; i < areas.length; i++) {
      const next = acc + areas[i - 1].weight;
      if (Math.abs(total / 2 - next) >= bestDiff) break;
      acc = next;
      bestDiff = Math.abs(total / 2 - acc);
      k = i;
    }
    const ratio = acc / total;
    const first = areas.slice(0, k);
    const rest = areas.slice(k);
    if (w >= h && w >= 2) {
      const cut = clamp(Math.round(w * ratio), 1, w - 1);
      layoutAreas(first, x, y, cut, h, out);
      layoutAreas(rest, x + cut, y, w - cut, h, out);
    } else if (h >= 2) {
      const cut = clamp(Math.round(h * ratio), 1, h - 1);
      layoutAreas(first, x, y, w, cut, out);
      layoutAreas(rest, x, y + cut, w, h - cut, out);
    } else {
      // Too small to split any further: line the remaining rooms up to the right.
      areas.forEach((a, i) => out.push({ ...a, x: x + i * 3, y, w: 3, h: 3 }));
    }
  }

  function generateFromAreas(hass) {
    const areas = Object.values(hass.areas || {});
    const byArea = new Map();
    for (const { id, areaId } of registryEntries(hass)) {
      if (!areaId || !isSuggested(id, hass.states[id])) continue;
      if (!byArea.has(areaId)) byArea.set(areaId, []);
      byArea.get(areaId).push(id);
    }

    const hassFloors = Object.values(hass.floors || {}).sort(
      (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name)
    );
    const groups = hassFloors.map((f) => ({ name: f.name, areas: areas.filter((a) => a.floor_id === f.floor_id) }));
    const orphans = areas.filter((a) => !a.floor_id || !hass.floors || !hass.floors[a.floor_id]);
    if (orphans.length || !groups.length) {
      groups.push({ name: groups.length ? 'Other areas' : 'Home', areas: orphans });
    }

    const floors = groups
      .filter((g) => g.areas.length)
      .map((g) => {
        const weighted = g.areas
          .map((a) => ({ area: a, ids: byArea.get(a.area_id) || [] }))
          .map((a) => ({ ...a, weight: 2 + Math.min(a.ids.length, 6) }))
          .sort((a, b) => b.weight - a.weight || a.area.name.localeCompare(b.area.name));
        const cells = weighted.reduce((s, a) => s + a.weight, 0) * 3;
        const w = Math.max(4, Math.round(Math.sqrt(cells * 1.5)));
        const h = Math.max(3, Math.round(cells / w));
        const placed = [];
        layoutAreas(weighted, 0, 0, w, h, placed);

        // The area's own temperature and humidity sensors (set in its settings) feed the room even when not suggested.
        const rooms = placed.map((p) => ({
          name: p.area.name,
          icon: p.area.icon || undefined,
          x: p.x,
          y: p.y,
          w: p.w,
          h: p.h,
          temperature: p.area.temperature_entity_id || undefined,
          humidity: p.area.humidity_entity_id || undefined,
        }));
        const exterior = exteriorSegments(rooms.map(normalizeRoom));
        const entities = [];
        placed.forEach((p, i) => entities.push(...placeAreaEntities(hass, p.ids, rooms[i], exterior)));
        return { name: g.name, rooms, entities };
      });

    return floors.length ? floors : [{ name: 'Home', rooms: [], entities: [] }];
  }

  // Initial positions of an area's entities inside its room: covers on an outer wall,
  // sensors in the top-right corner, everything else on a grid below the room name.
  function placeAreaEntities(hass, ids, room, exterior) {
    const out = [];
    const covers = ids.filter((id) => domainOf(id) === 'cover');
    const sensors = ids.filter((id) => ['temperature', 'humidity'].includes(entityRole(id, hass.states[id])));
    const others = ids.filter((id) => !covers.includes(id) && !sensors.includes(id));

    if (covers.length) {
      const walls = exterior.filter((s) =>
        s.o === 'h'
          ? s.a >= room.x - ON_WALL_EPS && s.b <= room.x + room.w + ON_WALL_EPS && (Math.abs(s.at - room.y) < ON_WALL_EPS || Math.abs(s.at - room.y - room.h) < ON_WALL_EPS)
          : s.a >= room.y - ON_WALL_EPS && s.b <= room.y + room.h + ON_WALL_EPS && (Math.abs(s.at - room.x) < ON_WALL_EPS || Math.abs(s.at - room.x - room.w) < ON_WALL_EPS)
      );
      const wall = walls.sort((a, b) => b.b - b.a - (a.b - a.a))[0] || roomEdges(room)[0];
      covers.forEach((id, i) => {
        const pos = round2(snap(wall.a + ((wall.b - wall.a) * (i + 0.5)) / covers.length, ENTITY_SNAP));
        out.push({ entity: id, x: wall.o === 'h' ? pos : wall.at, y: wall.o === 'h' ? wall.at : pos });
      });
    }
    sensors.forEach((id, i) => {
      out.push({ entity: id, x: round2(room.x + room.w - 0.5 - i * 0.75), y: round2(room.y + 0.5) });
    });
    const cols = Math.max(1, Math.floor(room.w - 0.5));
    others.forEach((id, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      out.push({
        entity: id,
        x: round2(room.x + 0.75 + col),
        y: round2(Math.min(room.y + 1.5 + row, room.y + room.h - 0.5)),
      });
    });
    return out;
  }

  // -------------------------------------------------------------------------
  // Card
  // -------------------------------------------------------------------------
  class HaPlooumFloorplanCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
        _floorIndex: { state: true },
        _selectedRoom: { state: true },
        _coverDrag: { state: true },
        _width: { state: true },
        _view: { state: true },
        _level3d: { state: true },
        _orbit: { state: true },
        _focus: { state: true },
        _dragging3d: { state: true },
        _glFailed: { state: true },
        _tick: { state: true },
        _camHover: { state: true },
        _camPinned: { state: true },
      };
    }

    constructor() {
      super();
      this._width = 0;
      // Marker size follows the plan's scale, so small plans stay readable.
      this._resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        if (Math.abs(width - this._width) > 1) this._width = width;
      });
      this._floorIndex = 0;
      this._selectedRoom = null;
      this._coverDrag = null;
      this._pending = {};
      this._view = null; // '2d' | '3d', from the config until the user switches
      this._level3d = null; // floors shown in 3D: up to this index; floors.length = the closed house, with its roof
      this._orbit = null; // 3D point of view, null = framed automatically
      this._gl = null; // WebGL context of the 3D view (GlScene)
      this._snaps = {}; // camera id -> snapshots loaded for the 3D scene, see _snapshot()
      this._projPics = {}; // camera id -> pictures projected in 3D from a reference picture, see _projectionPicture()
      this._iconPaths = new Map(); // icon -> SVG path, for the 3D textures, see _iconPath()
      this._focus = null; // camera whose screen the 3D view is zoomed on
      this._dragging3d = false;
      this._pointers = new Map();
      this._aspects = {}; // camera id -> image aspect ratio, learned when its image loads
      this._tick = 0; // bumps every refresh_interval: reloads camera snapshots
      this._camHover = null; // camera previewed in 2D while the mouse is on its marker
      this._camPinned = null; // camera previewed in 2D after a tap on its marker
      this._panelCameras = false; // the room panel shows camera pictures
      this._wheelListener = { handleEvent: (ev) => this._wheel3d(ev), passive: false };
      this._onKeyDown = (ev) => {
        // Keys meant for dialogs (the more-info of a camera) or fields: leave the view as it is then.
        if (ev.composedPath().some((n) => n.localName && (n.localName.includes('dialog') || ['input', 'textarea'].includes(n.localName)))) return;
        if (ev.key === 'Escape') {
          if (this._camPinned) {
            this._camPinned = null;
            return;
          }
          if (this._selectedRoom !== null) this._selectedRoom = null;
          if (this._view === '3d') this._resetView();
        } else if ((ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') && this._view === '3d' && this._focus) {
          ev.preventDefault();
          this._cycleFocus(ev.key === 'ArrowLeft' ? -1 : 1);
        }
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.info(
        `%c HA-PLOOUM-FLOORPLAN-CARD %c ${CARD_VERSION$2} `,
        'color: white; background: #03a9f4; font-weight: 700;',
        'color: #03a9f4; background: white; font-weight: 700;'
      );
      window.addEventListener('keydown', this._onKeyDown);
      this._resizeObserver.observe(this);
      this._startRefresh();
    }

    updated(changed) {
      // Keep the camera zoomed on visible in the camera bar.
      if (changed.has('_focus') && this._focus) {
        const bar = this.renderRoot.querySelector('.cambar');
        const chip = bar && bar.querySelector('.camchip.active');
        if (chip) bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
      }
      if (this._view === '3d') {
        this._draw3d();
        this._probeIcons();
      } else {
        this._dropGl();
        this._measureThumbObstacles();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener('keydown', this._onKeyDown);
      this._resizeObserver.disconnect();
      clearTimeout(this._holdTimer);
      clearTimeout(this._previewTimer);
      clearTimeout(this._measureTimer);
      clearInterval(this._refreshTimer);
      clearInterval(this._thumbTimer);
      clearTimeout(this._iconTimer);
      cancelAnimationFrame(this._easeFrame);
      this._easeFrame = null;
    }

    setConfig(config) {
      if (!config) throw new Error('Invalid configuration');
      if (config.floors !== undefined && !Array.isArray(config.floors)) {
        throw new Error('floors must be a list');
      }
      if (config.view !== undefined && !['2d', '3d'].includes(config.view)) {
        throw new Error('view must be 2d or 3d');
      }
      if (config.screen_mode !== undefined && !SCREEN_MODES.includes(config.screen_mode)) {
        throw new Error(`screen_mode must be one of ${SCREEN_MODES.join(', ')}`);
      }
      if (config.camera_previews !== undefined && !['hover', 'always'].includes(config.camera_previews)) {
        throw new Error('camera_previews must be hover or always');
      }
      if (config.projection_picture !== undefined && !PROJECTION_PICTURES.includes(config.projection_picture)) {
        throw new Error(`projection_picture must be one of ${PROJECTION_PICTURES.join(', ')}`);
      }
      // A new `view` or `roof` in the config (editor) is applied; otherwise the user's choice stays.
      if (!this.config || this.config.view !== config.view) this._view = config.view || '2d';
      if (!this.config || this.config.roof !== config.roof) this._level3d = null;
      const refreshChanged = !this.config || this.config.refresh_interval !== config.refresh_interval;
      this.config = config;
      if (refreshChanged && this.isConnected) this._startRefresh();
    }

    // Camera snapshots are reloaded periodically, only while some are shown: in 3D, or in 2D in a
    // camera's preview or the room panel. Projected pictures are snapshots even with `camera_view: live`.
    // The thumbnails always shown in 2D (`camera_previews: always`) have their own, much slower refresh.
    _startRefresh() {
      clearInterval(this._refreshTimer);
      clearInterval(this._thumbTimer);
      if (!this.config) return;
      const seconds = Math.max(1, num(this.config.refresh_interval, REFRESH_INTERVAL));
      this._refreshTimer = setInterval(() => {
        if (this._snapshotsShown() && !document.hidden) this._tick++;
      }, seconds * 1000);
      // Thumbnails are reloaded once older than THUMB_INTERVAL (see _thumb()): check now and then.
      this._thumbTimer = setInterval(() => {
        if (this.config.camera_previews === 'always' && this._view !== '3d' && !document.hidden) this.requestUpdate();
      }, THUMB_CHECK * 1000);
    }

    _snapshotsShown() {
      if (this._view === '3d') return true;
      return !!(this._camHover || this._camPinned || this._panelCameras);
    }

    static getStubConfig() {
      // No floors: the plan is generated from the Home Assistant areas until the user edits it.
      return {};
    }

    static getConfigElement() {
      return document.createElement('ha-plooum-floorplan-card-editor');
    }

    getCardSize() {
      return 6;
    }

    getGridOptions() {
      return { columns: 12, min_columns: 6, rows: 'auto' };
    }

    _floors() {
      if (this.config.floors) return this.config.floors;
      // Generated plan, recomputed only when the registries change.
      const key = [this.hass.areas, this.hass.entities, this.hass.floors, this.hass.devices];
      if (!this._autoKey || this._autoKey.some((v, i) => v !== key[i])) {
        this._autoKey = key;
        this._autoFloors = generateFromAreas(this.hass);
      }
      return this._autoFloors;
    }

    _tempRange() {
      const fahrenheit = this.hass.config && this.hass.config.unit_system && this.hass.config.unit_system.temperature === '°F';
      return {
        min: num(this.config.temp_min, fahrenheit ? 63 : 17),
        max: num(this.config.temp_max, fahrenheit ? 81 : 27),
      };
    }

    render() {
      if (!this.hass || !this.config) return A;
      const floors = this._floors();
      const floorIndex = clamp(this._floorIndex, 0, floors.length - 1);
      const plan = resolveFloor(this.hass, floors[floorIndex]);
      const selected = this._selectedRoom !== null ? plan.rooms[this._selectedRoom] : null;
      const is3d = this._view === '3d';
      const empty = is3d
        ? floors.every((f) => !(f.rooms || []).length && !(f.entities || []).length)
        : !plan.rooms.length && !plan.items.length;
      const level = this._level(floors);
      this._panelCameras = false; // set again by the room panel

      return b`
      <ha-card>
        <div class="header">
          <div class="title">${this.config.title || ''}</div>
          <div class="floors">
            ${is3d
              ? b`${floors.map(
                    (f, i) => b`<button class="chip ${i === level ? 'active' : ''}" @click=${() => this._setLevel(i)}
                      title="Show this floor and the ones below">${f.name || `Floor ${i + 1}`}</button>`
                  )}<button class="chip ${level === floors.length ? 'active' : ''}" @click=${() => this._setLevel(floors.length)}
                    title="Whole home, with its roof"><ha-icon icon="mdi:home-roof"></ha-icon></button>`
              : floors.length > 1
                ? floors.map(
                    (f, i) => b`<button
                      class="chip ${i === floorIndex ? 'active' : ''}"
                      @click=${() => this._selectFloor(i)}
                    >${f.name || `Floor ${i + 1}`}</button>`
                  )
                : A}
            <div class="seg" role="group" aria-label="View">
              <button class=${is3d ? '' : 'active'} @click=${() => this._setView('2d')} title="Floor plan">2D</button>
              <button class=${is3d ? 'active' : ''} @click=${() => this._setView('3d')} title="3D view">3D</button>
            </div>
          </div>
        </div>
        ${empty
          ? b`<div class="empty">
              <ha-icon icon="mdi:floor-plan"></ha-icon>
              <div>No plan yet. Edit this card to draw your home and place your devices.</div>
            </div>`
          : is3d
            ? this._renderScene3d(floors, level)
            : this._renderPlan(plan, selected)}
        ${selected && !is3d ? this._renderPanel(selected) : A}
      </ha-card>
    `;
    }

    _setView(view) {
      this._view = view;
      this._selectedRoom = null;
      this._closePreviews();
      if (view === '3d') this._tick++;
    }

    _selectFloor(i) {
      this._floorIndex = i;
      this._selectedRoom = null;
      this._closePreviews();
    }

    _renderPlan(plan, selected) {
      const pad = 0.4;
      const b$1 = plan.bounds;
      const vb = { x: b$1.minX - pad, y: b$1.minY - pad, w: b$1.maxX - b$1.minX + 2 * pad, h: b$1.maxY - b$1.minY + 2 * pad };
      const px = (x) => ((x - vb.x) / vb.w) * 100;
      const py = (y) => ((y - vb.y) / vb.h) * 100;
      const pw = (w) => (w / vb.w) * 100;
      const ph = (h) => (h / vb.h) * 100;
      const { min, max } = this._tempRange();

      const dim = (room) => (selected && room.group !== selected.index ? 'dim' : '');
      const dimItem = (it) => (selected && it.room !== selected.index ? 'dim' : '');
      const cameras = plan.items.filter((it) => it.camera && it.st && !isUnavailable(it.st));
      const cameraItems = plan.items.filter((it) => it.role === 'camera' && it.st);
      const planWidth = this._width - 2 * CARD_PADDING;
      const markerSize = planWidth > 0 ? clamp(Math.round((planWidth / vb.w) * 0.8), 18, 28) : 28;
      const zoom = this._zoomView(vb, selected, planWidth);
      const thumbs = this.config.camera_previews === 'always' ? this._thumbLayout(cameraItems, vb, planWidth, markerSize) : {};
      // Until the width is known, the aspect ratio sizes the plan; then an explicit height lets it grow while zoomed.
      const planSize = planWidth > 0 ? `height: ${zoom.height}px;` : `aspect-ratio: ${vb.w} / ${vb.h};`;

      return b`
      <div class="plan" style="${planSize} --m: ${markerSize}px;" @click=${() => {
        this._selectedRoom = null;
        this._camPinned = null;
      }}>
        <div class="zoom" style="aspect-ratio: ${vb.w} / ${vb.h}; transform: ${zoom.transform}; --k: ${zoom.k};">
          <svg class="layer" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" preserveAspectRatio="none">
            <defs>
              ${plan.rooms.map(
                // A room's clip covers all its zones; its lights' glows are defined once.
                (room) => w`
                  <clipPath id="clip-${room.index}">
                    ${room.zones.map((z) => w`<rect x=${z.x} y=${z.y} width=${z.w} height=${z.h}></rect>`)}
                  </clipPath>
                  ${(room.main ? room.lights : [])
                    .map(
                      (it) => w`
                        <radialGradient id="glow-${it.index}" gradientUnits="userSpaceOnUse"
                          cx=${it.x} cy=${it.y} r=${Math.max(room.bbox.w, room.bbox.h) * 0.8}>
                          <stop offset="0" stop-color=${rgba(lightRgb(it.st), 0.75)}></stop>
                          <stop offset="0.45" stop-color=${rgba(lightRgb(it.st), 0.3)}></stop>
                          <stop offset="1" stop-color=${rgba(lightRgb(it.st), 0)}></stop>
                        </radialGradient>
                      `
                    )}
                `
              )}
              ${cameras.map(
                (it) => w`<radialGradient id="cone-${it.index}" gradientUnits="userSpaceOnUse" cx=${it.x} cy=${it.y}
                  r=${it.camera.hit !== null ? Math.min(it.camera.hit, 8) : CAMERA_REACH}>
                  <stop offset="0" stop-color="var(--fp-camera)" stop-opacity="0.45"></stop>
                  <stop offset="1" stop-color="var(--fp-camera)" stop-opacity="0.04"></stop>
                </radialGradient>`
              )}
            </defs>
            ${plan.rooms.map((room) => {
              if (room.outdoor) {
                return w`<rect class="floor outdoor ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>`;
              }
              const t = roomTemperature(room);
              const fill = t === null ? 'var(--fp-floor)' : rgba(tempRgb(t, min, max), 0.3);
              return w`<rect class="floor ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h} style="fill: ${fill};"></rect>`;
            })}
            ${cameras.map(
              // An indoor camera's cone stays in its room.
              (it) => w`<path class="cone ${dimItem(it)}" d=${conePath(it)} fill="url(#cone-${it.index})"
                clip-path=${it.camera.indoor && it.room >= 0 ? `url(#clip-${it.room})` : A}></path>`
            )}
            ${plan.rooms.map((room) =>
              room.lights
                .map((it) => {
                  const on = isActive(it.st);
                  const brightness = on && typeof it.st.attributes.brightness === 'number' ? it.st.attributes.brightness / 255 : 1;
                  return w`<rect class="glow ${dim(room)}" clip-path="url(#clip-${room.index})"
                    x=${room.x} y=${room.y} width=${room.w} height=${room.h}
                    fill="url(#glow-${it.index})" style="opacity: ${on ? 0.45 + 0.55 * brightness : 0};"></rect>`;
                })
            )}
            ${plan.rooms.map((room) =>
              room.zones.length > 1
                ? // A zone's walls, without the ones it shares with the other zones of its room.
                  w`<path class="wall ${room.outdoor ? 'outdoor' : ''} ${dim(room)}" d=${edgesPath(zoneEdges(room))}></path>`
                : w`<rect class="wall ${room.outdoor ? 'outdoor' : ''} ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>`
            )}
            ${plan.rooms
              .filter((room) => room.presence && room.main)
              .map((room) =>
                room.zones.length > 1
                  ? // Along the walls of all its zones, inside: a wide stroke cut by the room's outline.
                    w`<path class="presence zones" clip-path="url(#clip-${room.index})" d=${edgesPath(room.zones.flatMap(zoneEdges))}></path>`
                  : w`<rect class="presence" x=${room.x + 0.12} y=${room.y + 0.12}
                      width=${Math.max(0, room.w - 0.24)} height=${Math.max(0, room.h - 0.24)}></rect>`
              )}
            ${plan.exterior.map((s) =>
              s.o === 'h'
                ? w`<line class="outer" x1=${s.a} y1=${s.at} x2=${s.b} y2=${s.at}></line>`
                : w`<line class="outer" x1=${s.at} y1=${s.a} x2=${s.at} y2=${s.b}></line>`
            )}
          </svg>

          <div class="overlay">
            ${plan.rooms.map((room) => this._renderRoom(room, dim(room), { px, py, pw, ph }))}
            ${this.config.camera_previews === 'always'
              ? cameraItems.map((it) => this._renderThumb(it, thumbs[it.id], dimItem(it), { px, py }))
              : A}
            ${plan.items.map((item) => this._renderItem(item, plan, { px, py, pw, ph }))}
            ${plan.rooms.map((room) => this._renderRoomLabel(room, dim(room), { px, py, pw, ph }))}
          </div>
        </div>
        ${this._renderCamPreview(plan, vb, zoom, planWidth, markerSize)}
      </div>
    `;
    }

    // Zoom on the selected room: the room fills the plan's width, and the plan grows taller
    // (up to ZOOM_MAX_HEIGHT x its width) when the room doesn't fit in the plan's height.
    // `k` shrinks markers and labels back so that they grow at most ZOOM_ITEM_GROWTH times.
    _zoomView(vb, selected, planWidth) {
      const baseHeight = (planWidth * vb.h) / vb.w;
      const none = { height: baseHeight, transform: 'none', k: 1, s: 1, tx: 0, ty: 0 };
      if (!selected || planWidth <= 0) return none;

      const unit = planWidth / vb.w; // px per grid unit, unzoomed
      const box = selected.bbox; // all the room's zones
      const viewW = box.w + 2 * ZOOM_MARGIN;
      const viewH = box.h + 2 * ZOOM_MARGIN;
      const maxHeight = Math.max(baseHeight, planWidth * ZOOM_MAX_HEIGHT);
      const s = Math.min(vb.w / viewW, maxHeight / (viewH * unit), ZOOM_MAX);
      if (s < 1.1) return none; // the room already fills the plan: highlighting it is enough

      const height = clamp(viewH * unit * s, baseHeight, maxHeight);
      const cx = (box.x + box.w / 2 - vb.x) * unit;
      const cy = (box.y + box.h / 2 - vb.y) * unit;
      // Center the room, without showing empty space past the plan's edges when avoidable.
      let tx = planWidth / 2 - cx * s;
      let ty = height / 2 - cy * s;
      tx = clamp(tx, planWidth - planWidth * s, 0);
      if (baseHeight * s >= height) ty = clamp(ty, height - baseHeight * s, 0);
      return { height, transform: `translate(${tx}px, ${ty}px) scale(${s})`, k: Math.min(s, ZOOM_ITEM_GROWTH) / s, s, tx, ty };
    }

    // A room's tap target, under the markers.
    _renderRoom(room, dimClass, { px, py, pw, ph }) {
      return b`<div
      class="room ${dimClass} ${this._selectedRoom === room.group ? 'selected' : ''}"
      style="left: ${px(room.x)}%; top: ${py(room.y)}%; width: ${pw(room.w)}%; height: ${ph(room.h)}%;"
      @click=${(ev) => this._selectRoom(ev, room.group)}
    ></div>`;
    }

    // A room's name, temperature and humidity, over the markers so that they stay readable (taps go
    // through it to the markers and the room).
    _renderRoomLabel(room, dimClass, { px, py, pw, ph }) {
      const { temp: tempText, hum: humText } = roomClimate(this.hass, room);
      // Shown once for a room drawn as several zones, in its largest one.
      if (!room.main || (!room.name && !tempText && !humText)) return A;
      return b`
      <div class="room-label ${dimClass}" style="left: ${px(room.x)}%; top: ${py(room.y)}%; width: ${pw(room.w)}%; height: ${ph(room.h)}%;">
        <div class="label">
          ${room.name
            ? b`<div class="name">
                ${room.icon ? b`<ha-icon icon=${room.icon}></ha-icon>` : A}<span>${room.name}</span>
              </div>`
            : A}
          ${tempText || humText
            ? b`<div class="climate">
                ${tempText ? b`<span class="temp">${tempText}</span>` : A}
                ${humText ? b`<span class="hum"><ha-icon icon="mdi:water-percent"></ha-icon>${humText}</span>` : A}
              </div>`
            : A}
        </div>
      </div>
    `;
    }

    _renderItem(item, plan, { px, py, pw, ph }) {
      if (item.role === 'cover' && item.wall && item.st) return this._renderWindow(item, { px, py, pw, ph });
      // Temperature and humidity sensors inside a room are shown in its label.
      if ((item.role === 'temperature' || item.role === 'humidity') && item.room >= 0 && item.st) return A;
      const dim = this._selectedRoom !== null && item.room !== this._selectedRoom ? 'dim' : '';
      const pos = `left: ${px(item.x)}%; top: ${py(item.y)}%;`;
      const events = {
        down: (ev) => this._itemDown(ev, item),
        up: () => clearTimeout(this._holdTimer),
        click: (ev) => this._itemClick(ev, item),
      };

      if (!item.st) {
        return b`<button class="marker missing ${dim}" style=${pos} title="${item.id}: entity not found"
        @click=${(ev) => ev.stopPropagation()}>
        <ha-icon icon="mdi:help-circle-outline"></ha-icon>
      </button>`;
      }

      const title = `${item.name || friendlyName(this.hass, item.id)}: ${formatState(this.hass, item.st)}`;
      if (['temperature', 'humidity', 'sensor'].includes(item.role)) {
        return b`<button class="badge ${isUnavailable(item.st) ? 'unavailable' : ''} ${dim}" style=${pos} title=${title}
        @pointerdown=${events.down} @pointerup=${events.up} @pointerleave=${events.up} @click=${events.click}
        @contextmenu=${(ev) => ev.preventDefault()}>
        ${this._icon(item)}<span>${formatState(this.hass, item.st)}</span>
      </button>`;
      }

      const active = isActive(item.st);
      let color = 'var(--fp-active)';
      if (item.role === 'light') color = rgba(lightRgb(item.st));
      else if (item.role === 'opening' || (item.role === 'device' && domainOf(item.id) === 'lock')) color = 'var(--fp-alert)';
      else if (item.role === 'presence') color = 'var(--fp-presence)';
      const classes = [
        'marker',
        active ? 'active' : '',
        isUnavailable(item.st) ? 'unavailable' : '',
        dim,
      ].join(' ');
      const camera = item.role === 'camera';
      return b`<button class=${classes} style="${pos} --c: ${color};" title=${camera ? A : title}
      @pointerdown=${events.down} @pointerup=${events.up} @click=${events.click}
      @pointerenter=${camera ? (ev) => this._previewEnter(ev, item) : A}
      @pointerleave=${(ev) => {
        events.up();
        if (camera) this._previewLeave(ev);
      }}
      @contextmenu=${(ev) => ev.preventDefault()}>
      ${this._icon(item)}
    </button>`;
    }

    // Preview of a camera over the plan: shown while the mouse is on its marker, or pinned by a tap.
    // It goes on the side set by the camera's `preview_position`, or else next to the marker on the
    // side with the most room, preferably behind the camera so that its cone stays visible. A tap on it opens the camera's details, with its live view.
    _renderCamPreview(plan, vb, zoom, planWidth, markerSize) {
      const id = this._camHover || this._camPinned;
      const item = id && plan.items.find((it) => it.id === id && it.role === 'camera');
      if (!item || planWidth <= 0) return A;
      const W = planWidth;
      const H = zoom.height;
      const m = 8; // margin to the plan's edges
      const unit = W / vb.w;
      const x = zoom.tx + zoom.s * (item.x - vb.x) * unit;
      const y = zoom.ty + zoom.s * (item.y - vb.y) * unit;
      const gap = (markerSize * zoom.k * zoom.s) / 2 + 6;
      const aspect = this._aspects[id] || 16 / 9;
      const maxW = Math.min(W - 2 * m, clamp(W * 0.42, 200, 360));
      const dir = item.camera ? (item.camera.direction * Math.PI) / 180 : 0;
      const look = [Math.sin(dir), -Math.cos(dir)];
      const sides = [
        { v: [0, 1], w: Math.min(maxW, (H - y - gap - m) * aspect) },
        { v: [0, -1], w: Math.min(maxW, (y - gap - m) * aspect) },
        { v: [1, 0], w: Math.min(maxW, W - x - gap - m, (H - 2 * m) * aspect) },
        { v: [-1, 0], w: Math.min(maxW, x - gap - m, (H - 2 * m) * aspect) },
      ];
      const score = (sd) => sd.w * (1 - 0.2 * (sd.v[0] * look[0] + sd.v[1] * look[1]));
      // The camera's `preview_position` forces the side; otherwise the side with the most room.
      const forced = THUMB_SIDES[item.conf.preview_position];
      const side = forced
        ? sides.find((sd) => sd.v[0] === forced[0] && sd.v[1] === forced[1])
        : sides.reduce((a, b) => (score(b) > score(a) ? b : a));
      const w = Math.max(side.w, 80);
      const h = w / aspect;
      let left;
      let top;
      if (side.v[1]) {
        left = clamp(x - w / 2, m, W - m - w);
        top = side.v[1] > 0 ? y + gap : y - gap - h;
      } else {
        top = clamp(y - h / 2, m, H - m - h);
        left = side.v[0] > 0 ? x + gap : x - gap - w;
      }
      // A forced side too small for the preview: it stays in the plan, over the marker if need be.
      left = clamp(left, m, Math.max(m, W - m - w));
      top = clamp(top, m, Math.max(m, H - m - h));
      const pinned = id === this._camPinned;
      const state = !item.st ? 'missing' : isUnavailable(item.st) ? 'unavailable' : '';
      return b`<div class="campop ${pinned ? 'pinned' : ''} ${state}" title="Open the live view"
      style="left: ${round2(left)}px; top: ${round2(top)}px; width: ${round2(w)}px; height: ${round2(h)}px;"
      @pointerenter=${() => clearTimeout(this._previewTimer)}
      @pointerleave=${(ev) => this._previewLeave(ev)}
      @click=${(ev) => {
        ev.stopPropagation();
        this._moreInfo(id);
      }}>
      ${this._screenContent(item, false)}
      ${pinned
        ? b`<button class="campop-close" title="Close" @click=${(ev) => {
            ev.stopPropagation();
            this._camPinned = null;
          }}><ha-icon icon="mdi:close"></ha-icon></button>`
        : A}
    </div>`;
    }

    // Where each camera's thumbnail goes (`camera_previews: always`): id -> { w, h, dx, dy }, its size
    // and the offset of its center from the marker (px, before the plan's zoom). A camera's
    // `preview_position` (top, bottom, left, right) puts it on that side. Otherwise (`auto`) it should
    // hide nothing: among spots around the camera, a little further away, and smaller sizes, the one
    // covering the least of the other thumbnails, the markers, the windows and the room names wins, preferably
    // behind the camera (its cone stays visible), close to it and full size.
    _thumbLayout(cams, vb, planWidth, markerSize) {
      const layout = {};
      if (planWidth <= 0) return layout;
      const unit = planWidth / vb.w;
      const planH = vb.h * unit;
      const m = 4;
      const full = clamp(Math.round(markerSize * 3.4), 64, THUMB_PX + 24);
      const at = (it) => [(it.x - vb.x) * unit, (it.y - vb.y) * unit];
      const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
      // Markers and room names, measured on the plan (see _measureThumbObstacles), or the camera
      // markers until then.
      const obstacles = this._thumbObstacles || cams.map((it) => {
        const [x, y] = at(it);
        return { l: x - markerSize / 2, r: x + markerSize / 2, t: y - markerSize / 2, b: y + markerSize / 2 };
      });
      const placed = [];
      const gap = markerSize / 2 + 4;
      const fixed = (it) => THUMB_SIDES[it.conf.preview_position];
      for (const it of [...cams.filter(fixed), ...cams.filter((c) => !fixed(c))]) {
        const aspect = this._aspects[it.id] || 16 / 9;
        const [x, y] = at(it);
        // Spot in direction v (each coordinate in -1..1) at `far` extra px from the marker.
        const spot = (v, w, far) => {
          const h = w / aspect;
          const g = v[0] && v[1] ? gap * 0.7 : gap;
          const n = Math.hypot(v[0], v[1]);
          const cx = x + v[0] * (g + w / 2) + (v[0] / n) * far;
          const cy = y + v[1] * (g + h / 2) + (v[1] / n) * far;
          const box = { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 };
          return { cx, cy, w, h, box, inside: box.l >= m && box.r <= planWidth - m && box.t >= m && box.b <= planH - m };
        };
        let best;
        if (fixed(it)) {
          best = spot(fixed(it), full, 0);
        } else {
          const dir = it.camera ? toRad(it.camera.direction) : 0;
          const back = [-Math.sin(dir), Math.cos(dir)];
          const dirs = [back];
          for (const vx of [-1, 0, 1]) for (const vy of [-1, 0, 1]) if (vx || vy) dirs.push([vx, vy]);
          let bestCost = Infinity;
          for (const [si, w] of [full, full * 0.8, full * 0.65].entries()) {
            for (const far of [0, 0.3, 0.7, 1.1, 1.5].map((f) => f * w)) {
              for (const v of dirs) {
                const c = spot(v, w, far);
                if (!c.inside) continue;
                // Share of each thumbnail, marker or name hidden: hiding anything costs more than
                // moving the thumbnail away or shrinking it.
                const hidden = (list) => list.reduce((sum, o) => sum + overlap(c.box, o) / Math.max(1, (o.r - o.l) * (o.b - o.t)), 0);
                const n = Math.hypot(v[0], v[1]);
                const cost = 4 * hidden(placed) + 2 * hidden(obstacles) + 0.06 * (1 - (v[0] * back[0] + v[1] * back[1]) / n) + 0.08 * (far / w) + 0.12 * si;
                if (cost < bestCost) {
                  bestCost = cost;
                  best = c;
                }
              }
            }
          }
          best = best || spot(back, full, 0);
        }
        const cx = clamp(best.cx, best.w / 2 + m, planWidth - best.w / 2 - m);
        const cy = clamp(best.cy, best.h / 2 + m, planH - best.h / 2 - m);
        placed.push({ l: cx - best.w / 2, r: cx + best.w / 2, t: cy - best.h / 2, b: cy + best.h / 2 });
        layout[it.id] = { w: best.w, h: best.h, dx: cx - x, dy: cy - y, gap };
      }
      return layout;
    }

    // What the thumbnails should not hide, measured on the rendered plan (px, before the zoom): the
    // markers, badges, windows and room names. Measured only while the plan isn't zoomed; laid out again when
    // it changes.
    _measureThumbObstacles() {
      if (this.config.camera_previews !== 'always' || this._selectedRoom !== null) return;
      const zoom = this.renderRoot.querySelector('.plan .zoom');
      if (!zoom) return;
      const origin = zoom.getBoundingClientRect();
      const boxes = [...zoom.querySelectorAll('.overlay > .marker, .overlay > .badge, .overlay > .window, .room-label .name > *, .room-label .climate > *')]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width && r.height)
        .map((r) => ({ l: r.left - origin.left, r: r.right - origin.left, t: r.top - origin.top, b: r.bottom - origin.top }));
      const key = boxes.map((b) => `${Math.round(b.l)},${Math.round(b.t)},${Math.round(b.r)},${Math.round(b.b)}`).join(' ');
      if (key === this._thumbObstaclesKey) return;
      this._thumbObstaclesKey = key;
      this._thumbObstacles = boxes;
      this.requestUpdate();
      // Again once the labels' zoom transition has ended.
      clearTimeout(this._measureTimer);
      this._measureTimer = setTimeout(() => this._measureThumbObstacles(), 600);
    }

    // Thumbnail always shown next to a camera (`camera_previews: always`), under the markers, hidden
    // while the camera's full preview is open. A tap on it opens the camera's details, with its live
    // view; its corner button reloads it now.
    _renderThumb(item, spot, dimClass, { px, py }) {
      const id = item.id;
      if (!spot || id === this._camHover || id === this._camPinned) return A;
      const unavailable = isUnavailable(item.st);
      const url = this._thumb(item.st);
      if (!url && unavailable) return A;
      const thumb = thumbCache.get(id);
      const k = (v) => `calc(${round2(v)}px * var(--k, 1))`;
      // A thumbnail moved away from its camera is linked to it by a line, to its nearest point.
      const lx = clamp(0, spot.dx - spot.w / 2, spot.dx + spot.w / 2);
      const ly = clamp(0, spot.dy - spot.h / 2, spot.dy + spot.h / 2);
      const len = Math.hypot(lx, ly);
      const leader =
        len > spot.gap + 6
          ? b`<div class="camthumb-leader ${dimClass}"
            style="left: ${px(item.x)}%; top: ${py(item.y)}%; width: ${k(len)}; transform: rotate(${round2((Math.atan2(ly, lx) * 180) / Math.PI)}deg);"></div>`
          : A;
      return b`${leader}<div class="camthumb ${unavailable ? 'unavailable' : ''} ${dimClass}" title="Open the live view"
      style="left: ${px(item.x)}%; top: ${py(item.y)}%; width: ${k(spot.w)}; height: ${k(spot.h)};
        transform: translate(calc(-50% + ${k(spot.dx)}), calc(-50% + ${k(spot.dy)}));"
      @click=${(ev) => {
        ev.stopPropagation();
        this._moreInfo(id);
      }}>
      ${url ? b`<img alt="" src=${url} />` : b`<ha-icon icon="mdi:cctv"></ha-icon>`}
      ${unavailable
        ? A
        : b`<button class="camthumb-reload ${thumb.loading ? 'loading' : ''}" title="Reload the picture"
            @click=${(ev) => {
              ev.stopPropagation();
              this._reloadThumb(id);
            }}><ha-icon icon="mdi:refresh"></ha-icon></button>`}
    </div>`;
    }

    // Latest good thumbnail of a camera (an image URL), or null until one has loaded. It comes from
    // thumbCache (shared by the cards, kept between visits); a new snapshot is loaded once it is older
    // than THUMB_INTERVAL, or on demand (_reloadThumb). One that fails to load or comes out black is
    // dropped: the previous one stays (also while the camera is unavailable), and the next try waits
    // THUMB_INTERVAL as well.
    _thumb(st) {
      const id = st.entity_id;
      const thumb = thumbCache.get(id);
      thumb.cards.add(this);
      if (thumb.aspect && !this._aspects[id]) this._aspects[id] = thumb.aspect;
      const pic = !isUnavailable(st) && st.attributes.entity_picture;
      const now = Date.now();
      const due = thumb.force || now - Math.max(thumb.time, thumb.tried) >= THUMB_INTERVAL * 1000;
      if (pic && due && !thumb.loading) {
        thumb.force = false;
        thumb.tried = now;
        thumb.loading = true;
        const url = `${pic}${pic.includes('?') ? '&' : '?'}t=thumb${now}`;
        const img = new Image();
        const done = (good) => {
          thumb.loading = false;
          const snap = good ? readSnapshot(img) : null;
          if (snap && !snap.black) {
            // The JPEG copy, or the picture's URL when the canvas can't read it (not kept then).
            thumb.url = snap.data || url;
            thumb.aspect = img.naturalWidth / img.naturalHeight;
            thumb.time = Date.now();
            thumbCache.save();
          }
          // Every card showing this camera, still on the page.
          for (const card of thumb.cards) {
            if (!card.isConnected) {
              thumb.cards.delete(card);
              continue;
            }
            if (snap && !snap.black) card._learnAspect(id, img);
            card.requestUpdate();
          }
        };
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = url;
      }
      return thumb.url;
    }

    _reloadThumb(id) {
      const thumb = thumbCache.get(id);
      if (thumb.loading) return;
      thumb.force = true;
      this.requestUpdate();
    }

    _previewEnter(ev, item) {
      if (ev.pointerType !== 'mouse') return;
      clearTimeout(this._previewTimer);
      if (this._camHover === item.id) return;
      this._camHover = item.id;
      this._tick++; // a fresh snapshot
    }

    _previewLeave(ev) {
      if (ev.pointerType !== 'mouse') return;
      clearTimeout(this._previewTimer);
      this._previewTimer = setTimeout(() => (this._camHover = null), PREVIEW_LEAVE_MS);
    }

    _togglePreview(id) {
      clearTimeout(this._previewTimer);
      this._camHover = null;
      this._camPinned = this._camPinned === id ? null : id;
      if (this._camPinned) this._tick++;
    }

    _closePreviews() {
      clearTimeout(this._previewTimer);
      this._camHover = null;
      this._camPinned = null;
    }

    _icon(item) {
      if (item.icon) return b`<ha-icon icon=${item.icon}></ha-icon>`;
      return b`<ha-state-icon .hass=${this.hass} .stateObj=${item.st}></ha-state-icon>`;
    }

    _renderWindow(item, { px, py, pw, ph }) {
      const wall = item.wall;
      const len = Math.min(num(item.length, WINDOW_LENGTH), wall.b - wall.a);
      const center = clamp(wall.pos, wall.a + len / 2, wall.b - len / 2);
      const style =
        wall.o === 'h'
          ? `left: ${px(center - len / 2)}%; width: ${pw(len)}%; top: ${py(wall.at)}%;`
          : `top: ${py(center - len / 2)}%; height: ${ph(len)}%; left: ${px(wall.at)}%;`;

      const st = item.st;
      let pos = coverPosition(st);
      const pending = this._pending[item.id];
      if (pending && Date.now() < pending.until && Math.abs(pending.pos - pos) > 1) pos = pending.pos;
      if (this._coverDrag && this._coverDrag.id === item.id) pos = this._coverDrag.pos;
      const moving = st.state === 'opening' || st.state === 'closing';
      const dim = this._selectedRoom !== null && item.room !== this._selectedRoom ? 'dim' : '';

      return b`
      <div
        class="window ${wall.o} ${moving ? 'moving' : ''} ${isUnavailable(st) ? 'unavailable' : ''} ${dim}"
        style="${style} --closed: ${100 - pos}%;"
        title="${item.name || friendlyName(this.hass, item.id)}: ${formatState(this.hass, st)}"
        @pointerdown=${(ev) => this._windowDown(ev, item)}
        @pointermove=${(ev) => this._windowMove(ev)}
        @pointerup=${(ev) => this._windowUp(ev)}
        @pointercancel=${() => this._windowCancel()}
        @click=${(ev) => ev.stopPropagation()}
      >
        <div class="glass"></div>
        <div class="shutter"></div>
        ${this._coverDrag && this._coverDrag.id === item.id ? b`<div class="bubble">${pos}%</div>` : A}
      </div>
    `;
    }

    _renderPanel(room) {
      const order = ['temperature', 'humidity', 'light', 'cover', 'device', 'opening', 'presence', 'sensor'];
      const items = [...room.items].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
      this._panelCameras = items.some((it) => it.role === 'camera' && it.st && !isUnavailable(it.st));
      return b`
      <div class="panel">
        <div class="panel-header">
          ${room.icon ? b`<ha-icon icon=${room.icon}></ha-icon>` : A}
          <span class="panel-title">${room.name || 'Room'}</span>
          ${this._renderClimate(room)}
          <button class="close" title="Close" @click=${() => (this._selectedRoom = null)}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${items.length
          ? items.map((item) => this._renderRow(item))
          : b`<div class="panel-empty">No device placed in this room.</div>`}
      </div>
    `;
    }

    // A room's temperature and humidity, as in its label on the plan.
    _renderClimate(room) {
      const { temp, hum } = roomClimate(this.hass, room);
      if (!temp && !hum) return A;
      return b`<div class="climate">
      ${temp ? b`<span class="temp">${temp}</span>` : A}
      ${hum ? b`<span class="hum"><ha-icon icon="mdi:water-percent"></ha-icon>${hum}</span>` : A}
    </div>`;
    }

    _renderRow(item) {
      const st = item.st;
      const name = item.name || friendlyName(this.hass, item.id);
      if (!st) {
        return b`<div class="row missing">
        <ha-icon icon="mdi:help-circle-outline"></ha-icon>
        <span class="row-name">${item.id}</span>
        <span class="row-state">Entity not found</span>
      </div>`;
      }
      const domain = domainOf(item.id);
      const unavailable = isUnavailable(st);
      let control;
      if (unavailable) {
        control = b`<span class="row-state">${formatState(this.hass, st)}</span>`;
      } else if (TOGGLE_DOMAINS$1.includes(domain)) {
        control = b`<button
        class="toggle ${st.state === 'on' ? 'on' : ''}"
        role="switch"
        aria-checked=${st.state === 'on'}
        title="Toggle"
        @click=${() => this._toggle(item.id)}
      ><span></span></button>`;
      } else if (domain === 'cover' && supportsSetPosition(st)) {
        control = b`<span class="row-state">${coverPosition(st)}%</span>
        <input type="range" min="0" max="100" .value=${String(coverPosition(st))}
          @change=${(ev) => this._setCover(st, Number(ev.target.value))} />`;
      } else if (domain === 'cover') {
        control = b`<span class="row-state">${formatState(this.hass, st)}</span>
        <button class="icon-btn" title="Open" @click=${() => this._call('cover', 'open_cover', item.id)}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="icon-btn" title="Close" @click=${() => this._call('cover', 'close_cover', item.id)}><ha-icon icon="mdi:arrow-down"></ha-icon></button>`;
      } else if (RUN_SERVICES[domain]) {
        control = b`<button class="run" @click=${() => this._call(domain, RUN_SERVICES[domain], item.id)}>Run</button>`;
      } else {
        control = b`<span class="row-state">${formatState(this.hass, st)}</span>`;
      }
      return b`<div class="row ${unavailable ? 'unavailable' : ''} ${isActive(st) ? 'active' : ''}">
        <button class="row-main" @click=${() => this._moreInfo(item.id)}>
          ${this._icon(item)}
          <span class="row-name">${name}</span>
        </button>
        ${control}
      </div>
      ${domain === 'camera' && !unavailable
        ? b`<button class="row-cam" title="Open the live view" style="aspect-ratio: ${this._aspects[item.id] || 16 / 9};"
            @click=${() => this._moreInfo(item.id)}>${this._cameraImage(st, false)}</button>`
        : A}`;
    }

    // --- 3D view -------------------------------------------------------------

    _wallHeight() {
      return Math.max(1, num(this.config.wall_height, WALL_HEIGHT));
    }

    // Floors shown in 3D: up to the returned index; floors.length means the whole home, with its roof.
    _level(floors) {
      if (this._level3d !== null) return clamp(this._level3d, 0, floors.length);
      return this.config.roof === false ? floors.length - 1 : floors.length;
    }

    _setLevel(level) {
      this._level3d = level;
      this._focus = null;
    }

    // Size of the 3D viewport and its perspective distance (px).
    _viewport3d() {
      const w = Math.max(200, (this._width || 600) - 2 * CARD_PADDING);
      const h = Math.round(clamp(w * 0.62, 260, Math.max(260, window.innerHeight * 0.75)));
      return { w, h, p: Math.round(1.6 * Math.max(w, 400)) };
    }

    // Every floor resolved and stacked: floor k stands at z0.
    _plans3d(floors, level) {
      const H = this._wallHeight();
      const top = Math.min(level, floors.length - 1);
      const all = floors.map((f, k) => ({ ...resolveFloor(this.hass, f), k, z0: k * (H + SLAB) }));
      return { H, top, roof: level >= floors.length, all, shown: all.slice(0, top + 1) };
    }

    // Point of view framing the shown floors, used until the user moves the view.
    _homeView(s, vp) {
      const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      for (const p of s.shown) {
        b.minX = Math.min(b.minX, p.bounds.minX);
        b.minY = Math.min(b.minY, p.bounds.minY);
        b.maxX = Math.max(b.maxX, p.bounds.maxX);
        b.maxY = Math.max(b.maxY, p.bounds.maxY);
      }
      const zTop = s.shown[s.top].z0 + s.H;
      const diag = Math.hypot(b.maxX - b.minX, b.maxY - b.minY, zTop) * U3;
      return {
        ...ORBIT_DEFAULT,
        target: [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, zTop / 3],
        dist: (vp.p * diag) / Math.min(0.8 * vp.w, 1.1 * vp.h),
      };
    }

    _currentOrbit() {
      return { ...(this._orbit || this._scene3dState.home) };
    }

    _renderScene3d(floors, level) {
      const vp = this._viewport3d();
      const s = this._plans3d(floors, level);
      const home = this._homeView(s, vp);
      const target = this._orbit || home;
      // Drawn now: on its way to `target` after a jump (a tap on a camera, the home button…).
      const orbit = this._shownOrbit(target);
      const a = toRad(orbit.az);
      const t = toRad(orbit.tilt);
      const d = orbit.dist / U3;
      const eye = [
        orbit.target[0] + Math.sin(t) * Math.sin(a) * d,
        orbit.target[1] + Math.sin(t) * Math.cos(a) * d,
        orbit.target[2] + Math.cos(t) * d,
      ];
      const mode = this.config.screen_mode || 'world';
      const dark = !!(this.hass.themes && this.hass.themes.darkMode);
      const { meshes, occluders, screens, radius } = this._buildScene(s, eye, [Math.sin(a), Math.cos(a)], mode, this._colors3d(dark));
      // Every camera of the home, for the camera bar, even those whose floor isn't shown.
      const cameras = s.all.flatMap((p) => p.items.filter((it) => it.role === 'camera').map((it) => ({ id: it.id, item: it, k: p.k })));
      this._scene3dState = { vp, home, screens, cameras, floors: floors.length, orbit };
      const near = Math.max(1, orbit.dist * 0.01);
      this._frame3d = { meshes, occluders, view: viewMatrix(orbit, vp, near, orbit.dist + 2 * radius * U3 + 100), vp, eye };
      // Billboards are laid out for where the view goes: they slide there (CSS transition).
      const boards = mode === 'billboard' && !this._focus ? this._layoutBillboards(screens, target, vp) : [];
      const focused = this._focus ? screens.find((sc) => sc.id === this._focus) : null;

      return b`
      <div
        class="view3d ${this._dragging3d ? 'dragging' : ''} ${dark ? 'dark' : ''}"
        style="height: ${vp.h}px;"
        @pointerdown=${this._down3d}
        @pointermove=${this._move3d}
        @pointerup=${this._up3d}
        @pointercancel=${this._up3d}
        @wheel=${this._wheelListener}
        @dblclick=${this._resetView}
        @contextmenu=${(ev) => ev.preventDefault()}
      >
        <canvas class="gl3d"></canvas>
        ${this._glFailed ? b`<div class="gl-error">The 3D view needs WebGL, which this browser doesn't provide.</div>` : A}
        ${focused ? this._renderFocusScreen(focused, orbit, vp) : A}
        ${boards.length ? this._renderBillboards(boards) : A}
        ${this._renderCameraBar()}
        <div class="tools">
          <button class="tool" title="Zoom in" @click=${() => this._zoom3d(1 / 1.3)}><ha-icon icon="mdi:plus"></ha-icon></button>
          <button class="tool" title="Zoom out" @click=${() => this._zoom3d(1.3)}><ha-icon icon="mdi:minus"></ha-icon></button>
          <button class="tool" title="Whole home (Escape)" @click=${this._resetView}><ha-icon icon="mdi:home-outline"></ha-icon></button>
        </div>
        ${this._focus ? b`<div class="hint3d">Tap the screen again for the camera's details</div>` : A}
        <div class="icon-probe">${[...this._iconPaths].filter(([, p]) => !p).map(([icon]) => b`<ha-icon .icon=${icon} data-icon=${icon}></ha-icon>`)}</div>
      </div>
    `;
    }

    // Draws the frame that render() prepared, once the canvas is in the page.
    _draw3d() {
      const frame = this._frame3d;
      const canvas = this.renderRoot.querySelector('canvas.gl3d');
      if (!frame || !canvas) {
        this._dropGl();
        return;
      }
      if (!this._gl || this._gl.canvas !== canvas) {
        this._dropGl();
        try {
          this._gl = new GlScene(canvas, () => this.requestUpdate());
        } catch (err) {
          console.error('Floorplan card: WebGL setup failed', err);
        }
        const failed = !this._gl || !this._gl.gl;
        if (failed !== !!this._glFailed) this._glFailed = failed;
      }
      if (this._gl && this._gl.ok) this._gl.draw(frame.meshes, frame.view, frame.vp.w, frame.vp.h, frame.eye, frame.occluders);
    }

    _dropGl() {
      if (this._gl) this._gl.destroy();
      this._gl = null;
    }

    // Point of view to draw now, for the one wanted (`target`): it eases there in ORBIT_EASE_MS when
    // `target` jumps, and follows it right away while the user drags.
    _shownOrbit(target) {
      const now = performance.now();
      const key = JSON.stringify(target);
      let anim = this._orbitAnim;
      if (!anim || anim.key !== key) {
        const from = anim && !this._dragging3d ? this._orbitAt(anim, now) : target;
        anim = this._orbitAnim = { key, from, to: target, t0: now };
      }
      const orbit = this._orbitAt(anim, now);
      if (orbit !== anim.to && !this._easeFrame) {
        this._easeFrame = requestAnimationFrame(() => {
          this._easeFrame = null;
          this.requestUpdate();
        });
      }
      return orbit;
    }

    _orbitAt(anim, now) {
      const k = clamp((now - anim.t0) / ORBIT_EASE_MS, 0, 1);
      if (k >= 1) return anim.to;
      const e = 1 - (1 - k) ** 3;
      const { from, to } = anim;
      const lerp = (x, y) => x + (y - x) * e;
      return {
        az: lerp(from.az, to.az),
        tilt: lerp(from.tilt, to.tilt),
        dist: from.dist * (to.dist / from.dist) ** e,
        target: [0, 1, 2].map((i) => lerp(from.target[i], to.target[i])),
      };
    }

    // Colors of the 3D scene, from the --fp3-* tokens (a theme can change them).
    _colors3d(dark) {
      const cached = this._colors3dCache;
      if (cached && cached.dark === dark && cached.themes === this.hass.themes) return cached.colors;
      const cs = getComputedStyle(this);
      const get = (name) => parseColor(cs.getPropertyValue(name));
      const ground = get('--fp3-ground');
      const colors = {
        wall: get('--fp3-wall'),
        cap: get('--fp3-cap'),
        floor: get('--fp3-floor'),
        roof: get('--fp3-roof'),
        ground: dark ? darken(ground, 0.55) : ground,
        terrace: get('--fp3-terrace'),
        beam: parseColor(`rgb(${cs.getPropertyValue('--fp3-beam')})`),
        camera: parseColor('#4a5058'),
        frame: parseColor('#f5f2ec'),
        glass: [parseColor('#b9e4ff'), parseColor('#6fb6e6')],
        shutter: parseColor('#87909a'),
        warning: cs.getPropertyValue('--warning-color').trim() || '#ffa600',
        font: cs.fontFamily || 'sans-serif',
      };
      this._colors3dCache = { dark, themes: this.hass.themes, colors };
      return colors;
    }

    // SVG path of an icon (mdi:…), or null until Home Assistant has loaded it: hidden ha-icon
    // elements (.icon-probe) load the icons asked for, then _probeIcons() reads their paths.
    _iconPath(icon) {
      if (!this._iconPaths.has(icon)) this._iconPaths.set(icon, null);
      return this._iconPaths.get(icon);
    }

    _probeIcons(tries = 0) {
      clearTimeout(this._iconTimer);
      const probes = [...this.renderRoot.querySelectorAll('.icon-probe ha-icon')];
      if (!probes.length) return;
      let found = false;
      for (const el of probes) {
        const svg = el.shadowRoot && el.shadowRoot.querySelector('ha-svg-icon');
        if (svg && svg.path) {
          this._iconPaths.set(el.dataset.icon, svg.path);
          found = true;
        }
      }
      if (found) this.requestUpdate();
      else if (tries < 50) this._iconTimer = setTimeout(() => this._probeIcons(tries + 1), 100);
    }

    // Latest snapshot of a camera loaded for the 3D scene ({ url, img, aspect }), or null until one
    // has loaded. A new one is loaded at each refresh tick; the previous one stays shown meanwhile.
    _snapshot(st) {
      const pic = st && !isUnavailable(st) && st.attributes.entity_picture;
      if (!pic) return null;
      const id = st.entity_id;
      const url = `${pic}${pic.includes('?') ? '&' : '?'}t=${this._tick}`;
      const snap = this._snaps[id] || (this._snaps[id] = { shown: null, loading: null, failed: null });
      if (snap.loading !== url && snap.failed !== url && (!snap.shown || snap.shown.url !== url)) {
        snap.loading = url;
        const img = new Image();
        if (new URL(url, location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (snap.loading !== url) return;
          snap.loading = null;
          snap.shown = { url, img, aspect: img.naturalWidth / img.naturalHeight };
          this._learnAspect(id, img);
          this.requestUpdate();
        };
        img.onerror = () => {
          if (snap.loading === url) snap.loading = null;
          snap.failed = url;
        };
        img.src = url;
      }
      return snap.shown;
    }

    // Picture a camera projects in 3D ({ url, img, aspect }), or null until one has loaded. With a
    // reference picture (captured in the editor, `reference_picture`), `projection_picture: frozen`
    // always projects it: the camera was aligned on it. `live` projects a snapshot taken every
    // LIVE_PROJECTION_INTERVAL instead, as long as it still looks like the reference; one that doesn't
    // is never projected and flags the camera as moved. `snapshot`, or no reference: see _snapshot().
    _projectionPicture(it) {
      const mode = this.config.projection_picture || 'frozen';
      const refId = it.conf.reference_picture;
      if (mode === 'snapshot' || !refId) return this._snapshot(it.st);
      const id = it.id;
      const pp = this._projPics[id] || (this._projPics[id] = { ref: null, refUrl: null, good: null, moved: false, checking: false, checked: 0 });
      const refUrl = uploadedImageUrl(refId);
      if (pp.refUrl !== refUrl) {
        Object.assign(pp, { ref: null, refUrl, refFailed: false, good: null, moved: false, checked: 0 });
        loadImage(refUrl).then((img) => {
          if (pp.refUrl !== refUrl) return;
          if (img) {
            pp.ref = { url: refUrl, img, aspect: img.naturalWidth / img.naturalHeight, edges: pictureEdges(img) };
            this._learnAspect(id, img);
          } else pp.refFailed = true;
          this.requestUpdate();
        });
      }
      // The reference is gone (deleted from the uploaded images): back to the snapshots.
      if (pp.refFailed) return this._snapshot(it.st);
      if (!pp.ref) return null;
      const pic = mode === 'live' && it.st && !isUnavailable(it.st) && it.st.attributes.entity_picture;
      if (pic && !pp.checking && Date.now() - pp.checked >= LIVE_PROJECTION_INTERVAL * 1000) {
        pp.checking = true;
        pp.checked = Date.now();
        const url = `${pic}${pic.includes('?') ? '&' : '?'}t=live${pp.checked}`;
        loadImage(url).then((img) => {
          pp.checking = false;
          if (pp.refUrl !== refUrl || !img) return;
          const verdict = matchPicture(pp.ref.edges, pictureEdges(img));
          if (verdict === 'match') pp.good = { url, img, aspect: img.naturalWidth / img.naturalHeight };
          if (verdict !== 'rejected') pp.moved = verdict === 'moved';
          this.requestUpdate();
        });
      }
      return (mode === 'live' && pp.good) || pp.ref;
    }

    // Whether a camera's last snapshot no longer looks like its reference picture (`projection_picture: live`).
    _cameraMoved(item) {
      const pp = this._projPics[item.id];
      return !!(pp && pp.moved && item.conf.projection && this.config.projection_picture === 'live' && pp.refUrl === uploadedImageUrl(item.conf.reference_picture));
    }

    // Meshes of the scene for a point of view: `eye` is the viewer's position, `toViewer` the
    // horizontal direction from the scene towards the viewer (walls facing it are cut away).
    _buildScene(s, eye, toViewer, mode, colors) {
      const H = s.H;
      const meshes = [];
      const screens = [];
      const { min, max } = this._tempRange();
      const X = [1, 0, 0];
      const Y = [0, 1, 0];
      const add = (mesh) => {
        meshes.push(mesh);
        return mesh;
      };
      // Room names on the floor turn by quarter turns, so that they read upright from the viewer.
      const labelTurn = (((Math.round(-Math.atan2(toViewer[0], toViewer[1]) / (Math.PI / 2)) * 90) % 360) + 360) % 360;

      // Cameras first: the walls between the viewer and the screen zoomed on are cut away.
      let sight = null;
      const projectors = [];
      for (const p of s.shown) {
        for (const it of p.items) {
          if (it.role !== 'camera') continue;
          const indoor = it.camera.indoor;
          // Hidden inside the home (under the roof or a floor above): not rendered, no snapshot loaded.
          if (indoor && (s.roof || p.k < s.top)) continue;
          // The screen zoomed on is always in the scene, whatever the screen mode.
          const sc = this._camera3d(it, p, indoor, H, eye, add, mode === 'world' || this._focus === it.id, colors);
          screens.push(sc);
          if (this._focus === it.id) sight = [[eye[0], eye[1]], [sc.center[0], sc.center[1]]];
          else if (sc.inWorld) {
            // A projecting camera's screen would hide part of its projection and repeat it: faint.
            const alpha = sc.projecting ? PROJECTING_SCREEN.alpha : 1;
            add(new Mesh(MODE.texture, { tex: this._screenTexture(sc, colors), transparent: alpha < 1 })).poly(
              sc.pts,
              [1, 1, 1, alpha],
              sc.back ? [UV_QUAD[1], UV_QUAD[0], UV_QUAD[3], UV_QUAD[2]] : UV_QUAD
            );
          }
          const snap = it.conf.projection ? this._projectionPicture(it) : null;
          if (snap) {
            const { C, fwd, right, up, f, k, sx, base, stretch, shift } = sc.pose;
            projectors.push({
              k: p.k,
              indoor,
              pose: sc.pose,
              room: indoor ? p.indoor[roomAt(p.indoor, it.x, it.y)] : null,
              // Indoors, a picture only goes onto its own room: nothing can hide it.
              mesh: () =>
                new Mesh(MODE.picture, {
                  tex: { key: `picture:${snap.url}`, source: () => scaledPicture(snap.img, PICTURE_PX) },
                  proj: { C, fwd, right, up, f, k, sx, base, stretch, shift, warp: pinWarp(sc.pose, snap.aspect), aspect: snap.aspect, reach: PROJ_REACH, shadow: !indoor, key: it.id },
                }),
            });
          }
        }
      }
      // What hides the outdoor pictures: the home as it stands, every floor with its outer walls up
      // and its roof on, whatever the view shows or cuts away.
      let occluders = null;
      if (projectors.some((pr) => !pr.indoor)) {
        occluders = new Mesh();
        for (const p of s.all) {
          for (const seg of wallSegments(p.indoor)) {
            if (!seg.normal) continue;
            const o = seg.o === 'h' ? [seg.a, seg.at, p.z0 + H] : [seg.at, seg.a, p.z0 + H];
            const bottom = p.k > 0 ? p.z0 - SLAB : 0;
            occluders.poly(quad(o, mul3(seg.o === 'h' ? X : Y, seg.b - seg.a), [0, 0, bottom - p.z0 - H]), [0, 0, 0, 1]);
          }
          const above = s.all.filter((q) => q.k > p.k).flatMap((q) => q.indoor);
          for (const slope of floorRoof(p.indoor, above, p.z0 + H)) occluders.poly(slope.pts, [0, 0, 0, 1]);
        }
      }
      // A projected picture goes onto the floor and walls of the camera's room, or outdoors onto the
      // ground, the outdoor rooms of its floor, and the outer walls and roof slopes facing it (minus
      // what the occluders hide from the camera).
      const indoorProjectors = (k, room = null) => projectors.filter((pr) => pr.indoor && pr.room && pr.k === k && (!room || pr.room.group === room.group));
      const outdoorProjectors = (k) => projectors.filter((pr) => !pr.indoor && (k === null || pr.k === k));
      // Pictures of `list` cast onto the polygon `pts`, over `mesh`.
      const project = (mesh, list, pts, alpha = 1) => list.forEach((pr) => mesh.overlay(pr.mesh().poly(pts, [1, 1, 1, alpha])));

      // Lawn around the home: an ellipse fading out at its edge.
      const g = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      for (const p of s.all) {
        g.minX = Math.min(g.minX, p.bounds.minX - GROUND_MARGIN);
        g.minY = Math.min(g.minY, p.bounds.minY - GROUND_MARGIN);
        g.maxX = Math.max(g.maxX, p.bounds.maxX + GROUND_MARGIN);
        g.maxY = Math.max(g.maxY, p.bounds.maxY + GROUND_MARGIN);
      }
      const lawn = (mesh, color) => {
        const c = [(g.minX + g.maxX) / 2, (g.minY + g.maxY) / 2, -0.02];
        const at = (i, k) => {
          const ang = (i / 48) * 2 * Math.PI;
          return [c[0] + (Math.cos(ang) * k * (g.maxX - g.minX)) / 2, c[1] + (Math.sin(ang) * k * (g.maxY - g.minY)) / 2, c[2]];
        };
        const clear = [...color.slice(0, 3), 0];
        for (let i = 0; i < 48; i++) {
          mesh.poly([c, at(i, 0.7), at(i + 1, 0.7)], color);
          mesh.poly([at(i, 0.7), at(i, 1), at(i + 1, 1), at(i + 1, 0.7)], [color, clear, clear, color]);
        }
        return mesh;
      };
      const ground = add(lawn(new Mesh(), colors.ground));
      outdoorProjectors(null).forEach((pr) => ground.overlay(lawn(pr.mesh(), [1, 1, 1, 1])));

      for (const p of s.shown) {
        const isTop = p.k === s.top;
        const cutaway = isTop && !s.roof;

        for (const room of p.rooms) {
          const f0z = p.z0 + (room.outdoor ? 0.005 : 0.01);
          const pts = quad([room.x, room.y, f0z], [room.w, 0, 0], [0, room.h, 0]);
          let color = room.outdoor ? mix(colors.terrace, colors.ground, 0.2) : colors.floor;
          const temp = room.outdoor ? null : roomTemperature(room);
          if (temp !== null) color = mix(color, [...tempRgb(temp, min, max).map((v) => v / 255), 1], 0.25);
          const floor = add(new Mesh().poly(pts, color));
          for (const it of room.lights) {
            if (!isActive(it.st)) continue;
            const c = lightRgb(it.st).map((v) => v / 255);
            const b = typeof it.st.attributes.brightness === 'number' ? it.st.attributes.brightness / 255 : 1;
            const R = Math.max(room.bbox.w, room.bbox.h) * 0.7;
            floor.overlay(new Mesh(MODE.glow).poly(pts, [...c, 0.35 + 0.5 * b], pts.map((q) => [(q[0] - it.x) / R, (q[1] - it.y) / R, 0, 0])));
          }
          project(floor, room.outdoor ? outdoorProjectors(p.k) : indoorProjectors(p.k, room), pts);
          if (cutaway && room.main && (room.name || room.temps.length || room.hums.length)) this._roomLabel(floor, room, f0z, labelTurn, colors);
        }

        // Walls: the outer ones on every floor shown (they also cover the slab), the inner ones only
        // on the top floor when the roof is off. Those facing the viewer are cut low, like a dollhouse.
        const segments = wallSegments(p.indoor);
        for (const seg of segments) {
          const outer = !!seg.normal;
          if (!outer && !cutaway) continue;
          const ends = seg.o === 'h' ? [[seg.a, seg.at], [seg.b, seg.at]] : [[seg.at, seg.a], [seg.at, seg.b]];
          seg.cut =
            (cutaway && outer && seg.normal[0] * toViewer[0] + seg.normal[1] * toViewer[1] > 0.2) ||
            (!!sight && segmentsCross(sight[0], sight[1], ends[0], ends[1]));
          const top = p.z0 + (seg.cut ? CUT_HEIGHT : H);
          const bottom = p.k > 0 ? p.z0 - SLAB : 0;
          const dir = seg.o === 'h' ? X : Y;
          const u = mul3(dir, seg.b - seg.a);
          const o = [...ends[0], top];
          const n = seg.o === 'h' ? Y : X;
          const alpha = outer ? 1 : 0.55;
          const wall = add(new Mesh(MODE.flat, { transparent: !outer }).poly(quad(o, u, [0, 0, bottom - top]), darken(colors.wall, shade(n), alpha)));
          // Pictures of the cameras of the rooms along this wall, above their floor.
          for (const pr of indoorProjectors(p.k)) {
            // The zone of the camera's room along this wall, if any.
            let r = null;
            let a = 0;
            let b = 0;
            for (const z of pr.room.zones) {
              const edge = roomEdges(z).find((e) => e.o === seg.o && Math.abs(e.at - seg.at) < ON_WALL_EPS && Math.min(seg.b, e.b) - Math.max(seg.a, e.a) >= ON_WALL_EPS);
              if (edge) [r, a, b] = [z, Math.max(seg.a, edge.a), Math.min(seg.b, edge.b)];
            }
            if (!r) continue;
            // Seen from the room only: from the other side, the wall hides what the camera sees.
            const roomSide = (seg.o === 'h' ? r.y + r.h / 2 : r.x + r.w / 2) - seg.at;
            if (roomSide * ((seg.o === 'h' ? eye[1] : eye[0]) - seg.at) <= 0) continue;
            project(wall, [pr], quad(add3(o, mul3(dir, a - seg.a)), mul3(dir, b - a), [0, 0, p.z0 - top]), alpha);
          }
          // Outer walls facing an outdoor camera, seen from outside.
          if (outer) {
            const k = seg.o === 'h' ? 1 : 0;
            for (const pr of outdoorProjectors(null)) {
              if ((pr.pose.C[k] - seg.at) * seg.normal[k] <= 0.05 || (eye[k] - seg.at) * seg.normal[k] <= 0) continue;
              project(wall, [pr], quad(o, u, [0, 0, bottom - top]));
            }
          }
          const capOrigin = seg.o === 'h' ? [seg.a, seg.at - WALL_CAP / 2, top] : [seg.at - WALL_CAP / 2, seg.a, top];
          add(new Mesh().poly(quad(capOrigin, u, seg.o === 'h' ? [0, WALL_CAP, 0] : [WALL_CAP, 0, 0]), colors.cap));
        }

        // Windows: covers on an outer wall, on both sides of it.
        for (const it of p.items) {
          if (it.role !== 'cover' || !it.wall || !it.st) continue;
          const w = it.wall;
          const seg = segments.find(
            (sg) => sg.normal && sg.o === w.o && Math.abs(sg.at - w.at) < ON_WALL_EPS && w.pos >= sg.a - ON_WALL_EPS && w.pos <= sg.b + ON_WALL_EPS
          );
          if (!seg || seg.cut) continue;
          const len = Math.min(num(it.length, WINDOW_LENGTH), w.b - w.a);
          const center = clamp(w.pos, w.a + len / 2, w.b - len / 2);
          // A floor-length window (French window, bay window) starts at the floor.
          const sill = p.z0 + (it.conf.floor_length ? 0 : H * 0.36);
          const top = p.z0 + H * 0.84;
          for (const side of [0.02, -0.02]) {
            const o = seg.o === 'h' ? [center - len / 2, seg.at + seg.normal[1] * side, top] : [seg.at + seg.normal[0] * side, center - len / 2, top];
            this._window3d(add, o, seg.o === 'h' ? X : Y, len, top - sill, isUnavailable(it.st), coverPosition(it.st), colors);
          }
        }
      }

      // Roofs: on each floor shown, over the part that no floor shown above covers.
      for (const p of s.roof ? s.shown : s.shown.slice(0, -1)) {
        const above = s.shown.filter((q) => q.k > p.k).flatMap((q) => q.indoor);
        for (const slope of floorRoof(p.indoor, above, p.z0 + H)) {
          // Tiles: a darker line every 25 cm up the slope.
          const { o, b, up } = slope.plane;
          const uvs = slope.pts.map((P) => [0, dot3(sub3(P, o), b) / 0.25, 22 / 25, 0.84]);
          const roof = add(new Mesh(MODE.stripes).poly(slope.pts, darken(colors.roof, shade(slope.n, 45)), uvs));
          // Slopes facing an outdoor camera get its picture.
          project(roof, outdoorProjectors(null).filter((pr) => dot3(sub3(pr.pose.C, o), up) > 0.05 && dot3(sub3(eye, o), up) > 0), slope.pts);
        }
      }
      const radius = Math.hypot(g.maxX - g.minX, g.maxY - g.minY, s.all.length * (H + SLAB) + H);
      return { meshes, occluders, screens, radius };
    }

    // A window of `len` x `height` on a wall, its top-left corner at `o` and its length along `dir`:
    // a frame, the glass, and the shutter coming down as the cover closes.
    _window3d(add, o, dir, len, height, unavailable, position, colors) {
      const alpha = unavailable ? 0.5 : 1;
      const frame = add(new Mesh().poly(quad(o, mul3(dir, len), [0, 0, -height]), [...colors.frame.slice(0, 3), alpha]));
      const b = 0.04; // frame width
      const io = add3(add3(o, mul3(dir, b)), [0, 0, -b]);
      const iu = mul3(dir, len - 2 * b);
      const ih = height - 2 * b;
      // Glass: a gradient from the top-left corner (160deg in CSS terms).
      const [g0, g1] = colors.glass;
      const along = [0, len - 2 * b, len - 2 * b, 0].map((x, i) => x * 0.342 + (i > 1 ? ih : 0) * 0.94);
      const span = Math.max(...along) || 1;
      frame.overlay(new Mesh().poly(quad(io, iu, [0, 0, -ih]), along.map((v) => [...mix(g0, g1, v / span).slice(0, 3), alpha])));
      const closed = (100 - position) / 100;
      if (closed > 0) {
        const sh = [0, 0, 0.5, 0.8];
        const end = (ih * closed) / 0.12; // a slat every 12 cm
        frame.overlay(
          new Mesh(MODE.stripes).poly(quad(io, iu, [0, 0, -ih * closed]), [...colors.shutter.slice(0, 3), alpha], [sh, sh, [0, end, 0.5, 0.8], [0, end, 0.5, 0.8]])
        );
      }
    }

    // Name of a room on its floor (at height z), turned by `turn` degrees (a multiple of 90) around
    // the room, so that it reads upright from the viewer.
    _roomLabel(floor, room, z, turn, colors) {
      const PX = 200; // label px per grid unit
      const along = turn % 180 ? room.h : room.w;
      const maxWidth = Math.max(0, along - 0.32) * PX;
      if (maxWidth < 40) return;
      const icon = room.icon ? this._iconPath(room.icon) : null;
      const font = `500 60px ${colors.font}`;
      const small = `600 50px ${colors.font}`;
      const [, measure] = canvas2d(1, 1);
      measure.font = font;
      const iconW = room.icon ? 76 : 0;
      const text = fitText(measure, room.name || '', maxWidth - iconW);
      let w = iconW + measure.measureText(text).width + 4;
      // Its temperature and humidity on a second line, when the room is deep enough.
      const { temp, hum } = roomClimate(this.hass, room);
      const across = turn % 180 ? room.w : room.h;
      const climate = (temp || hum) && across >= 1.2 ? [temp, hum].filter(Boolean).join('  ·  ') : '';
      measure.font = small;
      const climateText = climate ? fitText(measure, climate, maxWidth) : '';
      if (climateText) w = Math.max(w, measure.measureText(climateText).width + 4);
      w = Math.min(maxWidth, w);
      const h = climateText ? 136 : 76;
      const key = `label:${room.name}:${room.icon || ''}:${!!icon}:${climateText}:${Math.round(maxWidth)}:${colors.font}`;
      const source = () => {
        const [c, ctx] = canvas2d(w, h);
        ctx.fillStyle = 'rgba(40, 30, 20, 0.75)';
        if (icon) drawIcon(ctx, icon, 0, 8, 60);
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, iconW, 40);
        if (climateText) {
          ctx.font = small;
          ctx.fillStyle = 'rgba(40, 30, 20, 0.9)';
          ctx.fillText(climateText, 0, 108);
        }
        return c;
      };
      // The label's frame: its corner of the room, then its axes turned by `turn`.
      const th = toRad(turn);
      const ex = [Math.cos(th), Math.sin(th), 0];
      const ey = [-Math.sin(th), Math.cos(th), 0];
      const corner = { 0: [0, 0], 90: [room.w, 0], 180: [room.w, room.h], 270: [0, room.h] }[turn];
      const o = add3(add3([room.x + corner[0], room.y + corner[1], z], mul3(ex, 0.16)), mul3(ey, 0.12));
      floor.overlay(new Mesh(MODE.texture, { tex: { key, source } }).poly(quad(o, mul3(ex, w / PX), mul3(ey, h / PX)), [1, 1, 1, 1], UV_QUAD));
    }

    // Texture of a camera's screen in the scene: its snapshot (or why there is none) and its name.
    _screenTexture(sc, colors) {
      const item = sc.item;
      const st = item.st;
      const snap = this._snapshot(st);
      const aspect = this._aspects[item.id] || 16 / 9;
      const w = SCREEN_PX;
      const h = Math.round(SCREEN_PX / aspect);
      const name = this._cameraName(item);
      let icon = null;
      let message = '';
      if (!st) {
        icon = 'mdi:help-circle-outline';
        message = `${item.id}: entity not found`;
      } else if (isUnavailable(st)) {
        icon = 'mdi:cctv-off';
        message = formatState(this.hass, st);
      } else if (!st.attributes.entity_picture) icon = 'mdi:cctv';
      const path = icon ? this._iconPath(icon) : null;
      const moved = this._cameraMoved(item);
      const key = `screen:${item.id}:${snap && !icon ? snap.url : ''}:${name}:${message}:${icon}:${!!path}:${h}:${moved}`;
      const source = () => {
        const [c, ctx] = canvas2d(w, h);
        const round = (x, y, rw, rh, r) => {
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, rw, rh, r);
          else ctx.rect(x, y, rw, rh);
        };
        const border = st ? 8 : 6;
        round(0, 0, w, h, 8);
        ctx.fillStyle = st ? '#1b1e22' : colors.warning;
        ctx.fill();
        ctx.fillStyle = st ? '#000' : '#222';
        ctx.fillRect(border, border, w - 2 * border, h - 2 * border);
        const iw = w - 2 * border;
        const ih = h - 2 * border;
        if (snap && !icon) {
          // object-fit: cover
          const k = Math.max(iw / snap.img.naturalWidth, ih / snap.img.naturalHeight);
          const sw = iw / k;
          const sh = ih / k;
          ctx.drawImage(snap.img, (snap.img.naturalWidth - sw) / 2, (snap.img.naturalHeight - sh) / 2, sw, sh, border, border, iw, ih);
        } else if (icon) {
          ctx.fillStyle = st ? '#9aa0a6' : colors.warning;
          const size = Math.min(72, ih * 0.4);
          drawIcon(ctx, path, (w - size) / 2, h / 2 - size * 0.8, size);
          ctx.font = `24px ${colors.font}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(fitText(ctx, message, iw - 32), w / 2, h / 2 + size * 0.3);
          ctx.textAlign = 'left';
        }
        if (moved) {
          ctx.font = `22px ${colors.font}`;
          const text = fitText(ctx, MOVED_MESSAGE, iw - 36);
          round(border + 8, border + 8, ctx.measureText(text).width + 20, 34, 6);
          ctx.fillStyle = colors.warning;
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, border + 18, border + 8 + 17);
        }
        // Name, bottom left.
        ctx.font = `20px ${colors.font}`;
        const label = fitText(ctx, name, iw - 36);
        const lw = ctx.measureText(label).width + 20;
        round(border + 8, h - border - 8 - 30, lw, 30, 6);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, border + 18, h - border - 8 - 15);
        return c;
      };
      return { key, source };
    }

    // A camera in 3D: its body, its screen in front of it (up to the first wall), and the beam between them.
    // `inWorld` false: the screen is shown elsewhere (or not at all), and a short beam shows where it looks.
    _camera3d(it, p, indoor, H, eye, add, inWorld, colors) {
      const cam = it.camera;
      const conf = it.conf;
      const pose = cameraPose(cam, [it.x, it.y, p.z0 + cameraHeight(cam, H)], p.z0);
      const { C, fwd, right, up } = pose;
      const t = toRad(cam.tilt);

      const maxDistance = Math.max(0.5, num(conf.screen_distance, SCREEN_DISTANCE));
      const flat = Math.max(0.4, cam.hit !== null ? Math.min(cam.hit - 0.2, maxDistance) : maxDistance);
      const dist = flat / Math.max(Math.cos(t), 0.2);
      const aspect = this._aspects[it.id] || 16 / 9;
      // Smaller when the camera projects its picture, except zoomed on.
      const projecting = !!conf.projection && this._focus !== it.id;
      let w = Math.min(2 * dist * Math.tan(toRad(cam.fov) / 2), Math.max(0.3, num(conf.screen_size, SCREEN_SIZE)));
      if (projecting) w *= PROJECTING_SCREEN.size;
      let h = w / aspect;
      const center = add3(C, mul3(fwd, dist));
      // Keep the screen above the floor, and below the ceiling indoors.
      const floorZ = p.z0 + 0.05;
      const ceilZ = indoor ? p.z0 + H - 0.05 : Infinity;
      let half = (h / 2) * Math.abs(up[2]);
      if (2 * half > ceilZ - floorZ) {
        const k = (ceilZ - floorZ) / (2 * half);
        w *= k;
        h *= k;
        half *= k;
      }
      if (center[2] - half < floorZ) center[2] = floorZ + half;
      if (center[2] + half > ceilZ) center[2] = ceilZ - half;

      // Seen from behind the camera, the image reads as the camera sees it.
      const tl = add3(sub3(center, mul3(right, w / 2)), mul3(up, h / 2));
      const u = mul3(right, w);
      const v = mul3(up, -h);
      const n = norm3(cross3(u, v));
      // From the other side (in front of the camera), the image is flipped so that it stays readable.
      const screen = { id: it.id, item: it, pts: quad(tl, u, v), tl, u, v, back: dot3(sub3(eye, center), n) < 0, center, w, h, cam, k: p.k, indoor, pose, inWorld, projecting };
      // Zoomed on: the view stands right behind the camera, whose body and beam would hide the screen.
      if (this._focus === it.id) return screen;

      const lens = add3(C, mul3(fwd, 0.17));
      let corners = screen.pts;
      if (!inWorld) corners = corners.map((c) => add3(C, mul3(sub3(c, C), SHORT_BEAM / dist)));
      const beam = add(new Mesh(MODE.flat, { transparent: true }));
      const edge = [...colors.beam.slice(0, 3), 0.3];
      const tip = [...colors.beam.slice(0, 3), 0.04];
      corners.forEach((c, i) => beam.poly([c, corners[(i + 1) % 4], lens], [edge, edge, tip]));
      boxFaces(C, mul3(fwd, 0.17), mul3(right, 0.1), mul3(up, 0.09)).forEach((bf, i) => {
        const color = darken(colors.camera, shade(bf.n, 40));
        if (i) {
          add(new Mesh().poly(bf.pts, color));
          return;
        }
        // The lens, on the front face: uv reaches 1 at its corners.
        const r = Math.hypot(bf.w, bf.h) / 2;
        const [a, b] = [bf.w / 2 / r, bf.h / 2 / r];
        add(new Mesh(MODE.lens).poly(bf.pts, color, [[-a, -b, 0, 0], [a, -b, 0, 0], [a, b, 0, 0], [-a, b, 0, 0]]));
      });
      return screen;
    }

    // The screen zoomed on, over the scene, where it stands in it: it plays the live stream.
    _renderFocusScreen(sc, orbit, vp) {
      const q = sc.pts.map((P) => this._project(orbit, vp, P));
      if (q.some((x) => !x)) return A;
      const aspect = this._aspects[sc.id] || 16 / 9;
      const w = SCREEN_PX;
      const h = Math.round(SCREEN_PX / aspect);
      const corners = sc.back ? [q[1], q[0], q[3], q[2]] : q;
      const st = sc.item.st;
      return b`<div class="f screen focused ${!st ? 'missing' : isUnavailable(st) ? 'unavailable' : ''}" data-id=${sc.id}
      title=${this._cameraName(sc.item)} style="width: ${w}px; height: ${h}px; transform: ${rectToQuad(w, h, corners)};">
      ${this._screenContent(sc.item, true)}
    </div>`;
    }

    // Camera screen of the scene under a point of the view (px from its top-left corner), or null.
    _screenAt(x, y) {
      const state = this._scene3dState;
      if (!state) return null;
      const { vp, orbit } = state;
      const a = toRad(orbit.az);
      const t = toRad(orbit.tilt);
      // World point seen at (x, y), at a depth D (px) from the viewer: inverse of _project().
      const at = (D) => {
        const x1 = ((x - vp.w / 2) * D) / vp.p;
        const yd = ((y - vp.h / 2) * D) / vp.p;
        const e = orbit.dist - D;
        const y1 = yd * Math.cos(t) + e * Math.sin(t);
        const z = -yd * Math.sin(t) + e * Math.cos(t);
        return add3(orbit.target, mul3([x1 * Math.cos(a) + y1 * Math.sin(a), -x1 * Math.sin(a) + y1 * Math.cos(a), z], 1 / U3));
      };
      const o = at(0);
      const dir = sub3(at(U3), o);
      let best = null;
      for (const sc of state.screens) {
        if (!sc.inWorld) continue;
        const n = cross3(sc.u, sc.v);
        const den = dot3(dir, n);
        if (Math.abs(den) < 1e-9) continue;
        const s = dot3(sub3(sc.tl, o), n) / den;
        if (s <= 0 || (best && s >= best.s)) continue;
        const P = sub3(add3(o, mul3(dir, s)), sc.tl);
        const u = dot3(P, sc.u) / dot3(sc.u, sc.u);
        const v = dot3(P, sc.v) / dot3(sc.v, sc.v);
        if (u >= 0 && u <= 1 && v >= 0 && v <= 1) best = { s, id: sc.id };
      }
      return best && best.id;
    }

    _cameraName(item) {
      return item.name || (item.st ? friendlyName(this.hass, item.id) : item.id);
    }

    // What a camera's screen shows: its picture and its name, or why it can't. `live`: see _cameraImage().
    _screenContent(item, live) {
      const st = item.st;
      let content;
      if (!st) {
        content = b`<div class="screen-msg"><ha-icon icon="mdi:help-circle-outline"></ha-icon><span>${item.id}: entity not found</span></div>`;
      } else if (isUnavailable(st)) {
        content = b`<div class="screen-msg"><ha-icon icon="mdi:cctv-off"></ha-icon><span>${formatState(this.hass, st)}</span></div>`;
      } else {
        content = this._cameraImage(st, live);
      }
      return b`<div class="screen-inner">
      ${content}<div class="screen-name">${this._cameraName(item)}</div>
      ${this._cameraMoved(item) ? b`<div class="screen-warn">${MOVED_MESSAGE}</div>` : A}
    </div>`;
    }

    // Floating screens (`screen_mode: billboard`): flat on the view, next to their camera, always readable.
    _renderBillboards(boards) {
      const vp = this._scene3dState.vp;
      return b`<div class="boards">
      <svg class="leaders" width=${vp.w} height=${vp.h}>
        ${boards.map(
          (b) => w`<line x1=${b.ax} y1=${b.ay} x2=${clamp(b.ax, b.x, b.x + b.w)} y2=${clamp(b.ay, b.y, b.y + b.h)}></line>
            <circle cx=${b.ax} cy=${b.ay} r="3.5"></circle>`
        )}
      </svg>
      ${c(
        boards,
        (b) => b.sc.id,
        (b$1) => {
          const st = b$1.sc.item.st;
          return b`<div class="board screen ${!st ? 'missing' : isUnavailable(st) ? 'unavailable' : ''} ${b$1.sc.item.conf.projection ? 'projecting' : ''}" data-id=${b$1.sc.id}
            title=${this._cameraName(b$1.sc.item)} style="left: ${b$1.x}px; top: ${b$1.y}px; width: ${b$1.w}px; height: ${b$1.h}px;">
            ${this._screenContent(b$1.sc.item)}
          </div>`;
        }
      )}
    </div>`;
    }

    // Where each billboard goes: next to its camera (above it when there is room), avoiding the others.
    _layoutBillboards(screens, orbit, vp) {
      const w = Math.round(clamp(vp.w * 0.2, 120, 220));
      const bottom = vp.h - STRIP_HEIGHT;
      const anchored = screens
        .map((sc) => ({ sc, at: this._project(orbit, vp, sc.pose.C) }))
        .filter((b) => b.at && b.at[0] >= 0 && b.at[0] <= vp.w && b.at[1] >= 0 && b.at[1] <= vp.h)
        .sort((a, b) => a.at[1] - b.at[1]);
      const placed = [];
      for (const { sc, at } of anchored) {
        const h = Math.round(w / (this._aspects[sc.id] || 16 / 9));
        const [ax, ay] = at;
        const gap = 16;
        const spots = [
          [ax - w / 2, ay - gap - h],
          [ax - w / 2, ay + gap],
          [ax + gap, ay - h / 2],
          [ax - gap - w, ay - h / 2],
        ].map(([x, y]) => ({ x: Math.round(clamp(x, 6, vp.w - w - 6)), y: Math.round(clamp(y, 6, Math.max(6, bottom - h))), w, h }));
        const overlap = (r) =>
          placed.reduce((s, o) => s + Math.max(0, Math.min(r.x + w, o.x + o.w) - Math.max(r.x, o.x)) * Math.max(0, Math.min(r.y + h, o.y + o.h) - Math.max(r.y, o.y)), 0);
        let best = spots[0];
        let bestOverlap = overlap(best);
        for (const spot of spots.slice(1)) {
          if (!bestOverlap) break;
          const o = overlap(spot);
          if (o < bestOverlap) [best, bestOverlap] = [spot, o];
        }
        placed.push({ sc, ax: Math.round(ax), ay: Math.round(ay), ...best });
      }
      return placed;
    }

    // Screen position (px, from the top-left corner of the view) of a world point, or null behind the viewer.
    // Mirrors the transform of `.world` and the perspective of `.view3d`.
    _project(orbit, vp, P) {
      const a = toRad(orbit.az);
      const t = toRad(orbit.tilt);
      const [x, y, z] = sub3(P, orbit.target).map((v) => v * U3);
      const x1 = x * Math.cos(a) - y * Math.sin(a);
      const y1 = x * Math.sin(a) + y * Math.cos(a);
      const y2 = y1 * Math.cos(t) - z * Math.sin(t);
      const z2 = y1 * Math.sin(t) + z * Math.cos(t) + vp.p - orbit.dist;
      if (z2 > vp.p - 1) return null;
      const k = vp.p / (vp.p - z2);
      return [vp.w / 2 + x1 * k, vp.h / 2 + y2 * k];
    }

    // Bar of the home's cameras: a tap flies to a camera (opening its floor if needed).
    _renderCameraBar() {
      const cams = this._scene3dState.cameras;
      if (!cams.length) return A;
      return b`<div class="cambar">
      ${cams.map((c) => {
        const st = c.item.st;
        const state = !st ? 'missing' : isUnavailable(st) ? 'unavailable' : '';
        return b`<button class="camchip ${this._focus === c.id ? 'active' : ''} ${state}" title=${this._cameraName(c.item)}
          @click=${() => this._focusCamera(c.id)}>
          <ha-icon icon=${state ? 'mdi:cctv-off' : 'mdi:cctv'}></ha-icon><span>${this._cameraName(c.item)}</span>
        </button>`;
      })}
    </div>`;
    }

    async _focusCamera(id) {
      if (!this._scene3dState.screens.some((sc) => sc.id === id)) {
        // Not in the scene: open its floor first (indoor cameras only show on an open floor).
        const cam = this._scene3dState.cameras.find((c) => c.id === id);
        if (!cam) return;
        this._setLevel(cam.k);
        await this.updateComplete;
      }
      this._screenTap(id);
    }

    // Next or previous camera of the bar, while zoomed on one.
    _cycleFocus(step) {
      const cams = this._scene3dState.cameras;
      const i = cams.findIndex((c) => c.id === this._focus);
      if (i < 0) return;
      this._focusCamera(cams[(i + step + cams.length) % cams.length].id);
    }

    // Snapshot reloaded every refresh_interval, or the live stream: `live` true or false forces it,
    // undefined follows `camera_view`. The 2D plan only shows snapshots: its previews open the live view.
    _cameraImage(st, live) {
      const id = st.entity_id;
      const learn = (ev) => this._learnAspect(id, ev.target);
      if (live === undefined ? this.config.camera_view === 'live' : live) {
        if (customElements.get('ha-camera-stream')) {
          return b`<ha-camera-stream .hass=${this.hass} .stateObj=${st} muted></ha-camera-stream>`;
        }
        return b`<img alt="" src="/api/camera_proxy_stream/${id}?token=${st.attributes.access_token}" @load=${learn} />`;
      }
      const pic = st.attributes.entity_picture;
      if (!pic) return b`<div class="screen-msg"><ha-icon icon="mdi:cctv"></ha-icon></div>`;
      return b`<img alt="" src="${pic}${pic.includes('?') ? '&' : '?'}t=${this._tick}" @load=${learn} />`;
    }

    _learnAspect(id, img) {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (Math.abs(aspect - (this._aspects[id] || 16 / 9)) > 0.01) {
        this._aspects[id] = aspect;
        this.requestUpdate();
      }
    }

    // Drag: orbit (right button or Shift: pan); two fingers: zoom and pan; tap on a screen: zoom on it.
    _down3d(ev) {
      const path = ev.composedPath();
      if (path.some((n) => n.classList && (n.classList.contains('tools') || n.classList.contains('cambar')))) return;
      ev.currentTarget.setPointerCapture(ev.pointerId);
      this._pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      // A screen: the one zoomed on or a billboard (HTML), or one drawn in the scene.
      let screenId = null;
      if (this._pointers.size === 1) {
        const screen = path.find((n) => n.classList && n.classList.contains('screen'));
        const box = ev.currentTarget.getBoundingClientRect();
        screenId = screen ? screen.dataset.id : this._screenAt(ev.clientX - box.left, ev.clientY - box.top);
      }
      this._startGesture(screenId, ev.button === 2 || ev.shiftKey);
    }

    _startGesture(screenId = null, pan = false) {
      const pts = [...this._pointers.values()];
      this._gesture = {
        orbit: this._currentOrbit(),
        screenId,
        pan,
        moved: pts.length > 1,
        x: pts[0].x,
        y: pts[0].y,
        pinch:
          pts.length > 1
            ? { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
            : null,
      };
    }

    _move3d(ev) {
      const g = this._gesture;
      if (!g || !this._pointers.has(ev.pointerId)) return;
      this._pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      const o = g.orbit;
      const pts = [...this._pointers.values()];
      let next;
      if (g.pinch && pts.length > 1) {
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const zoomed = { ...o, dist: this._clampDist((o.dist * g.pinch.d) / Math.max(d, 1)) };
        next = this._panned(zoomed, (pts[0].x + pts[1].x) / 2 - g.pinch.x, (pts[0].y + pts[1].y) / 2 - g.pinch.y);
      } else {
        const dx = ev.clientX - g.x;
        const dy = ev.clientY - g.y;
        if (!g.moved && Math.hypot(dx, dy) < 6) return;
        g.moved = true;
        next = g.pan ? this._panned(o, dx, dy) : { ...o, az: o.az - dx * 0.35, tilt: clamp(o.tilt - dy * 0.3, TILT_MIN, TILT_MAX) };
      }
      this._dragging3d = true;
      this._orbit = next;
    }

    _up3d(ev) {
      if (!this._pointers.has(ev.pointerId)) return;
      this._pointers.delete(ev.pointerId);
      const g = this._gesture;
      if (this._pointers.size) {
        // One finger left after a pinch: it orbits from here.
        this._startGesture();
        this._gesture.moved = true;
        return;
      }
      this._gesture = null;
      this._dragging3d = false;
      if (g && !g.moved && g.screenId && ev.type === 'pointerup') this._screenTap(g.screenId);
    }

    _wheel3d(ev) {
      ev.preventDefault();
      const o = this._currentOrbit();
      this._dragging3d = true; // no easing between wheel steps
      clearTimeout(this._wheelTimer);
      this._wheelTimer = setTimeout(() => (this._dragging3d = false), 200);
      this._orbit = { ...o, dist: this._clampDist(o.dist * Math.exp(ev.deltaY * 0.0015)) };
    }

    _zoom3d(k) {
      const o = this._currentOrbit();
      this._orbit = { ...o, dist: this._clampDist(o.dist * k) };
    }

    _clampDist(dist) {
      const home = this._scene3dState.home.dist;
      return clamp(dist, home * 0.06, home * 3);
    }

    // Moves the target so that the scene follows the pointer (dx, dy in px).
    _panned(o, dx, dy) {
      const k = o.dist / this._scene3dState.vp.p / U3; // grid units per px, at the target
      const a = toRad(o.az);
      const c = Math.max(Math.cos(toRad(o.tilt)), 0.35);
      return {
        ...o,
        target: [
          o.target[0] - (Math.cos(a) * dx + (Math.sin(a) * dy) / c) * k,
          o.target[1] - (-Math.sin(a) * dx + (Math.cos(a) * dy) / c) * k,
          o.target[2],
        ],
      };
    }

    _resetView() {
      this._orbit = null;
      this._focus = null;
    }

    // First tap: fly behind the camera, facing its screen. Second tap: its more-info dialog (live view).
    _screenTap(id) {
      if (this._focus === id) {
        this._moreInfo(id);
        return;
      }
      const state = this._scene3dState;
      const sc = state.screens.find((x) => x.id === id);
      if (!sc) return;
      const { vp } = state;
      const current = this._currentOrbit();
      let az = -sc.cam.direction;
      az += Math.round((current.az - az) / 360) * 360;
      this._focus = id;
      this._orbit = {
        az,
        tilt: clamp(90 - sc.cam.tilt - 8, 35, 82),
        dist: Math.max((sc.w * U3 * vp.p) / (0.8 * vp.w), (sc.h * U3 * vp.p) / (0.7 * vp.h)),
        target: sc.center,
      };
    }

    // --- Interactions --------------------------------------------------------

    // A tap on the selected room does nothing: deselecting would zoom out and move the plan under the
    // pointer, so the next tap would land in another room. Close with the panel's button, Escape,
    // or a tap outside the rooms.
    _selectRoom(ev, index) {
      ev.stopPropagation();
      if (this._selectedRoom !== index) this._tick++; // fresh snapshots for the panel's cameras
      this._selectedRoom = index;
      this._camPinned = null;
    }

    _itemDown(ev, item) {
      ev.stopPropagation();
      this._held = false;
      clearTimeout(this._holdTimer);
      this._holdTimer = setTimeout(() => {
        this._held = true;
        this._moreInfo(item.id);
      }, HOLD_DELAY$1);
    }

    _itemClick(ev, item) {
      ev.stopPropagation();
      clearTimeout(this._holdTimer);
      if (this._held) {
        this._held = false;
        return;
      }
      const domain = domainOf(item.id);
      if (item.role === 'camera') this._togglePreview(item.id);
      else if (isUnavailable(item.st)) this._moreInfo(item.id);
      else if (TOGGLE_DOMAINS$1.includes(domain)) this._toggle(item.id);
      else if (RUN_SERVICES[domain]) this._call(domain, RUN_SERVICES[domain], item.id);
      else this._moreInfo(item.id);
    }

    _windowDown(ev, item) {
      ev.stopPropagation();
      if (isUnavailable(item.st)) {
        this._moreInfo(item.id);
        return;
      }
      ev.currentTarget.setPointerCapture(ev.pointerId);
      this._windowDrag = { item, el: ev.currentTarget, x: ev.clientX, y: ev.clientY, moved: false };
    }

    _windowMove(ev) {
      const d = this._windowDrag;
      if (!d) return;
      if (!d.moved && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 5) return;
      d.moved = true;
      // The shutter covers the window from its start (left or top): dragging sets where it ends.
      const r = d.el.getBoundingClientRect();
      const f = d.item.wall.o === 'h' ? (ev.clientX - r.left) / r.width : (ev.clientY - r.top) / r.height;
      this._coverDrag = { id: d.item.id, pos: Math.round((1 - clamp(f, 0, 1)) * 100) };
    }

    _windowUp() {
      const d = this._windowDrag;
      this._windowDrag = null;
      if (!d) return;
      if (!d.moved) {
        this._moreInfo(d.item.id);
        return;
      }
      const pos = this._coverDrag ? this._coverDrag.pos : coverPosition(d.item.st);
      this._coverDrag = null;
      this._setCover(d.item.st, pos);
    }

    _windowCancel() {
      this._windowDrag = null;
      this._coverDrag = null;
    }

    _setCover(st, pos) {
      if (supportsSetPosition(st)) {
        this._pending[st.entity_id] = { pos, until: Date.now() + COVER_PENDING_MS };
        setTimeout(() => this.requestUpdate(), COVER_PENDING_MS);
        this._call('cover', 'set_cover_position', st.entity_id, { position: pos });
      } else {
        this._call('cover', pos >= 50 ? 'open_cover' : 'close_cover', st.entity_id);
      }
    }

    _toggle(entityId) {
      this._call('homeassistant', 'toggle', entityId);
    }

    _call(domain, service, entityId, data = {}) {
      window.dispatchEvent(new CustomEvent('haptic', { detail: 'light' }));
      this.hass.callService(domain, service, { entity_id: entityId, ...data });
    }

    _moreInfo(entityId) {
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
    }

    static get styles() {
      return i$6`
      :host {
        display: block;
        --fp-wall: var(--primary-text-color, #e1e1e1);
        --fp-floor: rgba(127, 127, 127, 0.08);
        --fp-active: var(--state-active-color, var(--amber-color, #ffc107));
        --fp-alert: var(--error-color, #ef5350);
        --fp-presence: var(--info-color, #4fc3f7);
        --fp-camera: var(--primary-color, #03a9f4);
        --fp-humidity: #4fa3e0;
        --fp-outdoor: rgba(102, 160, 90, 0.16);
        /* 3D view */
        --fp3-wall: #ece7df;
        --fp3-cap: #6b6660;
        --fp3-floor: #c9ae8c;
        --fp3-roof: #a9573f;
        --fp3-ground: #7da267;
        --fp3-terrace: #bdb5a6;
        --fp3-beam: 120, 200, 255;
        --fp3-sky: linear-gradient(180deg, #cfe3f3 0%, #eef3f6 100%);
        --fp3-sky-dark: linear-gradient(180deg, #0f161d 0%, #1f2a34 100%);
      }
      ha-card {
        overflow: hidden;
        padding: ${CARD_PADDING}px;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .floors {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .chip {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        border-radius: 14px;
        padding: 4px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .chip.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .chip ha-icon {
        --mdc-icon-size: 16px;
        display: flex;
      }
      .floors .chip {
        display: inline-flex;
        align-items: center;
      }
      .seg {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 14px;
        overflow: hidden;
      }
      .seg button {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        padding: 4px 10px;
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .seg button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px 12px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .empty ha-icon {
        --mdc-icon-size: 40px;
      }

      .plan {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        transition: height 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .zoom {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        transform-origin: 0 0;
        transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .layer,
      .overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .layer {
        overflow: visible;
      }
      .floor,
      .glow,
      .wall {
        transition: opacity 0.6s ease, fill 0.8s ease;
      }
      .wall {
        fill: none;
        stroke: var(--fp-wall);
        stroke-opacity: 0.25;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
      }
      .floor.outdoor {
        fill: var(--fp-outdoor);
      }
      .wall.outdoor {
        stroke-dasharray: 4 4;
      }
      .cone {
        stroke: var(--fp-camera);
        stroke-opacity: 0.35;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        transition: opacity 0.4s ease;
      }
      .outer {
        stroke: var(--fp-wall);
        stroke-opacity: 0.75;
        stroke-width: 4px;
        stroke-linecap: square;
        vector-effect: non-scaling-stroke;
      }
      .presence {
        fill: none;
        stroke: var(--fp-presence);
        stroke-width: 2px;
        vector-effect: non-scaling-stroke;
        animation: pulse 2s ease-in-out infinite;
      }
      /* Drawn on the walls and cut by the room's outline: only its inner half shows, past the outer walls. */
      .presence.zones {
        stroke-width: 10px;
        stroke-linecap: square;
      }
      @keyframes pulse {
        0%, 100% { stroke-opacity: 0.15; }
        50% { stroke-opacity: 0.9; }
      }
      .dim {
        opacity: 0.3;
      }
      .glow.dim {
        opacity: 0 !important;
      }

      .room {
        position: absolute;
        box-sizing: border-box;
        cursor: pointer;
        overflow: hidden;
        transition: opacity 0.4s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .room:hover {
        background: rgba(127, 127, 127, 0.06);
      }
      /* Over the markers: a light backdrop keeps it readable when a marker stands under it. */
      .room-label {
        position: absolute;
        box-sizing: border-box;
        overflow: hidden;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }
      .label {
        transform: scale(var(--k, 1));
        transform-origin: 0 0;
        transition: transform 0.45s ease;
        box-sizing: border-box;
        max-width: calc(100% / var(--k, 1) - 6px);
        width: max-content;
        margin: 3px;
        padding: 2px 5px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 62%, transparent);
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .name {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.7;
        flex: none;
      }
      .name span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .climate {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .temp {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .hum {
        display: inline-flex;
        align-items: center;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .hum ha-icon {
        --mdc-icon-size: 12px;
        color: var(--fp-humidity);
      }

      .marker,
      .badge {
        position: absolute;
        transform: translate(-50%, -50%);
        border: none;
        cursor: pointer;
        font: inherit;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        transition: opacity 0.4s ease, color 0.3s ease, box-shadow 0.3s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .marker {
        width: calc(var(--m, 28px) * var(--k, 1));
        height: calc(var(--m, 28px) * var(--k, 1));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color, #1c1c1c);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
        --mdc-icon-size: calc(var(--m, 28px) * var(--k, 1) * 0.64);
      }
      .marker.active {
        color: var(--c);
        box-shadow: 0 0 0 2px var(--c), 0 0 12px var(--c);
      }
      .marker.unavailable,
      .badge.unavailable {
        color: var(--disabled-text-color, #6f6f6f);
        animation: blink 1.6s ease-in-out infinite;
      }
      /* A placed entity that doesn't exist (renamed or deleted): a config error to fix, kept visible. */
      .marker.missing {
        color: var(--warning-color, #ffa600);
        border: 1px dashed var(--warning-color, #ffa600);
        box-shadow: none;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 7px 2px 4px;
        border-radius: 12px;
        font-size: calc(var(--m, 28px) * var(--k, 1) * 0.4);
        white-space: nowrap;
        color: var(--primary-text-color);
        background: var(--card-background-color, #1c1c1c);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
        --mdc-icon-size: calc(var(--m, 28px) * var(--k, 1) * 0.5);
      }

      .window {
        position: absolute;
        cursor: ew-resize;
        touch-action: none;
        transition: opacity 0.4s ease;
      }
      .window {
        --t: calc(var(--k, 1) * 1px); /* 1px, compensated for the zoom */
      }
      .window.h {
        height: calc(14 * var(--t));
        transform: translateY(-50%);
      }
      .window.v {
        width: calc(14 * var(--t));
        transform: translateX(-50%);
        cursor: ns-resize;
      }
      .glass,
      .shutter {
        position: absolute;
        border-radius: 2px;
      }
      .window.h .glass {
        left: 0;
        right: 0;
        top: calc(4 * var(--t));
        height: calc(6 * var(--t));
      }
      .window.v .glass {
        top: 0;
        bottom: 0;
        left: calc(4 * var(--t));
        width: calc(6 * var(--t));
      }
      .glass {
        background: #8fd3ff;
        box-shadow: 0 0 6px rgba(143, 211, 255, 0.7);
      }
      .shutter {
        background: repeating-linear-gradient(90deg, #5d6670 0 2px, #79838e 2px 4px);
        transition: width 0.3s ease, height 0.3s ease;
      }
      .window.h .shutter {
        left: 0;
        top: calc(3 * var(--t));
        height: calc(8 * var(--t));
        width: var(--closed);
      }
      .window.v .shutter {
        top: 0;
        left: calc(3 * var(--t));
        width: calc(8 * var(--t));
        height: var(--closed);
        background: repeating-linear-gradient(0deg, #5d6670 0 2px, #79838e 2px 4px);
      }
      .window.moving .glass {
        background: repeating-linear-gradient(90deg, #8fd3ff 0 4px, #4f8fbf 4px 8px);
        background-size: 16px 100%;
        animation: slide 0.6s linear infinite;
      }
      @keyframes slide {
        to { background-position: 16px 0; }
      }
      .window.unavailable {
        opacity: 0.4;
        cursor: pointer;
      }
      .bubble {
        position: absolute;
        left: 50%;
        top: calc(-26 * var(--t));
        transform: translateX(-50%) scale(var(--k, 1));
        transform-origin: 50% 100%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 11px;
        font-weight: 600;
        pointer-events: none;
      }

      .panel {
        margin-top: 10px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
        animation: reveal 0.3s ease;
      }
      @keyframes reveal {
        from { opacity: 0; transform: translateY(-6px); }
      }
      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      .panel-title {
        flex: 1;
        font-weight: 500;
      }
      .panel-header .climate {
        font-size: 13px;
        gap: 10px;
      }
      .panel-header .hum ha-icon {
        --mdc-icon-size: 15px;
      }
      .close,
      .icon-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 4px;
        display: flex;
        border-radius: 50%;
        --mdc-icon-size: 20px;
      }
      .panel-empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 6px 0;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
      }
      .row-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .row-main ha-state-icon,
      .row-main ha-icon {
        color: var(--secondary-text-color);
        flex: none;
      }
      .row.active .row-main ha-state-icon,
      .row.active .row-main ha-icon {
        color: var(--fp-active);
      }
      .row.unavailable,
      .row.missing {
        color: var(--disabled-text-color, #6f6f6f);
      }
      .row-name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .row.missing .row-name {
        flex: 1;
      }
      .row-cam {
        display: block;
        width: 100%;
        max-width: 420px;
        margin: 2px 0 8px;
        padding: 0;
        border: none;
        border-radius: 8px;
        overflow: hidden;
        background: #000;
        cursor: pointer;
      }
      .row-cam img,
      .row-cam ha-camera-stream {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .camthumb {
        position: absolute;
        box-sizing: border-box;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #000;
        color: #9aa0a6;
        border: 1.5px solid #1b1e22;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        --mdc-icon-size: 20px;
      }
      .camthumb img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .camthumb-leader {
        position: absolute;
        height: 0;
        border-top: 1.5px dashed var(--fp-camera);
        opacity: 0.8;
        transform-origin: 0 0;
        pointer-events: none;
      }
      .camthumb-reload {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 22px;
        height: 22px;
        padding: 0;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        cursor: pointer;
        --mdc-icon-size: 15px;
      }
      .camthumb-reload.loading ha-icon {
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      /* With a mouse, the reload button only shows while the thumbnail is hovered. */
      @media (hover: hover) {
        .camthumb-reload {
          opacity: 0;
          transition: opacity 0.15s;
        }
        .camthumb:hover .camthumb-reload,
        .camthumb-reload.loading {
          opacity: 1;
        }
      }
      .camthumb.unavailable img {
        filter: grayscale(1);
        opacity: 0.5;
      }
      .campop {
        position: absolute;
        z-index: 2;
        box-sizing: border-box;
        cursor: pointer;
        background: #000;
        border: 2px solid #1b1e22;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        animation: campop 0.18s ease;
      }
      .campop.pinned {
        border-color: var(--fp-camera);
      }
      .campop.unavailable {
        background: #222;
      }
      @keyframes campop {
        from { opacity: 0; transform: scale(0.94); }
      }
      .campop .screen-name {
        left: 6px;
        bottom: 6px;
        max-width: calc(100% - 12px);
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 12px;
      }
      .campop .screen-msg {
        font-size: 13px;
        gap: 4px;
        --mdc-icon-size: 32px;
      }
      .campop-close {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 26px;
        height: 26px;
        padding: 0;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        cursor: pointer;
        --mdc-icon-size: 16px;
      }
      .row-state {
        font-size: 13px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .row input[type='range'] {
        width: 110px;
        accent-color: var(--primary-color);
      }
      .toggle {
        width: 36px;
        height: 20px;
        border-radius: 10px;
        border: none;
        padding: 0;
        background: var(--disabled-text-color, #6f6f6f);
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
        flex: none;
      }
      .toggle span {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s ease;
      }
      .toggle.on {
        background: var(--primary-color);
      }
      .toggle.on span {
        transform: translateX(16px);
      }
      .run {
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        background: transparent;
        border-radius: 14px;
        padding: 3px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      /* --- 3D view --- */
      .view3d {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        background: var(--fp3-sky);
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: grab;
      }
      .view3d.dark {
        --fp3-sky: var(--fp3-sky-dark);
      }
      .view3d.dragging {
        cursor: grabbing;
      }
      .gl3d {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
      }
      .gl-error {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      /* Hidden icons, loaded for their SVG path (3D textures). */
      .icon-probe {
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
        visibility: hidden;
      }
      /* The camera screen zoomed on, placed over the scene. */
      .f {
        position: absolute;
        left: 0;
        top: 0;
        transform-origin: 0 0;
        box-sizing: border-box;
        pointer-events: none;
      }
      .f.screen {
        pointer-events: auto;
        cursor: pointer;
        background: #000;
        border: 8px solid #1b1e22;
        border-radius: 8px;
        box-shadow: 0 0 40px rgba(var(--fp3-beam), 0.35);
      }
      .f.screen.focused {
        border-color: var(--primary-color);
      }
      .f.screen.missing {
        border: 6px dashed var(--warning-color, #ffa600);
        background: #222;
      }
      .f.screen.unavailable {
        animation: blink 1.6s ease-in-out infinite;
      }
      .screen-inner {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .screen-inner img,
      .screen-inner ha-camera-stream {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .screen-name {
        position: absolute;
        left: 8px;
        bottom: 8px;
        max-width: calc(100% - 16px);
        padding: 2px 10px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .screen-warn {
        position: absolute;
        left: 8px;
        top: 8px;
        max-width: calc(100% - 16px);
        padding: 2px 10px;
        border-radius: 6px;
        background: var(--warning-color, #ffa600);
        color: #000;
        font-size: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .board .screen-warn,
      .campop .screen-warn {
        left: 4px;
        top: 4px;
        max-width: calc(100% - 8px);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
      }
      .screen-msg {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 16px;
        text-align: center;
        color: #9aa0a6;
        font-size: 24px;
        --mdc-icon-size: 72px;
      }
      .f.screen.missing .screen-msg {
        color: var(--warning-color, #ffa600);
      }
      .tools {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tool {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        --mdc-icon-size: 20px;
      }
      /* Billboards: camera screens flat on the view, linked to their camera. */
      .boards {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .leaders {
        position: absolute;
        left: 0;
        top: 0;
        overflow: visible;
      }
      .leaders line {
        stroke: rgba(var(--fp3-beam), 0.85);
        stroke-width: 1.5px;
      }
      .leaders circle {
        fill: rgb(var(--fp3-beam));
        stroke: #fff;
        stroke-width: 1.5px;
      }
      .leaders line,
      .leaders circle,
      .board {
        transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .view3d.dragging .leaders line,
      .view3d.dragging .leaders circle,
      .view3d.dragging .board {
        transition: none;
      }
      .board {
        position: absolute;
        box-sizing: border-box;
        pointer-events: auto;
        cursor: pointer;
        background: #000;
        border: 3px solid #1b1e22;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
      }
      .board:hover {
        border-color: var(--primary-color);
      }
      .board.projecting {
        opacity: 0.45;
      }
      .board.projecting:hover {
        opacity: 1;
      }
      .board.missing {
        border: 2px dashed var(--warning-color, #ffa600);
        background: #222;
      }
      .board.unavailable {
        animation: blink 1.6s ease-in-out infinite;
      }
      .board .screen-name {
        left: 4px;
        bottom: 4px;
        max-width: calc(100% - 8px);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
      }
      .board .screen-msg {
        font-size: 11px;
        gap: 2px;
        padding: 0 6px;
        --mdc-icon-size: 26px;
      }
      .board.missing .screen-msg {
        color: var(--warning-color, #ffa600);
      }
      .cambar {
        position: absolute;
        left: 8px;
        right: 52px;
        bottom: 8px;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .camchip {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        max-width: 160px;
        padding: 4px 10px 4px 7px;
        border: none;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
        --mdc-icon-size: 16px;
      }
      .camchip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .camchip.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .camchip.unavailable,
      .camchip.missing {
        color: #9aa0a6;
      }
      .camchip.missing ha-icon {
        color: var(--warning-color, #ffa600);
      }
      .hint3d {
        position: absolute;
        left: 50%;
        top: 10px;
        transform: translateX(-50%);
        padding: 4px 12px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 12px;
        pointer-events: none;
        animation: reveal 0.3s ease;
      }
    `;
    }
  }

  // -------------------------------------------------------------------------
  // Visual editor
  // -------------------------------------------------------------------------
  class HaPlooumFloorplanCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { state: true },
        _floorIndex: { state: true },
        _selection: { state: true },
        _drag: { state: true },
        _search: { state: true },
        _filter: { state: true },
        _history: { state: true },
        _camDrag: { state: true },
        _snapTick: { state: true },
        _capture: { state: true },
        _cameraAdvanced: { state: true },
        _paletteOpen: { state: true },
      };
    }

    constructor() {
      super();
      this._camDrag = null; // drag in progress on the camera's picture
      this._snapTick = 0; // bumps to reload the camera view's snapshot
      this._capture = null; // reference picture capture: { id, busy } or { id, error }
      this._cameraAdvanced = false; // a camera's advanced settings (3D, projection, camera view) are shown
      this._paletteOpen = readPaletteOpen(); // the entity list is unfolded (remembered on the device)
      this._matches = {}; // `${reference url}|${snapshot url}` -> matchPicture() verdict, null while comparing
      this._aspects = {}; // camera id -> picture aspect ratio
      this._floorIndex = 0;
      this._selection = null; // { kind: 'room' | 'entity', index }
      this._drag = null;
      this._search = '';
      this._filter = 'suggested';
      this._history = []; // previous `floors` values, for undo (the HA card editor has none)
      this._extentCache = null;
    }

    setConfig(config) {
      this._config = config;
    }

    // --- Config access -------------------------------------------------------

    _isGenerated() {
      return !Array.isArray(this._config.floors);
    }

    _floors() {
      if (!this._isGenerated()) return this._config.floors;
      const key = [this.hass.areas, this.hass.entities, this.hass.floors, this.hass.devices];
      if (!this._autoKey || this._autoKey.some((v, i) => v !== key[i])) {
        this._autoKey = key;
        this._autoFloors = generateFromAreas(this.hass);
      }
      return this._autoFloors;
    }

    _currentFloorIndex() {
      return clamp(this._floorIndex, 0, this._floors().length - 1);
    }

    // `mergeKey`: consecutive commits with the same key (typing in one field) make a single undo step.
    _commitFloors(floors, mergeKey = null) {
      if (!mergeKey || mergeKey !== this._lastMergeKey) {
        this._history = [...this._history.slice(-49), this._config.floors];
      }
      this._lastMergeKey = mergeKey;
      this._setFloors(floors);
    }

    // `floors` undefined means "generated from the areas".
    _setFloors(floors) {
      const config = { ...this._config, floors };
      if (floors === undefined) delete config.floors;
      this._config = config;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
    }

    _undo() {
      if (!this._history.length) return;
      const previous = this._history[this._history.length - 1];
      this._history = this._history.slice(0, -1);
      this._selection = null;
      this._extentCache = null;
      this._setFloors(previous);
    }

    // Applies `fn` to a copy of the current floor and saves the result (a generated plan becomes the user's own).
    _editFloor(fn, mergeKey = null) {
      const floors = JSON.parse(JSON.stringify(this._floors()));
      const floor = floors[this._currentFloorIndex()];
      floor.rooms = floor.rooms || [];
      floor.entities = floor.entities || [];
      fn(floor, floors);
      this._commitFloors(floors, mergeKey);
    }

    // --- Render --------------------------------------------------------------

    render() {
      if (!this.hass || !this._config) return A;
      const floors = this._floors();
      const fi = this._currentFloorIndex();
      const floor = this._applyDrag(floors[fi]);

      const schema = [
        { name: 'title', label: 'Title', selector: { text: {} } },
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'temp_min', label: 'Coldest temperature (blue floor)', selector: { number: { mode: 'box', step: 0.5 } } },
            { name: 'temp_max', label: 'Warmest temperature (red floor)', selector: { number: { mode: 'box', step: 0.5 } } },
            {
              name: 'view',
              label: 'Opens in',
              selector: { select: { mode: 'dropdown', options: [{ value: '2d', label: '2D plan' }, { value: '3d', label: '3D view' }] } },
            },
            { name: 'wall_height', label: 'Wall height (3D)', selector: { number: { min: 1, max: 6, step: 0.1, mode: 'box' } } },
            {
              name: 'camera_view',
              label: 'Camera screens (3D)',
              selector: {
                select: { mode: 'dropdown', options: [{ value: 'snapshot', label: 'Snapshots' }, { value: 'live', label: 'Live streams' }] },
              },
            },
            {
              name: 'camera_previews',
              label: 'Camera previews (2D)',
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'hover', label: 'On hover or tap' },
                    { value: 'always', label: 'Always (thumbnails)' },
                  ],
                },
              },
            },
            { name: 'refresh_interval', label: 'Snapshot refresh (s)', selector: { number: { min: 1, max: 60, step: 1, mode: 'box' } } },
            {
              name: 'screen_mode',
              label: 'Camera screens placement (3D)',
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'world', label: 'In the scene, in front of the camera' },
                    { value: 'billboard', label: 'Floating next to the camera' },
                    { value: 'none', label: 'Hidden (camera bar only)' },
                  ],
                },
              },
            },
          ],
        },
        { name: 'roof', label: 'Show the roof when the 3D view opens', selector: { boolean: {} } },
        {
          type: 'expandable',
          name: '',
          flatten: true,
          title: 'Advanced',
          schema: [
            {
              name: 'projection_picture',
              label: 'Projected pictures (3D)',
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'frozen', label: 'Reference picture' },
                    { value: 'live', label: 'Recent snapshot, while it matches the reference' },
                    { value: 'snapshot', label: 'Latest snapshot' },
                  ],
                },
              },
            },
          ],
        },
      ];

      return b`
      <div class="editor">
        <div class="floor-tabs">
          ${floors.map(
            (f, i) => b`<button class="chip ${i === fi ? 'active' : ''}" @click=${() => this._selectFloor(i)}>
              ${f.name || `Floor ${i + 1}`}
            </button>`
          )}
          <button class="chip add" title="Add a floor" @click=${this._addFloor}>+ Floor</button>
          ${(floors[fi].rooms || []).some((r) => !r.outdoor)
            ? b`<button class="chip add" title="Add a floor with the same walls as ${floors[fi].name || 'this floor'}" @click=${this._addFloorSameWalls}>
                + Same walls
              </button>`
            : A}
          <span class="spacer"></span>
          <button class="btn flat" title="Undo (Ctrl+Z)" ?disabled=${!this._history.length} @click=${this._undo}>
            <ha-icon icon="mdi:undo"></ha-icon> Undo
          </button>
          ${this._isGenerated()
            ? b`<button class="btn flat" @click=${this._startBlank}>
                <ha-icon icon="mdi:file-outline"></ha-icon> Blank plan
              </button>`
            : b`<button class="btn flat" @click=${this._regenerate}>
                <ha-icon icon="mdi:auto-fix"></ha-icon> From my areas
              </button>`}
        </div>

        ${this._isGenerated()
          ? b`<div class="hint generated">
              <ha-icon icon="mdi:auto-fix"></ha-icon>
              Generated from your Home Assistant areas: fix anything that is wrong by dragging it, and the
              plan becomes yours. Or start from a blank plan.
            </div>`
          : b`<div class="hint">
              <ha-icon icon="mdi:gesture-tap-hold"></ha-icon>
              Drag on the grid to draw a room. Drag entities from the list onto the plan. Drop an entity
              outside the plan to remove it. Covers stick to the nearest wall.
            </div>`}

        <!-- Plan and entity list side by side when the editor is wide enough (container query). -->
        <div class="workspace">
          <div class="main">${this._renderCanvas(floor)} ${this._renderSelection(floor)}</div>
          ${this._renderPalette(floors)}
        </div>

        <div class="section-title">Card settings</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ ...this._config, ...Object.fromEntries(Object.entries(CARD_DEFAULTS).filter(([k]) => !(k in this._config))) }}
          .schema=${schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `;
    }

    // The floor as currently displayed: the stored one with the drag in progress applied.
    _applyDrag(floor) {
      const d = this._drag;
      const c = this._camDrag && this._camDrag.moved ? this._camDrag : null;
      if ((!d || !d.moved) && !c) return floor;
      const copy = { ...floor, rooms: [...(floor.rooms || [])], entities: [...(floor.entities || [])] };
      if (c && copy.entities[c.index]) copy.entities[c.index] = { ...copy.entities[c.index], ...c.settings };
      if (!d || !d.moved) return copy;
      if (d.type === 'draw') copy.rooms.push({ ...d.rect, name: '' });
      if (d.type === 'move' || d.type === 'resize') {
        copy.rooms[d.index] = { ...copy.rooms[d.index], ...d.rect };
      }
      if (d.type === 'move') {
        for (const inner of d.inner) {
          copy.entities[inner.index] = { ...copy.entities[inner.index], x: inner.x + d.dx, y: inner.y + d.dy };
        }
      }
      if (d.type === 'entity' && !d.outside) {
        copy.entities[d.index] = { ...copy.entities[d.index], x: d.pos.x, y: d.pos.y };
      }
      if (d.type === 'aim') {
        copy.entities[d.index] = { ...copy.entities[d.index], direction: d.direction };
      }
      return copy;
    }

    // Visible area of the editor grid: the plan plus some room to grow, at least 14x8.
    // It only grows while a floor is being edited, so the grid never jumps under the pointer.
    _extent(floor) {
      if (this._drag && this._drag.extent) return this._drag.extent;
      // Entity positions (not their icons' size) so that a cover on an outer wall doesn't grow the grid.
      const xs = [0];
      const ys = [0];
      for (const r of (floor.rooms || []).map(normalizeRoom)) xs.push(r.x, r.x + r.w), ys.push(r.y, r.y + r.h);
      for (const e of floor.entities || []) xs.push(num(e.x)), ys.push(num(e.y));
      let x1 = Math.floor(Math.min(...xs)) - 1;
      let y1 = Math.floor(Math.min(...ys)) - 1;
      let x2 = Math.max(x1 + 14, Math.ceil(Math.max(...xs)) + 2);
      let y2 = Math.max(y1 + 8, Math.ceil(Math.max(...ys)) + 2);
      const fi = this._currentFloorIndex();
      const prev = this._extentCache && this._extentCache.floor === fi ? this._extentCache.ext : null;
      if (prev) {
        x1 = Math.min(x1, prev.x);
        y1 = Math.min(y1, prev.y);
        x2 = Math.max(x2, prev.x + prev.w);
        y2 = Math.max(y2, prev.y + prev.h);
      }
      const ext = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
      this._extentCache = { floor: fi, ext };
      return ext;
    }

    _renderCanvas(floor) {
      const ext = this._extent(floor);
      this._ext = ext;
      const plan = resolveFloor(this.hass, floor);
      const px = (x) => ((x - ext.x) / ext.w) * 100;
      const py = (y) => ((y - ext.y) / ext.h) * 100;
      const sel = this._selection;
      const overlapping = new Set();
      plan.rooms.forEach((a, i) =>
        plan.rooms.forEach((b, j) => {
          if (i < j && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
            overlapping.add(i);
            overlapping.add(j);
          }
        })
      );
      const selectedRoom = sel && sel.kind === 'room' ? plan.rooms[sel.index] : null;
      const d = this._drag;
      const ghost = d && d.type === 'palette' && d.overCanvas ? d : null;
      // Aim handle of the selected camera, in front of it.
      const selectedItem = sel && sel.kind === 'entity' ? plan.items[sel.index] : null;
      const aim =
        selectedItem && selectedItem.camera
          ? { item: selectedItem, x: selectedItem.x + selectedItem.camera.dx * AIM_HANDLE, y: selectedItem.y + selectedItem.camera.dy * AIM_HANDLE }
          : null;

      return b`
      <div
        class="canvas ${d && d.type === 'entity' && d.outside ? 'removing' : ''}"
        style="aspect-ratio: ${ext.w} / ${ext.h};"
        tabindex="0"
        @pointerdown=${this._canvasDown}
        @pointermove=${this._canvasMove}
        @pointerup=${this._canvasUp}
        @pointercancel=${this._canvasCancel}
        @keydown=${this._canvasKey}
      >
        <svg class="layer" viewBox="${ext.x} ${ext.y} ${ext.w} ${ext.h}" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" class="grid-line"></path>
            </pattern>
            ${plan.rooms.map((r, i) => w`<clipPath id="eclip-${i}"><rect x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect></clipPath>`)}
          </defs>
          <rect x=${ext.x} y=${ext.y} width=${ext.w} height=${ext.h} fill="url(#grid)"></rect>
          ${plan.rooms.map(
            (r, i) => w`<rect class="e-room ${r.outdoor ? 'outdoor' : ''} ${selectedRoom && selectedRoom.index === i ? 'selected' : ''} ${overlapping.has(i) ? 'overlap' : ''}"
              x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect>`
          )}
          ${plan.rooms.map((r, i) => {
            // Grab area to move a room, inset so that a drag started on a wall draws a new adjoining room.
            const inset = Math.min(EDGE_DRAW_ZONE, r.w / 4, r.h / 4);
            return w`<rect class="e-room-hit" data-kind="room" data-index=${i}
              x=${r.x + inset} y=${r.y + inset} width=${r.w - 2 * inset} height=${r.h - 2 * inset}></rect>`;
          })}
          ${plan.exterior.map((s) =>
            s.o === 'h'
              ? w`<line class="e-outer" x1=${s.a} y1=${s.at} x2=${s.b} y2=${s.at}></line>`
              : w`<line class="e-outer" x1=${s.at} y1=${s.a} x2=${s.at} y2=${s.b}></line>`
          )}
          ${plan.items
            .filter((it) => it.camera)
            .map(
              (it) => w`<path class="e-cone" d=${conePath(it)}
                clip-path=${it.camera.indoor && it.roomIndex >= 0 ? `url(#eclip-${it.roomIndex})` : A}></path>`
            )}
          ${aim ? w`<line class="e-aim" x1=${aim.item.x} y1=${aim.item.y} x2=${aim.x} y2=${aim.y}></line>` : A}
        </svg>
        <div class="overlay">
          ${plan.rooms.map(
            (r) => b`<div class="e-label" style="left: ${px(r.x)}%; top: ${py(r.y)}%;">
              ${r.name || b`<i>Unnamed</i>`}
            </div>`
          )}
          ${selectedRoom
            ? ['nw', 'ne', 'sw', 'se'].map((corner) => {
                const x = corner.includes('w') ? selectedRoom.x : selectedRoom.x + selectedRoom.w;
                const y = corner.includes('n') ? selectedRoom.y : selectedRoom.y + selectedRoom.h;
                return b`<div class="handle ${corner}" data-kind="handle" data-corner=${corner}
                  style="left: ${px(x)}%; top: ${py(y)}%;"></div>`;
              })
            : A}
          ${plan.items.map((it) => {
            const selected = sel && sel.kind === 'entity' && sel.index === it.index;
            const classes = ['e-entity', selected ? 'selected' : '', it.role === 'cover' ? (it.wall ? 'on-wall' : 'off-wall') : '', it.st ? '' : 'missing'];
            return b`<div class=${classes.join(' ')} data-kind="entity" data-index=${it.index}
              title=${friendlyName(this.hass, it.id)} style="left: ${px(it.x)}%; top: ${py(it.y)}%;">
              ${this._entityIcon(it.id, it.icon)}
            </div>`;
          })}
          ${this._camDrag && this._camDrag.moved && this._camDrag.key !== null
            ? // The corner being placed in the camera view.
              b`<div class="e-corner-hl" style="left: ${px(this._camDrag.P[0])}%; top: ${py(this._camDrag.P[1])}%;"></div>`
            : A}
          ${aim
            ? b`<div class="handle aim" data-kind="aim" title="Drag to aim the camera"
                style="left: ${px(aim.x)}%; top: ${py(aim.y)}%;"></div>`
            : A}
          ${ghost
            ? b`<div class="e-entity ghost" style="left: ${px(ghost.pos.x)}%; top: ${py(ghost.pos.y)}%;">
                ${this._entityIcon(ghost.id)}
              </div>`
            : A}
        </div>
        ${overlapping.size ? b`<div class="canvas-warning">Some rooms overlap</div>` : A}
      </div>
    `;
    }

    _entityIcon(entityId, icon) {
      if (icon) return b`<ha-icon icon=${icon}></ha-icon>`;
      const st = this.hass.states[entityId];
      if (!st) return b`<ha-icon icon="mdi:help-circle-outline"></ha-icon>`;
      return b`<ha-state-icon .hass=${this.hass} .stateObj=${st}></ha-state-icon>`;
    }

    _renderSelection(floor) {
      const sel = this._selection;
      if (sel && sel.kind === 'room' && floor.rooms && floor.rooms[sel.index]) {
        const room = floor.rooms[sel.index];
        const zones = room.name ? floor.rooms.filter((r) => r.name === room.name && !!r.outdoor === !!room.outdoor).length : 1;
        return b`<div class="selection">
        <div class="selection-header">
          <ha-icon icon=${room.icon || 'mdi:floor-plan'}></ha-icon>
          <span>Room</span>
          <span class="dims">${room.w} × ${room.h}</span>
          <button class="btn danger" @click=${this._deleteSelection}>Delete room</button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${room}
          .schema=${[
            { name: 'name', label: 'Name', selector: { text: {} } },
            { name: 'icon', label: 'Icon', selector: { icon: {} } },
            { name: 'outdoor', label: 'Outdoor (garden, terrace): no walls nor roof', selector: { boolean: {} } },
            {
              type: 'grid',
              name: '',
              schema: [
                { name: 'temperature', label: 'Temperature sensor (optional)', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
                { name: 'humidity', label: 'Humidity sensor (optional)', selector: { entity: { domain: 'sensor', device_class: 'humidity' } } },
              ],
            },
          ]}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'rooms')}
        ></ha-form>
        <div class="hint">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>${zones > 1
            ? `One of the ${zones} zones of this room: rooms with the same name make a single room (shown once, with no wall between its zones).`
            : 'An L-shaped room? Draw it as several rooms with the same name: they make a single room.'}</span>
        </div>
      </div>`;
      }
      if (sel && sel.kind === 'entity' && floor.entities && floor.entities[sel.index]) {
        const ent = floor.entities[sel.index];
        const isCover = domainOf(ent.entity) === 'cover';
        const isCamera = domainOf(ent.entity) === 'camera';
        const naturalRole = entityRole(ent.entity, this.hass.states[ent.entity]);
        const canLight = naturalRole === 'light' || naturalRole === 'device';
        const schema = [
          { name: 'entity', label: 'Entity', selector: { entity: {} } },
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'name', label: 'Name (optional)', selector: { text: {} } },
              { name: 'icon', label: 'Icon (optional)', selector: { icon: {} } },
            ],
          },
        ];
        if (canLight) {
          schema.push({ name: 'light', label: 'Lights up the room (glows when on)', selector: { boolean: {} } });
        }
        if (isCover) {
          schema.push(
            { name: 'length', label: 'Window length', selector: { number: { min: 0.5, max: 8, step: 0.25, mode: 'box' } } },
            { name: 'floor_length', label: 'Floor-length window (French window, bay window)', selector: { boolean: {} } }
          );
        }
        if (isCamera) {
          schema.push(
            {
              name: 'direction',
              label: 'Direction (°, clockwise from the top of the plan; or drag the handle on the plan)',
              selector: { number: { min: 0, max: 355, step: 5, mode: 'slider' } },
            },
            { name: 'fov', label: 'Field of view (°)', selector: { number: { min: 20, max: 170, step: 5, mode: 'box' } } },
            {
              name: 'preview_position',
              label: 'Preview position on the 2D plan',
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'auto', label: 'Automatic (behind the camera)' },
                    { value: 'top', label: 'Above' },
                    { value: 'bottom', label: 'Below' },
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' },
                  ],
                },
              },
            }
          );
        }
        // The 3D placement and the projection, with the camera view that lines the camera up, stay
        // folded away: the plan only needs the direction and field of view.
        const advanced = [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'tilt', label: 'Tilt down (°)', selector: { number: { min: -45, max: 89, step: 5, mode: 'box' } } },
              { name: 'height', label: 'Height above the floor', selector: { number: { min: 0, max: 10, step: 0.1, mode: 'box' } } },
              { name: 'screen_size', label: 'Screen width (3D)', selector: { number: { min: 0.3, max: 10, step: 0.1, mode: 'box' } } },
              { name: 'screen_distance', label: 'Screen distance (3D)', selector: { number: { min: 0.5, max: 15, step: 0.1, mode: 'box' } } },
            ],
          },
          { name: 'projection', label: 'Project the picture onto the floor and walls it sees (3D)', selector: { boolean: {} } },
        ];
        const data = { length: WINDOW_LENGTH, light: naturalRole === 'light', ...(isCamera ? { ...this._cameraDefaults(floor, sel.index), preview_position: 'auto' } : {}), ...ent };
        return b`<div class="selection">
        <div class="selection-header">
          ${this._entityIcon(ent.entity, ent.icon)}
          <span>${friendlyName(this.hass, ent.entity)}</span>
          <button class="btn danger" @click=${this._deleteSelection}>Remove from plan</button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'entities')}
        ></ha-form>
        ${isCamera
          ? b`<ha-expansion-panel outlined .header=${'Advanced: 3D and projection'} .expanded=${this._cameraAdvanced}
              @expanded-changed=${(ev) => (this._cameraAdvanced = ev.detail.expanded)}>
              <div class="advanced">
                <ha-form
                  .hass=${this.hass}
                  .data=${data}
                  .schema=${advanced}
                  .computeLabel=${(s) => s.label || s.name}
                  @value-changed=${(ev) => this._selectionChanged(ev, 'entities')}
                ></ha-form>
                ${this._cameraAdvanced ? this._renderCameraView(this._applyDrag(floor), sel.index) : A}
              </div>
            </ha-expansion-panel>`
          : A}
      </div>`;
      }
      const floors = this._floors();
      return b`<div class="selection">
      <div class="selection-header">
        <ha-icon icon="mdi:layers-outline"></ha-icon>
        <span>Floor</span>
        ${floors.length > 1 ? b`<button class="btn danger" @click=${this._deleteFloor}>Delete floor</button>` : A}
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${{ name: floor.name || '' }}
        .schema=${[{ name: 'name', label: 'Floor name', selector: { text: {} } }]}
        .computeLabel=${(s) => s.label || s.name}
        @value-changed=${this._floorNameChanged}
      ></ha-form>
    </div>`;
    }

    _wallHeight() {
      return Math.max(1, num(this._config.wall_height, WALL_HEIGHT));
    }

    // The selected camera's picture with the plan drawn over it, as the camera sees it: the settings
    // are right when the lines follow the house in the picture. Dragging a corner of the house onto
    // the same corner in the picture pins it there: it stays exactly where it is dropped (the picture
    // is warped to it, see pinWarp()), and the camera's settings follow the pins quietly. An outdoor
    // camera only offers the corners of the facade it sees best; an indoor one those of its room.
    _renderCameraView(floor, index) {
      const plan = resolveFloor(this.hass, floor);
      const item = plan.items[index];
      if (!item || !item.camera) return A;
      const st = item.st;
      const pic = st && !isUnavailable(st) ? st.attributes.entity_picture : null;
      const aspect = this._aspects[item.id] || 16 / 9;
      const wallHeight = this._wallHeight();
      const pose = cameraPose(item.camera, [item.x, item.y, cameraHeight(item.camera, wallHeight)]);
      const pins = item.camera.pins;
      // With a reference picture, the camera is aligned on it (and it is what gets projected).
      const refUrl = item.conf.reference_picture ? uploadedImageUrl(item.conf.reference_picture) : null;
      const snapUrl = pic ? `${pic}${pic.includes('?') ? '&' : '?'}t=${this._snapTick}` : null;
      const canUpload = !!(this.hass.config && this.hass.config.components && this.hass.config.components.includes('image_upload'));
      const capture = this._capture && this._capture.id === item.id ? this._capture : null;
      const header = b`<div class="cv-header">
      <span>${refUrl ? 'Camera view (reference picture)' : 'Camera view'}</span>
      ${(pic || refUrl) && pins.length
        ? b`<button class="btn flat" title="Unpin every corner" @click=${() => this._unpinAll(item)}><ha-icon icon="mdi:pin-off-outline"></ha-icon> Unpin</button>`
        : A}
      ${pic
        ? b`<button class="btn flat" ?disabled=${!canUpload || (capture && capture.busy)} @click=${() => this._captureReference(item)}
            title=${canUpload
              ? 'Keep the current picture as the reference: the camera is aligned on it, and it is the picture projected in 3D'
              : 'Needs the Image upload integration (image_upload: in configuration.yaml, or default_config:)'}>
            <ha-icon icon="mdi:camera"></ha-icon> Capture
          </button>`
        : A}
      ${refUrl
        ? b`<button class="btn flat" title="Forget the reference picture: align on the camera's snapshots, project them" @click=${() => this._setReference(item, null)}>
            <ha-icon icon="mdi:image-remove-outline"></ha-icon>
          </button>`
        : A}
      ${pic ? b`<button class="btn flat" title="Reload the picture" @click=${() => this._snapTick++}><ha-icon icon="mdi:refresh"></ha-icon></button>` : A}
    </div>`;
      const notes = b`
      ${capture && capture.error
        ? b`<div class="hint warn"><ha-icon icon="mdi:alert-outline"></ha-icon><span>Capture failed: ${capture.error}</span></div>`
        : A}
      ${refUrl && snapUrl && this._matchOf(refUrl, snapUrl) === 'moved'
        ? b`<div class="hint warn">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span>${MOVED_MESSAGE}: the camera's picture no longer looks like the reference. Capture a new one, then drag the corners again.</span>
          </div>`
        : A}
    `;
      if (!pic && !refUrl) return b`<div class="cv-section">${header}<div class="muted">No picture: the camera is unavailable.</div></div>`;

      // An indoor camera only sees its room: the lines of the others would show through its walls.
      // An outdoor one sees the outer walls facing it, and nothing the house hides from it.
      const ownRoom = item.camera.indoor ? plan.indoor[roomAt(plan.indoor, item.x, item.y)] : null;
      const rooms = ownRoom ? ownRoom.zones : plan.rooms;
      const hidden = ownRoom ? null : this._sightTest(plan, pose.C, wallHeight);
      const lineList = ownRoom ? planLines(rooms, wallHeight) : facingLines(rooms, wallHeight, pose.C);
      const lines = lineList.flatMap((l) =>
        segmentToPicture(pose, l.P, l.Q, aspect, hidden).map(
          (pts) => w`<polyline class="cv-line ${l.outdoor ? 'outdoor' : ''}" points=${pts.map((q) => `${q[0]},${q[1]}`).join(' ')}></polyline>`
        )
      );
      // Handles: kept as they were when a drag started, so that they don't switch under the finger.
      const drag = this._camDrag && this._camDrag.index === item.index && this._camDrag.id === item.id ? this._camDrag : null;
      let handles = drag && drag.handles;
      if (!handles) {
        handles = ownRoom
          ? planCorners(rooms, wallHeight, true)
          : facadeCorners(plan.indoor, wallHeight, pose, aspect, hidden);
        for (const p of pins) if (!handles.some((h) => h.key === p.key)) handles = [...handles, { key: p.key, P: p.P }];
        this._cvHandles = { index: item.index, id: item.id, list: handles };
      }
      const pinned = new Set(pins.map((p) => p.key));
      // Corners a little out of the picture wait on its edge, to be dragged in.
      const near = (uv) => uv && uv[0] > -1 && uv[0] < 2 && uv[1] > -1 / aspect && uv[1] < 2 / aspect;
      const edge = 0.02;
      const corners = handles
        .filter((c) => pinned.has(c.key) || !hidden || !hidden(c.P))
        .map((c) => ({ ...c, uv: toPicture(pose, c.P, aspect) }))
        .filter((c) => near(c.uv))
        .map((c) => {
          const uv = [clamp(c.uv[0], edge, 1 - edge), clamp(c.uv[1], edge, 1 / aspect - edge)];
          return { ...c, uv, outside: uv[0] !== c.uv[0] || uv[1] !== c.uv[1] };
        });
      const at = (uv) => `left: ${round2(uv[0] * 100)}%; top: ${round2(uv[1] * aspect * 100)}%;`;
      const dragged = drag && drag.moved && drag.key !== null ? drag : null;
      const hint = pins.length
        ? 'Each pinned corner stays where you dropped it, and the camera follows them. Drag another corner onto its place to line the rest up, or a pinned one to move it; tap a pin to remove it.'
        : ownRoom
          ? 'Drag a corner of the room (floor or top of a wall) onto the same corner in the picture: it is pinned there. Pin a few, far apart. With nothing pinned, drag the picture to turn the camera.'
          : 'Drag the corners of the facade the camera sees best (floor or top of the wall) onto the same corners in the picture: each one is pinned there. These 4 corners are enough. With nothing pinned, drag the picture to turn the camera.';

      return b`<div class="cv-section">
      ${header}
      <div class="cv-wrap">
        <div class="cv ${pins.length ? 'pinned' : ''}" style="aspect-ratio: ${aspect};" @pointerdown=${(ev) => this._cvDown(ev, item, aspect)}
          @pointermove=${this._cvMove} @pointerup=${this._cvUp} @pointercancel=${this._cvUp}>
          <img alt="" src=${refUrl || snapUrl} @load=${(ev) => this._learnAspect(item.id, ev.target)} />
          <svg viewBox="0 0 1 ${1 / aspect}" preserveAspectRatio="none">${lines}</svg>
          ${corners.map(
            (c) => b`<div class="cv-corner ${pinned.has(c.key) ? 'pinned' : ''} ${c.outside ? 'outside' : ''} ${dragged && dragged.key === c.key ? 'dragging' : ''}"
              data-key=${c.key}
              title=${pinned.has(c.key) ? 'Pinned: drag to move, tap to remove' : c.outside ? 'Out of the picture: drag it in' : 'Drag onto this corner in the picture'}
              style=${at(c.uv)}></div>`
          )}
        </div>
        ${dragged ? this._renderLoupe(dragged, refUrl || snapUrl, aspect, lines) : A}
        ${dragged ? this._renderMiniPlan(plan, item, dragged) : A}
      </div>
      ${notes}
      <div class="hint">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>${hint}</span>
      </div>
    </div>`;
    }

    // Magnifier over the finger while a corner is dragged: the picture zoomed around the corner, with
    // the plan's lines and a crosshair where the corner goes (the finger hides that very spot).
    _renderLoupe(drag, url, aspect, lines) {
      const L = 120; // px
      const Z = 3;
      const W = drag.width;
      const H = W / aspect;
      const cx = drag.uv[0] * W;
      const cy = drag.uv[1] * W;
      // Above the finger, or under it near the top of the picture.
      const above = cy - L - 32 >= -L / 2;
      const left = clamp(cx - L / 2, 0, Math.max(0, W - L));
      const top = above ? cy - L - 32 : cy + 32;
      const hw = L / 2 / (W * Z);
      return b`<div class="cv-loupe" style="left: ${round2(left)}px; top: ${round2(top)}px; width: ${L}px; height: ${L}px;
        background-image: url('${url}'); background-size: ${round2(W * Z)}px ${round2(H * Z)}px;
        background-position: ${round2(L / 2 - cx * Z)}px ${round2(L / 2 - cy * Z)}px;">
      <svg viewBox="${drag.uv[0] - hw} ${drag.uv[1] - hw} ${2 * hw} ${2 * hw}">${lines}</svg>
      <div class="cv-cross"></div>
    </div>`;
    }

    // Small plan of the floor while a corner is dragged, with that corner marked: which corner of
    // the house is being placed, and whether at the floor or at the top of the wall.
    _renderMiniPlan(plan, item, drag) {
      const b$1 = plan.rooms.length ? plan.bounds : null;
      if (!b$1) return A;
      const pad = 0.6;
      const vb = { x: Math.min(b$1.minX, item.x) - pad, y: Math.min(b$1.minY, item.y) - pad };
      vb.w = Math.max(b$1.maxX, item.x) + pad - vb.x;
      vb.h = Math.max(b$1.maxY, item.y) + pad - vb.y;
      const [x, y, z] = drag.P;
      const unit = Math.max(vb.w, vb.h) / 40; // marks keep their size whatever the plan's
      // On the side of the picture away from the finger.
      const right = drag.uv[0] < 0.5;
      return b`<div class="cv-mini ${right ? 'right' : ''}">
      <svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" style="aspect-ratio: ${vb.w} / ${vb.h};">
        ${plan.rooms.map((r) => w`<rect class="${r.outdoor ? 'outdoor' : ''}" x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect>`)}
        <circle class="cam" cx=${item.x} cy=${item.y} r=${unit * 1.2}></circle>
        <circle class="corner" cx=${x} cy=${y} r=${unit * 2}></circle>
      </svg>
      <span>${z > 0.01 ? 'Top of the wall' : 'Floor corner'}</span>
    </div>`;
    }

    // Tells whether the house hides a world point from an outdoor camera standing at C (see
    // planOccluders()), for the current floor `plan`. Cached: the editor re-renders on every pointer
    // move while dragging.
    _sightTest(plan, C, wallHeight) {
      const floors = this._floors();
      const key = [floors, this._currentFloorIndex(), wallHeight, JSON.stringify(plan.rooms.map((r) => [r.x, r.y, r.w, r.h, r.outdoor]))];
      if (!this._occKey || this._occKey.some((v, i) => v !== key[i])) {
        this._occKey = key;
        const above = floors.slice(this._currentFloorIndex() + 1).map((f, i) => ({
          rooms: (f.rooms || []).map(normalizeRoom).filter((r) => !r.outdoor),
          z0: (i + 1) * (wallHeight + SLAB),
        }));
        this._occ = planOccluders(plan.rooms, above, wallHeight);
      }
      const occ = this._occ;
      return (P) => sightBlocked(occ, C, P);
    }

    // Whether the snapshot at `snapUrl` still looks like the reference picture (see matchPicture()),
    // or null while both load.
    _matchOf(refUrl, snapUrl) {
      const key = `${refUrl}|${snapUrl}`;
      if (!(key in this._matches)) {
        this._matches = { [key]: null }; // only the current pair is kept
        Promise.all([loadImage(refUrl), loadImage(snapUrl)]).then(([ref, snap]) => {
          if (!(key in this._matches)) return;
          this._matches[key] = ref && snap ? matchPicture(pictureEdges(ref), pictureEdges(snap)) : 'rejected';
          this.requestUpdate();
        });
      }
      return this._matches[key];
    }

    // Uploads the camera's current picture through Home Assistant's image upload, as its reference picture.
    async _captureReference(item) {
      this._capture = { id: item.id, busy: true };
      try {
        const res = await this.hass.fetchWithAuth(`/api/camera_proxy/${item.id}`);
        if (!res.ok) throw new Error(`the camera's picture didn't load (${res.status})`);
        const blob = await res.blob();
        const form = new FormData();
        form.append('file', new File([blob], `${item.id}.jpg`, { type: blob.type || 'image/jpeg' }));
        const up = await this.hass.fetchWithAuth('/api/image/upload', { method: 'POST', body: form });
        if (!up.ok) throw new Error(`the upload was refused (${up.status})`);
        const { id } = await up.json();
        this._capture = null;
        this._setReference(item, id);
      } catch (err) {
        this._capture = { id: item.id, error: err.message };
      }
    }

    _setReference(item, id) {
      this._editFloor((floor) => {
        const e = floor.entities[item.index];
        if (id) e.reference_picture = id;
        else delete e.reference_picture;
      });
    }

    _learnAspect(id, img) {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (Math.abs(aspect - (this._aspects[id] || 16 / 9)) > 0.01) {
        this._aspects[id] = aspect;
        this.requestUpdate();
      }
    }

    _cvPoint(el, ev) {
      const r = el.getBoundingClientRect();
      return [clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.width, 0, r.height / r.width)];
    }

    // Dragging on the camera's picture: a corner (pinned or not), or the picture itself to turn the
    // camera (only while nothing is pinned: the pins hold it).
    _cvDown(ev, item, aspect) {
      if (ev.button !== 0) return;
      const cam = item.camera;
      const q = [cam.direction, cam.tilt, cam.fov, cameraHeight(cam, this._wallHeight()), cam.distortion, ...cam.correction, cam.xScale];
      const el = ev.currentTarget;
      const corner = ev.target.closest ? ev.target.closest('.cv-corner') : null;
      let key = null;
      let P;
      if (corner) {
        key = corner.dataset.key;
        P = key.split(',').map(Number);
      } else {
        if (cam.pins.length) return;
        // A point straight along the line of sight under the pointer (in the plan, uncorrected): it
        // stays under it.
        const pose = solvedPose(q, item.x, item.y, cam.center);
        P = unstretched(pose, add3(pose.C, mul3(fromPicture(pose, this._cvPoint(el, ev), aspect), 5)));
      }
      ev.preventDefault();
      el.setPointerCapture(ev.pointerId);
      const handles = this._cvHandles && this._cvHandles.index === item.index && this._cvHandles.id === item.id ? this._cvHandles.list : null;
      this._camDrag = {
        pointerId: ev.pointerId, el, index: item.index, id: item.id, x: item.x, y: item.y, center: cam.center, aspect, key, P, q,
        pins: cam.pins, handles, width: el.getBoundingClientRect().width, start: [ev.clientX, ev.clientY], moved: false,
      };
    }

    _cvMove(ev) {
      const c = this._camDrag;
      if (!c || ev.pointerId !== c.pointerId) return;
      if (!c.moved && Math.hypot(ev.clientX - c.start[0], ev.clientY - c.start[1]) < 4) return;
      const uv = this._cvPoint(c.el, ev);
      if (c.key === null) {
        // Turning the camera: the point under the pointer follows it.
        const { q } = solveCamera(c.q, c.x, c.y, c.center, [{ P: c.P, uv }], c.aspect, [0, 1]);
        const r1 = (v) => Math.round(v * 10) / 10;
        this._camDrag = { ...c, moved: true, uv, settings: { direction: r1(q[0]), tilt: r1(q[1]) } };
        return;
      }
      const pins = [...c.pins.filter((p) => p.key !== c.key), { key: c.key, P: c.P, u: uv[0], v: uv[1] * c.aspect }];
      this._camDrag = { ...c, moved: true, uv, settings: this._pinnedSettings(c, pins) };
    }

    _cvUp(ev) {
      const c = this._camDrag;
      if (!c || ev.pointerId !== c.pointerId) return;
      this._camDrag = null;
      let settings = c.settings;
      if (!c.moved) {
        // A tap on a pinned corner unpins it.
        if (c.key === null || !c.pins.some((p) => p.key === c.key)) return;
        settings = this._pinnedSettings(c, c.pins.filter((p) => p.key !== c.key));
      }
      const defaults = this._cameraDefaults(this._floors()[this._currentFloorIndex()], c.index);
      this._editFloor((floor) => {
        const e = floor.entities[c.index];
        Object.assign(e, settings);
        for (const key of ['tilt', 'fov', 'height']) if (num(e[key]) === defaults[key]) delete e[key];
        if (num(e.distortion) === 0) delete e.distortion;
        if (num(e.x_scale, 1) === 1) delete e.x_scale;
        if (e.pins && !e.pins.length) delete e.pins;
      });
    }

    // Settings of a camera being dragged (`c`, see _cvDown()) for these pins: the camera's model
    // refitted to them (its direction and tilt from one pin, its field of view and height too from
    // two, its picture's horizontal scale from X_SCALE_PINS, its lens distortion from LENS_PINS), and the pins themselves, which the picture's warp
    // keeps exactly in place.
    _pinnedSettings(c, pins) {
      const settings = {
        pins: pins.map((p) => ({ x: round2(p.P[0]), y: round2(p.P[1]), z: round2(p.P[2]), u: Math.round(p.u * 1e4) / 1e4, v: Math.round(p.v * 1e4) / 1e4 })),
      };
      if (!pins.length) return settings;
      const pairs = pins.map((p) => ({ P: p.P, uv: [p.u, p.v / c.aspect] }));
      const free = pins.length > 1 ? [0, 1, 2, 3] : [0, 1];
      if (pins.length >= X_SCALE_PINS) free.push(10);
      if (pins.length >= LENS_PINS) free.push(4);
      const { q } = solveCamera(c.q, c.x, c.y, c.center, pairs, c.aspect, free);
      const r1 = (v) => Math.round(v * 10) / 10;
      Object.assign(settings, { direction: r1(q[0]), tilt: r1(q[1]) });
      if (free.includes(2)) Object.assign(settings, { fov: r1(q[2]), height: round2(q[3]) });
      if (free.includes(4)) settings.distortion = Math.round(q[4] * 1000) / 1000;
      if (free.includes(10)) settings.x_scale = Math.round(q[10] * 1000) / 1000;
      return settings;
    }

    _unpinAll(item) {
      this._editFloor((floor) => {
        delete floor.entities[item.index].pins;
      });
    }

    // Cached: the editor re-renders on every pointer move while dragging.
    _paletteEntities(floors) {
      const key = [this.hass.states, this.hass.entities, this.hass.areas, floors, this._search, this._filter];
      if (!this._paletteKey || this._paletteKey.some((v, i) => v !== key[i])) {
        this._paletteKey = key;
        this._paletteCache = this._computePaletteEntities(floors);
      }
      return this._paletteCache;
    }

    _computePaletteEntities(floors) {
      const placed = new Set();
      for (const f of floors) for (const e of f.entities || []) placed.add(e.entity);

      const areaNames = {};
      for (const { id, areaId } of registryEntries(this.hass)) {
        if (areaId && this.hass.areas && this.hass.areas[areaId]) areaNames[id] = this.hass.areas[areaId].name;
      }
      const registry = this.hass.entities || {};
      const query = this._search.trim().toLowerCase();
      const filter = this._filter;
      const list = [];
      for (const [id, st] of Object.entries(this.hass.states)) {
        if (placed.has(id)) continue;
        const reg = registry[id];
        if (filter !== 'all' && reg && (reg.hidden || reg.entity_category)) continue;
        const domain = domainOf(id);
        const role = entityRole(id, st);
        const keep = {
          suggested: isSuggested(id, st),
          lights: domain === 'light',
          covers: domain === 'cover',
          cameras: domain === 'camera',
          sensors: domain === 'sensor' || domain === 'binary_sensor',
          switches: ['switch', 'input_boolean', 'fan'].includes(domain),
          all: true,
        }[filter];
        if (!keep) continue;
        const name = st.attributes.friendly_name || id;
        const area = areaNames[id] || '';
        if (query && !`${name} ${id} ${area}`.toLowerCase().includes(query)) continue;
        list.push({ id, name, area, role });
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      return { list, placedCount: placed.size };
    }

    _renderPalette(floors) {
      const { list, placedCount } = this._paletteEntities(floors);
      const dragging = this._drag && this._drag.type === 'palette' ? this._drag.id : null;
      const open = this._paletteOpen;
      const header = b`<button class="palette-header" aria-expanded=${open ? 'true' : 'false'} title=${open ? 'Fold the entity list' : 'Unfold the entity list'}
      @click=${this._togglePalette}>
      <span>Entities</span>
      ${open ? b`<span class="muted">${placedCount} on the plan · ${list.length} available</span>` : A}
      <ha-icon icon=${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
    </button>`;
      if (!open) return b`<div class="palette collapsed">${header}</div>`;
      return b`<div class="palette">
      ${header}
      <input
        class="search"
        type="search"
        placeholder="Search by name, entity id or area…"
        .value=${this._search}
        @input=${(ev) => (this._search = ev.target.value)}
      />
      <div class="filters">
        ${PALETTE_FILTERS.map(
          (f) => b`<button class="chip small ${this._filter === f.id ? 'active' : ''}" @click=${() => (this._filter = f.id)}>
            ${f.label}
          </button>`
        )}
      </div>
      <div class="palette-list">
        ${list.slice(0, PALETTE_LIMIT).map(
          (e) => b`<div
            class="palette-item ${dragging === e.id ? 'dragging' : ''}"
            title="Drag onto the plan, or click to place it in the selected room"
            @pointerdown=${(ev) => this._paletteDown(ev, e.id)}
            @pointermove=${this._paletteMove}
            @pointerup=${this._paletteUp}
            @pointercancel=${this._paletteCancel}
          >
            <span class="grip">${this._entityIcon(e.id)}</span>
            <span class="palette-text">
              <span class="palette-name">${e.name}</span>
              <span class="palette-sub">${e.id}${e.area ? ` · ${e.area}` : ''}</span>
            </span>
            <ha-icon class="drag-hint" icon="mdi:drag"></ha-icon>
          </div>`
        )}
        ${list.length > PALETTE_LIMIT
          ? b`<div class="muted more">${list.length - PALETTE_LIMIT} more: refine the search.</div>`
          : A}
        ${!list.length ? b`<div class="muted more">No entity matches.</div>` : A}
      </div>
    </div>`;
    }

    _togglePalette() {
      this._paletteOpen = !this._paletteOpen;
      try {
        localStorage.setItem(PALETTE_OPEN_KEY, this._paletteOpen ? '1' : '0');
      } catch (err) {
        // No storage (private window): the choice only lasts for this editor.
      }
    }

    // --- Canvas pointer handling --------------------------------------------

    // Grid coordinates of a pointer event, and whether it is over the canvas.
    _canvasPoint(ev) {
      const el = this.renderRoot.querySelector('.canvas');
      const r = el.getBoundingClientRect();
      const ext = this._ext;
      return {
        x: ext.x + ((ev.clientX - r.left) / r.width) * ext.w,
        y: ext.y + ((ev.clientY - r.top) / r.height) * ext.h,
        inside: ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom,
      };
    }

    // Snapped position of an entity dropped at p: covers stick to the nearest wall.
    _entityDropPoint(entityId, p, floor) {
      if (domainOf(entityId) === 'cover') {
        const rooms = (floor.rooms || []).map(normalizeRoom);
        const wall = nearestWall(rooms, p.x, p.y, WALL_SNAP);
        if (wall) {
          const pos = round2(snap(wall.pos, ENTITY_SNAP));
          return wall.o === 'h' ? { x: pos, y: round2(wall.at) } : { x: round2(wall.at), y: pos };
        }
      }
      return { x: round2(snap(p.x, ENTITY_SNAP)), y: round2(snap(p.y, ENTITY_SNAP)) };
    }

    _canvasDown(ev) {
      if (ev.button !== 0) return;
      const target = ev.target.closest ? ev.target.closest('[data-kind]') : null;
      const kind = target ? target.dataset.kind : null;
      const floor = this._floors()[this._currentFloorIndex()];
      const p = this._canvasPoint(ev);
      const base = { start: p, moved: false, extent: this._ext, pointerId: ev.pointerId };
      ev.currentTarget.setPointerCapture(ev.pointerId);
      ev.currentTarget.focus();

      if (kind === 'entity') {
        const index = Number(target.dataset.index);
        const e = floor.entities[index];
        this._drag = { ...base, type: 'entity', index, id: e.entity, orig: { x: num(e.x), y: num(e.y) }, pos: { x: num(e.x), y: num(e.y) } };
      } else if (kind === 'aim' && this._selection && this._selection.kind === 'entity') {
        const index = this._selection.index;
        const e = floor.entities[index];
        this._drag = { ...base, type: 'aim', index, center: { x: num(e.x), y: num(e.y) }, direction: num(e.direction) };
      } else if (kind === 'handle' && this._selection && this._selection.kind === 'room') {
        const index = this._selection.index;
        const r = normalizeRoom(floor.rooms[index], index);
        this._drag = { ...base, type: 'resize', index, corner: target.dataset.corner, orig: r, rect: { x: r.x, y: r.y, w: r.w, h: r.h } };
      } else if (kind === 'room') {
        const index = Number(target.dataset.index);
        const r = normalizeRoom(floor.rooms[index], index);
        // Entities inside the room move with it.
        const plan = resolveFloor(this.hass, floor);
        const inner = plan.items.filter((it) => it.roomIndex === index).map((it) => ({ index: it.index, x: it.x, y: it.y }));
        this._drag = { ...base, type: 'move', index, orig: r, rect: { x: r.x, y: r.y, w: r.w, h: r.h }, inner, dx: 0, dy: 0 };
      } else {
        const x = snap(p.x, ROOM_SNAP);
        const y = snap(p.y, ROOM_SNAP);
        this._drag = { ...base, type: 'draw', origin: { x, y }, rect: { x, y, w: 0, h: 0 } };
      }
    }

    _canvasMove(ev) {
      const d = this._drag;
      if (!d || d.type === 'palette' || ev.pointerId !== d.pointerId) return;
      const p = this._canvasPoint(ev);
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      if (!d.moved && Math.hypot(dx, dy) < 0.2) return;
      const next = { ...d, moved: true };

      const ext = d.extent;
      const inX = (v) => clamp(v, ext.x, ext.x + ext.w);
      const inY = (v) => clamp(v, ext.y, ext.y + ext.h);

      if (d.type === 'draw') {
        const x2 = inX(snap(p.x, ROOM_SNAP));
        const y2 = inY(snap(p.y, ROOM_SNAP));
        next.rect = { x: Math.min(d.origin.x, x2), y: Math.min(d.origin.y, y2), w: Math.abs(x2 - d.origin.x), h: Math.abs(y2 - d.origin.y) };
      } else if (d.type === 'move') {
        // Rooms can't leave the grid (it grows around them once dropped).
        next.dx = clamp(snap(dx, ROOM_SNAP), ext.x - d.orig.x, ext.x + ext.w - d.orig.x - d.orig.w);
        next.dy = clamp(snap(dy, ROOM_SNAP), ext.y - d.orig.y, ext.y + ext.h - d.orig.y - d.orig.h);
        next.rect = { ...d.rect, x: d.orig.x + next.dx, y: d.orig.y + next.dy };
      } else if (d.type === 'resize') {
        const o = d.orig;
        let left = o.x;
        let top = o.y;
        let right = o.x + o.w;
        let bottom = o.y + o.h;
        if (d.corner.includes('w')) left = Math.min(inX(snap(o.x + dx, ROOM_SNAP)), right - ROOM_SNAP);
        if (d.corner.includes('e')) right = Math.max(inX(snap(right + dx, ROOM_SNAP)), left + ROOM_SNAP);
        if (d.corner.includes('n')) top = Math.min(inY(snap(o.y + dy, ROOM_SNAP)), bottom - ROOM_SNAP);
        if (d.corner.includes('s')) bottom = Math.max(inY(snap(bottom + dy, ROOM_SNAP)), top + ROOM_SNAP);
        next.rect = { x: left, y: top, w: right - left, h: bottom - top };
      } else if (d.type === 'aim') {
        next.direction = directionOf(p.x - d.center.x, p.y - d.center.y);
      } else if (d.type === 'entity') {
        next.outside = !p.inside;
        const floor = this._floors()[this._currentFloorIndex()];
        next.pos = this._entityDropPoint(d.id, { x: d.orig.x + dx, y: d.orig.y + dy }, floor);
      }
      this._drag = next;
    }

    _canvasUp(ev) {
      const d = this._drag;
      if (!d || d.type === 'palette' || ev.pointerId !== d.pointerId) return;
      this._drag = null;

      if (!d.moved) {
        // A plain click selects what is under the pointer.
        if (d.type === 'entity' || d.type === 'aim') this._selection = { kind: 'entity', index: d.index };
        else if (d.type === 'move' || d.type === 'resize') this._selection = { kind: 'room', index: d.index };
        else this._selection = null;
        return;
      }

      if (d.type === 'draw') {
        if (d.rect.w < 1 || d.rect.h < 1) return;
        let newIndex = 0;
        this._editFloor((floor) => {
          floor.rooms.push({ name: `Room ${floor.rooms.length + 1}`, ...d.rect });
          newIndex = floor.rooms.length - 1;
        });
        this._selection = { kind: 'room', index: newIndex };
      } else if (d.type === 'move' || d.type === 'resize') {
        this._editFloor((floor) => {
          floor.rooms[d.index] = { ...floor.rooms[d.index], ...d.rect };
          if (d.type === 'move') {
            for (const inner of d.inner) {
              floor.entities[inner.index].x = round2(inner.x + d.dx);
              floor.entities[inner.index].y = round2(inner.y + d.dy);
            }
          }
        });
        this._selection = { kind: 'room', index: d.index };
      } else if (d.type === 'aim') {
        this._editFloor((floor) => {
          floor.entities[d.index] = { ...floor.entities[d.index], direction: d.direction };
        });
      } else if (d.type === 'entity') {
        if (d.outside) {
          this._editFloor((floor) => floor.entities.splice(d.index, 1));
          this._selection = null;
        } else {
          this._editFloor((floor) => {
            floor.entities[d.index] = { ...floor.entities[d.index], ...d.pos };
          });
          this._selection = { kind: 'entity', index: d.index };
        }
      }
    }

    _canvasCancel() {
      if (this._drag && this._drag.type !== 'palette') this._drag = null;
    }

    _canvasKey(ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') {
        ev.preventDefault();
        this._undo();
        return;
      }
      const sel = this._selection;
      if (ev.key === 'Escape') {
        this._selection = null;
        return;
      }
      if (!sel) return;
      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        ev.preventDefault();
        this._deleteSelection();
        return;
      }
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!arrows[ev.key]) return;
      ev.preventDefault();
      const [ax, ay] = arrows[ev.key];
      if (sel.kind === 'room') {
        const step = ROOM_SNAP;
        this._editFloor((floor) => {
          const r = normalizeRoom(floor.rooms[sel.index], sel.index);
          if (ev.shiftKey) {
            // Shift + arrows resizes from the bottom-right corner.
            floor.rooms[sel.index] = { ...floor.rooms[sel.index], w: Math.max(step, r.w + ax * step), h: Math.max(step, r.h + ay * step) };
          } else {
            const plan = resolveFloor(this.hass, floor);
            floor.rooms[sel.index] = { ...floor.rooms[sel.index], x: r.x + ax * step, y: r.y + ay * step };
            for (const it of plan.items.filter((i) => i.roomIndex === sel.index)) {
              floor.entities[it.index].x = round2(it.x + ax * step);
              floor.entities[it.index].y = round2(it.y + ay * step);
            }
          }
        });
      } else {
        this._editFloor((floor) => {
          const e = floor.entities[sel.index];
          e.x = round2(num(e.x) + ax * ENTITY_SNAP);
          e.y = round2(num(e.y) + ay * ENTITY_SNAP);
        });
      }
    }

    // --- Palette drag & drop ------------------------------------------------

    _paletteDown(ev, entityId) {
      if (ev.button !== 0) return;
      ev.currentTarget.setPointerCapture(ev.pointerId);
      this._drag = { type: 'palette', id: entityId, x: ev.clientX, y: ev.clientY, moved: false, overCanvas: false, pos: null };
    }

    _paletteMove(ev) {
      const d = this._drag;
      if (!d || d.type !== 'palette') return;
      if (!d.moved && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 6) return;
      const p = this._canvasPoint(ev);
      const floor = this._floors()[this._currentFloorIndex()];
      this._drag = { ...d, moved: true, overCanvas: p.inside, pos: this._entityDropPoint(d.id, p, floor) };
    }

    _paletteUp() {
      const d = this._drag;
      if (!d || d.type !== 'palette') return;
      this._drag = null;
      let pos = null;
      if (d.moved && d.overCanvas) pos = d.pos;
      if (!d.moved) pos = this._defaultDropPoint(d.id);
      if (!pos) return;
      let newIndex = 0;
      this._editFloor((floor) => {
        const entity = { entity: d.id, ...pos };
        if (domainOf(d.id) === 'camera') {
          const rooms = floor.rooms.map(normalizeRoom);
          entity.direction = defaultCameraDirection(rooms, rooms.filter((r) => !r.outdoor), pos.x, pos.y);
        }
        floor.entities.push(entity);
        newIndex = floor.entities.length - 1;
      });
      this._selection = { kind: 'entity', index: newIndex };
    }

    _paletteCancel() {
      if (this._drag && this._drag.type === 'palette') this._drag = null;
    }

    // Where a clicked (not dragged) palette entity goes: the selected room, or the middle of the plan.
    _defaultDropPoint(entityId) {
      const floor = this._floors()[this._currentFloorIndex()];
      const rooms = (floor.rooms || []).map(normalizeRoom);
      const sel = this._selection;
      let room = null;
      if (sel && sel.kind === 'room') room = rooms[sel.index];
      else if (sel && sel.kind === 'entity' && floor.entities[sel.index]) {
        const e = floor.entities[sel.index];
        room = rooms[roomAt(rooms, num(e.x), num(e.y))] || null;
      }
      const ext = this._ext;
      const center = room
        ? { x: room.x + room.w / 2, y: room.y + room.h / 2 }
        : { x: ext.x + ext.w / 2, y: ext.y + ext.h / 2 };
      if (domainOf(entityId) === 'cover' && room) {
        return this._entityDropPoint(entityId, { x: center.x, y: room.y }, floor);
      }
      return this._entityDropPoint(entityId, center, floor);
    }

    // --- Other editor actions -----------------------------------------------

    _formChanged(ev) {
      const value = { ...ev.detail.value };
      for (const key of ['temp_min', 'temp_max', 'title', 'wall_height', 'refresh_interval']) {
        if (value[key] === '' || value[key] === undefined || value[key] === null) delete value[key];
      }
      for (const [key, def] of Object.entries(CARD_DEFAULTS)) {
        if (value[key] === def) delete value[key];
      }
      // ha-form gives back the whole data object: keep the floors untouched.
      const config = { ...value, floors: this._config.floors };
      if (config.floors === undefined) delete config.floors;
      this._config = config;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
    }

    _selectionChanged(ev, listKey) {
      const sel = this._selection;
      const value = { ...ev.detail.value };
      for (const key of Object.keys(value)) {
        if (value[key] === '' || value[key] === undefined || value[key] === null) delete value[key];
      }
      if (listKey === 'entities' && num(value.length, WINDOW_LENGTH) === WINDOW_LENGTH) delete value.length;
      if (listKey === 'entities' && (!value.floor_length || domainOf(value.entity) !== 'cover')) delete value.floor_length;
      if (listKey === 'entities' && !value.entity) return;
      if (listKey === 'entities') {
        const defaults = domainOf(value.entity) === 'camera' ? this._cameraDefaults(this._floors()[this._currentFloorIndex()], sel.index) : {};
        // The direction is always kept: it would otherwise change when the camera is moved.
        for (const key of CAMERA_KEYS) if (key in defaults && num(value[key]) === defaults[key]) delete value[key];
        if (!value.projection) delete value.projection;
        if (value.preview_position === 'auto') delete value.preview_position;
        if (domainOf(value.entity) !== 'camera') {
          for (const key of ['direction', 'projection', 'preview_position', 'reference_picture', 'distortion', 'x_scale', 'pins', ...CORRECTION_KEYS, ...CAMERA_KEYS]) delete value[key];
        }
      }
      if (listKey === 'entities') {
        // `light` is only kept when it differs from what the entity's domain gives.
        const naturalRole = entityRole(value.entity, this.hass.states[value.entity]);
        const keep = (naturalRole === 'device' && value.light === true) || (naturalRole === 'light' && value.light === false);
        if (!keep) delete value.light;
      }
      if (listKey === 'rooms' && !value.outdoor) delete value.outdoor;
      this._editFloor((floor) => {
        floor[listKey][sel.index] = value;
      }, `${this._currentFloorIndex()}:${listKey}:${sel.index}`);
    }

    // Values a camera's form shows when they are not set.
    _cameraDefaults(floor, index) {
      const item = resolveFloor(this.hass, floor).items[index];
      const wallHeight = Math.max(1, num(this._config.wall_height, WALL_HEIGHT));
      return {
        direction: item && item.camera ? item.camera.direction : 0,
        fov: CAMERA_FOV,
        tilt: CAMERA_TILT,
        height: round2(Math.min(CAMERA_HEIGHT, wallHeight - 0.3)),
        screen_size: SCREEN_SIZE,
        screen_distance: SCREEN_DISTANCE,
      };
    }

    _floorNameChanged(ev) {
      const name = ev.detail.value.name;
      this._editFloor((floor) => {
        floor.name = name;
      }, `${this._currentFloorIndex()}:name`);
    }

    _deleteSelection() {
      const sel = this._selection;
      if (!sel) return;
      this._editFloor((floor) => {
        (sel.kind === 'room' ? floor.rooms : floor.entities).splice(sel.index, 1);
      });
      this._selection = null;
    }

    _selectFloor(i) {
      this._floorIndex = i;
      this._selection = null;
      this._extentCache = null;
    }

    _addFloor() {
      const floors = JSON.parse(JSON.stringify(this._floors()));
      floors.push({ name: `Floor ${floors.length + 1}`, rooms: [], entities: [] });
      this._commitFloors(floors);
      this._floorIndex = floors.length - 1;
      this._selection = null;
    }

    // A new floor on top with the indoor rooms of the current one (same walls), renamed: they are
    // usually not the same rooms. Outdoor rooms and entities stay on their floor.
    _addFloorSameWalls() {
      const floors = JSON.parse(JSON.stringify(this._floors()));
      const indoor = (floors[this._currentFloorIndex()].rooms || []).filter((r) => !r.outdoor);
      const rooms = indoor.map(({ x, y, w, h }, i) => ({ name: `Room ${i + 1}`, x, y, w, h }));
      floors.push({ name: `Floor ${floors.length + 1}`, rooms, entities: [] });
      this._commitFloors(floors);
      this._floorIndex = floors.length - 1;
      this._selection = null;
    }

    _deleteFloor() {
      const floors = this._floors();
      const floor = floors[this._currentFloorIndex()];
      if (!window.confirm(`Delete the floor "${floor.name || 'Floor'}" and everything on it?`)) return;
      const next = floors.filter((_, i) => i !== this._currentFloorIndex());
      this._commitFloors(JSON.parse(JSON.stringify(next)));
      this._floorIndex = 0;
      this._selection = null;
    }

    _startBlank() {
      this._extentCache = null;
      this._commitFloors([{ name: 'Home', rooms: [], entities: [] }]);
      this._floorIndex = 0;
      this._selection = null;
    }

    _regenerate() {
      if (!window.confirm('Replace the whole plan (every floor) with one generated from your Home Assistant areas?')) return;
      this._extentCache = null;
      this._commitFloors(generateFromAreas(this.hass));
      this._floorIndex = 0;
      this._selection = null;
    }

    static get styles() {
      return i$6`
      :host {
        display: block;
        container-type: inline-size;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --fp-wall: var(--primary-text-color, #e1e1e1);
      }
      .workspace {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .main {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      /* Narrow editor: the list comes right under the plan, so both fit on screen while dragging. */
      .palette {
        order: -1;
      }
      .main {
        display: contents;
      }
      .main > .canvas {
        order: -2;
      }
      @container (min-width: 560px) {
        .workspace {
          flex-direction: row;
          align-items: flex-start;
        }
        .main {
          display: flex;
          flex: 1;
        }
        .main > .canvas {
          order: 0;
        }
        .palette {
          order: 0;
          width: 210px;
          flex: none;
          position: sticky;
          top: 0;
        }
        .palette .palette-list {
          max-height: 420px;
        }
        /* Folded, the list gives its column back to the plan. */
        .palette.collapsed {
          width: auto;
        }
      }
      .section-title {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        --mdc-icon-size: 16px;
      }
      .btn.flat {
        background: transparent;
        color: var(--primary-color);
        padding: 6px 8px;
      }
      .btn[disabled] {
        color: var(--disabled-text-color, #6f6f6f);
        cursor: default;
      }
      .btn.danger {
        margin-left: auto;
        background: transparent;
        color: var(--error-color, #db4437);
      }
      .floor-tabs {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .spacer {
        flex: 1;
      }
      .chip {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
        border-radius: 14px;
        padding: 4px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .chip.small {
        padding: 2px 10px;
      }
      .chip.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .chip.add {
        border-style: dashed;
        color: var(--secondary-text-color);
      }
      .hint {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .hint ha-icon {
        flex: none;
      }
      .hint.warn,
      .hint.warn ha-icon {
        color: var(--warning-color, #ffa600);
      }
      .hint.generated {
        color: var(--primary-text-color);
      }
      .hint.generated ha-icon {
        color: var(--primary-color);
      }

      .canvas {
        position: relative;
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.05));
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: crosshair;
        outline: none;
        overflow: hidden;
      }
      .canvas:focus-visible {
        border-color: var(--primary-color);
      }
      .canvas.removing {
        border-color: var(--error-color, #db4437);
        box-shadow: 0 0 0 2px var(--error-color, #db4437);
      }
      .layer,
      .overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .overlay {
        pointer-events: none;
      }
      .grid-line {
        fill: none;
        stroke: var(--fp-wall);
        stroke-opacity: 0.08;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
      }
      .e-room {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        stroke: var(--fp-wall);
        stroke-opacity: 0.35;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-room-hit {
        fill: transparent;
        cursor: move;
      }
      .e-room-hit:hover {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }
      .e-room.selected {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.22);
        stroke: var(--primary-color);
        stroke-opacity: 1;
        stroke-width: 2px;
      }
      .e-room.outdoor {
        fill: rgba(102, 160, 90, 0.18);
        stroke-dasharray: 4 3;
      }
      .e-cone {
        fill: var(--primary-color);
        fill-opacity: 0.12;
        stroke: var(--primary-color);
        stroke-opacity: 0.4;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-aim {
        stroke: var(--primary-color);
        stroke-width: 2px;
        stroke-dasharray: 3 3;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .handle.aim {
        cursor: grab;
        width: 16px;
        height: 16px;
      }
      .advanced {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-bottom: 8px;
      }
      .cv-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
      }
      .cv-header {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .cv-header > span {
        flex: 1;
      }
      .cv {
        position: relative;
        width: 100%;
        border-radius: 6px;
        overflow: hidden;
        background: #000;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .cv img,
      .cv svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .cv svg {
        pointer-events: none;
        filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.9));
      }
      .cv-line {
        stroke: #fff;
        stroke-opacity: 0.85;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
        fill: none;
        stroke-linejoin: round;
      }
      .cv-line.outdoor {
        stroke-dasharray: 4 3;
      }
      .cv-corner {
        position: absolute;
        width: 16px;
        height: 16px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid #fff;
        background: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6);
        transform: translate(-50%, -50%);
        cursor: grab;
      }
      /* A larger target than the ring, for fingers. */
      .cv-corner::before {
        content: '';
        position: absolute;
        inset: -12px;
        border-radius: 50%;
      }
      .cv-corner.pinned {
        background: var(--primary-color);
      }
      .cv-corner.outside {
        border-style: dashed;
        opacity: 0.8;
      }
      .cv-corner.dragging {
        width: 22px;
        height: 22px;
        border-color: var(--primary-color);
        background: transparent;
        box-shadow: 0 0 0 2px #fff, 0 0 10px var(--primary-color);
      }
      .cv-wrap {
        position: relative;
      }
      /* Magnifier above the finger (see _renderLoupe()). */
      .cv-loupe {
        position: absolute;
        z-index: 2;
        border-radius: 50%;
        overflow: hidden;
        pointer-events: none;
        background-color: #000;
        background-repeat: no-repeat;
        border: 2px solid #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
      }
      .cv-loupe svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.9));
      }
      .cv-cross {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 26px;
        height: 26px;
        transform: translate(-50%, -50%);
        background:
          linear-gradient(var(--primary-color), var(--primary-color)) center / 2px 100% no-repeat,
          linear-gradient(var(--primary-color), var(--primary-color)) center / 100% 2px no-repeat;
      }
      /* Small plan with the dragged corner (see _renderMiniPlan()). */
      .cv-mini {
        position: absolute;
        z-index: 1;
        top: 6px;
        left: 6px;
        width: 30%;
        max-width: 130px;
        padding: 4px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        font-size: 10px;
        text-align: center;
        pointer-events: none;
      }
      .cv-mini.right {
        left: auto;
        right: 6px;
      }
      .cv-mini svg {
        display: block;
        width: 100%;
      }
      .cv-mini rect {
        fill: rgba(255, 255, 255, 0.12);
        stroke: #fff;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
      }
      .cv-mini rect.outdoor {
        fill: rgba(102, 160, 90, 0.3);
        stroke-dasharray: 2 2;
      }
      .cv-mini .cam {
        fill: #fff;
      }
      .cv-mini .corner {
        fill: var(--primary-color);
        stroke: #fff;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
        animation: cv-blink 0.8s ease-in-out infinite;
      }
      @keyframes cv-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .e-corner-hl {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        border: 2px solid #fff;
        background: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color), 0 0 10px var(--primary-color);
        pointer-events: none;
        animation: cv-blink 0.8s ease-in-out infinite;
      }
      .cv:not(.pinned) {
        cursor: move;
      }
      .e-room.overlap {
        stroke: var(--error-color, #db4437);
        stroke-opacity: 1;
        stroke-dasharray: 4 3;
      }
      .e-outer {
        stroke: var(--fp-wall);
        stroke-opacity: 0.7;
        stroke-width: 3px;
        stroke-linecap: square;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-label {
        position: absolute;
        padding: 3px 6px;
        font-size: 11px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .handle {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color, #fff);
        transform: translate(-50%, -50%);
        pointer-events: auto;
        box-sizing: border-box;
      }
      .handle.nw,
      .handle.se {
        cursor: nwse-resize;
      }
      .handle.ne,
      .handle.sw {
        cursor: nesw-resize;
      }
      .e-entity {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        background: var(--card-background-color, #1c1c1c);
        color: var(--primary-text-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        cursor: grab;
        --mdc-icon-size: 16px;
      }
      .e-entity.on-wall {
        border-radius: 4px;
        background: #8fd3ff;
        color: #1c2733;
      }
      .e-entity.off-wall {
        outline: 2px dashed var(--warning-color, #ffa600);
      }
      .e-entity.missing {
        border: 1px dashed var(--error-color, #db4437);
        color: var(--error-color, #db4437);
      }
      .e-entity.selected {
        box-shadow: 0 0 0 3px var(--primary-color);
      }
      .e-entity.ghost {
        opacity: 0.7;
        box-shadow: 0 0 0 2px var(--primary-color);
      }
      .canvas-warning {
        position: absolute;
        right: 8px;
        bottom: 6px;
        font-size: 11px;
        color: var(--error-color, #db4437);
        pointer-events: none;
      }

      .selection {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .selection-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .dims {
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .palette {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .palette-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .palette-header .muted {
        flex: 1;
        text-align: right;
      }
      .palette-header ha-icon {
        --mdc-icon-size: 18px;
        margin-left: auto;
        color: var(--secondary-text-color);
      }
      .palette-header .muted + ha-icon {
        margin-left: 0;
      }
      .muted {
        font-size: 12px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .search {
        box-sizing: border-box;
        width: 100%;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, transparent);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .palette-list {
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      .palette-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 4px;
        border-radius: 6px;
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
      }
      .palette-item:hover {
        background: rgba(127, 127, 127, 0.1);
      }
      .palette-item.dragging {
        opacity: 0.4;
      }
      .grip {
        width: 30px;
        height: 30px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(127, 127, 127, 0.12);
        color: var(--primary-text-color);
        /* Dragging from the icon also works on touch screens (the rest of the row scrolls the list). */
        touch-action: none;
        --mdc-icon-size: 18px;
      }
      .palette-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .palette-name {
        font-size: 13px;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .palette-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .drag-hint {
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .more {
        padding: 8px 4px;
      }
    `;
    }
  }

  if (!customElements.get('ha-plooum-floorplan-card')) {
    customElements.define('ha-plooum-floorplan-card', HaPlooumFloorplanCard);
  }
  if (!customElements.get('ha-plooum-floorplan-card-editor')) {
    customElements.define('ha-plooum-floorplan-card-editor', HaPlooumFloorplanCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === 'ha-plooum-floorplan-card')) {
    window.customCards.push({
      type: 'ha-plooum-floorplan-card',
      name: 'Ha Plooum Floorplan Card',
      description: 'A live floor plan of your home: draw your rooms, drop your devices on it, and watch lights, temperatures and covers in real time.',
      preview: true,
    });
  }

  /* ==========================================================================
     MAIN CARD : ha-plooum-gridicons-card
     ========================================================================== */
  class HaPlooumGridIconsCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    static getConfigElement() {
      return document.createElement("ha-plooum-gridicons-card-editor");
    }

    static getStubConfig() {
      return {
        icon_size: "31px",
        alignment: "space-around",
        padding: "12px",
        icons: [
          {
            entity: "",
            icon: "",
            active_color: "#66bb6a",
            inactive_color: "#ffffff",
            tap_action: { action: "toggle" },
            hold_action: { action: "none" },
            new_row: false,
          },
          {
            entity: "",
            icon: "mdi:pump",
            active_color: "#00bcd4",
            inactive_color: "#ffffff",
            tap_action: { action: "toggle" },
            hold_action: { action: "none" },
            new_row: false,
          }
        ]
      };
    }

    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      this.config = { ...config };
      if (!this.config.icons) {
        this.config.icons = [];
      }
    }

    // --- Utility to normalize action configs (New standard vs Legacy) ---
    _getActionConfig(iconConf, actionPrefix) {
      if (!iconConf) return { action: "none" };

      const actionValue = iconConf[actionPrefix];
      if (actionValue && typeof actionValue === "object") {
        return actionValue;
      }

      // Convert legacy flat properties to standard action object
      const legacyType = iconConf[`${actionPrefix}_type`];
      if (!legacyType || legacyType === "none") {
        return { action: "none" };
      }

      if (legacyType === "toggle") {
        return {
          action: "toggle",
          target: iconConf.entity ? { entity_id: iconConf.entity } : undefined,
        };
      }

      if (legacyType === "navigate") {
        return {
          action: "navigate",
          navigation_path: iconConf[`${actionPrefix}_path`] || "",
        };
      }

      if (legacyType === "execute_script") {
        const scriptEntity = iconConf[`${actionPrefix}_script`];
        const performAction = scriptEntity
          ? (scriptEntity.startsWith("script.") ? scriptEntity : `script.${scriptEntity}`)
          : "";
        return {
          action: "perform-action",
          perform_action: performAction,
        };
      }

      if (legacyType === "perform-action" || legacyType === "call-service") {
        const performAction = iconConf[`${actionPrefix}_perform_action`] || iconConf[`${actionPrefix}_service`] || "";
        const targetEntity = iconConf[`${actionPrefix}_target`] || iconConf.entity || "";
        let data = {};
        const rawData = iconConf[`${actionPrefix}_data`];
        if (rawData) {
          if (typeof rawData === "string") {
            try {
              data = JSON.parse(rawData);
            } catch (e) {
              data = { option: rawData };
            }
          } else if (typeof rawData === "object") {
            data = rawData;
          }
        }

        return {
          action: "perform-action",
          perform_action: performAction,
          target: targetEntity ? { entity_id: targetEntity } : undefined,
          data: data,
        };
      }

      return { action: "none" };
    }

    // --- Confirmation (optional, per action) ---
    // Returns the message to display, or null if no confirmation is required.
    _getConfirmationMessage(iconConf, actionPrefix, actionConfig) {
      const short = actionPrefix === "tap_action" ? "tap" : "hold";
      const defaultMessage = "Are you sure?";

      if (iconConf[`${short}_confirmation`] === true) {
        return iconConf[`${short}_confirmation_text`] || defaultMessage;
      }

      // Also honor the standard Home Assistant `confirmation` key inside the action
      const std = actionConfig && actionConfig.confirmation;
      if (std === true) return defaultMessage;
      if (std && typeof std === "object") return std.text || defaultMessage;

      return null;
    }

    _showConfirmation(message, onConfirm) {
      if (this._confirmOverlay) return; // a dialog is already open

      const openedAt = Date.now();
      const overlay = document.createElement("div");
      overlay.style.cssText = [
        "position:fixed", "inset:0", "z-index:99999",
        "display:flex", "align-items:center", "justify-content:center",
        "background:rgba(0,0,0,0.5)", "padding:16px", "box-sizing:border-box",
      ].join(";");

      const dialog = document.createElement("div");
      dialog.style.cssText = [
        "background:var(--card-background-color, #fff)",
        "color:var(--primary-text-color, #000)",
        "border-radius:var(--ha-card-border-radius, 16px)",
        "padding:20px 20px 12px 20px", "max-width:400px", "width:100%",
        "box-sizing:border-box", "box-shadow:0 8px 32px rgba(0,0,0,0.4)",
        "font-family:var(--paper-font-body1_-_font-family, inherit)",
      ].join(";");

      const text = document.createElement("div");
      text.textContent = message;
      text.style.cssText = "font-size:16px;line-height:1.4;white-space:pre-wrap;margin-bottom:16px;";

      const buttons = document.createElement("div");
      buttons.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";

      const makeButton = (label, primary) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.cssText = [
          "background:transparent", "border:none", "cursor:pointer",
          "padding:10px 16px", "border-radius:8px", "font-size:14px",
          "font-weight:500", "text-transform:uppercase",
          `color:${primary ? "var(--primary-color, #03a9f4)" : "var(--secondary-text-color, #727272)"}`,
        ].join(";");
        return btn;
      };

      const cancelBtn = makeButton("Cancel", false);
      const okBtn = makeButton("OK", true);

      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      };

      const close = () => {
        document.removeEventListener("keydown", onKey, true);
        overlay.remove();
        this._confirmOverlay = null;
      };

      // Ignore clicks right after opening (avoids ghost clicks from the touch that opened the dialog)
      const guarded = (fn) => (e) => {
        e.stopPropagation();
        if (Date.now() - openedAt < 350) return;
        fn();
      };

      cancelBtn.addEventListener("click", guarded(close));
      okBtn.addEventListener("click", guarded(() => {
        close();
        onConfirm();
      }));
      // Click outside the dialog = cancel
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) guarded(close)(e);
      });
      dialog.addEventListener("click", (e) => e.stopPropagation());

      buttons.append(cancelBtn, okBtn);
      dialog.append(text, buttons);
      overlay.append(dialog);
      document.addEventListener("keydown", onKey, true);
      document.body.appendChild(overlay);
      this._confirmOverlay = { close };
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      clearTimeout(this._holdTimer);
      if (this._confirmOverlay) this._confirmOverlay.close();
    }

    // --- Action Handler ---
    _handleAction(iconConf, actionPrefix) {
      const actionConfig = this._getActionConfig(iconConf, actionPrefix);
      if (!actionConfig) return;

      const action = actionConfig.action || "none";
      if (action === "none") return;

      const message = this._getConfirmationMessage(iconConf, actionPrefix, actionConfig);
      if (message) {
        this._showConfirmation(message, () => this._executeAction(iconConf, actionConfig));
      } else {
        this._executeAction(iconConf, actionConfig);
      }
    }

    _executeAction(iconConf, actionConfig) {
      const action = actionConfig.action || "none";
      if (action === "none") return;

      if (action === "toggle") {
        const entityId = actionConfig.target?.entity_id || iconConf.entity;
        if (entityId) {
          // Use the native universal service (handles all domains)
          this.hass.callService("homeassistant", "toggle", { entity_id: entityId });
        }
      } 
      else if (action === "navigate") {
        const path = actionConfig.navigation_path || actionConfig.path;
        if (path) {
          window.history.pushState(null, "", path);
          window.dispatchEvent(new CustomEvent("location-changed"));
        }
      } 
      else if (action === "more-info") {
        let entityId = actionConfig.target?.entity_id || iconConf.entity;
        if (Array.isArray(entityId)) entityId = entityId[0];
        if (entityId) {
          const event = new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        }
      }
      else if (action === "perform-action" || action === "call-service") {
        const performAction = actionConfig.perform_action || actionConfig.service;
        if (performAction) {
          const parts = performAction.split(".");
          const domain = parts[0];
          const service = parts.slice(1).join(".");
          
          let target = actionConfig.target;
          if (!target && iconConf.entity) {
            target = { entity_id: iconConf.entity };
          } else if (typeof target === "string") {
            target = { entity_id: target };
          }
          
          const data = actionConfig.data || {};
          
          this.hass.callService(domain, service, data, target);
        }
      }
    }

    // --- Tap / Hold Events ---
    _startTimer(e, iconConf) {
      // Guard against touch+mouse double clicks on mobile
      if (e.type === "mousedown" && this._isTouch) return;
      if (e.type === "touchstart") this._isTouch = true;

      e.stopPropagation();
      this._longPress = false;
      clearTimeout(this._holdTimer);
      this._holdTimer = setTimeout(() => {
        this._longPress = true;
        this._handleAction(iconConf, "hold_action");
      }, 500);
    }

    _stopTimer(e, iconConf) {
      // Guard against touch+mouse double clicks on mobile
      if (e.type === "mouseup" && this._isTouch) return;

      e.stopPropagation();
      clearTimeout(this._holdTimer);
      if (!this._longPress) {
        this._handleAction(iconConf, "tap_action");
      }

      if (e.type === "touchend") {
        // Disable the touch guard after a short delay
        setTimeout(() => { this._isTouch = false; }, 300);
      }
    }

    render() {
      if (!this.config || !this.hass) return b``;

      const iconSize = this.config.icon_size || "31px";
      const alignment = this.config.alignment || "space-around";
      const padding = this.config.padding || "12px";
      const icons = Array.isArray(this.config.icons) ? this.config.icons : [];

      return b`
      <ha-card class="plooum-grid-card" style="padding: ${padding};">
        <div class="grid-container" style="justify-content: ${alignment};">
          ${icons.map((iconConf, index) => {
            const stateObj = iconConf && iconConf.entity ? this.hass.states[iconConf.entity] : undefined;
            const isActive = stateObj && stateObj.state !== "off" && stateObj.state !== "unavailable";
            const color = isActive 
              ? (iconConf.active_color || "#FFC107") 
              : (iconConf.inactive_color || "#FFFFFF");

            return b`
              ${iconConf.new_row && index > 0 ? b`<div class="flex-break"></div>` : ""}
              <div 
                class="icon-wrapper" 
                @mousedown="${(e) => this._startTimer(e, iconConf)}"
                @mouseup="${(e) => this._stopTimer(e, iconConf)}"
                @touchstart="${(e) => this._startTimer(e, iconConf)}"
                @touchend="${(e) => this._stopTimer(e, iconConf)}"
                @contextmenu="${(e) => { e.preventDefault(); e.stopPropagation(); }}"
              >
                ${iconConf.icon 
                  ? b`<ha-icon icon="${iconConf.icon}" style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-icon>`
                  : (stateObj 
                      ? b`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj} style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-state-icon>`
                      : b`<ha-icon icon="mdi:help-circle" style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-icon>`
                    )
                }
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
    }

    static get styles() {
      return i$6`
      .plooum-grid-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        min-height: 56px;
        display: flex;
        align-items: center;
      }
      .grid-container {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 12px 8px;
        align-items: center;
      }
      .flex-break {
        flex-basis: 100%;
        height: 0;
      }
      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        transition: transform 0.1s ease;
      }
      .icon-wrapper:active {
        transform: scale(0.9);
      }
    `;
    }
  }

  /* ==========================================================================
     CARD EDITOR
     ========================================================================== */
  class HaPlooumGridIconsCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { type: Object },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this._loadHAElements();
    }

    async _loadHAElements() {
      if (customElements.get("ha-entity-picker") && customElements.get("ha-selector")) return;

      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers) {
          await helpers.createCardElement({ type: "button" });
          this.requestUpdate();
        }
      }
    }

    setConfig(config) {
      this._config = { icons: [], ...config };
    }

    _fireConfigChange(newConfig) {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }

    _valueChanged(ev, key) {
      if (!this._config || !this.hass) return;
      let val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
      if (this._config[key] === val) return;
      this._fireConfigChange({ ...this._config, [key]: val });
    }

    _iconValueChanged(ev, index, key) {
      if (!this._config || !this.hass) return;
      let val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
      
      const newIcons = [...this._config.icons];
      if (newIcons[index][key] === val) return;

      newIcons[index] = { ...newIcons[index], [key]: val };
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _iconCheckboxChanged(ev, index, key) {
      if (!this._config || !this.hass) return;
      const val = ev.target.checked;
      
      const newIcons = [...this._config.icons];
      if (newIcons[index][key] === val) return;

      newIcons[index] = { ...newIcons[index], [key]: val };
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _actionValueChanged(ev, index, actionPrefix) {
      if (!this._config || !this.hass) return;
      const val = ev.detail?.value;
      
      const newIcons = [...this._config.icons];
      newIcons[index] = { ...newIcons[index], [actionPrefix]: val };
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _getActionConfig(iconConf, actionPrefix) {
      if (!iconConf) return { action: "none" };

      const actionValue = iconConf[actionPrefix];
      if (actionValue && typeof actionValue === "object") {
        return actionValue;
      }

      const legacyType = iconConf[`${actionPrefix}_type`];
      if (!legacyType || legacyType === "none") {
        return { action: "none" };
      }

      if (legacyType === "toggle") {
        return {
          action: "toggle",
          target: iconConf.entity ? { entity_id: iconConf.entity } : undefined,
        };
      }

      if (legacyType === "navigate") {
        return {
          action: "navigate",
          navigation_path: iconConf[`${actionPrefix}_path`] || "",
        };
      }

      if (legacyType === "execute_script") {
        const scriptEntity = iconConf[`${actionPrefix}_script`];
        const performAction = scriptEntity
          ? (scriptEntity.startsWith("script.") ? scriptEntity : `script.${scriptEntity}`)
          : "";
        return {
          action: "perform-action",
          perform_action: performAction,
        };
      }

      if (legacyType === "perform-action" || legacyType === "call-service") {
        const performAction = iconConf[`${actionPrefix}_perform_action`] || iconConf[`${actionPrefix}_service`] || "";
        const targetEntity = iconConf[`${actionPrefix}_target`] || iconConf.entity || "";
        let data = {};
        const rawData = iconConf[`${actionPrefix}_data`];
        if (rawData) {
          if (typeof rawData === "string") {
            try {
              data = JSON.parse(rawData);
            } catch (e) {
              data = { option: rawData };
            }
          } else if (typeof rawData === "object") {
            data = rawData;
          }
        }

        return {
          action: "perform-action",
          perform_action: performAction,
          target: targetEntity ? { entity_id: targetEntity } : undefined,
          data: data,
        };
      }

      return { action: "none" };
    }

    // --- Copy / Paste Logic ---
    _copyIcon(index, ev) {
      const iconConf = this._config.icons[index];
      localStorage.setItem("ha_plooum_icon_clipboard", JSON.stringify(iconConf));
      
      // Visual feedback
      if (ev && ev.target) {
        const btn = ev.target;
        const oldText = btn.innerHTML;
        btn.innerHTML = "✔ Copied";
        setTimeout(() => { btn.innerHTML = oldText; }, 1000);
      }
    }

    _pasteIcon(index) {
      const clipboard = localStorage.getItem("ha_plooum_icon_clipboard");
      if (!clipboard) {
        alert("Clipboard is empty. Copy an icon first.");
        return;
      }
      try {
        const pastedIcon = JSON.parse(clipboard);
        const newIcons = [...this._config.icons];
        newIcons[index] = { ...pastedIcon };
        this._fireConfigChange({ ...this._config, icons: newIcons });
      } catch (e) {
        console.error("Paste failed", e);
      }
    }

    _pasteNewIcon() {
      const clipboard = localStorage.getItem("ha_plooum_icon_clipboard");
      if (!clipboard) {
        alert("Clipboard is empty. Copy an icon first.");
        return;
      }
      try {
        const pastedIcon = JSON.parse(clipboard);
        const newIcons = [...(this._config.icons || [])];
        newIcons.push({ ...pastedIcon });
        this._fireConfigChange({ ...this._config, icons: newIcons });
      } catch (e) {
        console.error("Paste new failed", e);
      }
    }

    _addIcon() {
      const newIcons = [...(this._config.icons || [])];
      newIcons.push({
        entity: "",
        icon: "",
        active_color: "#FFC107",
        inactive_color: "#FFFFFF",
        tap_action: { action: "toggle" },
        hold_action: { action: "none" },
        new_row: false
      });
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _removeIcon(index) {
      const newIcons = [...this._config.icons];
      newIcons.splice(index, 1);
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _moveIcon(index, direction) {
      const newIcons = [...this._config.icons];
      if (direction === "up" && index > 0) {
        [newIcons[index - 1], newIcons[index]] = [newIcons[index], newIcons[index - 1]];
      } else if (direction === "down" && index < newIcons.length - 1) {
        [newIcons[index + 1], newIcons[index]] = [newIcons[index], newIcons[index + 1]];
      }
      this._fireConfigChange({ ...this._config, icons: newIcons });
    }

    _renderColorPicker(labelTitle, index, key, defaultColor) {
      const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
      const val = iconConf[key] !== undefined ? iconConf[key] : defaultColor;
      let hexColor = "#000000";

      if (typeof val === "string" && val.length === 7 && val.startsWith("#")) {
        hexColor = val;
      } else if (typeof val === "string" && val.length === 4 && val.startsWith("#")) {
        hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      }

      return b`
      <div class="input-field color-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input type="color" .value=${hexColor} @input=${(e) => this._iconValueChanged(e, index, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._iconValueChanged(e, index, key)} />
        </div>
      </div>
    `;
    }

    _renderConfirmationConfig(index, actionPrefix) {
      const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
      const short = actionPrefix === "tap_action" ? "tap" : "hold";
      const enabled = Boolean(iconConf[`${short}_confirmation`]);
      const text = iconConf[`${short}_confirmation_text`] || "";

      return b`
      <div class="confirm-group">
        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${enabled}
              @change=${(e) => this._iconCheckboxChanged(e, index, `${short}_confirmation`)}
            />
            Ask for confirmation
          </label>
        </div>
        ${enabled ? b`
          <div class="input-field">
            <label>Confirmation message</label>
            <input
              type="text"
              placeholder="Are you sure?"
              .value=${text}
              @input=${(e) => this._iconValueChanged(e, index, `${short}_confirmation_text`)}
            />
          </div>
        ` : ""}
      </div>
    `;
    }

    _renderActionConfig(index, actionPrefix, labelTitle) {
      const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
      const actionValue = this._getActionConfig(iconConf, actionPrefix);

      return b`
      <div class="action-group">
        <label class="action-label">${labelTitle}</label>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ ui_action: {} }}
          .value=${actionValue}
          .label=${labelTitle}
          @value-changed=${(e) => this._actionValueChanged(e, index, actionPrefix)}
        ></ha-selector>
        ${this._renderConfirmationConfig(index, actionPrefix)}
      </div>
    `;
    }

    render() {
      if (!this.hass || !this._config) return b``;

      const icons = this._config.icons || [];

      return b`
      <div class="card-config">
        <h3>Global Settings</h3>
        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input type="text" placeholder="31px" .value=${this._config.icon_size || "31px"} @input=${(e) => this._valueChanged(e, "icon_size")} />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Padding</label>
            <input type="text" placeholder="12px" .value=${this._config.padding || "12px"} @input=${(e) => this._valueChanged(e, "padding")} />
          </div>
        </div>
        <div class="input-field" style="margin-top: 8px;">
          <label>Alignment</label>
          <select .value=${this._config.alignment || "space-around"} @change=${(e) => this._valueChanged(e, "alignment")}>
            <option value="space-around">Space Around</option>
            <option value="space-between">Space Between</option>
            <option value="center">Center</option>
            <option value="flex-start">Left</option>
            <option value="flex-end">Right</option>
          </select>
        </div>

        <hr />
        <h3>Icons (${icons.length})</h3>

        <div class="icons-list">
          ${icons.map((iconConf, index) => b`
            <div class="icon-config-block">
              <div class="icon-header">
                <strong>Icon #${index + 1}</strong>
                <div class="icon-actions">
                  <button class="icon-btn copy-btn" title="Copy this icon" @click=${(e) => this._copyIcon(index, e)}>Copy</button>
                  <button class="icon-btn paste-btn" title="Replace with the copied icon" @click=${() => this._pasteIcon(index)}>Paste</button>
                  <button class="icon-btn" title="Move up" @click=${() => this._moveIcon(index, "up")} ?disabled=${index === 0}>&#9650;</button>
                  <button class="icon-btn" title="Move down" @click=${() => this._moveIcon(index, "down")} ?disabled=${index === icons.length - 1}>&#9660;</button>
                  <button class="icon-btn remove-btn" title="Delete" @click=${() => this._removeIcon(index)}>&#10006;</button>
                </div>
              </div>

              <ha-entity-picker
                .label=${"Entity"}
                .hass=${this.hass}
                .value=${iconConf.entity || ""}
                @value-changed=${(e) => this._iconValueChanged(e, index, "entity")}
                allow-custom-entity
              ></ha-entity-picker>

              <ha-icon-picker
                .label=${"Icon (leave empty to use the entity's default icon)"}
                .hass=${this.hass}
                .value=${iconConf.icon || ""}
                @value-changed=${(e) => this._iconValueChanged(e, index, "icon")}
              ></ha-icon-picker>

              <div style="display: flex; gap: 8px;">
                ${this._renderColorPicker("Active Color", index, "active_color", "#FFC107")}
                ${this._renderColorPicker("Inactive Color", index, "inactive_color", "#FFFFFF")}
              </div>

              ${index > 0 ? b`
                <div class="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      .checked=${Boolean(iconConf.new_row)}
                      @change=${(e) => this._iconCheckboxChanged(e, index, "new_row")}
                    />
                    Start on a new row
                  </label>
                </div>
              ` : ""}

              <div class="actions-container">
                ${this._renderActionConfig(index, "tap_action", "Tap Action (Short press)")}
                ${this._renderActionConfig(index, "hold_action", "Hold Action (Long press)")}
              </div>
            </div>
          `)}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="add-btn" style="flex: 1;" @click=${this._addIcon}>+ Add an icon</button>
          <button class="add-btn" style="flex: 1; border-style: solid;" @click=${this._pasteNewIcon}>📋 Paste as a new icon</button>
        </div>
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      h3 {
        margin: 12px 0 4px 0;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      input[type="text"], select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker, ha-icon-picker, ha-selector {
        width: 100%;
        display: block;
        margin-top: 4px;
      }
      .action-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 6px;
      }
      .action-label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        font-weight: 500;
      }
      .color-field {
        flex: 1;
      }
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="text"] {
        flex-grow: 1;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0;
      }
      .checkbox-field label {
        font-size: 0.9em;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
      
      .icons-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .icon-config-block {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(127, 127, 127, 0.05);
      }
      .icon-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
        margin-bottom: 4px;
      }
      .icon-actions {
        display: flex;
        gap: 4px;
      }
      .icon-btn {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .copy-btn {
        color: var(--info-color, #2196f3);
      }
      .paste-btn {
        color: var(--success-color, #4caf50);
      }
      .remove-btn {
        color: var(--error-color, #f44336);
      }
      .actions-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-left: 3px solid var(--primary-color);
        padding-left: 10px;
        margin-top: 4px;
      }
      .confirm-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
      }
      .add-btn {
        padding: 10px;
        border-radius: 4px;
        border: 2px dashed var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        font-weight: bold;
        cursor: pointer;
        text-align: center;
        transition: background 0.2s;
      }
      .add-btn:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }
    `;
    }
  }

  /* ==========================================================================
     HOME ASSISTANT REGISTRATION
     ========================================================================== */
  if (!customElements.get("ha-plooum-gridicons-card")) {
    customElements.define("ha-plooum-gridicons-card", HaPlooumGridIconsCard);
  }
  if (!customElements.get("ha-plooum-gridicons-card-editor")) {
    customElements.define("ha-plooum-gridicons-card-editor", HaPlooumGridIconsCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === "ha-plooum-gridicons-card")) {
    window.customCards.push({
      type: "ha-plooum-gridicons-card",
      name: "Ha Plooum GridIcons Card",
      description: "A custom card to display multiple entity icons side by side within a single pill.",
      preview: true,
    });
  }

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const i=e(class extends i$2{constructor(){super(...arguments),this.key=A;}render(r,t){return this.key=r,t}update(r,[t,e]){return t!==this.key&&(p(r),this.key=t),e}});

  const CARD_VERSION$1 = '1.0.0';

  const UNAVAILABLE_STATES$1 = ['unavailable', 'unknown'];
  const OFF_STATES = ['off', 'closed', 'idle'];
  const HOLD_DELAY = 500; // ms before a press on a chip or a measure runs its hold action
  const DEFAULT_FOLD_WIDTH = 240; // px: in `fold: auto`, the card folds below this width
  const FOLD_KEY_PREFIX = 'ha-plooum-habitat-fold:'; // localStorage key prefix of a card's fold override
  const RANGE_PAD = 0.6; // space shown on each side of a target range on its bar, as a ratio of the range width

  // Severity levels, from the least to the most severe.
  const LEVELS = ['ok', 'info', 'warn', 'alert'];
  const LEVEL_ICONS = {
    info: 'mdi:information-outline',
    warn: 'mdi:alert-outline',
    alert: 'mdi:alert-octagon-outline',
  };

  const MEASURE_DOMAINS = ['sensor', 'input_number', 'number'];
  const SWITCH_DOMAINS = ['switch', 'input_boolean', 'light', 'fan'];
  // Domains toggled through homeassistant.toggle (light uses light.toggle).
  const TOGGLE_DOMAINS = ['switch', 'input_boolean', 'fan', 'climate', 'humidifier', 'siren', 'valve', 'automation'];
  // Domains a "trigger" role (feeder) runs instead of toggling: they are never "off".
  const TRIGGER_SERVICES = {
    button: 'button.press',
    input_button: 'input_button.press',
    script: 'script.turn_on',
    scene: 'scene.turn_on',
  };

  /* ==========================================================================
     ROLE REGISTRY
     Adding a sensor or equipment type = one entry here. Rendering, severity,
     editor choices, default icons and ranges all read from this table.
     ========================================================================== */
  const ROLES = {
    temperature: {
      kind: 'measure',
      label: 'Temperature',
      icon: 'mdi:thermometer',
      color: 'var(--orange-color, #ff9800)',
      domains: MEASURE_DOMAINS,
      device_class: 'temperature',
      match: /temp/,
      unit: '°C',
      decimals: 1,
      warn_margin: 0.5,
      words: { high: 'Too warm', low: 'Too cold' },
      ranges: { aquarium: [24, 26], pond: [12, 22], terrarium: [24, 30], paludarium: [24, 28] },
    },
    humidity: {
      kind: 'measure',
      label: 'Humidity',
      icon: 'mdi:water-percent',
      color: 'var(--blue-color, #2196f3)',
      domains: MEASURE_DOMAINS,
      device_class: 'humidity',
      match: /humid/,
      unit: '%',
      decimals: 0,
      warn_margin: 3,
      words: { high: 'Too humid', low: 'Too dry' },
      ranges: { terrarium: [60, 80], paludarium: [70, 90] },
    },
    ph: {
      kind: 'measure',
      label: 'pH',
      icon: 'mdi:ph',
      color: 'var(--purple-color, #9c27b0)',
      domains: MEASURE_DOMAINS,
      device_class: 'ph',
      match: /(^|[._ ])ph($|[._ ])/,
      unit: '',
      decimals: 1,
      warn_margin: 0.2,
      words: { high: 'pH too high', low: 'pH too low' },
      ranges: { aquarium: [6.5, 7.5], pond: [7, 8.5], paludarium: [6.5, 7.5] },
    },
    conductivity: {
      kind: 'measure',
      label: 'Conductivity',
      icon: 'mdi:flash-outline',
      color: 'var(--brown-color, #795548)',
      domains: MEASURE_DOMAINS,
      device_class: 'conductivity',
      match: /conduct|tds/,
      unit: 'µS/cm',
      decimals: 0,
      words: { high: 'Conductivity high', low: 'Conductivity low' },
    },
    water_level: {
      kind: 'measure',
      label: 'Water level',
      icon: 'mdi:waves-arrow-up',
      color: 'var(--light-blue-color, #03a9f4)',
      domains: MEASURE_DOMAINS,
      match: /level/,
      words: { high: 'Level high', low: 'Level low' },
    },
    light: {
      kind: 'actuator',
      label: 'Light',
      icon: 'mdi:lightbulb',
      color: 'var(--amber-color, #ffc107)',
      domains: ['light', 'switch', 'input_boolean', 'number', 'input_number', 'sensor'],
      match: /light|lamp/,
      dimmable: true, // shows its % when the entity provides one
      night: true, // off and nothing worse: info "Night"
    },
    co2: {
      kind: 'actuator',
      label: 'CO2',
      icon: 'mdi:molecule-co2',
      color: 'var(--teal-color, #009688)',
      domains: SWITCH_DOMAINS,
      match: /co2/,
    },
    air: {
      kind: 'actuator',
      label: 'Air',
      icon: 'mdi:chart-bubble',
      color: 'var(--blue-color, #2196f3)',
      domains: SWITCH_DOMAINS,
      match: /air|bubbl|oxygen/,
    },
    filter: {
      kind: 'actuator',
      label: 'Filter',
      icon: 'mdi:air-filter',
      color: 'var(--blue-grey-color, #607d8b)',
      domains: SWITCH_DOMAINS,
      match: /filter/,
    },
    uv: {
      kind: 'actuator',
      label: 'UV',
      icon: 'mdi:sun-wireless',
      color: 'var(--deep-purple-color, #7e57c2)',
      domains: SWITCH_DOMAINS,
      match: /uv/,
    },
    heater: {
      kind: 'actuator',
      label: 'Heater',
      icon: 'mdi:heating-coil',
      color: 'var(--deep-orange-color, #ff5722)',
      domains: [...SWITCH_DOMAINS, 'climate'],
      match: /heat|basking/,
    },
    cooling: {
      kind: 'actuator',
      label: 'Cooling',
      icon: 'mdi:snowflake',
      color: 'var(--light-blue-color, #03a9f4)',
      domains: [...SWITCH_DOMAINS, 'climate'],
      match: /fan|cool|chill/,
    },
    mister: {
      kind: 'actuator',
      label: 'Mister',
      icon: 'mdi:weather-fog',
      color: 'var(--cyan-color, #00bcd4)',
      domains: SWITCH_DOMAINS,
      match: /mist|fog/,
    },
    pump: {
      kind: 'actuator',
      label: 'Pump',
      icon: 'mdi:pump',
      color: 'var(--indigo-color, #3f51b5)',
      domains: SWITCH_DOMAINS,
      match: /pump/,
    },
    feeder: {
      kind: 'actuator',
      label: 'Feeder',
      icon: 'mdi:shaker-outline',
      color: 'var(--brown-color, #795548)',
      domains: ['button', 'input_button', 'script', ...SWITCH_DOMAINS],
      match: /feed/,
      trigger: true, // a button/script is "ready", never "off"; a tap runs it
    },
    custom: {
      kind: null, // from the item's `kind`
      label: 'Custom',
      icon: 'mdi:flask-outline',
      color: 'var(--primary-color, #03a9f4)',
      domains: null, // any entity
    },
  };

  // Habitat types: default icon, and the roles the editor suggests first. They don't restrict anything.
  const HABITATS = {
    aquarium: {
      label: 'Aquarium',
      icon: 'mdi:fishbowl-outline',
      suggested: ['temperature', 'light', 'co2', 'air', 'filter', 'heater', 'ph', 'feeder'],
    },
    pond: {
      label: 'Pond',
      icon: 'mdi:waves',
      suggested: ['temperature', 'uv', 'pump', 'filter', 'air', 'water_level', 'feeder'],
    },
    terrarium: {
      label: 'Terrarium',
      icon: 'mdi:turtle',
      suggested: ['temperature', 'humidity', 'heater', 'uv', 'light', 'mister', 'cooling'],
    },
    paludarium: {
      label: 'Paludarium',
      icon: 'mdi:sprout',
      suggested: ['temperature', 'humidity', 'light', 'mister', 'pump', 'filter', 'heater'],
    },
  };

  const STRIP_STYLES = ['quiet', 'tinted', 'solid'];
  const FOLD_MODES = ['auto', 'folded', 'unfolded'];

  function toNumber(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  function itemKind(item) {
    const role = ROLES[item.role];
    if (!role) return 'measure';
    return role.kind || (item.kind === 'actuator' ? 'actuator' : 'measure');
  }

  // Merges an item's config over its role defaults.
  function resolveItem(item, index, habitat) {
    const role = ROLES[item.role];
    const range = (role.ranges && role.ranges[habitat]) || [];
    const min = toNumber(item.min);
    const max = toNumber(item.max);
    return {
      index,
      config: item,
      role: item.role,
      kind: itemKind(item),
      entity: item.entity,
      label: item.name || role.label,
      icon: item.icon || role.icon,
      color: item.color || role.color,
      // An item that sets one limit doesn't inherit the other one.
      min: min !== undefined || max !== undefined ? min : range[0],
      max: min !== undefined || max !== undefined ? max : range[1],
      warnMargin: toNumber(item.warn_margin) ?? role.warn_margin ?? 0,
      critical: item.critical === true,
      main: item.main === true,
      dimmable: !!role.dimmable,
      night: !!role.night,
      trigger: !!role.trigger,
      words: role.words,
      decimals: role.decimals,
      unit: item.unit,
      roleUnit: role.unit,
    };
  }

  function levelRank(level) {
    return LEVELS.indexOf(level);
  }

  // The fold override chosen with the strip's chevron, kept per card on this device.
  function readFoldOverride(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writeFoldOverride(key, value) {
    try {
      if (value) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
    } catch (err) {
      // localStorage unavailable: the override only lasts for this page.
    }
  }

  /* ==========================================================================
     MAIN CARD : ha-plooum-habitat-card
     ========================================================================== */
  class HaPlooumHabitatCard extends i$3 {
    static get properties() {
      return {
        hass: { attribute: false },
        config: { attribute: false },
        layout: { attribute: false },
        _autoFolded: { state: true },
        _override: { state: true },
      };
    }

    constructor() {
      super();
      this._autoFolded = false;
      this._override = null;
      this._levelSince = new Map(); // item key -> { level, since }: when an item entered its current level
      this._naturalHeight = 0; // px height of the unfolded card, measured while unfolded
      this._size = null;
    }

    static getConfigElement() {
      return document.createElement('ha-plooum-habitat-card-editor');
    }

    static getStubConfig(hass) {
      const states = Object.values((hass && hass.states) || {});
      const pick = (test) =>
        states.find((s) => test(s) && /aquar/.test(s.entity_id)) || states.find((s) => test(s));
      const temperature = pick(
        (s) => s.entity_id.startsWith('sensor.') && s.attributes.device_class === 'temperature'
      );
      const light = pick((s) => s.entity_id.startsWith('light.'));
      const items = [];
      items.push({ role: 'temperature', entity: temperature ? temperature.entity_id : 'sensor.aquarium_temperature' });
      if (light) items.push({ role: 'light', entity: light.entity_id });
      return { name: 'Aquarium', habitat: 'aquarium', items };
    }

    setConfig(config) {
      if (!config) throw new Error('Invalid configuration');
      if (config.habitat !== undefined && !HABITATS[config.habitat]) {
        throw new Error(`Unknown habitat "${config.habitat}" (use ${Object.keys(HABITATS).join(', ')})`);
      }
      if (config.strip_style !== undefined && !STRIP_STYLES.includes(config.strip_style)) {
        throw new Error(`Unknown strip_style "${config.strip_style}" (use ${STRIP_STYLES.join(', ')})`);
      }
      if (config.fold !== undefined && !FOLD_MODES.includes(config.fold)) {
        throw new Error(`Unknown fold "${config.fold}" (use ${FOLD_MODES.join(', ')})`);
      }
      const items = config.items || [];
      if (!Array.isArray(items)) throw new Error('items must be a list');
      items.forEach((item, i) => {
        if (!item || typeof item !== 'object') throw new Error(`Item ${i + 1}: invalid item`);
        if (!item.role) throw new Error(`Item ${i + 1}: missing role`);
        if (!ROLES[item.role]) {
          throw new Error(`Item ${i + 1}: unknown role "${item.role}" (use ${Object.keys(ROLES).join(', ')})`);
        }
        if (!item.entity) throw new Error(`Item ${i + 1} (${item.name || ROLES[item.role].label}): missing entity`);
      });
      this.config = config;
      this._levelSince = new Map();
      this._override = this._foldMode === 'auto' ? readFoldOverride(this._foldKey) : null;
    }

    connectedCallback() {
      super.connectedCallback();
      console.info(
        `%c HA-PLOOUM-HABITAT-CARD %c ${CARD_VERSION$1} `,
        'color: white; background: #03a9f4; font-weight: 700;',
        'color: #03a9f4; background: white; font-weight: 700;'
      );
      this._resizeObserver = new ResizeObserver((entries) => this._onResize(entries[0].contentRect));
      this._resizeObserver.observe(this);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._resizeObserver) this._resizeObserver.disconnect();
      this._clearHold();
    }

    /* --- Size and folding --- */

    get _habitat() {
      return (this.config && this.config.habitat) || 'aquarium';
    }

    get _foldMode() {
      return (this.config && this.config.fold) || 'auto';
    }

    // Resolved items; the main measure (`main: true`, else the first measure) gets `main` set.
    get _specs() {
      const specs = (this.config.items || []).map((item, i) => resolveItem(item, i, this._habitat));
      const measures = specs.filter((s) => s.kind === 'measure');
      const main = measures.find((s) => s.main) || measures[0];
      specs.forEach((s) => (s.main = s === main));
      return specs;
    }

    _mainSpec(specs) {
      return specs.find((s) => s.main);
    }

    get _foldKey() {
      const specs = this._specs;
      const main = this._mainSpec(specs) || specs[0];
      return `${FOLD_KEY_PREFIX}${this.config.name || ''}|${main ? main.entity : ''}`;
    }

    get _folded() {
      const mode = this._foldMode;
      if (mode !== 'auto') return this._override ? this._override.folded : mode === 'folded';
      // An override only holds while the automatic choice is the one it overrode.
      if (this._override && this._override.auto === this._autoFolded) return this._override.folded;
      return this._autoFolded;
    }

    _toggleFold() {
      const folded = !this._folded;
      if (this._foldMode === 'auto') {
        this._override = folded === this._autoFolded ? null : { auto: this._autoFolded, folded };
        writeFoldOverride(this._foldKey, this._override);
      } else {
        this._override = { folded }; // fixed mode: only for this page
      }
    }

    _onResize(rect) {
      if (!this.config) return;
      this._size = rect;
      if (!this._folded) this._measureNatural();
      const threshold = toNumber(this.config.fold_below_width) ?? DEFAULT_FOLD_WIDTH;
      const narrow = rect.width > 0 && rect.width < threshold;
      // In a sections grid with fixed rows, the cell's height is given by the grid, not by the
      // content: fold when the unfolded layout doesn't fit. Elsewhere the height follows the content.
      // By default the rows are "auto" (see getGridOptions): only rows set in the config fix the height.
      const rows = this.config.grid_options && this.config.grid_options.rows;
      const fixedHeight = this.layout === 'grid' && typeof rows === 'number';
      const short = fixedHeight && this._naturalHeight > 0 && rect.height + 1 < this._naturalHeight;
      const autoFolded = narrow || short;
      if (autoFolded !== this._autoFolded) this._autoFolded = autoFolded;
    }

    // Height of the unfolded content, independent of the height the parent gives the card.
    _measureNatural() {
      const strip = this.renderRoot && this.renderRoot.querySelector('.strip');
      const body = this.renderRoot && this.renderRoot.querySelector('.body');
      if (!strip || !body) return;
      this._naturalHeight = strip.offsetHeight + body.offsetHeight + 2; // + card borders
    }

    updated(changed) {
      super.updated(changed);
      if (!this._folded) {
        this._measureNatural();
        // Re-check a grid cell once the unfolded height is known.
        if (this._size && changed.has('config')) this._onResize(this._size);
      }
    }

    // Estimated unfolded height, in px, from the config alone (before anything is measured).
    _estimatedHeight() {
      const specs = this._specs;
      const measures = specs.filter((s) => s.kind === 'measure').length;
      const actuators = specs.length - measures;
      let height = 46; // strip
      if (measures || actuators) height += 22; // body padding
      if (measures) height += 58;
      if (actuators) height += Math.ceil(actuators / 4) * 34 + (measures ? 10 : 0);
      return height;
    }

    getCardSize() {
      if (!this.config || this._foldMode === 'folded') return 1;
      return Math.max(1, Math.ceil(this._estimatedHeight() / 50));
    }

    getGridOptions() {
      if (!this.config || this._foldMode === 'folded') {
        return { columns: 6, rows: 1, min_columns: 3, min_rows: 1 };
      }
      // Unfolded, the height follows the content (chips wrap with the width). Setting `rows` in
      // grid_options fixes it, and the card then folds when the unfolded layout doesn't fit.
      return { columns: 6, rows: 'auto', min_columns: 3, min_rows: 1 };
    }

    /* --- Reading states --- */

    _evaluate(spec) {
      const stateObj = this.hass.states[spec.entity];
      const result = { spec, stateObj, level: 'ok', message: '', icon: null, status: 'on', value: undefined };
      const unavailable = !stateObj || UNAVAILABLE_STATES$1.includes(stateObj.state);
      if (spec.kind === 'measure') {
        const value = unavailable || stateObj.state === '' ? undefined : toNumber(stateObj.state);
        result.value = value;
        result.status = value === undefined ? 'na' : 'value';
        if (value === undefined) {
          this._setLevel(result, spec.critical ? 'alert' : 'warn', `${spec.label} unavailable`);
        } else if (spec.max !== undefined && value > spec.max) {
          result.out = true;
          this._setLevel(result, 'alert', this._word(spec, 'high'));
        } else if (spec.min !== undefined && value < spec.min) {
          result.out = true;
          this._setLevel(result, 'alert', this._word(spec, 'low'));
        } else if (
          spec.warnMargin > 0 &&
          ((spec.max !== undefined && spec.max - value < spec.warnMargin) ||
            (spec.min !== undefined && value - spec.min < spec.warnMargin))
        ) {
          result.near = true;
          this._setLevel(result, 'warn', spec.main ? 'Close to limit' : `${spec.label} close to limit`);
          result.noSince = true; // drifting is not an event
        }
      } else {
        const domain = spec.entity.split('.')[0];
        if (unavailable) {
          result.status = 'na';
          this._setLevel(result, spec.critical ? 'alert' : 'warn', `${spec.label} unavailable`);
        } else if (spec.trigger && TRIGGER_SERVICES[domain]) {
          result.status = 'ready';
        } else {
          const level = this._dimLevel(spec, stateObj);
          const on = level !== undefined ? level > 0 : !OFF_STATES.includes(stateObj.state);
          result.status = on ? 'on' : 'off';
          if (on && level !== undefined && spec.dimmable) result.percent = level;
          if (!on && spec.critical) {
            this._setLevel(result, 'alert', `${spec.label} off`);
          } else if (!on && spec.night) {
            this._setLevel(result, 'info', 'Night');
            result.icon = 'mdi:weather-night';
            result.noSince = true;
          }
        }
      }
      const key = `${spec.index}:${spec.entity}`;
      const prev = this._levelSince.get(key);
      if (!prev || prev.level !== result.level) {
        const since = stateObj ? new Date(stateObj.last_changed) : null;
        this._levelSince.set(key, { level: result.level, since });
        result.since = since;
      } else {
        result.since = prev.since;
      }
      return result;
    }

    _setLevel(result, level, message) {
      result.level = level;
      result.message = message;
    }

    _word(spec, side) {
      if (spec.words && spec.words[side]) return spec.words[side];
      return `${spec.label} ${side}`;
    }

    // Dimmable level in %, or undefined when the entity doesn't provide one.
    _dimLevel(spec, stateObj) {
      if (!spec.dimmable) return undefined;
      const domain = spec.entity.split('.')[0];
      if (domain === 'light') {
        if (stateObj.state !== 'on') return undefined;
        const brightness = toNumber(stateObj.attributes.brightness);
        return brightness === undefined ? undefined : Math.round((brightness / 255) * 100);
      }
      if (['number', 'input_number', 'sensor'].includes(domain)) {
        const value = toNumber(stateObj.state);
        return value === undefined ? undefined : Math.round(value);
      }
      return undefined;
    }

    // The card's level and message: the most severe cause, ties broken by item order.
    _summary(results) {
      const causes = results
        .filter((r) => r.level !== 'ok')
        .sort((a, b) => levelRank(b.level) - levelRank(a.level) || a.spec.index - b.spec.index);
      const top = causes[0];
      if (!top) {
        const actuators = results.filter((r) => r.spec.kind === 'actuator' && r.status !== 'ready');
        const measures = results.filter((r) => r.spec.kind === 'measure');
        if (!measures.length && actuators.length && actuators.every((r) => r.status === 'off')) {
          return { level: 'info', icon: 'mdi:power', message: 'Off' };
        }
        return { level: 'ok', icon: null, message: results.length ? 'All good' : 'No items' };
      }
      let message = top.message;
      if (top.since && !top.noSince && levelRank(top.level) >= levelRank('warn')) {
        message += ` · since ${this._formatSince(top.since)}`;
      }
      const others = causes.length - 1 - causes.filter((r) => r !== top && r.level === 'info').length;
      if (others > 0) message += ` · +${others}`;
      return { level: top.level, icon: top.icon, message, cause: top };
    }

    /* --- Formatting --- */

    get _language() {
      const locale = this.hass.locale || {};
      return locale.language || this.hass.language || navigator.language;
    }

    get _timeZone() {
      const locale = this.hass.locale || {};
      return locale.time_zone === 'server' && this.hass.config ? this.hass.config.time_zone : undefined;
    }

    _formatSince(date) {
      try {
        const locale = this.hass.locale || {};
        const timeZone = this._timeZone;
        const day = (d) => new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(d);
        if (day(date) !== day(new Date())) {
          return new Intl.DateTimeFormat(this._language, { timeZone, day: 'numeric', month: 'short' }).format(date);
        }
        const lang = locale.time_format === 'system' ? undefined : this._language;
        let hour12 = locale.time_format === '12' ? true : locale.time_format === '24' ? false : undefined;
        if (hour12 === undefined) hour12 = new Intl.DateTimeFormat(lang, { hour: 'numeric' }).resolvedOptions().hour12;
        // 24-hour times keep two digits (09:12), 12-hour times don't (9:12 AM).
        const hour = hour12 ? 'numeric' : '2-digit';
        return new Intl.DateTimeFormat(lang, { timeZone, hour, minute: '2-digit', hour12 }).format(date);
      } catch (err) {
        return date.toLocaleTimeString();
      }
    }

    get _numberLocale() {
      const format = (this.hass.locale || {}).number_format;
      const locales = { comma_decimal: 'en-US', decimal_comma: 'de', space_comma: 'fr', system: undefined };
      return format in locales ? locales[format] : this._language;
    }

    _formatNumber(value, decimals) {
      const options =
        decimals !== undefined
          ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
          : { maximumFractionDigits: 2 };
      try {
        return new Intl.NumberFormat(this._numberLocale, options).format(value);
      } catch (err) {
        return String(value);
      }
    }

    _formatValue(result) {
      const { spec, stateObj, value } = result;
      if (value === undefined) return '?';
      const registry = this.hass.entities && this.hass.entities[spec.entity];
      const decimals = registry && registry.display_precision != null ? registry.display_precision : spec.decimals;
      const unit = spec.unit ?? (stateObj && stateObj.attributes.unit_of_measurement) ?? spec.roleUnit ?? '';
      const text = this._formatNumber(value, decimals);
      if (!unit) return text;
      // Degrees stay attached and drop their scale (25.9°), like the strip of a thermometer.
      if (unit.startsWith('°')) return `${text}°`;
      return `${text} ${unit}`;
    }

    _formatRange(spec) {
      const n = (v) => this._formatNumber(v);
      if (spec.min !== undefined && spec.max !== undefined) return `${n(spec.min)}–${n(spec.max)}`;
      if (spec.max !== undefined) return `≤ ${n(spec.max)}`;
      if (spec.min !== undefined) return `≥ ${n(spec.min)}`;
      return '';
    }

    _stateText(result) {
      const { stateObj } = result;
      if (!stateObj) return 'Not found';
      if (this.hass.formatEntityState) return this.hass.formatEntityState(stateObj);
      return stateObj.state;
    }

    /* --- Actions --- */

    _actionOf(spec, which) {
      const conf = spec.config[`${which}_action`];
      const action = typeof conf === 'string' ? conf : conf && conf.action;
      if (action) return action;
      if (which === 'hold') return 'more-info';
      return spec.kind === 'actuator' ? 'toggle' : 'more-info';
    }

    _run(spec, which) {
      const action = this._actionOf(spec, which);
      if (action === 'none') return;
      if (action === 'toggle' && this._toggle(spec)) return;
      this._moreInfo(spec.entity);
    }

    // Runs the entity's own on/off (or trigger) service; false when it has none.
    _toggle(spec) {
      const stateObj = this.hass.states[spec.entity];
      if (!stateObj || UNAVAILABLE_STATES$1.includes(stateObj.state)) return false;
      const domain = spec.entity.split('.')[0];
      let service = TRIGGER_SERVICES[domain];
      if (!service && domain === 'light') service = 'light.toggle';
      if (!service && TOGGLE_DOMAINS.includes(domain)) service = 'homeassistant.toggle';
      if (!service) return false;
      const [svcDomain, svc] = service.split('.');
      this.hass.callService(svcDomain, svc, { entity_id: spec.entity });
      return true;
    }

    _moreInfo(entityId) {
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
    }

    _pointerDown(ev, spec) {
      if (ev.button !== undefined && ev.button !== 0) return;
      this._clearHold();
      this._held = false;
      this._holdStart = { x: ev.clientX, y: ev.clientY };
      this._holdTimer = setTimeout(() => {
        this._holdTimer = null;
        this._held = true;
        this._run(spec, 'hold');
      }, HOLD_DELAY);
    }

    _pointerMove(ev) {
      if (!this._holdTimer || !this._holdStart) return;
      if (Math.abs(ev.clientX - this._holdStart.x) > 10 || Math.abs(ev.clientY - this._holdStart.y) > 10) {
        this._clearHold();
      }
    }

    _clearHold() {
      if (this._holdTimer) clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }

    _click(ev, spec) {
      ev.stopPropagation();
      this._clearHold();
      if (this._held) {
        this._held = false; // the press already ran its hold action
        return;
      }
      this._run(spec, 'tap');
    }

    _pressHandlers(spec) {
      return {
        down: (ev) => this._pointerDown(ev, spec),
        click: (ev) => this._click(ev, spec),
      };
    }

    /* --- Rendering --- */

    render() {
      if (!this.hass || !this.config) return A;
      const specs = this._specs;
      const results = specs.map((spec) => this._evaluate(spec));
      const summary = this._summary(results);
      const mainSpec = this._mainSpec(specs);
      const main = mainSpec ? results[mainSpec.index] : undefined;
      const measures = results.filter((r) => r.spec.kind === 'measure' && r !== main);
      const actuators = results.filter((r) => r.spec.kind === 'actuator');
      const folded = this._folded;
      const style = this.config.strip_style || 'quiet';
      const habitat = HABITATS[this._habitat];
      const name = this.config.name || habitat.label;
      const icon = summary.icon || (summary.level === 'ok' ? this.config.icon || habitat.icon : LEVEL_ICONS[summary.level]);
      const nameTarget = (mainSpec || specs[0] || {}).entity;

      return b`
      <ha-card class="lvl-${summary.level} style-${style} ${folded ? 'folded' : ''}">
        <div class="strip">
          <ha-icon class="sev" .icon=${icon}></ha-icon>
          <button class="name" title=${name} @click=${() => this._moreInfo(nameTarget)}>${name}</button>
          <span class="msg" title=${summary.message}>${summary.message}</span>
          ${folded ? this._renderFoldedTail(main, actuators) : A}
          <button
            class="fold"
            aria-label=${folded ? `Unfold ${name}` : `Fold ${name}`}
            aria-expanded=${folded ? 'false' : 'true'}
            @click=${() => this._toggleFold()}
          >
            <ha-icon .icon=${folded ? 'mdi:chevron-down' : 'mdi:chevron-up'}></ha-icon>
          </button>
        </div>
        ${folded || !results.length
          ? A
          : b`
              <div class="body">
                ${main || measures.length
                  ? b`<div class="measures">
                      ${main ? this._renderMeasure(main, true) : A}
                      ${measures.map((r) => this._renderMeasure(r, false))}
                    </div>`
                  : A}
                ${actuators.length
                  ? b`<div class="chips">${actuators.map((r) => this._renderChip(r))}</div>`
                  : A}
              </div>
            `}
      </ha-card>
    `;
    }

    _renderFoldedTail(main, actuators) {
      const valueClass = main ? (main.out ? 'out' : main.near || main.status === 'na' ? 'near' : '') : '';
      return b`
      ${main ? b`<span class="fold-value ${valueClass}">${this._formatValue(main)}</span>` : A}
      ${actuators.length
        ? b`<span class="dots" aria-hidden="true">
            ${actuators.map((r) => b`<span class="dot ${r.status}" style="--chip-color: ${r.spec.color}"></span>`)}
          </span>`
        : A}
    `;
    }

    _renderMeasure(result, isMain) {
      const { spec } = result;
      const press = this._pressHandlers(spec);
      const range = this._formatRange(spec);
      const value = this._formatValue(result);
      const valueClass = result.out ? 'out' : result.status === 'na' ? 'na' : '';
      const label = `${spec.label}: ${result.status === 'na' ? this._stateText(result) : value}${range ? `, target ${range}` : ''}`;
      return b`
      <button
        class="measure ${isMain ? 'main' : 'small'}"
        aria-label=${label}
        title=${label}
        @pointerdown=${press.down}
        @pointermove=${this._pointerMove}
        @pointerup=${this._clearHold}
        @pointercancel=${this._clearHold}
        @pointerleave=${this._clearHold}
        @contextmenu=${(ev) => ev.preventDefault()}
        @click=${press.click}
      >
        <span class="line">
          ${isMain ? A : b`<ha-icon class="m-icon" .icon=${spec.icon}></ha-icon>`}
          <span class="value ${valueClass}">${value}</span>
          ${range ? b`<span class="range">${range}</span>` : A}
        </span>
        ${this._renderBar(spec, result)}
      </button>
    `;
    }

    _renderBar(spec, result) {
      const { min, max } = spec;
      if (min === undefined && max === undefined) return A;
      let lo;
      let hi;
      if (min !== undefined && max !== undefined) {
        const width = max - min || 1;
        lo = min - width * RANGE_PAD;
        hi = max + width * RANGE_PAD;
      } else {
        const limit = min !== undefined ? min : max;
        const d = Math.abs(limit) * 0.5 || 1;
        lo = min !== undefined ? limit - d : limit - 2 * d;
        hi = min !== undefined ? limit + 2 * d : limit + d;
      }
      const pos = (v) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
      const left = pos(min !== undefined ? min : lo);
      const right = pos(max !== undefined ? max : hi);
      return b`
      <span class="bar">
        <span class="band" style="left: ${left}%; width: ${right - left}%"></span>
        ${result.value !== undefined
          ? b`<span class="marker ${result.out ? 'out' : ''}" style="left: ${pos(result.value)}%"></span>`
          : A}
      </span>
    `;
    }

    _renderChip(result) {
      const { spec, status } = result;
      const press = this._pressHandlers(spec);
      const percent = result.percent !== undefined ? ` ${result.percent} %` : '';
      const label = `${spec.label}: ${this._stateText(result)}`;
      return b`
      <button
        class="chip ${status}"
        style="--chip-color: ${spec.color}"
        aria-label=${label}
        title=${label}
        @pointerdown=${press.down}
        @pointermove=${this._pointerMove}
        @pointerup=${this._clearHold}
        @pointercancel=${this._clearHold}
        @pointerleave=${this._clearHold}
        @contextmenu=${(ev) => ev.preventDefault()}
        @click=${press.click}
      >
        ${status === 'na' ? '? ' : A}${status === 'ready'
          ? b`<ha-icon class="c-icon" .icon=${spec.icon}></ha-icon>`
          : A}${spec.label}${percent}
      </button>
    `;
    }

    static get styles() {
      return i$6`
      :host {
        display: block;
        height: 100%;
      }
      ha-card {
        --lvl: var(--success-color, #43a047);
        --lvl-ink: color-mix(in srgb, var(--lvl) 72%, var(--primary-text-color, #212121));
        --warn-ink: color-mix(in srgb, var(--warning-color, #ffa600) 72%, var(--primary-text-color, #212121));
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        container-type: inline-size;
      }
      ha-card.lvl-info {
        --lvl: var(--secondary-text-color, #727272);
        --lvl-ink: var(--secondary-text-color, #727272);
      }
      ha-card.lvl-warn {
        --lvl: var(--warning-color, #ffa600);
      }
      ha-card.lvl-alert {
        --lvl: var(--error-color, #db4437);
      }
      ha-card.lvl-alert:not(.style-solid) {
        --ha-card-border-color: color-mix(in srgb, var(--error-color, #db4437) 60%, transparent);
        border-color: color-mix(in srgb, var(--error-color, #db4437) 60%, transparent);
      }

      button {
        font: inherit;
        color: inherit;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      button:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* --- Strip --- */
      .strip {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        padding: 0 4px 0 12px;
        box-sizing: border-box;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      ha-card:not(.folded) .strip {
        border-bottom: 1px solid var(--divider-color);
      }
      ha-card.folded .strip {
        flex: 1 1 auto;
      }
      .sev {
        --mdc-icon-size: 20px;
        flex: none;
        color: var(--lvl-ink);
      }
      ha-card.lvl-ok .sev {
        color: var(--lvl);
      }
      .name {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 55%;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .msg {
        flex: 1 4 auto; /* shrinks faster than the name, but neither one disappears */
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--secondary-text-color);
      }
      ha-card.lvl-warn .name,
      ha-card.lvl-warn .msg,
      ha-card.lvl-alert .name,
      ha-card.lvl-alert .msg {
        color: var(--lvl-ink);
      }
      .fold-value {
        flex: none;
        white-space: nowrap;
      }
      .fold-value.near {
        color: var(--warn-ink);
      }
      .fold-value.out {
        color: var(--error-color, #db4437);
      }
      .dots {
        flex: none;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        box-sizing: border-box;
        background: var(--chip-color);
        border: 1.5px solid var(--chip-color);
      }
      .dot.off {
        background: transparent;
        border-color: var(--secondary-text-color);
      }
      .dot.ready {
        background: transparent;
      }
      .dot.na {
        background: var(--warning-color, #ffa600);
        border-color: var(--warning-color, #ffa600);
      }
      .fold {
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        --mdc-icon-size: 22px;
      }
      .fold:hover {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }

      /* Very narrow (a third of a sections grid on a phone): the folded line keeps the icon,
         the name, the main value, the dots and the toggle; the severity icon still tells the level. */
      @container (max-width: 210px) {
        .strip {
          gap: 4px;
          padding-left: 8px;
        }
        ha-card.folded .msg {
          display: none;
        }
        .name {
          max-width: none;
        }
        .fold {
          width: 28px;
        }
        .dots {
          gap: 3px;
        }
      }

      /* Strip styles: quiet is the default above. */
      ha-card.style-tinted .strip {
        background: color-mix(in srgb, var(--lvl) 14%, var(--card-background-color, #fff));
      }
      ha-card.style-solid .strip {
        background: var(--lvl);
      }
      ha-card.style-solid .strip,
      ha-card.style-solid .sev,
      ha-card.style-solid .name,
      ha-card.style-solid .msg,
      ha-card.style-solid .fold,
      ha-card.style-solid .fold-value {
        color: #fff;
      }
      ha-card.style-solid .dot.off {
        border-color: rgba(255, 255, 255, 0.8);
      }
      ha-card.style-solid .dot {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
      }

      /* --- Body --- */
      .body {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 12px 12px;
      }
      .measures {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 8px 20px;
      }
      .measure {
        display: block;
        text-align: left;
        min-width: 0;
        flex: 1 1 110px;
      }
      .measure.main {
        flex: 2 1 150px;
      }
      .line {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
        overflow: hidden;
      }
      .value {
        color: var(--primary-text-color);
      }
      .main .value {
        font-size: 32px;
        line-height: 38px;
        font-weight: 400;
      }
      .small .value {
        font-size: 18px;
        line-height: 24px;
      }
      .m-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        align-self: center;
      }
      .value.out {
        color: var(--error-color, #db4437);
      }
      .value.na {
        color: var(--warn-ink);
      }
      .range {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .bar {
        display: block;
        position: relative;
        height: 6px;
        margin: 6px 2px 4px;
        border-radius: 3px;
        background: var(--divider-color, #e0e0e0);
      }
      .small .bar {
        height: 5px;
      }
      .band {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 3px;
        background: var(--success-color, #43a047);
        opacity: 0.75;
      }
      .marker {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 3px;
        border-radius: 2px;
        transform: translateX(-50%);
        background: var(--primary-text-color);
      }
      .marker.out {
        background: var(--error-color, #db4437);
      }

      /* --- Actuator chips --- */
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 28px;
        padding: 0 12px;
        border-radius: 14px;
        box-sizing: border-box;
        font-size: 13px;
        white-space: nowrap;
        border: 1px solid var(--chip-color);
        background: var(--chip-color);
        color: #fff;
      }
      .chip.off {
        background: transparent;
        border-color: var(--divider-color, #e0e0e0);
        color: var(--secondary-text-color);
      }
      .chip.na {
        background: transparent;
        border-color: var(--warning-color, #ffa600);
        color: var(--warn-ink);
      }
      .chip.ready {
        background: transparent;
        color: var(--chip-color);
      }
      .c-icon {
        --mdc-icon-size: 16px;
      }
    `;
    }
  }

  /* ==========================================================================
     EDITOR : ha-plooum-habitat-card-editor
     ========================================================================== */
  const TOP_LABELS = {
    name: 'Name',
    habitat: 'Habitat type',
    icon: 'Icon',
    strip_style: 'Strip style',
    fold: 'Fold',
    fold_below_width: 'Fold below this width (px)',
  };

  const ITEM_LABELS = {
    role: 'Role',
    entity: 'Entity',
    kind: 'Kind',
    name: 'Name',
    icon: 'Icon',
    color: 'Color (CSS, e.g. #ff9800)',
    unit: 'Unit',
    min: 'Target min',
    max: 'Target max',
    warn_margin: 'Warn margin (close to limit)',
    main: 'Main measure (shown big)',
    critical: 'Critical (off or unavailable is an alert)',
    tap_action: 'Tap action',
    hold_action: 'Hold action',
  };

  class HaPlooumHabitatCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { attribute: false },
        _config: { state: true },
        _open: { state: true },
      };
    }

    constructor() {
      super();
      this._open = -1;
      this._addKey = 0;
    }

    setConfig(config) {
      this._config = config;
    }

    get _items() {
      return (this._config && this._config.items) || [];
    }

    get _habitat() {
      return (this._config && this._config.habitat) || 'aquarium';
    }

    _fire(config) {
      this._config = config;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
    }

    _setItems(items) {
      this._fire({ ...this._config, items });
    }

    // Roles for a select, with the habitat type's suggested roles first and custom last.
    _roleOptions() {
      const suggested = HABITATS[this._habitat].suggested;
      const rest = Object.keys(ROLES).filter((r) => !suggested.includes(r) && r !== 'custom');
      return [...suggested, ...rest, 'custom'].map((r) => ({
        value: r,
        label: `${ROLES[r].label}${ROLES[r].kind ? ` (${ROLES[r].kind})` : ''}`,
      }));
    }

    _topSchema() {
      const habitat = HABITATS[this._habitat];
      const schema = [
        { name: 'name', selector: { text: {} } },
        {
          type: 'grid',
          name: '',
          schema: [
            {
              name: 'habitat',
              required: true,
              selector: {
                select: {
                  mode: 'dropdown',
                  options: Object.entries(HABITATS).map(([value, h]) => ({ value, label: h.label })),
                },
              },
            },
            { name: 'icon', selector: { icon: { placeholder: habitat.icon } } },
            {
              name: 'strip_style',
              required: true,
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'quiet', label: 'Quiet (only a problem is colored)' },
                    { value: 'tinted', label: 'Tinted' },
                    { value: 'solid', label: 'Solid (wall tablets)' },
                  ],
                },
              },
            },
            {
              name: 'fold',
              required: true,
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'auto', label: 'Auto (fold when small)' },
                    { value: 'folded', label: 'Folded' },
                    { value: 'unfolded', label: 'Unfolded' },
                  ],
                },
              },
            },
          ],
        },
      ];
      if ((this._config.fold || 'auto') === 'auto') {
        schema.push({ name: 'fold_below_width', selector: { number: { min: 0, max: 1000, step: 10, mode: 'box' } } });
      }
      return schema;
    }

    _itemSchema(item) {
      const role = ROLES[item.role] || ROLES.custom;
      const kind = itemKind(item);
      const isCustom = item.role === 'custom';
      const entity = role.domains ? { filter: { domain: role.domains } } : {};
      const schema = [
        { name: 'role', required: true, selector: { select: { mode: 'dropdown', options: this._roleOptions() } } },
      ];
      if (isCustom) {
        schema.push({
          type: 'grid',
          name: '',
          schema: [
            {
              name: 'kind',
              required: true,
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'measure', label: 'Measure (numeric value)' },
                    { value: 'actuator', label: 'Actuator (on/off)' },
                  ],
                },
              },
            },
            { name: 'name', selector: { text: {} } },
          ],
        });
      }
      schema.push({ name: 'entity', required: true, selector: { entity } });

      const advanced = [];
      const display = [];
      if (!isCustom) display.push({ name: 'name', selector: { text: {} } });
      display.push({ name: 'icon', selector: { icon: { placeholder: role.icon } } });
      display.push({ name: 'color', selector: { text: {} } });
      if (kind === 'measure') display.push({ name: 'unit', selector: { text: {} } });
      advanced.push({ type: 'grid', name: '', schema: display });
      if (kind === 'measure') {
        const number = { number: { mode: 'box', step: 'any' } };
        advanced.push({
          type: 'grid',
          name: '',
          schema: [
            { name: 'min', selector: number },
            { name: 'max', selector: number },
            { name: 'warn_margin', selector: { number: { mode: 'box', step: 'any', min: 0 } } },
          ],
        });
        advanced.push({ name: 'main', selector: { boolean: {} } });
      }
      advanced.push({ name: 'critical', selector: { boolean: {} } });
      const actions = {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'toggle', label: 'Toggle / run' },
            { value: 'more-info', label: 'More info' },
            { value: 'none', label: 'Nothing' },
          ],
        },
      };
      advanced.push({
        type: 'grid',
        name: '',
        schema: [
          { name: 'tap_action', selector: actions },
          { name: 'hold_action', selector: actions },
        ],
      });
      schema.push({ type: 'expandable', name: '', flatten: true, title: 'Advanced', schema: advanced });
      return schema;
    }

    // Default values, shown as helpers under the fields left empty.
    _itemHelper(item, field) {
      if (item[field] !== undefined && item[field] !== '') return undefined;
      const role = ROLES[item.role] || ROLES.custom;
      const spec = resolveItem({ ...item, role: ROLES[item.role] ? item.role : 'custom' }, 0, this._habitat);
      switch (field) {
        case 'name':
          return item.role === 'custom' ? undefined : `Default: ${role.label}`;
        case 'color':
          return `Default: ${role.color}`;
        case 'unit':
          return role.unit ? `Default: the entity's unit, else ${role.unit}` : "Default: the entity's unit";
        case 'min':
        case 'max':
          return spec[field] !== undefined ? `Default for this habitat: ${spec[field]}` : 'Default: none';
        case 'warn_margin':
          return `Default: ${role.warn_margin || 0}`;
        case 'tap_action':
          return `Default: ${spec.kind === 'actuator' ? 'toggle / run' : 'more info'}`;
        case 'hold_action':
          return 'Default: more info';
        default:
          return undefined;
      }
    }

    _topChanged(ev) {
      ev.stopPropagation();
      const config = { ...this._config, ...ev.detail.value };
      for (const key of Object.keys(TOP_LABELS)) {
        if (config[key] === undefined || config[key] === null || config[key] === '') delete config[key];
      }
      // Defaults stay out of the YAML.
      if (config.strip_style === 'quiet') delete config.strip_style;
      if (config.fold === 'auto') delete config.fold;
      if ((config.fold || 'auto') !== 'auto' || config.fold_below_width === DEFAULT_FOLD_WIDTH) delete config.fold_below_width;
      this._fire(config);
    }

    _itemChanged(index, ev) {
      ev.stopPropagation();
      const previous = this._items[index];
      const item = { ...ev.detail.value };
      for (const key of Object.keys(item)) {
        if (item[key] === undefined || item[key] === null || item[key] === '' || item[key] === false) delete item[key];
      }
      if (item.role !== 'custom') delete item.kind;
      else if (!item.kind) item.kind = 'measure';
      if (itemKind(item) !== 'measure') {
        for (const key of ['unit', 'min', 'max', 'warn_margin', 'main']) delete item[key];
      }
      // Switching role: a default entity guess when the current one doesn't fit the new role.
      if (item.role !== previous.role && item.entity && !this._fits(item.role, item.entity)) {
        const guess = this._guessEntity(item.role);
        if (guess) item.entity = guess;
      }
      let items = this._items.map((it, i) => (i === index ? item : it));
      // Only one main measure.
      if (item.main && !previous.main) {
        items = items.map((it, i) => {
          if (i === index || !it.main) return it;
          const { main, ...rest } = it;
          return rest;
        });
      }
      this._setItems(items);
    }

    _fits(role, entityId) {
      const domains = ROLES[role] && ROLES[role].domains;
      return !domains || domains.includes(entityId.split('.')[0]);
    }

    // Best entity for a new item of this role: matching domain, then device class or name, not used yet.
    _guessEntity(role) {
      if (!this.hass) return '';
      const def = ROLES[role];
      const used = new Set(this._items.map((it) => it.entity));
      const words = [this._habitat, ...String(this._config.name || '').toLowerCase().split(/\W+/)].filter(
        (w) => w && w.length > 1
      );
      let best = '';
      let bestScore = 0;
      for (const s of Object.values(this.hass.states)) {
        const id = s.entity_id;
        if (used.has(id) || !this._fits(role, id)) continue;
        const text = `${id} ${s.attributes.friendly_name || ''}`.toLowerCase();
        let score = 0;
        if (def.device_class && s.attributes.device_class === def.device_class) score += 3;
        else if (def.match && def.match.test(text)) score += 2;
        if (!score) continue;
        score += words.filter((w) => text.includes(w)).length;
        if (score > bestScore) {
          best = id;
          bestScore = score;
        }
      }
      return best;
    }

    _addItem(ev) {
      ev.stopPropagation();
      const role = ev.detail.value;
      this._addKey += 1; // re-creates the "add" select, so it shows empty again
      if (!role || !ROLES[role]) {
        this.requestUpdate();
        return;
      }
      const item = { role, entity: this._guessEntity(role) };
      if (role === 'custom') item.kind = 'measure';
      if (!item.entity) delete item.entity;
      this._open = this._items.length;
      this._setItems([...this._items, item]);
    }

    _removeItem(ev, index) {
      ev.stopPropagation();
      this._open = this._open === index ? -1 : this._open > index ? this._open - 1 : this._open;
      this._setItems(this._items.filter((_, i) => i !== index));
    }

    _moveItem(ev, index, delta) {
      ev.stopPropagation();
      const target = index + delta;
      if (target < 0 || target >= this._items.length) return;
      const items = [...this._items];
      [items[index], items[target]] = [items[target], items[index]];
      if (this._open === index) this._open = target;
      else if (this._open === target) this._open = index;
      this._setItems(items);
    }

    render() {
      if (!this.hass || !this._config) return A;
      const data = { habitat: 'aquarium', strip_style: 'quiet', fold: 'auto', ...this._config };
      if (data.fold === 'auto' && data.fold_below_width === undefined) data.fold_below_width = DEFAULT_FOLD_WIDTH;
      return b`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this._topSchema()}
        .computeLabel=${(s) => TOP_LABELS[s.name] || s.name}
        @value-changed=${this._topChanged}
      ></ha-form>

      <div class="items-header">Items</div>
      <div class="items">${this._items.map((item, i) => this._renderItem(item, i))}</div>

      <div class="add">
        ${i(
          this._addKey,
          b`<ha-selector
            .hass=${this.hass}
            .selector=${{ select: { mode: 'dropdown', options: this._roleOptions() } }}
            .label=${'Add an item'}
            .required=${false}
            .value=${''}
            @value-changed=${this._addItem}
          ></ha-selector>`
        )}
      </div>
    `;
    }

    _renderItem(item, index) {
      const role = ROLES[item.role] || ROLES.custom;
      const open = this._open === index;
      const name = item.name || role.label;
      const stateObj = item.entity && this.hass.states[item.entity];
      const entityText = item.entity
        ? stateObj
          ? `${stateObj.attributes.friendly_name || item.entity} · ${item.entity}`
          : `${item.entity} (not found)`
        : 'No entity: pick one';
      return b`
      <div class="item ${open ? 'open' : ''}">
        <div
          class="item-head"
          role="button"
          tabindex="0"
          aria-expanded=${open ? 'true' : 'false'}
          @click=${() => (this._open = open ? -1 : index)}
          @keydown=${(ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              this._open = open ? -1 : index;
            }
          }}
        >
          <ha-icon class="item-icon" .icon=${item.icon || role.icon} style="color: ${item.color || role.color}"></ha-icon>
          <div class="item-title">
            <span class="item-name">${name}${item.main ? ' · main' : ''}${item.critical ? ' · critical' : ''}</span>
            <span class="item-entity ${item.entity && stateObj ? '' : 'missing'}">${entityText}</span>
          </div>
          <button title="Move up" ?disabled=${index === 0} @click=${(ev) => this._moveItem(ev, index, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button
            title="Move down"
            ?disabled=${index === this._items.length - 1}
            @click=${(ev) => this._moveItem(ev, index, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button title="Remove" @click=${(ev) => this._removeItem(ev, index)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
          <ha-icon class="chevron" .icon=${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${open
          ? b`<div class="item-body">
              <ha-form
                .hass=${this.hass}
                .data=${item}
                .schema=${this._itemSchema(item)}
                .computeLabel=${(s) => ITEM_LABELS[s.name] || s.title || s.name}
                .computeHelper=${(s) => this._itemHelper(item, s.name)}
                @value-changed=${(ev) => this._itemChanged(index, ev)}
              ></ha-form>
            </div>`
          : A}
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .items-header {
        margin: 20px 0 8px;
        font-weight: 500;
        font-size: 16px;
      }
      .items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      .item.open {
        border-color: var(--primary-color);
      }
      .item-head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 12px;
        cursor: pointer;
      }
      .item-head:focus-visible {
        outline: 2px solid var(--primary-color);
        border-radius: 8px;
      }
      .item-icon {
        flex: none;
        --mdc-icon-size: 22px;
      }
      .item-title {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        margin-left: 6px;
      }
      .item-name {
        font-weight: 500;
      }
      .item-entity {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-entity.missing {
        color: var(--warning-color, #ffa600);
      }
      .item-head button {
        flex: none;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
      }
      .item-head button:hover:not([disabled]) {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }
      .item-head button[disabled] {
        opacity: 0.3;
        cursor: default;
      }
      .chevron {
        flex: none;
        color: var(--secondary-text-color);
      }
      .item-body {
        padding: 4px 12px 12px;
      }
      .add {
        margin-top: 12px;
      }
    `;
    }
  }

  if (!customElements.get('ha-plooum-habitat-card')) {
    customElements.define('ha-plooum-habitat-card', HaPlooumHabitatCard);
  }
  if (!customElements.get('ha-plooum-habitat-card-editor')) {
    customElements.define('ha-plooum-habitat-card-editor', HaPlooumHabitatCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === 'ha-plooum-habitat-card')) {
    window.customCards.push({
      type: 'ha-plooum-habitat-card',
      name: 'HA Plooum Habitat Card',
      description: 'One aquarium, pond or terrarium at a glance: its measures, its equipment and what needs attention.',
      preview: true,
    });
  }

  const CARD_VERSION = '1.1.1';

  // States treated as "unavailable" (on top of an entity that doesn't exist).
  const UNAVAILABLE_STATES = ['unavailable', 'unknown'];
  const DEFAULT_COLOR_ON = '#66bb6a';
  const DEFAULT_COLOR_OFF = '#757575';
  const DEFAULT_COLOR_UNAVAILABLE = '#ef5350';

  class HaPlooumMultiStatusCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.info(
        `%c HA-PLOOUM-MULTI-STATUS-CARD %c ${CARD_VERSION} `,
        'color: white; background: #03a9f4; font-weight: 700;',
        'color: #03a9f4; background: white; font-weight: 700;'
      );
    }

    setConfig(config) {
      if (!config || !config.title) {
        throw new Error('Please define a title (title)');
      }
      this.config = config;
    }

    getCardSize() {
      return 1;
    }

    static getStubConfig() {
      return { 
        title: 'My Device', 
        tap_action_type: 'navigate',
        navigation_path: '/dashboard-maison', 
        temp_entity: 'sensor.temperature',
        temp_unit: '°C',
        show_temp: true,
        status_items: []
      };
    }

    static getConfigElement() {
      return document.createElement('ha-plooum-multi-status-card-editor');
    }

    render() {
      if (!this.hass || !this.config) {
        return b``;
      }

      const title = this.config.title || '';
      const tempEntityId = this.config.temp_entity;
      const tempUnit = this.config.temp_unit || '°C';
      const showTemp = this.config.show_temp !== false;
      const statusItems = this.config.status_items || [];
      
      // Tap action handling
      const actionType = this.config.tap_action_type || 'navigate';
      const cursorStyle = actionType === 'none' ? 'default' : 'pointer';

      let tempString = '-- ' + tempUnit;
      if (tempEntityId && this.hass.states && this.hass.states[tempEntityId]) {
        let t = parseFloat(this.hass.states[tempEntityId].state);
        if (!isNaN(t)) {
          tempString = t.toFixed(1) + ' ' + tempUnit;
        }
      }

      const gridStyle = showTemp 
        ? 'grid-template-areas: "title" "temp" "status"; grid-template-rows: auto auto auto;'
        : 'grid-template-areas: "title" "status"; grid-template-rows: auto auto;';

      return b`
      <div 
        class="card ${showTemp ? '' : 'compact'}" 
        style="${gridStyle} cursor:${cursorStyle};" 
        @click="${this._handleAction}"
      >
        <div class="title">${title}</div>${showTemp ? b`<div class="temp">${tempString}</div>` : ''}
        <div class="status">
          ${statusItems.map(item => {
            const entState = this.hass.states ? this.hass.states[item.entity] : null;
            const isUnavailable = !entState || UNAVAILABLE_STATES.includes(entState.state);
            const isOn = !isUnavailable && entState.state === 'on';
            let color;
            if (isUnavailable) {
              color = item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE;
            } else {
              color = isOn ? (item.color_on || DEFAULT_COLOR_ON) : (item.color_off || DEFAULT_COLOR_OFF);
            }
            const tooltip = this._itemTooltip(item, entState);
            
            if (item.type === 'svg') {
              let evaluatedSvg = '';
              
              if (item.svg_content) {
                let rawSvg = item.svg_content;
                rawSvg = rawSvg.replace(/^[\s\S]*?=>\s*`?/, '').replace(/`?\s*$/, '');
                evaluatedSvg = rawSvg.replace(/\$\{color\}/g, color);
              } else {
                evaluatedSvg = `
                  <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: ${color};">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" opacity="0.3" />
                  </svg>
                `;
              }
              
              return b`<div style="display: flex; align-items: center;" title="${tooltip}" .innerHTML="${evaluatedSvg}"></div>`;
            } else {
              const icon = isOn ? (item.icon_on || 'mdi:power') : (item.icon_off || 'mdi:power-off');
              return b`
                <ha-icon 
                  icon="${icon}" 
                  title="${tooltip}"
                  style="color: ${color}; --mdc-icon-size: ${item.size || '20px'};">
                </ha-icon>
              `;
            }
          })}
        </div>
      </div>
    `;
    }

    _itemTooltip(item, entState) {
      if (!entState) {
        return `${item.entity || '?'}: entity not found`;
      }
      const name = entState.attributes.friendly_name || item.entity;
      // formatEntityState translates the state into the user's language (e.g. "Unavailable").
      const state = this.hass.formatEntityState ? this.hass.formatEntityState(entState) : entState.state;
      return `${name}: ${state}`;
    }

    _handleAction() {
      if (!this.config || !this.hass) return;

      const actionType = this.config.tap_action_type || 'navigate';

      switch (actionType) {
        case 'navigate':
          if (this.config.navigation_path) {
            history.pushState(null, '', this.config.navigation_path);
            window.dispatchEvent(new CustomEvent('location-changed', {
              detail: { replace: false },
              bubbles: true,
              composed: true,
            }));
          }
          break;

        case 'toggle':
          if (this.config.tap_action_entity) {
            // Use the generic homeassistant.toggle service
            this.hass.callService('homeassistant', 'toggle', {
              entity_id: this.config.tap_action_entity
            });
          }
          break;

        case 'script':
          if (this.config.tap_action_script) {
            const scriptId = this.config.tap_action_script;
            const domain = scriptId.split('.')[0];
            this.hass.callService(domain, 'turn_on', {
              entity_id: scriptId
            });
          }
          break;
      }
    }

    static get styles() {
      return i$6`
      :host {
        display: block;
      }
      .card {
        padding: 8px 12px;
        border-radius: 20px;
        background-color: rgba(0, 0, 0, 0.35);
        box-shadow: none;
        border: none;
        display: grid;
        row-gap: 4px;
        box-sizing: border-box;
      }
      /* Without the main value line, match the height of the other button cards (56px). */
      .card.compact {
        min-height: 56px;
        padding: 4px 12px;
        row-gap: 2px;
        align-content: center;
      }
      .title {
        justify-self: center;
        align-self: center;
        font-size: 13px;
        font-weight: 500;
        color: #ffffff;
        letter-spacing: 0.5px;
      }
      .temp {
        justify-self: center;
        align-self: center;
        font-size: 16px;
        font-weight: normal;
        color: rgba(255, 255, 255, 0.8);
      }
      .status {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    `;
    }
  }

  // -------------------------------------------------------------------------
  // Visual editor
  // -------------------------------------------------------------------------
  class HaPlooumMultiStatusCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    setConfig(config) {
      this.config = config;
    }

    render() {
      if (!this.hass || !this.config) {
        return b``;
      }

      const actionType = this.config.tap_action_type || 'navigate';

      // Build the editor schema dynamically
      const schema = [
        { name: 'title', label: 'Card title', selector: { text: {} } },
        { 
          name: 'tap_action_type', 
          label: 'Action when the card is tapped', 
          selector: { 
            select: { 
              options: [
                { value: 'navigate', label: 'Navigate to another page' },
                { value: 'toggle', label: 'Toggle an entity' },
                { value: 'script', label: 'Run a script' },
                { value: 'none', label: 'No action' }
              ] 
            } 
          } 
        }
      ];

      // Conditional fields depending on the chosen action
      if (actionType === 'navigate') {
        schema.push({ name: 'navigation_path', label: 'Navigation path (e.g. /dashboard/view1)', selector: { text: {} } });
      } else if (actionType === 'toggle') {
        schema.push({ name: 'tap_action_entity', label: 'Entity to toggle (switch, light...)', selector: { entity: {} } });
      } else if (actionType === 'script') {
        schema.push({ name: 'tap_action_script', label: 'Script to run', selector: { entity: { domain: 'script' } } });
      }

      schema.push({ name: 'show_temp', label: 'Show the main value line', selector: { boolean: {} } });

      if (this.config.show_temp !== false) {
        schema.push(
          { 
            name: 'temp_entity', 
            label: 'Main entity (e.g. temperature)', 
            selector: { entity: { domain: 'sensor' } } 
          },
          { name: 'temp_unit', label: 'Unit (e.g. °C)', selector: { text: {} } }
        );
      }

      const statusItems = this.config.status_items || [];

      return b`
      <div class="editor">
        <ha-form
          .hass="${this.hass}"
          .data="${this.config}"
          .schema="${schema}"
          .computeLabel=${(s) => s.label || s.name}
          @value-changed="${this._formChanged}"
        ></ha-form>

        <hr class="divider" />

        <div class="section-header">
          <h3>Status items (Devices)</h3>
          <button class="btn-add" @click="${this._addItem}">+ Add a device</button>
        </div>

        <div class="items-container">
          ${statusItems.map((item, index) => {
            const isSvg = item.type === 'svg';
            
            const itemSchema = [
              { name: 'entity', label: 'Entity (e.g. switch, light...)', selector: { entity: {} } },
              { 
                name: 'type', 
                label: "Display type", 
                selector: { 
                  select: { 
                    options: [
                      { value: 'icon', label: 'Standard icon (MDI)' },
                      { value: 'svg', label: 'Custom SVG' }
                    ] 
                  } 
                } 
              },
            ];

            if (isSvg) {
              itemSchema.push(
                { 
                  name: 'svg_content', 
                  label: 'Raw SVG code (e.g. <svg ...>${color}</svg>)', 
                  selector: { text: { multiline: true } } 
                }
              );
            } else {
              itemSchema.push(
                { name: 'icon_on', label: 'Icon (On)', selector: { icon: {} } },
                { name: 'icon_off', label: 'Icon (Off)', selector: { icon: {} } }
              );
            }

            return b`
              <div class="item-card">
                <div class="item-header">
                  <span>Device #${index + 1} (${item.type || 'icon'})</span>
                  <button class="btn-delete" @click="${() => this._deleteItem(index)}">Delete</button>
                </div>

                <ha-form
                  .hass="${this.hass}"
                  .data="${item}"
                  .schema="${itemSchema}"
                  .computeLabel=${(s) => s.label || s.name}
                  @value-changed="${e => this._itemFormChanged(index, e)}"
                ></ha-form>

                <div class="color-pickers-row">
                  <div class="color-field">
                    <label>Color (On)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_on || '#66bb6a'}" 
                        @input="${e => this._updateColor(index, 'color_on', e.target.value)}"
                      />
                      <span>${item.color_on || '#66bb6a'}</span>
                    </div>
                  </div>

                  <div class="color-field">
                    <label>Color (Off)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_off || '#757575'}" 
                        @input="${e => this._updateColor(index, 'color_off', e.target.value)}"
                      />
                      <span>${item.color_off || '#757575'}</span>
                    </div>
                  </div>

                  <div class="color-field">
                    <label>Color (Unavailable)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE}" 
                        @input="${e => this._updateColor(index, 'color_unavailable', e.target.value)}"
                      />
                      <span>${item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE}</span>
                    </div>
                  </div>
                </div>

              </div>
            `;
          })}
        </div>
      </div>
    `;
    }

    _formChanged(ev) {
      if (!this.config || !this.hass) return;
      const newConfig = {
        ...this.config,
        ...ev.detail.value,
      };
      this.config = newConfig;
      this._fireConfigChanged(newConfig);
    }

    _itemFormChanged(index, ev) {
      if (!this.config || !this.hass) return;
      const statusItems = [...(this.config.status_items || [])];
      statusItems[index] = {
        ...statusItems[index],
        ...ev.detail.value,
      };
      const newConfig = {
        ...this.config,
        status_items: statusItems,
      };
      this.config = newConfig;
      this._fireConfigChanged(newConfig);
    }

    _updateColor(index, colorKey, value) {
      if (!this.config || !this.hass) return;
      const statusItems = [...(this.config.status_items || [])];
      statusItems[index] = {
        ...statusItems[index],
        [colorKey]: value,
      };
      const newConfig = {
        ...this.config,
        status_items: statusItems,
      };
      this.config = newConfig;
      this._fireConfigChanged(newConfig);
    }

    _addItem() {
      if (!this.config || !this.hass) return;
      const statusItems = [...(this.config.status_items || [])];
      statusItems.push({
        entity: '',
        type: 'icon',
        icon_on: 'mdi:power',
        icon_off: 'mdi:power-off',
        svg_content: '',
        color_on: '#66bb6a',
        color_off: '#757575',
        color_unavailable: DEFAULT_COLOR_UNAVAILABLE
      });
      const newConfig = {
        ...this.config,
        status_items: statusItems,
      };
      this.config = newConfig;
      this._fireConfigChanged(newConfig);
    }

    _deleteItem(index) {
      if (!this.config || !this.hass) return;
      const statusItems = [...(this.config.status_items || [])];
      statusItems.splice(index, 1);
      const newConfig = {
        ...this.config,
        status_items: statusItems,
      };
      this.config = newConfig;
      this._fireConfigChanged(newConfig);
    }

    _fireConfigChanged(newConfig) {
      const customEvent = new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(customEvent);
    }

    static get styles() {
      return i$6`
      .editor {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 4px 0;
      }
      .divider {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .section-header h3 {
        margin: 0;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .btn-add {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      }
      .items-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .item-card {
        background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.03);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 12px;
        color: var(--primary-text-color);
      }
      .btn-delete {
        background: transparent;
        color: var(--error-color, #db4437);
        border: none;
        cursor: pointer;     
        font-size: 12px;
      }
      .color-pickers-row {
        display: flex;
        gap: 16px;
        margin-top: 4px;
      }
      .color-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .color-field label {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--secondary-background-color);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
      }
      .color-picker-wrapper input[type="color"] {
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
        padding: 0;
      }
      .color-picker-wrapper span {
        font-size: 12px;
        font-family: monospace;
        color: var(--primary-text-color);
      }
    `;
    }
  }

  if (!customElements.get('ha-plooum-multi-status-card')) {
    customElements.define('ha-plooum-multi-status-card', HaPlooumMultiStatusCard);
  }
  if (!customElements.get('ha-plooum-multi-status-card-editor')) {
    customElements.define('ha-plooum-multi-status-card-editor', HaPlooumMultiStatusCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === 'ha-plooum-multi-status-card')) {
    window.customCards.push({
      type: 'ha-plooum-multi-status-card',
      name: 'Ha Plooum Multi Status Card',
      description: 'A custom card to display several statuses and icons.',
      preview: false,
    });
  }

  /* ==========================================================================
     MAIN CARD : ha-plooum-tabs-card
     ========================================================================== */
  class HaPlooumTabsCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
        _activeTab: { type: Number },
        _tabElements: { type: Array },
      };
    }

    constructor() {
      super();
      this._activeTab = 0;
      this._tabElements = [];
    }

    static getConfigElement() {
      return document.createElement("ha-plooum-tabs-card-editor");
    }

    static getStubConfig() {
      return {
        active_tab_bg: "rgba(255, 255, 255, 0)",
        tabs_background: "rgba(0, 0, 0, 0)",
        tabs: [
          { name: "HOME", cards: [] },
          { name: "GARDEN", cards: [] }
        ]
      };
    }

    setConfig(config) {
      if (!config || !config.tabs) {
        throw new Error("Invalid configuration: 'tabs' is required.");
      }
      this.config = { ...config };
      
      if (this._activeTab >= this.config.tabs.length) {
        this._activeTab = 0;
      }
      
      this._buildCards();
    }

    async _buildCards() {
      if (!window.loadCardHelpers) return;
      const helpers = await window.loadCardHelpers();
      
      this._tabElements = this.config.tabs.map(tab => {
        if (!tab.cards) return [];
        return tab.cards.map(cardConfig => {
          try {
            const el = helpers.createCardElement(cardConfig);
            if (this.hass) el.hass = this.hass;
            return el;
          } catch (err) {
            const errorEl = document.createElement("hui-error-card");
            errorEl.setConfig({ type: "error", error: err.message, origConfig: cardConfig });
            return errorEl;
          }
        });
      });
      
      this.requestUpdate();
    }

    updated(changedProps) {
      super.updated(changedProps);
      if (changedProps.has("hass") && this.hass && this._tabElements) {
        this._tabElements.flat().forEach(el => {
          if (el) el.hass = this.hass;
        });
      }
    }

    _switchTab(index) {
      this._activeTab = index;
    }

    render() {
      if (!this.config || !this.hass) return b``;

      const tabs = this.config.tabs || [];
      const activeTabBg = this.config.active_tab_bg || "rgba(255, 255, 255, 0)";
      const tabsBg = this.config.tabs_background || "rgba(0, 0, 0, 0)";

      return b`
      <ha-card class="plooum-tabs-card">
        <div class="tabs-header" style="background: ${tabsBg};">
          ${tabs.map((tab, index) => {
            const isActive = index === this._activeTab;
            return b`
              <div 
                class="tab-button ${isActive ? "active" : ""}"
                style="${isActive ? `background-color: ${activeTabBg};` : ""}"
                @click="${() => this._switchTab(index)}"
              >
                ${tab.name}
              </div>
            `;
          })}
        </div>

        <div class="tabs-content">
          ${this._tabElements.map((cardElements, index) => {
            const isActive = index === this._activeTab;
            return b`
              <div class="tab-pane" style="display: ${isActive ? 'flex' : 'none'};">
                ${cardElements.length > 0 
                  ? cardElements
                  : b`<div class="no-cards">No cards configured for this tab.</div>`
                }
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
    }

    static get styles() {
      return i$6`
      .plooum-tabs-card {
        background: transparent; border: none; box-shadow: none;
        display: flex; flex-direction: column; width: 100%; overflow: hidden;
      }
      .tabs-header {
        display: flex; width: 100%;
        border-radius: 8px 8px 0 0; overflow-x: auto; scrollbar-width: none;
      }
      .tabs-header::-webkit-scrollbar { display: none; }
      .tab-button {
        flex: 1; text-align: center; padding: 14px 10px;
        color: var(--primary-text-color, #ffffff); font-size: 0.85em;
        font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
        cursor: pointer; transition: background-color 0.2s ease;
        white-space: nowrap; border-bottom: 2px solid transparent;
      }
      .tab-button.active { border-bottom: 2px solid var(--primary-text-color, #ffffff); }
      .tab-button:hover:not(.active) { background: rgba(255, 255, 255, 0.05); }
      .tabs-content { display: flex; flex-direction: column; width: 100%; background: transparent; }
      .tab-pane { flex-direction: column; gap: 8px; width: 100%; padding-top: 8px; }
      .no-cards { text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic; }
    `;
    }
  }

  /* ==========================================================================
     CARD EDITOR
     ========================================================================== */
  class HaPlooumTabsCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { type: Object },
        _selectedTab: { type: Number },
        _selectedCard: { type: Number },
        _addingCard: { type: Boolean },
        _pastingCard: { type: Boolean },
        _pastedCardCode: { type: String },
        _cardSearchQuery: { type: String },
      };
    }

    constructor() {
      super();
      this._addingCard = false;
      this._pastingCard = false;
      this._pastedCardCode = "";
      this._cardSearchQuery = "";
    }

    setConfig(config) {
      this._config = { ...config };
      if (!this._config.tabs) this._config.tabs = [];
    }

    _configChanged() {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }

    _addTab() {
      const tabs = [...this._config.tabs, { name: "NEW TAB", cards: [] }];
      this._config = { ...this._config, tabs };
      this._configChanged();
    }

    _removeTab(index) {
      const tabs = [...this._config.tabs];
      tabs.splice(index, 1);
      this._config = { ...this._config, tabs };
      if (this._selectedTab === index) {
        this._selectedTab = undefined;
        this._selectedCard = undefined;
        this._addingCard = false;
        this._pastingCard = false;
      }
      this._configChanged();
    }

    _updateTabName(index, name) {
      const tabs = [...this._config.tabs];
      tabs[index] = { ...tabs[index], name };
      this._config = { ...this._config, tabs };
      this._configChanged();
    }

    async _selectCardType(selectedType) {
      const coreTypes = [
        "tile", "button", "entities", "markdown", "grid", "horizontal-stack", 
        "vertical-stack", "glance", "picture-entity", "picture-elements", "sensor", 
        "history-graph", "gauge", "heading", "conditional", "map", "media-control", 
        "iframe", "alarm-panel", "weather-forecast", "shopping-list"
      ];

      let cardType = selectedType.trim();
      const isCore = coreTypes.includes(cardType);

      if (!isCore && !cardType.startsWith("custom:")) {
        cardType = `custom:${cardType}`;
      }

      let stubConfig = {};
      if (window.loadCardHelpers) {
        try {
          const helpers = await window.loadCardHelpers();
          stubConfig = await helpers.getStubConfig(cardType, this.hass, this.hass.states);
        } catch (err) {
          console.warn("Unable to fetch default configuration:", err);
        }
      }

      const newCard = {
        type: cardType,
        ...stubConfig
      };

      const tabs = [...this._config.tabs];
      const cards = [...(tabs[this._selectedTab].cards || [])];
      cards.push(newCard);
      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      
      this._config = { ...this._config, tabs };
      this._selectedCard = cards.length - 1;
      this._addingCard = false;
      this._cardSearchQuery = "";
      this._configChanged();
    }

    async _copyCard(cardConfig) {
      const jsonStr = JSON.stringify(cardConfig, null, 2);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(jsonStr);
        }
      } catch (err) {
        console.warn("Clipboard write failed:", err);
      }
      window._plooumCopiedCard = JSON.parse(jsonStr);
    }

    async _pasteCardDirect() {
      let text = "";
      let cardConfig = null;

      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText();
        }
      } catch (err) {
        console.warn("Clipboard read failed:", err);
      }

      if (text && text.trim()) {
        const trimmed = text.trim();
        try {
          cardConfig = JSON.parse(trimmed);
        } catch (e1) {
          try {
            cardConfig = this._parseYamlCard(trimmed);
          } catch (e2) {
            cardConfig = null;
          }
        }
      }

      if ((!cardConfig || !cardConfig.type) && window._plooumCopiedCard) {
        cardConfig = JSON.parse(JSON.stringify(window._plooumCopiedCard));
      }

      if (cardConfig && typeof cardConfig === "object" && cardConfig.type) {
        const tabs = [...this._config.tabs];
        const cards = [...(tabs[this._selectedTab].cards || [])];
        cards.push(cardConfig);
        tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
        
        this._config = { ...this._config, tabs };
        this._configChanged();
      } else {
        this._pastingCard = true;
      }
    }

    _importPastedCard() {
      if (!this._pastedCardCode || !this._pastedCardCode.trim()) return;
      
      let cardConfig;
      const text = this._pastedCardCode.trim();
      
      try {
        cardConfig = JSON.parse(text);
      } catch (e1) {
        try {
          cardConfig = this._parseYamlCard(text);
        } catch (e2) {
          alert("Invalid YAML or JSON format. Please check your pasted code.");
          return;
        }
      }

      if (!cardConfig || typeof cardConfig !== "object" || !cardConfig.type) {
        alert("The card configuration must at least contain a 'type' property.");
        return;
      }

      const tabs = [...this._config.tabs];
      const cards = [...(tabs[this._selectedTab].cards || [])];
      cards.push(cardConfig);
      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      
      this._config = { ...this._config, tabs };
      this._selectedCard = cards.length - 1;
      this._pastingCard = false;
      this._pastedCardCode = "";
      this._configChanged();
    }

    _parseYamlCard(text) {
      const lines = text.split("\n");
      const result = {};
      let currentKey = null;
      let currentList = null;

      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        
        if (trimmed.startsWith("- ")) {
          const itemVal = trimmed.substring(2).trim();
          if (itemVal.includes(":")) {
            const colonIdx = itemVal.indexOf(":");
            const k = itemVal.substring(0, colonIdx).trim();
            const v = itemVal.substring(colonIdx + 1).trim();
            const obj = {};
            obj[k] = this._parseScalar(v);
            if (currentList) currentList.push(obj);
          } else {
            if (currentList) currentList.push(this._parseScalar(itemVal));
          }
        } else if (trimmed.includes(":")) {
          const colonIdx = trimmed.indexOf(":");
          const k = trimmed.substring(0, colonIdx).trim();
          const v = trimmed.substring(colonIdx + 1).trim();
          
          if (v === "") {
            currentKey = k;
            currentList = [];
            result[currentKey] = currentList;
          } else {
            currentKey = null;
            currentList = null;
            result[k] = this._parseScalar(v);
          }
        }
      }
      return result;
    }

    _parseScalar(val) {
      if (val === "true") return true;
      if (val === "false") return false;
      if (val === "null" || val === "") return null;
      if (!isNaN(Number(val))) return Number(val);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        return val.substring(1, val.length - 1);
      }
      return val;
    }

    _removeCard(index) {
      const tabs = [...this._config.tabs];
      const cards = [...tabs[this._selectedTab].cards];
      cards.splice(index, 1);
      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      this._config = { ...this._config, tabs };
      this._configChanged();
    }

    _moveCard(index, direction) {
      const tabs = [...this._config.tabs];
      const cards = [...tabs[this._selectedTab].cards];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= cards.length) return;

      const [movedCard] = cards.splice(index, 1);
      cards.splice(targetIndex, 0, movedCard);

      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      this._config = { ...this._config, tabs };
      this._configChanged();
    }

    _handleCardConfigChanged(ev) {
      ev.stopPropagation();
      if (!this._config) return;

      const tabs = [...this._config.tabs];
      const cards = [...tabs[this._selectedTab].cards];
      
      cards[this._selectedCard] = ev.detail.config;
      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      
      this._config = { ...this._config, tabs };
      this._configChanged();
    }

    render() {
      if (!this.hass || !this._config) return b``;

      const coreCards = [
        { type: "tile", name: "Tile" },
        { type: "button", name: "Button" },
        { type: "entities", name: "Entities" },
        { type: "markdown", name: "Markdown" },
        { type: "grid", name: "Grid" },
        { type: "horizontal-stack", name: "Horizontal Stack" },
        { type: "vertical-stack", name: "Vertical Stack" },
        { type: "glance", name: "Glance" },
        { type: "picture-entity", name: "Picture Entity" },
        { type: "picture-elements", name: "Picture Elements" },
        { type: "sensor", name: "Sensor" },
        { type: "history-graph", name: "History Graph" },
        { type: "gauge", name: "Gauge" },
        { type: "heading", name: "Heading" },
        { type: "conditional", name: "Conditional" },
        { type: "map", name: "Map" },
        { type: "media-control", name: "Media Control" },
        { type: "iframe", name: "Iframe" },
        { type: "alarm-panel", name: "Alarm Panel" },
        { type: "weather-forecast", name: "Weather Forecast" },
        { type: "shopping-list", name: "Shopping List" }
      ];

      const customCardsList = (window.customCards || []).map(c => ({
        type: c.type,
        name: c.name || c.type
      }));

      const allCards = [...coreCards, ...customCardsList];

      // VIEW 5 : PASTE CARD VIEW
      if (this._selectedTab !== undefined && this._pastingCard) {
        const tab = this._config.tabs[this._selectedTab];
        return b`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => { this._pastingCard = false; this._pastedCardCode = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Paste Card into: ${tab.name}</h3>
        </div>
        
        <div class="card-picker-container">
          <div class="input-field">
            <label>Paste Home Assistant Card YAML or JSON code below:</label>
            <textarea 
              rows="10"
              .value=${this._pastedCardCode}
              @input=${(e) => this._pastedCardCode = e.target.value}
              placeholder="type: tile&#10;entity: light.kitchen&#10;name: Kitchen"
              autofocus
            ></textarea>
          </div>
          <button class="btn primary full-width" @click=${this._importPastedCard}>Import Card</button>
        </div>
      `;
      }

      // VIEW 4 : CARD TYPE PICKER GALLERY
      if (this._selectedTab !== undefined && this._addingCard) {
        const tab = this._config.tabs[this._selectedTab];
        const query = (this._cardSearchQuery || "").toLowerCase();
        const filteredCards = allCards.filter(c => 
          c.name.toLowerCase().includes(query) || c.type.toLowerCase().includes(query)
        );

        return b`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => { this._addingCard = false; this._cardSearchQuery = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Choose a card for: ${tab.name}</h3>
        </div>
        
        <div class="card-picker-container">
          <div class="input-field">
            <input 
              type="text" 
              .value=${this._cardSearchQuery} 
              @input=${(e) => this._cardSearchQuery = e.target.value}
              placeholder="🔍 Search a card (e.g. tile, mushroom, webrtc...)"
              autofocus
            />
          </div>

          <div class="card-types-list">
            ${filteredCards.length === 0 ? b`
              <div class="empty-state">
                <p>No cards found.</p>
                ${this._cardSearchQuery ? b`
                  <button class="btn primary" @click=${() => this._selectCardType(this._cardSearchQuery)}>
                    Use type: "${this._cardSearchQuery}"
                  </button>
                ` : ""}
              </div>
            ` : ""}

            ${filteredCards.map(card => b`
              <div class="card-type-item" @click=${() => this._selectCardType(card.type)}>
                <div class="card-type-name">${card.name}</div>
                <div class="card-type-id">${card.type}</div>
              </div>
            `)}
          </div>
        </div>
      `;
      }

      // VIEW 3 : NATIVE CARD EDITOR
      if (this._selectedTab !== undefined && this._selectedCard !== undefined) {
        const tab = this._config.tabs[this._selectedTab];
        const cardConfig = tab.cards[this._selectedCard] || { type: "tile" };
        
        return b`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => this._selectedCard = undefined}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Edit Card (${cardConfig.type})</h3>
        </div>
        
        <div class="card-editor-container">
          <hui-card-element-editor
            .hass=${this.hass}
            .value=${cardConfig}
            @config-changed=${this._handleCardConfigChanged}
          ></hui-card-element-editor>
        </div>
      `;
      }

      // VIEW 2 : TAB CARDS LIST
      if (this._selectedTab !== undefined) {
        const tab = this._config.tabs[this._selectedTab];
        const cards = tab.cards || [];
        
        return b`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => this._selectedTab = undefined}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Cards in tab: ${tab.name}</h3>
        </div>
        
        <div class="list-container">
          ${cards.length === 0 ? b`<p class="empty-state">No cards in this tab.</p>` : ""}
          ${cards.map((card, index) => b`
            <div class="list-item">
              <div class="item-info">
                <strong>${card.type ? card.type.replace("custom:", "") : "Card"}</strong>
              </div>
              <div class="item-actions">
                <button class="icon-btn" @click=${() => this._moveCard(index, -1)} ?disabled=${index === 0} title="Move Up">
                  <ha-icon icon="mdi:arrow-up"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._moveCard(index, 1)} ?disabled=${index === cards.length - 1} title="Move Down">
                  <ha-icon icon="mdi:arrow-down"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._copyCard(card)} title="Copy Card">
                  <ha-icon icon="mdi:content-copy"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._selectedCard = index} title="Edit">
                  <ha-icon icon="mdi:pencil"></ha-icon>
                </button>
                <button class="icon-btn danger" @click=${() => this._removeCard(index)} title="Delete">
                  <ha-icon icon="mdi:delete"></ha-icon>
                </button>
              </div>
            </div>
          `)}
        </div>
        
        <div class="button-row">
          <button class="btn primary" @click=${() => this._addingCard = true}>+ Add Card</button>
          <button class="btn" @click=${this._pasteCardDirect}>📋 Paste Card</button>
        </div>
      `;
      }

      // VIEW 1 : GLOBAL SETTINGS AND TABS LIST
      const activeTabBg = this._config.active_tab_bg || "rgba(255, 255, 255, 0)";
      const tabsBg = this._config.tabs_background || "rgba(0, 0, 0, 0)";
      const tabs = this._config.tabs || [];

      return b`
      <div class="global-settings">
        <h3>Global Settings</h3>
        <div class="input-field">
          <label>Active tab background color</label>
          <input 
            type="text" 
            .value=${activeTabBg} 
            @change=${(e) => { this._config = { ...this._config, active_tab_bg: e.target.value }; this._configChanged(); }}
          />
        </div>
        <div class="input-field">
          <label>Global tabs bar background</label>
          <input 
            type="text" 
            .value=${tabsBg} 
            @change=${(e) => { this._config = { ...this._config, tabs_background: e.target.value }; this._configChanged(); }}
          />
        </div>
      </div>

      <hr />

      <div class="header-section">
        <h3>Tabs</h3>
        <button class="btn primary" @click=${this._addTab}>+ Add</button>
      </div>

      <div class="list-container">
        ${tabs.length === 0 ? b`<p class="empty-state">No tabs configured.</p>` : ""}
        ${tabs.map((tab, index) => b`
          <div class="list-item">
            <input 
              type="text" 
              .value=${tab.name} 
              @input=${(e) => this._updateTabName(index, e.target.value)} 
              class="tab-name-input"
              placeholder="Tab name"
            />
            <div class="item-actions">
              <button class="btn" @click=${() => this._selectedTab = index}>
                Cards (${tab.cards ? tab.cards.length : 0})
              </button>
              <button class="icon-btn danger" @click=${() => this._removeTab(index)} title="Delete tab">
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
            </div>
          </div>
        `)}
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .global-settings { margin-bottom: 16px; }
      h3 { margin: 0; font-size: 1.1em; color: var(--primary-text-color); }
      .header-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; }
      .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      
      .input-field { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; margin-bottom: 12px; }
      label { font-size: 0.85em; color: var(--secondary-text-color); }
      input[type="text"] {
        width: 100%; padding: 10px; border-radius: 6px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000); box-sizing: border-box; font-size: 14px;
      }
      textarea {
        width: 100%; padding: 10px; border-radius: 6px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000); box-sizing: border-box; font-size: 13px;
        font-family: monospace; resize: vertical;
      }

      .card-picker-container { display: flex; flex-direction: column; gap: 8px; max-height: 400px; }
      .card-types-list { 
        display: flex; flex-direction: column; gap: 4px; 
        max-height: 320px; overflow-y: auto; padding-right: 4px; 
      }
      .card-type-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 12px; background: var(--secondary-background-color);
        border-radius: 6px; cursor: pointer; border: 1px solid var(--divider-color);
        transition: background 0.2s;
      }
      .card-type-item:hover {
        background: var(--primary-color); color: var(--text-primary-color);
        border-color: var(--primary-color);
      }
      .card-type-item:hover .card-type-id {
        color: var(--text-primary-color); opacity: 0.8;
      }
      .card-type-name { font-weight: 600; font-size: 13px; }
      .card-type-id { font-size: 11px; font-family: monospace; color: var(--secondary-text-color); }

      .list-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
      .list-item { 
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        background: var(--secondary-background-color); padding: 6px 8px 6px 12px; 
        border-radius: 6px; border: 1px solid var(--divider-color); 
      }
      .item-info { flex: 1; font-size: 14px; color: var(--primary-text-color); }
      .tab-name-input { 
        font-weight: bold; font-size: 14px; border: none !important; 
        background: transparent !important; color: var(--primary-text-color) !important; 
        width: 100%; padding: 4px !important; border-bottom: 1px solid transparent !important; border-radius: 0 !important;
      }
      .tab-name-input:focus { border-bottom: 1px solid var(--primary-color) !important; outline: none; }
      .item-actions { display: flex; align-items: center; gap: 4px; }
      
      .icon-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 50%;
        transition: background 0.2s;
      }
      .icon-btn:hover { background: var(--divider-color); }
      .icon-btn:disabled { opacity: 0.3; cursor: default; }
      .icon-btn:disabled:hover { background: transparent; }
      .icon-btn.danger:hover { color: var(--error-color, #db4437); }
      
      .btn {
        background: var(--card-background-color); border: 1px solid var(--divider-color);
        color: var(--primary-text-color); padding: 8px 14px; border-radius: 4px; 
        cursor: pointer; font-size: 13px; font-weight: 500;
      }
      .btn:hover { background: var(--secondary-background-color); }
      .btn.primary { background: var(--primary-color); color: var(--text-primary-color); border: none; }
      .btn.full-width { width: 100%; margin-top: 8px; padding: 10px; font-weight: bold; }
      .button-row { display: flex; gap: 8px; margin-top: 8px; }
      .button-row .btn { flex: 1; }
      
      .empty-state { text-align: center; color: var(--secondary-text-color); font-style: italic; margin: 16px 0; }
      hr { border: none; border-top: 1px solid var(--divider-color); margin: 16px 0; }
    `;
    }
  }

  /* ==========================================================================
     HOME ASSISTANT REGISTRATION
     ========================================================================== */
  if (!customElements.get('ha-plooum-tabs-card')) {
    customElements.define('ha-plooum-tabs-card', HaPlooumTabsCard);
  }
  if (!customElements.get('ha-plooum-tabs-card-editor')) {
    customElements.define('ha-plooum-tabs-card-editor', HaPlooumTabsCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === 'ha-plooum-tabs-card')) {
    window.customCards.push({
      type: 'ha-plooum-tabs-card',
      name: 'Ha Plooum Tabs Card',
      description: 'A tabbed card that preserves state and supports all Lovelace cards (core and HACS).',
      preview: true,
    });
  }

  /* ==========================================================================
     MAIN CARD : ha-plooum-temp-humidity-card
     ========================================================================== */
  class HaPlooumTempHumidityCard extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
      };
    }

    static getConfigElement() {
      return document.createElement("ha-plooum-temp-humidity-card-editor");
    }

    static getStubConfig() {
      return {
        title: "Title",
        title_font_size: "15px",
        title_margin_bottom: "3px",
        card_padding: "4px",
        values_gap: "0px",
        icon_text_gap: "0px",
        main_icon: "mdi:sofa",
        main_icon_color: "#FFFFFF",
        main_icon_size: "32px",
        main_icon_offset_x: "3px",
        main_icon_offset_y: "0px",
        temp_entity: "",
        temp_icon: "mdi:thermometer",
        show_temp_icon: true,
        temp_color: "#E57373",
        temp_decimals: 1,
        temp_unit: "",
        temp_font_size: "13px",
        temp_icon_size: "1.2em",
        temp_tap_action: { action: "more-info" },
        temp_hold_action: { action: "none" },
        humidity_entity: "",
        humidity_icon: "mdi:water",
        show_humidity_icon: true,
        humidity_color: "#4FC3F7",
        humidity_decimals: 1,
        humidity_unit: "",
        humidity_font_size: "13px",
        humidity_icon_size: "1.2em",
        humidity_tap_action: { action: "more-info" },
        humidity_hold_action: { action: "none" },
        center_values: true,
        tap_action: { action: "none" },
        hold_action: { action: "none" },
      };
    }

    getCardSize() {
      return 1;
    }

    getGridOptions() {
      return {
        columns: 6,
        rows: 2,
        min_columns: 3,
        min_rows: 1,
      };
    }

    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      this.config = { ...config };
    }

    _formatValue(value, decimals) {
      if (value === undefined || value === null || value === "" || value === "unavailable" || value === "unknown") {
        return value ?? "N/A";
      }
      const num = parseFloat(value);
      if (isNaN(num)) return value;

      if (decimals !== undefined && decimals !== null && decimals !== "") {
        const dec = parseInt(decimals, 10);
        if (!isNaN(dec)) {
          return num.toFixed(dec);
        }
      }
      return num;
    }

    _formatCssUnit(val, defaultVal) {
      if (val === undefined || val === null || String(val).trim() === "") return defaultVal;
      const str = String(val).trim();
      if (/^-?\d+(\.\d+)?$/.test(str)) {
        return `${str}px`;
      }
      return str;
    }

    /* --- Action handling (Tap & Hold per target) --- */
    _handlePointerDown(e, targetKey) {
      e.stopPropagation();
      this._activeTarget = targetKey;
      this._startPos = { x: e.clientX, y: e.clientY };
      this._isHold = false;
      if (this._holdTimer) {
        clearTimeout(this._holdTimer);
      }
      this._holdTimer = setTimeout(() => {
        this._isHold = true;
        this._holdTimer = null;
        this._executeAction(this._activeTarget, "hold");
      }, 500);
    }

    _handlePointerMove(e) {
      if (!this._startPos) return;
      const dx = Math.abs(e.clientX - this._startPos.x);
      const dy = Math.abs(e.clientY - this._startPos.y);
      if (dx > 10 || dy > 10) {
        if (this._holdTimer) {
          clearTimeout(this._holdTimer);
          this._holdTimer = null;
        }
      }
    }

    _handlePointerUp(e) {
      if (this._holdTimer) {
        clearTimeout(this._holdTimer);
        this._holdTimer = null;
        if (!this._isHold && this._activeTarget) {
          this._executeAction(this._activeTarget, "tap");
        }
      }
      this._isHold = false;
      this._startPos = null;
      this._activeTarget = null;
    }

    _handlePointerCancel() {
      if (this._holdTimer) {
        clearTimeout(this._holdTimer);
        this._holdTimer = null;
      }
      this._isHold = false;
      this._startPos = null;
      this._activeTarget = null;
    }

    _executeAction(targetKey, actionType) {
      let actionConfig = null;
      let entityId = "";

      if (targetKey === "temp") {
        actionConfig =
          this.config[`temp_${actionType}_action`] ||
          (actionType === "tap" ? this.config.tap_action || { action: "more-info" } : this.config.hold_action);
        entityId = this.config.temp_entity;
      } else if (targetKey === "humidity") {
        actionConfig =
          this.config[`humidity_${actionType}_action`] ||
          (actionType === "tap" ? this.config.tap_action || { action: "more-info" } : this.config.hold_action);
        entityId = this.config.humidity_entity;
      } else {
        actionConfig = this.config[`${actionType}_action`];
        entityId = actionConfig?.entity || this.config.temp_entity || this.config.humidity_entity;
      }

      if (!actionConfig || !actionConfig.action || actionConfig.action === "none") return;

      const action = actionConfig.action;

      switch (action) {
        case "more-info": {
          if (entityId) {
            const event = new CustomEvent("hass-more-info", {
              detail: { entityId },
              bubbles: true,
              composed: true,
            });
            this.dispatchEvent(event);
          }
          break;
        }
        case "toggle": {
          if (entityId) {
            const domain = entityId.split(".")[0];
            this.hass.callService(domain, "toggle", { entity_id: entityId });
          }
          break;
        }
        case "navigate": {
          const path = actionConfig.navigation_path;
          if (path) {
            history.pushState(null, "", path);
            const event = new CustomEvent("location-changed", {
              bubbles: true,
              composed: true,
            });
            window.dispatchEvent(event);
          }
          break;
        }
        case "call-service": {
          const service = actionConfig.service;
          if (service) {
            const parts = service.split(".");
            if (parts.length === 2) {
              this.hass.callService(parts[0], parts[1], actionConfig.service_data || {});
            } else {
              this.hass.callService("script", service, actionConfig.service_data || {});
            }
          }
          break;
        }
      }
    }

    render() {
      if (!this.config || !this.hass) return b``;

      const {
        title = "Title",
        title_font_size = "15px",
        title_margin_bottom = "3px",
        card_padding = "4px",
        values_gap = "0px",
        icon_text_gap = "0px",
        main_icon = "mdi:sofa",
        main_icon_color = "#FFFFFF",
        main_icon_size = "32px",
        main_icon_offset_x = "3px",
        main_icon_offset_y = "0px",
        temp_entity,
        temp_icon = "mdi:thermometer",
        show_temp_icon = true,
        temp_color = "#E57373",
        temp_decimals = 1,
        temp_unit,
        temp_font_size = "13px",
        temp_icon_size = "1.2em",
        humidity_entity,
        humidity_icon = "mdi:water",
        show_humidity_icon = true,
        humidity_color = "#4FC3F7",
        humidity_decimals = 1,
        humidity_unit,
        humidity_font_size = "13px",
        humidity_icon_size = "1.2em",
        center_values = true,
      } = this.config;

      // Temperature
      const tempStateObj = temp_entity ? this.hass.states[temp_entity] : null;
      const tempRawVal = tempStateObj ? tempStateObj.state : undefined;
      const tempFormattedVal = this._formatValue(tempRawVal, temp_decimals);
      const tempUnit =
        temp_unit !== undefined && temp_unit !== null && String(temp_unit).trim() !== ""
          ? temp_unit
          : tempStateObj?.attributes?.unit_of_measurement || "°C";

      // Humidity
      const humStateObj = humidity_entity ? this.hass.states[humidity_entity] : null;
      const humRawVal = humStateObj ? humStateObj.state : undefined;
      const humFormattedVal = this._formatValue(humRawVal, humidity_decimals);
      const humUnit =
        humidity_unit !== undefined && humidity_unit !== null && String(humidity_unit).trim() !== ""
          ? humidity_unit
          : humStateObj?.attributes?.unit_of_measurement || "%";

      const hasMainIcon = Boolean(main_icon && main_icon.trim() !== "");
      const shouldCenter = center_values || !hasMainIcon;

      const formattedPadding = this._formatCssUnit(card_padding, "4px");
      const formattedTitleMarginBottom = this._formatCssUnit(title_margin_bottom, "3px");
      const formattedTitleFontSize = this._formatCssUnit(title_font_size, "15px");
      const formattedValuesGap = this._formatCssUnit(values_gap, "0px");
      const formattedIconTextGap = this._formatCssUnit(icon_text_gap, "0px");
      const offsetX = this._formatCssUnit(main_icon_offset_x, "3px");
      const offsetY = this._formatCssUnit(main_icon_offset_y, "0px");

      return b`
      <ha-card
        class="plooum-th-card"
        style="padding: ${formattedPadding};"
        @pointerdown=${(e) => this._handlePointerDown(e, "card")}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @pointercancel=${this._handlePointerCancel}
      >
        ${title && title.trim() !== ""
          ? b`<div
              class="card-title"
              style="font-size: ${formattedTitleFontSize}; margin-bottom: ${formattedTitleMarginBottom};"
            >
              ${title}
            </div>`
          : ""}

        <div class="card-body ${shouldCenter ? "centered" : ""}">
          ${hasMainIcon
            ? b`
                <div
                  class="main-icon-wrapper"
                  style="transform: translate(${offsetX}, ${offsetY});"
                >
                  <ha-icon
                    icon="${main_icon}"
                    style="--mdc-icon-size: ${main_icon_size}; width: ${main_icon_size}; height: ${main_icon_size}; color: ${main_icon_color};"
                  ></ha-icon>
                </div>
              `
            : ""}

          <div class="values-container" style="gap: ${formattedValuesGap};">
            <!-- Temperature row -->
            <div
              class="value-row clickable"
              style="color: ${temp_color}; font-size:${this._formatCssUnit(temp_font_size, "13px")}; gap: ${formattedIconTextGap};"
              @pointerdown=${(e) => this._handlePointerDown(e, "temp")}
              @pointermove=${this._handlePointerMove}
              @pointerup=${this._handlePointerUp}
              @pointercancel=${this._handlePointerCancel}
            >
              ${show_temp_icon && temp_icon
                ? b`<ha-icon
                    class="val-icon"
                    icon="${temp_icon}"
                    style="--mdc-icon-size: ${temp_icon_size}; width: ${temp_icon_size}; height: ${temp_icon_size};"
                  ></ha-icon>`
                : ""}
              <span class="value-text"
                >${tempFormattedVal}<span class="unit">${tempUnit}</span></span
              >
            </div>

            <!-- Humidity row -->
            <div
              class="value-row clickable"
              style="color: ${humidity_color}; font-size:${this._formatCssUnit(humidity_font_size, "13px")}; gap: ${formattedIconTextGap};"
              @pointerdown=${(e) => this._handlePointerDown(e, "humidity")}
              @pointermove=${this._handlePointerMove}
              @pointerup=${this._handlePointerUp}
              @pointercancel=${this._handlePointerCancel}
            >
              ${show_humidity_icon && humidity_icon
                ? b`<ha-icon
                    class="val-icon"
                    icon="${humidity_icon}"
                    style="--mdc-icon-size: ${humidity_icon_size}; width: ${humidity_icon_size}; height: ${humidity_icon_size};"
                  ></ha-icon>`
                : ""}
              <span class="value-text"
                >${humFormattedVal}<span class="unit">${humUnit}</span></span
              >
            </div>
          </div>
        </div>
      </ha-card>
    `;
    }

    static get styles() {
      return i$6`
      .plooum-th-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .card-title {
        text-align: center;
        font-weight: 700;
        color: var(--primary-text-color, #ffffff);
        line-height: 1.2;
      }
      .card-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .card-body.centered {
        justify-content: center;
      }
      .main-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      .values-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .card-body.centered .values-container {
        align-items: center;
      }
      .value-row {
        display: flex;
        align-items: center;
        font-weight: 700;
        line-height: 1.1;
        padding: 2px 6px;
        border-radius: 8px;
        transition: background-color 0.15s ease;
      }
      .value-row.clickable {
        cursor: pointer;
      }
      .value-row.clickable:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
      .value-row.clickable:active {
        background-color: rgba(255, 255, 255, 0.15);
      }
      .val-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .value-text {
        letter-spacing: 0.5px;
      }
      .unit {
        font-size: 0.8em;
        margin-left: 1px;
      }
    `;
    }
  }

  /* ==========================================================================
     CARD EDITOR : ha-plooum-temp-humidity-card-editor
     ========================================================================== */
  class HaPlooumTempHumidityCardEditor extends i$3 {
    static get properties() {
      return {
        hass: { type: Object },
        _config: { type: Object },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this._loadHAElements();
    }

    async _loadHAElements() {
      if (customElements.get("ha-entity-picker")) return;
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers) {
          await helpers.createCardElement({ type: "button" });
          this.requestUpdate();
        }
      }
    }

    setConfig(config) {
      this._config = { ...config };
    }

    _fireConfigChange(newConfig) {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }

    _valueChanged(ev, key) {
      if (!this._config || !this.hass) return;
      let val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
      if (this._config[key] === val) return;
      this._fireConfigChange({ ...this._config, [key]: val });
    }

    _checkboxChanged(ev, key) {
      if (!this._config || !this.hass) return;
      const val = ev.target.checked;
      if (this._config[key] === val) return;
      this._fireConfigChange({ ...this._config, [key]: val });
    }

    _actionChanged(ev, actionKey, field) {
      if (!this._config || !this.hass) return;
      const val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
      const currentActionObj = this._config[actionKey] || { action: "none" };
      const updatedActionObj = { ...currentActionObj, [field]: val };
      this._fireConfigChange({ ...this._config, [actionKey]: updatedActionObj });
    }

    _renderColorPicker(labelTitle, key, defaultColor) {
      const val = this._config && this._config[key] !== undefined ? this._config[key] : defaultColor;
      let hexColor = "#000000";

      if (typeof val === "string" && val.length === 7 && val.startsWith("#")) {
        hexColor = val;
      } else if (typeof val === "string" && val.length === 4 && val.startsWith("#")) {
        hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      }

      return b`
      <div class="input-field color-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input type="color" .value=${hexColor} @input=${(e) => this._valueChanged(e, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._valueChanged(e, key)} />
        </div>
      </div>
    `;
    }

    _renderActionBlock(title, actionKey, defaultEntityLabel, hideEntityPicker = false) {
      const actionObj = this._config[actionKey] || { action: "none" };
      const selectedAction = actionObj.action || "none";

      return b`
      <div class="action-block">
        <span class="action-block-title">${title}</span>
        <div class="input-field">
          <select
            .value=${selectedAction}
            @change=${(e) => this._actionChanged(e, actionKey, "action")}
          >
            <option value="none">No action</option>
            <option value="more-info">Show more info (more-info)</option>
            <option value="toggle">Toggle the entity</option>
            <option value="navigate">Navigate</option>
            <option value="call-service">Run a script / service</option>
          </select>
        </div>

        ${!hideEntityPicker && (selectedAction === "more-info" || selectedAction === "toggle")
          ? b`
              <ha-entity-picker
                .label=${defaultEntityLabel || "Target entity (leave empty for the default entity)"}
                .hass=${this.hass}
                .value=${actionObj.entity || ""}
                @value-changed=${(e) => this._actionChanged(e, actionKey, "entity")}
                allow-custom-entity
              ></ha-entity-picker>
            `
          : ""}
        ${selectedAction === "navigate"
          ? b`
              <div class="input-field">
                <label>Navigation path (e.g. /lovelace/living-room)</label>
                <input
                  type="text"
                  placeholder="/lovelace/1"
                  .value=${actionObj.navigation_path || ""}
                  @input=${(e) => this._actionChanged(e, actionKey, "navigation_path")}
                />
              </div>
            `
          : ""}
        ${selectedAction === "call-service"
          ? b`
              <div class="input-field">
                <label>Script / Service (e.g. script.my_script or light.turn_on)</label>
                <input
                  type="text"
                  placeholder="script.script_name"
                  .value=${actionObj.service || ""}
                  @input=${(e) => this._actionChanged(e, actionKey, "service")}
                />
              </div>
            `
          : ""}
      </div>
    `;
    }

    render() {
      if (!this.hass || !this._config) return b``;

      return b`
      <div class="card-config">
        <!-- General Settings -->
        <h3>General Settings</h3>
        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 2;">
            <label>Title (leave empty to hide)</label>
            <input
              type="text"
              placeholder="Title"
              .value=${this._config.title !== undefined ? this._config.title : "Title"}
              @input=${(e) => this._valueChanged(e, "title")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Title size</label>
            <input
              type="text"
              placeholder="15px"
              .value=${this._config.title_font_size || "15px"}
              @input=${(e) => this._valueChanged(e, "title_font_size")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Title bottom margin</label>
            <input
              type="text"
              placeholder="3px"
              .value=${this._config.title_margin_bottom || "3px"}
              @input=${(e) => this._valueChanged(e, "title_margin_bottom")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Card padding</label>
            <input
              type="text"
              placeholder="4px"
              .value=${this._config.card_padding || "4px"}
              @input=${(e) => this._valueChanged(e, "card_padding")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Values spacing (gap)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.values_gap || "0px"}
              @input=${(e) => this._valueChanged(e, "values_gap")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icon/text spacing (gap)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.icon_text_gap || "0px"}
              @input=${(e) => this._valueChanged(e, "icon_text_gap")}
            />
          </div>
        </div>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.center_values !== undefined ? Boolean(this._config.center_values) : true}
              @change=${(e) => this._checkboxChanged(e, "center_values")}
            />
            Center values horizontally
          </label>
        </div>

        <hr />

        <!-- Card Fallback Actions -->
        <h3>Global card actions (Background / Title)</h3>
        ${this._renderActionBlock("Tap Action (Card short press)", "tap_action", "Default target entity", false)}
        ${this._renderActionBlock("Hold Action (Card long press)", "hold_action", "Default target entity", false)}

        <hr />

        <!-- Main Icon (Left) -->
        <h3>Main Icon (Left)</h3>
        <ha-icon-picker
          .label=${"Main icon (leave empty to hide)"}
          .hass=${this.hass}
          .value=${this._config.main_icon !== undefined ? this._config.main_icon : "mdi:sofa"}
          @value-changed=${(e) => this._valueChanged(e, "main_icon")}
        ></ha-icon-picker>

        <div style="display: flex; gap: 8px;">
          ${this._renderColorPicker("Icon color", "main_icon_color", "#FFFFFF")}
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="32px"
              .value=${this._config.main_icon_size || "32px"}
              @input=${(e) => this._valueChanged(e, "main_icon_size")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>X offset (e.g. 5px, -10px)</label>
            <input
              type="text"
              placeholder="3px"
              .value=${this._config.main_icon_offset_x || "3px"}
              @input=${(e) => this._valueChanged(e, "main_icon_offset_x")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Y offset (e.g. 5px, -10px)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.main_icon_offset_y || "0px"}
              @input=${(e) => this._valueChanged(e, "main_icon_offset_y")}
            />
          </div>
        </div>

        <hr />

        <!-- Temperature Section -->
        <h3>Temperature Settings</h3>
        <ha-entity-picker
          .label=${"Temperature entity"}
          .hass=${this.hass}
          .value=${this._config.temp_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "temp_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.show_temp_icon !== false}
              @change=${(e) => this._checkboxChanged(e, "show_temp_icon")}
            />
            Show temperature icon
          </label>
        </div>

        ${this._config.show_temp_icon !== false
          ? b`
              <ha-icon-picker
                .label=${"Temperature icon"}
                .hass=${this.hass}
                .value=${this._config.temp_icon || "mdi:thermometer"}
                @value-changed=${(e) => this._valueChanged(e, "temp_icon")}
              ></ha-icon-picker>
            `
          : ""}

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${this._renderColorPicker("Color", "temp_color", "#E57373")}
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Text size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.temp_font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "temp_font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="1.2em"
              .value=${this._config.temp_icon_size || "1.2em"}
              @input=${(e) => this._valueChanged(e, "temp_icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Decimals</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="1"
              .value=${this._config.temp_decimals !== undefined ? this._config.temp_decimals : 1}
              @input=${(e) => this._valueChanged(e, "temp_decimals")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Unit (e.g. °C, °F)</label>
            <input
              type="text"
              placeholder="Auto (°C)"
              .value=${this._config.temp_unit !== undefined ? this._config.temp_unit : ""}
              @input=${(e) => this._valueChanged(e, "temp_unit")}
            />
          </div>
        </div>

        ${this._renderActionBlock("Tap Action (Temperature)", "temp_tap_action", "", true)}
        ${this._renderActionBlock("Hold Action (Temperature)", "temp_hold_action", "", true)}

        <hr />

        <!-- Humidity Section -->
        <h3>Humidity Settings</h3>
        <ha-entity-picker
          .label=${"Humidity entity"}
          .hass=${this.hass}
          .value=${this._config.humidity_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "humidity_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.show_humidity_icon !== false}
              @change=${(e) => this._checkboxChanged(e, "show_humidity_icon")}
            />
            Show humidity icon
          </label>
        </div>

        ${this._config.show_humidity_icon !== false
          ? b`
              <ha-icon-picker
                .label=${"Humidity icon"}
                .hass=${this.hass}
                .value=${this._config.humidity_icon || "mdi:water"}
                @value-changed=${(e) => this._valueChanged(e, "humidity_icon")}
              ></ha-icon-picker>
            `
          : ""}

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${this._renderColorPicker("Color", "humidity_color", "#4FC3F7")}
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Text size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.humidity_font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "humidity_font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="1.2em"
              .value=${this._config.humidity_icon_size || "1.2em"}
              @input=${(e) => this._valueChanged(e, "humidity_icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Decimals</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="1"
              .value=${this._config.humidity_decimals !== undefined ? this._config.humidity_decimals : 1}
              @input=${(e) => this._valueChanged(e, "humidity_decimals")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Unit (e.g. %)</label>
            <input
              type="text"
              placeholder="Auto (%)"
              .value=${this._config.humidity_unit !== undefined ? this._config.humidity_unit : ""}
              @input=${(e) => this._valueChanged(e, "humidity_unit")}
            />
          </div>
        </div>

        ${this._renderActionBlock("Tap Action (Humidity)", "humidity_tap_action", "", true)}
        ${this._renderActionBlock("Hold Action (Humidity)", "humidity_hold_action", "", true)}
      </div>
    `;
    }

    static get styles() {
      return i$6`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      h3 {
        margin: 12px 0 4px 0;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      .action-block {
        background: rgba(0, 0, 0, 0.03);
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color, #eee);
        margin-top: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .action-block-title {
        font-weight: 600;
        font-size: 0.85em;
        color: var(--primary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      input[type="text"],
      input[type="number"],
      select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker,
      ha-icon-picker {
        width: 100%;
        display: block;
        margin-top: 4px;
      }
      .color-field {
        flex: 1;
        min-width: 110px;
      }
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="text"] {
        flex-grow: 1;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0;
      }
      .checkbox-field label {
        font-size: 0.9em;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
    `;
    }
  }

  /* ==========================================================================
     HOME ASSISTANT REGISTRATION
     ========================================================================== */
  if (!customElements.get("ha-plooum-temp-humidity-card")) {
    customElements.define("ha-plooum-temp-humidity-card", HaPlooumTempHumidityCard);
  }
  if (!customElements.get("ha-plooum-temp-humidity-card-editor")) {
    customElements.define("ha-plooum-temp-humidity-card-editor", HaPlooumTempHumidityCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === "ha-plooum-temp-humidity-card")) {
    window.customCards.push({
      type: "ha-plooum-temp-humidity-card",
      name: "Ha Plooum Room Temp & Humidity Card",
      description: "Display room temperature and humidity with customizable layout, padding, font sizes, units, and individual tap/hold actions.",
      preview: true,
    });
  }

})();
//# sourceMappingURL=ha-plooum-cards.js.map
