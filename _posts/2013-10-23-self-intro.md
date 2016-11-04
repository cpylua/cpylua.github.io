---
title: Self Introduction
permalink: self-intro
date: 2013-10-23
published: false
---

Who Am I?
---------

I'm a graduate student from Nanjing University of Science & Technology. I have years
of experiences with practical languages, like C, Python and Java. I have used these
languages in several projects. I'm also highly interested in
functional programming languages and the theory they build upon. Functional languages
give me a new perspective on how programs should be contructed. I wrote my own feature
complete Scheme interpreter in C. It can run most of the codes in the SICP(structure
and interpretation of computer programs) book. I'm also interested in data stuctures
and algorithm design, I do programming exercises time to time.

I like to read books like Programming Pearls, The Art of UNIX Programming, The Practice of
Programming, Pearls of functional algorithm design and so on. Most of the books are
rather old but the insights inside the books are still valuable.

I read reddit and hacker news alomost everyday to keep myself up with new technologies.
I believe in the Unix philosophy and have enthusiasm in open-source culture.

I worked at Mircosoft and Taobao as an intern. I like to do side projects for fun.

Academy of Agriculture Science, project management platform

Chinese Academy of Science, apparatus management platform


Internship
----------

### Microsoft

I worked at Microsoft as an intern last summer. I helped to build a web-based feature
recommendation system at Display Ads. I was responsible for the web UI and feature
visualization. I hava to visualize the relationship betweeen every feature and there
are thousands of features. My mentor suggested to use Self-organizong map for this.
But my experiment showed it runs too slow and doesn't yield a satisfying result. So
I was on my own. I did some research and realized it was very difficult to accomplish
an accurate visualization with so many constraints. What's more, it has to be fast.

Finally I decided to give a try to fored-based layout. Force-based layout assigns forces
among the set of edges and the set of nodes of the graph. Typically, spring-like
attractive forces based on Hooke's law are used to attract pairs of endpoints of the
graph's edges towards each other, while simultaneously repulsive forces like those of
electrically charged particles based on Coulomb's law are used to separate all pairs of nodes.

It can run in browser incrementally, it is interactive, and with careful implementation
it can run really fast. That's all I wanted and it didn't let me down. The result
is quite impressive for typical feature set.


### Taobao.com

I was in the Ali Wangwang Seller edition team. I implemented an automatic performance test
module. It does operations automatically, such as sending messages, while gathering elapsed time,
CPU usage, memory usage and so on. Later I improved some features like Help & Feadback,
unread message box. Before I leave, I was involed in implementing the plugin system.
The plugin system allows third-parties to develop new features for Ali Wangwang using
our SDK.


### jsvenn

While working on the feature recommentation system at Microsoft, I need to draw Venn
diagrams. Google provides a cool API for drawing Venn diagrams, but it was provided as
a web service, it's impossible to use it offline. So I wrote my own drawing library
with Javascript and HTML5 canvas. It can handle 2-set and 3-set venn diagrams using
circles. Larger set of venn diagrams using circles are impossible. But that's all we
need.


### Scheme Interpreter

It's a feature complete Scheme interpreter written in C, compatible with R5RS(one of
the many standards of the Scheme language). I has a REPL, a working mark-and-sweep
garbage collector and a standard library. Macros and continuations are implemented.
So we can do crazy thing with it. It was a joyful journey to write a Lisp, I thought
it would let me have a thorough understanding of Lisp. But I realized it's just a start
after I read Lisp in Small Pieces.

I choose mark-and-sweep because it is easy to implement and works well in a small
interpreter.


### AI Competition Platform

It's acutally a game written with DirectX. It's based on the Quiditch game in Harry
Potter. It's 2 vs. 2 game, players write codes to win the game.


### Unix Philosophy

1. Rule of Modularity: Write simple parts connected by clean interfaces.
2. Rule of Clarity: Clarity is better than cleverness.
3. Rule of Composition: Design programs to be connected to other programs.
4. Rule of Separation: Separate policy from mechanism; separate interfaces from engines.
5. Rule of Simplicity: Design for simplicity; add complexity only where you must.
6. Rule of Parsimony: Write a big program only when it is clear dy demonstration that
nothing else will do.
7. Rule of Transparency: Design for visibility to make inspection and debugging easier.
8. Rule of Robustness: Robustness is the child of transparency and simplicity.
9. Rule of Representation: Fold knowledge into data so program logic can be stupid
and robust.
10. Rule of Least Surprise: In interface design, always do the least surprising thing.
11. Rule of Silence: When a program has nothing surprising to say, it should say nothing.
12. Rule of Repair: When you must fail, fail noisily and as soon as possible.
13. Rule of Economy: Programmer time is expensive; conserve it in preference to machine
time.
14. Rule of Generation: Avoid hand-hacking; write programs to write programs when you can.
15. Rule of Optimization: Prototype before polishing. Get it working before you optimize it.
16. Rule of Diversity: Distrust all claims for "one true way".
17. Rule of Extensibility: Design for the future, because it will be here sooner than
you think.
18. K.I.S.S: Keep It Simple, Stupid!
