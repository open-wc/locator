import {LitElement, html, css} from 'lit-element';

const sendMessage = (msg, el) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {msg: msg, elementName: el});
  });
}

class FoundElement extends LitElement {
  static get properties() {
    return {
      customElementName: { type: String },
      loading: { type: Boolean },
      result: {type: Object},
      customElement: { type: Object}
    }
  }

  constructor() {
    super();
    this.loading = false;
    this.result = undefined;
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
            <h3>Readme:</h3>
            <code>
              ${this.result.readme}
            </code>
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