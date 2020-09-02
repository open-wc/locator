import {LitElement, html, css} from 'lit-element';

class ShareElement extends LitElement {

    static get properties() {
        return {
            locatorUrl : {type: String},
            domain : {type: String},
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
                <img class="icon" src="./share.svg"/>
                <span>
                    <a href="https://twitter.com/intent/tweet?text=${tweetText}&url=${this.locatorUrl}&hashtags=webcomponents,webcomponentsinthewild&via=OpenWc" target="_blank">Share your findings on Twitter!</a>
                </span>
            </div>
        `;
    }

    static get styles() {
        return css`
      :host {
        margin-top: 1em;
        width: 100%;
        border: 1px;
        justify-content: center;
        display: flex;
        text-align: left;                
      }

      
      img{
        vertical-align: middle;
      }
      
      a {
      border-left: 5px;
        color: rgb(124, 124, 123);
      }
    `
    }
}

customElements.define('share-element', ShareElement);