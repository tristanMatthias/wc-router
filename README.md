# ALPHA: WC-ROUTER

Declarative routing for Web Components with Custom Elements.

> This package is still in alpha. It is currently being written to mimic the major functionality of React Router for use in Origami CMS.

Largely inspired by the fantastic [React Router](https://github.com/ReactTraining/react-router).

It uses the NPM [History module](https://www.npmjs.com/package/history) to consume the native History API.

---

## Installation
Using [npm](https://www.npmjs.com/):

```
$ npm install wc-router
```

Then with a module bundler like [webpack](https://webpack.github.io/), use as you would anything else:

```js
// using ES6 modules
import 'wc-router';
```

This will automatically register the custom elements `<wc-router>`, `<wc-route>`, and `<wc-link>`, ready for you to use.


## Usage
In your HTML, add the root element `<wc-router>`, in which all your routes will sit. Your individual routes sit nested inside.

```html
<!DOCTYPE html>
<html lang="en">
<body>
    <wc-router>
        <wc-route path="/">
            Home page
        </wc-route>
        <wc-route path="/settings">
            Settings page
        </wc-route>
        <wc-route path="/login">
            Login page
        </wc-route>
    </wc-router>

    <script type="text/javascript" src="wc-router.min.js"></script>
</body>
</html>
```


### Linking
Use the `<wc-link>` element to link to another route.

```html
<wc-link to='/settings'> Open settings </wc-link>
```



## Issues
If you find a bug, please file an issue on [the issue tracker on GitHub](https://github.com/tristanMatthias/wc-router/issues).



## Credits
Web Components Router is built and maintained by [Tristan Matthias](https://www.github.com/tristanMatthias).
