---
title: Objects in Lua
permalink: lua-objects
date: 2010-11-28
---

# Objects in Lua

Lua从一个实验室内部使用发展为一个在游戏行业中广泛使用的嵌入式脚本语言，最根本的原因在于Lua的设计
和实现。从1993年Lua诞生以及之后的一系列的改进都是遵从了几个Lua的重要原则：simple, efficient, portable, lightweight。

Lua是动态类型语言，也就是说类型是附加在值上的而不是变量上的。Lua有8中基本类型：nil, boolean,
number, string, table, function, userdata, thread。

```
    [lua.h]
    /*
    ** basic types
    */
    #define LUA_TNONE                 (-1)

    #define LUA_TNIL                    0
    #define LUA_TBOOLEAN                1
    #define LUA_TLIGHTUSERDATA          2
    #define LUA_TNUMBER                 3
    #define LUA_TSTRING                 4
    #define LUA_TTABLE                  5
    #define LUA_TFUNCTION               6
    #define LUA_TUSERDATA               7
    #define LUA_TTHREAD                 8
```

上面定义了10中类型，但是在Lua中正真可用的其实只有下面的9中，为什么会是9中呢？上面提到Lua只有8
中基本类型，细心的你可能已经发现了这里有两个长得差不多的家伙：`LUA_TLIGHTUSERDATA`和`LUA_TUSERDATA`，
他们Lua的类型系统中被统称为userdata，两者的区别在于，`LUA_TUSERDATA`是个大家伙，它由Lua分配
并由Lua的垃圾回收机制管理；`LUA_LIGHTUSERDATA`的分配和释放则有用户控制。是不是有点托管代码和非托管代码的味道？
以上这些基本类型都是第一类值(first-class)，所谓第一类值就是可以保存在变量中，作为函数的参数或者返回值等等。

Lua中所有的这些基本类型都有一个公共的数据头，这个数据头管理着Lua中的垃圾回收所需的信息：

```
    [lobject.h]
    #define CommonHeader GCObject *next; lu_byte tt; lu_byte marked

    typedef struct GCheader {
        CommonHeader;
    } GCheader;

    [lstate.h]
    
    /*  Union of all collectable objects */
    union GCObject {
        GCheader gch;
        union TString ts;
        union Udata u;
        union Closure cl;
        struct Table h;
        struct Proto p;
        struct UpVal uv;
        struct lua_State th;  /* thread */
    };
```

这里暂且不管GCObject中各个域的含义，只要知道这个union和垃圾回收机制有关就行了。

Lua中的所有值都是由一个统一的C结构体表示的，这点可能让人觉得有些困惑。所有的值都是一个标记值(tagged union)，
可以表示为(t, v)，其中t是值的类型，v是正真保存数据的地方。

```
    [lobject.h]
    /*
    ** Union of all Lua values
    */
    typedef union {
        GCObject *gc;
        void *p;
        lua_Number n;
        int b;
    } Value;
```

在这个union中，gc不仅和垃圾回收有关还用来表示string, table, function, heavy userdata以及thread，
n用来存放数字，b用来存放boolean值，p用来存放light userdata。你可能觉得奇怪，Lua中的nil存放在哪个域中呢？
答案是nil值是隐含的，TValue的定义包含了这个小秘密。

```
    [lobject.h]
    #define TValuefields        Value value; int tt

    typedef struct lua_TValue {
        TValuefields;
    } TValue;
```

可以看到每一个值都有一个类型和它关联，nil也不例外。我们知道nil在Lua中表示无效值的情况，也就是说
没有任何有效值得情况，它的主要功能在于区别其他的任何值。因此我们只要知道一个值的类型是nil就足够了。
事实上我们也只能知道这个信息，nil表示的是没有任何有效值，我们自然无法将一个量化的值和nil相关联。

```
    [lobject.c]
    const TValue luaO_nilobject_ = { {NULL}, LUA_TNIL };
    #define luaO_nilobject (&luaO_nilobject_)
```

可以看到，Lua在运行时只存在一个nil值。

Lua中的数值类型实现很简单，简单到它就是C类型。

```
    [lua.h]
    typedef LUA_NUMBER lua_Number;

    [luaconf.h]
    #define LUA_NUMBER        double
```

Lua的默认设置中lua_Number 就是double，对它的基本操作也就自然而然的可以映射到C中原生的double操作上。

```
    [luaconf.h]
    #define luai_numadd(a,b)        ((a)+(b))
    #define luai_numsub(a,b)        ((a)-(b))
```

对lua_Number常用的一些操作其实都是类似上面两个的简单宏。
前面提到，Lua中所有的值都是以(tag, value)对的形式存在的，每个Lua数值都是存放在Value结构体中的n域中的。

字符串是一个语言很基础的部分，下面我们来看看Lua中的字符串是如何实现的。

```
    [lobject.h]
    /*
    ** String headers for string table
    */
    typedef union TString {
        L_Umaxalign dummy;  /* ensures maximum alignment for strings */
        struct {
            CommonHeader;
            lu_byte reserved;
            unsigned int hash;
            size_t len;
        } tsv;
    } TString;
```

上面的定义仅仅是字符串结构的一个头，字符串的长度是不固定的，光有这个head显然是不够的，我们将在下面的分析中看到Lua是如何处理这个问题的。

先来看看Lua是如何新建一个字符串的。和很多动态语言一样，Lua中的字符串是由Lua集中管理的，Lua会在
一个全局的table中缓存每一个字符串，每个字符串在整个Lua虚拟机内只存在一份拷贝，这可以有效减少内存的使用量。
Lua通过luaS_newlstr函数来创建字符串，这个函数逻辑非常简单。先对传入的C字符串计算散列值，这里
需要注意的是如果传入的字符串很长，Lua是不会在整个字符串上计算散列值的，从代码中可以看到，Lua会计算
一个步长，只计算能被这个步长整除的位置的字符的散列值。至于散列函数我们这里不深入研究。有了这个散列值，
Lua就会从一个全局的字符串table中查找拥有相同散列值的已缓存的字符串，这样还不够，Lua还会在这基础上
比较这个字符串是否和传入的参数长度相同、内容是否完全相同，只有这三者都相同了Lua才会认为找到了匹配的缓存，
至此，Lua会返回这个缓存的字符串。这里我们还可以看到Lua处理散列冲突时采用的是开链法。

```
    [lstring.c]
    TString *luaS_newlstr (lua_State *L, const char *str, size_t l)
    {
        GCObject *o;
        unsigned int h = cast(unsigned int, l);  /* seed */
        size_t step = (l>>5)+1;  /* if string is too long, don't hash all its chars */
        size_t l1;
        for (l1=l; l1>=step; l1-=step)  /* compute hash */
            h = h ^ ((h<<5)+(h>>2)+cast(unsigned char, str[l1-1]));
        for (o = G(L)->strt.hash[lmod(h, G(L)->strt.size)];
                o != NULL;
                o = o->gch.next) {
            TString *ts = rawgco2ts(o);
            if (ts->tsv.len == l && (memcmp(str, getstr(ts), l) == 0)) {
                /* string may be dead */
                if (isdead(G(L), o)) changewhite(o);
                return ts;
            }
        }
        return newlstr(L, str, l, h);  /* not found */
    }
```

如果Lua忙活了半天没有找到匹配的字符串缓存，那么就会调用newlstr函数新建一个字符串，下面我们来看newlstr的实现。

```
    [lstring.c]
    static TString *newlstr (lua_State *L, const char *str, size_t l,
                             unsigned int h)
    {
        TString *ts;
        stringtable *tb;
        if (l+1 > (MAX_SIZET - sizeof(TString))/sizeof(char))
            luaM_toobig(L);
        ts = cast(TString *, luaM_malloc(L, (l+1)*sizeof(char)+sizeof(TString)));
        ts->tsv.len = l;
        ts->tsv.hash = h;
        ts->tsv.marked = luaC_white(G(L));
        ts->tsv.tt = LUA_TSTRING;
        ts->tsv.reserved = 0;
        memcpy(ts+1, str, l*sizeof(char));
        ((char *)(ts+1))[l] = '\0';  /* ending 0 */
        tb = &G(L)->strt;
        h = lmod(h, tb->size);
        ts->tsv.next = tb->hash[h];  /* chain new entry */
        tb->hash[h] = obj2gco(ts);
        tb->nuse++;
        if (tb->nuse > cast(lu_int32, tb->size) && tb->size <= MAX_INT/2)
            luaS_resize(L, tb->size*2);  /* too crowded */
        return ts;
    }
```

从函数原型上我们发现newlstr比lusS_newlstr多了一个参数h，从代码中不难发现这个参数正是在luaS_newlstr中
计算的参数字符串的散列值，这个散列值会在下面的代码中用到。在这里我们才正真看清楚Lua是如何从无到有生成一个字符串的，
首先Lua分配一块`(l+1)*sizeof(char)+sizeof(TString)`大小的缓冲区，可见每个字符串对象的大小
是随着所含字符串内容的长度不同而变化的，这里可能会觉得奇怪，Lua为什么多分配了一个字节的内存？
别急，继续往下看，在填充了一些结构信息后，Lua将参数指向的字符串拷贝到刚分配的内存中，并通过散列值
将新创建的字符串挂到散列表中对应的冲突列表中。最后Lua还会根据一定的策略对字符串散列表扩张大小，
这是通过luaS_resize函数实现的，这么做是为了减少散列冲突带来的性能损失。Lua初始化的时候会把字符串
散列表的nuse域初始化为0，而对size域的初始化则是在f_luaopen函数中。

```
    luaS_resize(L, MINSTRTABSIZE);  /* initial size of string table */
```

将size初始化为MINSTRTABSIZE

```
    #define MINSTRTABSIZE 32
```

所以这里我们可以得到一个结论：Lua中的字符串散列表大小永远是2的整数次幂，32、64、128……，这样可以通过lmod进行快速模运算，提高性能。

下面我们来分析luaS_resize的实现。

```
    [lstring.c]
    void luaS_resize (lua_State *L, int newsize)
    {
        GCObject **newhash;
        stringtable *tb;
        int i;
        if (G(L)->gcstate == GCSsweepstring)
            return;  /* cannot resize during GC traverse */
        newhash = luaM_newvector(L, newsize, GCObject *);
        tb = &G(L)->strt;
        for (i=0; i<newsize; i++) newhash[i] = NULL;
        /* rehash */
        for (i=0; i<tb->size; i++) {
            GCObject *p = tb->hash[i];
            while (p) {  /* for each node in the list */
                GCObject *next = p->gch.next;  /* save next */
                unsigned int h = gco2ts(p)->hash;
                int h1 = lmod(h, newsize);  /* new position */
                lua_assert(cast_int(h%newsize) == lmod(h, newsize));
                p->gch.next = newhash[h1];  /* chain it */
                newhash[h1] = p;
                p = next;
            }
        }
        luaM_freearray(L, tb->hash, tb->size, TString *);
        tb->size = newsize;
        tb->hash = newhash;
    }
```

从newlstr中对luaS_resize函数的调用我们可以看到Lua每次都是将字符串散列表扩展为原大小的两倍

```
    luaS_resize(L, tb->size*2);  /* too crowded */
```

首先，Lua分配newsize大小的新散列表，然后将原散列表中的每一个字符串插入到新散列表中，这个过程其实
就是一个重新散列的过程，然后旧的散列表的生命周期结束，Lua释放它占用的内存，将新散列表作为新的字符串散列表。

Lua源代码中还有一个lstrlib.c，这个源文件中包含了Lua支持的字符串操作的实现，但这些跟我们的主题
关系不大，这里我们就不做讨论了。

table是Lua中唯一的一个数据结构机制，同时table在Lua虚拟机的实现中也扮演了举足轻重的地位，因此Lua的
设计者非常重视table的高效实现。
Lua中的table是关联数组，所谓关联数组，就是说它能以任何值（除了nil）为索引并且可以存储任何类型的值。
和大多数语言不同，Lua不提供数组类型，事实上数组完全可以用table来实现，你想啊，数组不过就是以整数
作为下标的一个table而已。但是数组和table毕竟是不同的概念，Lua是如何有效地以table来实现数组的呢？
在Lua 5.0之前，table是完全用散列表实现的，但是从5.0开始Lua采用了一种新的策略。这里我们先按下不表，先来看看table的定义。

