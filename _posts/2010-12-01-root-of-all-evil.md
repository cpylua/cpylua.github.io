---
title: A Story of qsort
permalink: qsort
date: 2010-12-01
---

# A story of qsort

C语言的库函数`qsort`想必都不陌生，这个函数背后的思想是机制和策略分离，你必须告诉它你想要它如何比较两个元素的大小。先来看函数原型：

    void qsort(void *base, size_t nel, size_t width, int (*compar)(const void *, const void *));

`compar`是一个函数指针，`qsort`通过它就能知道怎么去比较两个元素的大小了。考虑最简单的情形，需要对一系列整数(int)排序，你会怎么写这个`compar`呢？

下面这个`compar`函数是我在cplusplus.com网站上找到的，这是比较常见的一种写法。

    int compare (const void * a, const void * b) {
      return ( *(int*)a - *(int*)b );
    }

我当初学C语言的时候，第一次用`qsort`时却不是这么写的。

    int compare (const void * a, const void * b) {
        int ia = *(int*)a;
        int ib = *(int*)b;

        if (ia < ib) return -1;
        else if (ia > ib) return 1;
        else return 0;
    }

后来，别人写的代码看得稍稍多了些，就发现自己怎么那么蠢的呢？！`qsort`只要求`compar`在第一个参数小于第二个参数时返回小于0的值；在第一个参数大于第二个参数时返回大于0的值；在第一个参数等于第二个参数时返回0，我为什么一定要返回-1，0，1呢？我完全可以优化这个函数，消除不必要的分支语句，这样不仅代码简单了（只有一行！），而且由于消除了分支语句，CPU不会预测分支失败，这可以提高代码的运行速度。这就是一举两得的完美改进！自此以后，我只要遇到类似的情况，都会问自己：我能不能不用分支语句做呢？

但问题是：这样做真的对吗？

现在的计算机体系结构基本上都是用2的补码来表示有符号整数的，这种数值系统最大的优点在于加减法电路不需要检查操作数的符号来判断是做加法还是减法，也就是说加法和减法对硬件来说是一回事。我在之前的一篇文章中提到了整数溢出在计算平均数时会导致不正确的结果，由于加法和减法在硬件层次上没有任何区别，很明显，减法同样会导致整数溢出。
回到上面的问题上来，如果a或b指向的整数足够大，`*(int*)a - *(int*)b`必将溢出，而溢出会导致符号位丢失。假如你没有意识到这个问题，也许你会花上一上午的时间去调试为什么你写的代码认为2147483647比-2147483648小。我以前常觉得自己不会在这种近乎“弱智”的问题上犯错，可事实证明，正是这些微不足道的地方常常耗费了我非常多的精力去调试。我觉得今后的高级语言是不是应该内置对任意精度整数的支持，就像Python, Common Lisp和Scheme等等，这样基本上可以杜绝整数溢出的问题。

Knuth曾经说过：

>"We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil"

在我们这个CPU性能越来越强大的时代，通常情况下，代码不必在这些小细节上考虑优化，不负责任的说就是硬件的升级会弥补这些微不足道的性能损失（好吧，如果你是性能狂，请无视）。

**Update 2011.8.29：**  
[这篇文章][old-bug]中讲到的BUG和本文所说的不是同一个问题，但是它说明了一点，其实有时你可以用“减法”来给出两个值的大小关系，前提是你仅仅依赖它们的是否相等。任何其他的场景都不应该使用“减法”去优化比较大小。

[old-bug]: http://www.azulsystems.com/blog/cliff/2011-08-28-just-fixed-a-20-year-old-bug "Just fixed a 20 year old bug"
