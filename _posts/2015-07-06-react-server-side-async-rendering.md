---
title: React Server Side Async Rendering
permalink: react-server-side-async-rendering
date: 2015-07-06
updated: 2016-03-28
---

# React Server Side Async Rendering

*Update* I think `react-router` has better support for server rendering now.

Solutions for server-side rendering of asynchronously initialized React.js
component: **No perfect solution**, at least for now.

Here're some links discussing this issue:

- [Strategies for server-side rendering of asynchronously initialized React.js components](http://stackoverflow.com/questions/25983001/strategies-for-server-side-rendering-of-asynchronously-initialized-react-js-comp)
- [Make componentWillMount async](https://github.com/facebook/react/issues/1739)

Seems the only reasonable way is to pre-fetch data in React Router transition hook `willTransitionTo`.
