import matchPath from 'lib/matchPath';


const VALID_CHILDREN = ['WC-ROUTE', 'WC-REDIRECT'];


export default class Switch extends HTMLElement {
    constructor() {
        super();

        this.routes = [];

        this.router = document.querySelector('wc-router');
        if (!this.router) this._error('Place the route inside a <WC-ROUTER>');

        this.observer = new MutationObserver(this._handleMutation.bind(this));
    }


    connectedCallback() {
        const init = () => {
            this.addRoutes(Array.from(this.children));
            this._handleChange(this.router.history.location);

            this.unlisten = this.router.history.listen(
                this._handleChange.bind(this)
            );
        };

        if (window.WebComponents.ready) init();
        document.addEventListener('WebComponentsReady', init.bind(this));
    }


    disconnectedCallback() {
        if (this.unlisten) this.unlisten();
    }


    addRoutes(routes) {
        routes
            .filter(r => !this.routes.includes(r))
            .forEach(r => {
                this.routes.push(r);
                r.disconnect();
            });
    }

    removeRoutes(routes) {
        this.routes = this.routes
            .filter(r => !routes.includes(r));
    }


    _handleMutation([e]) {
        if (e.addedNodes) this._validateChildren();
        this.addRoutes(e.addedNodes);
    }


    _handleChange(location) {
        let matched = false;
        this.routes.forEach(r => {
            // Only show the first route that matches
            if (matched) return r.disconnect();

            const match = matchPath(location.pathname, r.path);
            if (match || r.path === '*') {
                if (match) {
                    this.router.params = {...this.router.params, ...match.params};
                }
                if (r.exact && !match.isExact) return r.disconnect();
                else matched = r;
            } else r.disconnect();
        });

        if (matched) matched.connect();
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


    _error(err, ...rest) {
        console.error('WC-SWITCH:', err, ...rest);
    }
}

window.customElements.define('wc-switch', Switch);
