import { Remarkable } from 'remarkable';

import githubMarkdownCss from './github-markdown.css.js';

/**
 * @param {string} text
 * @return {string}
 */
function unindent(_text) {
  const text = _text.trim();
  if (!text) {
    return text;
  }
  const lines = text.replace(/\t/g, '  ').split('\n');
  const indent = lines.reduce((prev, line) => {
    if (/^\s*$/.test(line)) {
      return prev; // Completely ignore blank lines.
    }

    const lineIndent = line.match(/^(\s*)/)[0].length;
    if (prev === null) {
      return lineIndent;
    }
    return lineIndent < prev ? lineIndent : prev;
  }, null);

  return lines.map(l => l.substr(indent)).join('\n');
}

export class RemarkableMarkdown extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.__md = new Remarkable();

    this._srcEl = this.querySelector('[type="text/markdown"]');
    if (!this._srcEl) {
      throw new Error('You need to provide');
    }

    if (this._srcEl.text) {
      const src = unindent(this._srcEl.text);
      this.markdown = this.__md.render(src);
    }
    this.shadowRoot.innerHTML = `
      <div class="markdown-body">
        ${this.markdown}
      </div>
      <style>
        ${githubMarkdownCss}
      </style>
    `;
  }
}

customElements.define('remarkable-markdown', RemarkableMarkdown);
