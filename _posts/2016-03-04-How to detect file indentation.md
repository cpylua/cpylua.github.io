---
title: How to Detect File Indentation
permalink: detect-file-indentation
date: 2016-03-04
---

# How to detect file indentation

Came across this [link](https://medium.com/firefox-developer-tools/detecting-code-indentation-eff3ed0fb56b#.iql70ji0u).
Here are some methods mentioned in the post. Here is the note I extracted from
the original post. Credits to original author.

## Greatest common divisor

The greatest common divisor (gcd) is a math concept. The gcd of [4, 6, 8, 10] is
2. A file with indent widths of [4, 6, 8, 10] would also clearly be a 2-space
indented file. Things go haywire when you get any outlier indents of say, 37
though. The gcd of [4, 6, 8, 37] is 1.

Multi-line comments really throw this one off, so for practicality you have to
throw out odd numbers.

## Minimum width

The other common algorithm I saw was a simple one: just take the smallest
indentation width you see in the file.

This can also trip up a bit on multi-line comments.

## Comparing lines

Randomly scan a line and the lines follows it until hit a different indent. So
if a line is indented by 10 spaces, and the previous by 8, one more vote would be
added for 2-space indentation. Repeat.

Can handle multi-line comments.

## Neural network

Modeling and training... Omitted.
