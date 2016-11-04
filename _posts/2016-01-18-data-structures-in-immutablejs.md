---
title: Data Structures in ImmutableJS
permalink: data-structures-in-immutablejs
date: 2016-01-18
---

# Data Structures in ImmutableJS

I will explain the underlying data structures used in ImmutableJS. Some
implementation details are also covered.

## A Quick Recap

Highlights:

- persistent
- structural sharing
- fast equality checking

Collections included:

- `List`
- `Stack`,
- `Map`, `OrderedMap`
- `Set`, `OrderedSet`
- `Record`,
- `Seq`(`IndexedSeq`, `KeyedSeq`, `SetSeq`), `Range`, `Repeat`
- utils: `fromJS`, `is`

## Seq, Iterable, Iterator

`Seq`, `Iterable` and `Operations` are like helpers, there're many common
operation factories in `Operations`, `Iterable` and `Seq` abstracts away the
iteration from various sequences. `Iterator` abstracts away the  ES6 Symbol.iterator.

Most operations share the same code, i.e. `Seq.filter` and `List.filter` are the
same code, the difference is in a function called `reify` which returns a
sequence/iterable based on current instance type. It controls whether the
operation is lazy or not.

ImmutableJS uses `Seq` heavily under the hood but users(developers like us)
don't use it much...

## Hash

`Hash` provides a way to hash common JavaScript values: number, string, boolean
and object. The hash function seems to return different values for objects with
same shape and value.

`hash({foo: 1}) !== hash({foo: 1})`

## is

The same-value algorithm in ImmutableJS. It is an extension of the ES6 `Map` and
`Set` algorithm.

- `NaN` is considered equal
- `-0` and `+0` are equal which is different from `Object.is`
- `valueOf`
- `equals` and `hashCode` just like Java, all Immutable collections implement
`equals` and `hashCode`.

Key equality of `Immutable.Map` and value equality of `Immutable.Set` are not
always the same as ES6 `Map` and `Set`.

## Range, Repeat

They are just utility classes implemented as a `Seq`, so they are lazy.

## Stack

Stack is implement as a single linked list with a head and a size field. A list
is an effient implementation of immutable stack since stack does not allow random
access.

## HAMT

The **Hash Array Mapped Trie (HAMT)** is based on the simple notion of hashing a
key and storing the key in a trie based on this hash value.

A **trie** is represented by a node and number of arcs leading to sub-tries and
each arc represents a member of an alphabet of possible alternatives.

An integer bit map is used to represent the existence of each of the 32 possible
arcs and an associated table contains pointers to the appropriate sub-tries or
terminal nodes. A one bit in the bit map represents a valid arc, while a zero an
empty arc. The pointers in the table are kept in sorted order and correspond to
the order of each one bit in the bit map.

