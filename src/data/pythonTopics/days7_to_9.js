// Python Days 7 to 9 (Questions 19 to 27)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_7_TO_9 = {
  // Q19: Type Conversion (Implicit vs Explicit)
  19: {
    id: 19,
    docSpecs: {
      overview: 'Type conversion in Python transforms a value from one data type to another. Python is strongly typed, meaning it does not automatically convert incompatible types (e.g. `1 + "2"` raises `TypeError`), but supports implicit type conversion (type coercion) between compatible numeric primitives (e.g. `int + float -> float`). Explicit type conversion (type casting) requires explicitly invoking constructor functions (`int()`, `float()`, `str()`, `list()`, `bool()`).',
      table: {
        headers: ['Conversion Category', 'Trigger Mechanism', 'Type Safety', 'Example', 'CPython Internal Dunder'],
        rows: [
          ['Implicit (Coercion)', 'Automatic by CPython for compatible numeric types', 'Guaranteed lossless precision where possible', '`5 + 2.5 -> 7.5`', 'Invokes `__radd__` and C-level numeric promotion'],
          ['Explicit (Casting)', 'Developer manually calls target type constructor', 'May raise `ValueError` or lose precision', '`int("42")`, `list((1, 2))`', 'Invokes `__int__()`, `__str__()`, `__iter__()`'],
          ['Boolean Truthiness', 'Evaluated automatically in boolean contexts', 'Strict Python truth value testing rules', '`bool([]) -> False`, `bool([0]) -> True`', 'Invokes `__bool__()` or falls back to `__len__() > 0`']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Strong vs Weak Typing Distinction',
          content: 'Candidates frequently confuse "dynamically typed" with "weakly typed". Python is dynamically typed (variable types are checked at runtime) but STRONGLY typed (operations on incompatible types like `"price: " + 100` are strictly rejected with `TypeError`, unlike JavaScript).'
        },
        {
          type: 'note',
          title: 'Boolean Fallback to __len__',
          content: 'When evaluating an object\'s truthiness, CPython first checks for `__bool__()`. If `__bool__()` is not defined, it checks for `__len__()`: returning `0` evaluates to `False`, and non-zero evaluates to `True`.'
        }
      ],
      commands: [
        {
          label: 'Implicit Numeric Promotion vs Explicit Casting',
          cmd: `# 1. Implicit numeric promotion (int promoted to float)\na = 10     # int\nb = 2.5    # float\nc = a + b  # float 12.5\nprint("Type of a + b:", type(c))\n\n# 2. Explicit string parsing with base\nhex_val = int("0xFF", 16)\nprint("Hex parsed to int:", hex_val)  # 255`,
          lang: 'python',
          description: 'Demonstrating Python\'s automatic numeric coercion and explicit base-aware parsing.'
        }
      ],
      didYouKnow: {
        title: '💡 Floating Point Precision Coercion Trap',
        content: 'Explicitly converting floats to decimals requires passing them as strings (`Decimal("0.1")`). Writing `Decimal(0.1)` casts the already imprecise IEEE 754 float into a Decimal, resulting in `0.1000000000000000055511151231257827021181583404541015625`!'
      }
    },
    challenge: {
      title: 'Type Coercion, Custom __bool__ & Decimal Casting Drill',
      steps: [
        'Demonstrate that Python rejects implicit string-to-integer addition (`"5" + 2`).',
        'Implement a custom class `ShoppingCart` that overrides `__len__` without `__bool__` and verify its boolean truthiness.',
        'Convert floats to `decimal.Decimal` using both string and float constructors to observe IEEE 754 precision differences.'
      ],
      codeSnippet: `from decimal import Decimal

# 1. Strong Typing Verification
try:
    _ = "Count: " + 42
except TypeError as err:
    print("Strong Typing Caught:", err)

# 2. Truthiness fallback to __len__
class ShoppingCart:
    def __init__(self):
        self.items = []

    def __len__(self):
        return len(self.items)

cart = ShoppingCart()
print("Empty cart truthiness:", bool(cart))
cart.items.append("Laptop")
print("Cart with 1 item truthiness:", bool(cart))

# 3. Decimal Casting Trap
bad_decimal = Decimal(0.1)
good_decimal = Decimal("0.1")
print("Bad Float Decimal: ", str(bad_decimal)[:25], "...")
print("Good String Decimal:", good_decimal)`,
      expectedOutput: `Strong Typing Caught: can only concatenate str (not "int") to str
Empty cart truthiness: False
Cart with 1 item truthiness: True
Bad Float Decimal:  0.10000000000000000555111 ...
Good String Decimal: 0.1`,
      interviewQuestion: 'How does Python evaluate the truthiness of an object in an if-statement if the class does not define __bool__()? What happens if it defines both __bool__() and __len__()?',
      interviewAnswer: 'When Python evaluates `if obj:`, CPython calls `PyObject_IsTrue()`. It first looks for a `__bool__()` method. If defined, it must return `True` or `False`. If `__bool__()` is NOT defined, Python checks for `__len__()`. If `__len__()` returns a positive non-zero integer, the object evaluates to `True`; if it returns `0`, it evaluates to `False`.\n\nIf a class defines BOTH `__bool__()` and `__len__()`, `__bool__()` takes strict precedence. Python will invoke `__bool__()` and completely ignore `__len__()` for truth value testing.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Is Python strongly typed or weakly typed, and dynamically typed or statically typed? Explain how Python handles implicit versus explicit type conversions, especially in high-precision financial backends.',
      framework: [
        { time: '0-15s', point: 'Type System Definition: Python is dynamically and strongly typed; variables lack static declarations, but operations on mismatched types are strictly forbidden.' },
        { time: '15-45s', point: 'Implicit vs Explicit: Python only coerces compatible numerics (int to float); all other conversions require explicit casting via constructors.' },
        { time: '45-60s', point: 'Financial Domain Practice: Never cast floats for currency; use decimal.Decimal with string initialization (Decimal("19.99")) to avoid float rounding errors.' }
      ],
      spokenScript: `"Python's type system is both dynamically typed and strongly typed. It is dynamically typed because types are associated with runtime values rather than variable declarations; it is strongly typed because Python strictly enforces type compatibility at runtime and never implicitly converts incompatible types—like string and integer—preventing silent data corruption.\n\nImplicit type conversion in Python is restricted strictly to compatible numeric operations—such as adding an integer to a float, where Python promotes the integer to a float to prevent loss of precision. Any other transformation requires explicit type conversion through constructors like 'int()', 'str()', or 'list()', which invoke internal dunder protocols like '__int__()' or '__iter__()'.\n\nIn financial backend systems, an essential engineering guideline is handling currency: you must never explicitly cast floats into Decimals. Passing float '0.1' into 'Decimal()' copies the underlying IEEE 754 binary floating-point representation, corrupting ledger totals. We always cast strictly from strings using 'Decimal(\"0.1\")'."`,
      buzzwords: ['Dynamically vs Strongly typed', 'Implicit numeric coercion', 'Explicit constructor casting', 'IEEE 754 precision pitfalls', 'Decimal string initialization', '__bool__ vs __len__ resolution'],
      juniorMistake: 'Claiming Python is weakly typed because you do not have to write "int x = 5", confusing dynamic typing with weak typing.'
    }
  },

  // Q20: *args and **kwargs Explained
  20: {
    id: 20,
    docSpecs: {
      overview: '`*args` and `**kwargs` allow Python functions to accept variable numbers of positional and keyword arguments. The single asterisk `*` packs arbitrary positional arguments into a `tuple`, while the double asterisk `**` packs arbitrary keyword arguments into a `dict`. At call sites, the same operators act as unpacking operators (splat operator), exploding sequences into positional parameters and dictionaries into keyword parameters.',
      table: {
        headers: ['Syntax', 'Function Definition Role (Packing)', 'Call-Site Role (Unpacking)', 'Underlying CPython Type'],
        rows: [
          ['`*args`', 'Packs extra positional arguments into a collection', 'Unpacks list/tuple elements into separate positional arguments', '`tuple` (immutable array)'],
          ['`**kwargs`', 'Packs extra named keyword arguments into a collection', 'Unpacks dictionary key-value pairs into named keyword arguments', '`dict` (hash table)']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Keyword-Only Arguments (PEP 3102)',
          content: 'Any parameter placed after `*args` (or a bare `*`) becomes a keyword-only argument: `def create_user(username, *, is_admin=False)`. It cannot be passed positionally, forcing callers to be explicit and preventing bugs in critical APIs.'
        },
        {
          type: 'tip',
          title: 'Perfect Forwarding in Decorators',
          content: '`*args, **kwargs` is the standard pattern for custom decorators and middleware proxies: `def wrapper(*args, **kwargs): return func(*args, **kwargs)` forwards all arguments to the target function with zero signature coupling.'
        }
      ],
      commands: [
        {
          label: 'Packing in Definitions & Unpacking at Call Sites',
          cmd: `# Packing into tuple and dict\ndef logger(*args, **kwargs):\n    print("Packed positional tuple:", args)\n    print("Packed keyword dict:", kwargs)\n\nlogger(1, "test", status="ACTIVE", retries=3)\n\n# Unpacking at call-site\nparams = [10, 20]\noptions = {"sep": " -> ", "end": "\\n"}\nprint(*params, **options)  # Unpacks to print(10, 20, sep=" -> ", end="\\n")`,
          lang: 'python',
          description: 'Demonstrating parameter packing in definitions and call-site unpacking.'
        }
      ],
      didYouKnow: {
        title: '💡 Dictionary Merging with ** in Python 3.5+',
        content: 'In Python 3.5+, you can merge multiple dictionaries using `merged = {**d1, **d2}`. In Python 3.9+, this was simplified even further with the union operator: `merged = d1 | d2`.'
      }
    },
    challenge: {
      title: 'Argument Forwarding & Keyword-Only Enforcement Drill',
      steps: [
        'Define a function `build_query(table, *filters, limit=100, **options)` that enforces `limit` as keyword-only.',
        'Verify that calling `build_query("users", "age > 18", 50)` raises a `TypeError` because 50 is treated as a filter rather than `limit`.',
        'Implement an API proxy function that forwards `*args, **kwargs` to a downstream service.',
        'Unpack a dictionary of database credentials into a connection function.'
      ],
      codeSnippet: `# 1. Keyword-only enforcement
def build_query(table, *filters, limit=100, **options):
    return {
        "table": table,
        "filters": list(filters),
        "limit": limit,
        "options": options
    }

# Normal call
q1 = build_query("orders", "status='PAID'", "amount > 50", limit=25, timeout=5)
print("Valid Query:", q1)

# Calling with positional limit (fails to bind to limit)
q2 = build_query("orders", "status='PAID'", 50)
print("Filters captured positional 50:", q2["filters"])
print("Limit remained default:", q2["limit"])

# 2. Call-site dictionary unpacking
db_config = {"host": "localhost", "port": 5432, "database": "prod_db"}
def connect(host, port, database):
    return f"Connected to {database} at {host}:{port}"

print(connect(**db_config))`,
      expectedOutput: `Valid Query: {'table': 'orders', 'filters': ["status='PAID'", 'amount > 50'], 'limit': 25, 'options': {'timeout': 5}}
Filters captured positional 50: ["status='PAID'", 50]
Limit remained default: 100
Connected to prod_db at localhost:5432`,
      interviewQuestion: 'What is the exact parameter order required when defining a Python function that uses standard arguments, default arguments, *args, keyword-only arguments, and **kwargs?',
      interviewAnswer: 'Python enforces a strict parameter declaration hierarchy (PEP 3102):\n1. Standard positional parameters (e.g. `a, b`)\n2. Positional parameters with defaults (e.g. `c=1`)\n3. Positional argument packing (`*args` or bare `*`)\n4. Keyword-only parameters (with or without defaults, e.g. `key_only=True`)\n5. Keyword argument packing (`**kwargs`)\n\nViolating this ordering (such as placing a non-default argument after a default argument before `*args`) raises `SyntaxError: non-default argument follows default argument` during compilation.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do *args and **kwargs work in Python? Walk me through how they are used for argument packing versus call-site unpacking, and how you use keyword-only arguments to design safe APIs.',
      framework: [
        { time: '0-15s', point: 'Core Mechanism: *args packs excess positional arguments into a tuple; **kwargs packs named arguments into a dictionary.' },
        { time: '15-45s', point: 'Unpacking & Forwarding: At call sites, * and ** explode collections into arguments, enabling perfect forwarding in decorators and proxy wrappers.' },
        { time: '45-60s', point: 'API Safety with Keyword-Only: Using bare * or placing params after *args forces explicit keyword invocation, preventing accidental positional misassignments.' }
      ],
      spokenScript: `"In Python, '*args' and '**kwargs' provide dynamic argument handling through packing and unpacking. In a function signature, '*args' packs any arbitrary positional arguments into an immutable tuple, while '**kwargs' captures extra named keyword parameters into a dictionary.\n\nAt call sites, the asterisk serves as an unpacking operator. When invoking another function, writing 'target_func(*args, **kwargs)' unpacks the tuple and dictionary back into individual parameters. This pattern of argument forwarding is foundational to decorators, factory functions, and API proxies because it decouples the wrapper from the target function's signature.\n\nIn our production APIs, we also leverage PEP 3102 keyword-only arguments. By placing critical configuration flags after a bare asterisk or after '*args'—like 'def update_user(user_id, *, notify_email=False)'—we force callers to name the argument explicitly. This prevents disastrous bugs where a developer accidentally passes an ID into a boolean flag positionally."`,
      buzzwords: ['Parameter packing & unpacking', 'Splat operator (* and **)', 'Tuple vs Dictionary storage', 'Perfect argument forwarding', 'Keyword-only arguments (PEP 3102)', 'API safety boundary'],
      juniorMistake: 'Thinking *args and **kwargs can be placed in any order, or confusing function signature packing with call-site unpacking.'
    }
  },

  // Q21: Context Managers & with statement
  21: {
    id: 21,
    docSpecs: {
      overview: 'The `with` statement in Python guarantees deterministic resource management by implementing the Context Manager Protocol (PEP 343). An object acting as a context manager defines `__enter__()` (which sets up the resource and optionally binds to the `as` variable) and `__exit__()` (which is guaranteed to execute upon leaving the block, even if unhandled exceptions, `break`, or `return` occur).',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'Exception Handling in __exit__',
          content: '`__exit__(self, exc_type, exc_val, exc_tb)` receives exception details if an error occurs inside the block. If `__exit__` returns `True`, Python suppresses the exception and continues execution normally. If it returns `None` or `False`, the exception re-propagates up the call stack.'
        },
        {
          type: 'tip',
          title: 'contextlib.contextmanager Generator Decorator',
          content: 'You do not need to write a full class with `__enter__` and `__exit__` for simple tasks. Decorating a generator containing a `try ... finally` block with `@contextlib.contextmanager` turns any generator with a single `yield` into an idiomatic context manager.'
        }
      ],
      commands: [
        {
          label: 'Custom Database Transaction Context Manager',
          cmd: `class DatabaseTransaction:\n    def __enter__(self):\n        print("BEGIN TRANSACTION")\n        return self\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        if exc_type is not None:\n            print(f"ROLLBACK TRANSACTION due to error: {exc_val}")\n            return False  # Let exception propagate\n        print("COMMIT TRANSACTION")\n        return True\n\n# Usage\nwith DatabaseTransaction():\n    print("Executing SQL INSERT into orders table...")`,
          lang: 'python',
          description: 'Standard transaction context manager ensuring commit or rollback.'
        }
      ],
      didYouKnow: {
        title: '💡 Multiple Context Managers in One Statement',
        content: 'Since Python 3.10, you can enclose multiple context managers in parentheses: `with (open("in.txt") as f_in, open("out.txt", "w") as f_out):`. Python enters them left to right and exits them right to left.'
      }
    },
    challenge: {
      title: 'Context Manager Protocol & Exception Suppression Drill',
      steps: [
        'Build a class `SafeFileLock` implementing `__enter__` and `__exit__`.',
        'Record acquisition and release in console logs.',
        'Simulate an exception inside the `with` block and observe that `__exit__` executes deterministically.',
        'Build the exact same behavior using `@contextlib.contextmanager` and a generator with `try/finally`.'
      ],
      codeSnippet: `from contextlib import contextmanager

# 1. Class-based Context Manager
class SafeFileLock:
    def __init__(self, resource_name):
        self.resource_name = resource_name

    def __enter__(self):
        print(f"[LOCK] Acquired lock for {self.resource_name}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"[LOCK] Released lock for {self.resource_name}")
        if exc_type is not None:
            print(f"[LOCK] Handled exception: {exc_val}")
            return True  # Suppress exception for demo

with SafeFileLock("payments.db"):
    print("Processing critical section...")
    raise RuntimeError("Payment gateway timeout!")

print("Execution continued because __exit__ returned True!\\n")

# 2. Generator-based with @contextmanager
@contextmanager
def temporary_metric(name):
    print(f"[METRIC START] {name}")
    try:
        yield
    finally:
        print(f"[METRIC END] {name}")

with temporary_metric("user_signup"):
    print("User registered in database.")`,
      expectedOutput: `[LOCK] Acquired lock for payments.db
Processing critical section...
[LOCK] Released lock for payments.db
[LOCK] Handled exception: Payment gateway timeout!
Execution continued because __exit__ returned True!

[METRIC START] user_signup
User registered in database.
[METRIC END] user_signup`,
      interviewQuestion: 'What are the four arguments passed to __exit__() in Python\'s Context Manager Protocol? How do you suppress an exception from propagating outside a with-block?',
      interviewAnswer: 'The `__exit__` method takes four arguments: `(self, exc_type, exc_val, exc_tb)`.\n- If the `with` block executed without errors, all three exception arguments are `None`.\n- If an exception occurred, `exc_type` receives the exception class (e.g. `ValueError`), `exc_val` receives the exception instance, and `exc_tb` receives the traceback object.\n\nTo suppress the exception and prevent it from crashing the program, `__exit__()` must return a truthy value (`return True`). If it returns `None` or `False`, Python re-raises the exception automatically at the end of the `with` statement.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does the "with" statement work in Python under the hood? Walk me through the Context Manager Protocol and explain how you implement transactional rollbacks or distributed locks in a production backend.',
      framework: [
        { time: '0-15s', point: 'Protocol Overview: The with statement manages resources deterministically via __enter__ and __exit__ methods (PEP 343).' },
        { time: '15-45s', point: 'Exception Handling: __exit__ receives exc_type, exc_val, exc_tb; returning True suppresses exceptions, while returning False lets them bubble up.' },
        { time: '45-60s', point: 'Production Use Cases: Managing Redis distributed locks, database transactions (COMMIT/ROLLBACK), and mock patches in testing suites.' }
      ],
      spokenScript: `"In Python, the 'with' statement implements the Context Manager Protocol, providing deterministic resource allocation and cleanup similar to RAII in C++. Under the hood, an object defines two methods: '__enter__()' and '__exit__()'. When entering the block, Python invokes '__enter__()' and assigns its return value to the optional 'as' variable. When exiting the block—whether normally, via an early return, or through an unhandled exception—CPython guarantees that '__exit__()' is called.\n\nThe '__exit__' method receives four parameters: 'self', 'exc_type', 'exc_val', and 'exc_tb'. If an error occurred inside the block, these parameters contain the full traceback. If '__exit__' returns 'True', Python completely suppresses the exception; if it returns 'False' or 'None', the exception re-propagates cleanly up the stack.\n\nIn our production backend services, we use context managers extensively for distributed Redis locks and database transactions. If an operation succeeds, '__exit__' commits the transaction and releases the lock; if an exception is thrown, it executes a rollback and releases the lock in a 'finally' block, preventing orphaned deadlocks across our Kubernetes worker pods."`,
      buzzwords: ['Context Manager Protocol (PEP 343)', '__enter__ and __exit__', 'Deterministic resource cleanup', 'Exception suppression (return True)', 'contextlib.contextmanager', 'Distributed locks & DB transactions'],
      juniorMistake: 'Assuming try/finally and context managers are mutually exclusive, or not knowing that returning True from __exit__ suppresses exceptions.'
    }
  },

  // Q22: File Read and Write Operations
  22: {
    id: 22,
    docSpecs: {
      overview: 'File operations in Python interact with operating system file descriptors using the built-in `open()` function. File access modes determine capabilities (`r` read, `w` overwrite, `a` append, `x` exclusive creation, `b` binary mode, `+` read/write). Efficient backend file handling requires buffered streaming, proper encoding specifications (e.g. `encoding="utf-8"`), and deterministic closing via context managers.',
      table: {
        headers: ['Mode', 'Description', 'File Must Exist?', 'File Pointer Initial Position', 'Truncates Existing Data?'],
        rows: [
          ['`"r"`', 'Read-only text mode', 'YES (raises `FileNotFoundError`)', 'Beginning of file (byte 0)', 'NO'],
          ['`"w"`', 'Write-only text mode', 'NO (creates file if missing)', 'Beginning of file (byte 0)', 'YES (wipes entire file immediately)'],
          ['`"a"`', 'Append mode', 'NO (creates file if missing)', 'End of file', 'NO (all writes appended to tail)'],
          ['`"x"`', 'Exclusive creation mode', 'NO (raises `FileExistsError` if exists)', 'Beginning of file', 'NO (fails safely against race conditions)'],
          ['`"rb"` / `"wb"`', 'Raw binary mode', 'Follows read/write rules', 'Follows read/write rules', 'Processes raw `bytes` without UTF-8 decoding']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Explicit Encoding Specification',
          content: 'Never call `open("file.txt", "r")` without `encoding="utf-8"`. Omitting encoding causes Python to fall back to `locale.getpreferredencoding()`, which is UTF-8 on Linux/macOS but `cp1252` on Windows, causing `UnicodeDecodeError` crashes in cross-platform deployments.'
        },
        {
          type: 'tip',
          title: 'Chunked File Streaming',
          content: 'Never call `file.read()` without an argument on user-uploaded files, as it buffers the entire file into heap RAM. Use chunked reads: `while chunk := file.read(65536): process(chunk)`.'
        }
      ],
      commands: [
        {
          label: 'Chunked 64KB Buffered Stream Reading',
          cmd: `# Chunked buffered binary file reader (Memory-efficient)\ndef process_large_file(filepath, chunk_size=65536):\n    with open(filepath, "rb") as f:\n        while chunk := f.read(chunk_size):\n            # Process 64KB chunk at a time\n            pass`,
          lang: 'python',
          description: 'Streaming files in 64KB chunks using walrus operator to avoid OOM memory crashes.'
        }
      ],
      didYouKnow: {
        title: '💡 Atomic File Writes in Production',
        content: 'To prevent corrupted half-written files when a server crashes, write to a temporary file (`file.tmp`) in the same directory, and then execute `os.replace("file.tmp", "file.json")`. On POSIX systems, `os.replace` is an atomic filesystem operation!'
      }
    },
    challenge: {
      title: 'Atomic File Writing & Chunked Streaming Drill',
      steps: [
        'Write data to a temporary file using the `with open()` context manager.',
        'Read the file line-by-line using an iterator to avoid loading all lines in memory.',
        'Demonstrate `seek()` and `tell()` to inspect and reposition the file pointer.',
        'Perform an atomic file replacement using `os.replace()`.'
      ],
      codeSnippet: `import os

temp_file = "test_metrics.tmp"
final_file = "test_metrics.log"

# 1. Write structured data
with open(temp_file, "w", encoding="utf-8") as f:
    f.write("timestamp=1000 event=LOGIN\\n")
    f.write("timestamp=1001 event=PAYMENT\\n")

# 2. Atomic rename (POSIX atomic swap)
os.replace(temp_file, final_file)
print(f"Atomically created: {final_file}")

# 3. Stream line-by-line & inspect tell()
with open(final_file, "r", encoding="utf-8") as f:
    print("Initial pointer:", f.tell())
    line1 = f.readline()
    print("Read Line 1:", line1.strip())
    print("Pointer after line 1:", f.tell())
    
    # Seek back to start
    f.seek(0)
    print("Pointer reset to start:", f.tell())

# Cleanup
os.remove(final_file)`,
      expectedOutput: `Atomically created: test_metrics.log
Initial pointer: 0
Read Line 1: timestamp=1000 event=LOGIN
Pointer after line 1: 27
Pointer reset to start: 0`,
      interviewQuestion: 'What is the risk of calling file.read() or file.readlines() on user-uploaded files in a web application? How do you implement safe, atomic file persistence?',
      interviewAnswer: 'Calling `file.read()` or `file.readlines()` reads the entire file content into heap memory at once. If an attacker uploads a 2GB file to an avatar upload endpoint, Python attempts to allocate 2GB of RAM, triggering an immediate Out-Of-Memory (OOM) kill by the Linux OOM-killer or container orchestrator.\n\nTo persist files safely: 1) Stream the upload in fixed 64KB chunks (`f.read(65536)`), 2) Write the incoming stream to a temporary hidden file on the same filesystem partition, and 3) Upon completion, call `os.replace(temp_path, final_path)`. `os.replace` is an atomic POSIX filesystem syscall that guarantees concurrent readers never see a partially written, corrupted file.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you handle file I/O operations in Python efficiently? What pitfalls exist regarding character encoding, memory usage, and file corruption during server restarts?',
      framework: [
        { time: '0-15s', point: 'Core Practices: Always use context managers (with open) and explicitly set encoding="utf-8" for text files.' },
        { time: '15-45s', point: 'Memory Protection: Avoid read() or readlines(); process large files via chunked binary streams (64KB chunks) or line iterators.' },
        { time: '45-60s', point: 'Atomic Writes: Write to a temp file first, then use os.replace() for atomic filesystem swapping to prevent corrupted files.' }
      ],
      spokenScript: `"In a backend production environment, file I/O must be designed for resource safety, memory boundaries, and crash resilience. We mandate three core engineering rules.\n\nFirst, all file access must use the 'with open()' context manager to guarantee that file descriptors are immediately closed, preventing OS descriptor exhaustion. Text files must always specify 'encoding=\"utf-8\"' explicitly to prevent silent UnicodeDecodeErrors on systems with non-UTF8 locale defaults.\n\nSecond, to protect our application pods against Out-Of-Memory crashes, we never call 'read()' or 'readlines()' on files of arbitrary size. Instead, we stream files using an iterator or in fixed 64-kilobyte binary chunks using 'f.read(65536)'.\n\nThird, to prevent file corruption if a server pod restarts mid-write, we implement atomic file writes: we stream the output to a temporary file on the same disk mount, and then call 'os.replace()'. Because 'os.replace' is an atomic filesystem syscall on POSIX systems, concurrent processes either see the complete old file or the complete new file, with zero chance of reading partial data."`,
      buzzwords: ['OS file descriptors', 'Explicit encoding="utf-8"', 'Chunked streaming (64KB)', 'OOM prevention', 'Atomic file writes (os.replace)', 'POSIX filesystem guarantees'],
      juniorMistake: 'Calling open() without a with-block, omitting utf-8 encoding, or using readlines() on huge CSV files.'
    }
  },

  // Q23: What is PYTHONPATH?
  23: {
    id: 23,
    docSpecs: {
      overview: '`PYTHONPATH` is an operating system environment variable that augments Python\'s default module search path. When a Python program executes an `import` statement, CPython sequentially searches the directories listed in `sys.path`. `PYTHONPATH` allows developers and containerized microservices to inject custom root directories into `sys.path` between the script\'s current directory and standard library locations.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'sys.path Search Order Hierarchy',
          content: 'CPython resolves imports by traversing `sys.path` in exact order:\n1. The directory containing the input script (or current directory `""`)\n2. Directories listed in the `PYTHONPATH` environment variable\n3. Python Standard Library directories\n4. Third-party packages (`site-packages`)'
        },
        {
          type: 'warning',
          title: 'Module Shadowing Hazard',
          content: 'If you create a local file named `math.py` or `random.py`, Python will import YOUR local file instead of the CPython standard library module because the script\'s directory precedes the standard library in `sys.path`! This is known as "Module Shadowing".'
        }
      ],
      commands: [
        {
          label: 'Inspecting sys.path Search Sequence',
          cmd: `import sys\nimport os\n\nprint("Current PYTHONPATH Env:", os.environ.get("PYTHONPATH", "Not set"))\nprint("\\nComplete sys.path search order:")\nfor idx, path in enumerate(sys.path):\n    print(f"  [{idx}] {path}")`,
          lang: 'python',
          description: 'Inspecting the exact directory search order traversed by CPython import machinery.'
        }
      ],
      didYouKnow: {
        title: '💡 Dynamic sys.path Manipulation',
        content: '`sys.path` is just a standard Python list! You can programmatically append directories at runtime (`sys.path.insert(0, "/path/to/shared")`), though in production setting `PYTHONPATH` in Dockerfiles is preferred.'
      }
    },
    challenge: {
      title: 'sys.path Resolution & Module Shadowing Prevention Drill',
      steps: [
        'Import `sys` and inspect the first element of `sys.path`.',
        'Verify that standard library `json` resolves to Python\'s installation directory via `json.__file__`.',
        'Demonstrate how `sys.path.insert(0, ...)` alters import precedence.',
        'Explain how Docker containers use `ENV PYTHONPATH=/app` to enable absolute microservice imports.'
      ],
      codeSnippet: `import sys
import json

print("1. sys.path length:", len(sys.path))
print("2. First search entry (script dir):", sys.path[0] or "./")

# Verify standard library module resolution
print("3. json module resolved from:", json.__file__)

# Programmatic injection (demonstration)
test_dir = "/tmp/my_backend_modules"
sys.path.insert(1, test_dir)
print("4. Injected custom path at index 1:", sys.path[1])

# Clean up
sys.path.remove(test_dir)`,
      expectedOutput: `1. sys.path length: (integer >= 5)
2. First search entry (script dir): (current working directory)
3. json module resolved from: .../lib/python3.x/json/__init__.py
4. Injected custom path at index 1: /tmp/my_backend_modules`,
      interviewQuestion: 'What is Module Shadowing in Python, how does it relate to sys.path resolution, and how do you configure PYTHONPATH in a production Docker container?',
      interviewAnswer: 'Module Shadowing occurs when a user-created script or module shares the exact same name as a Python standard library module (like `math.py`, `random.py`, or `test.py`) or third-party dependency. Because `sys.path[0]` is always the current working directory, Python encounters the local file first and imports it instead of the standard library, leading to mysterious `AttributeError` failures when standard methods are missing.\n\nIn Docker production containers, we set `ENV PYTHONPATH=/app` in the Dockerfile. This ensures that the root application directory `/app` is always present on `sys.path`, enabling clean, absolute imports (e.g. `from services.billing.client import StripeClient`) across all subpackages regardless of which subfolder a script or worker is launched from.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is PYTHONPATH, how does Python resolve imports through sys.path, and what architectural issues can arise if PYTHONPATH is misconfigured in production?',
      framework: [
        { time: '0-15s', point: 'Definition: PYTHONPATH is an environment variable that appends custom directory roots to Python\'s sys.path import search list.' },
        { time: '15-45s', point: 'Resolution Order: sys.path searches script dir first, then PYTHONPATH, then standard library, then site-packages.' },
        { time: '45-60s', point: 'Production Standards: Set ENV PYTHONPATH=/app in Docker containers to enable deterministic absolute imports and prevent module shadowing.' }
      ],
      spokenScript: `"In Python, 'PYTHONPATH' is an environment variable used to augment the default list of directories that CPython searches when resolving an 'import' statement. At startup, Python populates 'sys.path' in a strict hierarchical order: first, the directory of the running script; second, any directories specified in 'PYTHONPATH'; third, the Python standard library; and finally, third-party packages installed in 'site-packages'.\n\nIf PYTHONPATH is not properly managed in large backend codebases, two major problems occur. First is 'Module Shadowing'—if someone accidentally creates a file named 'email.py' or 'logging.py' in a directory preceding the standard library on sys.path, Python loads that local file instead of the built-in library, breaking framework internals. Second is broken relative imports when workers or CLI scripts are executed from nested subdirectories.\n\nIn our Kubernetes and Docker deployment pipelines, we explicitly define 'ENV PYTHONPATH=/app' in our base Dockerfile. This guarantees that the root of our repository is always available for deterministic absolute imports, ensuring that whether a task is executed by Celery, a cron job, or a WSGI worker, all package paths resolve consistently."`,
      buzzwords: ['sys.path directory list', 'Import resolution sequence', 'Module shadowing trap', 'Docker ENV PYTHONPATH=/app', 'Absolute imports vs relative imports', 'site-packages directory'],
      juniorMistake: 'Naming a test file "test.py" or "csv.py" and wondering why Python standard library imports start throwing AttributeErrors.'
    }
  },

  // Q24: Exception Handling (Try, Except, Else, Finally)
  24: {
    id: 24,
    docSpecs: {
      overview: 'Python provides structured exception handling via the four-part construct: `try`, `except`, `else`, and `finally`. `try` encapsulates code that might raise an exception. `except` intercepts matching exception classes. `else` executes if and only if the `try` block completed without raising any exceptions. `finally` is guaranteed to execute under all circumstances—including uncaught exceptions, `break`, `continue`, or `return` statements.',
      table: {
        headers: ['Clause', 'Execution Condition', 'Interaction with return / break', 'Senior Engineering Best Practice'],
        rows: [
          ['`try`', 'Always executed first', 'Normal execution flow', 'Keep the try block as narrow as possible (single operation).'],
          ['`except`', 'Executes ONLY if matching exception is raised', 'Can re-raise via `raise` or return fallback', 'Catch specific exceptions; NEVER catch bare `except:` or `BaseException`.'],
          ['`else`', 'Executes ONLY if NO exception occurred in `try`', 'Executes before `finally`', 'Place operations that depend on `try` succeeding here to avoid catching unintended errors.'],
          ['`finally`', 'ALWAYS executes (even on unhandled errors/returns)', 'Overrides `try` return values if `finally` returns', 'Release external OS resources, locks, and network sockets here.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Bare except: Anti-Pattern',
          content: 'Never write a bare `except:` or `except BaseException:`. `BaseException` catches `KeyboardInterrupt` (Ctrl+C) and `SystemExit`, making your process impossible to terminate cleanly in Docker and swallowing container SIGTERM signals.'
        },
        {
          type: 'note',
          title: 'Exception Chaining with raise ... from',
          content: 'When catching an exception and raising a custom domain exception, always use `raise CustomAPIError("Failed") from err`. This preserves the original traceback in `__cause__`, allowing Sentry and APM logs to display both exceptions.'
        }
      ],
      commands: [
        {
          label: 'The Complete Try-Except-Else-Finally Pattern',
          cmd: `def process_transaction(user_id, amount):\n    try:\n        # Narrow try block\n        account = fetch_account(user_id)\n    except AccountNotFoundError as err:\n        # Specific catch with chaining\n        raise PaymentError("User account invalid") from err\n    else:\n        # Runs ONLY if fetch_account succeeded\n        account.debit(amount)\n        print("Debit succeeded")\n    finally:\n        # ALWAYS runs (teardown/metrics)\n        record_latency_metric()`,
          lang: 'python',
          description: 'Industrial exception handling separating dangerous operations from dependent logic and cleanup.'
        }
      ],
      didYouKnow: {
        title: '💡 The finally Return Override Trap',
        content: 'If a function executes `return "A"` inside the `try` block, but has a `return "B"` inside the `finally` block, Python will silently discard `"A"` and return `"B"`! Never execute a `return` inside `finally`.'
      }
    },
    challenge: {
      title: 'Exception Chaining & Complete Clause Flow Drill',
      steps: [
        'Demonstrate the complete execution order of `try -> except -> finally` when an error occurs.',
        'Demonstrate the complete execution order of `try -> else -> finally` when no error occurs.',
        'Demonstrate proper exception chaining using `raise ... from`.',
        'Show the `finally` return override trap.'
      ],
      codeSnippet: `# 1. Try-Else-Finally (Success Case)
def divide(a, b):
    try:
        res = a / b
    except ZeroDivisionError:
        print("Caught divide by zero")
        return None
    else:
        print("Success! Result calculated:", res)
        return res
    finally:
        print("Cleanup in finally executed!")

print("--- Calling divide(10, 2) ---")
divide(10, 2)

print("\\n--- Calling divide(10, 0) ---")
divide(10, 0)

# 2. Exception Chaining with raise from
class DomainError(Exception): pass

try:
    try:
        int("invalid_number")
    except ValueError as original_err:
        raise DomainError("Parsing failed") from original_err
except DomainError as e:
    print("\\nChained Cause:", repr(e.__cause__))`,
      expectedOutput: `--- Calling divide(10, 2) ---
Success! Result calculated: 5.0
Cleanup in finally executed!

--- Calling divide(10, 0) ---
Caught divide by zero
Cleanup in finally executed!

Chained Cause: ValueError("invalid literal for int() with base 10: 'invalid_number'")`,
      interviewQuestion: 'What is the role of the "else" block in a Python try-statement? Why is it superior to placing dependent code directly inside the try block?',
      interviewAnswer: 'The `else` block executes if and only if the `try` block completed without raising any exceptions. It is superior to placing dependent code inside the `try` block because it adheres to the principle of "keeping try blocks as narrow as possible".\n\nIf you place 10 lines of dependent logic inside `try`, and line 8 raises a `ValueError`, your `except ValueError:` handler might catch that unintended secondary error and misdiagnose it as a primary failure. Moving dependent operations into `else` ensures that your `except` blocks strictly protect only the exact operation intended, preventing false-positive error handling.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does Python\'s exception handling mechanism work across try, except, else, and finally? How do you architect exception hierarchies and exception chaining in an enterprise backend API?',
      framework: [
        { time: '0-15s', point: 'Clause Architecture: try encapsulates the risk; except handles specific classes; else runs only on success; finally guarantees cleanup.' },
        { time: '15-45s', point: 'Chaining & Narrow Scopes: Keep try blocks minimal; use "raise CustomError from err" to preserve root cause tracebacks for Sentry.' },
        { time: '45-60s', point: 'Production Standards: Never catch BaseException; define domain-specific exception hierarchies inheriting from a BaseAppException.' }
      ],
      spokenScript: `"In Python, robust error handling relies on the full four-part construct: 'try', 'except', 'else', and 'finally'. In a production backend, we enforce strict rules around how these are used.\n\nFirst, the 'try' block must be as narrow as possible—ideally wrapping only the single line capable of throwing the expected failure. Second, any code that depends on the 'try' block succeeding should be placed in the 'else' clause. If you place dependent code inside the 'try' block, you risk catching unintended secondary exceptions and masking bugs. Third, 'finally' is guaranteed to execute even if unhandled exceptions or early return statements occur, making it the ideal location for releasing locks or closing database connections.\n\nIn our microservices, we build custom exception hierarchies inheriting from a shared 'BaseAppException'. When catching third-party library errors—such as a 'psycopg2' database timeout—we re-raise our domain exception using 'raise DatabaseUnavailableError from err'. The 'from err' syntax preserves the original cause in '__cause__', allowing APM tools like Sentry and Datadog to display the complete chained stack trace for rapid debugging."`,
      buzzwords: ['Narrow try block', 'try-except-else-finally lifecycle', 'Exception chaining (raise ... from)', '__cause__ traceback preservation', 'Domain exception hierarchy', 'BaseException anti-pattern'],
      juniorMistake: 'Writing a 50-line try block with a bare "except:" that swallows syntax errors, keyboard interrupts, and missing variables.'
    }
  },

  // Q25: Python 2 vs Python 3
  25: {
    id: 25,
    docSpecs: {
      overview: 'Python 3 (released in 2008, PEP 3000) intentionally broke backward compatibility with Python 2 to fix fundamental design flaws in the language. The most profound changes centered around Unicode string handling, integer division semantics, lazy iterators replacing eager lists, and unified integer precision.',
      table: {
        headers: ['Feature', 'Python 2.x', 'Python 3.x', 'Production Impact'],
        rows: [
          ['Strings & Unicode', '`str` was ASCII/bytes; `unicode` was separate', '`str` is strictly Unicode; `bytes` is raw binary', 'Eliminated ubiquitous `UnicodeDecodeError` bugs when handling multi-lingual data.'],
          ['Division (`/`)', 'Floor division for ints: `5 / 2 == 2`', 'True float division: `5 / 2 == 2.5` (`//` for floor)', 'Prevents silent truncation errors in mathematical and financial calculations.'],
          ['Iteration Primitives', '`range()`, `dict.keys()` returned eager lists', '`range()`, `dict.keys()` return lazy views/sequences', 'Drastically reduced default memory consumption across large loops.'],
          ['Print Syntax', '`print "hello"` (language statement)', '`print("hello")` (first-class function)', 'Allows passing custom keywords like `sep`, `end`, and `file`, and decorating print.'],
          ['Integer Types', 'Separate `int` and `long` types with overflow', 'Unified `int` with arbitrary precision', 'Integers automatically expand to consume arbitrary memory without overflow errors.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The Unicode Revolution',
          content: 'In Python 2, mixing `str` and `unicode` used implicit ASCII decoding, which failed catastrophically at runtime as soon as a non-ASCII character (like an emoji or accented letter) was passed. Python 3 enforces strict separation: text is `str` (Unicode), binary is `bytes`, and explicit encoding/decoding is required.'
        },
        {
          type: 'warning',
          title: 'Python 2 End of Life (EOL)',
          content: 'Python 2 officially reached End of Life on January 1, 2020. Running Python 2 in production today violates basic security compliance standards (SOC 2, ISO 27001, PCI-DSS) due to unpatched CVE vulnerabilities.'
        }
      ],
      commands: [
        {
          label: 'Python 3 True Division & Unicode Separation',
          cmd: `# True division in Python 3\nprint("5 / 2 =", 5 / 2)    # 2.5\nprint("5 // 2 =", 5 // 2)  # 2 (floor division)\n\n# Strict string vs bytes separation\ntext = "Backend 🚀"\nbinary_payload = text.encode("utf-8")\nprint("Encoded bytes:", binary_payload)\nprint("Decoded text:", binary_payload.decode("utf-8"))`,
          lang: 'python',
          description: 'Showing Python 3 true division and explicit text vs bytes encoding.'
        }
      ],
      didYouKnow: {
        title: '💡 CPython Flexible String Representation (PEP 393)',
        content: 'In Python 3.3+, CPython implemented PEP 393: strings containing only ASCII use 1 byte per char (Latin-1); strings with European accents use 2 bytes (UCS-2); and strings with emojis use 4 bytes (UCS-4), optimizing RAM automatically.'
      }
    },
    challenge: {
      title: 'Unicode vs Bytes & True Division Drill',
      steps: [
        'Demonstrate that Python 3 `/` produces a `float` even for two integers.',
        'Demonstrate that Python 3 forbids concatenating `str` and `bytes` without explicit decoding.',
        'Encode an emoji string into UTF-8 bytes and verify byte length vs character length.'
      ],
      codeSnippet: `# 1. True Division vs Floor Division
print("True division 7 / 2:", 7 / 2)
print("Floor division 7 // 2:", 7 // 2)

# 2. String vs Bytes Separation
text = "API Service ⚡"
raw_bytes = text.encode("utf-8")

print(f"Text length (chars): {len(text)}")
print(f"Bytes length (bytes): {len(raw_bytes)}")

# Forbids mixing
try:
    _ = "Header: " + b"BinaryPayload"
except TypeError as err:
    print("Caught TypeError on str + bytes:", err)`,
      expectedOutput: `True division 7 / 2: 3.5
Floor division 7 // 2: 3
Text length (chars): 13
Bytes length (bytes): 15
Caught TypeError on str + bytes: can only concatenate str (not "bytes") to str`,
      interviewQuestion: 'What was the single most fundamental architectural reason for breaking backward compatibility between Python 2 and Python 3?',
      interviewAnswer: 'The core reason was fixing text and binary data handling. In Python 2, the default `str` type was a byte string, while `unicode` was a distinct type. Python 2 attempted to implicitly coerce `str` and `unicode` using the default ASCII codec whenever they interacted. If any byte value exceeded 127, Python threw a runtime `UnicodeDecodeError`.\n\nPython 3 eliminated this implicit coercion completely by creating a clean boundary: `str` is exclusively human-readable Unicode text, and `bytes` is raw machine data. You can never implicitly mix `str` and `bytes`; you must explicitly call `.encode("utf-8")` to produce bytes, and `.decode("utf-8")` to produce text.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What were the primary architectural differences between Python 2 and Python 3? Why did Python 3 break backward compatibility, and what were the biggest pain points during migration?',
      framework: [
        { time: '0-15s', point: 'Core Motivation: Python 3 (PEP 3000) broke compatibility to fix Unicode handling, integer division, and iterator performance.' },
        { time: '15-45s', point: 'Major Architectural Shifts: Strict str (Unicode) vs bytes separation; true division (/); range() and dict views returning lazy sequences.' },
        { time: '45-60s', point: 'Modern State: Python 2 is EOL since 2020; modern Python 3.10+ brings pattern matching, performance upgrades, and typing.' }
      ],
      spokenScript: `"The architectural transition from Python 2 to Python 3 was driven primarily by the need to resolve fundamental design flaws that could not be fixed without breaking backward compatibility. The most critical change was the complete separation of text and binary data. In Python 2, strings were raw bytes and Python attempted implicit ASCII conversions with Unicode objects, causing widespread runtime 'UnicodeDecodeErrors'. Python 3 enforced a strict boundary: 'str' is strictly Unicode text, 'bytes' is binary data, and you must explicitly encode and decode at I/O boundaries.\n\nBeyond Unicode, Python 3 introduced true division where '5 / 2' yields '2.5' instead of integer truncating to '2', replaced eager list-allocating functions like 'range()' and 'dict.keys()' with lazy memory-efficient sequence objects, and unified 'int' and 'long' into a single arbitrary-precision integer type.\n\nPython 2 officially reached End of Life in 2020. Today, modern Python 3 represents a mature, high-performance ecosystem featuring static type hints, structural pattern matching, and major runtime optimizations through the Faster CPython initiative."`,
      buzzwords: ['PEP 3000', 'Unicode vs Bytes boundary', 'True division (/) vs Floor division (//)', 'Lazy sequence views', 'Arbitrary precision integers', 'Python 2 EOL (2020)'],
      juniorMistake: 'Mentioning only print statement vs print function without discussing Unicode vs bytes or lazy iterators.'
    }
  },

  // Q26: What is PIP in Python?
  26: {
    id: 26,
    docSpecs: {
      overview: '`pip` (Package Installer for Python) is the standard package manager for Python environments, maintaining communication with the Python Package Index (PyPI). It handles dependency resolution, downloads and verifies package distributions (preferring pre-compiled binary Wheels over Source Distributions), and installs packages into the active environment\'s `site-packages` directory.',
      table: {
        headers: ['Distribution Format', 'File Extension', 'Compilation Required?', 'Installation Speed', 'Security'],
        rows: [
          ['Wheel (Built Distribution)', '`.whl`', 'NO (contains pre-compiled C extensions & bytecode)', 'Instant (simple archive extraction)', 'Can be cryptographically signed; avoids local C compiler vulnerabilities'],
          ['Source Distribution (sdist)', '`.tar.gz`', 'YES (runs `setup.py` / `build-backend` locally)', 'Slow (requires local gcc/clang, headers, and build tools)', 'Executes arbitrary build script on user machine during installation']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Deterministic Deployments with Hash Verification',
          content: 'In production CI/CD pipelines, always install dependencies using hash checking: `pip install --require-hashes -r requirements.txt`. This guarantees that packages have not been tampered with or compromised on PyPI (protecting against supply-chain attacks).'
        },
        {
          type: 'warning',
          title: 'Avoid pip install in Root Global Python',
          content: 'Never run `sudo pip install` on a host Linux server! It mutates the host OS Python packages, frequently breaking system-level package managers (`apt`, `dnf`) and system daemons. Always isolate inside a virtual environment or container.'
        }
      ],
      commands: [
        {
          label: 'Production PIP Commands & Virtual Environment Management',
          cmd: `# 1. Upgrade pip\npython -m pip install --upgrade pip\n\n# 2. Install pinned package version\npip install "django>=5.1,<5.2"\n\n# 3. Freeze deterministic dependencies\npip freeze > requirements.txt\n\n# 4. Install with strict hash validation in CI/CD\n# pip install --no-deps --require-hashes -r requirements.lock`,
          lang: 'bash',
          description: 'Standard production dependency management commands using pip.'
        }
      ],
      didYouKnow: {
        title: '💡 Wheel File Naming Standard',
        content: 'Wheel filenames encode compatibility: `numpy-1.26.0-cp311-cp311-manylinux_2_17_x86_64.whl` tells pip that the binary is built for Python 3.11, standard CPython ABI, on a 64-bit Linux kernel with glibc >= 2.17.'
      }
    },
    challenge: {
      title: 'Package Inspection & Wheel Metadata Drill',
      steps: [
        'Check the installed `pip` version using `python -m pip --version`.',
        'Inspect an installed package using `pip show` to view its version, location, and dependencies.',
        'Inspect `pip list` in JSON format for automated security auditing scripts.',
        'Demonstrate dependency locking with `pip freeze`.'
      ],
      codeSnippet: `import sys
import subprocess

# 1. Check pip version programmatically
result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True)
print("Pip Version Check:\\n", result.stdout.strip())

# 2. Inspect active site-packages path
import site
print("\\nSite-Packages Locations:")
for p in site.getsitepackages():
    print(" ", p)`,
      expectedOutput: `Pip Version Check:
 pip 24.x from .../site-packages/pip (python 3.x)

Site-Packages Locations:
  .../lib/python3.x/site-packages`,
      interviewQuestion: 'What is the architectural difference between a Python Wheel (.whl) and a Source Distribution (.tar.gz)? Why are Wheels preferred in Docker build pipelines?',
      interviewAnswer: 'A Source Distribution (`sdist`, `.tar.gz`) contains raw source code and a build script (`setup.py` or `pyproject.toml`). If the package contains C/C++ or Rust extensions (like `numpy`, `cryptography`, or `psycopg2`), installing an sdist requires compiling code locally on the host machine. This requires installing `gcc`, Python C headers (`python3-dev`), and external library headers in your Docker image, causing massive image sizes and slow 10-minute builds.\n\nA Wheel (`.whl`) is a pre-compiled, built distribution format (PEP 427). Installing a wheel requires only extracting a ZIP archive and copying files directly into `site-packages`. It requires no compiler or build tools, installs in milliseconds, and guarantees reproducible binaries across staging and production Docker containers.',
      replLink: 'https://docs.python.org/3/installing/index.html'
    },
    scriptData: {
      prompt: 'What is PIP, how does it resolve and install dependencies from PyPI, and how do you ensure secure, deterministic package installations in production CI/CD pipelines?',
      framework: [
        { time: '0-15s', point: 'Definition: PIP is Python\'s official package manager, installing packages from PyPI into virtual environment site-packages.' },
        { time: '15-45s', point: 'Wheel vs Sdist: PIP prefers pre-compiled binary Wheels over source distributions to avoid local compiler requirements and slow builds.' },
        { time: '45-60s', point: 'Production Security: Use locked dependency files (pip-tools / poetry.lock) with SHA-256 hash checking to prevent supply-chain attacks.' }
      ],
      spokenScript: `"In the Python ecosystem, 'pip' is the standard package manager responsible for downloading, verifying, resolving, and installing packages from the Python Package Index (PyPI) into the active environment's 'site-packages'.\n\nWhen downloading a package, pip prefers the Wheel format—a pre-compiled binary distribution defined in PEP 427. Using Wheels is critical for production Docker containers: because Wheels contain pre-compiled C-extensions, container builds do not require installing 'gcc' or development headers, keeping container images lean and build times under a minute.\n\nIn our enterprise CI/CD architecture, we never run unconstrained 'pip install' commands. We enforce deterministic, reproducible builds using lockfiles generated by 'pip-tools' or 'poetry'. Every dependency in 'requirements.txt' is pinned to an exact version and paired with SHA-256 cryptographic hashes. Using 'pip install --require-hashes' guarantees that if an upstream package on PyPI is compromised or altered, our deployment pipeline halts immediately, protecting our infrastructure against supply-chain attacks."`,
      buzzwords: ['Python Package Index (PyPI)', 'Wheel (.whl) vs Source Distribution (sdist)', 'Pre-compiled C-extensions', 'Deterministic lockfiles (poetry/pip-tools)', 'SHA-256 hash validation (--require-hashes)', 'Supply-chain attack prevention'],
      juniorMistake: 'Running "pip install django" in production without version pinning or virtual environments.'
    }
  },

  // Q27: Common Uses and Applications of Python
  27: {
    id: 27,
    docSpecs: {
      overview: 'Python is a high-level, general-purpose programming language renowned for its expressive syntax, rapid development velocity, and vast ecosystem of specialized libraries. In backend engineering, Python excels in microservices (Django, FastAPI), asynchronous I/O services, machine learning / AI pipelines (PyTorch, TensorFlow), distributed data engineering (PySpark, Celery), and automation / infrastructure tooling.',
      table: {
        headers: ['Domain', 'Dominant Frameworks / Libraries', 'Key Architectural Strength', 'Trade-offs / Mitigations'],
        rows: [
          ['Web APIs & Microservices', 'FastAPI, Django, Flask', 'Rapid development, rich ORM, OpenAPI auto-docs', 'GIL limits CPU parallelism; scale horizontally with multi-process workers (Gunicorn).'],
          ['AI / Machine Learning', 'PyTorch, HuggingFace, TensorFlow', 'Python acts as an ergonomic control-plane for optimized C++/CUDA kernels', 'Python itself is not executing math; heavy tensor operations run on GPU/SIMD.'],
          ['Data Engineering & ETL', 'Pandas, Polars, PySpark', 'High-level dataframe manipulation and distributed analytics', 'Memory overhead of Python objects; use Arrow-backed Polars or DuckDB for scale.'],
          ['DevOps & Infrastructure', 'Ansible, Fabric, Boto3, Pulumi', 'Native OS integration, subprocess handling, cross-platform CLI tools', 'Dynamic typing requires strict static analysis (mypy) in large codebases.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'The C-Extension Architecture',
          content: 'Why is Python the undisputed king of Machine Learning despite being an interpreted language? Because libraries like PyTorch, NumPy, and TensorFlow are written in C, C++, and CUDA. Python serves as an ergonomic "glue language" orchestrating highly optimized native machine code.'
        },
        {
          type: 'tip',
          title: 'When NOT to Use Python',
          content: 'Avoid Python for low-latency financial high-frequency trading (HFT), device drivers, mobile native engines, or single-threaded CPU-bound crunching where C++, Rust, or Go provide microsecond predictability without garbage collection pauses.'
        }
      ],
      commands: [
        {
          label: 'FastAPI High-Performance Async Microservice Pattern',
          cmd: `# Modern Python asynchronous API pattern (FastAPI)\n# from fastapi import FastAPI\n# app = FastAPI()\n# @app.get("/health")\n# async def health_check():\n#     return {"status": "HEALTHY", "engine": "Python 3.12"}\n\nimport platform\nprint("Runtime:", platform.python_implementation())\nprint("Version:", platform.python_version())`,
          lang: 'python',
          description: 'Inspecting Python runtime environment and framework standard architecture.'
        }
      ],
      didYouKnow: {
        title: '💡 Instagram\'s Massive Django Architecture',
        content: 'Instagram runs the world\'s largest Django deployment, serving over 2 billion active users on millions of lines of Python, proving that Python can scale to planetary traffic when architected with proper caching and microservices.'
      }
    },
    challenge: {
      title: 'Platform Capabilities & Subprocess Orchestration Drill',
      steps: [
        'Inspect Python runtime capabilities via `sys` and `platform`.',
        'Demonstrate Python\'s capability as a systems automation tool using `subprocess`.',
        'Verify JSON serialization throughput.',
        'Discuss architectural tradeoffs when choosing Python vs Go or Rust for backend services.'
      ],
      codeSnippet: `import sys
import platform
import subprocess
import json

# 1. Inspect Python Environment
print("Python System Info:")
print(f"  Version: {sys.version.split()[0]}")
print(f"  Platform: {platform.platform()}")
print(f"  Architecture: {platform.machine()}")

# 2. Automation via Subprocess
cmd = [sys.executable, "-c", "print('Executed via Python Subprocess Engine!')"]
proc = subprocess.run(cmd, capture_output=True, text=True)
print("\\nSubprocess Result:", proc.stdout.strip())

# 3. Microservice Payload Serialization
payload = {"service": "AuthGateway", "status": 200, "active": True}
print("\\nSerialized Microservice Payload:", json.dumps(payload))`,
      expectedOutput: `Python System Info:
  Version: 3.x.x
  Platform: Linux-...
  Architecture: x86_64 (or aarch64)

Subprocess Result: Executed via Python Subprocess Engine!

Serialized Microservice Payload: {"service": "AuthGateway", "status": 200, "active": true}`,
      interviewQuestion: 'When would you deliberately choose Python for a new backend service, and when would you recommend an alternative language like Go or Rust?',
      interviewAnswer: 'I recommend Python when:\n1) High development velocity and rapid time-to-market are critical.\n2) The service involves data science, machine learning models, or complex data transformations (leveraging PyTorch, Pandas, or Scikit-learn).\n3) The workload is primarily I/O-bound (database queries, external API integrations, caching) where Python\'s `asyncio` or WSGI workers perform excellently.\n\nConversely, I recommend Go or Rust when:\n1) The application is strictly CPU-bound (such as audio/video encoding, cryptography, or game engines) where Python\'s GIL and interpreter overhead become bottlenecks.\n2) Ultra-low microsecond latency SLAs are required (like high-frequency trading or edge network proxies), where garbage collection pauses cannot be tolerated.\n3) The service is a tiny memory-constrained microservice where binary sizes under 20MB and single-digit megabyte RAM footprints are required.',
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What are the primary strengths and architectural use cases of Python in modern engineering? When is Python the right choice, and how do you mitigate its known performance trade-offs?',
      framework: [
        { time: '0-15s', point: 'Ecosystem Dominance: Python excels in backend web APIs, data engineering, and AI/ML orchestration due to unmatched developer velocity.' },
        { time: '15-45s', point: 'C-Extension Leverage: Heavy compute in Python libraries (PyTorch, NumPy, Cryptography) runs on optimized C/C++/CUDA kernels.' },
        { time: '45-60s', point: 'Architecture Mitigations: Overcome GIL with horizontal scaling (multi-process workers); offload CPU-intensive tasks to background queues (Celery/Go services).' }
      ],
      spokenScript: `"Python has established itself as the premier language across three major domains: backend web microservices, data engineering pipelines, and artificial intelligence orchestration. Its greatest architectural advantage is developer velocity: an engineering team can build, iterate, and deploy reliable business logic in Python significantly faster than in lower-level compiled languages.\n\nWhile critics frequently point to Python's execution speed and the Global Interpreter Lock, in real-world backend architectures, 95% of web service latency is bound by external I/O—such as Postgres queries, Redis lookups, and third-party HTTP calls—where Python's performance is virtually indistinguishable from compiled languages. Furthermore, in data engineering and machine learning, libraries like NumPy, Pandas, and PyTorch execute their heavy compute in optimized C, C++, and CUDA kernels, using Python purely as an ergonomic control plane.\n\nIn our production architecture, when we do encounter CPU-intensive bottlenecks, we don't rewrite the entire codebase; we scale worker processes horizontally across container pods, offload background processing to Celery workers, or extract the compute-heavy microservice into Go or Rust."`,
      buzzwords: ['Developer velocity & time-to-market', 'I/O-bound vs CPU-bound workloads', 'C-extension control plane', 'Horizontal container scaling', 'Celery asynchronous workers', 'Polyglot microservice boundaries'],
      juniorMistake: 'Claiming Python is too slow for all backend systems without understanding that most web applications are I/O bound, not CPU bound.'
    }
  }
};

