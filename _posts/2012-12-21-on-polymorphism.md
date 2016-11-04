---
title: On Understanding Types, Data Abstraction and Polymorphism
permalink: types-data-abstraction-polymorphism
date: 2012-12-21
---

# On Understanding Types, Data Abstraction and Polymorphism

This is my notes about [On Understanding Types, Data Abstraction and Polymorhpism](http://lucacardelli.name/Papers/OnUnderstanding.A4.pdf).

Why types are needed in programming languages?
---------

From *untyped* universes to *monomorphic* and then *polymorphic* type systems.

Here are some untyped universes:

+ Bit string in computer memory
+ S-expressions in pure Lisp
+ λ-expressions in lambda calculus
+ Sets in set theory

Types arise informally in any domain to categorize objects according to their usage and behavior. Untyped universes of computational objects decompose naturally into subsets with uniform behaviors. Sets of objects with uniform behaviors may be named and referred to as types.

Types impose constraints which help to enforce correctness.

Programming languages in which the type of every expression can be determined by static program analysis are said to be *statically typed*.

Languages in which  all expressions are type consistent are called *strongly typed* languages.

If a language is strongly typed its compiler can guarantee that the programs it accepts will execute without type error.

Kinds of polymorphism
-----------

*Monomorphic*: Every value an variable can be interpreted to be one and only one type.  
*Polymorphic*: Some values and expressions may have more than one type.

Monomorphic languages constraint objects to have just one behavior. It is too restrictive in sense of expressive power.

Polymorphism:

+ Universal
    - Parametric
    - Inclusion
+ Ad-hoc
    - Overloading
    - Coercion

In terms of implementation, a universally polymorphic function will execute the *same* code for arguments of any admissible type, while an ad-hoc polymorphic function may execute *different* code for each type of argument.

*Overloading* is a purely syntactic way of using the same name for different functions.  
*Coercion* allows the user to omit semantically necessary type conversions. It's essentially a form of abbreviation which may reduce program size and improve readability. In practice, it causes more trouble than doing any good.  
Both overloading and coercion can be viewed as syntactic sugars.

*Subtyping* is an instance of inclusion polymorphism.

The evolution of types in programming languages
--------

+ Fortran distinguishes between integers and floating-point numbers
+ Algol 60 is the first significant language to have an explicit notion of type and compile time type checking
+ PL/I, Pascal, Algol 68 pushed this idea further
+ *Object* as a formal concept in programming was first introduced by Simula 67
+ Smalltalk introduced the term *Object-oriented programming* to represent pervasive use of objects and messages as the basis for computation
+ Modula-2 was the first widespread language to use modularization as a major structuring principle
+ ML introduced the notion of parametric polymorphism in programming language

Universal quantification yields *generic types* while existential quantification yields *abstract data types*. When these two notions are combined we obtain *parametric data abstractions*. Bounded quantification realizes *type inheritance*.

The discussion about these quantifications and their relation to programming languages are very enlightening.

Conclusions
---------

The expressive argumented λ-calculus can model type systems in real programming languages. We gain an understanding of the abstract properties of type system and data abstraction methods independent of programming language.
