import createHistory from 'history/createBrowserHistory';

const VALID_CHILDREN = ['WC-ROUTE'];

export default class Router extends HTMLElement {
    constructor() {
        super();
        this.observer = new MutationObserver(this._handleMutation.bind(this));
        this.routes = new Map();
    }

    connectedCallback() {
        const existing = document.querySelectorAll(this.tagName);
        if (existing.length > 1) this._error('Duplicate <wc-router>. Page may only contain one.');

        const history = createHistory({
            basename: this.getAttribute('basename')
        });

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
        console.log('disconnecting');
        this.unlisten();
        this.observer.disconnect();
    }


    attributeChangedCallback(attr, oldV, newV) {
        switch(attr) {

        }
    }


    // Map the history API nav functions to the element
    push(path, state) { this.history.push(...arguments) }
    replace(path, state) { this.history.replace(...arguments) }
    go(n) { this.history.go(...arguments) }
    goBack() { this.history.goBack() }
    goForward() { this.history.goForward() }



    register(route) {
        let existing = Array.from(this.routes).find(([r]) => r.spec === route.path.spec);
        if (existing) {
            this.routes.set(existing[0], [route, ...existing[1]]);
        }
        else this.routes.set(route.path, [route]);

        // this._handleChange(this);
    }



    _handleChange(location) {
        console.log('here');
        this.routes.forEach((routes, route) => {
            if (route.match(location.pathname)) {
                routes.forEach(r => {
                    if (!r.isConnected) r.oldParent.appendChild(r);
                });
            } else this.routes.set(route, routes.map(r =>
                r.isConnected ? r.parentNode.removeChild(r) : r
            ));
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
                `Invalid child. Should be one of <${VALID_CHILDREN.join('>, <')}>`
            )
        });
    }
}

window.customElements.define('wc-router', Router);
