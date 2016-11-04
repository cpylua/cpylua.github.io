---
title: Internship at Taobao.com
permalink: internship-taobao
date: 2012-03-04
---

# Internship at Taobao.com

*今天做简历，无意中翻到这个去年写的面试经历，干脆分享出来吧！在淘宝实习了三个月，第一次体验了大公司。在淘宝的日子挺有趣的，公司氛围也很好，最重要的是伙食也很好。*

三月底的时候同学找实习，好像在网上看见淘宝实习生招聘，就想去试试。吃完晚饭他说到这个事，问我去不去。我想还没去笔试过呢，不妨去玩玩。第二天在淘宝网上填写了简历。那时候不知道其实自己的简历写得不好，项目介绍里比较混乱，什么项目都有，重点不突出。这点主要是自己当时并没有想好要应聘那个职位，就随便挑了个研发的职位。虽然大家都说语言是浮云，但是面试的时候简历上写的就不是浮云了，别把自己一知半解的东西写在简历上。我简历上的项目C/C++，Java，Python的都有，要不是地方不够，我差点把C#做的项目也放上去。一面的时候给我惹了点小麻烦，这是后话。

大概是三月30或者31号去南大笔试的，人很多，几个教室一起考的，我所在的教室估计有400多号人。试卷 根据申请职位不同而不同，大多数人做的都是一样的，只有个别职位是另外的卷子。第一次笔试，卷子拿到手感觉厚厚的一叠，以为很多题目，其实不到20个。选择题和填空题都是基础题，主要是一些基本的数据结构和算法知识，比如树的遍历、二分查找、快排。有个填空题考了C语言的switch和break。只要基础扎实，这两部分基本上都没有问题。第三部分是大题，第一题感觉是智力题，三个人分汤的问题。第二个大题是最大子序列和问题，问的是“你觉得最快的算法”，不过基本上你觉得不是O(n)的话估计这题得分不会很高。我好像看错题目了，求了最大子序列和，题目要求把这个子序列求出来，当时傻逼了。第三个大题是开放性题目，要设计一个系统找网站中访问数最大的前100（记不清多少了，无所谓）个地址。考试时间一个小时，大概四十分钟做完的，等同学做完一起交卷就回学校了。等通知。

在四月中下旬的时候收到面试通知，27号早上去南大面试。那天去太早了，在南大树林里做了一个小时，把自我介绍背了十来遍。空身来到21舍，坐着等了半个多小时。一面首先自我介绍，我觉得他没听我自我介绍，只顾着看简历了，等他看得差不多，我也说的差不多了。之后开始问问题，主要是介绍做过的项目，一个个详细问了。因为我笔试时填了C/C++方向，他比较关注这方面的项目，对于我简历上几个Java项目兴趣不大，一笔带过。悲剧的是我面试准备的是Java，看了几天JVM、Collections和Concurrency包，最后无用，完全没看C/C++，我就跟他说我C++不是很熟，然后把自己对C的认识说了下，他也就没问我C++的问题。总之一面是比较轻松的，就是扯淡，展现自己做过的项目，能答上的就自信地多说些，不会的直接说。后来去了淘宝才知道，一面时的面试官就是部门的老大，阅人无数啊，一天我跟他提到校招时他面过我，他完全没印象了。

等了差不多半个小时不到就开始二面，二面是技术面。首先还是自我介绍，当我还在想又要自我介绍时面试官就打断了我，直接开问，因为我说到了Lua。他就开始问Lua的问题，后来知道他对Lua是比较了解的，他说看过两遍源码，我当时一遍都没看完。我跟他说我就看了基本对象的实现，他就问了字符串和table的实现，我简单说了下，他挺满意的。接着问了个多线程的问题，老掉牙的问题，Mutex和CriticalSection的区别…这种问题太简单了，顺带还问了进程间通信的其他方法，我把Windows常用的罗列了出来，说到Io Completion Port时面试官就对我的回答很满意了。二面时间比较短，结束时面试官推荐我去学习Linux编程，我当时正在学，就把自己看得书跟他说了下，他说那本书挺好的。二面我感觉挺好，面试官也挺喜欢我。面完我觉得应该能上，就回学校等通知了。二面的面试官是核心系统的，erlang专家，搞并发的。

五一过后，面试结果就出来了，我没收到offer。意外的是5.6号淘宝打电话过来让我准备去杭州三面。我9号去杭州，10号早上面试。三面那天是阿里日，淘宝气氛非常好。三面还是技术面，先写了个strstr函数，我当时就觉得很变扭，面试官把函数原型给错了，应该是返回子串的指针，他要求返回下标，其实都一样啦，问题是他问我有没有用过这个函数，我说没用过，没好意思说他原型给错了。写代码当然写最保险的算法了，一般也是效率最差的算法，我觉得写对差算法比写不对好算法要好。之后问了写汇编的知识，用户态和内核态的切换，函数调用时的堆栈等等，这些我很在行，都回答的很好。最后压轴的是个算法题：给定一个大字符串S，判断一组字符串t1, t2, t3 … tn是否在S中出现。当时有点小紧张，居然忘了提KMP算法… 给了个suffix array的二分查找，但面试官觉得我的算法是错的，回去的路上我仔细理了下我的思路，其实我的算法是没问题的，不足是消耗空间大。我在这个问题上跟面试官纠缠了很久，最后他把答案告诉了我。临走前他让我多加强下算法和数据结构。这方面也确实是我的弱项。当天下午回南京，第二天收到淘宝offer。

之前网上听说淘宝是100+餐补/d，另外安排住宿，发给我的offer是200+26/d，另外安排住宿，不知道和三面有没有关系，因为很多人只要过了二面就拿到offer了。三面时面试官也跟我说安排三面的都是二面中表现优秀的同学。6月初去淘宝报道，祝自己一切顺利！