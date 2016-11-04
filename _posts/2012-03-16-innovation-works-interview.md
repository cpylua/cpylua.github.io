---
title: Interview at Innovation Works
permalink: interview-at-innovation-works
date: 2012-03-16
---

# Interview at Innovation Works

求1...n的正整数中1的个数，例如：

    f(1) = 1, f(10) = 2, f(11) = 4, f(20) = 12

最简单的算法是对于每个数x，判断x的每一位是不是1，时间复杂度是O(nlogn)。
面试的时候有点紧张，O(n)的算法没写出来。

下面这个算法时间复杂度O(n)，缺点是空间复杂度也是O(n)。
思路是缓存已经算过得数字，计算x中1的个数的时候只需要判断x的个位是不是1，剩余的高位查表得到。

    def f(n):
        cache = [0]
        cnt = 0
        for i in xrange(1, n+1):
            remainder = i % 10
            quotient = i / 10
            m = cache[quotient]
            if remainder == 1:
                m = m + 1
            cache.append(m)
            cnt = cnt + m
        return cnt

**Update 2012/05/13:**  
听说《编程之美》上这个题，上面给了一个O(1)的算法。我还没有去看过。

**Update 2012/10/15:**  
经过6轮面试，最终创新工厂给了我Offer，由于种种原因，最终没有选择创新工厂。整个招聘环节要求比较严格，是我见过的实习生招聘中最严格一个。
