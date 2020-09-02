import {LitElement, html, css} from 'lit-element';

class ShareElement extends LitElement {

    static get properties() {
        return {
            locatorUrl : {type: String},
            domain : {type: String}, // TODO : Will be available soon
        }
    }

    constructor() {
        super();
        this.locatorUrl = encodeURI("https://chrome.google.com/webstore/detail/custom-elements-locator/eccplgjbdhhakefbjfibfhocbmjpkafc");
    }

    render() {
        const tweetText = encodeURI(`I just found some custom-elements on ${this.domain} using locator!`);
        return html`
            <div class="share">
                <div class="icon">
                  <img class="icon" src="./share.svg"/>
                </div>
                <a href="https://twitter.com/intent/tweet?text=${tweetText}&url=${this.locatorUrl}&hashtags=webcomponents,webcomponentsinthewild&via=OpenWc" target="_blank">Share your findings on Twitter!</a>
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
    `
    }
}

customElements.define('share-element', ShareElement);