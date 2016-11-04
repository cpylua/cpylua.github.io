---
title: HMR for React with Webpack
permalink: react-hmr-with-webpack
date: 2015-09-24
---

HMR for React with Webpack
=======

Hot Module Replacement(HMR) in webpack
-----

HMR is a webpack feature to allow update/add/remove modules while app is running without a page reload. If you have used any Lisp systems, this should sounds familiar. Read the webpack docs [here(intro)](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html) and [here(API)](http://webpack.github.io/docs/hot-module-replacement.html).

Here's a high level overview. Webpack watches source code changes and recompiles modules, notifies the running app that an update is  pending via some communication channels(e.g. WebSocks, EventSource...). The running app then fetches updates and runs it, and calling specific function on the old modules to give it chance to update itself.

The difficult part is updating the affected dependency chain since a module can have dependencies and other modules may depend on it if the module has any exports. But with webpack, it is not a problem. Webpack itself is a module bundler, it knows all the dependency chains inside our app. Now we have a dependency graph and webpack injects code into our app to listen, fetch and apply updates.

Say we have dependency graph like this:

```
		 A
	   / | \
	  B  E  G
	 / \  \
	C   D  F
       /
      I

/*
Where A is the entry point of our app, and A depends on three modules: B, E and G. Module C and D are B's denpendencies and E depends on F.
*/
```

The current design of webpack's HMR API is to bubble module changes up in the dependency chain. Suppose module D is updated, let's call the new module D'. Module D' is first evaluated since its dependency I is unchanged. Then the update event bubbles up to  module B. Module B is rerun since its dependencies are all up to date now. The update event bubbles up until some module **accepts** the changes and the bubbling stops there. So you can accept changes at the root module A for simplicity:

```
// Inside module A

if(module.hot) {
  module.hot.accept();
}
```

Checkout the documentation for [hot.accept](http://webpack.github.io/docs/hot-module-replacement.html#accept).

Note, unchanged modules remain the same instances in the changed modules.

Now all done if your modules are *stateless*. But we write stateful modules all the time, so we need to patch them to get the module state correct. Webpack gives hooks for you to do such patchings through [dispose handlers](http://webpack.github.io/docs/hot-module-replacement.html#dispose-adddisposehandler). These patching code are the real monsters to do hot reloading. That's why our hot reloading sometimes not working correctly because some state just cannot be restored in the new module(think about closures). That's also why I prefer stateless modules whenever I have a choice.

`react-hot-loader`(the previous HMR solution we use in our project) works in a different, but much dirty way. Each module calls `accept` on its own, no bubbling happen in the dependency chain. Each module is responsible for updating binding in the original module to point to new code. For React components, it patches the component methods to use the updated methods. Details [here](https://github.com/gaearon/react-hot-api/blob/63ca389cbf2083442ccbdc007dd3bcdad4278f1e/README.md)(deprecated project).

react-transform-hmr
-----

We just switched from [react-hot-loader](https://github.com/gaearon/react-hot-loader) to [react-transform-hmr](https://github.com/gaearon/react-transform-hmr) based solution. Read the reason why `react-hot-loader` is deprecated  [here](https://medium.com/@dan_abramov/the-death-of-react-hot-loader-765fa791d7c4).

`react-transform-hmr` is a source code transformer that enables hot reloading of React components using webpack's [Hot Module Replacement API](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html). It depends on [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)(I will refer to it as React Transform). React Transform is a babel plugin that transforms your React component class source code at **compile time**. It identifies all React components in your code using some hurisitics(e.g. Does this class have a `render` method?) and runs registered transformers(e.g. `react-transform-hmr`) on these components in **runtime**. React Transform is essentially an AST transformer that injects runtime calls to registered transformers. The idea is simple, but the limit is your imagination.

An example can give you a better idea of what's going on.

The source file:

```
import React, { Component } from 'react';
import { NICE, SUPER_NICE } from './colors';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.interval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.setState({
      counter: this.state.counter + this.props.increment
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <h1 style={% raw %}{{ color: this.props.color }}{% endraw %}>
        Counter ({this.props.increment}): {this.state.counter}
      </h1>
    );
  }
}

export class App extends Component {
  render() {
    return (
      <div>
        <Counter increment={1} color={NICE} />
        <Counter increment={5} color={SUPER_NICE} />
      </div>
    );
  }
}
```

With two React Transform transformers enabled: `react-transform-hmr` and `react-transform-catch-errors`. The transformed source code is shown below. Note the codes with comments `// React Transform`, these are the code injected into the React component by React Transform.

```
  var _reactTransformHmr2 = __webpack_require__(165);
    var _reactTransformHmr3 = _interopRequireDefault(_reactTransformHmr2);
    var _react = __webpack_require__(7);
    var _reactTransformCatchErrors2 = __webpack_require__(207);
    var _reactTransformCatchErrors3 = _interopRequireDefault(_reactTransformCatchErrors2);
    var _redboxReact = __webpack_require__(208);
    var _react2 = _interopRequireDefault(_react);
    var _colors = __webpack_require__(212);

    // React Transform
    var _components = {
        _$Counter: {
            displayName: 'Counter'

        },
        _$App: {
            displayName: 'App'

        }

    };
    var _reactComponentWrapper = (0, _reactTransformHmr3['default'])({
        filename: '/Users/cli/test/react-transform-boilerplate/src/App.js',
        components: _components,
        locals: [module],
        imports: [_react]
    });
    var _reactComponentWrapper2 = (0, _reactTransformCatchErrors3['default'])({
        filename: '/Users/cli/test/react-transform-boilerplate/src/App.js',
        components: _components,
        locals: [],
        imports: [_react, _redboxReact]
    });

    function _wrapComponent(uniqueId) {
        return function(ReactClass) {
            return _reactComponentWrapper2(_reactComponentWrapper(ReactClass, uniqueId), uniqueId);
        };
    }

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            'default': obj
        };
    }

    var Counter = (function(_Component) {
        _inherits(Counter, _Component);

        function Counter(props) {
            var _this = this;
            _classCallCheck(this, _Counter);
            _get(Object.getPrototypeOf(_Counter.prototype), 'constructor', this).call(this, props);
            this.state = {
                counter: 0
            };
            this.interval = setInterval(function() {
                return _this.tick();
            }, 1000);
        }
        _createClass(Counter, [{
            key: 'tick',
            value: function tick() {
                this.setState({
                    counter: this.state.counter + this.props.increment
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                clearInterval(this.interval);
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2['default'].createElement('h1', {
                    style: {
                        color: this.props.color
                    }
                }, 'Counter (', this.props.increment, '): ', this.state.counter);
            }
        }]);

        // React Transform
        var _Counter = Counter;
        Counter = _wrapComponent('_$Counter')(Counter) || Counter;

        return Counter;
    })(_react.Component);

    var App = (function(_Component2) {
        _inherits(App, _Component2);

        function App() {
            _classCallCheck(this, _App);
            _get(Object.getPrototypeOf(_App.prototype), 'constructor', this).apply(this, arguments);
        }
        _createClass(App, [{
            key: 'render',
            value: function render() {
                return _react2['default'].createElement('div', null, _react2['default'].createElement(Counter, {
                    increment: 1,
                    color: _colors.NICE
                }), _react2['default'].createElement(Counter, {
                    increment: 5,
                    color: _colors.SUPER_NICE
                }));
            }
        }]);

        // React Transform
        var _App = App;
        App = _wrapComponent('_$App')(App) || App;

        return App;
    })(_react.Component);
    exports.App = App;
```

The magic all happends inside the two transformers. For example, `react-transform-hmr` calls `hot.accept` for the module if any React components inside a module changes, and wraps the component with `react-proxy` which does all the dirty job of hot reloading. There's no update event bubbling just like `react-hot-loader`.

`react-transform-hmr` is much reliable than `react-hot-loader` because:

1. It operates on the AST when identifying React components, while `react-hot-loader` parses function body.
2. Compile time vs runtime code injection.

We'll see how `react-proxy` patches new module in the next section.

React Component Hot Replacement
----

`react-hot-api` is deprecated and it actually depends on `react-proxy` under the hood. So we will only look into `react-proxy`.

The code base is small, only 5 source files. The package exports a `createProxy` function and re-exports the `getForceUpdate` from `react-deep-force-update` package.

`createProxy` takes a class constructor as argument and returns a proxy object with two methods: `get` and `update`. The `get` function returns the proxied class constructor, and `update` function patches the current class constructor with a newer class constructor. The class constructor returned from `get` is always the same object, but with different properties on it, so component class identity is preserved across reloading.

The `update` function updates the internal class constructor with the new class constructor passed in. It replaces the `__proto__`, `displayname` and bound methods on all mounted instances. The code is straightforward, just read the source code.

Conclusion
-----

`react-transform-hmr` and `react-hot-loader` works the same way, but the former is much modular, has better extensibility and offers a more reliable way for dealing with React component source code. None of them takes advantages of the webpack HMR bubbling model. Both will lose state in some cases, but will work in most cases. `react-transform-hmr` is an engineering evolution of `react-hot-loader`.

Reference:

- [Live Editing JavaScript with Webpack (Part III)](http://jlongster.com/Backend-Apps-with-Webpack--Part-III)
- [Webpack doc](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html)
