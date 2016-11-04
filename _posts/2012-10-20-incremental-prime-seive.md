---
title: Incremental Prime Seive
permalink: incremental-prime-seive
date: 2012-10-20
---

# Incemental Prime Seive

Eratosthenes筛
---------------

一个数是素数，当且仅当它大于1并且它的约数只有1和它本身，素数在数论和现代密码学的地位非常重要。给定一个正整数n，判断它是否为素数，这称为素性测试。试除法（trial division）是最简单的素性测试方法：测试n是否为[2, ceil(sqrt(n))]中任一整数的倍数。使用试除法可以实现简单的素数生成器，但是效率比较低。另一类生成素数的算法称为筛算法（Sieves），历史最悠久的是Eratosthenes筛。下面是使用Eratosthenes筛生成不大于n的素数的算法：

1. 生成一个包含[2, n]所有整数的数组
2. 令p等于2（第一个素数）
3. 将数组中所有属于集合p, 2p, 3p, 4p, ...的数标记为非素数
4. 找到数组中第一个大于p且未被标记的（素）数q，如果q不存在，算法结束；否则令p等于q，重复第3步

算法结束时，数组中没有被标记的数都是素数。第3步中的集合可以从p\*p开始，因为比p\*p小的倍数必定已经被标记过了。遗憾的是这个小优化对算法的时间复杂度没有实质影响。另一个优化是第1步中的初始数组可以只包含奇数和2，因为偶数肯定不是素数。这个优化可以扩展成初始数组中只包含2、3以及不能被2或3整除的数，不能被2或3整除的数只需从5开始交替地加2和4。这个优化可以一直扩展，但通常扩展到2-3-5-7就足够了，再多作用就不那么明显了。这个优化和第一个优化不同，它可以带来数倍的性能提升。

增量Eratosthenes筛
------------------

Eratosthenes筛算法需要给定素数所在的范围，在事先并不知道素数范围的场合这个算法就不适用了。从这个角度而言，试除法倒是比Eratosthenes筛更加通用，但是其效率对稍大一些的素数而言让人难以接受。

上文给出的Eratosthenes筛算法在第3步中一次性将所有p的倍数剔除，提前做了很多暂时不需要的工作。如果能够“按需”剔除p的倍数，算法甚至能够和试除法一样无限生成素数。为了做到按需剔除，需要为每个素数p保存一个“迭代器”，“迭代器”指明下一个需要剔除的p的倍数。举例而言，普通的Eratosthenes筛算法会一次性将所有19的倍数剔除（这种方式在不知道素数范围时没法实现），新算法只保存19的一个“迭代器”：{..., 19 361, ...}。当需要测试361的素性时，查找发现361是19的倍数。这说明361不是素数，同时我们将19的“迭代器”修改成下一个倍数380。另一方面，新的增量生成算法和普通Eratosthenes筛算法一样都是按序递增生成素数，利用这个特点可以优化上例中的查找过程。

1. 候选数和所有“迭代器”的最小值相等，则候选数是合数，递增最小“迭代器”
2. 候选数p小于所有“迭代器”的最小值，则候选数是素数，为p增加一个新的“迭代器”，初始值为sqr(p)
3. 候选数大于所有“迭代器”的最小值，则候选数可能还未被标记，递增最小“迭代器”，然后重复查找过程

最小堆是最适合上述过程的数据结构。下面是按照上述过程实现的增量Eratosthenes筛。

    ;;; incremental prime sieve
    (defn prime-step-incr [pq candidate]
      (loop [q pq]
        (let [[key val] (peek q) q* (pop q)]
          (case (compare val candidate)
            -1 (recur (assoc q* key (+ val key)))
            0 [nil (assoc q* key (+ val key))]
            1 [candidate (assoc q candidate (* candidate candidate))]))))

    (defn prime-sieve-incr []
      (let [step (fn step [queue candidate]
                   (let [[prime q] (prime-step-incr queue candidate)]
                     (if prime
                       (cons prime (lazy-seq (step q (inc candidate))))
                       (recur q (inc candidate)))))
            pq (priority-map 2 4)]
        (cons 2 (lazy-seq (step pq 3)))))

    (def primes (prime-sieve-incr))

`primes`是一个lazy sequence，`(take n primes)`可以按需获取前n个素数。

优化增量Eratosthenes筛
--------------------