```
    typedef union TKey {
        struct {
            TValuefields;
            struct Node *next;  /* for chaining */
        } nk;
        TValue tvk;
    } TKey;

    typedef struct Node {
        TValue i_val;
        TKey i_key;
    } Node;

    typedef struct Table {
        CommonHeader;
        lu_byte flags;  /* 1<<p means tagmethod(p) is not present */
        lu_byte lsizenode;  /* log2 of size of `node' array */
        struct Table *metatable;
        TValue *array;  /* array part */
        Node *node;
        Node *lastfree;  /* any free position is before this position */
        GCObject *gclist;
        int sizearray;  /* size of `array' array */
    } Table;
```

我们看到，table的定义中包含了两个不同的部分，一个是数组部分，另一个是散列表部分。这点事table的关键，
Lua中的table会根据适当的策略自行决定使用哪一部分来存储一个值。数组部分顾名思义就是一个存储
TValue的数组，而node是指向一个散列表的指针，其每一项都维护了一个键-值对Node。
先来看看Lua是从无到有创建table的，在分配了Table内存后Lua调用了两个函数来分别初始化table中的array
和关联数组部分。这两个函数的任务是相似的，只是操作的域不同，以setnodevector为例，首先是计算关联数
组部分的实际大小，这个大小必须是2的整数幂，分配相应大小的内存后对node中的每一个链表初始化。

```
    Table *luaH_new (lua_State *L, int narray, int nhash)
    {
        Table *t = luaM_new(L, Table);
        luaC_link(L, obj2gco(t), LUA_TTABLE);
        t->metatable = NULL;
        t->flags = cast_byte(~0);
        /* temporary values (kept only if some malloc fails) */
        t->array = NULL;
        t->sizearray = 0;
        t->lsizenode = 0;
        t->node = cast(Node *, dummynode);
        setarrayvector(L, t, narray);
        setnodevector(L, t, nhash);
        return t;
    }

    static void setarrayvector (lua_State *L, Table *t, int size)
    {
        int i;
        luaM_reallocvector(L, t->array, t->sizearray, size, TValue);
        for (i=t->sizearray; i<size; i++)
            setnilvalue(&t->array[i]);
        t->sizearray = size;
    }


    static void setnodevector (lua_State *L, Table *t, int size)
    {
        int lsize;
        if (size == 0) {  /* no elements to hash part? */
            t->node = cast(Node *, dummynode);  /* use common `dummynode' */
            lsize = 0;
        } else {
            int i;
            lsize = ceillog2(size);
            if (lsize > MAXBITS)
                luaG_runerror(L, "table overflow");
            size = twoto(lsize);
            t->node = luaM_newvector(L, size, Node);
            for (i=0; i<size; i++) {
                Node *n = gnode(t, i);
                gnext(n) = NULL;
                setnilvalue(gkey(n));
                setnilvalue(gval(n));
            }
        }
        t->lsizenode = cast_byte(lsize);
        t->lastfree = gnode(t, size);  /* all positions are free */
    }
```

知道了初始化的过程，那么删除table的过程也就很明了了。一个要注意的地方就是关联数组部分的指针如果
指向dummynode的话就不能将其释放，因为dummynode是一个静态的对象。Node=dummynode指示关联数组部分是空的。

```
    void luaH_free (lua_State *L, Table *t)
    {
        if (t->node != dummynode)
            luaM_freearray(L, t->node, sizenode(t), Node);
        luaM_freearray(L, t->array, t->sizearray, TValue);
        luaM_free(L, t);
    }
```

table的操作中最重要的莫过于搜索，给定一个键如何快速查找到键的位置是table性能的关键，Lua在实现
table的搜索操作时做了很多优化，针对字符串和整数作为键的情况作了特殊处理。

```
    /*
    ** main search function
    */
    const TValue *luaH_get (Table *t, const TValue *key)
    {
        switch (ttype(key)) {
        case LUA_TNIL:
            return luaO_nilobject;
        case LUA_TSTRING:
            return luaH_getstr(t, rawtsvalue(key));
        case LUA_TNUMBER: {
            int k;
            lua_Number n = nvalue(key);
            lua_number2int(k, n);
            if (luai_numeq(cast_num(k), nvalue(key))) /* index is int? */
                return luaH_getnum(t, k);  /* use specialized version */
            /* else go through */
        }
        default: {
            Node *n = mainposition(t, key);
            do {  /* check whether `key' is somewhere in the chain */
                if (luaO_rawequalObj(key2tval(n), key))
                    return gval(n);  /* that's it */
                else n = gnext(n);
            } while (n);
            return luaO_nilobject;
        }
        }
    }
