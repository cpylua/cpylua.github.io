---
title: On Binary Search
permalink: on-binary-search
date: 2010-11-11
---

# Binary search

在计算机科学领域中，二分搜索经常用来在一个以排序的数组中查找一个元素，相信只要是搞计算机的一定写过这个算法的某种实现。下面是两段来自JDK的源码，第一段来自JDK1.5.0_22，第二段来自JDK1.6.0_22。

    // JDK1.5.0_22  [java.util.Array]
    public static int binarySearch(long[] a, long key) {
        int low = 0;
        int high = a.length-1;

        while (low <= high) {
            int mid = (low + high) >> 1;
            long midVal = a[mid];

            if (midVal < key)
                low = mid + 1;
            else if (midVal > key)
                high = mid - 1;
            else
                return mid; // key found
        }
        return -(low + 1);  // key not found.
    }

    // JDK1.6.0_22 [java.util.Array]
    private static int binarySearch0(long[] a, int fromIndex, int toIndex, long key) {
        int low = fromIndex;
        int high = toIndex - 1;

        while (low <= high) {
            int mid = (low + high) >>> 1;
            long midVal = a[mid];

            if (midVal < key)
                low = mid + 1;
            else if (midVal > key)
                high = mid - 1;
            else
                return mid; // key found
        }
        return -(low + 1);  // key not found.
    }

我们不考虑上面两段代码中的函数原型问题，这里只看他们对二分查找的实现。你看出有什么不同了吗（请仔细想想在往下看）？

真正的不同点就在一行代码上:

    int mid = (low + high) >> 1;    // JDK1.5
    int mid = (low + high) >>> 1;   // JDK1.6

一个是有符号左移，一个是无符号左移。前者可能导致整数溢出，比如说`low=0x7FFFFFFE, high=0x1000`，在JDK1.5中`mid=0xC00007FF`，这是个很小的负数，但这明显不是我们要的结果，我们期望的结果是`mid=0x400007FF`。这个BUG直接导致了JDK 6之前的`binarySearch`无法正确处理大数组的情况。这个BUG从JDK1.2到JDK1.5一直存在，直到JDK1.6才被[修复][jdk6-bug-fix]。在这个BUG描述的最后写着这么一句：

> "Can't even compute average of two ints" is pretty embarrassing.

这确实令人很为难，计算两个整数的平均数还要这么大费周章，但是在当今的互联网蓬勃发展的环境下，软件的安全性正得到越来越大的重视，而整数溢出是一个非常常见的被利用的漏洞。
像`binarySearch`这么简单的函数，一共12行，都无法保证代码完全正确。

代码的文档注释上有一行写着`@author Josh Bloch`，他是谁呢？Chief Java Architect at Google！针对JDK中的这个BUG，Bloch写过一篇文章。Bloch在文章中的一个感慨就是我们天天都在写或多或少的复杂代码，但要写出BUG-free的代码几乎是不可能的。

最后来看看微软crt里bsearch的实现，微软crt的实现采用一种不同的实现方式。在这种实现中没有low和high，取而代之的是midpoint和width，在每次迭代中，midpoint都会被+或者-width，与此同时width取原值的一半。正如Knuth在他的The Art of Computer Programming, Volume 3: Sorting and Searching中写道的：

> "It is possible to do this, but only if extreme care is paid to the details"

这种方式实现起来必须非常小心，稍不注意就会出现问题，不像上面提到的JDK中的实现方式那样直观，读了下面的代码相信你会有这个体会的。这个函数中的指针操作是很容易出错的，而且这个函数不存在上述JDK1.6之前版本中的整数溢出BUG，因为指针是无符号整数。

    void * __fileDECL bsearch (
        REG4 const void *key,
        const void *base,
        size_t num,
        size_t width,
        int (__fileDECL *compare)(const void *, const void *)
        )
    {
        REG1 char *lo = (char *)base;
        REG2 char *hi = (char *)base + (num - 1) * width;
        REG3 char *mid;
        size_t half;
        int result;

        /* validation section */
        _VALIDATE_RETURN(base != NULL || num == 0, EINVAL, NULL);
        _VALIDATE_RETURN(width > 0, EINVAL, NULL);
        _VALIDATE_RETURN(compare != NULL, EINVAL, NULL);
        /*
        We allow a NULL key here because it breaks some older code and because we do not
        dereference this ourselves so we can't be sure that it's a problem for the comparison function
        */
        while (lo <= hi)
        {
            if ((half = num / 2) != 0)
            {
                mid = lo + (num & 1 ? half : (half - 1)) * width;
                if (!(result = __COMPARE(context, key, mid)))
                    return(mid);
                else if (result < 0)
                {
                    hi = mid - width;
                    num = num & 1 ? half : half-1;
                }
                else
                {
                    lo = mid + width;
                    num = half;
                }
            }
            else if (num)
                return (__COMPARE(context, key, lo) ? NULL : lo);
            else
                break;
        }
        return NULL;
    }

**Update[11/28/2010]:**  
Programming Pearls 5.6节有这么一句话：

> I'd be pretty surprised if a logic bug showed up in this C code. I wouldn't be shocked to find many other kinds of bugs, though.

这么看来，本文描述的这个BUG其实并不会让老爷子大吃一惊。

[jdk6-bug-fix]: http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=5045582 "(coll) binarySearch() fails for size larger than 1<<30"
