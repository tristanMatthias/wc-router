import matchPath from 'lib/matchPath';

export default class Route extends HTMLElement {
    constructor() {
        super();

        this.initialised = false;
        this.registered = false;
        this.cachedChildren = [];

        this.router = document.querySelector('wc-router');
        if (!this.router) this._error('Place the route inside a <WC-ROUTER>');

    }


    connectedCallback() {
        if (!this.parentElement) return;

        this.cachedParent = this.parentElement;
        if (!matchPath(this.path)) this.style.display = 'none';

        if (this.initialised) return;
        this.initialised = true;


        if (this.parentElement.tagName != 'WC-SWITCH') {
            if (!this.registered) {
                this.registered = true;
                this.router.register(this);
            }
        }
    }


    connect(parent = this.cachedParent) {
        if (this.isConnected) return;
        if (!this.cachedChildren && this.element) this.cachedChildren = [document.createElement(this.element)];
        this.cachedChildren.forEach(c => this.appendChild(c));
        parent.appendChild(this);
        this.style.display = 'block';
    }


    disconnect() {
        if (!this.isConnected) return;
        // If there is the element attribute present, and no children have been
        // cached, then create the element from the attribute, otherwise
        // replace the cache with the existing children
        if (this.element && !this.cachedChildren.length) {
            this.innerHTML = '';
            this.cachedChildren = [document.createElement(this.element)];
        } else this.cachedChildren = Array.from(this.children).map(c => this.removeChild(c));

        if (!this.cachedParent) this.cachedParent = this.parentElement;

        return this.cachedParent.removeChild(this);
    }


    static get observedAttributes() {
        return [
            'path',
            'exact',
            'element'
        ];
    }


    attributeChangedCallback(attr, oldV, newV) {
        switch (attr) {
            case 'path':
            case 'element':
                this[attr] = newV;
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
