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
      result: {type: Array}
    }
  }

  constructor() {
    super();
    this.loading = false;
    this.result = [];
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

    // iterate through response array, check if custom elements.json contains `el` (the component name)
    const responseAsJson = await res.json();
    // better way to handle this in the template
    this.result = responseAsJson;
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
      ${this.result.length > 0
        ? html`
          <div>
            <h1>${this.result[0].name}</h1>
            <h2>${this.result[0].elName}</h2>
            <a target="_blank" href="${this.result[0].npmUrl}">npm</a> <a target="_blank" href="${this.result[0].githubUrl}">github</a>
            <ul>
              <li>Stars: ${this.result[0].githubStars}</li>
              <li>Size gzip: ${this.result[0].sizeGzip}</li>
              <li>Deps: ${this.result[0].flattenedDependencies.length}</li>
            </ul>
            <h3>Readme:</h3>
            <code>
              ${this.result[0].readme}
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