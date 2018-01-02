import createHistory from 'history/createBrowserHistory';
import matchPath from 'lib/matchPath';

const VALID_CHILDREN = ['WC-ROUTE'];

export default class Router extends HTMLElement {
    constructor() {
        super();
        this.observer = new MutationObserver(this._handleMutation.bind(this));
        this.routes = {};
    }

    connectedCallback() {
        const existing = document.querySelectorAll(this.tagName);

        if (existing.length > 1) this._error(
            'Duplicate <wc-router>. Page may only contain one.'
        );

        const history = createHistory({
            basename: this.basename
        });
        window._history = history;

        Object.defineProperty(this, 'history', {
            get: () => history,
            enumerable: false
        });

        this.observer.observe(this, {
            childList: true,
            subtree: true
        });

        this._validateChildren();

        this.unlisten = history.listen(this._handleChange.bind(this));
        this._handleChange(history.location);
    }


    disconnectedCallback() {
        this.unlisten();
        this.observer.disconnect();
    }


    static get observedAttributes() {
        return ['basename'];
    }

    attributeChangedCallback(attr, oldV, newV) {
        switch (attr) {
            case 'basename':
                this.basename = newV;
        }
    }


    // Map the history API nav functions to the element
    push(path, state) { this.history.push(path, state); }
    replace(path, state) { this.history.replace(path, state); }
    go(n) { this.history.go(n); }
    goBack() { this.history.goBack(); }
    goForward() { this.history.goForward(); }


    register(route) {
        const existing = this.routes[route.path];
        // Remove initially so it doesn't show, then if applicable, insert back
        // in once route is hit
        const removed = route.parentNode.removeChild(route);
        if (existing) this.routes[route.path] = [removed, ...existing[1]];
        else this.routes[route.path] = [removed];

        this._handleChange(this.history.location);
    }


    _handleChange(location) {
        Object.entries(this.routes).forEach(([route, routes]) => {
            const match = matchPath(location.pathname, route);

            if (match) {
                routes.forEach(r => {
                    if (!r.isConnected) {
                        if (r.exact && !match.isExact) return;
                        r.oldParent.appendChild(r);
                    }
                });
            } else this.routes[route] = routes.map(r =>
                r.isConnected ? r.parentNode.removeChild(r) : r
            );
        });
    }

    _handleMutation([e]) {
        if (e.addedNodes) this._validateChildren();
    }


    _error(err, ...rest) {
        console.error('WC-ROUTER:', err, ...rest);
    }


    _validateChildren() {
        Array.from(this.children).forEach(c => {
            if (!VALID_CHILDREN.includes(c.tagName)) this._error(
                `Invalid child. Should be one of <${
                    VALID_CHILDREN.join('>, <')
                }>`
            );
        });
    }
}

window.customElements.define('wc-router', Router);
