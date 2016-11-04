---
title: Duff's Device
permalink: duffs-device
date: 2010-08-11
---

# Duff's Device

之前读过一些Duff's Device的介绍，一直觉得它实现得非常巧妙。
今天看见作者的原始邮件，正如原文所说的：

> "The point of the device is to express general loop unrolling directly in C"

我一直**误解**了Duff's Device的意义。
虽然很喜欢类似的coding trick，但一直没在实际项目中使用过。自己看也许
没什么问题，给别人看就难说。循环展开是个很常见的编译器优化，
大多数编译器都会在合适的时候自动对代码做这个优化。

附上[邮件原文](http://www.lysator.liu.se/c/duffs-device.html "Tom Duff on Duff's Device")。
