---
title: C sequence point explained
permalink: c-sequence-point-explained
date: 2013-07-27
---

# C sequence point explained

*Extracted from [comp.lang.c FAQ list, Question 3.8](http://c-faq.com/expr/seqpoints.html)*


A sequence point is a point in time at which the dust has settled and all side
effects which have been seen so far are guaranteed to be complete. The sequence
points listed in the C standard are:

1. at the end of the evaluation of a full expression (a full expression is an
expression statement, or any other expression which is not a subexpression
within any larger expression);

2. at the `||`, `&&`, `?:`, and comma operators; and

3. at a function call (after the evaluation of all the arguments, and just
before the actual call).

The Standard states that
> Between the previous and next sequence point an object shall have its stored
> value modified at most once by the evaluation of an expression. Furthermore,
> the prior value shall be accessed only to determine the value to be stored.

These two rather opaque sentences say several things. First, they talk about
operations bounded by the *previous and next sequence points*; such operations
usually correspond to full expressions. (In an expression statement, the
*next sequence point* is usually at the terminating semicolon, and the
*previous sequence point* is at the end of the previous statement. An expression
may also contain intermediate sequence points, as listed above.)

The first sentence rules out both the examples

	i++ * i++
and

	i = i++

`i` has its value modified twice within the expression, i.e. between sequence
points. If we were to write a similar expression which did have an internal
sequence point, such as

    i++ && i++
it would be well-defined, if questionably useful.

The second sentence can be quite difficult to understand. It turns out that
it disallows code like

	a[i] = i++
Actually, the other expressions we've been discussing are in violation of the
second sentence, as well. To see why, let's first look more carefully at what
the Standard is trying to allow and disallow.

Clearly, expressions like

	a = b
and

	c = d + e
which read some values and use them to write others, are well-defined and legal.
Clearly, expressions like

    i = i++
which modify the same value twice are abominations which needn't be allowed
(or in any case, needn't be well-defined, i.e. we don't have to figure out a way
to say what they do, and compilers don't have to support them). Expressions like
these are disallowed by the first sentence.

It's also clear that we'd like to disallow expressions like

	a[i] = i++
which modify `i` and use it along the way, but not disallow expressions like

    i = i + 1
which use and modify `i` but only modify it later when it's reasonably easy to
ensure that the final store of the final value (into i, in this case) doesn't
interfere with the earlier accesses.

And that's what the second sentence says: if an object is written to within a
full expression, any and all accesses to it within the same expression must be
directly involved in the computation of the value to be written. This rule
effectively constrains legal expressions to those in which the accesses
demonstrably precede the modification. For example, the old standby `i = i + 1`
is allowed, because the access of `i` is used to determine `i`'s final value.
The example

	a[i] = i++
is disallowed because one of the accesses of `i` (the one in `a[i]`) has nothing
to do with the value which ends up being stored in `i` (which happens over in `i++`),
and so there's no good way to define--either for our understanding or the compiler's
--whether the access should take place before or after the incremented value is
stored. Since there's no good way to define it, the Standard declares that it is
undefined, and that portable programs simply must not use such constructs.

The easy way?
-----------

If you steer clear of expressions which don't have reasonably obvious interpretations,
for the most part you'll steer clear of the undefined ones, too. (Of course,
*reasonably obvious* means different things to different people. This section works
as long as you agree that `a[i] = i++` and `i = i++` are not *easonably obvious.*)

To be a bit more precise, here are some simpler rules which, though slightly more
conservative than the ones in the Standard, will help to make sure that your code is
*reasonably obvious* and equally understandable to both the compiler and your fellow
programmers:

1. Make sure that each expression modifies at most one object. By *object* we mean
either a simple variable, or a cell of an array, or the location pointed to by a pointer
(e.g. `*p`). A *modification* is either simple assignment with the = operator, or a
compound assignment with an operator like `+=`, `-=`, or `*=`, or an increment or
decrement with `++` or `--` (in either pre or post forms).

2. If an object (as defined above) appears more than once in an expression, and is the
object modified in the expression, make sure that all appearances of the object
which fetch its value participate in the computation of the new value which is stored.
This rule allows the expression

    ```c
    i = i + 1
    ```
because although the object `i` appears twice and is modified, the appearance (on the
right-hand side) which fetches `i`'s old value is used to compute `i`'s new value.

3. If you want to break rule 1, make sure that the several objects being modified are
distinctly different, and try to limit yourself to two or at most three modifications,
and of a style matching those of the following examples. (Also, make sure that you
continue to follow rule 2 for each object modified.) The expression

    ```c
    c = *p++
    ```
is allowed under this rule, because the two objects modified (`c` and `p`) are distinct.
The expression

    ```c
    *p++ = c
    ```
is also allowed, because `p` and `*p` (i.e. `p` itself and what it points to) are both
modified but are almost certainly distinct. Similarly, both

    ```c
    c = a[i++]
    ```
and

    ```c
    a[i++] = c
    ```
are allowed, because `c`, `i`, and `a[i]` are presumably all distinct. Finally,
expressions like

    ```c
    *p++ = *q++
    ```
and

    ```c
    a[i++] = b[j++]
    ```
in which three things are modified (`p`, `q`, and `*p` in the first expression, and
`i`, `j`, and `a[i]` in the second), are allowed if all three objects are distinct,
i.e. only if two different pointers `p` and `q` or two different array indices `i`
and `j` are used.

4. You may also break rule 1 or 2 as long as you interpose a defined sequence point
operator between the two modifications, or between the modification and the access.
The expression

    ```c
    (c = getchar()) != EOF && c != '\n'
    ```
(commonly seen in a while loop while reading a line) is legal because the second access
of the variable `c` occurs after the sequence point implied by `&&`. (Without the
sequence point, the expression would be illegal because the access of `c` while
comparing it to `'\n'` on the right does not *determine the value to be stored* on
the left.)
