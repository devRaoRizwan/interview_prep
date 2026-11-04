// Python Days 1 to 3 (Questions 1 to 9)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_1_TO_3 = {
  // Q1: List vs Tuple
  1: {
    id: 1,
    docSpecs: {
      overview: 'In Python, lists and tuples are sequential data structures with fundamentally different mutability guarantees, internal CPython memory allocations, and dictionary key hashability. Lists are mutable dynamic arrays designed for runtime modifications, whereas tuples are immutable fixed-length records optimized for data safety and garbage collection efficiency.',
      table: {
        headers: ['Specification', "Python List ('list')", "Python Tuple ('tuple')", 'Backend Architecture Impact'],
        rows: [
          ['Mutability', 'Mutable (allows append, pop, insert, sort)', 'Immutable (fixed size upon creation)', 'Tuples guarantee thread-safe read-only sharing across worker threads.'],
          ['CPython Memory Strategy', 'Dynamic array with over-allocation headroom (realloc)', 'Exact pointer array; small tuples (<=20 items) cached in free-lists', 'Tuples eliminate memory fragmentation and reduce garbage collector pressure.'],
          ['Hashability (__hash__)', 'Unhashable (raises TypeError: unhashable type)', 'Hashable (provided all nested items are also hashable)', 'Tuples can serve as composite dictionary keys and database cache lookups.'],
          ['Lookup & Iteration Speed', 'O(1) index access', 'O(1) index access (~10% faster iteration in CPython)', 'Tuples provide better CPU L1/L2 cache locality for static data schemas.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'CPython Small Tuple Free-List Caching',
          content: 'CPython maintains an internal static array of 20 free-lists for tuples sized up to 20 elements. When a small tuple is destroyed, its memory block is preserved in the free-list rather than returned to the OS heap, making subsequent tuple creation instantaneous.'
        },
        {
          type: 'caution',
          title: 'The Nested Mutable Element Trap',
          content: 'While tuples are immutable containers, a tuple containing a mutable object (e.g. `t = (1, [2, 3])`) is NOT hashable! Running `hash(t)` raises `TypeError: unhashable type: \'list\'` because tuple hashing recursively evaluates the hash of every inner element.'
        }
      ],
      commands: [
        {
          label: 'Mutate vs Immutability Semantics',
          cmd: `a = [1, 2]\nb = (1, 2)\n\n# Lists allow in-place mutations\na.append(3)  # Succeeds -> [1, 2, 3]\n\n# Tuples forbid mutation (AttributeError)\n# b.append(3) -> AttributeError: 'tuple' object has no attribute 'append'`,
          lang: 'python',
          description: 'Demonstrating mutability: lists allocate extra memory to allow in-place append operations, while tuples enforce read-only integrity.'
        },
        {
          label: 'Dictionary Key Hashability Test',
          cmd: `# Tuple as Dict Key (Valid)\ncache = {(10.5, 20.3): "GPS_COORDINATES"}\nprint("Tuple Key Success:", cache[(10.5, 20.3)])\n\n# List as Dict Key (Fails with TypeError)\ntry:\n    invalid = {[1, 2]: "ITEM"}\nexcept TypeError as err:\n    print("Caught expected error:", err)`,
          lang: 'python',
          description: 'Hashability verification: Dictionary keys in Python require a permanent __hash__() value. Only immutable types like tuples can be hashed.'
        }
      ],
      didYouKnow: {
        title: '💡 CPython Optimization Insight',
        content: 'When initializing fixed literals like `a = (1, 2, 3)`, the Python compiler emits a `LOAD_CONST` bytecode instruction pointing directly to a pre-built constant tuple in code object memory. A list literal `[1, 2, 3]` requires `BUILD_LIST` bytecode, allocating a fresh heap array every time the code runs.'
      }
    },
    challenge: {
      title: 'Memory Overhead & Dict Key Hashability Drill',
      steps: [
        'Verify mutability: Create a list `a = [1, 2]` and tuple `b = (1, 2)`. Attempt `a.append(3)` vs `b.append(3)`.',
        'Test Hashability: Attempt to use a list as a dict key `{[1, 2]: "val"}` and observe the exact TypeError.',
        'Verify Tuple Key: Attempt using `b = (1, 2)` as a dict key. Observe why it succeeds.',
        'The Inner Mutability Trap: Construct a tuple containing an inner mutable list `t = (1, [2, 3])`. Try using `t` as a dict key.'
      ],
      codeSnippet: `# 1. Test Mutability
a = [1, 2]
b = (1, 2)
a.append(3)
print("Modified List:", a)

# 2. Try List as Dict Key (Fails)
try:
    d = {[1, 2]: "item"}
except TypeError as err:
    print("List as Key Error:", err)

# 3. Tuple as Dict Key (Succeeds)
d = {(1, 2): "item"}
print("Tuple as Key:", d)

# 4. Nested Tuple with Inner List (Fails)
try:
    t = (1, [2, 3])
    d = {t: "item"}
except TypeError as err:
    print("Nested Tuple Error:", err)`,
      expectedOutput: `Modified List: [1, 2, 3]
List as Key Error: unhashable type: 'list'
Tuple as Key: {(1, 2): 'item'}
Nested Tuple Error: unhashable type: 'list'`,
      interviewQuestion: 'Why is a tuple with a list inside it not hashable even though tuples are immutable? What exact contract does Python require for __hash__()?',
      interviewAnswer: 'In Python, an object is hashable only if its hash value never changes during its lifetime and all of its items are also hashable. While the outer tuple container is immutable, it recursively computes its hash from its elements. Because the inner list is mutable and lacks a valid __hash__() method, the tuple fails the hash() check and raises TypeError: unhashable type: "list". An object must satisfy the contract that if a == b, then hash(a) == hash(b); since mutating a list changes equality, allowing it inside a hash key would corrupt dictionary hash buckets.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you walk me through the key architectural differences between a Python list and a tuple? Under what circumstances in a production backend would you specifically choose a tuple over a list, and what happens at the memory allocation level?',
      framework: [
        { time: '0-15s', point: 'Core Definition & Mutability: Lists are mutable dynamic arrays; Tuples are immutable fixed-size sequences.' },
        { time: '15-45s', point: 'Under the Hood (CPython): Lists over-allocate memory with realloc for O(1) amortized appends; Tuples allocate exact memory and use small-tuple free-list caching.' },
        { time: '45-60s', point: 'Backend Production Practice: Use tuples for dictionary keys, database composite primary keys, and immutable data transfer objects. Use lists only for collections requiring mutation or sorting.' }
      ],
      spokenScript: `"In Python, the fundamental difference comes down to mutability, memory layout, and hashability. Lists are mutable dynamic arrays: CPython deliberately over-allocates memory headroom using realloc so that append operations achieve amortized O(1) time complexity. In contrast, tuples are immutable and fixed-size; Python allocates exact memory without extra buffer slots and leverages internal free-lists to cache and reuse small tuple objects, minimizing garbage collection overhead.\n\nIn backend development, I strictly use tuples for fixed data structures—such as dictionary keys, coordinate pairs, or database composite keys—because immutability guarantees hashability and thread-safe read access. I only choose lists when I need a dynamic collection that requires in-place mutation, sorting, or iterative appending."`,
      buzzwords: ['CPython PyTupleObject', 'Over-allocation buffer', 'Amortized O(1)', 'Hashability & __hash__', 'Thread-safe read access', 'Free-list caching'],
      juniorMistake: 'Just saying "tuples use parentheses () and lists use brackets []" without explaining memory overhead, realloc, or dict key hashability.'
    }
  },

  // Q2: Decorators
  2: {
    id: 2,
    docSpecs: {
      overview: 'A Python decorator is a higher-order function that accepts a callable as an argument, wraps it inside an execution closure, and returns a modified or augmented callable without changing the original function source code. The `@decorator` syntax is syntactic sugar evaluated at module import time, translating `@dec def f(): pass` directly to `f = dec(f)`.',
      table: null,
      admonitions: [
        {
          type: 'tip',
          title: 'Metadata Preservation Best Practice',
          content: 'Never write a custom decorator without `@functools.wraps(func)`. Omitting wraps wipes out the function name and docstring, causing Sentry, Datadog APM, and Swagger/OpenAPI generators to report every endpoint as generic "wrapper".'
        },
        {
          type: 'caution',
          title: 'Avoid Import-Time Side Effects',
          content: 'Code placed outside the inner `wrapper()` function executes only once when the module is imported by Python, not when the function is called. Only place execution logic inside `wrapper(*args, **kwargs)`.'
        }
      ],
      commands: [
        {
          label: 'Production Timing Decorator with Wraps',
          cmd: `import time\nfrom functools import wraps\n\ndef measure_latency(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        duration = (time.perf_counter() - start) * 1000\n        print(f"[APM] {func.__name__} took {duration:.2f}ms")\n        return result\n    return wrapper\n\n@measure_latency\ndef process_payment(order_id):\n    """Charges credit card and returns receipt."""\n    time.sleep(0.05)\n    return f"Receipt for {order_id}"`,
          lang: 'python',
          description: 'Standard production wrapper pattern using functools.wraps to preserve introspection attributes.'
        }
      ],
      didYouKnow: {
        title: '💡 Decorator Chaining Order',
        content: 'When stacking multiple decorators like `@auth` followed by `@cache`, decorators execute from bottom to top on definition (`cache(auth(func))`), but the resulting wrapper executes from top to bottom at runtime (`auth` runs first, then `cache`).'
      }
    },
    challenge: {
      title: 'Building a Production Performance Timing Decorator',
      steps: [
        'Import `time` and `functools.wraps`.',
        'Write a decorator function `@timing_decorator` that records `time.perf_counter()` before and after calling `func(*args, **kwargs)`.',
        'Print the execution time in milliseconds and return the original function output.',
        'Apply the decorator to a heavy mathematical computation (e.g. summing 5,000,000 numbers).',
        'Inspect `compute_sum.__name__` and `compute_sum.__doc__` to verify metadata preservation.'
      ],
      codeSnippet: `import time
from functools import wraps

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        print(f"[METRIC] {func.__name__} executed in {duration_ms:.2f}ms")
        return result
    return wrapper

@timing_decorator
def compute_sum(n):
    """Computes the sum of numbers up to n."""
    return sum(range(n))

# Run function
total = compute_sum(5_000_000)
print("Result:", total)
print("Function Name Preserved:", compute_sum.__name__)
print("Docstring Preserved:", compute_sum.__doc__)`,
      expectedOutput: `[METRIC] compute_sum executed in ~150.00ms
Result: 12499997500000
Function Name Preserved: compute_sum
Docstring Preserved: Computes the sum of numbers up to n.`,
      interviewQuestion: 'What happens if you omit @functools.wraps(func) inside your custom decorator? How does it affect production observability tools like Sentry or Swagger?',
      interviewAnswer: 'Without @functools.wraps(func), the decorated function loses its identity. Its __name__ attribute becomes "wrapper" instead of the original function name, and its docstring (__doc__), __annotations__, and signature are replaced by wrapper metadata. In production, this causes Sentry and Datadog APM to aggregate traces under the generic name "wrapper" rather than individual endpoint names, and OpenAPI/Swagger documentation generators fail to produce accurate route schemas.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do decorators work in Python under the hood? Walk me through how you would implement a custom decorator for measuring API endpoint latency or enforcing authentication in a backend API, and what pitfalls you must guard against.',
      framework: [
        { time: '0-15s', point: 'Mechanism: Higher-order function closure evaluated at module import time; @syntax translates to func = dec(func).' },
        { time: '15-45s', point: 'Critical Best Practice: Always apply @functools.wraps(func) to prevent stripping __name__, __doc__, and type signatures.' },
        { time: '45-60s', point: 'Production Application: Use decorators for cross-cutting concerns (JWT authentication, Datadog/Sentry instrumentation, caching, DB retries).' }
      ],
      spokenScript: `"Under the hood, a Python decorator is syntactic sugar for a higher-order function that accepts a callable, wraps it inside an execution closure, and returns the replacement wrapper function. When Python encounters @timing_decorator, it executes 'func = timing_decorator(func)' at module import time.\n\nIn a production backend, the single most critical practice when building any custom decorator is applying '@functools.wraps(func)' on the inner wrapper function. Without wraps, the decorated function loses its identity—its __name__ becomes 'wrapper', and its docstring and signature are wiped out, breaking APM tools like Datadog, Sentry, and OpenAPI documentation generators. I accept *args and **kwargs to support any endpoint signature, execute cross-cutting concerns like measuring latency or verifying JWT headers, and let exceptions propagate cleanly."`,
      buzzwords: ['Higher-order function', 'Closure scope', '@functools.wraps', 'Introspection metadata', 'Import-time evaluation', 'Cross-cutting concerns'],
      juniorMistake: 'Forgetting @functools.wraps, which renames decorated functions to "wrapper" and breaks Swagger docs, Celery task names, and Sentry stack traces.'
    }
  },

  // Q3: List vs Dict Comprehension
  3: {
    id: 3,
    docSpecs: {
      overview: 'List and dictionary comprehensions provide an expressive, high-performance syntax for constructing new collections by mapping and filtering iterables in CPython. Internally, comprehensions execute dedicated bytecode (`LIST_APPEND` and `MAP_ADD`) inside an isolated scope, avoiding the overhead of repeated global method lookups associated with `.append()` or `dict[key] = val` in traditional for-loops.',
      table: {
        headers: ['Feature', 'List Comprehension `[...]`', 'Dict Comprehension `{k: v}`', 'Generator Expression `(...)`'],
        rows: [
          ['Output Type', '`list` (ordered mutable array)', '`dict` (hash table mapping)', '`generator` (lazy iterator)'],
          ['Evaluation Time', 'Eager: computes all items immediately', 'Eager: computes all key-value pairs immediately', 'Lazy: computes each item on demand via `__next__()`'],
          ['Memory Overhead', 'O(N) heap space allocated upfront', 'O(N) heap space with 1/3 hash table headroom', 'O(1) constant auxiliary space (~112 bytes)'],
          ['Duplicate Keys', 'Preserves duplicates as distinct elements', 'Later duplicate keys silently overwrite earlier keys', 'N/A (stream of yielded values)']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Bytecode Performance Advantage',
          content: 'CPython optimizes comprehensions using specialized C-level bytecodes (`LIST_APPEND` and `MAP_ADD`). This makes comprehensions 20-30% faster than traditional manual `for` loops that repeatedly resolve and call `.append()` via Python method dispatch.'
        },
        {
          type: 'caution',
          title: 'Dict Comprehension Key Collision Trap',
          content: 'If your comprehension iterable contains duplicate transformed keys, subsequent iterations silently overwrite earlier values without warning. Always ensure unique keys or aggregate collisions into list values.'
        }
      ],
      commands: [
        {
          label: 'List & Dict Comprehensions with Filtering',
          cmd: `users = [("alice", 28), ("bob", 34), ("charlie", 22)]\n\n# List comprehension with filter\nnames = [name.upper() for name, age in users if age > 25]\nprint("Filtered Names:", names)\n\n# Dict comprehension mapping name to age\nuser_lookup = {name: age for name, age in users}\nprint("Lookup Dict:", user_lookup)`,
          lang: 'python',
          description: 'Constructing transformed lists and hash-map lookups in a single readable line.'
        }
      ],
      didYouKnow: {
        title: '💡 Variable Scope Leak Isolation',
        content: 'In Python 2, list comprehension loop variables leaked into the enclosing local function scope, accidentally overwriting existing variables! Python 3 solved this by giving every comprehension its own hidden function frame scope.'
      }
    },
    challenge: {
      title: 'Transforming Collections & Memory Benchmark Drill',
      steps: [
        'Given a list of backend user tuples: `[("alice", 28), ("bob", 34), ("charlie", 22)]`.',
        'Write a List Comprehension to filter users older than 25 and convert their names to uppercase.',
        'Write a Dict Comprehension mapping `username: age` for all active users.',
        'Compare memory size between a List Comprehension `[...]` and a Generator Expression `(...)` using `sys.getsizeof`.'
      ],
      codeSnippet: `import sys

users = [("alice", 28), ("bob", 34), ("charlie", 22)]

# 1. List Comprehension
filtered_names = [name.upper() for name, age in users if age > 25]
print("Filtered List:", filtered_names)

# 2. Dict Comprehension
user_dict = {name: age for name, age in users}
print("User Dict:", user_dict)

# 3. Memory Benchmark: List vs Generator
large_range = range(100_000)
list_comp = [x * 2 for x in large_range]
gen_exp = (x * 2 for x in large_range)

print(f"List Size: {sys.getsizeof(list_comp):,} bytes")
print(f"Generator Size: {sys.getsizeof(gen_exp):,} bytes")`,
      expectedOutput: `Filtered List: ['ALICE', 'BOB']
User Dict: {'alice': 28, 'bob': 34, 'charlie': 22}
List Size: ~800,984 bytes
Generator Size: ~104 bytes`,
      interviewQuestion: 'When would you deliberately choose a generator expression over a list comprehension in a backend API worker?',
      interviewAnswer: 'When streaming or processing massive datasets (such as parsing gigabyte database query results, reading multi-megabyte log files, or streaming CSV exports). A list comprehension allocates all objects in memory immediately, risking Out-Of-Memory (OOM) Kubernetes container termination. A generator expression computes items lazily on demand one by one with constant O(1) memory overhead.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the architectural difference between a list comprehension and a generator expression in Python? If you have to process 500,000 database rows in a backend worker, which do you choose and why?',
      framework: [
        { time: '0-15s', point: 'Eager vs Lazy Evaluation: List comprehensions allocate all elements in heap RAM upfront (O(N) memory); Generator expressions evaluate lazily on-demand (O(1) memory).' },
        { time: '15-45s', point: 'Iterator Protocol: Generators implement __iter__ and __next__, yielding items one-by-one without holding the dataset in RAM.' },
        { time: '45-60s', point: 'Production Guidance: Always use generator pipelines or ORM chunking (iterator()) for large datasets to prevent OOM container kills; reserve comprehensions for small datasets needing random indexing.' }
      ],
      spokenScript: `"The fundamental architectural difference is eager versus lazy evaluation. A list comprehension eagerly allocates and builds the entire list in heap memory immediately, returning a populated list object with O(N) memory complexity. A generator expression evaluates lazily using parentheses: it returns a generator object conforming to Python's iterator protocol, producing items one at a time on demand via '__next__()' with O(1) constant memory.\n\nIf I'm processing 500,000 records from Postgres in a Celery worker, loading them all into a list comprehension risks triggering an Out-Of-Memory (OOM) kill by the Kubernetes container orchestrator. I stream the records using a generator or Django's .iterator() to keep resident memory minimal. I only use list comprehensions when the collection is small and I require random indexing, len() lookups, or multiple passes."`,
      buzzwords: ['Eager vs Lazy evaluation', 'Iterator protocol (__next__)', 'O(1) auxiliary space', 'OOM Container termination', 'Streaming data pipeline'],
      juniorMistake: 'Defaulting to list comprehensions for every loop, causing sudden memory spikes and container crashes under heavy production traffic.'
    }
  },

  // Q4: Memory Management
  4: {
    id: 4,
    docSpecs: {
      overview: 'Memory management in CPython is handled via a layered architecture: the primary deallocation mechanism is Reference Counting, backed by a cyclic generational garbage collector for circular references, and a specialized small-object allocator (`PyObject_Malloc` / `pymalloc`) that manages blocks, pools, and arenas for objects <= 512 bytes.',
      table: {
        headers: ['Mechanism', 'Primary Role', 'Trigger Condition', 'CPython Implementation Details'],
        rows: [
          ['Reference Counting', 'Immediate object deallocation', 'When `ob_refcnt` drops to 0', 'Deterministic and real-time; fails on circular references.'],
          ['Generational GC (Gen 0, 1, 2)', 'Detects and frees cyclic reference graphs', 'When allocation threshold delta is exceeded', 'Uses double-linked lists of container objects; Gen 0 runs frequently, Gen 2 rarely.'],
          ['Pymalloc Allocator', 'Prevents OS heap fragmentation for small objects', 'Allocations <= 512 bytes', 'Organizes memory into 256KB Arenas, 4KB Pools, and 8-to-512 byte Blocks.'],
          ['OS Heap (glibc malloc)', 'Large object memory allocations', 'Allocations > 512 bytes', 'Calls system `malloc()` directly for large byte strings and giant arrays.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Reference Counting Determinism',
          content: 'Unlike Java or Go, Python frees memory the microsecond its reference count drops to 0. File descriptors and network sockets are closed immediately when local variables fall out of scope, provided no circular references exist.'
        },
        {
          type: 'caution',
          title: 'Circular References in Global or Long-Running Workers',
          content: 'If two objects reference each other (`a.b = b; b.a = a`) and are not deallocated by reference counting, they sit in memory until the cyclic GC sweeps Generation 2. In high-throughput Celery workers, cyclic reference leaks cause memory bloat over time.'
        }
      ],
      commands: [
        {
          label: 'Inspecting Object Reference Counts & GC Collections',
          cmd: `import sys\nimport gc\n\nx = ["backend", "service"]\nprint("Ref count (includes getrefcount ref):", sys.getrefcount(x))\n\ny = x\nprint("Ref count with alias:", sys.getrefcount(x))\n\ndel y\nprint("Ref count after del:", sys.getrefcount(x))\n\n# Inspect cyclic GC thresholds\nprint("GC Generation Thresholds (Gen0, Gen1, Gen2):", gc.get_threshold())`,
          lang: 'python',
          description: 'Using sys.getrefcount and gc module to inspect CPython reference counting and collector configuration.'
        }
      ],
      didYouKnow: {
        title: '💡 Why Python Keeps Memory from the OS',
        content: 'When objects are deallocated in Python, `pymalloc` does not immediately return that memory to the operating system heap unless an entire 256KB Arena becomes completely empty. This is why a Python process resident memory (RSS) rarely shrinks after peak workload.'
      }
    },
    challenge: {
      title: 'Reference Counting & Circular Reference Garbage Collection Drill',
      steps: [
        'Import `sys` and `gc`.',
        'Create an object `x = ["backend", "data"]` and inspect its initial reference count with `sys.getrefcount(x)`.',
        'Create a second alias `y = x` and observe the reference count increase.',
        'Create a circular reference `class Node` where `n1.peer = n2` and `n2.peer = n1`.',
        'Delete `n1` and `n2`. Explain why reference counting fails to deallocate them and verify using `gc.collect()`.'
      ],
      codeSnippet: `import sys
import gc

# 1. Reference Counting
x = ["backend", "data"]
print("Initial ref count:", sys.getrefcount(x))

y = x
print("After second reference:", sys.getrefcount(x))

del y
print("After deleting y:", sys.getrefcount(x))

# 2. Circular Reference
class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None

n1 = Node("A")
n2 = Node("B")
n1.peer = n2
n2.peer = n1  # Cycle created

del n1
del n2  # Reference count is 1 for each (circular)!
print("Uncollected cyclic objects before manual sweep:", gc.collect())`,
      expectedOutput: `Initial ref count: 2
After second reference: 3
After deleting y: 2
Uncollected cyclic objects before manual sweep: 2 (or more)`,
      interviewQuestion: 'How does CPython garbage collection differ from Java or Go garbage collection? What is the role of Generations 0, 1, and 2?',
      interviewAnswer: 'CPython relies primarily on immediate Reference Counting: each PyObject has an ob_refcnt field incremented on reference and decremented when references drop. When ob_refcnt reaches 0, the memory is deallocated instantly without stopping the world. Java and Go, by contrast, use tracing garbage collectors without reference counting.\n\nBecause reference counting cannot resolve circular references, CPython runs a cyclic GC with three generations. Generation 0 contains newly allocated container objects. When Gen 0 survives a collection, it promotes objects to Gen 1, and eventually Gen 2. The heuristic is the Weak Generational Hypothesis: most objects die young, so Gen 0 is collected frequently, while long-lived objects in Gen 2 are scanned infrequently.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does memory management work in Python? Walk me through how CPython deallocates memory, how circular references are handled, and how you diagnose a memory leak in a long-running microservice.',
      framework: [
        { time: '0-15s', point: 'Dual Architecture: Primary Reference Counting for immediate deterministic cleanup; Generational Cyclic GC for circular references.' },
        { time: '15-45s', point: 'CPython Internals: PyObject ob_refcnt field, pymalloc allocator with arenas/pools/blocks for objects <= 512 bytes, Gen 0/1/2 thresholds.' },
        { time: '45-60s', point: 'Production Diagnostics: Diagnose leaks with tracemalloc, objgraph, or gc.set_debug(); resolve circular references with weakref or explicit teardown.' }
      ],
      spokenScript: `"CPython uses a hybrid memory management model combining real-time Reference Counting with a Generational Cyclic Garbage Collector. Every Python object tracks its reference count in an 'ob_refcnt' header. The instant an object's reference count drops to zero, its memory is returned immediately to CPython's small-object allocator, 'pymalloc'.\n\nHowever, reference counting alone cannot reclaim circular references—where object A references B, and B references A. To solve this, Python runs a generational garbage collector with three generations based on the hypothesis that most objects die young. When allocation thresholds are crossed, the cyclic collector performs graph traversal to detect isolated reference cycles and reclaim them.\n\nIn production backends, if we observe memory creeping upward in worker pods, we use Python's 'tracemalloc' module and 'objgraph' to inspect object allocations between requests, identify dangling closures or circular references, and break cycles using 'weakref'."`,
      buzzwords: ['Reference counting (ob_refcnt)', 'Generational cyclic GC', 'pymalloc allocator (Arenas/Pools)', 'Circular reference leak', 'tracemalloc & objgraph', 'weakref module'],
      juniorMistake: 'Claiming Python uses a Java-style mark-and-sweep collector for all objects and not knowing that reference counting is the primary mechanism.'
    }
  },

  // Q5: Generators vs Iterators
  5: {
    id: 5,
    docSpecs: {
      overview: 'All generators are iterators, but not all iterators are generators. An iterator is any object conforming to the Python Iterator Protocol by implementing `__iter__()` (returning `self`) and `__next__()` (returning the next value or raising `StopIteration`). A generator is a specialized iterator produced either by a function containing the `yield` keyword or a generator expression `(...)`, where CPython automatically manages state preservation and stack suspension.',
      table: {
        headers: ['Attribute', 'Custom Class Iterator', 'Generator Function (`yield`)'],
        rows: [
          ['Implementation', 'Requires writing a class with `__init__`, `__iter__`, and `__next__`', 'A standard function containing one or more `yield` statements'],
          ['State Management', 'Manual: developer explicitly tracks index and state on `self`', 'Automatic: CPython suspends local frame variables and instruction pointer'],
          ['Termination', 'Explicitly `raise StopIteration` when done', 'Automatic: normal function return automatically raises `StopIteration`'],
          ['Boilerplate Code', 'High: requires 15-20 lines of class scaffolding', 'Minimal: typically 3-5 lines of code'],
          ['Memory Footprint', 'Constant O(1) auxiliary space', 'Constant O(1) auxiliary space']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Frame Suspension Under the Hood',
          content: 'When a generator yields, CPython suspends its execution frame (`PyFrameObject`), preserving local variables on the evaluation stack. When `next()` is called again, execution resumes at the exact bytecode offset following `YIELD_VALUE`.'
        },
        {
          type: 'caution',
          title: 'Single-Pass Exhaustion',
          content: 'Generators and iterators are single-pass pipelines. Once consumed by a loop, comprehension, or `list()`, they are exhausted. Running a second loop over an exhausted generator produces 0 items silently without raising an exception.'
        }
      ],
      commands: [
        {
          label: 'Iterator Class vs Generator Function Comparison',
          cmd: `# 1. Generator Function with yield\ndef countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\ngen = countdown(3)\nprint(next(gen))  # 3\nprint(next(gen))  # 2\nprint(next(gen))  # 1\n# print(next(gen)) -> raises StopIteration`,
          lang: 'python',
          description: 'Standard generator execution using yield and manual next() invocations.'
        }
      ],
      didYouKnow: {
        title: '💡 Generator Two-Way Communication with .send()',
        content: 'Generators are coroutines! In addition to yielding values out, you can pass values into a suspended generator using `gen.send(val)`, which resumes the generator and evaluates the `yield` expression to `val`.'
      }
    },
    challenge: {
      title: 'Building an Iterator Protocol vs Generator Function Drill',
      steps: [
        'Implement a custom Iterator class with `__iter__()` and `__next__()` that raises `StopIteration`.',
        'Implement the exact same sequence logic using a Generator function with `yield`.',
        'Iterate through both using `list()` and compare execution brevity.',
        'Demonstrate that a consumed generator cannot be reused without re-instantiation.'
      ],
      codeSnippet: `# 1. Class-based Iterator Protocol
class CountUpTo:
    def __init__(self, limit):
        self.limit = limit
        self.curr = 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.curr > self.limit:
            raise StopIteration
        val = self.curr
        self.curr += 1
        return val

# 2. Generator Function (cleaner equivalent)
def count_up_to_gen(limit):
    curr = 1
    while curr <= limit:
        yield curr
        curr += 1

print("Iterator Class:", list(CountUpTo(3)))
print("Generator Yield:", list(count_up_to_gen(3)))

# Single pass demonstration
g = count_up_to_gen(2)
print("Pass 1:", list(g))
print("Pass 2 (Exhausted):", list(g))`,
      expectedOutput: `Iterator Class: [1, 2, 3]
Generator Yield: [1, 2, 3]
Pass 1: [1, 2]
Pass 2 (Exhausted): []`,
      interviewQuestion: 'What bytecode and frame mechanics occur when a function containing "yield" is invoked versus when next() is called on it?',
      interviewAnswer: 'When a function contains the "yield" keyword, the Python compiler sets the CO_GENERATOR flag in its code object. Calling the function does NOT execute any code; instead, CPython creates and returns a generator iterator object wrapping a suspended frame (PyFrameObject).\n\nWhen next() is called, CPython resumes the frame, executing bytecode until it hits YIELD_VALUE. At that point, the yielded value is pushed to the caller, and the frame is paused, preserving its instruction pointer and local variable array. When the function returns, CPython raises StopIteration.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain the difference between a generator and an iterator in Python? If an interviewer asks you how the Python runtime manages stack state during a yield statement, how do you explain it?',
      framework: [
        { time: '0-15s', point: 'Relationship: Every generator is an iterator; an iterator implements __iter__ and __next__, while a generator uses yield to automate state suspension.' },
        { time: '15-45s', point: 'Frame Suspension: Generator functions return a generator object; calling next() resumes its execution frame until YIELD_VALUE pauses execution.' },
        { time: '45-60s', point: 'Production Application: Use generators for streaming big data, chunked file parsers, and custom ETL pipelines to prevent OOM memory spikes.' }
      ],
      spokenScript: `"In Python, every generator is an iterator, but generators provide a far more concise, declarative way to implement the iterator protocol. An iterator is any Python class that implements '__iter__()' returning itself, and '__next__()' returning values sequentially until raising 'StopIteration'.\n\nA generator eliminates manual state bookkeeping by using the 'yield' keyword. When Python compiles a function containing 'yield', it flags it as a generator factory. Calling it returns a generator object without running the body. When 'next()' is invoked, CPython resumes execution of the function's internal frame until it encounters 'yield'. It yields the value and suspends the entire stack frame—including local variables and instruction pointer—in heap memory with O(1) auxiliary space.\n\nIn backend production systems, I use generators whenever streaming data—such as chunking large database querysets or processing gigabyte log files—so our worker processes never exceed their container memory limits."`,
      buzzwords: ['Iterator Protocol (__iter__ / __next__)', 'Frame suspension (PyFrameObject)', 'YIELD_VALUE bytecode', 'Lazy evaluation pipeline', 'StopIteration exception'],
      juniorMistake: 'Failing to explain that generators preserve stack frame state on heap, or thinking an iterator and iterable are the same thing.'
    }
  },

  // Q6: __init__ keyword
  6: {
    id: 6,
    docSpecs: {
      overview: 'In Python, `__init__` is an instance initializer method, not the constructor. Object construction is actually a two-stage lifecycle: the static allocator method `__new__(cls, *args, **kwargs)` creates and returns a raw, uninitialized instance of the class in heap memory, and Python then automatically passes that newly created instance as `self` to `__init__(self, *args, **kwargs)` to initialize its instance attributes.',
      table: {
        headers: ['Lifecycle Method', 'Method Signature', 'Primary Responsibility', 'Return Value Requirement'],
        rows: [
          ['`__new__` (Allocator)', '`def __new__(cls, *args, **kwargs)`', 'Allocates heap memory and creates the PyObject instance', 'Must return a newly created object instance (`super().__new__(cls)`)'],
          ['`__init__` (Initializer)', '`def __init__(self, *args, **kwargs)`', 'Initializes instance attributes on the already created `self`', 'Must return `None` (returning any value raises `TypeError`)']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: '__init__ Return Value Rule',
          content: '`__init__` must always return `None`. If you attempt to return anything else (e.g. `return self` or `return True`), Python raises `TypeError: __init__() should return None, not \'...\'`.'
        },
        {
          type: 'tip',
          title: 'When to Override __new__ vs __init__',
          content: 'Override `__init__` for standard object attribute setup. Only override `__new__` when subclassing immutable types (like `int`, `str`, or `tuple`) or when implementing design patterns like Singleton, Flyweight, or Metaclass factories.'
        }
      ],
      commands: [
        {
          label: 'Two-Stage Object Lifecycle (__new__ vs __init__)',
          cmd: `class DatabasePool:\n    def __new__(cls, *args, **kwargs):\n        print("1. __new__ allocating memory for class:", cls.__name__)\n        instance = super().__new__(cls)\n        return instance\n\n    def __init__(self, dsn):\n        print("2. __init__ binding attributes to instance:", self)\n        self.dsn = dsn\n\npool = DatabasePool("postgres://localhost:5432/db")`,
          lang: 'python',
          description: 'Tracing how CPython calls __new__ to create the instance before passing it into __init__.'
        }
      ],
      didYouKnow: {
        title: '💡 Singleton Implementation Hook',
        content: 'Because `__new__` controls instance creation, you can implement a thread-safe Singleton by intercepting `__new__` to return a cached `cls._instance` rather than allocating a new object each time.'
      }
    },
    challenge: {
      title: 'Tracing __new__ vs __init__ & Singleton Implementation Drill',
      steps: [
        'Define a class `ServiceConfig` that overrides both `__new__` and `__init__`.',
        'Print when `__new__` runs and what it receives as `cls`.',
        'Print when `__init__` runs and what it receives as `self`.',
        'Implement a Singleton check in `__new__` so multiple instantiations return the exact same object reference (`id(a) == id(b)`).'
      ],
      codeSnippet: `class ServiceConfig:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            print("Allocating NEW Singleton instance")
            cls._instance = super().__new__(cls)
        else:
            print("Returning EXISTING Singleton instance")
        return cls._instance

    def __init__(self, service_name):
        self.service_name = service_name

# Test Singleton behavior
s1 = ServiceConfig("AuthService")
s2 = ServiceConfig("BillingService")

print("s1 name:", s1.service_name)
print("s2 name:", s2.service_name)
print("Are s1 and s2 the exact same object?", s1 is s2)`,
      expectedOutput: `Allocating NEW Singleton instance
Returning EXISTING Singleton instance
s1 name: BillingService
s2 name: BillingService
Are s1 and s2 the exact same object? True`,
      interviewQuestion: 'Why is __init__ called an initializer rather than a constructor in Python? What happens if __new__ returns an instance of a different class?',
      interviewAnswer: 'In Python, __new__ is the actual constructor: it is a static method responsible for creating and returning a new instance of the class from heap memory. __init__ is purely an initializer called after the instance already exists to set attributes on self.\n\nCritically, Python checks the type of the object returned by __new__: if __new__ returns an instance of cls, Python immediately calls cls.__init__(instance, ...). However, if __new__ returns an instance of a completely different class, Python deliberately SKIPS calling __init__ altogether, leaving initialization to the caller.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the role of the __init__ method in Python? How does it differ from __new__, and in what production scenarios would you need to override __new__ instead of __init__?',
      framework: [
        { time: '0-15s', point: 'Constructor vs Initializer: __new__ is the constructor that creates the instance; __init__ is the initializer that populates instance attributes on self.' },
        { time: '15-45s', point: 'Lifecycle Order: Python executes cls.__new__() first, allocates memory, and if an instance of cls is returned, passes it into __init__(self).' },
        { time: '45-60s', point: 'Production Scenarios: Override __init__ 99% of the time; override __new__ for immutable subclasses (tuple/int), Metaclasses, and Singletons.' }
      ],
      spokenScript: `"In Python, '__init__' is an instance initializer rather than the constructor. Object creation is a two-step process: CPython first calls the static method '__new__(cls)' which allocates memory and creates the raw object instance. Once that instance exists, Python passes it as 'self' to '__init__(self)' to bind instance attributes and state.\n\n'__init__' must always return 'None'. Attempting to return any other value raises a TypeError. In 99% of backend code, you only need to override '__init__' to set up database connections, API clients, or domain entity fields.\n\nYou only override '__new__' in specialized production cases: first, when customizing subclasses of immutable built-in types like 'tuple' or 'str', where attributes cannot be set after instantiation; second, when implementing the Singleton pattern to return a cached instance; and third, in custom metaclasses that dynamically manipulate class creation at import time."`,
      buzzwords: ['Two-stage initialization', '__new__ (allocator) vs __init__ (initializer)', 'PyObject heap allocation', 'Singleton pattern', 'Immutable subclassing', 'TypeError on __init__ return'],
      juniorMistake: 'Calling __init__ the constructor and not knowing that __new__ exists or that __init__ must return None.'
    }
  },

  // Q7: Modules vs Packages
  7: {
    id: 7,
    docSpecs: {
      overview: 'In Python, a module is a single `.py` source file containing executable code, classes, and functions intended for reuse. A package is a hierarchical directory containing multiple modules (and sub-packages), traditionally designated by an `__init__.py` file (and namespace packages under PEP 420). Both are loaded as `types.ModuleType` objects and cached in `sys.modules`, but packages have a `__path__` attribute that instructs CPython where to search for submodules.',
      table: {
        headers: ['Characteristic', 'Python Module', 'Python Package', 'Senior Architecture Implication'],
        rows: [
          ['Physical Structure', 'Single file with `.py` extension (e.g. `auth.py`)', 'Directory containing modules and `__init__.py` (e.g. `auth/`)', 'Packages allow decomposing monolithic files into cohesive domain modules without breaking imports.'],
          ['Path Attribute', 'No `__path__` attribute (`hasattr(mod, "__path__") == False`)', 'Has `__path__` list pointing to folder directory', '`__path__` informs CPython import machinery where to resolve nested dot-notation imports.'],
          ['Initialization File', 'None (module file body runs on import)', 'Traditionally requires `__init__.py` (optional in PEP 420)', '`__init__.py` defines package-level exports via `__all__` and prevents internal leaks.'],
          ['sys.modules Key', '`sys.modules["auth"]`', '`sys.modules["auth"]` and `sys.modules["auth.views"]`', 'All imports are cached globally; circular imports cause partial initialization failures.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'PEP 420 Implicit Namespace Packages',
          content: 'Since Python 3.3, a directory without `__init__.py` is treated as an implicit namespace package. This allows splitting portions of a single logical package across multiple independent directories or zip files on `sys.path`.'
        },
        {
          type: 'caution',
          title: 'sys.modules Import Caching & Circular Imports',
          content: 'Python executes module code on the first import and caches the module in `sys.modules`. If Module A imports Module B while Module B imports Module A, Module B receives a partially initialized Module A object, causing an `ImportError: cannot import name ... from partially initialized module`.'
        }
      ],
      commands: [
        {
          label: 'Module vs Package Introspection',
          cmd: `import math\nimport urllib\nimport urllib.request\n\n# math is a single module (C-extension/file)\nprint("math has __path__?", hasattr(math, "__path__"))  # False\n\n# urllib is a package\nprint("urllib has __path__?", hasattr(urllib, "__path__"))  # True\nprint("urllib __path__:", urllib.__path__)`,
          lang: 'python',
          description: 'Demonstrating that packages contain a __path__ attribute while single-file modules do not.'
        }
      ],
      didYouKnow: {
        title: '💡 Controlling Public API with __all__',
        content: 'Defining `__all__ = ["AuthService", "User"]` in a package\'s `__init__.py` explicitly restricts which symbols are imported when someone runs `from my_package import *`, preventing internal helper functions or third-party imports from polluting consumer namespaces.'
      }
    },
    challenge: {
      title: 'sys.modules Caching & Circular Dependency Diagnosis Drill',
      steps: [
        'Import `sys`, `math`, and `urllib`.',
        'Verify that `hasattr(math, "__path__")` is False (module) and `hasattr(urllib, "__path__")` is True (package).',
        'Inspect `sys.modules` to observe that imported modules are stored in a global dictionary.',
        'Simulate a circular import scenario and explain the exact mechanism causing `ImportError`.'
      ],
      codeSnippet: `import sys
import math
import urllib

# 1. Inspect module vs package
print("math type:", type(math))
print("math has __path__:", hasattr(math, "__path__"))

print("urllib type:", type(urllib))
print("urllib has __path__:", hasattr(urllib, "__path__"))
print("urllib __path__:", urllib.__path__[0].split("/")[-1])

# 2. Inspect sys.modules cache
print("Is math in sys.modules?", "math" in sys.modules)
print("Is urllib in sys.modules?", "urllib" in sys.modules)`,
      expectedOutput: `math type: <class 'module'>
math has __path__: False
urllib type: <class 'module'>
urllib has __path__: True
urllib __path__: urllib
Is math in sys.modules? True
Is urllib in sys.modules? True`,
      interviewQuestion: 'What is the architectural difference between a module and a package, and what exact exception occurs when a circular import happens between two sibling modules in a package? How do you resolve it in production?',
      interviewAnswer: 'A module is a single Python file (.py) containing definitions and executable statements, whereas a package is a directory of modules containing a __path__ attribute and traditionally an __init__.py file. Both evaluate to types.ModuleType objects in sys.modules.\n\nWhen Module A imports Module B, and Module B imports Module A, Python raises "ImportError: cannot import name ... from partially initialized module". This occurs because Python adds Module A to sys.modules BEFORE executing its body. When A hits "from B import func_b", execution jumps to B. When B encounters "from A import func_a", func_a has not been defined yet because A is suspended.\n\nTo resolve circular imports: 1) Refactor shared functions or models into a third leaf module (e.g., common.py or types.py), 2) Use absolute top-level imports, or 3) Defer the import inside the specific function that uses it (local runtime import).',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does Python\'s import system distinguish between a module and a package, and how would you resolve a circular dependency between two modules in a large production Django/Flask codebase?',
      framework: [
        { time: '0-15s', point: 'Definition & Identification: A module is a single .py file; a package is a directory of modules containing a __path__ attribute (and __init__.py).' },
        { time: '15-45s', point: 'Import Mechanics: CPython creates an entry in sys.modules immediately on import; circular imports fail because the module is only partially initialized.' },
        { time: '45-60s', point: 'Production Resolution: Follow Dependency Inversion: extract shared logic into a leaf module (common.py) or use deferred local function imports.' }
      ],
      spokenScript: `"In Python, a module is a single .py source file that encapsulates classes, functions, and global scope. A package is a directory that groups multiple modules or sub-packages together, distinguished by having a '__path__' attribute and conventionally an '__init__.py' file.\n\nUnder the hood, both evaluate to 'types.ModuleType' objects and are cached in 'sys.modules'. The most common architectural failure in a growing backend package is circular dependencies. When Module A imports from Module B while Module B imports from Module A, CPython raises an ImportError because Module A is only partially initialized when B requests a symbol from it.\n\nIn our production architecture, we resolve this by following the Dependency Inversion Principle: we extract shared models, types, or utility functions into a separate leaf module like 'constants.py' or 'common.py' that neither module depends upon circularly. If extraction is infeasible due to legacy constraints, we defer the import inside the specific function scope where it is invoked."`,
      buzzwords: ['types.ModuleType', 'sys.modules cache', '__path__ attribute', 'Partially initialized module', 'PEP 420 Namespace Packages', 'Leaf module extraction'],
      juniorMistake: 'Saying "a package is just a folder" without knowing about __path__, sys.modules caching, or how to diagnose and resolve circular import AttributeErrors.'
    }
  },

  // Q8: Range vs Xrange
  8: {
    id: 8,
    docSpecs: {
      overview: 'In Python 2, `range()` was an eager function that allocated and returned a full `list` of integers in memory, while `xrange()` was a lazy generator-like object that computed numbers on demand. In Python 3, `xrange` was removed entirely, and `range` became an immutable sequence type that calculates values on the fly with O(1) constant memory regardless of range size, while also supporting O(1) membership testing and indexing.',
      table: {
        headers: ['Feature', 'Python 2 `range(n)`', 'Python 2 `xrange(n)`', 'Python 3 `range(n)`'],
        rows: [
          ['Return Type', '`list` (allocated array)', '`xrange` object (lazy sequence)', '`range` sequence object (lazy immutable sequence)'],
          ['Memory Complexity', 'O(N) heap space allocated immediately', 'O(1) constant memory', 'O(1) constant memory (~48 bytes)'],
          ['Indexing & Slicing', 'Supports full list indexing and slicing', 'Supports indexing, but limited slicing', 'Supports O(1) indexing, slicing, and len()'],
          ['Membership Testing (`in`)', 'O(N) linear search through list', 'O(N) linear iteration', 'O(1) mathematical bounds checking in C']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'O(1) Membership Testing in Python 3',
          content: 'In Python 3, `999_999_999 in range(1_000_000_000)` executes instantaneously in O(1) time! CPython does not iterate through the numbers; it uses arithmetic bounds checking: `(val >= start and val < stop and (val - start) % step == 0)`.'
        },
        {
          type: 'caution',
          title: 'Range is NOT an Iterator',
          content: 'A common misconception is that Python 3 `range` is an iterator. It is actually a lazy immutable sequence! Because it is not an iterator, `next(range(10))` raises `TypeError`. You can iterate over a range multiple times without exhausting it.'
        }
      ],
      commands: [
        {
          label: 'Memory Footprint & O(1) Membership Verification',
          cmd: `import sys\n\nr_small = range(10)\nr_huge = range(100_000_000)\n\n# Memory is identical regardless of size\nprint("Small range size:", sys.getsizeof(r_small), "bytes")\nprint("Huge range size:", sys.getsizeof(r_huge), "bytes")\n\n# O(1) Arithmetic Membership Check\nprint("Instant in check:", 99_999_999 in r_huge)`,
          lang: 'python',
          description: 'Showing that Python 3 range uses constant memory (~48 bytes) and instant mathematical containment checks.'
        }
      ],
      didYouKnow: {
        title: '💡 Reusability Difference',
        content: 'Because `range` in Python 3 is an immutable sequence (like a tuple) rather than an iterator (like a generator), it is NOT exhausted after a loop. You can pass the same `range` instance to multiple loops and it will iterate from the start each time.'
      }
    },
    challenge: {
      title: 'Range Memory Footprint & Sequence Verification Drill',
      steps: [
        'Import `sys`.',
        'Create `r1 = range(10)` and `r2 = range(10_000_000)`.',
        'Verify `sys.getsizeof(r1) == sys.getsizeof(r2)`.',
        'Verify that `range` supports multiple passes without exhaustion.',
        'Demonstrate that `next(range(5))` fails with `TypeError` because it is an iterable sequence, not an iterator.'
      ],
      codeSnippet: `import sys

r1 = range(10)
r2 = range(10_000_000)

print(f"Size of range(10): {sys.getsizeof(r1)} bytes")
print(f"Size of range(10M): {sys.getsizeof(r2)} bytes")

# 1. Multi-pass test
print("Pass 1 sum:", sum(r1))
print("Pass 2 sum:", sum(r1))  # Still works! Not exhausted!

# 2. Sequence indexing & slicing
print("Index lookup r2[500]:", r2[500])
print("Sliced range:", r2[10:20:2])

# 3. Range is NOT an iterator
try:
    next(r1)
except TypeError as err:
    print("next(range) error:", err)`,
      expectedOutput: `Size of range(10): 48 bytes
Size of range(10M): 48 bytes
Pass 1 sum: 45
Pass 2 sum: 45
Index lookup r2[500]: 500
Sliced range: range(10, 20, 2)
next(range) error: 'range' object is not an iterator`,
      interviewQuestion: 'Is Python 3\'s range an iterator or a sequence? How does Python evaluate "x in range(1_000_000_000)" in O(1) time?',
      interviewAnswer: 'In Python 3, range is an immutable sequence type, NOT an iterator. It implements the Sequence protocol (supporting __getitem__, __len__, and slicing) rather than the Iterator protocol (it lacks __next__). Because it is a sequence, it can be iterated over repeatedly without exhaustion.\n\nPython evaluates "x in range(start, stop, step)" in O(1) constant time without iterating through elements. It uses arithmetic bounds checking: verifying that x is within the start/stop boundary, and that (x - start) % step == 0. This executes in nanoseconds regardless of whether the range spans 10 items or 10 billion items.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What was the difference between range and xrange in Python 2, how does Python 3 handle ranges, and is range in Python 3 an iterator or an iterable sequence?',
      framework: [
        { time: '0-15s', point: 'Historical Context: Python 2 range created an eager list (O(N) memory); xrange was lazy (O(1) memory).' },
        { time: '15-45s', point: 'Python 3 Architecture: xrange was removed; range became an immutable lazy sequence with O(1) memory overhead (~48 bytes).' },
        { time: '45-60s', point: 'Sequence vs Iterator: range is an immutable sequence that supports multi-pass iteration, indexing, and O(1) arithmetic membership checks.' }
      ],
      spokenScript: `"Historically in Python 2, 'range()' was an eager function that allocated an entire list of integers in memory upfront with O(N) space complexity, while 'xrange()' was a lazy generator-like object that yielded numbers on demand with O(1) memory.\n\nIn Python 3, 'xrange' was eliminated, and 'range' became an immutable sequence type. Regardless of whether you specify 'range(10)' or 'range(10_000_000)', it consumes a constant 48 bytes of memory because it only stores start, stop, and step integers.\n\nCrucially, Python 3's range is a sequence, not an iterator. It supports multi-pass iteration without exhaustion, supports O(1) random access indexing via '__getitem__', and evaluates containment tests like 'x in range(...)' in O(1) time using arithmetic boundary math rather than iterative scanning."`,
      buzzwords: ['Immutable sequence', 'O(1) auxiliary space (~48 bytes)', 'Arithmetic bounds checking', 'Multi-pass iteration', 'Eager list allocation vs lazy evaluation'],
      juniorMistake: 'Claiming that Python 3 range is a generator or iterator, without realizing it can be iterated over multiple times and supports indexing.'
    }
  },

  // Q9: Generators Explained with Example
  9: {
    id: 9,
    docSpecs: {
      overview: 'Generators in Python are lightweight coroutine-like constructs that produce a stream of values lazily on demand. Defined as functions containing the `yield` statement, they allow execution to be suspended and resumed, preserving local variables across iterations. Generators enable processing massive streaming datasets (such as multi-gigabyte log files, API pagination streams, or infinite sequences) with constant O(1) memory consumption.',
      table: null,
      admonitions: [
        {
          type: 'tip',
          title: 'Streaming Large Files Line-by-Line',
          content: 'Never use `file.readlines()` on large production files because it loads the entire file into memory at once. A generator iterating with `for line in file:` streams one line at a time through a 8KB buffer, maintaining constant memory overhead.'
        },
        {
          type: 'warning',
          title: 'Generator Delegation with yield from',
          content: 'When refactoring nested generators, use `yield from subgen()` rather than `for item in subgen(): yield item`. `yield from` establishes a transparent bidirectional channel, forwarding `.send()`, `.throw()`, and return values directly between caller and subgenerator.'
        }
      ],
      commands: [
        {
          label: 'Streaming File Processor & Pipeline Composition',
          cmd: `def log_reader(lines):\n    for line in lines:\n        yield line.strip()\n\ndef filter_errors(log_stream):\n    for line in log_stream:\n        if "ERROR" in line:\n            yield line\n\nraw_logs = ["INFO: Booting", "ERROR: Connection timeout", "DEBUG: Query ok", "ERROR: OOM"]\npipeline = filter_errors(log_reader(raw_logs))\n\nfor err in pipeline:\n    print("Caught:", err)`,
          lang: 'python',
          description: 'Composing generator pipelines for memory-efficient data stream processing.'
        }
      ],
      didYouKnow: {
        title: '💡 Generator Return Value Contract',
        content: 'In Python 3.3+ (PEP 380), a generator function can execute a `return value` statement! When returned, the value is attached to the `StopIteration.value` attribute, allowing parent generators using `yield from` to capture the return value cleanly.'
      }
    },
    challenge: {
      title: 'Building a Memory-Efficient Streaming Pipeline Drill',
      steps: [
        'Write a generator `number_stream(limit)` that yields numbers from 1 to `limit`.',
        'Write a second generator `even_filter(stream)` that filters for even numbers.',
        'Write a third generator `square_mapper(stream)` that squares each incoming value.',
        'Chain the generators into a pipeline and verify that memory usage remains constant using `sys.getsizeof`.'
      ],
      codeSnippet: `import sys

# 1. Source Generator
def number_stream(limit):
    for i in range(1, limit + 1):
        yield i

# 2. Filter Generator
def even_filter(stream):
    for num in stream:
        if num % 2 == 0:
            yield num

# 3. Transformation Generator
def square_mapper(stream):
    for num in stream:
        yield num ** 2

# Pipeline execution
pipeline = square_mapper(even_filter(number_stream(10)))
print("Pipeline object size:", sys.getsizeof(pipeline), "bytes")
print("Processed values:", list(pipeline))`,
      expectedOutput: `Pipeline object size: ~104 bytes
Processed values: [4, 16, 36, 64, 100]`,
      interviewQuestion: 'How does "yield from" differ from a standard "for item in gen: yield item" loop? What bidirectional communication does it enable?',
      interviewAnswer: '"yield from" is not just syntactic sugar for a for-loop; it establishes a transparent two-way channel between the caller and the subgenerator (PEP 380). Under the hood:\n1) It forwards values sent via .send() directly to the subgenerator.\n2) It forwards exceptions raised via .throw() and .close() directly into the subgenerator.\n3) It captures the return value of the subgenerator: when the subgenerator executes "return result", that result becomes the evaluation value of the "yield from" expression, which a plain for-loop cannot do.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you walk me through a real-world production example of using generators in a Python backend? How do they help you process large datasets without blowing up server memory?',
      framework: [
        { time: '0-15s', point: 'Core Concept: Generators produce values lazily using yield, enabling streaming data pipelines with O(1) memory footprint.' },
        { time: '15-45s', point: 'Production Use Case: Processing gigabyte log files or database records line-by-line; chaining reader -> filter -> transformer pipelines.' },
        { time: '45-60s', point: 'Senior Best Practice: Use "yield from" for subgenerator delegation and avoid converting streams into lists until final pagination boundaries.' }
      ],
      spokenScript: `"In a backend production environment, generators are our primary tool for building streaming data pipelines with constant O(1) memory complexity. For instance, when ingesting multi-gigabyte CSV exports or server access logs from S3, loading the entire payload into a list causes immediate Out-Of-Memory container termination.\n\nInstead, we compose generator pipelines: a reader generator yields lines one by one from the streaming HTTP response socket; a downstream parser generator yields sanitized dictionaries; and a batching generator chunks records into groups of 1,000 for database bulk inserts. Each item moves through the pipeline lazily on demand without buffering the entire dataset in RAM.\n\nWe also leverage 'yield from' to delegate between subgenerators cleanly, ensuring exception propagation and coroutine 'send()' signals pass seamlessly through the pipeline."`,
      buzzwords: ['Streaming pipeline', 'O(1) memory overhead', 'yield from delegation (PEP 380)', 'Chunked bulk processing', 'Lazy stream evaluation'],
      juniorMistake: 'Writing a generator but wrapping it in list(gen) right away, destroying the lazy memory advantages.'
    }
  }
};

