import createHistory from 'history/createBrowserHistory';

export default class Link extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.router = document.querySelector('wc-router');

        this.addEventListener('click', this._handleClick.bind(this));
    }

    _handleClick() {
        this.router.push(this.getAttribute('to'));
    }
}

window.customElements.define('wc-link', Link);
