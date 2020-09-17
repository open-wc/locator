import { LitElement, html, css } from 'lit-element';

const sendMessage = (msg, el) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {msg: msg, elementName: el});
  });
}

class FoundElement extends LitElement {
  static get properties() {
    return {
      customElementName: { type: String },
    }
  }

  highlight(el) {
    sendMessage("highlight", el);
  }

  target(el) {
    sendMessage("target", el);
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="el-name" @mouseover=${() => this.highlight(this.customElementName)}>
          <span>
            <a>${this.customElementName}</a>
          </span>
        </div>
        <div class="icons">
          <img alt="" @click=${() => this.target(this.customElementName)} class="icon" src="./icons/reticle.svg"/>
        </div>
      </div>
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