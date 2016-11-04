---
title: Core Concepts of Angualar.js
permalink: core-concepts-of-angularjs
date: 2015-04-27
---

# Core Concepts of Angualar.js

Angular.js uses a two-way data binding between model and view.

Controllers should only contain business logic, reusable part of a controller can be factored into a service.

A Service is a reusable singleton. The second one is often used in  test code to mock service dependencies.
	- `module.factory`
	- `module.config('$provider', ... $provider.factory)`

Scopes are execution contexts, just like in a programming language. They can observe expressions and propagate events. During the template linking phase the directives set up $watch expressions on the scope. Both controllers and directives have reference to the scope, but not to each other. Use `angular.element(aDomElement).scope()` to retrieve the scope on a DOM element.

Three `$watch` depths:
	- By Reference
	- By Collection
	- By Value

Templates are the bridge between model and controller.

Expressions are JavaScript-like code snipes like `{{expression}}`. Expressions starting with `::` are one-time expressions, they will not change after the first non-null value.

Filters format values of expressions for display to the user. Filters not only can be used in templates, but also in services, controllers and directives to reduce the cost of repeated filter invocation. Filters should be pure, can be registered with `filterProvider`. Stateful filters are strongly discouraged, but you can do it with a `$stateful = true` property on the filter.

Directives are the bridge between DOM elements and Angular's HTML compiler. Angular normalizes element's tag and attribute name.

	- Strip `x-` and `data-`
	- convert `:`, `-` or `_` delimited name to `camelCase`

Types of directives:
	- Template-expending directives, reusable template, use `restrict` to control what to match with: `A`, `E` or `C`.
	- Directives for manipulating the DOM, registering events, use the `link` option.
	- Directives wrap other elements, use `transclude` option.

*When should I use an attribute versus an element?* Use an element when you are creating a component that is in control of the template. The common case for this is when you are creating a Domain-Specific Language for parts of your template. Use an attribute when you are decorating an existing element with new functionality.

Use `scope` to create an **isolate scope** to separate the scope inside a directive from the scope outside.

Use `&attr` in the `scope` option when you want your directive to expose an API for binding to behaviors.

Use `controller` when you want to expose an API to other directives. Otherwise use `link`.

Animations are implemented with CSS transitions or keyframe animation.

Beware that using `angular.module('myModule', [])` will create the module `myModule` and overwrite any existing module named `myModule`. Use `angular.module('myModule')` to retrieve an existing module.

We can manually bootstrap angular using `angular.bootstrap`. Useful when using 3rd-party loaders.

Any operation which can be shared among the instance of directives should be moved to the `compile` function for performance reasons.
