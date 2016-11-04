---
title: Mithril vs. React
permalink: mithril-vs-react
date: 2015-06-05
updated: 2015-03-28
---

# Mithril vs. React

*Update* When starting our web app, we were evaluating different frameworks.
We have used AngularJS before and don't like it, so we were looking something
better. We are using React now and it was great, way better than AngularJS.

- Non-standard Promise A+ implementation might be a problem
- Small code base, some basic functionalities require in house extending(e.g. bindonce, skip subtree re-rendering). But I think it is feature complete.
- Routing is too simple, I suspect there will be some pains handling nested views. (e.g. state change hooks, stop state during hooks)
- JSX is non-default, and the syntax might fall behind the latest implementation in React.
- With a minimal API surface, a coding style guide must be followed. On the other hand, React forces some convensions in code. Personally I prefer the Mithril coding style. It does not force a fake OOP style like in React and it should play well with ES6 features.
- [A React VS Mithril Comparison](https://docs.google.com/spreadsheets/d/10hSqLO-wR77DKS_f_Zbv-IMLMaKnLZ1pGw-TQqF9Ab0/edit#gid=0)

My choice: **React**.

React does NOT recommend to use mixins:
> Mixins
> Unfortunately, we will not launch any mixin support for ES6 classes in React. That would defeat the purpose of only using idiomatic JavaScript concepts.

> There is no standard and universal way to define mixins in JavaScript. In fact, several features to support mixins were dropped from ES6 today. There are a lot of libraries with different semantics. We think that there should be one way of defining mixins that you can use for any JavaScript class. React just making another doesn't help that effort.

> Therefore, we will keep working with the larger JS community to create a standard for mixins. We will also start designing a new compositional API that will help make common tasks easier to do without mixins. E.g. first-class subscriptions to any kind of Flux store.

> Luckily, if you want to keep using mixins, you can just keep using React.createClass.

When working with React, we should favor immutable.