在介绍Eratosthenes筛时提到了两个优化，上文给出的实现已经包含第一个优化，下面讨论如何实现第二个优化。这个优化的实质是跳过小素数的倍数，减小问题的解空间。跳过2和3的倍数可以去掉大约2/3的合数，而跳过2，3，5，7的倍数可以去掉大约77%的合数。这在普通的Eratosthenes筛算法中可以带来几倍的性能提升。将上述思想运用到增量Eratosthenes筛算法时我并未得到预期的性能提升。

    (defn prime-wheels [& primes]
      "Return a list of differences for successive prime candidates.
       Candidates exclude multiples of input primes."
      (let [product (apply * primes)
            n (* product 2)
            numbers (range (inc (apply max primes)) (inc n))]
        (loop [p (first primes) ps (rest primes) ws numbers]
          (let [removed (remove #(zero? (rem % p)) ws)]
            (if (empty? ps)
              (let [cnt (count removed)
                    size (/ (+ cnt 3) 2)
                    roll (take size removed)
                    large (drop 1 roll)
                    small (drop-last 1 roll)
                    ws (map - large small)]
                (if (empty? ws) (list 2) ws))
              (recur (first ps) (rest ps) removed))))))

    (defn prime-sieve-wheels
      [start & primes]
      (let [step (fn step [queue candidate wheels]
                  (let [[prime q] (prime-step-incr queue candidate)
                        next-candidate (+ candidate (first wheels))
                        new-wheels (rest wheels)]
                    (if prime
                      (cons prime
                            (lazy-seq (step q next-candidate new-wheels)))
                      (recur q next-candidate new-wheels))))]
        (let [wheels (cycle (apply prime-wheels primes))
              iterators (mapcat #(vector % (* % %)) primes)
              pq (apply priority-map iterators)]
          (concat primes
                  (lazy-seq (step pq start wheels))))))

    (def primes-with-wheels (prime-sieve-wheels 11 2 3 5 7))

以上代码实际运行时确实跳过了不少合数，但是运行时间却和没有wheel优化的代码差不多，这是因为**跳过合数不会减少“迭代器”最小堆的操作次数**。代码的瓶颈实际上在递增“迭代器”这个操作上，假如能够将“迭代器”相邻的几次递增合并起来，就能够得到预期的性能提升。

不难发现，“迭代器”总是它对应素数的整数倍。假设候选素数是2开始的自然数列，那么素数p的“迭代器”就是一个首项为sqr(p)，公差为p的等差数列。如果候选数列跳过偶数，则素数p的最优“迭代器”应该是首项为sqr(p)，公差为2p的等差数列。对于复杂的候选数列，素数p的最优“迭代器”不是一个等差数列，但仍有规律可循。

这里直接给出这个规律：对于候选数列L，素数p的最优“迭代器”是p*Lp，其中Lp是L从p开始的子数列。

使用上述结论就可以减少“迭代器”最小堆的操作次数。下面是使用这个优化的实现。

    (defn make-iterator
      "return a lazy sequence of iterator values"
      [candidates]
      (let [p (first candidates)
            step (fn step [step-list]
                   (cons (* p (first step-list))
                         (lazy-seq (step (rest step-list)))))]
        (step candidates)))

    (defn make-priority-queue
      "return a priority map with a custom comparator for lazy sequence.
       The queue will never have equal items."
      []
      (priority-map-by
       (comparator (fn [x y]
                     (let [result (compare (first x) (first y))]
                       (if (zero? result)
                         (< (second x) (second y))
                         (= result -1)))))))

    (defn prime-sieve-wheels
      "candidates must be a sequence starting with 2"
      [candidates]
      (let [queue (make-priority-queue)
            queue (assoc queue
                    (first candidates) (make-iterator candidates))
            step (fn step [q cs]
                   (let [[k iter] (peek q)
                         v (first iter)
                         c (first cs)]
                     (case (compare c v)
                       -1 (cons c (lazy-seq
                                   (step (assoc q c (make-iterator cs)) (rest cs))))
                       0 (recur (assoc (pop q) k (rest iter)) (rest cs))
                       1 (recur (assoc (pop q) k (rest iter)) cs))))]
        (cons (first candidates)
              (step queue (rest candidates)))))

    (defn make-candidates [start & primes]
      (let [wheels (cycle (apply prime-wheels primes))
            step (fn step [c ws]
                   (cons c (lazy-seq (step (+ c (first ws)) (rest ws)))))]
        (concat primes (step start wheels))))

    (def primes-with-wheels
      (prime-sieve-wheels (make-candidates 11 2 3 5 7)))

以上实现在我的电脑上有1倍的性能提升。上述实现还有个优势：生成素数的代码对于任意候选数列是通用的，这一点在之前的实现中无法做到的。

后记
------

在实现最后给出的算法时，应谨慎对待最小堆中拥有相同当前值的“迭代器“。我使用Clojure的priority-map实现时遇到了“迭代器”被另一个素数的“迭代器”覆盖的BUG，这个BUG的元凶就是队列中有多个当前值相同的“迭代器”。这个BUG我花了几个小时才调试出来。

想要更详细地了解这个算法的朋友可以参考[这里][The-Genuine-Sieve-of-Eratosthenes]。


[The-Genuine-Sieve-of-Eratosthenes]: http://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf
