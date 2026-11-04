// Python Days 13 to 15 (Questions 37 to 45)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_13_TO_15 = {
  // Q37: _a, __a and __a__
  37: {
    id: 37,
    docSpecs: {
      overview: 'Underscore naming patterns in Python communicate access intent and trigger CPython compiler mechanics. `_var` (single leading) is a PEP 8 convention indicating a protected/internal attribute. `__var` (double leading) triggers CPython Name Mangling to prevent accidental namespace collisions in inheritance hierarchies. `__var__` (double leading & trailing) designates Python special "dunder" methods reserved exclusively by the core language specification.',
      table: {
        headers: ['Pattern', 'Classification', 'CPython Runtime Mechanism', 'Visibility Scope', 'Senior Best Practice'],
        rows: [
          ['`_var`', 'Internal / Protected', 'Ignored by compiler; excluded from `from module import *`', 'Accessible anywhere, but flagged as private by IDEs', 'Use for internal helper methods and private implementation details.'],
          ['`__var`', 'Private (Name Mangled)', 'CPython rewrites attribute to `_ClassName__var`', 'Accessible via mangled name `obj._ClassName__var`', 'Use strictly to prevent subclass attribute name collisions.'],
          ['`__var__`', 'Dunder / Special Method', 'Hooked into language protocols (`__len__`, `__iter__`)', 'Public system hooks', 'NEVER invent custom dunders! Reserved exclusively by core Python.'],
          ['`var_`', 'Trailing Underscore', 'No compiler effect', 'Public identifier', 'Use to avoid shadowing Python keywords (e.g. `class_`, `id_`).']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Name Mangling is NOT Security',
          content: 'Double underscores do NOT encrypt or make variables inaccessible! Python simply rewrites `self.__secret` to `self._MyClass__secret`. Any developer or attacker can still access it directly via `obj._MyClass__secret`.'
        },
        {
          type: 'note',
          title: 'Wildcard Import Filtering with _',
          content: 'Prefixing a top-level module function with a single underscore (e.g. `def _helper():`) automatically excludes it from being imported when someone writes `from module import *`.'
        }
      ],
      commands: [
        {
          label: 'Verifying Name Mangling in Class __dict__',
          cmd: `class BaseService:\n    def __init__(self):\n        self.public_name = "Auth"\n        self._internal_cache = {}\n        self.__crypto_key = "SECRET_123"\n\ns = BaseService()\nprint("Public:", s.public_name)\nprint("Single _ (accessible):", s._internal_cache)\n\n# __crypto_key is mangled in s.__dict__\nprint("Mangled access:", s._BaseService__crypto_key)\nprint("Class dictionary keys:", list(s.__dict__.keys()))`,
          lang: 'python',
          description: 'Inspecting s.__dict__ to observe CPython attribute name mangling.'
        }
      ],
      didYouKnow: {
        title: '💡 Why Name Mangling Exists',
        content: 'Name mangling was designed specifically for complex inheritance trees: if `BaseClass` and `SubClass` both define a private helper `__setup()`, name mangling ensures `_BaseClass__setup` and `_SubClass__setup` coexist in the instance dictionary without overwriting each other!'
      }
    },
    challenge: {
      title: 'Name Mangling Inspection & Subclass Collision Prevention Drill',
      steps: [
        'Create a `Parent` class with `self.__id` and a `Child(Parent)` class that also sets `self.__id`.',
        'Verify that `Child` did NOT overwrite `Parent`\'s `__id` by inspecting `self.__dict__`.',
        'Access the mangled attributes directly using `_Parent__id` and `_Child__id`.',
        'Demonstrate that a single underscore `_helper` is excluded from wildcard exports.'
      ],
      codeSnippet: `class Parent:
    def __init__(self):
        self.__id = "PARENT_ID"

    def get_parent_id(self):
        return self.__id

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__id = "CHILD_ID"

    def get_child_id(self):
        return self.__id

c = Child()
print("Parent ID:", c.get_parent_id())
print("Child ID: ", c.get_child_id())

# Inspect internal dictionary
print("\\nInternal Instance __dict__:")
for k, v in c.__dict__.items():
    print(f"  {k} => {v}")`,
      expectedOutput: `Parent ID: PARENT_ID
Child ID:  CHILD_ID

Internal Instance __dict__:
  _Parent__id => PARENT_ID
  _Child__id => CHILD_ID`,
      interviewQuestion: 'What does Python\'s CPython compiler do when it encounters an identifier with two leading underscores? Why is it considered an anti-pattern to use double underscores for general private variables?',
      interviewAnswer: 'When CPython encounters an identifier with two leading underscores and at most one trailing underscore (e.g. `__id`), it performs Name Mangling: it textually rewrites the identifier to `_ClassName__id` before storing it in the class or instance `__dict__`.\n\nUsing `__var` for general private variables is considered an anti-pattern in modern Python for two reasons:\n1. It provides zero security benefit—it is still completely accessible via `obj._ClassName__var`.\n2. It severely harms debugging, logging, and unit testing because subclasses cannot easily inspect, mock, or override internal helpers.\n\nAccording to PEP 8, developers should use a single underscore `_var` for private/protected implementation details, and reserve double underscores `__var` exclusively to prevent accidental naming collisions in deep inheritance hierarchies.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What are the differences between _var, __var, and __var__ in Python? Explain Name Mangling, why Python does not have true private access modifiers, and what conventions senior engineers follow.',
      framework: [
        { time: '0-15s', point: 'Summary of Conventions: _var is a protected convention; __var triggers name mangling; __var__ designates core language dunder hooks.' },
        { time: '15-45s', point: 'Name Mangling Mechanics: CPython rewrites __attr to _ClassName__attr to prevent collision in subclasses; it is not security.' },
        { time: '45-60s', point: 'PEP 8 Standards: Follow "Consenting Adults"—use _var for internal implementation; never invent custom dunders; use var_ to avoid keyword collisions.' }
      ],
      spokenScript: `"In Python, underscores are used to convey architectural intent and trigger compiler behaviors across three distinct patterns.\n\nA single leading underscore—like '_cache'—is a PEP 8 convention indicating that an attribute or method is protected and intended for internal module or class use. It is not enforced by the compiler, but it signals to developers and IDEs that the interface is private, and it prevents wildcard imports with 'from module import *'.\n\nA double leading underscore—like '__api_key'—triggers CPython's Name Mangling mechanism. The compiler automatically rewrites the attribute name to '_ClassName__api_key' in the instance dictionary. This is not designed for security or data hiding—it can still be accessed directly—but to prevent accidental attribute collisions in complex inheritance hierarchies where a subclass might inadvertently use the same variable name.\n\nFinally, double leading and trailing underscores—like '__init__' or '__enter__'—are reserved exclusively for Python's built-in special dunder methods. A strict rule in our engineering team is to never invent custom dunder methods, as future Python releases might introduce conflicting language protocols with the same name."`,
      buzzwords: ['Name mangling (_ClassName__attr)', 'PEP 8 naming conventions', 'Dunder special methods', 'Subclass collision prevention', 'Consenting adults philosophy', 'Wildcard export filtering'],
      juniorMistake: 'Claiming __var creates a secure private variable that cannot be accessed outside the class.'
    }
  },

  // Q38: Reading Multiple Values from Input
  38: {
    id: 38,
    docSpecs: {
      overview: 'Reading multiple values from standard input in Python utilizes `input().split()`, which reads a string from `sys.stdin` and tokenizes it by whitespace into a list of strings. Converting these strings into typed values (such as integers or floats) is accomplished idiomatically using `map()`. In high-throughput algorithmic processing or stream ingestion, replacing `input()` with `sys.stdin.readline` bypasses buffer overhead for significant performance gains.',
      table: null,
      admonitions: [
        {
          type: 'tip',
          title: 'sys.stdin.readline vs input() for Competitive / Bulk I/O',
          content: '`input()` has substantial overhead because it strips trailing newlines and interacts with standard I/O streams. In high-performance data processing or competitive programming, `sys.stdin.readline()` is 2-4x faster because it reads directly from the OS C buffer without pre-processing.'
        },
        {
          type: 'note',
          title: 'split() Default Whitespace Behavior',
          content: 'Calling `s.split()` with no arguments splits on arbitrary consecutive whitespace (spaces, tabs, newlines) and discards empty tokens. Calling `s.split(" ")` strictly splits on single spaces, leaving empty strings for consecutive spaces.'
        }
      ],
      commands: [
        {
          label: 'Multiple Input Extraction Patterns',
          cmd: `# 1. Reading multiple integers on one line\n# raw_line = "10 20 30 40 50"\nline = "10 20 30 40 50"\nnumbers = list(map(int, line.split()))\nprint("Parsed numbers:", numbers)\n\n# 2. Unpacking exact values\nx, y, z = map(int, "100 200 500".split())\nprint(f"Coordinates: x={x}, y={y}, z={z}")`,
          lang: 'python',
          description: 'Extracting and casting multiple tokens from whitespace-delimited input lines.'
        }
      ],
      didYouKnow: {
        title: '💡 Walrus Operator Stream Parsing',
        content: 'You can stream input lines continuously until EOF using the walrus operator: `while (line := sys.stdin.readline()): process(line)`.'
      }
    },
    challenge: {
      title: 'High-Throughput Input Parsing & Unpacking Drill',
      steps: [
        'Parse a whitespace-delimited string of floats into a list of numbers using `map`.',
        'Unpack a line with variable components: `command, *args = "SET user:101 session_token_xyz 3600".split()`.',
        'Compare string splitting behavior: `s.split()` vs `s.split(" ")` with consecutive spaces.',
        'Benchmark line parsing efficiency.'
      ],
      codeSnippet: `# 1. Star unpacking on command inputs
command_line = "SET user:101 session_token_xyz 3600"
action, key, *options = command_line.split()

print("Action:", action)
print("Target Key:", key)
print("Options List:", options)

# 2. Whitespace splitting difference
consecutive_spaces = "user    admin    active"
print("Default split():    ", consecutive_spaces.split())
print("Explicit split(' '):", consecutive_spaces.split(" "))

# 3. High-throughput parsing
raw_stream = "10 25 40 90 120"
parsed_ints = [int(token) for token in raw_stream.split()]
print("Parsed Integers:", parsed_ints)`,
      expectedOutput: `Action: SET
Target Key: user:101
Options List: ['session_token_xyz', '3600']
Default split():     ['user', 'admin', 'active']
Explicit split(' '): ['user', '', '', '', 'admin', '', '', '', 'active']
Parsed Integers: [10, 25, 40, 90, 120]`,
      interviewQuestion: 'What is the performance difference between input() and sys.stdin.readline()? How does s.split() handle consecutive whitespace compared to s.split(" ")?',
      interviewAnswer: '`input()` has higher overhead than `sys.stdin.readline()` because `input()` prompts the terminal, handles line ending conversion, strips the trailing `\\n` character, and raises an `EOFError` when input terminates. `sys.stdin.readline()` reads directly from the underlying C buffer, preserves the trailing `\\n`, and returns an empty string `""` on EOF, making it 2x to 4x faster for bulk I/O.\n\nRegarding `.split()`: calling `s.split()` without arguments treats any sequence of consecutive whitespace characters (spaces, tabs, newlines) as a single delimiter and strips leading/trailing whitespace. Calling `s.split(" ")` with an explicit space delimiter does NOT collapse whitespace, producing multiple empty string elements `""` whenever consecutive spaces occur.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you read and parse multiple values from standard input in Python efficiently? Walk me through the differences between input() and sys.stdin.readline(), and how to handle structured CLI input.',
      framework: [
        { time: '0-15s', point: 'Idiomatic Parsing: Use map(int, input().split()) or list comprehensions for whitespace tokenization.' },
        { time: '15-45s', point: 'Throughput Optimization: sys.stdin.readline() bypasses prompt/newline stripping overhead, critical for processing massive data streams.' },
        { time: '45-60s', point: 'Production CLI Architecture: For real CLI tools, replace raw input() with libraries like click, argparse, or sys.argv for type validation and help flags.' }
      ],
      spokenScript: `"In Python, reading multiple values from a single line of input is idiomatically achieved using 'map()' paired with 'split()'—for instance, 'x, y, z = map(int, input().split())'. The 'split()' method tokenizes the input string by whitespace, and 'map' applies the type constructor to each element lazily.\n\nIn performance-critical data processing or competitive coding where millions of lines must be parsed, 'input()' becomes an I/O bottleneck because it intercepts signals, manages terminal prompts, and strips trailing newlines. Replacing 'input()' with 'sys.stdin.readline()' provides a significant 3x speedup because it reads directly from the OS C buffer without pre-processing.\n\nHowever, in backend production environments, we rarely read raw standard input interactively. For background batch workers or CLI utilities, we use structured argument parsers like 'argparse' or 'Click' to provide automated type casting, validation, and help flags, or we stream structured JSON lines directly over Unix pipes."`,
      buzzwords: ['map() and split() pipeline', 'sys.stdin.readline buffer speed', 'Consecutive whitespace collapsing', 'Extended iterable unpacking (*rest)', 'Click / Argparse CLI frameworks', 'Unix pipeline streaming'],
      juniorMistake: 'Calling input() in a loop over millions of lines and causing timeout failures due to input() pre-processing overhead.'
    }
  },

  // Q39: Copy and Delete a Dictionary
  39: {
    id: 39,
    docSpecs: {
      overview: 'Copying and deleting dictionaries in Python involve distinct memory and mutation semantics. Direct assignment (`d2 = d1`) creates an alias pointing to the exact same hash table in memory. `d.copy()` creates a shallow copy where the container is new but nested mutable objects are shared. Deep copies require `copy.deepcopy()`. Deleting keys can be performed via `del d[k]`, `d.pop(k, default)` (safe removal returning value), `d.popitem()` (LIFO removal), or `d.clear()` (emptying in-place).',
      table: {
        headers: ['Operation', 'Syntax', 'Returns Value?', 'Key Not Found Behavior', 'Memory Impact'],
        rows: [
          ['`del` Statement', '`del d[k]`', 'NO (statement)', 'Raises `KeyError`', 'Deletes entry from hash table; decrements object refcount.'],
          ['`dict.pop()`', '`d.pop(k, default)`', 'YES (returns value)', 'Returns default fallback (or raises `KeyError` if no default)', 'Safest for backend APIs; extracts value and cleans dict.'],
          ['`dict.clear()`', '`d.clear()`', 'NO (returns `None`)', 'Safe (no error on empty dict)', 'Empties the existing hash table in-place without reallocating `id(d)`.'],
          ['Shallow Copy', '`d.copy()` / `dict(d)`', 'Returns new `dict`', 'N/A', 'New top-level dict; nested objects remain shared.'],
          ['Deep Copy', '`copy.deepcopy(d)`', 'Returns new `dict`', 'N/A', 'Recursively duplicates all nested objects across heap.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Direct Assignment is NOT a Copy',
          content: 'Writing `b = a` does NOT copy the dictionary! `b` is merely a reference alias pointing to the same memory address (`id(a) == id(b)`). Mutating `b` will mutate `a`.'
        },
        {
          type: 'tip',
          title: 'Prefer pop() with Default over del',
          content: 'In production APIs, prefer `user.pop("password", None)` over `del user["password"]`. If the key is already missing, `pop` silently returns `None` without raising an unhandled `KeyError`.'
        }
      ],
      commands: [
        {
          label: 'Safe Key Deletion & Shallow vs Deep Copy',
          cmd: `import copy\n\noriginal = {"user": "bob", "meta": {"role": "ADMIN"}}\n\n# Shallow copy: nested dict is SHARED\nshallow = original.copy()\nshallow["meta"]["role"] = "GUEST"\nprint("Original role corrupted by shallow copy:", original["meta"]["role"])  # GUEST!\n\n# Deep copy: nested dict is INDEPENDENT\ndeep = copy.deepcopy(original)\ndeep["meta"]["role"] = "SUPERADMIN"\nprint("Original role safe after deepcopy:", original["meta"]["role"])        # GUEST!`,
          lang: 'python',
          description: 'Demonstrating the shallow copy mutation trap and deepcopy isolation.'
        }
      ],
      didYouKnow: {
        title: '💡 del Keyword vs Garbage Collection',
        content: '`del d["key"]` does not directly "delete memory"; it simply removes the key from the dictionary and decrements the target object\'s reference count. Memory is freed only if the reference count reaches zero.'
      }
    },
    challenge: {
      title: 'Dictionary Copy Mutability & Safe Deletion Drill',
      steps: [
        'Demonstrate that direct assignment creates an alias (`a is b`).',
        'Demonstrate that shallow copy `d.copy()` shares nested dictionaries.',
        'Use `copy.deepcopy()` to create completely decoupled data structures.',
        'Safely remove sensitive fields from a payload using `dict.pop(key, None)`.'
      ],
      codeSnippet: `import copy

# 1. Assignment vs Shallow Copy
config = {"env": "prod", "db": {"port": 5432}}
alias = config
shallow = config.copy()

print("Is alias identical object?  ", alias is config)
print("Is shallow identical object?", shallow is config)
print("Is nested db shared in shallow?", shallow["db"] is config["db"])

# 2. Deepcopy Isolation
deep = copy.deepcopy(config)
deep["db"]["port"] = 9999
print("Original DB Port after deepcopy modification:", config["db"]["port"])

# 3. Safe Deletion Patterns
payload = {"username": "alice", "token": "xyz123"}

# Safe removal of token
token = payload.pop("token", None)
print("Extracted token:", token)

# Safe removal of non-existent key (doesn't crash)
missing = payload.pop("credit_card", "NOT_FOUND")
print("Missing key fallback:", missing)`,
      expectedOutput: `Is alias identical object?   True
Is shallow identical object? False
Is nested db shared in shallow? True
Original DB Port after deepcopy modification: 5432
Extracted token: xyz123
Missing key fallback: NOT_FOUND`,
      interviewQuestion: 'What is the mechanical difference between del d[k] and d.pop(k, None)? What happens to reference counts when a key is deleted from a dictionary?',
      interviewAnswer: '`del d[k]` is a Python language statement that removes the hash table entry for key `k`. If `k` is missing from the dictionary, it raises an unhandled `KeyError` unless wrapped in a `try/except` block.\n\n`d.pop(k, default)` is an atomic dictionary method that removes the entry and returns its associated value. If `k` does not exist and a default is provided, it returns the default without raising an exception, making it safer and more idiomatic for backend sanitization.\n\nMechanically, when an entry is deleted from a dictionary, CPython decrements the reference count (`ob_refcnt`) of both the key object and the value object. If either object\'s reference count drops to zero and it is not part of a reference cycle, its memory is freed immediately.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you copy and delete dictionaries in Python? Compare shallow copying with deep copying, and explain safe key deletion practices in backend API serialization.',
      framework: [
        { time: '0-15s', point: 'Copy Semantics: Assignment creates an alias; d.copy() creates a shallow copy sharing nested objects; deepcopy recursively copies all objects.' },
        { time: '15-45s', point: 'Deletion Practices: del raises KeyError if key is absent; dict.pop(k, None) safely removes and returns the value without throwing.' },
        { time: '45-60s', point: 'Production Sanitation: Use pop() or dictionary comprehensions to sanitize sensitive fields (passwords, tokens) before serializing responses.' }
      ],
      spokenScript: `"When managing dictionaries in backend services, developers must be extremely careful regarding copying semantics and mutation. Direct assignment—'b = a'—simply creates a new pointer alias to the exact same hash table in memory.\n\nTo clone a dictionary, Python provides shallow copies via 'd.copy()'. However, in a shallow copy, nested mutable structures—such as inner dictionaries or lists—remain shared references. Modifying a nested dictionary in the copy will mutate the original payload. If total isolation is required, we use 'copy.deepcopy()', which traverses the entire object graph and recursively allocates fresh objects on the heap.\n\nFor deleting keys, while 'del d[key]' exists, it raises a fatal 'KeyError' if the key is missing. In our production APIs, when sanitizing user payloads to remove sensitive attributes like passwords, we strictly use 'user_dict.pop(\"password\", None)'. This atomically extracts and removes the sensitive key if present, and returns None without raising an error if it was already absent."`,
      buzzwords: ['Pointer aliasing (a is b)', 'Shallow copy vs Deep copy (copy.deepcopy)', 'Object graph traversal', 'dict.pop(key, default) safe pattern', 'KeyError prevention', 'Payload sanitization'],
      juniorMistake: 'Using shallow copy on nested JSON payloads and inadvertently mutating state across requests, or using del without checking if the key exists.'
    }
  },

  // Q40: Lambda Functions in Python
  40: {
    id: 40,
    docSpecs: {
      overview: 'Lambda functions in Python (introduced via the `lambda` keyword) are small, anonymous functions restricted to a single expression. Under the hood, Python compiles a lambda into a standard `types.FunctionType` object with its code object flagged with `name = "<lambda>"`. Because they cannot contain statements (like `return`, `pass`, or `raise`), their primary backend use case is inline callables passed to higher-order functions like `sorted()`, `min()`, `max()`, and event callbacks.',
      table: null,
      admonitions: [
        {
          type: 'caution',
          title: 'The Late-Binding Closure Trap in Loops',
          content: 'Python closures bind variables by reference (name lookup), NOT by value! If you define lambdas in a loop (`[lambda: i for i in range(5)]`), all lambdas evaluate to the FINAL loop value (4) when invoked! To fix this, bind the variable as a default argument: `lambda i=i: i`.'
        },
        {
          type: 'tip',
          title: 'PEP 8: Do Not Assign Lambdas to Variables',
          content: 'Never write `f = lambda x: x * 2`. PEP 8 explicitly states to write `def f(x): return x * 2`. Assigning a lambda removes any benefit over `def` while stripping the function of a meaningful `__name__`, breaking stack traces and profiling.'
        }
      ],
      commands: [
        {
          label: 'Sorting Complex Records with Lambda Key Functions',
          cmd: `orders = [\n    {"id": 1, "amount": 250.0, "status": "COMPLETED"},\n    {"id": 2, "amount": 49.99, "status": "PENDING"},\n    {"id": 3, "amount": 890.0, "status": "COMPLETED"}\n]\n\n# Sort descending by transaction amount\nsorted_orders = sorted(orders, key=lambda o: o["amount"], reverse=True)\nfor o in sorted_orders:\n    print(f"Order #{o['id']}: \${o['amount']}")`,
          lang: 'python',
          description: 'Using lambda as an inline key extraction function for high-performance sorting.'
        }
      ],
      didYouKnow: {
        title: '💡 operator Module Alternative',
        content: 'For simple key lookups, `operator.itemgetter("amount")` or `operator.attrgetter("name")` is written in C and executes 20% faster than equivalent Python lambdas: `key=itemgetter("amount")`.'
      }
    },
    challenge: {
      title: 'Late-Binding Closure Trap & Sorting Drill',
      steps: [
        'Reproduce the famous late-binding lambda loop bug: `funcs = [lambda: i for i in range(3)]`.',
        'Verify that executing `[f() for f in funcs]` yields `[2, 2, 2]` instead of `[0, 1, 2]`.',
        'Fix the late-binding bug using default parameter binding `lambda i=i: i`.',
        'Sort a list of user tuples using a multi-key lambda: sorting first by role, then by age.'
      ],
      codeSnippet: `# 1. Late-Binding Closure Bug
broken_funcs = [lambda: i for i in range(3)]
print("Broken Lambdas Output:", [f() for f in broken_funcs])

# 2. Fixed using default argument binding
fixed_funcs = [lambda i=i: i for i in range(3)]
print("Fixed Lambdas Output: ", [f() for f in fixed_funcs])

# 3. Multi-key Sorting
users = [
    ("alice", "ADMIN", 32),
    ("bob", "USER", 45),
    ("charlie", "ADMIN", 24)
]
# Sort by role ascending, then age ascending
users_sorted = sorted(users, key=lambda u: (u[1], u[2]))
print("\\nSorted Users (Role, Age):")
for u in users_sorted:
    print(" ", u)`,
      expectedOutput: `Broken Lambdas Output: [2, 2, 2]
Fixed Lambdas Output:  [0, 1, 2]

Sorted Users (Role, Age):
  ('charlie', 'ADMIN', 24)
  ('alice', 'ADMIN', 32)
  ('bob', 'USER', 45)`,
      interviewQuestion: 'What causes the late-binding closure bug when creating lambdas inside a loop in Python? How do you fix it?',
      interviewAnswer: 'In Python, closures bind variables by reference to the variable name in the enclosing scope, NOT by capturing the value at the time the closure is created. When lambdas are defined inside a loop `[lambda: i for i in range(3)]`, all three lambdas point to the single variable `i` in the enclosing scope.\n\nWhen the lambdas are eventually called, the loop has already completed, and `i` has reached its final value (2). Therefore, all lambdas look up `i` and evaluate to 2.\n\nTo fix this: pass `i` as a default argument: `lambda i=i: i`. Because default arguments are evaluated at function definition time, CPython freezes the current value of `i` into each lambda\'s private `__defaults__` tuple, preserving the expected values `0, 1, 2`.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What are lambda functions in Python, what limitations do they have, and how do you explain and solve the infamous late-binding closure problem in loops?',
      framework: [
        { time: '0-15s', point: 'Definition & Scope: Lambdas are anonymous functions restricted to a single expression; compiled into FunctionType with __name__="<lambda>".' },
        { time: '15-45s', point: 'Late-Binding Trap: Closures bind by reference; lambdas in loops resolve variables at call time, evaluating to the final loop iteration.' },
        { time: '45-60s', point: 'Resolution & Best Practices: Fix via default argument binding (lambda i=i: i); follow PEP 8 and avoid assigning lambdas to named variables.' }
      ],
      spokenScript: `"In Python, lambda functions are anonymous, lightweight functions defined using the 'lambda' keyword. They are restricted to a single expression whose result is implicitly returned, meaning they cannot contain multi-line statements, loops, or assignments.\n\nUnder the hood, CPython compiles lambdas into standard 'FunctionType' objects with their name set to '<lambda>'. Their primary use case in backend services is providing short, throwaway callback functions, such as custom key extractors for 'sorted()', 'min()', or 'max()'.\n\nThe most infamous interview question regarding lambdas is the 'late-binding closure trap'. When you create a list of lambdas inside a loop—such as '[lambda: i for i in range(5)]'—calling them later returns '4' for every function. This occurs because Python closures bind variables by reference rather than by value: the lambdas do not freeze 'i' during the loop; they look up 'i' in the outer scope when called, after the loop has already terminated at 4.\n\nWe solve this by binding the variable into the lambda's default arguments using 'lambda i=i: i'. Because Python evaluates default arguments once at definition time, each lambda captures its own private copy in its '__defaults__' tuple."`,
      buzzwords: ['Anonymous functions', 'Single-expression constraint', 'Late-binding closure trap', 'Variable lookup by reference', 'Default argument binding (lambda i=i)', 'operator.itemgetter alternative'],
      juniorMistake: 'Assigning a lambda to a variable (f = lambda x: x) instead of using "def f(x)", violating PEP 8.'
    }
  },

  // Q41: Multiprocessing vs Multithreading
  41: {
    id: 41,
    docSpecs: {
      overview: 'Concurrency in Python is split into two primary architectures: Multithreading (`threading` module) and Multiprocessing (`multiprocessing` module). Multithreading runs multiple threads within a single operating system process sharing heap memory; however, in CPython, the Global Interpreter Lock (GIL) prevents threads from executing Python bytecode in parallel on multiple CPU cores. Multiprocessing bypasses the GIL by spawning completely separate OS processes with independent memory spaces and PIDs, enabling true multi-core parallel execution at the cost of IPC serialization overhead.',
      table: {
        headers: ['Architecture', 'Memory Space', 'CPython GIL Impact', 'Ideal Workload', 'Overhead & IPC'],
        rows: [
          ['Multithreading (`threading`)', 'Shared memory space within single PID', 'GIL prevents multi-core bytecode parallelism', 'I/O-Bound (HTTP requests, DB calls, disk operations)', 'Minimal memory overhead; fast shared memory access; race condition risks.'],
          ['Multiprocessing (`multiprocessing`)', 'Isolated memory space per process (distinct PIDs)', 'Completely bypasses GIL (true multi-core parallelism)', 'CPU-Bound (image processing, data crunching, ML inference)', 'High memory overhead; requires IPC (`pickle`) to pass data between workers.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'I/O Operations Release the GIL',
          content: 'Why is multithreading effective for I/O in Python despite the GIL? Because standard library C-extensions (like socket read/write, file access, and database network waits) explicitly release the GIL before blocking! Other Python threads can run bytecode freely while one thread waits on network I/O.'
        },
        {
          type: 'caution',
          title: 'Process Spawning Overhead & Fork Safety',
          content: 'Spawning processes has high memory and OS overhead. In Linux, Python historically used `fork`, which can cause deadlocks if threads exist before forking. Python 3.8+ defaults to `spawn` on macOS and Windows, requiring code to be protected inside `if __name__ == "__main__":`.'
        }
      ],
      commands: [
        {
          label: 'ProcessPoolExecutor vs ThreadPoolExecutor',
          cmd: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor\nimport os\n\ndef io_task(url):\n    # ThreadPool: Ideal for I/O waits\n    return f"Fetched {url} in Thread PID: {os.getpid()}"\n\ndef cpu_task(n):\n    # ProcessPool: Ideal for CPU-intensive parallel math\n    return sum(i * i for i in range(n))\n\n# Usage pattern:\n# with ThreadPoolExecutor(max_workers=10) as executor: ...\n# with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor: ...`,
          lang: 'python',
          description: 'Choosing between ThreadPoolExecutor for I/O and ProcessPoolExecutor for CPU workloads.'
        }
      ],
      didYouKnow: {
        title: '💡 Gunicorn Production Architecture',
        content: 'This distinction is why production Django servers use Gunicorn with pre-forked worker processes: each worker process has its own GIL, allowing Django to utilize all CPU cores on a multi-core Kubernetes node.'
      }
    },
    challenge: {
      title: 'CPU Parallelism Benchmark: Threading vs Multiprocessing Drill',
      steps: [
        'Define a heavy CPU-bound task (calculating sum of squares for 5,000,000 numbers).',
        'Run the task twice concurrently using `threading.Thread`. Observe that runtime does NOT decrease due to GIL contention.',
        'Run the task twice concurrently using `multiprocessing.Process`. Observe true ~2x CPU acceleration across multi-core systems.',
        'Demonstrate thread shared memory vs process isolated memory.'
      ],
      codeSnippet: `import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def heavy_computation(n):
    return sum(x * x for x in range(n))

N = 2_000_000

# 1. Sequential Execution
start = time.perf_counter()
heavy_computation(N)
heavy_computation(N)
seq_time = time.perf_counter() - start
print(f"Sequential Duration:    {seq_time:.4f}s")

# 2. ThreadPool (GIL prevents multi-core speedup for CPU tasks!)
start = time.perf_counter()
with ThreadPoolExecutor(max_workers=2) as executor:
    list(executor.map(heavy_computation, [N, N]))
thread_time = time.perf_counter() - start
print(f"Threading Duration:     {thread_time:.4f}s (GIL bottleneck: no speedup!)")`,
      expectedOutput: `Sequential Duration:    ~0.2200s
Threading Duration:     ~0.2250s (GIL bottleneck: no speedup!)`,
      interviewQuestion: 'Why does running a CPU-bound Python task across multiple threads often run SLOWER than sequential execution? When is multithreading appropriate in Python backend systems?',
      interviewAnswer: 'Running CPU-bound tasks across multiple threads runs slower than sequential execution due to GIL thrashing and context switching. Because CPython\'s Global Interpreter Lock allows only one native thread to execute Python bytecode at a time, multi-core OS schedulers attempt to balance threads across cores, causing intense CPU cache invalidation and thread mutex contention.\n\nMultithreading is appropriate in Python backend systems strictly for I/O-bound tasks: making concurrent HTTP requests, querying databases, writing to files, or waiting on Redis caches. When a thread executes an I/O system call, CPython explicitly releases the GIL, allowing other threads to execute Python code while the first thread waits on network sockets.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you compare Multiprocessing and Multithreading in Python? How does the Global Interpreter Lock (GIL) dictate your architectural choice between threads, processes, and asyncio in a backend service?',
      framework: [
        { time: '0-15s', point: 'Core Distinction: Multithreading shares memory under a single GIL (I/O bound); Multiprocessing isolates memory in separate PIDs bypassing the GIL (CPU bound).' },
        { time: '15-45s', point: 'The GIL Impact: Threads cannot run Python bytecode in parallel on multiple cores; I/O system calls release the GIL, making threads viable for networking.' },
        { time: '45-60s', point: 'Production Architecture: Use asyncio for high-concurrency I/O; use Celery/multiprocessing for CPU tasks; run Gunicorn multi-process workers to scale web servers.' }
      ],
      spokenScript: `"In Python, selecting between multithreading and multiprocessing depends entirely on whether a workload is CPU-bound or I/O-bound, governed by the Global Interpreter Lock.\n\nMultithreading creates lightweight native threads within a single process sharing heap memory. However, because CPython's GIL allows only one thread to execute Python bytecode at any given moment, threads cannot achieve multi-core CPU parallelism. If you run CPU-bound math on multiple threads, execution actually slows down due to thread contention and context switching. However, for I/O-bound tasks—like waiting for Postgres queries or third-party webhooks—multithreading is highly effective because CPython explicitly releases the GIL during network socket system calls.\n\nFor CPU-bound tasks—such as PDF generation, image transformation, or data analytics—we use multiprocessing. Multiprocessing spawns independent OS processes, each with its own Python interpreter, heap memory, and GIL, enabling true parallel execution across all CPU cores.\n\nIn our enterprise production architecture, we combine both: we deploy Gunicorn with multi-process pre-forked workers to maximize CPU core utilization on our Kubernetes nodes, while utilizing asyncio or thread pools within workers for non-blocking I/O operations."`,
      buzzwords: ['GIL (Global Interpreter Lock)', 'CPU-bound vs I/O-bound', 'Pre-fork worker model (Gunicorn)', 'Shared heap memory vs isolated PIDs', 'GIL release on I/O syscalls', 'Inter-Process Communication (IPC)'],
      juniorMistake: 'Using Python threads to speed up a heavy data calculation and wondering why CPU usage maxes out at exactly 100% of a single core.'
    }
  },

  // Q42: What is the GIL?
  42: {
    id: 42,
    docSpecs: {
      overview: 'The Global Interpreter Lock (GIL) is a mutual exclusion lock (mutex) used by the CPython interpreter to synchronize execution of Python bytecode across threads. The GIL ensures that only one native OS thread executes Python bytecode at any given moment, even on multi-core systems. Its primary purpose is protecting CPython\'s memory management and reference counting mechanism (`PyObject.ob_refcnt`) from race conditions and memory corruption.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'Why the GIL Was Introduced',
          content: 'CPython was created when multi-core CPUs did not exist for consumer machines. Implementing reference counting without a global lock would require fine-grained atomic locks on every single object increment and decrement, introducing massive performance penalties on single-threaded programs.'
        },
        {
          type: 'tip',
          title: 'PEP 703 & Python 3.13 Free-Threading',
          content: 'Python 3.13 introduces experimental support for Free-Threading (PEP 703), allowing CPython to be compiled with `--disable-gil`. Free-threaded Python replaces the GIL with mimalloc memory arenas, immortal objects, and biased reference counting, finally unlocking true multi-threaded CPU parallelism in Python!'
        }
      ],
      commands: [
        {
          label: 'Inspecting GIL Configuration & Thread Switch Interval',
          cmd: `import sys\n\n# Inspect thread switch interval (default is 0.005 seconds / 5ms)\nprint("GIL Switch Interval:", sys.getswitchinterval(), "seconds")\n\n# In Python 3.13+, check if free-threading is active\nif hasattr(sys, "_is_gil_enabled"):\n    print("Is GIL enabled in this runtime?", sys._is_gil_enabled())\nelse:\n    print("CPython runtime has standard GIL active.")`,
          lang: 'python',
          description: 'Inspecting CPython thread switch interval and PEP 703 free-threading status.'
        }
      ],
      didYouKnow: {
        title: '💡 CPython Thread Switch Interval',
        content: 'CPython threads do not wait forever to yield the GIL. Every 5 milliseconds (`sys.getswitchinterval()`), CPython forces the running thread to pause and drop the GIL so waiting threads can compete for execution.'
      }
    },
    challenge: {
      title: 'Thread Switch Interval & GIL Release Demonstration Drill',
      steps: [
        'Inspect the thread switch interval using `sys.getswitchinterval()`.',
        'Verify that time-based sleeping (`time.sleep`) explicitly releases the GIL.',
        'Demonstrate that concurrent sleeping threads complete in parallel, proving GIL release on I/O.',
        'Explain the architectural significance of Python 3.13 PEP 703 (Free Threading).'
      ],
      codeSnippet: `import sys
import time
import threading

print("1. Thread Switch Interval:", sys.getswitchinterval(), "seconds")

# 2. Demonstrate GIL release during time.sleep (simulating network I/O)
def mock_io_request(name, delay):
    print(f"  [{name}] Starting I/O wait ({delay}s)...")
    time.sleep(delay)  # Releases GIL!
    print(f"  [{name}] Completed!")

start = time.perf_counter()
t1 = threading.Thread(target=mock_io_request, args=("Worker 1", 0.2))
t2 = threading.Thread(target=mock_io_request, args=("Worker 2", 0.2))

t1.start()
t2.start()
t1.join()
t2.join()

elapsed = time.perf_counter() - start
print(f"\\nTotal duration: {elapsed:.3f}s (Completed concurrently in ~0.2s because sleep released the GIL!)")`,
      expectedOutput: `1. Thread Switch Interval: 0.005 seconds
2. Demonstrate GIL release during time.sleep (simulating network I/O)
  [Worker 1] Starting I/O wait (0.2s)...
  [Worker 2] Starting I/O wait (0.2s)...
  [Worker 1] Completed!
  [Worker 2] Completed!

Total duration: ~0.201s (Completed concurrently in ~0.2s because sleep released the GIL!)`,
      interviewQuestion: 'What is the CPython GIL, why does it exist, and how does Python 3.13 address the GIL with PEP 703?',
      interviewAnswer: 'The Global Interpreter Lock (GIL) is a mutual exclusion lock in CPython that ensures only one thread executes Python bytecode at a time, even on multi-core processors. It exists primarily because CPython\'s memory management relies on Reference Counting: without a global lock, concurrent threads modifying object references would corrupt reference counters, causing memory leaks or premature deallocation.\n\nAdding fine-grained mutexes around every individual object would introduce substantial locking overhead, degrading single-threaded execution speed by 30-50% and introducing deadlock risks.\n\nPython 3.13 introduces PEP 703 ("Making the Global Interpreter Lock Optional"). It replaces the GIL with: 1) Biased reference counting (threads modify their own objects without atomic locks), 2) Immortal objects for singletons and built-ins, and 3) A thread-safe allocator (mimalloc). This allows CPython to execute true multi-threaded code across all CPU cores when built with free-threading.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the Global Interpreter Lock (GIL) in Python? Why was it designed into CPython, what impact does it have on multi-threaded performance, and what is changing with PEP 703 in Python 3.13?',
      framework: [
        { time: '0-15s', point: 'Core Definition: The GIL is a CPython mutex ensuring only one native thread executes Python bytecode at any moment.' },
        { time: '15-45s', point: 'Design Justification: Protects CPython\'s reference counting (ob_refcnt) from race conditions without paying single-thread atomic lock penalties.' },
        { time: '45-60s', point: 'Modern Evolution: PEP 703 in Python 3.13 introduces optional free-threading, using mimalloc and biased ref-counting to unlock true multicore parallelism.' }
      ],
      spokenScript: `"The Global Interpreter Lock, or GIL, is a mutual exclusion lock in CPython designed to prevent multiple native OS threads from executing Python bytecode simultaneously. Even on a 64-core server, a multi-threaded Python process can only execute bytecode on a single CPU core at any given instant.\n\nThe GIL exists because of CPython's memory management model: CPython uses Reference Counting, where every object tracks its active references in 'ob_refcnt'. If multiple threads modified reference counts concurrently without synchronization, race conditions would cause memory corruption or premature deallocation. Guido van Rossum implemented the GIL as a global lock because fine-grained locks around every single object would have devastated single-threaded performance with locking overhead.\n\nWhile the GIL restricts CPU-bound multithreading, it has zero negative impact on I/O-bound tasks because CPython releases the GIL during network socket reads, file operations, and database waits.\n\nExcitingly, the Python ecosystem is currently undergoing a historic transformation: Python 3.13 introduces PEP 703, providing an official build mode that completely disables the GIL using biased reference counting and mimalloc, unlocking true multi-core thread parallelism for the first time."`,
      buzzwords: ['CPython mutex', 'Reference counting safety (ob_refcnt)', 'Thread serialization', 'I/O GIL release', 'sys.getswitchinterval()', 'PEP 703 Free-Threading (Python 3.13)'],
      juniorMistake: 'Claiming the GIL exists in all Python implementations (Jython and IronPython do not have a GIL; it is specific to CPython).'
    }
  },

  // Q43: Class and Object Creation
  43: {
    id: 43,
    docSpecs: {
      overview: 'Classes in Python are first-class runtime objects created by the `type` metaclass. When Python parses a `class` statement, it executes the class body inside a fresh dictionary namespace and calls `type(name, bases, dict)` to instantiate the class object itself. When an instance is created (`obj = MyClass()`), Python executes `__new__` to allocate the object in heap memory, followed by `__init__` to initialize instance attributes.',
      table: {
        headers: ['Concept', 'Class Variable', 'Instance Variable', 'Memory Allocation'],
        rows: [
          ['Definition Location', 'Declared directly within the class body', 'Assigned inside methods via `self.attr`', 'Class variables live in `Class.__dict__`; instance variables live in `instance.__dict__`.'],
          ['Sharing Semantics', 'Shared across ALL instances of the class', 'Unique and private to each specific instance', 'Mutating a mutable class variable (e.g. list) affects all existing instances.'],
          ['Shadowing Hazard', 'Writing `obj.class_var = val` creates an instance variable', 'Does not affect the class variable on other instances', 'Instance attribute shadows the class attribute on that specific instance.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Mutable Class Variable Trap',
          content: 'Declaring a mutable default as a class variable (`class Worker: tasks = []`) shares that single list across EVERY instance of `Worker`! Appending on `w1.tasks.append("task")` mutates `w2.tasks`. Always initialize mutable containers inside `__init__` on `self`.'
        },
        {
          type: 'note',
          title: 'Classes are Instances of "type"',
          content: 'In Python, everything is an object, including classes. You can dynamically create classes at runtime using `type("DynamicUser", (object,), {"is_active": True})`.'
        }
      ],
      commands: [
        {
          label: 'Class Attribute Mutation vs Shadowing',
          cmd: `class Config:\n    shared_tags = []      # Shared class attribute\n    environment = "DEV"   # Immutable class attribute\n\nc1 = Config()\nc2 = Config()\n\n# Mutating shared class list affects all instances\nc1.shared_tags.append("backend")\nprint("c2 sees mutated tags:", c2.shared_tags)  # ['backend']\n\n# Assigning to c1 shadows the class attribute\nc1.environment = "PROD"\nprint("c1 env (Instance shadow):", c1.environment)  # PROD\nprint("c2 env (Unchanged Class):", c2.environment)  # DEV`,
          lang: 'python',
          description: 'Tracing how attribute lookup falls back from instance __dict__ to class __dict__.'
        }
      ],
      didYouKnow: {
        title: '💡 Dynamic Class Creation via type()',
        content: '`type` is both a function and a metaclass! Calling `type(obj)` returns its type; calling `type(name, bases, dict)` constructs a brand new class dynamically on the fly.'
      }
    },
    challenge: {
      title: 'Class vs Instance Attribute Resolution Drill',
      steps: [
        'Demonstrate that mutating a mutable class attribute affects all instances.',
        'Demonstrate that assigning an attribute to an instance creates an entry in `instance.__dict__`, shadowing the class attribute.',
        'Dynamically construct a class at runtime using the 3-argument `type()` metaclass.',
        'Instantiate the dynamic class and verify its method and attribute bindings.'
      ],
      codeSnippet: `# 1. Mutable class attribute pitfall
class Team:
    members = []  # Shared across all teams!

t1 = Team()
t2 = Team()
t1.members.append("Alice")
print("Did t2 members get mutated?", t2.members)

# 2. Attribute Shadowing Demonstration
class Service:
    timeout = 30

s = Service()
print("Initial timeout (from Class):", s.timeout)
s.timeout = 60  # Creates entry in s.__dict__!
print("Instance __dict__ after assignment:", s.__dict__)
print("Class timeout remains unchanged:", Service.timeout)

# 3. Dynamic class creation with type()
def greet(self):
    return f"Hello from dynamic class: {self.name}"

DynamicModel = type("DynamicModel", (object,), {"name": "AuthModel", "greet": greet})
dm = DynamicModel()
print("\\nDynamic Class Name:", type(dm).__name__)
print("Dynamic Method Call:", dm.greet())`,
      expectedOutput: `Did t2 members get mutated? ['Alice']
Initial timeout (from Class): 30
Instance __dict__ after assignment: {'timeout': 60}
Class timeout remains unchanged: 30

Dynamic Class Name: DynamicModel
Dynamic Method Call: Hello from dynamic class: AuthModel`,
      interviewQuestion: 'How does Python resolve attribute access like "obj.x"? What is the exact lookup order between instance dict, class dict, and descriptors?',
      interviewAnswer: 'When evaluating `obj.x`, Python traverses a strict attribute lookup hierarchy:\n1. Data Descriptors: Python checks `type(obj).__dict__` for an object implementing both `__get__` and `__set__` (like `@property`). If found, the data descriptor is called first.\n2. Instance Dictionary: Python checks `obj.__dict__["x"]`. If `x` exists as an instance attribute, it is returned.\n3. Non-Data Descriptors / Class Attributes: Python checks `type(obj).__dict__["x"]`. If it is a method or non-data descriptor (implementing only `__get__`), it calls `__get__`. If it is a plain class variable, it returns the class value.\n4. Base Classes: Python searches base classes along the `MRO`.\n5. `__getattr__`: If the attribute is not found anywhere in steps 1-4, Python finally calls `obj.__getattr__("x")`. If `__getattr__` is missing, an `AttributeError` is raised.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does object creation work in Python? Walk me through how Python creates classes using metaclasses, how instances resolve attributes through __dict__, and the mutable class variable trap.',
      framework: [
        { time: '0-15s', point: 'Classes are Objects: Classes are created at runtime by the type metaclass; type(name, bases, dict) instantiates the class object.' },
        { time: '15-45s', point: 'Attribute Lookup Hierarchy: Data descriptors -> Instance __dict__ -> Non-data descriptors / Class __dict__ -> MRO base classes -> __getattr__.' },
        { time: '45-60s', point: 'Class Variable Pitfall: Class variables are shared across all instances; mutating a list/dict at class level pollutes all instances.' }
      ],
      spokenScript: `"In Python, classes themselves are first-class runtime objects instantiated by the default metaclass, 'type'. When the interpreter parses a class block, it executes the body within a namespace dictionary and passes that dictionary along with base classes into 'type(name, bases, dict)' to construct the class object.\n\nWhen you access an attribute on an instance—'obj.x'—CPython follows a strict resolution sequence: first, it checks the class dictionary for a data descriptor like a '@property'; second, it checks the instance's own 'obj.__dict__'; third, it falls back to the class dictionary and its inheritance MRO; and finally, if nothing matches, it invokes '__getattr__'.\n\nA critical trap in backend code reviews is the mutable class variable. If you declare a list or dictionary at the class level—such as 'class Service: cache = {}'—that single dictionary instance is shared across all instances of the class. If one request appends to 'self.cache', all other instances see the modified state. In our backend codebases, mutable state must strictly be instantiated inside '__init__' on 'self'."`,
      buzzwords: ['type metaclass', 'type(name, bases, dict)', 'Attribute lookup hierarchy', 'Data descriptors vs Non-data descriptors', 'Mutable class variable trap', 'Instance __dict__ shadowing'],
      juniorMistake: 'Declaring a list as a class variable and wondering why data added in one instance appears across all other instances.'
    }
  },

  // Q44: LEGB Scopes & Resolution
  44: {
    id: 44,
    docSpecs: {
      overview: 'Variable lookup in Python is governed by the LEGB rule, which searches four hierarchical scope namespaces in strict sequence: Local, Enclosing, Global, and Built-in. If an identifier cannot be resolved across all four scopes, Python raises a `NameError`. Modifying variables in enclosing or global scopes from an inner function requires the explicit `nonlocal` or `global` keywords.',
      table: {
        headers: ['Scope Level', 'Description', 'Resolution Order', 'Modification Keyword', 'Namespace Introspection'],
        rows: [
          ['**L**ocal', 'Inside current function/lambda frame', '1st (Fastest lookup)', 'Standard assignment (`x = 10`)', '`locals()` / fastlocals array'],
          ['**E**nclosing', 'Inside outer enclosing functions (closures)', '2nd', '`nonlocal x` (modifies outer frame)', 'Stored in `func.__closure__` cells'],
          ['**G**lobal', 'Top-level module namespace', '3rd', '`global x` (modifies module dict)', '`globals()` module dictionary'],
          ['**B**uilt-in', 'Pre-loaded Python built-ins (`len`, `range`, `dict`)', '4th (Last lookup)', 'Cannot be modified (read-only)', '`builtins.__dict__`']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The nonlocal Keyword in Closures',
          content: '`nonlocal` (PEP 3104) binds an identifier to the nearest enclosing non-global function scope. Without `nonlocal`, attempting to reassign an enclosing variable inside a closure creates a new local variable, failing to mutate the outer state.'
        },
        {
          type: 'caution',
          title: 'Accidental Built-in Shadowing',
          content: 'Never name variables after Python built-ins (`list = [1, 2]`, `str = "hello"`, `id = 101`). Shadowing a built-in overwrites the symbol in local scope, preventing you from calling `list()` or `str()` later in the function!'
        }
      ],
      commands: [
        {
          label: 'The LEGB Hierarchy & nonlocal State Counter',
          cmd: `# nonlocal closure state management\ndef create_rate_limiter(limit):\n    count = 0  # Enclosing scope\n    \n    def record_request():\n        nonlocal count  # Binds to enclosing scope\n        count += 1\n        return count <= limit\n        \n    return record_request\n\nlimiter = create_rate_limiter(2)\nprint("Req 1 allowed:", limiter())  # True (count=1)\nprint("Req 2 allowed:", limiter())  # True (count=2)\nprint("Req 3 allowed:", limiter())  # False (count=3)`,
          lang: 'python',
          description: 'Using nonlocal in a closure to maintain state across function invocations.'
        }
      ],
      didYouKnow: {
        title: '💡 Closure Cells in CPython',
        content: 'When an inner function accesses an enclosing variable via `nonlocal`, CPython allocates a special `cell` object in heap memory. Both the outer and inner functions point to this cell object via their `__closure__` tuples, enabling shared mutable state.'
      }
    },
    challenge: {
      title: 'LEGB Resolution & nonlocal Closure Counter Drill',
      steps: [
        'Demonstrate the complete LEGB lookup order with four nested scopes.',
        'Show how assigning without `nonlocal` shadows an enclosing variable instead of updating it.',
        'Implement an active stateful counter using `nonlocal` in a closure.',
        'Inspect the underlying `cell` object in `func.__closure__`.'
      ],
      codeSnippet: `# 1. LEGB Resolution Sequence
x = "GLOBAL"

def outer():
    x = "ENCLOSING"
    def inner():
        x = "LOCAL"
        return x
    return inner()

print("Resolved scope:", outer())

# 2. Nonlocal Closure State
def make_accumulator(initial_value):
    total = initial_value
    def add(amount):
        nonlocal total
        total += amount
        return total
    return add

acc = make_accumulator(100)
print("Added 50: ", acc(50))
print("Added 25: ", acc(25))

# 3. Inspect CPython closure cell
print("\\nClosure cell contents:", acc.__closure__[0].cell_contents)`,
      expectedOutput: `Resolved scope: LOCAL
Added 50:  150
Added 25:  175

Closure cell contents: 175`,
      interviewQuestion: 'What is the precise difference between the "global" and "nonlocal" keywords in Python? What happens if you use nonlocal and no enclosing function exists?',
      interviewAnswer: '`global var_name` binds an identifier directly to the module-level global namespace (`globals()`). It allows a function to rebind or modify variables defined at the top-level of the module.\n\n`nonlocal var_name` (introduced in PEP 3104) binds an identifier to the nearest ENCLOSING function scope, deliberately skipping both the local scope and the global/built-in scopes. It is used inside closures to modify state in an outer function without polluting the global module namespace.\n\nCritically: if you declare `nonlocal x` and no enclosing function defines a variable `x` (or if `x` only exists in the global module scope), Python raises `SyntaxError: no binding for nonlocal \'x\' found` at compile time. `global`, by contrast, will happily create a new global variable if one did not exist before.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does scope resolution work in Python under the LEGB rule? Explain the differences between global and nonlocal, and how CPython implements closures under the hood.',
      framework: [
        { time: '0-15s', point: 'LEGB Hierarchy: Python resolves variables by checking Local, Enclosing, Global, and Built-in scopes sequentially.' },
        { time: '15-45s', point: 'global vs nonlocal: global binds to module scope; nonlocal binds to outer nested function scope; omitting keywords creates local shadowing.' },
        { time: '45-60s', point: 'CPython Closure Internals: Variables captured by closures are stored in heap cell objects accessible via func.__closure__.' }
      ],
      spokenScript: `"Variable scope resolution in Python is governed strictly by the LEGB rule: Local, Enclosing, Global, and Built-in namespaces, searched in that exact order until a match is found or a NameError is raised.\n\nWhen modifying variables in outer scopes, Python provides two distinct keywords: 'global' and 'nonlocal'. The 'global' keyword explicitly binds a variable to the module-level dictionary. The 'nonlocal' keyword—introduced in PEP 3104—binds a variable to the nearest enclosing function scope, skipping local scope without reaching global scope. If you declare 'nonlocal x' and no enclosing function defines 'x', the compiler throws a SyntaxError.\n\nUnder the hood, CPython implements closures using 'cell' objects. When an inner function references an enclosing variable via 'nonlocal', Python allocates a shared cell object on the heap. Both the outer function frame and the inner closure maintain references to this cell object in their '__closure__' tuples, allowing state to persist and mutate cleanly across invocations without polluting global module state."`,
      buzzwords: ['LEGB scoping rule (Local, Enclosing, Global, Built-in)', 'PEP 3104 nonlocal keyword', 'CPython cell objects', 'func.__closure__ tuple', 'Closure state persistence', 'SyntaxError on missing nonlocal binding'],
      juniorMistake: 'Using "global" inside a nested function when trying to mutate an outer function\'s variable, corrupting module-level scope instead.'
    }
  },

  // Q45: Recursion in Python (Reversing a List)
  45: {
    id: 45,
    docSpecs: {
      overview: 'Recursion in Python occurs when a function invokes itself to solve sub-problems until reaching a base condition. In CPython, recursion is executed via a call stack where each recursive call allocates a new `PyFrameObject` containing its own local variables. Python does NOT implement Tail Call Optimization (TCO), and CPython enforces a strict recursion limit (default 1,000 frames via `sys.getrecursionlimit()`) to prevent C stack overflows.',
      table: {
        headers: ['Implementation', 'Time Complexity', 'Auxiliary Space Complexity', 'Stack Overflow Risk', 'Senior Production Recommendation'],
        rows: [
          ['Iterative Two-Pointers', 'O(N)', 'O(1) in-place', 'ZERO risk', 'MANDATORY for production lists; optimal CPU cache locality.'],
          ['Slice `[::-1]`', 'O(N)', 'O(N) new list copy', 'ZERO risk', 'Standard idiom when an independent reversed copy is required.'],
          ['Recursive Algorithm', 'O(N)', 'O(N) call stack frames', 'HIGH: Crashes with `RecursionError` if `len(list) > 1000`', 'Academic only; never use recursion for list reversal in production.']
        ]
      },
      admonitions: [
        {
          type: 'warning',
          title: 'No Tail Call Optimization (TCO)',
          content: 'Unlike Scheme, Haskell, or JavaScript (ES6), Python intentionally does NOT optimize tail-recursive functions. Even if the recursive call is the final statement (`return func()`), CPython still pushes a full call frame onto the stack, guaranteeing a `RecursionError` on deep inputs.'
        },
        {
          type: 'note',
          title: 'Guido van Rossum\'s Stance on TCO',
          content: 'Python\'s creator Guido van Rossum deliberately rejected tail call elimination to preserve complete, accurate stack traces for debugging and profiling in production.'
        }
      ],
      commands: [
        {
          label: 'Recursive List Reversal vs Iterative Two Pointers',
          cmd: `# 1. Recursive list reversal (Educational)\ndef reverse_recursive(lst):\n    # Base condition\n    if not lst:\n        return []\n    # Recursive step: tail + head\n    return reverse_recursive(lst[1:]) + [lst[0]]\n\nprint("Recursive:", reverse_recursive([1, 2, 3, 4]))\n\n# 2. Production iterative two-pointer in-place reversal\ndef reverse_iterative(lst):\n    left, right = 0, len(lst) - 1\n    while left < right:\n        lst[left], lst[right] = lst[right], lst[left]\n        left += 1\n        right -= 1\n    return lst\n\nprint("Iterative:", reverse_iterative([1, 2, 3, 4]))`,
          lang: 'python',
          description: 'Comparing recursive list reversal with O(1) space iterative two-pointer reversal.'
        }
      ],
      didYouKnow: {
        title: '💡 Inspecting Recursion Limit',
        content: 'You can check and adjust the recursion ceiling with `sys.getrecursionlimit()` and `sys.setrecursionlimit(5000)`. However, setting it too high causes the C runtime stack to overflow, terminating the entire process with a segmentation fault (`SIGSEGV`)!'
      }
    },
    challenge: {
      title: 'Recursion Depth Limit & Two-Pointer In-Place Drill',
      steps: [
        'Inspect the default recursion limit using `sys.getrecursionlimit()`.',
        'Implement recursive list reversal and demonstrate that it works for small lists.',
        'Demonstrate that deep recursion triggers `RecursionError: maximum recursion depth exceeded`.',
        'Implement the production-standard iterative two-pointer reversal running in O(1) auxiliary space.'
      ],
      codeSnippet: `import sys

print("Default CPython recursion limit:", sys.getrecursionlimit())

# 1. Recursive Reversal
def recursive_reverse(lst):
    if not lst:
        return []
    return recursive_reverse(lst[1:]) + [lst[0]]

print("Recursive small list:", recursive_reverse([10, 20, 30]))

# 2. Trigger RecursionError
def trigger_overflow(n):
    return trigger_overflow(n + 1)

try:
    trigger_overflow(1)
except RecursionError as err:
    print("Caught expected RecursionError:", err)

# 3. Iterative Two-Pointer In-Place Reversal (Production Standard)
def reverse_in_place(arr):
    i, j = 0, len(arr) - 1
    while i < j:
        arr[i], arr[j] = arr[j], arr[i]
        i += 1
        j -= 1
    return arr

test_arr = [1, 2, 3, 4, 5]
reverse_in_place(test_arr)
print("In-place two-pointer reversed:", test_arr)`,
      expectedOutput: `Default CPython recursion limit: 1000
Recursive small list: [30, 20, 10]
Caught expected RecursionError: maximum recursion depth exceeded
In-place two-pointer reversed: [5, 4, 3, 2, 1]`,
      interviewQuestion: 'Why does Python not support Tail Call Optimization (TCO)? What are the time and space complexity drawbacks of recursive list slicing (lst[1:] + [lst[0]])?',
      interviewAnswer: 'Python does not support Tail Call Optimization by design. Guido van Rossum explicitly rejected TCO because eliminating stack frames destroys debugging and observability: when an exception occurs, stack traces would be missing frames, making it impossible to determine the exact sequence of recursive calls that caused the error.\n\nReversing a list recursively using `return reverse(lst[1:]) + [lst[0]]` has terrible performance:\n1. Time Complexity: O(N^2). On every call, slicing `lst[1:]` allocates a new list of size N-1, and `+ [lst[0]]` copies pointers into a new concatenated list. Slicing and copying N times yields quadratic O(N^2) runtime.\n2. Space Complexity: O(N^2) cumulative memory churn, plus O(N) call stack frames.\n3. Stack Overflow: It crashes with `RecursionError` on any list larger than 1,000 items. In production, list reversal must always use iterative two-pointers (O(N) time, O(1) space) or `list.reverse()`.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does recursion work in Python, why does Python lack Tail Call Optimization, and why is recursion an anti-pattern for sequence reversal in production backend services?',
      framework: [
        { time: '0-15s', point: 'Recursion Mechanics: Each call pushes a new PyFrameObject onto the call stack; bounded by sys.getrecursionlimit() (default 1000).' },
        { time: '15-45s', point: 'No Tail Call Optimization: Guido intentionally omitted TCO to preserve complete stack traces for debugging and traceback logs.' },
        { time: '45-60s', point: 'Complexity Disaster: Recursive slicing (lst[1:] + [lst[0]]) is O(N^2) time and memory; always use iterative two-pointers (O(1) space) in production.' }
      ],
      spokenScript: `"In Python, recursion relies on the CPython call stack, where every recursive function invocation allocates a new 'PyFrameObject' in memory storing local variables and bytecode pointers. Unlike functional languages like Haskell or Erlang, Python deliberately does NOT implement Tail Call Optimization. Guido van Rossum specifically chose not to eliminate tail frames to ensure that stack traces remain complete and accurate for debugging and APM logging in production.\n\nTo prevent C stack overflows from crashing the operating system process, CPython enforces a strict recursion limit—defaulting to 1,000 frames via 'sys.getrecursionlimit()'. If recursion exceeds this depth, Python raises a 'RecursionError'.\n\nWhile reversing a list recursively is a common academic interview problem, implementing it recursively in production is a severe anti-pattern. If you write 'reverse(lst[1:]) + [lst[0]]', list slicing creates a new list copy on every single call, degrading performance to quadratic O(N^2) time and space complexity, while crashing on any list with over 1,000 items. In production backend systems, we strictly mandate iterative two-pointer swaps—or built-in 'lst.reverse()'—which runs in linear O(N) time with constant O(1) auxiliary memory."`,
      buzzwords: ['PyFrameObject call stack', 'sys.getrecursionlimit() (1000 frames)', 'No Tail Call Optimization (TCO)', 'Preservation of stack traceframes', 'Quadratic O(N^2) slicing penalty', 'Iterative two-pointer algorithm'],
      juniorMistake: 'Proposing a recursive solution for list reversal in an interview without acknowledging stack limits, lack of TCO, or O(N^2) slicing memory overhead.'
    }
  }
};

