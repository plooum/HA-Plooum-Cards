(function () {
  'use strict';

  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

  /* ==========================================================================
     MAIN CARD : ha-plooum-buttonbadge-card
     ========================================================================== */
  class HaPlooumButtonBadgeCard extends i {
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
      return i$3`
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
  class HaPlooumButtonBadgeCardEditor extends i {
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
      return i$3`
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
  class HaPlooumDpadCard extends i {
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
      return i$3`
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
  class HaPlooumDpadCardEditor extends i {
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
      return i$3`
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

  /* ==========================================================================
     MAIN CARD : ha-plooum-gridicons-card
     ========================================================================== */
  class HaPlooumGridIconsCard extends i {
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
      return i$3`
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
  class HaPlooumGridIconsCardEditor extends i {
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
      return i$3`
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

  const CARD_VERSION = '1.1.0';

  // States treated as "unavailable" (on top of an entity that doesn't exist).
  const UNAVAILABLE_STATES = ['unavailable', 'unknown'];
  const DEFAULT_COLOR_ON = '#66bb6a';
  const DEFAULT_COLOR_OFF = '#757575';
  const DEFAULT_COLOR_UNAVAILABLE = '#ef5350';

  class HaPlooumMultiStatusCard extends i {
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
        class="card" 
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
      return i$3`
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
  class HaPlooumMultiStatusCardEditor extends i {
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
      return i$3`
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
  class HaPlooumTabsCard extends i {
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
      return i$3`
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
  class HaPlooumTabsCardEditor extends i {
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
      return i$3`
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
  class HaPlooumTempHumidityCard extends i {
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
      return i$3`
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
  class HaPlooumTempHumidityCardEditor extends i {
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
      return i$3`
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
