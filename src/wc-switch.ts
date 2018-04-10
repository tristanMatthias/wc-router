import matchPath from './lib/matchPath';
import Route from './wc-route';
import Router from './wc-router';
import {UnregisterCallback, Location} from 'history';


const VALID_CHILDREN = ['WC-ROUTE', 'WC-REDIRECT'];


export default class Switch extends HTMLElement {
    routes: Route[] = [];
    router: Router | null = null;
    observer: MutationObserver;
    unlisten: UnregisterCallback | null = null;

    constructor() {
        super();
        this.observer = new MutationObserver(this._handleMutation.bind(this));
    }


    connectedCallback() {
        const init = () => {
            this.router = document.querySelector('wc-router');
            if (!this.router) this._error('Place the switch inside a <WC-ROUTER>');

            const r = this.router;
            if (!r) return this._error('Router does not exist');

            const h = r.history;
            if (!h) return this._error('Router is not initialised');

            this.addRoutes(Array.from(this.children) as Route[]);
            this._handleChange(h.location);

            this.unlisten = h.listen(
                this._handleChange.bind(this)
            );
        };

        // @ts-ignore Provided by WC polyfill
        if (window.WebComponents.ready) init();
        document.addEventListener('WebComponentsReady', init.bind(this));
    }


    disconnectedCallback() {
        if (this.unlisten) this.unlisten();
    }


    addRoutes(routes: Route[]) {
        routes
            .filter(r => !this.routes.includes(r))
            .forEach(r => {
                this.routes.push(r);
                r.disconnect();
            });
    }

    removeRoutes(routes: Route[]) {
        this.routes = this.routes
            .filter(r => !routes.includes(r));
    }


    private _handleMutation([e]: MutationRecord[]) {
        if (e.addedNodes) this._validateChildren();
        this.addRoutes(Array.from(e.addedNodes) as Route[]);
    }


    private _handleChange(location: Location) {
        let matched: boolean | Route = false;
        const router = this.router;
        if (!router) return;

        this.routes.forEach(r => {
            // Only show the first route that matches
            if (matched) return r.disconnect();

            const match = matchPath(location.pathname, r.path);
            if (match || r.path === '*') {
                if (match) {
                    router.params = {...router.params, ...match.params};
                }
                if (r.exact && match) {
                    if (!match.isExact) return r.disconnect();
                }
                matched = r;
            } else r.disconnect();
        });

        if (matched) (matched as Route).connect();
    }


    private _validateChildren() {
        Array.from(this.children).forEach(c => {
            if (!VALID_CHILDREN.includes(c.tagName)) {
                this._error(
                    `Invalid child. Should be one of <${
                        VALID_CHILDREN.join('>, <')
                    }>`
                );
            }

        });
    }


    private _error(err: string, ...rest: any[]) {
        console.error('WC-SWITCH:', err, ...rest);
    }
}

window.customElements.define('wc-switch', Switch);
