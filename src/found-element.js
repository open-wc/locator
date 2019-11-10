import {LitElement, html, css} from 'lit-element';

const sendMessage = (msg, el, payload) => {
  console.log(payload)
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    console.log('sent msg');
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
      readmeOpened: false,
      tweakOpened: false,
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
        console.log(valName);
        sendMessage("setVal", this.customElement.name, {valName, valType, newValue: checked, type});
      } else {
        sendMessage("setVal", this.customElement.name, {valName, valType, newValue, type});
      }
    }

    if(type === 'property') {
      sendMessage("setVal", this.customElement.name, {valName, valType, newValue, type});
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
        ? html`loading`
        : html``
      }
      ${this.result
        ? html`
          <div>
            <h1>${this.result.name}</h1>
            <h2>${this.customElement.name}</h2>
            <a target="_blank" href="${this.result.npmUrl}">npm</a> <a target="_blank" href="${this.result.githubUrl}">github</a>
            <ul>
              <li>Stars: ${this.result.githubStars}</li>
              <li>Size gzip: ${this.result.sizeGzip}</li>
              <li>Deps: ${this.result.flattenedDependencies.length}</li>
            </ul>
            <div>
              <div class="subheader">
                <h3>Readme:</h3>
                <h3 @click=${() => {
                  console.log('clicked')
                  this.expendableItemState = { 
                    ...this.expendableItemState, 
                    readmeOpened: !this.expendableItemState.readmeOpened
                  }
                }}>
                  ${this.expendableItemState.readmeOpened ? '\\/' : '/\\'}
                </h3>
              </div>
              <code ?hidden=${!this.expendableItemState.readmeOpened}>
                ${this.result.readme}
              </code>
              <div class="subheader">
                <h3>Tweak:</h3>
                <h3 @click=${() => {
                  console.log('clicked')
                  this.expendableItemState = { 
                    ...this.expendableItemState, 
                    tweakOpened: !this.expendableItemState.tweakOpened
                  }
                }}>
                  ${this.expendableItemState.tweakOpened ? '\\/' : '/\\'}
                </h3>
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
        ` 
        : html`` 
      }
    `;
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .subheader {
        display: flex;
        justify-content: space-between;
      }

      h1 {
        font-size: 25px;
        color: rgb(33, 127, 249);
      }

      h2 {
        font-size: 20px;
      }

      code {
        display: block;
        word-break: break-word;
        height: 200px;
        overflow: scroll;
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