```

对于不是字符串、整数、nil的情况，Lua都是通过default中那段代码区查找的，其中mainposition返回
的是key的的散列值，从上面的分析我们知道key的散列值是作为键的主位置的。知道了键的主位置我们只要
顺着这条链一直查找，知道找到键值相等的地方就是我们要的值了。万一很不幸没有找到这样的键就说明table中不存在这个键。

```
    /*
    ** search function for strings
    */
    const TValue *luaH_getstr (Table *t, TString *key)
    {
        Node *n = hashstr(t, key);
        do {  /* check whether `key' is somewhere in the chain */
            if (ttisstring(gkey(n)) && rawtsvalue(gkey(n)) == key)
                return gval(n);  /* that's it */
            else n = gnext(n);
        } while (n);
        return luaO_nilobject;
    }
```

对于字符串作为键的情况，我们同样是遍历键的位置链表，但是在判断是否是期望的键时Lua采用了针对字符串
的优化。先判断这个键是不是字符串，如果不是那肯定不是我们需要的键，如果是字符串再直接比较字符串的
指针，如果相等就说明找到了。这里之所以能采用指针比较是因为Lua字符串的实现机制保证了相同字符串值在内存中存在一份拷贝。

```
    /*
    ** search function for integers
    */
    const TValue *luaH_getnum (Table *t, int key)
    {
        /* (1 <= key && key <= t->sizearray) */
        if (cast(unsigned int, key-1) < cast(unsigned int, t->sizearray))
            return &t->array[key-1];
        else {
            lua_Number nk = cast_num(key);
            Node *n = hashnum(t, nk);
            do {  /* check whether `key' is somewhere in the chain */
                if (ttisnumber(gkey(n)) && luai_numeq(nvalue(gkey(n)), nk))
                    return gval(n);  /* that's it */
                else n = gnext(n);
            } while (n);
            return luaO_nilobject;
        }
    }
```

如果整数键值在table的数组部分的范围呢，就直接返回数组部分中对应下标处的元素；如果整数键值不再数组
部分，那么同样是按照键的散列值去散列表中查找相应的元素。
接下来看table的插入操作，我们知道插入一个元素时有两种可能：对应键值的元素已经存在；或者对应键值的元素不存在。

```
    TValue *luaH_set (lua_State *L, Table *t, const TValue *key)
    {
        const TValue *p = luaH_get(t, key);
        t->flags = 0;
        if (p != luaO_nilobject)
            return cast(TValue *, p);
        else {
            if (ttisnil(key)) luaG_runerror(L, "table index is nil");
            else if (ttisnumber(key) && luai_numisnan(nvalue(key)))
                luaG_runerror(L, "table index is NaN");
            return newkey(L, t, key);
        }
    }
```

这个函数其实并不插入键对应的值，我们注意到传给函数的参数中只有key，而没有value。这个函数的作用
是保证在调用完这个函数之后，table中一定存在键值为key的元素。整个函数只是个stub，真正的工作是在newkey中做的。

```
    /*
    ** inserts a new key into a hash table; first, check whether key's main
    ** position is free. If not, check whether colliding node is in its main
    ** position or not: if it is not, move colliding node to an empty place and
    ** put new key in its main position; otherwise (colliding node is in its main
    ** position), new key goes to an empty position.
    */
```

newkey的代码这里不贴出来，它的算法是：如果键的主位置是空的，直接放进去就好了；如果键的主位置不为空，
那么分为两种情况考虑，如果冲突节点在它的主位置（也就是冲突节点的键和待插入的键的主位置相同），
就把带插入的键放到一个空位置去；否则的话（也就是说，这个冲突的节点占用了带插入节点的主位置，
又不是它的主位置，它占着别人的主位置干啥，当然要让出来了），把冲突的节点放到一个空节点中，并且将
带插入的键放到它的主位置。在这个过程中有可能table已经满了，导致无法找到空节点，此时Lua会对增加
table的容量，这个工作是在rehash函数中完成的。

```
    static void rehash (lua_State *L, Table *t, const TValue *ek)
    {
        int nasize, na;
        int nums[MAXBITS+1];  /* nums[i] = number of keys between 2^(i-1) and 2^i */
        int i;
        int totaluse;
        for (i=0; i<=MAXBITS; i++) nums[i] = 0;  /* reset counts */
        nasize = numusearray(t, nums);  /* count keys in array part */
        totaluse = nasize;  /* all those keys are integer keys */
        totaluse += numusehash(t, nums, &nasize);  /* count keys in hash part */
        /* count extra key */
        nasize += countint(ek, nums);
        totaluse++;
        /* compute new size for array part */
        na = computesizes(nums, &nasize);
        /* resize the table to new computed sizes */
        resize(L, t, nasize, totaluse - na);
    }
