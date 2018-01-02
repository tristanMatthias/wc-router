import createHistory from 'history/createBrowserHistory';
import RParser from 'route-parser';

export default class Route extends HTMLElement {
    constructor() {
        super();


        this.registered = false;

        this.router = document.querySelector('wc-router');
        if (!this.router) this._error('Place the route inside a <WC-ROUTER>');
        this.unlisten = this.router.history.listen(this.handleChange.bind(this));
    }


    connectedCallback() {
        this.oldParent = this.parentElement;
        if (!this.registered) {
            this.registered = true;
            this.router.register(this);
        }
    }

    disconnectedCallback() {
        this.unlisten();
    }


    get path() {
        return this._path;
    }
    set path(v) {
        this._path = new RParser(v)
    }


    static get observedAttributes() {
        return [
            'path'
        ];
    }



    attributeChangedCallback(attr, oldV, newV) {
        switch (attr) {
            case 'path':
                this.path = newV;
        }
    }


    // Map the history API nav functions to the element
    push(path, state) { this.history.push(...arguments) }
    replace(path, state) { this.history.replace(...arguments) }
    go(n) { this.history.go(...arguments) }
    goBack() { this.history.goBack() }
    goForward() { this.history.goForward() }



    handleChange(location, action) {
        // console.log('router', location);
    }


    handleMutation([e]) {
        if (e.addedNodes) this._validateChildren();
    }


    _error(err, ...rest) {
        console.error('WC-ROUTE:', err, ...rest);
    }
}

window.customElements.define('wc-route', Route);
