---
title: HTML5 Gotches on Mobile
permalink: html5-gotches-mobile
date: 2015-04-16
updated: 2016-03-28
---

# HTML5 Gotches on Mobile

*Update* These are some notes when we build the first version of our mobile
App last year. It's a hybrid version using Ionic. I have to admit it was a pain
to implement new features and maintain. We switched to native apps about half a
year later.

1. `<input type="file">` It takes seconds to trigger `onchange` event if we
select a couple of files(e.g. >= 8 pictures) on iOS, making it unusable.
[Reference](https://bugs.webkit.org/show_bug.cgi?id=136448)

2. We have two `div`s in a row, both contains some vary length texts, we want to
size the left `div` to its content and let the right `div` take up the rest space.
The solution is use `overflow:hidden` trick to mimic flexible layout.
[Reference](http://jsfiddle.net/glee/6Cavr/)

3. Rich text editor in browser? Yes, we can do it! The best solution is use
[`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_Editable)
and [`Document.execCommand`](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand).
Libraries exists, but if you are looking for a robust solution on mobile
platforms, I think you're out of luck as the time I am writing this(2015/04/16).
You may also want the [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
and [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) APIs.

4. iOS input focus issue. We have a search input box and a clear button next to
it. When clicking the clear button, we want clear the search box and set focus
to it. The trick is `preventDefault` in clear button's `touchstart` event(set
`useCapture` to `true` when registering the event listener). Then set focus to
input in `touchend`. Note, there will be no `click` event. `focus()` must be
called within the event handler, not inside any form of asynchronous callbacks.

5. Half pixel lines in CSS. Some times we need this, it may sound crazy at first,
why the hell we ever need half pixel lines? It turns out we need it on Retina
devices to draw a line that is only 1 **physical** pixel height. There're two
methods: `linear-background` and `scale up and down`.
[Reference](http://n12v.com/css-retina-and-physical-pixels/)
