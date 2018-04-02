import Router from './wc-router';

export default class Link extends HTMLElement {
    activeclass: string = 'active';
    router: Router | null = null;

    private _active: boolean = false;
    private _to: string = '';

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

    attributeChangedCallback(attr: keyof Link, oldV: string, newV: string) {
        switch (attr) {
            case 'to':
                if (oldV !== newV) this.to = newV;
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


    private _handleClick() {
        const r = this.router;
        if (r) r.push(this.to);
    }
}

window.customElements.define('wc-link', Link);
