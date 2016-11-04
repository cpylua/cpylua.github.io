---
title: Reading React Source Code
permalink: react-src
date: 2015-09-29
updated: 2016-03-28
---

# Reading React Source Code

*Update* This is written with react 0.14.

Facebook writes several babel plugins to help ease development, one big difference
with normal js code is that all modules are flattened, there's no path component
in the `require` call, only a module file name. They copy all referenced modules
into `build/lib` directory when building and use a babel plugin to modify `require`
paths. For example, `require("Foobar")` maybe transformed into `require("./Foobar)`.
There are some non-local modules, they are rewriten to their actual path.

`src/shared/utils/` implements some common utilities.
- `Transaction` is  a black box to ensure certain invariants are maintained before
and after any wrapped function is invoked.
- `PooledClass` implements a mixin to implement pooled class(e.g. instances are cached).
- An implementation of `alder-32` checksum algorithm, the checksum is not
cryptographically safe but runs fast(zlib uses it). React uses it to check markup
generated on server matches the markup generated on client.
- A utility to traverse react tree(e.g. `props.children`). Some information from
the code:
		1. User defined keys start with `$` in react-id.
		2. react-id is composed of the component keys in the path, separated by a dot.
		3. Implicit key generated by react is the index in set converted to base 36.
		4. `props.children` can be an atom, `Array` or `Array` like sequence.
`src/shared/vendor` contains a Polymer source file.
`src/shared/stubs` contains a implementation of `Object.assign`.

`src/isomorphic/deprecated` maybe `OrderedMap` is the only interesting one.

`src/isomorphic/children` implements utility function for `props.children`. e.g.
`forEach`, `map` and so on.

`src/isomorphic/classic/class` implements the classic `React.creatClass` function.
- **Trick**: `var MIXINS_KEY = keyOf({mixins: null});` to define keys that can be
used safely after object key minification.
- Why `shouldComponentUpdate: SpecPolicy.DEFINE_ONCE`? Because `DEFINE_MANY` are
required to return `void`, `DEFINE_MANY_MERGED` must return an `Object` and
`OVERRIDE_BASE` just doesn't make sense.
- Extensive checking about the spec using policy and interface.

`src/isomorphic/classic/types` implements `React.PropTypes.*` that you use to
validate prop/context types.
- Validation function: `function(props, propName, componentName, location, propFullName)`
throws if validation fails.

`src/isomorphic/classic/element/ReactElement` implements `ReactElement`.
- Uses tag to identify `ReactElement`(Symbol with fallback to number)
- Simply a object containing all required info about the element. `props`, `type`,
`ref` and `key`

`src/isomorphic/classic/element/ReactElementValidator` adds a wrapper on `ReactElement`
to do `props` validation

`src/isomorphic/classic/element/ReactDOMFactories` creates `HTML` standard tag
factories, like `React.DOM.div`.

`src/isomorphic/modern` implements the ES6 class style component. We use this in
our code. The code is very simple, almost nothing is there.

All important code are in `src/renderers`, React includes the DOM
renderer(`src/renderers/dom`). The event system and reconciler are in
`src/renderers/shared`. Many of the code inside this folder uses a simple dependency
injection pattern by exposing an `injection` object that has setters on it to
inject objects.

`src/renderers/shared/event` implements a general event system modeled on W3C DOM
event specification. `EventPluginHub` is responsible for config event plugins.
An event plugin is responsible for extracting and dispatching events.
`ResponderEventPlugin` implements the Responder system.

`src/renderers/shared/reconciler`
`ReactOwner`: All components are capable of **being** referenced by owner components, but
 * only ReactOwner components are capable of **referencing** owned components.
 * The named reference is known as a "ref".
An owner can attach and detach refs(functions). Component created in the `render`
function is automatic an owner.

`ReactRef`: Implements component ref CRUD.

`ReactUpdates` and `ReactUpdateQueue` used for queueing aync callbacks from
`setState`, `forceUpdate`... Closely relate to `Transaction` see `src/util/shared`.

`instantiateReactComponent` explicitly checks for `node === null` and `node === false`
and returns an empty component. That's why `{condition && <div>blah</div>}` and
returning `null` in `render` works.