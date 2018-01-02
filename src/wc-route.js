export default class Route extends HTMLElement {
    constructor() {
        super();


        this.registered = false;

        this.router = document.querySelector('wc-router');
        if (!this.router) this._error('Place the route inside a <WC-ROUTER>');
    }


    connectedCallback() {
        this.oldParent = this.parentElement;
        if (!this.registered) {
            this.registered = true;
            this.router.register(this);
        }

        const element = this.getAttribute('element');
        if (element) {
            this.innerHTML = '';
            this.appendChild(document.createElement(element));
        }
    }

    disconnectedCallback() {
    }


    static get observedAttributes() {
        return [
            'path',
            'exact'
        ];
    }


    attributeChangedCallback(attr, oldV, newV) {
        switch (attr) {
            case 'path':
                this.path = newV;
                break;
            case 'exact':
                if (newV == '') this.exact = true;
                else this.exact = Boolean(newV);
        }
    }


    _error(err, ...rest) {
        console.error('WC-ROUTE:', err, ...rest);
    }
}

window.customElements.define('wc-route', Route);
