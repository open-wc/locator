import {LitElement, html, css} from 'lit-element';
import './remarkable-markdown.js';
import './view-json.js';

function formatBytes(a,b){if(a === null)return "N/A"; if(0==a)return"0 B";var c=1024,d=b||2,e=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

const sendMessage = (msg, el, payload) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {msg: msg, elementName: el, payload});
  });
}

class FoundElement extends LitElement {
  static get properties() {
    return {
      customElementName: { type: String },
      loading: { type: Boolean },
      result: {type: Object},
      expendableItemState: { type: Object },
      customElement: { type: Object }
    }
  }

  constructor() {
    super();
    this.loading = false;
    this.result = undefined;
    this.expendableItemState = {
      infoOpened: true,
      readmeOpened: false,
      packagejsonOpened: false,
      tweakOpened: false
    }
    this.customElement = {};
  }

  highlight(el) {
    sendMessage("highlight", el);
  }

  target(el) {
    sendMessage("target", el);
  }

  async search(el) {
    this.loading = true;
    const res = await fetch(`https://catalog.open-wc.org/.netlify/functions/search?downloadTime=50&sizeGzip=50&sizeSelf=50&githubStars=50&githubWatchers=50&queryString=${this.customElementName}`);
    const responseAsJson = await res.json();

    const parentLibrary = responseAsJson.find(item => item.customElementsString.includes(el))
    const customElementsJson = JSON.parse(parentLibrary.customElementsString);
    this.customElement = customElementsJson.tags.find(item => el === item.name);

    this.result = parentLibrary;
    this.loading = false;
  }