```

如果调整table的大小，毫无疑问，我们需要知道table中到底有多少个元素，更具体一点的话还要知道有多少元素
在数组部分，多少元素在散列部分。rehash的参数中有一个ey，这个键是触发这个table增长的键，计算table
的新大小是同时也要把这个键考虑进去，coutint函数中会根据这个键是不是整数类型的键做相应的操作，具体
的这里不展开了。现在我们有了数组部分各个分段（2^(i-1) to 2^i作为一段）的元素个数，接下来就是找到
一个合适的数组大小。Lua计算这个大小的原则是这样的：找出最大的n使得从[1, n]中至少有一半都是在使用
中的而且在[n/2+1, n]这一部分中至少有一个位置是在使用中的（否则的话你要这一般做啥，取n/2就行了）。
计算出table的新数组大小后就可以开始调整的工作了。

```
    static int computesizes (int nums[], int *narray)
    {
        int i;
        int twotoi;  /* 2^i */
        int a = 0;  /* number of elements smaller than 2^i */
        int na = 0;  /* number of elements to go to array part */
        int n = 0;  /* optimal size for array part */
        for (i = 0, twotoi = 1; twotoi/2 < *narray; i++, twotoi *= 2) {
            if (nums[i] > 0) {
                a += nums[i];
                if (a > twotoi/2) {  /* more than half elements present? */
                    n = twotoi;  /* optimal size (till now) */
                    na = a;  /* all elements smaller than n will go to array part */
                }
            }
            if (a == *narray) break;  /* all elements already counted */
        }
        *narray = n;
        lua_assert(*narray/2 <= na && na <= *narray);
        return na;
    }
```

接下来代码转到resize函数中，这是table的新大小已经计算出来了，剩下的就是根据这些新大小resize table。
有时候数组部分不应定需要重新分配内存，Lua只有在新的数组部分大小大于原来的数组大小时才会重新分配这部分内存。
有时候可能新的数组大小小于原来的数组大小，这时需要shrink 数组，这是只需要将在于新数组大小的那些
元素重新插入table中就行了（这些元素会被插入到散列部分，这时散列部分已经根据新的大小重建了），
这里我们看到给table中指定键对应的节点设置value的其实是setobjt2t，这是一个宏（有点奇怪？
随处可见的宏是Lua源码的一个特点）。接下来还要把原来散列部分的元素重新插入到新的散列部分中。

```
    static void resize (lua_State *L, Table *t, int nasize, int nhsize)
    {
        int i;
        int oldasize = t->sizearray;
        int oldhsize = t->lsizenode;
        Node *nold = t->node;  /* save old hash ... */
        if (nasize > oldasize)  /* array part must grow? */
            setarrayvector(L, t, nasize);
        /* create new hash part with appropriate size */
        setnodevector(L, t, nhsize);
        if (nasize < oldasize) {  /* array part must shrink? */
            t->sizearray = nasize;
            /* re-insert elements from vanishing slice */
            for (i=nasize; i<oldasize; i++) {
                if (!ttisnil(&t->array[i]))
                    setobjt2t(L, luaH_setnum(L, t, i+1), &t->array[i]);
            }
            /* shrink array */
            luaM_reallocvector(L, t->array, oldasize, nasize, TValue);
        }
        /* re-insert elements from hash part */
        for (i = twoto(oldhsize) - 1; i >= 0; i--) {
            Node *old = nold+i;
            if (!ttisnil(gval(old)))
                setobjt2t(L, luaH_set(L, t, key2tval(old)), gval(old));
        }
        if (nold != dummynode)
            luaM_freearray(L, nold, twoto(oldhsize), Node);  /* free old array */
    }
```

至此，对Lua中的基本对象已经有所了解了。没有涉及到的包括function, userdata和thread。
主要是看代码时的笔记，难免有错，见谅。
