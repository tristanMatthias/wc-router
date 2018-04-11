import matchPath from './lib/matchPath';
import Router from './wc-router';

export default class Route extends HTMLElement {
    path: string = '';
    // @ts-ignore Provided by polyfill
    isConnected: boolean;
    initialised: boolean = false;
    registered: boolean = false;
    exact: boolean = false;
    element: string | null = null;
    cachedChildren: HTMLElement[] = [];
    router: Router | null = null;
    cachedParent: HTMLElement | null = null;

    constructor() {
        super();

    }


    connectedCallback() {
        const init = () => {
            this.router = document.querySelector('wc-router');

            if (!this.router) return this._error('Place the route inside a <WC-ROUTER>');
            if (!this.parentElement) return;

            this.cachedParent = this.parentElement;
            if (!matchPath(this.path)) this.style.display = 'none';

            if (this.initialised) return;
            this.initialised = true;


            if (this.parentElement.tagName !== 'WC-SWITCH') {
                if (!this.registered) {
                    this.registered = true;
                    this.router.register(this);
                }
            }
        };

        // @ts-ignore Provided by WC polyfill
        if (window.WebComponents.ready) init();
        document.addEventListener('WebComponentsReady', init.bind(this));
    }


    connect(parent = this.cachedParent) {
        if (!parent) return this._error('No parent');
        if (this.isConnected && this.children.length) return;
        if (!this.cachedChildren.length && this.element) {
            this.cachedChildren = [document.createElement(this.element)];
        }
        this.cachedChildren.forEach(c => this.appendChild(c));
        parent.appendChild(this);
        this.style.display = 'block';
    }


    disconnect() {
        if (!this.isConnected) return this;
        // If there is the element attribute present, and no children have been
        // cached, then create the element from the attribute, otherwise
        // replace the cache with the existing children
        if (this.element && !this.cachedChildren.length) {
            this.innerHTML = '';
            this.cachedChildren = [document.createElement(this.element)];
        } else {
            this.cachedChildren = Array.from(this.children)
                .map(c => this.removeChild(c) as HTMLElement);
        }

        if (!this.cachedParent) this.cachedParent = this.parentElement as HTMLElement;

        return this.cachedParent.removeChild(this);
    }


    static get observedAttributes() {
        return [
            'path',
            'exact',
            'element'
        ];
    }


    attributeChangedCallback(attr: keyof Route, oldV: string, newV: string) {
        switch (attr) {
            case 'path':
            case 'element':
                this[attr] = newV;
                break;
            case 'exact':
                if (newV === '') this.exact = true;
                else this.exact = Boolean(newV);
        }
    }


    private _error(err: string, ...rest: any[]) {
        console.error('WC-ROUTE:', err, ...rest);
    }
}

window.customElements.define('wc-route', Route);