  setVal(e, valName, valType, type) {
    const newValue = e.composedPath()[0].value;

    if(type === 'attribute') {
      if(valType === 'boolean') {
        const checked = e.composedPath()[0].checked;
        sendMessage("setVal", this.customElement.name, {valName, valType, newValue: checked, type});
      } else {
        sendMessage("setVal", this.customElement.name, {valName, valType, newValue, type});
      }
    }

    if(type === 'property') {
      sendMessage("setVal", this.customElement.name, {valName, valType, newValue, type, elementName: this.customElement.name});
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="el-name" @mouseover=${() => this.highlight(this.customElementName)}>  
          <span>
            <a target="_blank" href="https://catalog.open-wc.org">${this.customElementName}</a>
          </span>
        </div>
        <div class="icons">
          <img @click=${() => this.search(this.customElementName)} class="search icon" src="./search.svg"/>
          <img @click=${() => this.target(this.customElementName)} class="icon" src="./reticle.svg"/>
        </div>
      </div>
      ${this.loading
        ? html`
            <div class="loading">
              <div class="loading-spinner">
                Loading...
              </div>
            </div>
          `
        : html``
      }
      ${this.result
        ? html`
          <div>
      
            <div>
            <div class="subheader">
              <div class="subheader-title">
                <h3>Info</h3>
                <img @click=${() => {
                  this.expendableItemState = { 
                    ...this.expendableItemState, 
                    infoOpened: !this.expendableItemState.infoOpened
                  }
                }} src="./chevron.svg" class="${this.expendableItemState.infoOpened ? "chevron opened" : "chevron closed"}"/>
                </div>
                <div ?hidden=${!this.expendableItemState.infoOpened}>
                  <h1>${this.result.name}</h1>
                  <div class="element-name-icons">
                    <div class="element-name">
                      <h2>${this.customElement.name}</h2>
                    </div>
                    <div class="link-icons">
                      <a target="_blank" href="${this.result.npmUrl}">
                          <img class="link-icon npm" src="./npm.svg"/>
                      </a> 
                      <a target="_blank" href="${this.result.githubUrl}">
                        <img class="link-icon github" src="./github.svg"/>
                      </a>
                    </div>
                  </div>
                  <ul>
                    <li>⭐ Github Stars: ${this.result.githubStars || 'N/A'}</li>
                    <li>⚖️ Size (min/gzip): ${formatBytes(this.result.sizeGzip, 2)}</li>
                    <li>📦 Dependencies: ${this.result.flattenedDependencies.length}</li>
                  </ul>
                </div>
              </div>

              <div class="subheader">
                <div class="subheader-title">
                  <h3>Readme</h3>
                  <img @click=${() => {
                    this.expendableItemState = { 
                      ...this.expendableItemState, 
                      readmeOpened: !this.expendableItemState.readmeOpened
                    }
                  }} src="./chevron.svg" class="${this.expendableItemState.readmeOpened ? "chevron opened" : "chevron closed"}"/>
                </div>
                <code ?hidden=${!this.expendableItemState.readmeOpened}>
                  <remarkable-markdown>
                    <div slot="markdown-html"></div>
                    <script type="text/markdown">
                      ${this.result.readme}
                    </script>
                  </remarkable-markdown>
                </code>
              </div>

              <div class="subheader">
                <div class="subheader-title">
                  <h3>Package.json</h3>
                  <img @click=${() => {
                    this.expendableItemState = { 
                      ...this.expendableItemState, 
                      packagejsonOpened: !this.expendableItemState.packagejsonOpened
                    }
                  }} src="./chevron.svg" class="${this.expendableItemState.packagejsonOpened ? "chevron opened" : "chevron closed"}"/>
                </div>
                <code ?hidden=${!this.expendableItemState.packagejsonOpened}>
                  <view-json>
                    ${this.result.packageJsonString}
                  </view-json>
                </code>
              </div>

              <div class="subheader">
                <div class="subheader-title">
                  <h3>Tweak</h3>
                  <img @click=${() => {
                    this.expendableItemState = { 
                      ...this.expendableItemState, 
                      tweakOpened: !this.expendableItemState.tweakOpened
                    }
                  }} src="./chevron.svg" class="${this.expendableItemState.tweakOpened ? "chevron opened" : "chevron closed"}"/>
                </div>
                <code ?hidden=${!this.expendableItemState.tweakOpened}>
  
                  <h4>Attributes:</h4>
                  ${this.customElement.attributes.map(({name, type}) => html`
                    <li>
                      <p>${name}:</p>
                      ${type === 'boolean'
                        ? html`<input @input=${(e) => this.setVal(e, name, type, 'attribute')} type="checkbox"/>`
                        : html`<input @input=${(e) => this.setVal(e, name, type, 'attribute')} type="text"/>`
                      }
                    </li>
                  `)}
  
                  <h4>Properties:</h4>
                  ${this.customElement.properties.map(({name, type}) => html`
                    <li>
                      <p>${name}:</p>
                      <input @input=${(e) => this.setVal(e, name, type, 'property')} type="text"/>
                    </li>
                  `)}
  
                </code>
              </div>

            </div>
          </div>
        ` 
        : html`` 
      }
    `;
  }

  static get styles() {
    return css`
      :host {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      ul {
        list-style: none;
        padding-left: 0px;
      }

      .loading {
        height: 50px;
        display: flex;
        align-items: center;
        margin-top: 15px;
        text-align: center;
      }

      .link-icons {
        display: flex;
      }

      .element-name {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .element-name-icons {
        display: flex;
        justify-content: space-between;
      }

      .link-icons a {
        display: flex;
        height: 35px;
      }

      .link-icon {
        margin-left: 10px;
      }

      .github {
        width: 25px;
      }

      .npm {
        width: 35px;
      }

      .chevron {
        cursor: pointer;
        width: 20px;
      }

      .closed {
        transform: rotate(180deg);
      }

      .subheader {
        border-top: solid 1px lightgrey;
        display: flex;
        flex-direction: column;
      }

      .subheader-title {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      .subheader:first-of-type {
        margin-top: 15px;
      }

      .subheader:last-of-type {
        border-bottom:solid 1px lightgrey;
      }

      h1 {
        font-size: 25px;
        color: rgb(33, 127, 249);
        margin-bottom: 5px;
        margin-top: 0;
        border-top: none;
        padding-top: 0;
      }

      h2 {
        font-size: 20px;
        margin-bottom: 0;
        margin-top: 0;
      }

      code {
        border-radius: 10px;
        display: block;
        word-break: break-word;
        max-height: 200px;
        height: auto;
        overflow: scroll;
        margin-bottom: 15px;
      }

      code li {
        padding-top: 10px;
        padding-bottom: 10px;
        display: flex;
        justify-content: space-between;
      }

      code p {
        margin-top: 0;
        margin-bottom: 0;
      }

      code[hidden] {
        display: none;
      }

      .el-name {
        flex: 1;
      }

      .icons {
        display: flex;
        flex: 0;
      }

      .icon {
        width: 20px;
        margin: 0;
        cursor: pointer;
      }

      .search {
        margin-right: 10px;
      }

      a {
        text-decoration: none;
        color: rgb(33, 127, 249);
      }

      span::before {
        content: "<";
      }

      span::after {
        content: ">";
      }

      a:hover {
        text-decoration: underline;
      }

      .wrapper {
        display: flex;
      }
    `
  }
}

customElements.define('found-element', FoundElement);