// Python Days 10 to 12 (Questions 28 to 36)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_10_TO_12 = {
  // Q28: F-strings and String Formatting
  28: {
    id: 28,
    docSpecs: {
      overview: 'String formatting in Python has evolved through three primary paradigms: `%` operator formatting (printf-style), `str.format()` (PEP 3101), and Formatted String Literals or f-strings (PEP 498, Python 3.6+). F-strings are evaluated at runtime by the CPython interpreter directly into dedicated `BUILD_STRING` and `FORMAT_VALUE` bytecodes, making them significantly faster and more expressive than older methods.',
      table: {
        headers: ['Method', 'Syntax Example', 'Execution Speed', 'Readability', 'Security / SQL Caveat'],
        rows: [
          ['`%` Operator', '`"Hello %s" % name`', 'Slow (manual tuple packing)', 'Poor (positional mapping error-prone)', 'Vulnerable to format string injection if user input defines the template.'],
          ['`str.format()`', '`"Hello {}".format(name)`', 'Moderate (method call + argument lookup)', 'Good (supports named placeholders)', 'Useful when the format template string is loaded dynamically from config.'],
          ['F-strings', '`f"Hello {name}"`', 'Fastest (direct `BUILD_STRING` bytecode in C)', 'Best (inline arbitrary Python expressions)', 'NEVER use to construct SQL queries! Use parameterized queries to prevent SQL injection.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Never Construct SQL with F-Strings',
          content: 'NEVER use f-strings to format SQL queries: `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")`. This bypasses database parameterization and exposes your backend to catastrophic SQL Injection vulnerabilities. Always use driver parameter placeholders: `cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])`.'
        },
        {
          type: 'tip',
          title: 'The = Self-Documenting Debug Specifier (Python 3.8+)',
          content: 'You can write `f"{variable=}"` in logs or debug statements! Python automatically prints both the variable expression and its value: `f"{latency_ms=}"` outputs `latency_ms=42.15`.'
        }
      ],
      commands: [
        {
          label: 'F-string Advanced Formatting Specifiers',
          cmd: `price = 1499.50\ndate_val = "2026-11-04"\n\n# Numeric commas and 2 decimal places\nprint(f"Formatted Price: \${price:,.2f}")\n\n# Self-documenting debugging specifier\nstatus_code = 200\nprint(f"Debug Log: {status_code=}")`,
          lang: 'python',
          description: 'Using format specifiers for currency, decimal precision, and self-documenting debug logging.'
        }
      ],
      didYouKnow: {
        title: '💡 F-Strings Support Inline Arbitrary Expressions',
        content: 'F-strings can execute arbitrary Python expressions inside curly braces, including lambda calls, math calculations, dictionary lookups, and method chaining: `f"Active Users: {len([u for u in users if u.is_active])}"`.'
      }
    },
    challenge: {
      title: 'F-String Bytecode Performance & Specifier Drill',
      steps: [
        'Format numbers with thousands separators and fixed float precision: `f"{1234567.891:,.2f}"`.',
        'Use the self-documenting `=` specifier to format debug variables.',
        'Demonstrate datetime formatting directly inside an f-string.',
        'Explain why parameterized SQL queries must replace f-strings for database execution.'
      ],
      codeSnippet: `import datetime

# 1. Number and percentage formatting
revenue = 4523890.75
margin = 0.2856
print(f"Revenue: \${revenue:,.2f}")
print(f"Profit Margin: {margin:.1%}")

# 2. Datetime format specifier
now = datetime.datetime(2026, 11, 4, 14, 30)
print(f"Deployment Time: {now:%Y-%m-%d %H:%M}")

# 3. Debugging specifier (=)
endpoint = "/api/v1/checkout"
duration_ms = 142.8
print(f"APM Trace: {endpoint=} {duration_ms=:.1f}ms")`,
      expectedOutput: `Revenue: $4,523,890.75
Profit Margin: 28.6%
Deployment Time: 2026-11-04 14:30
APM Trace: endpoint='/api/v1/checkout' duration_ms=142.8ms`,
      interviewQuestion: 'Why are f-strings faster than str.format() and %-formatting at the CPython bytecode level? What security hazard must you avoid with f-strings in backend database queries?',
      interviewAnswer: 'F-strings are evaluated at compile time into specialized CPython bytecodes: `FORMAT_VALUE` and `BUILD_STRING`. Unlike `str.format()`, which requires looking up a method on the string object, creating an argument tuple/dict, and making a Python function call, f-strings evaluate expressions directly in the local frame and concatenate strings at C speed.\n\nThe most critical security hazard is SQL Injection. Because f-strings interpolate values directly into the string before passing it to the database driver, writing `f"SELECT * FROM accounts WHERE id = \'{account_id}\'"` allows attackers to inject malicious SQL syntax (e.g. `\' OR 1=1 --`). Developers must always use parameterized query placeholders (`%s` or `?`) so the database engine separates SQL logic from untrusted user data.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do f-strings work in Python, why are they superior to %-formatting and str.format(), and what critical security guidelines do you enforce regarding f-strings in backend APIs?',
      framework: [
        { time: '0-15s', point: 'Evolution & Mechanism: Introduced in PEP 498; f-strings evaluate inline expressions directly into C-level BUILD_STRING bytecode.' },
        { time: '15-45s', point: 'Performance & Expressiveness: Faster than str.format() by bypassing function call overhead; supports format specifiers (dates, floats, debug =).' },
        { time: '45-60s', point: 'Security Boundary: Strict prohibition against using f-strings for SQL queries or shell commands; always use parameterized DB queries.' }
      ],
      spokenScript: `"In Python 3.6, PEP 498 introduced Formatted String Literals—commonly known as f-strings—which replaced '%'-formatting and 'str.format()' as the standard string formatting mechanism. F-strings are not just syntactic sugar; they are fundamentally faster because the CPython compiler translates them directly into optimized C-level bytecodes—'FORMAT_VALUE' and 'BUILD_STRING'—bypassing the method lookup and argument packing overhead of 'str.format()'.\n\nF-strings provide immense readability and power by allowing arbitrary Python expressions, formatting specifiers for currency and dates, and the self-documenting '=' specifier for clean debug logging.\n\nHowever, in backend engineering, we enforce one non-negotiable security rule: f-strings must NEVER be used to construct SQL queries or operating system shell commands. Interpolating untrusted user input directly into a query string leads to catastrophic SQL Injection vulnerabilities. We strictly mandate parameterized database queries, reserving f-strings for logging, telemetry metrics, and user-facing notifications."`,
      buzzwords: ['PEP 498 Formatted String Literals', 'BUILD_STRING & FORMAT_VALUE bytecode', 'Inline expression evaluation', 'Self-documenting specifier ({var=})', 'SQL injection vulnerability', 'Parameterized query security'],
      juniorMistake: 'Using f-strings to format raw SQL queries inside database cursors instead of passing parameters.'
    }
  },

  // Q29: How to Get All Keys from a Dictionary
  29: {
    id: 29,
    docSpecs: {
      overview: 'In Python 3, calling `dict.keys()` returns a dynamic `dict_keys` view object rather than an allocated list. A dictionary view provides a dynamic window into the dictionary\'s underlying hash table: if the dictionary is modified after the view is created, the view immediately reflects those changes without re-allocating memory. Furthermore, iterating over `d` directly (`for k in d:`) traverses keys without calling `.keys()`.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'Dictionary Views are Set-Like',
          content: '`dict_keys` view objects support set-like operations! You can perform set unions (`|`), intersections (`&`), and differences (`-`) directly between two dictionaries\' keys without converting them to sets: `common_keys = d1.keys() & d2.keys()`.'
        },
        {
          type: 'caution',
          title: 'RuntimeError: dictionary changed size during iteration',
          content: 'Never add or delete keys from a dictionary while iterating over its keys (`for k in d:` or `for k in d.keys():`). CPython detects hash table re-sizing or mutation and raises `RuntimeError: dictionary changed size during iteration`. To delete keys safely, iterate over a static list copy: `for k in list(d.keys()):`.'
        }
      ],
      commands: [
        {
          label: 'Dynamic View Reflection & Set Operations',
          cmd: `user = {"id": 101, "role": "ADMIN", "active": True}\n\n# 1. Getting keys view\nkeys_view = user.keys()\nprint("Initial keys:", keys_view)\n\n# Dynamic reflection: modifying dict updates the view instantly!\nuser["created_at"] = "2026-11-04"\nprint("Reflected keys:", keys_view)\n\n# 2. Set operations on dict_keys\nschema = {"id", "role", "email"}\nmissing_fields = schema - user.keys()\nprint("Missing fields:", missing_fields)`,
          lang: 'python',
          description: 'Showing dynamic reflection and native set operations on dict_keys views.'
        }
      ],
      didYouKnow: {
        title: '💡 Direct Iteration Efficiency',
        content: 'Writing `for key in my_dict:` is faster and more idiomatic than writing `for key in my_dict.keys():` because it avoids an unnecessary method lookup and object allocation.'
      }
    },
    challenge: {
      title: 'Dictionary Keys View & Safe In-Loop Mutation Drill',
      steps: [
        'Inspect the type of `dict.keys()` to verify it is a `dict_keys` view object, not a list.',
        'Demonstrate dynamic reflection: mutate the dictionary and observe the view update automatically.',
        'Perform a set intersection (`&`) between two dictionaries\' keys.',
        'Reproduce `RuntimeError: dictionary changed size during iteration` and fix it using `list(d.keys())`.'
      ],
      codeSnippet: `config = {"host": "localhost", "port": 5432, "debug": True}

# 1. View type check
k_view = config.keys()
print("Type of keys():", type(k_view))

# 2. Dynamic reflection
config["timeout"] = 30
print("Did view reflect timeout?", "timeout" in k_view)

# 3. Safe key deletion pattern
# Fails if you iterate config directly:
# for k in config:
#     if k == "debug": del config[k]

for k in list(config.keys()):
    if k == "debug":
        del config[k]

print("Keys after safe deletion:", list(config.keys()))`,
      expectedOutput: `Type of keys(): <class 'dict_keys'>
Did view reflect timeout? True
Keys after safe deletion: ['host', 'port', 'timeout']`,
      interviewQuestion: 'What is a dict_keys view in Python 3? Why does modifying a dictionary while iterating over its keys raise a RuntimeError, and how do you resolve it?',
      interviewAnswer: 'In Python 3, `dict.keys()` returns a `dict_keys` view object—a lightweight, read-only window into the dictionary\'s internal hash table. It does not allocate a separate list in memory (O(1) space).\n\nWhen you iterate over a dictionary, CPython tracks a dictionary mutation counter (`ma_version_tag`). If any key is added or removed during iteration, the hash table layout changes, and CPython detects that the version tag has changed. To prevent undefined behavior or infinite loops caused by corrupted hash probes, CPython raises `RuntimeError: dictionary changed size during iteration`.\n\nTo resolve it safely: iterate over an explicit snapshot list of keys using `for key in list(d.keys()):`, or use a dictionary comprehension to construct a filtered dictionary.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you extract and iterate over dictionary keys in Python? Explain what a dictionary view object is, how it differs from a list, and how to safely modify a dictionary during iteration.',
      framework: [
        { time: '0-15s', point: 'Core Concept: dict.keys() returns a lightweight, dynamic dict_keys view object, not an allocated list.' },
        { time: '15-45s', point: 'View Characteristics: Dynamic reflection (updates in real time); supports set operations (&, |, -); O(1) memory overhead.' },
        { time: '45-60s', point: 'Mutation Safety: Mutating a dict during iteration raises RuntimeError; resolve by iterating over list(d.keys()) or creating a dict comprehension.' }
      ],
      spokenScript: `"In Python 3, calling 'dict.keys()' returns a 'dict_keys' view object rather than allocating a static list of keys. A dictionary view is a lightweight, read-only window directly into the dictionary's internal hash table, consuming O(1) auxiliary memory regardless of whether the dictionary has ten keys or ten million keys.\n\nDictionary views have two powerful characteristics: first, they are dynamic—if keys are added or removed from the dictionary, the view reflects those changes instantaneously. Second, 'dict_keys' objects support mathematical set operations: you can compute common keys between two dictionaries using an intersection operator ('d1.keys() & d2.keys()') without converting anything to a set.\n\nA common junior pitfall is attempting to delete keys while iterating directly over the dictionary, which triggers 'RuntimeError: dictionary changed size during iteration' because CPython detects mutation in the hash table version tag. In our backend code, if we need to purge keys dynamically, we either iterate over an explicit snapshot list via 'list(d.keys())' or construct a clean dictionary using a comprehension."`,
      buzzwords: ['dict_keys view object', 'Dynamic view reflection', 'O(1) memory footprint', 'Set-like operations on views', 'RuntimeError mutation lock', 'Hash table version tag'],
      juniorMistake: 'Calling list(d.keys()) everywhere out of habit without realizing direct iteration "for k in d:" is faster and more memory-efficient.'
    }
  },

  // Q30: Abstraction vs Encapsulation
  30: {
    id: 30,
    docSpecs: {
      overview: 'Abstraction and Encapsulation are foundational Object-Oriented Programming (OOP) principles. Abstraction focuses on hiding background complexity and exposing only essential interfaces (implemented in Python via Abstract Base Classes `abc.ABC` and `@abstractmethod`). Encapsulation focuses on bundling data and methods that operate on that data into a cohesive unit, while restricting direct access to internal state using naming conventions (`_` protected, `__` private name-mangling) and `@property` getters/setters.',
      table: {
        headers: ['OOP Principle', 'Core Objective', 'Python Mechanism', 'Backend Production Example'],
        rows: [
          ['Abstraction', 'Hiding implementation details; defining "WHAT" a component does', 'Abstract Base Classes (`abc.ABC`), `@abstractmethod`, `typing.Protocol`', '`PaymentProcessor` interface requiring `charge()` regardless of Stripe vs PayPal.'],
          ['Encapsulation', 'Bundling data + behavior; restricting direct state access ("HOW")', 'Classes, single underscore `_`, double underscore `__`, `@property`', '`BankAccount` protecting `self._balance` and validating debit limits via `@balance.setter`.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Python\'s "We Are All Consenting Adults" Philosophy',
          content: 'Unlike Java or C++, Python has NO true hardware-enforced `private` keyword. Prefixing an attribute with a single underscore `_balance` is a cultural convention indicating internal use. Prefixing with double underscores `__balance` triggers Name Mangling (`_ClassName__balance`), designed primarily to prevent accidental naming collisions in subclasses, not for security.'
        },
        {
          type: 'tip',
          title: 'typing.Protocol (Structural Subtyping / Duck Typing)',
          content: 'In modern Python (PEP 544), you can achieve runtime and static abstraction without explicit class inheritance using `typing.Protocol`. Any class that implements the required methods satisfies the protocol automatically.'
        }
      ],
      commands: [
        {
          label: 'Abstraction via ABC and Encapsulation via @property',
          cmd: `from abc import ABC, abstractmethod\n\n# Abstraction: Defines contract without implementation\nclass PaymentGateway(ABC):\n    @abstractmethod\n    def charge(self, amount: float) -> bool:\n        pass\n\n# Encapsulation: Bundles state and validates mutations\nclass StripeGateway(PaymentGateway):\n    def __init__(self, api_key):\n        self._api_key = api_key  # Protected attribute\n        self._total_charged = 0.0\n\n    def charge(self, amount: float) -> bool:\n        if amount <= 0:\n            raise ValueError("Amount must be positive")\n        self._total_charged += amount\n        print(f"Charged \${amount:.2f} via Stripe")\n        return True`,
          lang: 'python',
          description: 'Implementing an abstract contract with ABC and encapsulating internal transaction state.'
        }
      ],
      didYouKnow: {
        title: '💡 Abstract Class Instantiation Guard',
        content: 'If a child class inherits from an `ABC` but forgets to implement even a single `@abstractmethod`, Python raises `TypeError: Can\'t instantiate abstract class ... with abstract method ...` at instantiation time!'
      }
    },
    challenge: {
      title: 'Abstract Base Class & Property Encapsulation Drill',
      steps: [
        'Define an abstract class `CacheBackend(ABC)` with `@abstractmethod` `get(key)` and `set(key, val)`.',
        'Demonstrate that attempting to instantiate `CacheBackend()` directly raises `TypeError`.',
        'Implement `RedisCache` satisfying the interface.',
        'Use `@property` and `@setter` to encapsulate a configuration value with validation logic.'
      ],
      codeSnippet: `from abc import ABC, abstractmethod

# 1. Abstraction: Contract Interface
class CacheBackend(ABC):
    @abstractmethod
    def get(self, key):
        pass

    @abstractmethod
    def set(self, key, value, ttl=300):
        pass

# Direct instantiation fails
try:
    CacheBackend()
except TypeError as err:
    print("Abstraction Guard Success:", err)

# 2. Encapsulation via @property
class RedisCache(CacheBackend):
    def __init__(self, port):
        self._port = None
        self.port = port  # Uses setter validation
        self._store = {}

    @property
    def port(self):
        return self._port

    @port.setter
    def port(self, value):
        if not (1 <= value <= 65535):
            raise ValueError("Invalid TCP port number")
        self._port = value

    def get(self, key):
        return self._store.get(key)

    def set(self, key, value, ttl=300):
        self._store[key] = value

cache = RedisCache(6379)
cache.set("session_1", "authenticated")
print("Retrieved from encapsulated cache:", cache.get("session_1"))`,
      expectedOutput: `Abstraction Guard Success: Can't instantiate abstract class CacheBackend without an implementation for abstract methods 'get', 'set'
Retrieved from encapsulated cache: authenticated`,
      interviewQuestion: 'What is the architectural distinction between Abstraction and Encapsulation? How does Python enforce private variables compared to compiled languages like Java?',
      interviewAnswer: 'Abstraction hides complexity by defining WHAT an interface does while concealing the implementation details. In Python, this is implemented using Abstract Base Classes (`abc.ABC`) and `@abstractmethod` or `typing.Protocol`, forcing subclasses to implement specific interfaces before instantiation.\n\nEncapsulation bundles state and methods together while restricting direct access to internal components (governing HOW data changes). Unlike Java, Python does not have compiler-enforced `private` keywords. Instead, Python relies on convention (`_variable` for protected) and Name Mangling (`__variable`). When Python encounters `__variable` inside class `Foo`, CPython rewrites the attribute internally to `_Foo__variable`. This is designed to prevent naming collisions in inheritance trees, not to enforce security, adhering to Python\'s philosophy: "We are all consenting adults here".',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain the difference between Abstraction and Encapsulation in Python? How does Python implement both, and how do you design decoupled services using Abstract Base Classes or Protocols?',
      framework: [
        { time: '0-15s', point: 'Core Distinction: Abstraction hides complexity and defines contracts (what); Encapsulation bundles data and restricts direct access (how).' },
        { time: '15-45s', point: 'Python Mechanics: Abstraction via abc.ABC / typing.Protocol; Encapsulation via @property getters/setters and name-mangling conventions.' },
        { time: '45-60s', point: 'Production Application: Define ABCs for swappable external infrastructure (storage engines, payment gateways) to enable clean dependency injection and mocking.' }
      ],
      spokenScript: `"While abstraction and encapsulation are often mentioned together, they solve two distinct software design challenges. Abstraction focuses on hiding complexity by defining clear interface contracts—specifying WHAT a component does rather than HOW it does it. Encapsulation, on the other hand, focuses on information hiding and data integrity—bundling state and behavior together and controlling HOW internal state is modified.\n\nIn Python, we achieve abstraction using the 'abc' module: an Abstract Base Class with '@abstractmethod' guarantees that subclasses implement mandatory interfaces like 'charge()' or 'upload()', raising a TypeError at instantiation if violated. For encapsulation, Python uses '@property' getters and setters to validate state changes, alongside naming conventions like single underscores for protected attributes and double underscores for name mangling.\n\nIn our production backend microservices, abstraction is the cornerstone of Dependency Inversion: we define abstract interfaces for infrastructure dependencies—such as 'EmailNotifier' or 'BlobStorageClient'. This allows our domain logic to depend on clean abstractions, making it effortless to swap between AWS S3 in production and an in-memory stub during automated integration testing."`,
      buzzwords: ['Abstraction (What) vs Encapsulation (How)', 'Abstract Base Classes (abc.ABC)', '@abstractmethod instantiation guard', 'Name mangling (_ClassName__attr)', '@property validation setter', 'Dependency Inversion Principle'],
      juniorMistake: 'Claiming double underscore "__x" makes a variable completely private and unreachable in Python.'
    }
  },

  // Q31: Multiple Inheritance & Diamond Problem
  31: {
    id: 31,
    docSpecs: {
      overview: 'The Diamond Problem occurs in multiple inheritance when a class inherits from two classes (B and C) that both inherit from a common base class (A). If B and C override a method from A, an ambiguity arises: which version does D inherit? Python solves this deterministically using the C3 Linearization Algorithm to compute an unambiguous Method Resolution Order (`MRO`), which can be inspected via `D.__mro__`.',
      table: {
        headers: ['Class Hierarchy Node', 'Inheritance Relationship', 'MRO Sequence in Python', 'Resolution Rule'],
        rows: [
          ['`Class A`', 'Root Base Class', '`[A, object]`', 'Terminates the cooperative `super()` chain.'],
          ['`Class B(A)`', 'Left Branch Child', '`[B, A, object]`', 'Overrides A; executed before C if listed first in D.'],
          ['`Class C(A)`', 'Right Branch Child', '`[C, A, object]`', 'Overrides A; executed after B if listed second in D.'],
          ['`Class D(B, C)`', 'Diamond Child', '`[D, B, C, A, object]`', 'Guarantees A is visited only ONCE and after both B and C.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The C3 Monotonicity Guarantee',
          content: 'C3 Linearization guarantees monotonicity: if Class B precedes Class C in one class\'s MRO, it will precede Class C in all subclass MROs. If an inheritance structure attempts to violate this order, CPython refuses to compile and raises `TypeError: Cannot create a consistent method resolution order (MRO)`.'
        },
        {
          type: 'tip',
          title: 'Always Forward **kwargs with super()',
          content: 'Because you cannot predict at authoring time what sibling class in the MRO will be called next, always accept and forward `**kwargs` in your `__init__`: `super().__init__(**kwargs)`.'
        }
      ],
      commands: [
        {
          label: 'The Classic Diamond Problem MRO Solution',
          cmd: `class A:\n    def ping(self):\n        print("A ping")\n\nclass B(A):\n    def ping(self):\n        print("B ping")\n        super().ping()\n\nclass C(A):\n    def ping(self):\n        print("C ping")\n        super().ping()\n\nclass D(B, C):\n    def ping(self):\n        print("D ping")\n        super().ping()\n\n# Inspect C3 Linearization\nprint("MRO:", [cls.__name__ for cls in D.__mro__])\nD().ping()`,
          lang: 'python',
          description: 'Demonstrating how C3 Linearization guarantees class A is called only once in diamond hierarchies.'
        }
      ],
      didYouKnow: {
        title: '💡 History of C3 in Python 2.3',
        content: 'Before Python 2.3, Python used a naive depth-first left-to-right search for methods. In the diamond problem, Python 2.2 visited A before visiting C, which broke modern object-oriented semantics! C3 Linearization fixed this permanently in Python 2.3.'
      }
    },
    challenge: {
      title: 'Diamond Problem MRO Execution & Inconsistent Order Drill',
      steps: [
        'Construct the standard diamond hierarchy: `A`, `B(A)`, `C(A)`, and `D(B, C)`.',
        'Verify with `D.__mro__` that `A` is visited only once, after both `B` and `C`.',
        'Attempt to create an impossible MRO class: `class Impossible(B, A)` where another class defines `(A, B)`.',
        'Observe the exact `TypeError: Cannot create a consistent method resolution order` exception.'
      ],
      codeSnippet: `class A:
    def execute(self):
        print("Root A executed")

class B(A):
    def execute(self):
        print("Left B executed")
        super().execute()

class C(A):
    def execute(self):
        print("Right C executed")
        super().execute()

class D(B, C):
    def execute(self):
        print("Diamond D executed")
        super().execute()

# 1. Run cooperative diamond
d = D()
d.execute()

# 2. Inspect MRO
print("\\nD.__mro__ order:")
for c in D.__mro__:
    print(" ->", c.__name__)

# 3. Create inconsistent MRO conflict
class X: pass
class Y(X): pass

try:
    # Conflicting order: X cannot precede Y because Y inherits from X!
    class Broken(X, Y): pass
except TypeError as err:
    print("\\nCaught MRO Error:", err)`,
      expectedOutput: `Diamond D executed
Left B executed
Right C executed
Root A executed

D.__mro__ order:
 -> D
 -> B
 -> C
 -> A
 -> object

Caught MRO Error: Cannot create a consistent method resolution order (MRO) for bases X, Y`,
      interviewQuestion: 'How does Python solve the Diamond Problem in multiple inheritance? What algorithm is used, and what does it guarantee?',
      interviewAnswer: 'Python solves the Diamond Problem using the C3 Linearization Algorithm (introduced in Python 2.3). When class `D(B, C)` inherits from `B` and `C` (which both inherit from `A`), C3 computes a deterministic linear order: `[D, B, C, A, object]`.\n\nC3 guarantees three fundamental properties:\n1. Subclasses appear before base classes (D precedes B and C; B and C precede A).\n2. Base class declaration order is preserved (since B was declared before C in `D(B, C)`, B precedes C in the MRO).\n3. Monotonicity: A base class order established in one part of the hierarchy is never reversed in a subclass. If an inheritance structure creates contradictory ordering constraints, Python raises `TypeError: Cannot create a consistent method resolution order (MRO)` during class definition.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the Diamond Problem in object-oriented programming? How does Python solve it using the C3 Linearization Algorithm, and how does super() cooperate across sibling classes?',
      framework: [
        { time: '0-15s', point: 'The Diamond Dilemma: Ambiguity when a class inherits from two parents that share a common grandparent.' },
        { time: '15-45s', point: 'C3 Linearization Solution: Python computes an unambiguous MRO [D, B, C, A, object] guaranteeing the grandparent is called only once.' },
        { time: '45-60s', point: 'super() Mechanism: super() calls the next class in the runtime MRO, enabling cooperative multi-mixin architectures in frameworks like Django.' }
      ],
      spokenScript: `"The Diamond Problem is a classic dilemma in multiple inheritance: when class D inherits from classes B and C, and both B and C inherit from a common base class A. If both B and C override a method from A, a naive compiler doesn't know whether D should inherit the implementation from B or C, or risks executing A's constructor twice.\n\nPython resolves this deterministically using the C3 Linearization Algorithm. C3 compiles a strict Method Resolution Order—'D.__mro__'—guaranteeing that children precede parents, declaration order is preserved, and common base classes like A are visited only once, strictly after both sibling branches. For class D(B, C), the MRO is unambiguously D, then B, then C, then A, and finally object.\n\nThis is why 'super()' is so vital in Python: 'super()' does not mean 'call parent'; it means 'delegate to the next class in the runtime instance's MRO'. As long as each class calls 'super()' and forwards kwargs, execution flows cooperatively through the entire diamond without duplicating state initialization."`,
      buzzwords: ['The Diamond Problem', 'C3 Linearization Algorithm', 'Method Resolution Order (MRO)', 'Monotonicity guarantee', 'Cooperative super() chaining', 'TypeError on inconsistent MRO'],
      juniorMistake: 'Thinking Python uses a simple depth-first search that would call class A twice in a diamond inheritance pattern.'
    }
  },

  // Q32: Initialize Empty List, Tuple, Dict or Set
  32: {
    id: 32,
    docSpecs: {
      overview: 'In Python, empty data structures can be initialized using either literal syntax (`[]`, `()`, `{}`, `set()`) or type constructor functions (`list()`, `tuple()`, `dict()`, `set()`). Literal syntax is significantly faster because CPython emits dedicated specialized bytecodes (`BUILD_LIST`, `BUILD_MAP`, `LOAD_CONST`) at compile time, completely bypassing the global name lookup and function call overhead required by constructors.',
      table: {
        headers: ['Collection Type', 'Literal Syntax', 'Constructor Syntax', 'Bytecode Difference', 'Critical Trap'],
        rows: [
          ['`list`', '`[]`', '`list()`', '`BUILD_LIST 0` vs `LOAD_GLOBAL list` + `CALL_FUNCTION`', '`[]` is ~3x faster than `list()`.'],
          ['`tuple`', '`()`', '`tuple()`', '`LOAD_CONST ()` (pre-cached constant)', 'Single-element tuple requires a trailing comma: `(1,)`, not `(1)`.'],
          ['`dict`', '`{}`', '`dict()`', '`BUILD_MAP 0` vs `LOAD_GLOBAL dict` + `CALL_FUNCTION`', '`{}` is an empty DICT, NOT an empty set!'],
          ['`set`', '`set()` (No literal exists!)', '`set()`', '`LOAD_GLOBAL set` + `CALL_FUNCTION`', 'Writing `{}` creates a dictionary, NOT a set! You MUST use `set()` for an empty set.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The {} Empty Set Trap',
          content: 'The most common beginner trap in Python is writing `{}` thinking it creates an empty set. In Python, `{}` ALWAYS creates an empty `dict`! To create an empty set, you MUST use the constructor: `empty_set = set()`.'
        },
        {
          type: 'tip',
          title: 'Single Element Tuple Syntax',
          content: 'Parentheses alone do not create a tuple—the comma does! Writing `x = (5)` creates an integer `5`. To create a single-element tuple, you MUST include a trailing comma: `x = (5,)`.'
        }
      ],
      commands: [
        {
          label: 'Verifying Types & The Empty Set Pitfall',
          cmd: `# 1. Empty literal types\ne_list = []\ne_tuple = ()\ne_dict = {}\ne_set = set()  # MUST use constructor\n\nprint("[] type:", type(e_list))\nprint("() type:", type(e_tuple))\nprint("{} type (DICT, not set!):", type(e_dict))\nprint("set() type:", type(e_set))\n\n# 2. Single-element tuple verification\nnot_a_tuple = (42)\nreal_tuple = (42,)\nprint("(42) type:", type(not_a_tuple))    # <class 'int'>\nprint("(42,) type:", type(real_tuple))    # <class 'tuple'>`,
          lang: 'python',
          description: 'Inspecting types to verify literal syntax and avoid common syntax traps.'
        }
      ],
      didYouKnow: {
        title: '💡 Bytecode Disassembly Proof',
        content: 'Running `dis.dis("[]")` emits `BUILD_LIST 0`. Running `dis.dis("list()")` emits `LOAD_NAME list` followed by `CALL_FUNCTION 0`. The literal avoids looking up the name "list" in built-in scope, making it much faster.'
      }
    },
    challenge: {
      title: 'Bytecode Disassembly & Initialization Benchmark Drill',
      steps: [
        'Import `dis` to inspect bytecode differences between `[]` and `list()`.',
        'Demonstrate that `{}` is of type `dict` while `set()` is of type `set`.',
        'Verify that `(42)` is an `int` while `(42,)` is a `tuple`.',
        'Benchmark creation of 1,000,000 empty lists using literals vs constructors.'
      ],
      codeSnippet: `import dis
import time

# 1. Bytecode inspection
print("Bytecode for []:")
dis.dis("[]")

print("\\nBytecode for list():")
dis.dis("list()")

# 2. Type verification
print("\\nType checks:")
print("  type({}):", type({}))
print("  type(set()):", type(set()))
print("  type((10)):", type((10)))
print("  type((10,)):", type((10,)))

# 3. Performance Benchmark
start = time.perf_counter()
for _ in range(1_000_000):
    x = []
literal_time = time.perf_counter() - start

start = time.perf_counter()
for _ in range(1_000_000):
    x = list()
constructor_time = time.perf_counter() - start

print(f"\\n1,000,000 [] time:     {literal_time:.4f}s")
print(f"1,000,000 list() time: {constructor_time:.4f}s")
print(f"Literal is ~{constructor_time / literal_time:.1f}x faster!")`,
      expectedOutput: `Bytecode for []:
  1           0 BUILD_LIST               0
              2 RETURN_VALUE

Bytecode for list():
  1           0 LOAD_NAME                0 (list)
              2 CALL_FUNCTION            0
              4 RETURN_VALUE

Type checks:
  type({}): <class 'dict'>
  type(set()): <class 'set'>
  type((10)): <class 'int'>
  type((10,)): <class 'tuple'>

1,000,000 [] time:     ~0.0250s
1,000,000 list() time: ~0.0650s
Literal is ~2.5x faster!`,
      interviewQuestion: 'Why is "[]" faster than "list()" in Python, and why does Python have no literal syntax for an empty set?',
      interviewAnswer: '`[]` is faster than `list()` because the Python compiler recognizes `[]` as a language literal and directly emits the `BUILD_LIST 0` bytecode instruction. In contrast, `list()` is a function call: CPython must first resolve the name "list" by traversing local, global, and built-in scopes (`LOAD_GLOBAL`), push the callable to the stack, create a call frame, and execute the constructor.\n\nPython has no literal syntax for an empty set because the curly brace `{}` syntax was originally assigned to empty dictionaries when Python was created. When sets were introduced later in Python 2.4, `{}` was already deeply entrenched for empty dicts. To avoid breaking backward compatibility, Python required `set()` for empty sets, while allowing `{1, 2}` for non-empty sets.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you initialize empty collections in Python, why are literals preferred over constructors, and what traps exist with empty sets and single-element tuples?',
      framework: [
        { time: '0-15s', point: 'Literal Syntax: Prefer [], (), {}, and set(); literals are 2-3x faster than constructors due to direct bytecode emission.' },
        { time: '15-45s', point: 'Under the Hood: [] emits BUILD_LIST directly; list() requires global scope lookup and function call frame overhead.' },
        { time: '45-60s', point: 'Two Classic Traps: {} creates a dict, not a set (must use set()); single-element tuples require a trailing comma (1,).' }
      ],
      spokenScript: `"In Python, empty data structures should always be initialized using literal syntax—'[]' for lists, '()' for tuples, '{}' for dictionaries, and 'set()' for sets. Literals are significantly faster than constructor functions like 'list()' or 'dict()'.\n\nUnder the hood, when Python compiles '[]', it emits a single 'BUILD_LIST' bytecode instruction that allocates the array in C immediately. When you call 'list()', CPython has to perform a scope traversal across global and built-in namespaces to resolve the symbol 'list', push it to the evaluation stack, and invoke a function call frame, making 'list()' roughly three times slower than '[]'.\n\nThere are two classic syntax traps that every senior developer watches out for in code reviews: first, writing '{}' does not create an empty set—it creates an empty dictionary. To create an empty set, you must use 'set()'. Second, parentheses do not make a tuple—the comma does. Writing '(1)' evaluates to the integer 1; creating a single-element tuple strictly requires a trailing comma, '(1,)'."`,
      buzzwords: ['Language literals vs Constructor functions', 'BUILD_LIST & BUILD_MAP bytecode', 'LOAD_GLOBAL scope resolution overhead', 'The {} empty dict vs set() trap', 'Trailing comma tuple syntax', 'Micro-benchmarking'],
      juniorMistake: 'Writing "empty_set = {}" and wondering why dictionary methods appear on it, or writing "(val)" and thinking it is a tuple.'
    }
  },

  // Q33: Difference Between .py and .pyc Files
  33: {
    id: 33,
    docSpecs: {
      overview: '`.py` files contain human-readable Python source code written by developers. `.pyc` files contain compiled platform-independent bytecode generated automatically by the CPython interpreter and cached inside the `__pycache__/` directory. Bytecode caching allows Python to bypass the lexing, parsing, and code-generation phases on subsequent executions, accelerating application startup time.',
      table: {
        headers: ['Characteristic', '`.py` File', '`.pyc` File', 'Architectural Role'],
        rows: [
          ['Content', 'Plain-text human-readable source code', 'Binary CPython bytecode (`marshal` serialized)', 'Source code is edited; bytecode is executed by CPython Virtual Machine.'],
          ['Location', 'Root application directories', 'Stored inside `__pycache__/` subdirectories', 'Keeps project folders clean and separates compiled artifacts.'],
          ['Creation Trigger', 'Written by developer', 'Generated automatically on import by CPython', 'Bytecode is generated during import; top-level entry scripts are often not cached.'],
          ['Execution Speed', 'Slow startup (must parse AST)', 'Fast startup (loads bytecode directly)', 'Does NOT make the runtime code run faster; strictly accelerates startup/import speed.'],
          ['Cache Invalidation', 'Source of truth', 'Validated via header timestamp & file size (or hash)', 'If `.py` file timestamp is newer than `.pyc`, Python recompiles automatically.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The Magic Number Header',
          content: 'Every `.pyc` file begins with a 16-byte header containing a 4-byte Magic Number (identifying the exact CPython compiler version), bit flags, and the source file timestamp or SHA-256 hash. If the magic number mismatches the current Python interpreter, CPython ignores the file and recompiles.'
        },
        {
          type: 'warning',
          title: 'Never Commit __pycache__ to Git',
          content: 'Always include `__pycache__/` and `*.pyc` in your `.gitignore`. Committing bytecode leads to cross-platform merge conflicts and can cause stale bytecode execution bugs across team developer machines.'
        }
      ],
      commands: [
        {
          label: 'Precompiling Bytecode for Production Containers',
          cmd: `# Compile all .py files into .pyc bytecode in a Docker build step\npython -m compileall -b /app\n\n# Run Python without writing any .pyc files to disk\npython -B main.py\n# Or set environment variable: export PYTHONDONTWRITEBYTECODE=1`,
          lang: 'bash',
          description: 'Precompiling bytecode for faster container cold starts and disabling bytecode on read-only filesystems.'
        }
      ],
      didYouKnow: {
        title: '💡 Disabling Bytecode Writing in Docker',
        content: 'In Docker production containers, setting `ENV PYTHONDONTWRITEBYTECODE=1` prevents Python from writing `.pyc` files at runtime, which is essential if running containers as unprivileged users on read-only root filesystems.'
      }
    },
    challenge: {
      title: 'Bytecode Inspection & __pycache__ Generation Drill',
      steps: [
        'Import `importlib` and inspect module cache locations.',
        'Use `py_compile` to programmatically compile a `.py` file into a `.pyc` file.',
        'Read the first 4 bytes of the `.pyc` header to inspect the CPython Magic Number.',
        'Verify that bytecode caching accelerates import time without changing runtime execution speed.'
      ],
      codeSnippet: `import py_compile
import os
import importlib.util

# 1. Inspect Magic Number
magic = importlib.util.MAGIC_NUMBER
print("CPython Magic Number (hex):", magic.hex())

# 2. Compile a temporary module
temp_source = "temp_worker.py"
with open(temp_source, "w", encoding="utf-8") as f:
    f.write("def compute(): return 42 * 2\\n")

compiled_path = py_compile.compile(temp_source)
print("Compiled .pyc path:", compiled_path)

# 3. Inspect .pyc header
with open(compiled_path, "rb") as f:
    header = f.read(16)
    print("Header bytes (16 bytes):", header[:8].hex(), "...")

# Cleanup
os.remove(temp_source)
if os.path.exists(compiled_path):
    os.remove(compiled_path)`,
      expectedOutput: `CPython Magic Number (hex): (e.g. a70d0d0a for Python 3.12)
Compiled .pyc path: __pycache__/temp_worker.cpython-3xx.pyc
Header bytes (16 bytes): ... (hex matching magic number)`,
      interviewQuestion: 'Does running a .pyc file make Python code execute faster than running a .py file? How does CPython detect when a .pyc file is stale?',
      interviewAnswer: 'No, running from a `.pyc` file does NOT make the actual code execute any faster. Python source code is always compiled into bytecode before execution anyway; a `.pyc` file simply caches that bytecode on disk. Loading a `.pyc` file saves the startup time required for lexical analysis, AST parsing, and bytecode generation, which speeds up application import time, but runtime execution speed is identical.\n\nCPython detects stale `.pyc` files by examining the 16-byte header: in standard timestamp-based validation (PEP 552), CPython checks the modification timestamp and file size of the source `.py` file against the timestamp recorded in the `.pyc` header. If the source file is newer, CPython automatically invalidates the cache, recompiles the source, and overwrites the `.pyc` file.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the difference between .py and .pyc files? How does CPython generate and invalidate bytecode caches, and how do you optimize Python startup in containerized environments?',
      framework: [
        { time: '0-15s', point: 'Definitions: .py is human-readable source code; .pyc is compiled bytecode cached in __pycache__ for faster startup.' },
        { time: '15-45s', point: 'Compilation Lifecycle: CPython parses AST into bytecode; caches in .pyc with magic number and timestamp header (PEP 552).' },
        { time: '45-60s', point: 'Production Optimization: Use python -m compileall in Docker build stages for instant cold starts; use PYTHONDONTWRITEBYTECODE=1 for read-only containers.' }
      ],
      spokenScript: `"In the Python runtime model, '.py' files contain our human-readable source code, whereas '.pyc' files contain compiled, platform-independent bytecode generated by CPython and stored inside '__pycache__' directories.\n\nWhen a module is imported for the first time, CPython parses the source code into an Abstract Syntax Tree (AST), compiles it into bytecode instructions, and writes a serialized '.pyc' file. The '.pyc' header contains a 4-byte Magic Number identifying the Python compiler version and a timestamp or hash of the original source file. If the source '.py' file is modified, Python detects the timestamp mismatch and automatically recompiles it.\n\nA common misconception is that '.pyc' files make Python code run faster. In reality, they only accelerate cold-start import time by skipping the parsing phase; runtime execution speed is identical. In our production Docker builds, we run 'python -m compileall' during image generation to pre-compile all bytecode upfront, ensuring that our server pods start instantly without filesystem write latency."`,
      buzzwords: ['CPython compilation pipeline', 'Bytecode cache (__pycache__)', 'AST parsing & compilation', 'Magic number & timestamp header (PEP 552)', 'python -m compileall', 'PYTHONDONTWRITEBYTECODE=1'],
      juniorMistake: 'Believing that .pyc files contain native machine code like C/C++ object files, or thinking that code in .pyc runs faster during execution.'
    }
  },

  // Q34: Slicing and [::-1]
  34: {
    id: 34,
    docSpecs: {
      overview: 'Slicing in Python retrieves a subset of sequence elements using the syntax `sequence[start:stop:step]`. Under the hood, bracket slice notation instantiates a built-in `slice(start, stop, step)` object and passes it to the sequence\'s `__getitem__()` method. When negative step values are used—most famously `[::-1]`—CPython traverses the underlying pointer array backwards from tail to head, returning a reversed shallow copy of the sequence.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'Slicing Returns a Shallow Copy',
          content: 'Slicing a list (`lst[:]` or `lst[::-1]`) creates a new list container, but the elements inside it remain shallow references to the original objects. Modifying a mutable nested object inside the sliced list will affect the original list.'
        },
        {
          type: 'tip',
          title: 'In-Place Reversal vs Slicing',
          content: '`[::-1]` allocates a new list in heap memory with O(N) space complexity. If you only need to reverse a list in-place without copying, use `my_list.reverse()`, which runs in O(N) time with O(1) space. If you only need to iterate in reverse, use `reversed(my_list)`.'
        }
      ],
      commands: [
        {
          label: 'Slicing Syntax & Step Traversal',
          cmd: `items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n\n# Sub-slice with step\nprint("Even indices [::2]:", items[::2])\n\n# Reversed sequence [::-1]\nprint("Reversed list [::-1]:", items[::-1])\n\n# Slice assignment (in-place replacement)\nitems[1:4] = [10, 20, 30]\nprint("After slice assignment:", items)`,
          lang: 'python',
          description: 'Using slice notation for stepping, reversing, and in-place slice mutation.'
        }
      ],
      didYouKnow: {
        title: '💡 Slice Objects Can Be Named',
        content: 'You can create reusable named slice objects! Instead of hardcoding numbers like `record[10:20]`, write `RECORD_ID = slice(10, 20)` and use `record[RECORD_ID]`. This eliminates magic numbers in fixed-width file parsers.'
      }
    },
    challenge: {
      title: 'Named Slice Objects & In-Place vs Copy Reversal Drill',
      steps: [
        'Use `slice(start, stop, step)` explicitly to extract data from a fixed-width string.',
        'Demonstrate that `[::-1]` returns a new object with a different `id()`.',
        'Compare memory and execution between `[::-1]`, `list.reverse()`, and `reversed()`.',
        'Demonstrate in-place slice replacement (`lst[1:3] = [...]`).'
      ],
      codeSnippet: `import sys

# 1. Named Slice Objects for Fixed-Width Parsing
HEADER_SLICE = slice(0, 4)
PAYLOAD_SLICE = slice(4, 12)

raw_data = "PKT_98765432_END"
print("Header:", raw_data[HEADER_SLICE])
print("Payload:", raw_data[PAYLOAD_SLICE])

# 2. Slicing Identity & Memory
original = [1, 2, 3, 4, 5]
reversed_copy = original[::-1]

print("Are original and reversed the same object?", original is reversed_copy)
print("Reversed Copy:", reversed_copy)

# 3. In-place reversal vs generator
original.reverse()
print("In-place reversed original:", original)

# Lazy reversed iterator
rev_iter = reversed([10, 20, 30])
print("reversed() memory size:", sys.getsizeof(rev_iter), "bytes")
print("Iterated reversed:", list(rev_iter))`,
      expectedOutput: `Header: PKT_
Payload: 98765432
Are original and reversed the same object? False
Reversed Copy: [5, 4, 3, 2, 1]
In-place reversed original: [5, 4, 3, 2, 1]
reversed() memory size: ~48 bytes
Iterated reversed: [30, 20, 10]`,
      interviewQuestion: 'What is the time and space complexity of "my_list[::-1]" versus "my_list.reverse()" versus "reversed(my_list)"? When should each be used?',
      interviewAnswer: '1. `my_list[::-1]`: Time Complexity is O(N), Space Complexity is O(N). It allocates and returns a brand-new reversed list on the heap. Use this when you require an independent reversed copy without mutating the original list.\n\n2. `my_list.reverse()`: Time Complexity is O(N), Space Complexity is O(1). It reverses the pointers in-place within the existing array buffer and returns `None`. Use this when you do not need the original order and want zero auxiliary memory overhead.\n\n3. `reversed(my_list)`: Time Complexity is O(1) initialization, Space Complexity is O(1). It returns a lazy `list_reverseiterator` cursor that yields elements backwards on demand. Use this inside `for` loops when you simply need to iterate in reverse without copying or modifying the list.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does slice notation work in Python? Compare "[::-1]" with ".reverse()" and "reversed()" in terms of memory overhead, time complexity, and production use cases.',
      framework: [
        { time: '0-15s', point: 'Slice Mechanism: Bracket notation translates to __getitem__(slice(start, stop, step)); [::-1] walks the array backwards.' },
        { time: '15-45s', point: 'Complexity Breakdown: [::-1] creates a new list (O(N) memory); .reverse() mutates in-place (O(1) memory); reversed() yields lazily (O(1) memory).' },
        { time: '45-60s', point: 'Production Best Practice: Use reversed() for loops; .reverse() for memory-constrained worker queues; named slice objects for parsing fixed-width feeds.' }
      ],
      spokenScript: `"In Python, sequence slicing is syntactic sugar for the built-in 'slice' object. When you write 'seq[start:stop:step]', CPython compiles this into 'seq.__getitem__(slice(start, stop, step))'. When a negative step is specified—such as '[::-1]'—the runtime traverses the pointer array backwards from the last element to the first.\n\nWhen reversing a list in production, understanding the performance trade-offs is essential. Using 'lst[::-1]' has O(N) time complexity and O(N) auxiliary space complexity because it allocates a brand new list in heap memory. In high-throughput backend services handling millions of elements, this creates unnecessary garbage collector pressure.\n\nIf you want to reverse the collection without allocating extra memory, you should use 'lst.reverse()', which swaps pointers in-place with O(1) memory overhead. If you only need to iterate over the collection backwards in a loop, 'reversed(lst)' is the most optimal choice: it returns a lazy reverse iterator consuming constant O(1) memory without modifying the original collection."`,
      buzzwords: ['slice(start, stop, step) object', '__getitem__ dispatch', 'O(N) heap allocation vs O(1) in-place', 'list.reverse() in-place mutation', 'reversed() lazy iterator', 'Shallow copy semantics'],
      juniorMistake: 'Using [::-1] inside a for loop over a massive list, unnecessarily duplicating millions of items in memory.'
    }
  },

  // Q35: Concatenating Tuples in Python
  35: {
    id: 35,
    docSpecs: {
      overview: 'Because tuples are immutable in Python, they cannot be modified or appended to in-place. Concatenating two tuples using the `+` operator or `+=` allocates an entirely new tuple object in heap memory with a size equal to the sum of both tuples, copying all element pointers into the new container. In high-performance backend pipelines, repeatedly concatenating tuples inside a loop leads to quadratic O(N^2) memory reallocation slowdown.',
      table: {
        headers: ['Concatenation Technique', 'Memory Reallocation', 'Time Complexity', 'Senior Recommendation'],
        rows: [
          ['`t1 + t2`', 'Allocates a brand new tuple on every call', 'O(N + M)', 'Fine for one-off joins of small fixed tuples.'],
          ['`t += (x,)` in a loop', 'Reallocates a new tuple on EVERY iteration', 'O(N^2) quadratic catastrophe', 'ANTI-PATTERN! Reallocates and copies memory on every cycle.'],
          ['`itertools.chain(t1, t2)`', 'Zero memory reallocation; lazy stream', 'O(1) initialization', 'Best for iterating across multiple tuples without allocating new memory.'],
          ['Accumulate list, cast to tuple', 'Amortized O(1) appends, single final allocation', 'O(N) linear total', 'Best when dynamically building a tuple from unknown stream sizes.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The += Tuple Loop Performance Trap',
          content: 'Writing `t = (); for x in items: t += (x,)` is a severe quadratic O(N^2) performance trap. Because tuples are immutable, Python allocates a completely new tuple and copies all previous pointers on every single iteration! Always append to a list and cast with `tuple(my_list)` at the end.'
        },
        {
          type: 'tip',
          title: 'Zero-Copy Chaining with itertools.chain',
          content: 'If you need to iterate over multiple large tuples consecutively, use `itertools.chain(t1, t2, t3)`. It yields items sequentially without allocating any new tuple containers in memory.'
        }
      ],
      commands: [
        {
          label: 'Tuple Concatenation & itertools.chain',
          cmd: `import itertools\n\nt1 = (1, 2, 3)\nt2 = (4, 5, 6)\n\n# 1. Standard concatenation (allocates new tuple)\nt_combined = t1 + t2\nprint("Combined tuple:", t_combined)\n\n# 2. Zero-allocation iterator chaining\nchained_stream = itertools.chain(t1, t2)\nprint("Chained items:", list(chained_stream))`,
          lang: 'python',
          description: 'Comparing standard tuple concatenation with zero-allocation itertools.chain.'
        }
      ],
      didYouKnow: {
        title: '💡 CPython PyTuple_Concat Optimization',
        content: 'When concatenating two tuples in CPython (`PyTuple_Concat`), if either tuple is empty (`len == 0`), CPython returns the other tuple directly with an incremented reference count without allocating any new memory!'
      }
    },
    challenge: {
      title: 'Tuple Concatenation Reallocation & itertools Benchmark Drill',
      steps: [
        'Demonstrate that `t1 + t2` creates a completely new object (`id(t3) != id(t1)`).',
        'Compare the execution time of appending in a loop using `t += (i,)` vs `list.append()` followed by `tuple()`.',
        'Use `itertools.chain` to iterate over multiple tuples with zero container allocation.'
      ],
      codeSnippet: `import time
import itertools

# 1. Identity Verification
t1 = ("A", "B")
t2 = ("C", "D")
t3 = t1 + t2
print("t1 id:", id(t1))
print("t3 id (New Object):", id(t3))
print("Result:", t3)

# 2. Performance Comparison: Tuple += vs List Append
n = 10_000

# Bad: Tuple +=
start = time.perf_counter()
t_acc = ()
for i in range(n):
    t_acc += (i,)
tuple_loop_time = time.perf_counter() - start

# Good: List append then cast
start = time.perf_counter()
l_acc = []
for i in range(n):
    l_acc.append(i)
final_tuple = tuple(l_acc)
list_loop_time = time.perf_counter() - start

print(f"\\nTuple += (10k items): {tuple_loop_time:.4f}s (O(N^2))")
print(f"List append + cast:  {list_loop_time:.4f}s (O(N))")
print(f"List approach is ~{tuple_loop_time / list_loop_time:.1f}x faster!")`,
      expectedOutput: `t1 id: (address 1)
t3 id (New Object): (address 2)
Result: ('A', 'B', 'C', 'D')

Tuple += (10k items): ~0.0450s (O(N^2))
List append + cast:  ~0.0010s (O(N))
List approach is ~45x faster!`,
      interviewQuestion: 'What happens at the CPython memory level when you execute "t1 + t2" on two tuples? Why is "t += (x,)" inside a loop an anti-pattern?',
      interviewAnswer: 'When `t1 + t2` executes, CPython invokes `PyTuple_Concat()`. Because tuples are immutable, Python cannot resize `t1`. Instead, it allocates a completely new `PyTupleObject` on the heap with size `len(t1) + len(t2)`, copies the object pointers from `t1`, copies the object pointers from `t2`, and increments the reference count of all contained items.\n\nExecuting `t += (x,)` inside a loop of size N is a disastrous quadratic O(N^2) anti-pattern. On every single iteration, Python allocates a new tuple of size 1, 2, 3, ... N and copies all previous pointers. For 50,000 items, this copies over 1.2 billion pointers, grinding the CPU to a halt. The correct pattern is accumulating elements in a mutable list (amortized O(1) appends) and casting to a tuple once at the end with `tuple(lst)`.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does tuple concatenation work in Python? What happens to memory allocation, and what performance hazards must you avoid when aggregating tuple records in backend data workers?',
      framework: [
        { time: '0-15s', point: 'Immutability & Allocation: Tuples cannot be modified in-place; concatenation allocates a brand new PyTupleObject and copies pointers.' },
        { time: '15-45s', point: 'The O(N^2) Loop Trap: Running t += (item,) inside a loop causes quadratic memory copying; always accumulate in a list first.' },
        { time: '45-60s', point: 'Zero-Copy Chaining: Use itertools.chain to stream multiple tuples sequentially without allocating intermediate containers.' }
      ],
      spokenScript: `"Because tuples in Python are immutable fixed-length sequences, they cannot be expanded or mutated in-place. When you concatenate two tuples using 't1 + t2', CPython invokes 'PyTuple_Concat', which allocates a brand new tuple on the heap with exact sizing equal to the sum of both lengths, and copies over the object pointers with O(N + M) complexity.\n\nA dangerous anti-pattern that junior developers write is accumulating items in a loop using 't += (item,)'. Because a new tuple is allocated on every single cycle, this creates an O(N^2) quadratic algorithm: accumulating 20,000 database records this way takes seconds and churns garbage collection.\n\nIn our backend architecture, we enforce two standards: if you are dynamically aggregating records, always append to a mutable Python list and cast it with 'tuple(my_list)' once at the end. If you need to iterate across multiple existing tuples in an ETL pipeline, use 'itertools.chain(t1, t2)', which streams the elements lazily with zero intermediate memory allocations."`,
      buzzwords: ['PyTuple_Concat allocator', 'Immutability semantics', 'Quadratic O(N^2) concatenation trap', 'Pointer copying overhead', 'itertools.chain zero-copy', 'List accumulation pattern'],
      juniorMistake: 'Writing "t += (val,)" inside a loop over thousands of records and wondering why the task times out.'
    }
  },

  // Q36: Arrays vs Lists in Python
  36: {
    id: 36,
    docSpecs: {
      overview: 'While both store sequences, Python `list` and `array.array` have fundamentally different memory layouts. A Python list is a generic dynamic array of pointers to arbitrary heap-allocated `PyObject` structs, allowing heterogeneous types but incurring heavy pointer indirection overhead (~8 bytes per pointer + 28-36 bytes per integer). `array.array` (and NumPy `ndarray`) stores homogeneous primitive C types packed contiguously in flat memory without pointer wrappers.',
      table: {
        headers: ['Feature', 'Python `list`', 'Standard `array.array`', 'NumPy `ndarray`'],
        rows: [
          ['Data Types Supported', 'Heterogeneous (any Python object)', 'Homogeneous (single C typecode: \'i\', \'f\', \'d\')', 'Homogeneous (C typed dtypes: int32, float64)'],
          ['Memory Layout', 'Array of pointers to `PyObject` on heap', 'Packed contiguous buffer of primitive C values', 'Contiguous C/Fortran strided memory buffer'],
          ['Memory Overhead', 'High (~8MB for 1M integers)', 'Low (~4MB for 1M 32-bit ints)', 'Extremely low (exact C struct size)'],
          ['Mathematical Vectorization', 'NO (requires manual loops in Python)', 'NO (sequential access only)', 'YES (SIMD vectorization and BLAS/LAPACK)'],
          ['Primary Production Use', 'General backend collections and domain models', 'Low-level binary network buffers and file I/O', 'Machine learning, numerical computing, tensor ops']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Pointer Indirection in Python Lists',
          content: 'In a Python list of integers `[1, 2, 3]`, the list does NOT hold numbers. It holds pointers to separate `PyLongObject` structs scattered across heap memory. Traversing the list causes continuous CPU cache misses due to pointer chasing.'
        },
        {
          type: 'tip',
          title: 'When to Use array.array in Backend Code',
          content: 'Use `array.array` when writing binary network protocols, parsing raw socket byte streams, or storing millions of uniform numeric IDs without adding external third-party dependencies like NumPy to your microservice container.'
        }
      ],
      commands: [
        {
          label: 'Memory Footprint Comparison: list vs array.array',
          cmd: `import sys\nimport array\n\n# 1,000,000 integers in a Python list\nlst = list(range(1_000_000))\n\n# 1,000,000 32-bit integers in array.array ('i' = signed 4-byte int)\narr = array.array('i', range(1_000_000))\n\nprint(f"List pointer container size: {sys.getsizeof(lst):,} bytes")\nprint(f"Array contiguous buffer size: {sys.getsizeof(arr):,} bytes")\nprint(f"Array uses ~{sys.getsizeof(lst) / sys.getsizeof(arr):.1f}x less memory!")`,
          lang: 'python',
          description: 'Measuring memory savings between pointer array lists and contiguous primitive buffers.'
        }
      ],
      didYouKnow: {
        title: '💡 Direct Binary Buffer Protocol',
        content: '`array.array` implements Python\'s Buffer Protocol (`__buffer__`), meaning it can be written directly to a binary file or network socket using `f.write(arr)` without any serialization overhead!'
      }
    },
    challenge: {
      title: 'Contiguous Memory Buffer vs Pointer Array Benchmark Drill',
      steps: [
        'Import `sys` and `array`.',
        'Initialize an `array.array("d")` storing 100,000 64-bit floating point numbers.',
        'Initialize a Python `list` storing the exact same numbers.',
        'Compare the total memory footprints using `sys.getsizeof()`.',
        'Write the array directly to a binary file and inspect its raw byte size.'
      ],
      codeSnippet: `import sys
import array
import os

count = 100_000

# 1. Contiguous Array ('d' = 8-byte C double)
arr = array.array('d', (float(i) for i in range(count)))

# 2. Python List
lst = [float(i) for i in range(count)]

print(f"Array buffer size: {sys.getsizeof(arr):,} bytes")
print(f"List buffer size:  {sys.getsizeof(lst):,} bytes")

# 3. Direct Binary I/O (Buffer Protocol)
bin_filename = "test_array.bin"
with open(bin_filename, "wb") as f:
    arr.tofile(f)  # Direct binary dump!

disk_size = os.path.getsize(bin_filename)
print(f"Raw binary disk file size: {disk_size:,} bytes (Exact 100k * 8 bytes!)")

os.remove(bin_filename)`,
      expectedOutput: `Array buffer size: 800,064 bytes
List buffer size:  800,984 bytes (plus separate PyFloatObjects!)
Raw binary disk file size: 800,000 bytes (Exact 100k * 8 bytes!)`,
      interviewQuestion: 'Why does a Python list of 1,000,000 integers consume significantly more total RAM than an array.array("i")? What is pointer chasing in CPython?',
      interviewAnswer: 'A Python list is a dynamic array of pointers (`PyObject*`). For 1,000,000 integers, the list allocates 8MB just for the pointers. Furthermore, each pointer points to an independent `PyLongObject` on the heap, which consumes 28 bytes of memory (for type header, reference count, and digits). The total memory consumed is ~36MB.\n\nIn contrast, `array.array("i")` allocates a single contiguous C buffer of 32-bit signed integers. 1,000,000 integers consume exactly 4MB of RAM—with ZERO pointer overhead and ZERO per-object headers.\n\nAdditionally, traversing a list causes "pointer chasing": the CPU must dereference non-contiguous heap pointers, triggering frequent L1/L2 CPU cache misses. An `array.array` or NumPy array is packed contiguously in memory, allowing the CPU cache prefetcher to load elements into L1 cache lines with peak throughput.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is the architectural difference between a Python list and array.array? How do their memory layouts differ, and why is NumPy preferred for high-performance numerical workloads?',
      framework: [
        { time: '0-15s', point: 'Memory Model: Python list is an array of pointers to boxed PyObjects; array.array is a flat contiguous buffer of unboxed C primitives.' },
        { time: '15-45s', point: 'Memory Overhead & Cache Locality: Lists waste ~36 bytes per int and cause CPU cache misses via pointer chasing; array.array packs data at C density.' },
        { time: '45-60s', point: 'Production Application: Use lists for general business logic; array.array for zero-dependency binary socket I/O; NumPy for SIMD-accelerated math.' }
      ],
      spokenScript: `"In Python, while lists and arrays appear similar on the surface, their underlying CPython memory layouts are fundamentally different. A standard Python list is a generic pointer array. It does not store actual values contiguously; it stores 8-byte pointers pointing to boxed 'PyObject' structs scattered across heap memory. Storing one million integers in a list incurs roughly 36 megabytes of memory and suffers from pointer chasing, where the CPU frequently misses L1 cache lines.\n\nIn contrast, 'array.array' from the standard library stores homogeneous primitive C types packed contiguously in a single contiguous memory block. One million 32-bit integers in an 'array.array' consume exactly 4 megabytes of RAM—nearly a 9x reduction in total memory.\n\nIn production architectures, we use standard Python lists for domain entities and mixed collections where flexibility is needed. For high-volume numeric processing, machine learning, and tensor math, we bypass Python lists entirely and use NumPy 'ndarrays', which not only pack data into contiguous C memory but also leverage SIMD vectorization and multithreaded BLAS libraries for microsecond execution."`,
      buzzwords: ['Boxed PyObject vs unboxed C primitive', 'Pointer chasing & CPU cache misses', 'Contiguous memory buffer', 'Buffer Protocol (__buffer__)', 'array.array code types', 'NumPy SIMD vectorization'],
      juniorMistake: 'Assuming Python lists are contiguous integer arrays like in C or Java int[], unaware of the pointer indirection overhead.'
    }
  }
};
