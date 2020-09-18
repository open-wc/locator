import { LitElement, html, css } from 'lit-element';
import { share } from './icons/share.js';
class ShareElement extends LitElement {
  static get properties() {
    return {
      locatorUrl: { type: String },
      domain: { type: String },
      amount : {type: Number}
    }
  }

  constructor() {
    super();
    this.locatorUrl = encodeURI("https://chrome.google.com/webstore/detail/custom-elements-locator/eccplgjbdhhakefbjfibfhocbmjpkafc");
  }

  render() {
    const tweetText = encodeURI(`I just found ${this.amount} custom-elements on ${this.domain} using locator!`);
    return html`
      <div class="share">
        ${share}
        <span>
          <a href="https://twitter.com/intent/tweet?text=${tweetText}&url=${this.locatorUrl}&hashtags=webcomponents,webcomponentsinthewild&via=OpenWc" target="_blank">Share your findings on Twitter!</a>
        </span>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        color: var(--col-gray);
        margin-top: 1.5em;
        margin-bottom: 1em;
        width: 100%;
        border: 1px;
        justify-content: center;
        display: flex;
        text-align: left;
      }

      svg {
        fill: var(--col-gray);
        vertical-align: middle;
      }

      a {
        border-left: 5px;
        color: var(--col-gray);
        font-size: 14px;
      }
    `
  }
}

customElements.define('share-element', ShareElement);