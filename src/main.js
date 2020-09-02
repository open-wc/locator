import {LitElement, html, css} from 'lit-element';
import './found-element.js'
import './share-element.js'

class CustomElementsLocator extends LitElement {
  static get properties() {
    return {
      customElements: { type: Array },
      query: { type: String },
      loaded: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.customElements = [];
    this.query = '';
    this.loaded = true;
  }

  firstUpdated() {
    document.addEventListener('DOMContentLoaded', () => {
      chrome.tabs.getSelected(null, (tab) => {    
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {msg: "init"}, (response) => {
            console.log(response);
            this.customElements = response;
            this.loaded = true;
          });
        });
      });
    });
    this.inputEl = this.shadowRoot.querySelector('input');
  }

  handleChange(e) {
    this.query = this.inputEl.value;
  }

  render() {
    return html`
      <div>
        <a class="img-href" href="https://open-wc.org" target="_blank">
          <img src="./owc-logo.svg"/>
        </a>
      </div>
      <h1>Custom Elements Locator</h1>
      <share-element></share-element>
      <div>
        <input placeholder="Filter custom elements..." @input=${this.handleChange} type="text"/>
      </div>
      ${this.loaded
        ? this.customElements.length > 0
          ? html`
              <h2>I found custom elements on </h2>
              <ul>
                ${this.customElements
                  .filter(element => element.includes(this.query))
                  .sort((a, b) => a.localeCompare(b))
                  .map(element => html`
                    <li>
                      <found-element .customElementName=${element}></found-element>
                    </li>
                  `)}
              </ul>
            `
          : html`<p>No custom elements found!</p>`
        : html`<p>Loading...</p>`
      }
    `;
  }

  static get styles() {
    return css`
      :host {
        width: 300px;
        font-family: sans-serif;
        display: block;
      }

      .img-href {
        display: block;
      }


      h1 {
        font-size: 25px;
        text-align: center;
        color: rgb(124, 124, 123);
      }

      div {
        display: flex;
        flex: 1;
        justify-content: center;
      }

      img {
        width: 100px;
        margin: auto;
      }

      ul {
        padding-left: 0;
        font-weight: 500;
        padding-left: 0;
        font-size: 15px;
      }

      li {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 15px;
          list-style-type: none;
          background-color: white;
          border-radius: 7px;
          border: solid 3px rgb(227, 227, 227);
      }

      li:hover {
        border: solid 3px rgb(33, 127, 249);
        box-shadow: 0px 2px 5px -2px rgba(0,0,0,0.54);
      }

      input {
        font-size: 15px;
        width: calc(100% - 25px);
        padding: 10px;
        border-radius: 25px;
        border: none;
        border: solid 3px rgb(227, 227, 227);
      }

      input:focus {
        outline: none;
        border: solid 3px rgb(33, 127, 249);
        box-shadow: 0px 2px 5px -2px rgba(0,0,0,0.54);
      }

      p {
        font-size: 15px;
        text-align: center;
        margin-top: 45px;
        margin-bottom: 45px;
      }
    `;
  }
}

customElements.define('custom-elements-locator', CustomElementsLocator);