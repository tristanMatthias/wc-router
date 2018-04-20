import matchPath, {MatchPathOptions, MatchResultsParams, MatchResults} from './lib/matchPath';
import {UnregisterCallback, History, Location, createBrowserHistory} from 'history';
import Route from './wc-route';
import Link from './wc-link';

const VALID_CHILDREN = ['WC-ROUTE', 'WC-SWITCH'];


export interface RoutesCache {
    [path: string]: Route[];
}


export default class Router extends HTMLElement {
    observer: MutationObserver;
    routes: RoutesCache = {};
    basename: string = '';
    history: History | null = null;
    params: MatchResultsParams = {};

    private _unlisten: UnregisterCallback | null = null;


    constructor() {
        super();
        this.observer = new MutationObserver(this._handleMutation.bind(this));
    }


    connectedCallback() {
        const existing = document.querySelectorAll(this.tagName);

        if (existing.length > 1) this._error('Duplicate <wc-router>. Page may only contain one.');

        const h = this.history = createBrowserHistory({
            basename: this.basename
        });


        Object.defineProperty(this, 'history', {
            get: () => h,
            enumerable: false
        });

        this.observer.observe(this, {
            childList: true,
            subtree: true
        });

        this._validateChildren();

        this._unlisten = h.listen(this._handleChange.bind(this));
        setTimeout(() => {
            this._handleChange(h.location)
        }, 10);
    }


    disconnectedCallback() {
        if (this._unlisten) this._unlisten();
        if (this.observer) this.observer.disconnect();
    }


    static get observedAttributes() {
        return ['basename'];
    }

    attributeChangedCallback(attr: keyof Router, oldV: string, newV: string) {
        switch (attr) {
            case 'basename':
                this.basename = newV;
        }
    }

    match(path: string, compare: MatchPathOptions | string) { return matchPath(path, compare); }

    // Map the history API nav functions to the element
    push(path: string, state?: any) {
        if (!this.history) return this._errorInitialised();
        if (this.history.location.pathname !== path) this.history.push(path, state);
    }

    replace(path: string, state?: any) {
        if (!this.history) return this._errorInitialised();
        if (this.history.location.pathname !== path) this.history.replace(path, state);
    }

    go(n: number) {
        if (!this.history) return this._errorInitialised();
        this.history.go(n);
    }

    goBack() {
        if (!this.history) return this._errorInitialised();
        this.history.goBack();
    }

    goForward() {
        if (!this.history) return this._errorInitialised();
        this.history.goForward();
    }


    register(route: Route) {
        if (!this.history) return this._errorInitialised();

        const existing = this.routes[route.path];
        // Remove initially so it doesn't show, then if applicable, insert back
        // in once route is hit
        const removed = (route.parentNode as HTMLElement).removeChild(route);
        if (existing) this.routes[route.path] = [removed, existing[1]];
        else this.routes[route.path] = [removed];

        this._handleChange(this.history.location);
    }


    private _handleChange(location: Location) {
        this.params = {};


        Object.entries(this.routes).forEach(([route, routes]) => {
            const match = matchPath(location.pathname, route);
            if (match) {
                routes.forEach(r => {
                    if (!r.isConnected) {
                        if (r.exact && !match.isExact) return;
                        r.connect();
                    }
                });
            } else {
                this.routes[route] = routes.map(r =>
                    r.isConnected ? r.disconnect() : r
                );
            }
        });

        (Array.from(document.querySelectorAll('wc-link')) as Link[])
            .filter(l => l.to)
            .forEach(l => {
                const m = matchPath(location.pathname, l.to);
                if (m && m.isExact) l.active = true;
                else l.active = false;
            });
    }

    private _handleMutation([e]: MutationRecord[]) {
        if (e.addedNodes) this._validateChildren();
    }


    private _error(err: string, ...rest: any[]) { console.error('WC-ROUTER:', err, ...rest); }
    private _errorInitialised() { this._error('Not initialised'); }


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
}

window.customElements.define('wc-router', Router);
