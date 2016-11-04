---
title: Python Meta-decorator
permalink: python-meta-decorator
date: 2012-05-13
---

# Python Meta-decorator

上周在CS212上Peter提到了decorator的decorator，Peter给了一个递归的实现。初看上去可能比较绕，个人觉得关键是搞清楚变量的作用域。非常有意思的是，这个递归的meta-decorator的不动点就是它自身。

    decorator = decorator(decorator)(decorator)

在这个赋值后，调用任意次`decorator(decorator)`，decorator的效果都不会变化了。

第二个decorator实现是Peter在论坛上提到的：不是简单复制文档字符串，而是修饰原来的文档字符串，要达到这个效果就只能多一层封装了。

    import functools

    def decorator(d):
        "Make function d a decorator: d wraps a function fn."
        def _d(fn):
            return functools.update_wrapper(d(fn), fn)
        return _d
    decorator = decorator(decorator)(decorator)

    def decorator(annotation):
        "Make function d a decorator with updated doc string: d wraps a function fn."
        def inner_decorator(d):
            def _d(fn):
                f = functools.update_wrapper(d(fn), fn)
                f.__doc__ += ' (%s)' % annotation
                return f
            functools.update_wrapper(_d, d)
            return _d
        functools.update_wrapper(inner_decorator, decorator)
        return inner_decorator