Finding the arc for a symbol s, requires finding its corresponding bit in the bit
map and then counting the one bits below it in the map to compute an index into
the ordered sub-trie. [Population count or Hamming weight](http://www.hackersdelight.org/hdcodetxt/pop.c.txt).

*Search*: Compute a full 32 bit hash for the key, take the most significant t
bits and use them as an integer to index into the root hash table.

1. entry empty, fail
2. entry is a k/v pair, success if k is key else fail
3. sub-trie, take the next t bits as index and look into the bitmap, fail if the
bit is zero else `popCount` to get the entry array index and recurse.

*Insert*: The initial steps required to add a new key to the hash tree are identical
to the search.

- Either an empty position is discovered in the hash table or a sub-hash table
is found. Copy and add the new k/v pair
- Or the key will collide with an existing one, recurse with the next t bit.
Occasionally an entire 32 bit hash may be consumed and a new one must be computed
to differentiate the two keys. **NOTE**: ImmutableJS simple uses key comparison
in an array if it happens(HashCollisionNode). With a good hash function, this is
rare.

*Remove*: remember to merge sub-tree with only two entries to parent.

With lazy root hash table resizing and allocator optimization, all principle
operations can achieve
- `O(1)` time cost and having small bounded worst case times.
- `O(n)` space cost with a very small constant.

The `Map` in ImmutableJS is an implementation of HAMT, the same data structure
used in Clojure and Scala(*scah-lah*). Haskell also has a `HashMap` which uses HAMT.

**References**:
1. [Ideal Hash Trees](http://lampwww.epfl.ch/papers/idealhashtrees.pdf) by Bagwell
2. [Optimizing Hash-Array Mapped Tries for Fast and Lean Immutable JVM Collections](http://michael.steindorfer.name/publications/oopsla15.pdf) by Michael J. Steindorfer

## Map

Trie level size(alphabat size): 32(1 <<< 5)

Important fields:

- `size`
- `_root`, a pointer to the internal representation

The `Map` object you use is just a wrap around one of the several internal
representations with some additional convenient operations.

1. `ArrayMapNode`: `[[k, v]]`, array of key-value pairs. Copy on write.
2. `BitmapIndexedNode`: bitmap and an array of entries, using hash to get bit index.
3. `HashArrayMapNode`: an array of entries, using hash to get index.
4. `HashCollisionNode`: an array of entries with the same key hash.
5. `ValueNode`: a key-value pair, `entry[0]` is the key and `entry[1]` is the value.

We can divide these 5 node types into two categories:

- Leaf node: `ValueNode`, `ArrayMapNode` and `HashCollisionNode`
- Non-leaf node: `BitmapIndexedNode` and `HashArrayMapNode`

```
var SIZE = 32;
var MAX_ARRAY_MAP_SIZE = SIZE / 4;
var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
```

## List

Sparse list, supports negative indices(count from the end), fast operations on tail.

Fields:

- `size`
- `_root` tree root node
- `_tail` the last chunk of data(size <= 32)
- `_root` + `_tail` is the whole list, each element of `_root` and `_tail` is a
`VNode`, this is used to speedup operations at tail
- `_level` level in tree

If list size < 32, create a new leaf node, else insert each element one by one
into an empty list.

List reuses some functions in Map, like `removeIn`, `mergeIn`.

Operations at the head are also optimized, does not do a whole copy, instead add
a new node and fill it from end to start.

If you want a general purpose sequence, checkout finger tree(some kind of modified
2-3 tree), it's much more flexible.

## Set

Build on `Map` with value as map's key and `true` as the value(any other values
can be used). Some additional set operations are added, like `union` and `intersect`.

## OrderMap

A combination of `Map` and `List`. The map is for key lookup and the list is for
maitaining insertion order.

- get: `value = list.get(map.get(key))`
- set: `map.set(key, list.size); list.set(list.size, value)`

## OrderedSet

Same as Set, but built upon `OrderedMap`.

## fromJS

`fromJS` is expensive, it recursively converts a js object into a collection.
Do **NOT** use it just for accessing properties. Why do you use ImmutableJS in
the first place if you write to ImmutableJS but read from ordinary js object?

## Transient changes

Two fields are related to this feature:

- `__ownerID`
- `__altered`

If `__ownerID` exists, the collection is in transient mode. If it does not exist,
the collection is currently immutable. Operations create a new collection or do
in place modification based on these values.


## Further reading

[Purely Functional Data Structures](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=0ahUKEwj5wbTgurrKAhWDmZQKHavaDkAQFggqMAE&url=https%3A%2F%2Fwww.cs.cmu.edu%2F~rwh%2Ftheses%2Fokasaki.pdf&usg=AFQjCNHZVhfpH-1HCQ9TNyQGuQOrup4MnA&sig2=SgldoweM6xU0HbbNKilogQ) by Chris Okasaki, general techniques for designing functional data	 structures.

[Finger Trees: A Simple General-purpose Data Structure](http://www.staff.city.ac.uk/~ross/papers/FingerTree.html)
