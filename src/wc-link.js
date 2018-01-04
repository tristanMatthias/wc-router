export default class Link extends HTMLElement {
    constructor() {
        super();
        this.activeclass = 'active';
    }


    connectedCallback() {
        this.router = document.querySelector('wc-router');

        this.addEventListener('click', this._handleClick.bind(this));
    }


    get active() {
        return this._active;
    }
    set active(v) {
        this._active = v;
        this.classList.toggle(this.activeclass, Boolean(v));
    }

    set to(v) {
        this._to = v;
        this.setAttribute('to', v);
    }
    get to() {
        return this._to;
    }


    static get observedAttributes() {
        return ['to', 'activeclass'];
    }

    attributeChangedCallback(attr, oldV, newV) {
        switch (attr) {
            case 'to':
                if (oldV != newV) this.to = newV;
                break;
            case 'activeclass':
                this[attr] = newV;
                if (this.active) {
                    this.classList.remove(oldV);
                    this.classList.add(newV);
                }

                break;
        }
    }


    _handleClick() {
        this.router.push(this.to);
    }
}

window.customElements.define('wc-link', Link);
