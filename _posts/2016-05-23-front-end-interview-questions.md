---
title: Notes on Front-end Developer Interview Questions
permalink: notes-on-front-end-develip-interview-questions
date: 2016-05-23
updated: 2016-06-26
---

# Notes on Front-end Developer Interview Questions

**This is a collection of references for some selected questions. These are
not answers.**

## General Questions

**Q:** Can you describe the difference between progressive enhancement and graceful degradation?  
**A:** There is a detailed W3C [wiki](https://www.w3.org/wiki/Graceful_degradation_versus_progressive_enhancement).
It uses the print button as an example. Graceful degradation tells the user how
to print the page if javascript is not available but always shows the print button,
while progressive enhancement show the print button only when javascript is enabled
and only show a notification to user to print the page by default.

> It can be said that both progressive enhancement and graceful degradation try to
> do the same thing: keep our products useful to every user. Progressive enhancement
> is a more sophisticated and at the same time stable way of assuring that but it
> takes more time and effort. Graceful degradation can be used more easily as a
> patch for an already existing product; it means harder maintenance later on, but
> requires less initial work.

**Q:** How would you optimize a website's assets/resources?  
**A:** Think at multiple levels: network(CDN), server(compress, HTTP headers),
browser(lazy load), develop(write clean code), build(concatenate, preprocess images)
and deploy(separate servers for static contents and dynamic contents).

**Q:** What does CORS stand for and what issue does it address?  
**A:** Cross-origin resource sharing (CORS) is a mechanism that allows restricted
resources (e.g. fonts) on a web page to be requested from another domain outside
the domain from which the resource originated. It solves the same-origin security
policy issue.

**Q:** Explain what ARIA and screenreaders are, and how to make a website accessible?  
**A:** WAI-ARIA stands for “Web Accessibility Initiative – Accessible Rich Internet Applications”.
It is a set of attributes to help enhance the semantics of a web site or web application
to help assistive technologies, such as screen readers for the blind, make sense
of certain things that are not native to HTML. This is achieved by applying roles
and state attributes to HTML.

## HTML Questions

**Q:** What does a doctype do?  
**A:** DOCTYPE describes the HTML that will be used in your page. Not including a
DOCTYPE or including an incorrect DOCTYPE can trigger quirks mode. See this
[link](https://en.wikipedia.org/wiki/Quirks_mode#Comparison_of_document_types).


**Q:** What's the difference between full standards mode, almost standards mode and quirks mode?  
**A:** Related to `doctype`. See this [link](https://hsivonen.fi/doctype/). Full
standards mode vs almost standards mode sounds like a joke to me, WTF. We live in
the web empire, anything can happen.

**Q:** Are there any problems with serving pages as application/xhtml+xml?  
**A:** Old IEs do not support this content type, see [this](http://caniuse.com/#feat=xhtml).
Content negotiation will have problems with proxy servers.

**Q:** What kind of things must you be wary of when design or developing for multilingual sites?  
**A:** Things to consider: text in image, text length varies, date and concurrency
format, text direction.
Lots of sites uses IP address geolocation to redirect user to the right language.

**Q:** Describe the difference between `<script>`, `<script async>` and `<script defer>`?  
**A:** `async` will pause DOM tree parsing is download is completed while `defer`
will download while parsing and only execute scripts *in order* after DOM tree has
been parsed. This [link](http://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html)
has a nice graph for the difference.

**Q:** What is progressive rendering?  
**A:** Something related to lazy loading, such as images. There're other possibilities
like rendering a large dataset.

## CSS Questions

**Q:** Describe Floats and how they work  
**A:** See [link1](http://phrogz.net/css/understandingfloats.html) and
[link2](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context).
Link2 is about formatting context block which plays an important role in floats.

**Q:** Describe z-index and how stacking context is formed.  
**A:** Read this [post](http://philipwalton.com/articles/what-no-one-told-you-about-z-index/).

**Q:** What are your favourite image replacement techniques and which do you use  
**A:** CSS image replacement is a technique of replacing a text element (usually a
header tag) with an image. For SEO benefits or screen readers. Read it
[here](https://css-tricks.com/css-image-replacement/).

**Q:** What are the different ways to visually hide content (and make it available
only for screen readers)?  
**A:** Besides some obvious methods, media type can also do the trick.

**Q:** How would you implement a web design comp that uses non-standard fonts?  
**A:** @font-face, there're online services like Google fonts. CJK fonts are quit
large, avoid it or extract only the used characters.

**Q:** Explain how a browser determines what elements match a CSS selector.  
**A:** AKA [selector specificity](https://www.w3.org/TR/selectors/#specificity).
One small thing to note is:
> Selectors inside the negation pseudo-class are counted like any other, but the
> negation itself does not count as a pseudo-class.

**Q:** Describe pseudo-elements and discuss what they are used for.  
**A:** The most used pseudo-elements are `::before` and `::after`. See the complete
[list of pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements).
There is a similar concept known as [pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/pseudo-classes).

**Q:** How is responsive design different from adaptive design?  
**A:** See [this](https://css-tricks.com/the-difference-between-responsive-and-adaptive-design/)
for a detailed explaination. TLDR;
> Responsive websites *respond* to the size of the browser *at any given point*.
> Adaptive websites *adapt* to the width of the browser *at a specific points*.

## JavaScript Questions

**Q:** Explain how prototypal inheritance works.  
**A:** See the [code](https://jsfiddle.net/cpylua/0pux87xp/).

**Q:** Explain why the following doesn't work as an IIFE: `function foo(){ }();`  
**A:** Read it [here](http://dmitrysoshnikov.com/ecmascript/chapter-5-functions/#question-about-surrounding-parentheses).
In short: `function () {}()` throws `SyntaxError` because it is treated as a function
declaration without a name in some context(e.g. global scope). `function foobar() {}()` throws `SyntaxError`
because grouping operator has no expression inside. There are other ways to transform
a function declaration into a function expression, like `1, function(){}(); !function(){}()`.

**Q:** What is the difference between host objects and native objects?  
**A:** Native objects are those whose semantics are fully defined by the specification
rather than by the host environment. e.g. `Date`, `Math` and `parseInt`. Any other
objects that is not a native object are host objects. e.g. `window`, `document`.

**Q:** Explain how JSONP works (and how it's not really Ajax).  
**A:** JSON with Padding(JSONP) is a technique used by web developers to overcome
the cross-domain restriction imposed by browser's same-origin policy. See the
[wikipedia page](https://en.wikipedia.org/wiki/JSONP) for detail.

**Q:** Describe event bubbling.  
**A:** W3C model: Any event taking place in the W3C event model is first captured
until it reaches the target element and then bubbles up again.
> Netscape said that the event on outer element takes place first. This is called event capturing.
> Microsoft maintained that the event on inner element takes precedence. This is called event bubbling.

**Q:** What's the difference between an attribute and a property?  
**A:** Again, it's a [mess](http://stackoverflow.com/questions/5874652/prop-vs-attr/5884994#5884994).

**Q:** Difference between document load event and document DOMContentLoaded event?  
**A:** From [MDN](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded):
>The DOMContentLoaded event is fired when the initial HTML document has been
completely loaded and parsed, without waiting for stylesheets, images, and
subframes to finish loading. A very different event - load - should be used only
to detect a fully-loaded page. It is an incredibly popular mistake to use load where
DOMContentLoaded would be much more appropriate, so be cautious.

**Q:** Explain the same-origin policy with regards to JavaScript.  
**A:** CORS and `window.postMessage`.

**Q:** Explain the differences on the usage of foo between function foo() {} and var foo = function() {}  
**A:** The difference is obvious but there are subtle semantic difference between
these two: function declaration hoisted so you can use it before declaring.

## Performance Questions

**Q:** What are some ways you may improve your website's scrolling performance?  
**A:** Old tricks: Debouncing, requestAnimationFrame, avoid expansive styles, avoid reflows
and repaints, render only part of the data. There're two new APIs to help with this
in new Chrome, read [here](http://blog.chromium.org/2016/05/new-apis-to-help-developers-improve.html):
passive event listeners and Intersection Observer.

## Network Questions

**Q:** Traditionally, why has it been better to serve site assets from multiple domains?  
**A:** CDN and geolocation. Another reason is that web browsers are restricted to
download several items from one server at once, so the more you use resources hosted on external
domains the faster a page loads.

**Q:** What are the differences between Long-Polling, Websockets and Server-Sent Events?  
**A:** Polling is for continuous events while the others better for discrete events.
Server-sent events is EventSource. See this [great doc](https://github.com/kriskowal/gtor).

**Q:** Explain common request and response headers.  
**A:** The [full list of headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html).
`X-Frame-Options` is used to control the rendering of iframe in page. An
[ETag](https://en.wikipedia.org/wiki/HTTP_ETag) is
an opaque identifier assigned by a web server to a specific version of a resource
found at a URL. If the resource representation at that URL ever changes, a new and
different ETag is assigned. Used in this manner ETags are similar to fingerprints,
and they can be quickly compared to determine whether two representations of a
resource are the same.
