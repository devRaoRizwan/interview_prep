// Python Days 16 to 17 (Questions 46 to 51)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const PYTHON_DAYS_16_TO_17 = {
  // Q46: Unittest Module
  46: {
    id: 46,
    docSpecs: {
      overview: 'The `unittest` module is Python\'s built-in unit testing framework, inspired by JUnit. It organizes test suites using object-oriented test cases (`unittest.TestCase`), lifecycle fixtures (`setUp`, `tearDown`, `setUpClass`, `tearDownClass`), and rich assertion methods (`assertEqual`, `assertRaises`). While `pytest` is widely preferred in modern engineering for its concise syntax and fixture dependency injection, `unittest` remains essential for zero-dependency standard library testing and mock isolation via `unittest.mock`.',
      table: {
        headers: ['Feature', 'Standard `unittest`', 'Modern `pytest`', 'Senior Recommendation'],
        rows: [
          ['Architecture', 'Class-based (`unittest.TestCase`)', 'Function-based with dependency injection', 'Use `pytest` for all application code; `unittest.mock` for mocking.'],
          ['Assertions', 'Explicit methods: `self.assertEqual(a, b)`', 'Plain Python `assert a == b` (AST rewritten)', '`pytest` assertions provide deep diff inspection on failure.'],
          ['Test Fixtures', 'Inherited `setUp()` and `tearDown()`', 'Modular, composable `@pytest.fixture`', '`pytest` fixtures allow scoping (session, module, function) and caching.'],
          ['External Dependencies', 'Zero (built into Python standard library)', 'Requires third-party `pip install pytest`', '`unittest` is ideal for zero-dependency libraries and internal CLI tools.']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Mocking at the Import Location',
          content: 'When using `unittest.mock.patch`, always patch the object WHERE IT IS IMPORTED AND USED, not where it was originally defined! If `views.py` runs `from services import payment`, patch `"views.payment"`, NOT `"services.payment"`.'
        },
        {
          type: 'note',
          title: 'setUp() vs setUpClass()',
          content: '`setUp()` runs before EVERY individual test method, ensuring isolation. `setUpClass()` is decorated with `@classmethod` and runs ONCE for the entire test class, ideal for spinning up expensive test databases or docker containers.'
        }
      ],
      commands: [
        {
          label: 'Running Tests with Built-in Discovery',
          cmd: `# Run all tests using built-in discovery in terminal\npython -m unittest discover -s tests -p "test_*.py" -v\n\n# Run a specific TestCase or test method\n# python -m unittest tests.test_auth.AuthTestCase.test_login_success`,
          lang: 'bash',
          description: 'Executing unit test discovery and verbose test execution from terminal.'
        }
      ],
      didYouKnow: {
        title: '💡 unittest.mock Autospeccing',
        content: 'When mocking objects in tests, always use `create_autospec=True` or `spec=MyService`. Standard mocks allow calling non-existent methods without errors! Autospeccing ensures the mock raises an `AttributeError` if your test calls a method that does not exist on the real class.'
      }
    },
    challenge: {
      title: 'TestCase Lifecycle & Mocking with unittest.mock Drill',
      steps: [
        'Create a test suite inheriting from `unittest.TestCase`.',
        'Implement `setUp` to initialize test state before each method.',
        'Use `unittest.mock.patch` to mock an external HTTP service or database call.',
        'Use `self.assertRaises` as a context manager to verify that invalid inputs throw expected domain exceptions.'
      ],
      codeSnippet: `import unittest
from unittest.mock import patch, MagicMock

# Simulated service
class PaymentService:
    def charge_customer(self, card_token, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        # Simulates real external Stripe API call
        return {"status": "SUCCESS", "tx_id": "tx_999"}

class TestPaymentService(unittest.TestCase):
    def setUp(self):
        self.service = PaymentService()

    def test_invalid_amount_raises_error(self):
        # Verify exception using context manager
        with self.assertRaises(ValueError):
            self.service.charge_customer("tok_visa", -50)

    @patch.object(PaymentService, "charge_customer")
    def test_mocked_gateway(self, mock_charge):
        # Configure mock return value
        mock_charge.return_value = {"status": "MOCKED", "tx_id": "tx_mock"}
        
        result = self.service.charge_customer("tok_test", 100)
        self.assertEqual(result["status"], "MOCKED")
        mock_charge.assert_called_once_with("tok_test", 100)

# Run test runner programmatically
suite = unittest.TestLoader().loadTestsFromTestCase(TestPaymentService)
runner = unittest.TextTestRunner(verbosity=2)
runner.run(suite)`,
      expectedOutput: `test_invalid_amount_raises_error (__main__.TestPaymentService) ... ok
test_mocked_gateway (__main__.TestPaymentService) ... ok

----------------------------------------------------------------------
Ran 2 tests in 0.002s

OK`,
      interviewQuestion: 'What is the Golden Rule of mocking with unittest.mock.patch? What happens if you patch a function where it is defined versus where it is imported?',
      interviewAnswer: 'The Golden Rule of mocking in Python is: "Mock where an object is LOOKED UP, not where it is DEFINED."\n\nIf module `app.views` imports a function using `from app.services import fetch_user`, the name `fetch_user` is bound directly into `app.views`\'s namespace. If your test executes `@patch("app.services.fetch_user")`, the patch replaces the function in `app.services`, but `app.views` continues to hold a reference to the original un-mocked function!\n\nTo ensure your test intercepts the call, you must patch `@patch("app.views.fetch_user")`. This replaces the reference in the module that actually executes the call.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you structure unit tests in Python using unittest or pytest? Walk me through how you isolate external dependencies with mocks, and explain the "where to patch" rule.',
      framework: [
        { time: '0-15s', point: 'Frameworks: unittest is the standard library class-based framework; pytest is the modern standard for fixtures and plain asserts.' },
        { time: '15-45s', point: 'Mocking Mechanics: Use unittest.mock to stub I/O boundaries; follow the Golden Rule: patch where the object is looked up, not defined.' },
        { time: '45-60s', point: 'Production Test Strategy: Use autospeccing (spec=True) to prevent stale mock interfaces; isolate DB tests using transactional test runners.' }
      ],
      spokenScript: `"In Python backend engineering, automated testing is foundational to continuous delivery. Python provides 'unittest' out of the box, structured around 'TestCase' classes and lifecycle hooks like 'setUp()' and 'tearDown()'. In modern enterprise projects, we typically use 'pytest' as our test runner for its concise plain-assert syntax and composable fixture dependency injection, while relying heavily on the standard library's 'unittest.mock' for stubbing.\n\nWhen writing unit tests for microservices, the most critical concept is mocking external boundaries—such as Stripe APIs, AWS S3 calls, or external message queues. We strictly adhere to the golden rule of patching: 'mock where an object is imported, not where it is defined'. If a view imports 'from services.email import send_email', your patch target must be 'views.send_email'. Patching 'services.email' fails because the view already bound a pointer to the original function at import time.\n\nAdditionally, we mandate 'autospec=True' when creating mocks. Without autospeccing, a mock will accept any arbitrary method call without failing, creating false-positive tests that pass even when the underlying production method was renamed or deleted."`,
      buzzwords: ['unittest.TestCase lifecycle', 'pytest fixtures & assertions', 'unittest.mock.patch', 'Where to patch rule', 'Autospeccing (create_autospec=True)', 'Dependency isolation'],
      juniorMistake: 'Patching a function where it is declared instead of where it is imported, wondering why the real API continues to be called in tests.'
    }
  },

  // Q47: Map, Filter and Reduce
  47: {
    id: 47,
    docSpecs: {
      overview: '`map()`, `filter()`, and `reduce()` are functional programming primitives in Python used for processing iterable sequences. In Python 3, `map(func, iterable)` and `filter(predicate, iterable)` return lazy, single-pass iterator objects that compute values on demand with O(1) memory overhead. `reduce(func, iterable)` (moved to `functools.reduce` in Python 3) accumulates elements into a single aggregate result by repeatedly applying a two-argument function.',
      table: {
        headers: ['Functional Primitive', 'List Comprehension Equivalent', 'Evaluation Strategy', 'Senior Backend Preference'],
        rows: [
          ['`map(f, seq)`', '`[f(x) for x in seq]`', 'Lazy iterator (O(1) memory)', 'Comprehensions preferred for readability; `map` is faster when passing an existing C function like `map(int, s)`.'],
          ['`filter(p, seq)`', '`[x for x in seq if p(x)]`', 'Lazy iterator (O(1) memory)', 'Comprehensions preferred for readability; `filter(None, seq)` is idiomatic for stripping falsy values.'],
          ['`functools.reduce(f, seq)`', 'No single comprehension equivalent; use `sum()` or loops', 'Eager aggregate accumulation', 'Use built-in aggregators (`sum`, `math.prod`, `any`, `all`); reserve `reduce` for complex state reductions.']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: 'Python 3 Lazy Iterators',
          content: 'In Python 2, `map` and `filter` eagerly returned lists. In Python 3, they return lazy generator-like iterators. To materialize the entire collection into memory, you must wrap them in `list()`: `list(map(f, items))`.'
        },
        {
          type: 'tip',
          title: 'filter(None, sequence) Idiom',
          content: 'Passing `None` as the first argument to `filter(None, items)` automatically filters out all falsy values (`None`, `""`, `0`, `False`, `[]`), acting as a high-speed C-level data sanitizer.'
        }
      ],
      commands: [
        {
          label: 'Map, Filter, and functools.reduce Execution',
          cmd: `from functools import reduce\nimport operator\n\nraw_data = ["10", "20", "", "30", "0", "40"]\n\n# 1. filter(None, ...) strips empty strings\ncleaned = list(filter(None, raw_data))\nprint("Cleaned non-empty:", cleaned)\n\n# 2. map(int, ...) parses strings to ints\nnumbers = list(map(int, cleaned))\nprint("Mapped integers:", numbers)\n\n# 3. reduce calculates cumulative product\nproduct = reduce(operator.mul, numbers, 1)\nprint("Cumulative Product:", product)`,
          lang: 'python',
          description: 'Composing functional pipelines with filter, map, and reduce.'
        }
      ],
      didYouKnow: {
        title: '💡 Guido\'s Reluctance Toward Reduce',
        content: 'Python\'s creator Guido van Rossum originally wanted to remove `reduce()` from Python 3 entirely, arguing that standard `for` loops or built-ins like `sum()` are vastly more readable. As a compromise, it was banished to `functools.reduce`.'
      }
    },
    challenge: {
      title: 'Functional Pipelines & Performance Comparison Drill',
      steps: [
        'Use `filter(None, ...)` to strip all falsy elements from a list of user inputs.',
        'Use `map(func, ...)` to convert numbers to formatted currency strings.',
        'Use `functools.reduce` to calculate the cumulative total of a shopping cart.',
        'Compare performance: `map(int, strings)` vs `[int(x) for x in strings]`.'
      ],
      codeSnippet: `from functools import reduce
import time

# 1. filter(None) idiom
dirty_inputs = ["alice", "", None, "bob", 0, "charlie"]
sanitized = list(filter(None, dirty_inputs))
print("Sanitized list:", sanitized)

# 2. map currency formatting
prices = [19.99, 5.50, 100.0]
formatted = list(map(lambda p: f"\${p:.2f}", prices))
print("Formatted prices:", formatted)

# 3. reduce shopping cart accumulator
cart = [{"item": "Keyboard", "price": 120}, {"item": "Mouse", "price": 45}]
total = reduce(lambda acc, item: acc + item["price"], cart, 0)
print("Total cart price:", total)

# 4. Performance benchmark
str_nums = [str(i) for i in range(100_000)]

start = time.perf_counter()
_ = list(map(int, str_nums))
map_time = time.perf_counter() - start

start = time.perf_counter()
_ = [int(x) for x in str_nums]
comp_time = time.perf_counter() - start

print(f"\\nmap(int, ...) time: {map_time:.4f}s (Faster because int is called in C)")
print(f"[int(x) ...] time:   {comp_time:.4f}s")`,
      expectedOutput: `Sanitized list: ['alice', 'bob', 'charlie']
Formatted prices: ['$19.99', '$5.50', '$100.00']
Total cart price: 165

map(int, ...) time: ~0.0065s (Faster because int is called in C)
[int(x) ...] time:   ~0.0090s`,
      interviewQuestion: 'Why was reduce() moved out of built-ins to functools in Python 3? When is map() faster than a list comprehension, and when is a comprehension preferred?',
      interviewAnswer: '`reduce()` was moved to `functools` by Guido van Rossum because code using `reduce` with complex lambda functions is notoriously difficult to read, debug, and reason about. Python advocates explicit, readable loops or specialized built-in functions like `sum()`, `any()`, and `all()`.\n\n`map()` is faster than a list comprehension when calling an existing built-in or C function (such as `map(int, str_list)` or `map(str.upper, names)`). In this scenario, `map` loops entirely within C without invoking the Python bytecode evaluation loop on each element.\n\nHowever, a list comprehension is faster and preferred whenever a `lambda` would be required (e.g. `[x * 2 for x in nums]` vs `map(lambda x: x * 2, nums)`). Calling a lambda in `map` introduces Python function frame call overhead for every single item, making comprehensions both faster and far more readable.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do map, filter, and reduce work in Python? Compare them to list comprehensions in terms of performance and readability, and explain when to use each in production.',
      framework: [
        { time: '0-15s', point: 'Core Functional Primitives: map transforms; filter selects; functools.reduce aggregates; all return lazy iterators in Python 3.' },
        { time: '15-45s', point: 'Comprehensions vs map: map is faster when applying pre-existing C functions (map(int, s)); comprehensions win when using expressions/lambdas.' },
        { time: '45-60s', point: 'Production Standards: Prefer comprehensions for readability (PEP 20); use filter(None, seq) for fast falsy cleaning; avoid obscure reduce pipelines.' }
      ],
      spokenScript: `"In Python, 'map', 'filter', and 'reduce' are classic functional programming constructs. In Python 3, both 'map()' and 'filter()' are lazy iterators: they return generator-like objects that evaluate elements on demand with constant O(1) memory overhead. 'reduce' was moved to the 'functools' module because complex nested reductions hurt code readability.\n\nWhen comparing 'map' and 'filter' to list comprehensions, readability is the primary deciding factor. The Zen of Python dictates that 'Readability counts', and in 90% of cases, list comprehensions like '[x * 2 for x in items if x > 0]' are far easier for engineering teams to parse than chaining 'map' and 'filter' with lambdas.\n\nHowever, there is an important performance nuance: 'map()' is roughly 20% faster than a list comprehension when you pass an existing C-level callable directly—such as 'map(int, string_list)'. Because no lambda is created, CPython executes the transformation loop entirely in native C without allocating Python stack frames. Conversely, if you must use a lambda, list comprehensions are both faster and more readable."`,
      buzzwords: ['Functional programming primitives', 'Lazy iterator objects', 'functools.reduce accumulator', 'filter(None, sequence) idiom', 'C-level execution loop', 'Readability threshold (PEP 20)'],
      juniorMistake: 'Using map with lambda (map(lambda x: x.upper(), items)) where a list comprehension is cleaner and faster.'
    }
  },

  // Q48: Shallow Copy vs Deep Copy
  48: {
    id: 48,
    docSpecs: {
      overview: 'In Python, the difference between a shallow copy and a deep copy comes down to how nested compound objects are handled. A shallow copy (`copy.copy()`, `list.copy()`, or `[:]`) constructs a new outer collection, but inserts references to the exact same child objects into it. A deep copy (`copy.deepcopy()`) constructs a new outer collection and recursively creates copies of all nested objects found in the original, maintaining an internal memo dictionary to handle circular references safely.',
      table: {
        headers: ['Copy Mechanism', 'Outer Container', 'Nested Objects', 'Circular Reference Handling', 'Performance / Memory Cost'],
        rows: [
          ['Direct Assignment (`b = a`)', 'Shared (same memory `id`)', 'Shared', 'N/A', 'Instantaneous O(1); zero memory allocation.'],
          ['Shallow Copy (`copy.copy(a)`)', 'New container object', 'Shared references to original children', 'N/A', 'Fast O(N) outer copy; mutating nested lists mutates original.'],
          ['Deep Copy (`copy.deepcopy(a)`)', 'New container object', 'Recursively duplicated new objects', 'Handled safely via internal memo dictionary', 'Slow O(N) recursive traversal; duplicates entire object graph in RAM.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Shallow Copy Nested Mutation Trap',
          content: 'If you create a shallow copy of a 2D matrix (`grid_copy = [row[:] for row in grid]` or `grid.copy()`), mutating a primitive in `grid_copy[0][0]` will corrupt the original matrix if inner lists were shared!'
        },
        {
          type: 'note',
          title: 'How deepcopy Prevents Infinite Recursion',
          content: '`copy.deepcopy()` maintains a `memo = {}` dictionary tracking object IDs (`id(obj)`). If an object contains a circular reference to itself, `deepcopy` checks the memo table and reuses the already-copied reference, preventing infinite recursion stack overflows.'
        }
      ],
      commands: [
        {
          label: 'Shallow Copy Mutation vs Deepcopy Isolation',
          cmd: `import copy\n\noriginal = [[1, 2, 3], [4, 5, 6]]\n\n# Shallow copy: outer list is new, inner lists are SHARED\nshallow = original.copy()\nshallow[0].append(99)\nprint("Original corrupted by shallow append:", original)  # [[1, 2, 3, 99], [4, 5, 6]]\n\n# Deep copy: completely independent\ndeep = copy.deepcopy(original)\ndeep[1].append(888)\nprint("Original safe after deepcopy append: ", original)  # [[1, 2, 3, 99], [4, 5, 6]]`,
          lang: 'python',
          description: 'Demonstrating how modifying nested structures in shallow copies corrupts the source data.'
        }
      ],
      didYouKnow: {
        title: '💡 Custom __copy__ and __deepcopy__ Hooks',
        content: 'Classes can customize their copying behavior by implementing `__copy__(self)` and `__deepcopy__(self, memo)`. This allows omitting non-serializable resources like open database connections or socket handles during deep copies.'
      }
    },
    challenge: {
      title: 'Deepcopy Circular Reference Handling & Mutability Drill',
      steps: [
        'Demonstrate that a shallow copy copies the outer container while sharing inner pointers.',
        'Create a cyclic graph structure (`class Node` where `n1.next = n2` and `n2.next = n1`).',
        'Verify that `copy.deepcopy()` copies the cyclic graph without entering an infinite recursion loop.',
        'Inspect the `memo` dictionary mechanism.'
      ],
      codeSnippet: `import copy

# 1. Cyclic Graph Structure
class Node:
    def __init__(self, name):
        self.name = name
        self.next = None

node1 = Node("Head")
node2 = Node("Tail")
node1.next = node2
node2.next = node1  # Circular reference cycle!

# 2. Deepcopy safely handles circular references
cloned_node1 = copy.deepcopy(node1)
print("Original cycle: node1.next.next is node1?", node1.next.next is node1)
print("Cloned cycle:   clone.next.next is clone?", cloned_node1.next.next is cloned_node1)
print("Are original and clone completely decoupled?", cloned_node1 is not node1)

# 3. Verify mutation isolation
cloned_node1.name = "ClonedHead"
print("Original name:", node1.name)
print("Cloned name:  ", cloned_node1.name)`,
      expectedOutput: `Original cycle: node1.next.next is node1? True
Cloned cycle:   clone.next.next is clone? True
Are original and clone completely decoupled? True
Original name: Head
Cloned name:   ClonedHead`,
      interviewQuestion: 'How does copy.deepcopy() avoid infinite recursion when copying an object with circular references? What is the performance cost of deepcopy?',
      interviewAnswer: '`copy.deepcopy()` avoids infinite recursion by maintaining an internal `memo` dictionary (`memo = {}`) throughout the recursive copying process. The memo dictionary maps the memory identity (`id(obj)`) of every object already copied to its newly created copy.\n\nWhen `deepcopy` encounters an object, it first checks `if id(obj) in memo:`. If found, it immediately returns the cached copy reference without recursing further. This allows `deepcopy` to duplicate cyclic data structures (like double-linked lists, graphs, and ASTs) safely.\n\nThe performance cost of `deepcopy` is substantial: it requires recursive traversal, extensive hash-table lookups in the memo dictionary, and dynamic type dispatching. In high-throughput APIs, running `deepcopy` on large configurations or request payloads can add tens of milliseconds of CPU latency.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'Can you explain the difference between a shallow copy and a deep copy in Python? How does copy.deepcopy() handle circular references, and when should deepcopy be avoided in production?',
      framework: [
        { time: '0-15s', point: 'Fundamental Difference: Shallow copy duplicates only the outer container; deep copy recursively duplicates all nested objects.' },
        { time: '15-45s', point: 'Circular Reference Handling: deepcopy maintains an internal memo dictionary mapping id(obj) to cloned objects, preventing infinite recursion.' },
        { time: '45-60s', point: 'Production Cost: deepcopy is CPU-intensive and slow; avoid in high-throughput loops; prefer immutable data structures or explicit shallow cloning.' }
      ],
      spokenScript: `"In Python, copying compound objects—like lists, dictionaries, or custom class instances—is divided into shallow copies and deep copies.\n\nA shallow copy, created using 'copy.copy()' or 'list.copy()', allocates a new outer container but populates it with references pointing to the exact same child objects. If an object contains nested mutable structures—such as a list of dictionaries—mutating an inner dictionary in the copy will mutate the original data, creating insidious state bugs.\n\nIn contrast, a deep copy, created via 'copy.deepcopy()', constructs a new outer container and recursively duplicates every single nested object found in the hierarchy. A crucial architectural feature of 'deepcopy' is how it handles circular references: it maintains an internal 'memo' dictionary mapping each object's memory 'id' to its newly allocated clone. When a cycle is detected, it retrieves the clone from the memo table instead of recursing infinitely.\n\nIn high-throughput backend services, deepcopy is an expensive operation that incurs heavy reflection and memory allocation overhead. In our production microservices, we avoid deepcopy in critical request paths by enforcing immutable data structures—such as frozen dataclasses or tuples—where sharing references is guaranteed to be safe."`,
      buzzwords: ['Container duplication vs reference copying', 'Recursive object graph traversal', 'Internal memo dictionary (memo={})', 'Circular reference cycle protection', 'Performance overhead of deepcopy', 'Frozen dataclasses / immutability'],
      juniorMistake: 'Assuming a shallow copy isolates nested dictionaries, or using deepcopy in an inner loop handling thousands of requests per second.'
    }
  },

  // Q49: Object Copying and Monkey Patching
  49: {
    id: 49,
    docSpecs: {
      overview: 'Monkey patching in Python refers to dynamically updating or replacing modules, classes, or methods at runtime without modifying the underlying source code. Because Python classes and modules are mutable dictionaries in heap memory (`__dict__`), developers can rebind methods at runtime (`Class.method = new_func`). While monkey patching is a cornerstone of testing libraries (like `unittest.mock`), using it in production application code introduces serious debugging nightmares and thread safety hazards.',
      table: null,
      admonitions: [
        {
          type: 'warning',
          title: 'The Production Monkey Patching Anti-Pattern',
          content: 'Never monkey-patch classes or third-party libraries in production backend code. Dynamic patching obscures code provenance, breaks static analysis (mypy, linters), and causes race conditions in multi-threaded web servers. Limit monkey patching strictly to unit test mocks or early gevent/eventlet bootstrap.'
        },
        {
          type: 'tip',
          title: 'Safe Scoped Patching with unittest.mock.patch',
          content: 'Instead of manually overwriting methods (`obj.method = fake`), always use `with unittest.mock.patch.object(obj, "method", fake):`. Context managers guarantee that original methods are restored when the test block exits.'
        }
      ],
      commands: [
        {
          label: 'Dynamic Runtime Method Patching',
          cmd: `class PaymentProcessor:\n    def charge(self, amount):\n        return f"Real transaction of \${amount} sent to VISA network."\n\np = PaymentProcessor()\nprint("Original:", p.charge(100))\n\n# Monkey Patching the class method dynamically at runtime\ndef fake_charge(self, amount):\n    return f"MOCKED transaction of \${amount} - No money moved."\n\nPaymentProcessor.charge = fake_charge\nprint("Monkey Patched:", p.charge(100))`,
          lang: 'python',
          description: 'Dynamically replacing a class method in memory at runtime.'
        }
      ],
      didYouKnow: {
        title: '💡 Gevent / Eventlet Greenfield Patching',
        content: 'Asynchronous libraries like `gevent` use monkey patching (`gevent.monkey.patch_all()`) to replace standard library blocking sockets (`socket.socket`) with cooperative greenlet-aware sockets at process startup.'
      }
    },
    challenge: {
      title: 'Runtime Method Rebinding & Scoped Restoration Drill',
      steps: [
        'Define a class `NotificationClient` with a method `send_sms(msg)`.',
        'Dynamically monkey-patch `send_sms` on the class at runtime.',
        'Demonstrate that existing instances immediately adopt the patched behavior.',
        'Show how to safely patch and restore using a context manager to prevent test pollution.'
      ],
      codeSnippet: `class NotificationClient:
    def send_sms(self, phone, message):
        return f"REAL SMS sent to {phone}: {message}"

client = NotificationClient()
print("1. Before patch:", client.send_sms("555-0199", "Your code is 1234"))

# 2. Manual Monkey Patching
original_method = NotificationClient.send_sms

def mock_sms(self, phone, message):
    return f"STUBBED SMS to {phone}: [MUTED]"

NotificationClient.send_sms = mock_sms
print("2. During patch:", client.send_sms("555-0199", "Your code is 1234"))

# 3. Clean restoration
NotificationClient.send_sms = original_method
print("3. After restoration:", client.send_sms("555-0199", "Your code is 1234"))`,
      expectedOutput: `1. Before patch: REAL SMS sent to 555-0199: Your code is 1234
2. During patch: STUBBED SMS to 555-0199: [MUTED]
3. After restoration: REAL SMS sent to 555-0199: Your code is 1234`,
      interviewQuestion: 'What is Monkey Patching in Python, how is it technically possible in CPython, and why is it considered dangerous in production architectures?',
      interviewAnswer: 'Monkey patching is the runtime modification of a module, class, or function\'s behavior without altering the original source code. In CPython, this is possible because Python is a dynamic language where classes and modules are mutable objects whose attributes are stored in standard dictionaries (`__dict__`). Reassigning `Class.method = custom_func` updates the class dictionary in memory, instantly affecting all current and future instances.\n\nIt is considered dangerous in production because:\n1. It creates hidden side effects and breaks code discoverability: developers reading the source code cannot see why a method behaves differently from its definition.\n2. It breaks static analysis, type checking (mypy), and IDE navigation.\n3. It introduces race conditions: if one thread monkey-patches a class while another thread is executing it, state becomes corrupted.\n4. It causes test leakage: if a test monkey-patches a global module and fails to restore it, subsequent tests will fail intermittently.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'What is Monkey Patching in Python? How does it work under the hood, what are its legitimate uses in testing, and why should it be strictly avoided in application production code?',
      framework: [
        { time: '0-15s', point: 'Definition: Monkey patching is dynamically modifying or replacing modules, classes, or methods at runtime.' },
        { time: '15-45s', point: 'Under the Hood: Possible because classes and modules expose mutable __dict__ namespaces in heap memory.' },
        { time: '45-60s', point: 'Testing vs Production: Essential in testing via unittest.mock; strictly forbidden in application code due to race conditions and test pollution.' }
      ],
      spokenScript: `"In Python, 'Monkey Patching' refers to dynamically modifying or replacing classes, modules, or functions at runtime without altering their underlying source code. Because Python is an interpreted, dynamic language, classes and modules are first-class mutable objects whose attributes reside in internal '__dict__' hash tables. Reassigning 'ClassName.method = replacement_func' modifies the class dictionary in heap memory, immediately altering behavior across all existing instances.\n\nThe primary legitimate use of monkey patching is in automated testing. Frameworks like 'unittest.mock' use scoped monkey patching to stub out third-party payment gateways, external HTTP APIs, and database calls, ensuring tests run in fast, isolated environments without making network requests.\n\nHowever, using monkey patching in production application code is a severe anti-pattern. It breaks the Principle of Least Astonishment: developers reading the codebase cannot determine where behavior was modified, static type checkers and IDEs fail to track definitions, and dynamic rebinding in multi-threaded servers causes insidious race conditions. If behavior needs to change dynamically in production, we strictly use the Strategy Pattern, Dependency Injection, or subclassing."`,
      buzzwords: ['Dynamic runtime rebinding', 'Class __dict__ modification', 'unittest.mock scoped patching', 'Principle of Least Astonishment', 'Thread-safety hazards', 'Dependency Injection alternative'],
      juniorMistake: 'Monkey patching third-party libraries in production to fix a bug instead of monkey-patching only in tests or creating a proper wrapper class.'
    }
  },

  // Q50: Operator Overloading & Dunder Methods
  50: {
    id: 50,
    docSpecs: {
      overview: 'Operator overloading in Python allows user-defined classes to intercept and implement built-in operators (`+`, `-`, `*`, `==`, `<`, `[]`, `in`) by defining special double-underscore "dunder" methods. When Python evaluates an expression like `a + b`, it calls `a.__add__(b)`. If `a` does not support the operation, Python falls back to `b.__radd__(a)`. Operator overloading enables expressive domain-driven designs, such as mathematical vectors, ORM query builders, and matrix pipelines.',
      table: {
        headers: ['Operator / Expression', 'Primary Dunder Method', 'Reverse (Reflected) Dunder', 'In-Place Dunder'],
        rows: [
          ['Addition (`a + b`)', '`__add__(self, other)`', '`__radd__(self, other)`', '`__iadd__(self, other)`'],
          ['Subtraction (`a - b`)', '`__sub__(self, other)`', '`__rsub__(self, other)`', '`__isub__(self, other)`'],
          ['Equality (`a == b`)', '`__eq__(self, other)`', '`__eq__(self, other)` (symmetric)', 'N/A'],
          ['String Representation', '`__str__(self)` (user-facing)', '`__repr__(self)` (developer debugging)', 'N/A'],
          ['Indexing (`obj[key]`)', '`__getitem__(self, key)`', 'N/A', '`__setitem__(self, key, val)`']
        ]
      },
      admonitions: [
        {
          type: 'note',
          title: '__repr__ vs __str__',
          content: '`__str__` is intended to be human-readable for end-users (e.g. `User(alice)`). `__repr__` is intended to be unambiguous for developers and debugging (e.g. `User(id=101, username=\'alice\', email=\'alice@co.com\')`). A gold standard rule: `eval(repr(obj)) == obj` where practical.'
        },
        {
          type: 'tip',
          title: 'Returning NotImplemented',
          content: 'If your dunder method does not support the type of `other`, return `NotImplemented` instead of raising `TypeError`! Returning `NotImplemented` signals Python to fall back to the other operand\'s reflected method (e.g. `__radd__`).'
        }
      ],
      commands: [
        {
          label: 'Custom Vector Class with Overloaded Operators',
          cmd: `class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if isinstance(other, Vector):\n            return Vector(self.x + other.x, self.y + other.y)\n        return NotImplemented\n\n    def __eq__(self, other):\n        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)\n\n    def __repr__(self):\n        return f"Vector({self.x}, {self.y})"\n\nv1 = Vector(2, 4)\nv2 = Vector(3, 1)\nprint("v1 + v2 =", v1 + v2)  # Vector(5, 5)\nprint("v1 == v2?", v1 == v2)  # False`,
          lang: 'python',
          description: 'Implementing __add__, __eq__, and __repr__ for mathematical vector operations.'
        }
      ],
      didYouKnow: {
        title: '💡 Django Q and F Object Overloading',
        content: 'Django\'s ORM heavily relies on operator overloading! `Q(age__gt=18) | Q(is_staff=True)` overloads the bitwise OR `|` operator (`__or__`) to construct SQL `OR` clauses.'
      }
    },
    challenge: {
      title: 'Building a Domain Money Value Object with Overloaded Operators Drill',
      steps: [
        'Build a class `Money(amount, currency)` implementing `__add__` and `__sub__`.',
        'Verify that adding different currencies raises a `ValueError`.',
        'Implement `__repr__` and `__str__` to demonstrate the difference.',
        'Implement `__eq__` and verify that `Money(10, "USD") == Money(10, "USD")` evaluates to True.'
      ],
      codeSnippet: `class Money:
    def __init__(self, amount, currency="USD"):
        self.amount = round(float(amount), 2)
        self.currency = currency.upper()

    def __add__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError(f"Cannot add {self.currency} and {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def __eq__(self, other):
        return isinstance(other, Money) and (self.amount, self.currency) == (other.amount, other.currency)

    def __str__(self):
        return f"\${self.amount:.2f} {self.currency}"

    def __repr__(self):
        return f"Money(amount={self.amount}, currency='{self.currency}')"

m1 = Money(15.50, "USD")
m2 = Money(10.25, "USD")
m3 = m1 + m2

print("String display (__str__):", str(m3))
print("Developer display (__repr__):", repr(m3))
print("Equality check (__eq__):", m1 + m2 == Money(25.75, "USD"))

try:
    _ = m1 + Money(5.0, "EUR")
except ValueError as err:
    print("Caught currency mismatch:", err)`,
      expectedOutput: `String display (__str__): $25.75 USD
Developer display (__repr__): Money(amount=25.75, currency='USD')
Equality check (__eq__): True
Caught currency mismatch: Cannot add USD and EUR`,
      interviewQuestion: 'What should a Python dunder method (like __add__ or __eq__) return when an unsupported operand type is passed? Why should it not raise TypeError directly?',
      interviewAnswer: 'When an unsupported operand type is passed into a binary dunder method, it should return the singleton `NotImplemented`, NOT raise a `TypeError` directly.\n\nWhen Python evaluates `a + b`, it calls `a.__add__(b)`. If `a.__add__` raises `TypeError`, execution halts immediately. But if `a.__add__` returns `NotImplemented`, Python catches this and attempts the reflected reverse operator on the second operand: `b.__radd__(a)`.\n\nThis design allows third-party classes or subclasses to handle operations with existing types cooperatively. If both `a.__add__` and `b.__radd__` return `NotImplemented`, Python\'s runtime finally raises the standard `TypeError: unsupported operand type(s)`.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How does operator overloading work in Python? Walk me through how Python handles binary operations like a + b, the difference between __str__ and __repr__, and why dunder methods return NotImplemented.',
      framework: [
        { time: '0-15s', point: 'Operator Protocol: Python maps operators to dunder methods (__add__, __eq__, __getitem__) on class instances.' },
        { time: '15-45s', point: 'Resolution Flow: a + b calls a.__add__(b); if it returns NotImplemented, Python tries b.__radd__(a) before raising TypeError.' },
        { time: '45-60s', point: '__str__ vs __repr__: __str__ is user-friendly; __repr__ is unambiguous for logging and debugging; foundational for ORM query building (e.g. Django Q objects).' }
      ],
      spokenScript: `"Operator overloading in Python allows custom classes to define how built-in operators—such as addition, equality, or slicing—interact with their instances by implementing special dunder methods.\n\nWhen Python evaluates an expression like 'a + b', CPython first invokes 'a.__add__(b)'. A critical senior design pattern is how unsupported types are handled: if class 'a' does not know how to add 'b', it should return the built-in sentinel 'NotImplemented' rather than raising a TypeError. When Python receives 'NotImplemented', it falls back to the right-hand operand's reflected method, 'b.__radd__(a)'. Only if both operands return 'NotImplemented' does Python raise a TypeError.\n\nAnother fundamental protocol pair is '__repr__' and '__str__'. '__str__' is meant to be user-facing and readable for end-users, while '__repr__' is designed for developers, logging, and APM tools to provide an unambiguous string representation—ideally satisfying 'eval(repr(obj)) == obj'.\n\nIn backend engineering, operator overloading powers expressive domain models and query abstractions—for instance, Django's 'Q' and 'F' objects overload bitwise operators like '|' and '&' to construct clean, composable SQL queries."`,
      buzzwords: ['Operator overloading protocol', 'Reflected dunder methods (__radd__)', 'NotImplemented sentinel return', '__repr__ (debugging) vs __str__ (user)', 'Value Object domain pattern', 'Django Q object ORM overloading'],
      juniorMistake: 'Raising TypeError inside __add__ instead of returning NotImplemented, breaking the fallback to __radd__.'
    }
  },

  // Q51: Coding Patterns & Graph Algorithms
  51: {
    id: 51,
    docSpecs: {
      overview: 'Senior backend coding interviews evaluate algorithmic problem-solving through core design patterns and graph traversal strategies. Rather than memorizing isolated LeetCode solutions, top candidates master high-leverage algorithmic archetypes: Two Pointers (linear sequence partitioning), Sliding Window (bounded subarray optimization), Depth-First Search / Breadth-First Search (graph & tree state exploration), and Topological Sorting (dependency resolution pipelines).',
      table: {
        headers: ['Algorithmic Pattern', 'Core Mechanics', 'Time & Space Complexity', 'Real Backend Production Application'],
        rows: [
          ['Two Pointers', 'Two index pointers moving inward or in tandem', 'O(N) Time, O(1) Space', 'Database merge-joins, sorting log streams, palindromic token verification.'],
          ['Sliding Window', 'Dynamic or fixed window boundary expansion/contraction', 'O(N) Time, O(K) Space', 'Rate-limiting algorithms (leaky bucket), network packet windowing, time-series anomaly detection.'],
          ['Breadth-First Search (BFS)', 'Level-order queue traversal using `collections.deque`', 'O(V + E) Time, O(V) Space', 'Shortest-path routing, social graph friend connections, crawler breadth exploration.'],
          ['Topological Sort (Kahn\'s / DFS)', 'DAG ordering based on in-degree dependencies', 'O(V + E) Time, O(V) Space', 'Airflow DAG workflow scheduling, Terraform dependency resolution, build compilation order.']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Always Use collections.deque for Queues',
          content: 'Never use a standard Python list as a FIFO queue (`list.pop(0)`) in BFS algorithms! `list.pop(0)` is an O(N) operation that shifts all remaining pointers in memory, turning an O(V + E) BFS into an accidental O(V^2) quadratic slowdown. Always use `collections.deque.popleft()`, which executes in guaranteed O(1) time.'
        },
        {
          type: 'note',
          title: 'Topological Sort for Circular Dependency Detection',
          content: 'Kahn\'s algorithm for Topological Sorting naturally detects cycles in directed graphs: if the final sorted output length is less than the total number of vertices, a circular dependency cycle exists!'
        }
      ],
      commands: [
        {
          label: 'Breadth-First Search (BFS) with collections.deque',
          cmd: `from collections import deque\n\ndef bfs_shortest_path(graph, start, target):\n    queue = deque([(start, [start])])\n    visited = {start}\n    \n    while queue:\n        node, path = queue.popleft()  # O(1) popleft from deque!\n        if node == target:\n            return path\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append((neighbor, path + [neighbor]))\n    return None`,
          lang: 'python',
          description: 'Standard BFS implementation using collections.deque for shortest path resolution.'
        }
      ],
      didYouKnow: {
        title: '💡 Topological Sort in Build Systems',
        content: 'Docker Multi-Stage builds and package managers (pip, npm) use Topological Sorting on their directed acyclic dependency graphs (DAG) to determine which packages can compile concurrently in parallel.'
      }
    },
    challenge: {
      title: 'Topological Sorting & Dependency Resolution Drill',
      steps: [
        'Model a microservice deployment dependency graph (e.g., Service A depends on B and C).',
        'Implement Kahn\'s Algorithm using in-degree calculation and `collections.deque`.',
        'Return the exact deployment order satisfying all dependencies.',
        'Detect whether a circular dependency deadlock exists in the graph.'
      ],
      codeSnippet: `from collections import deque

def resolve_dependencies(services, dependencies):
    # Calculate in-degree for each service
    in_degree = {s: 0 for s in services}
    adj = {s: [] for s in services}

    for dependent, prereq in dependencies:
        adj[prereq].append(dependent)
        in_degree[dependent] += 1

    # Queue all services with 0 in-degree (ready to deploy)
    queue = deque([s for s in services if in_degree[s] == 0])
    deploy_order = []

    while queue:
        curr = queue.popleft()
        deploy_order.append(curr)

        for dep in adj[curr]:
            in_degree[dep] -= 1
            if in_degree[dep] == 0:
                queue.append(dep)

    if len(deploy_order) != len(services):
        raise RuntimeError("CIRCULAR DEPENDENCY DETECTED: Deadlock prevented deployment!")

    return deploy_order

services = ["Auth", "DB", "Payment", "Frontend"]
# (Dependent, Prerequisite)
deps = [
    ("Auth", "DB"),
    ("Payment", "DB"),
    ("Payment", "Auth"),
    ("Frontend", "Auth")
]

order = resolve_dependencies(services, deps)
print("Safe Microservice Deployment Order:", " -> ".join(order))`,
      expectedOutput: `Safe Microservice Deployment Order: DB -> Auth -> Payment -> Frontend`,
      interviewQuestion: 'Why must you use collections.deque instead of a standard Python list when implementing a Breadth-First Search (BFS) queue? How does Kahn\'s algorithm detect cycles in a DAG?',
      interviewAnswer: 'In Python, a standard `list` is a dynamic array. Calling `list.pop(0)` removes the first element and shifts all remaining N-1 memory pointers to the left, which is an O(N) linear time operation. In a BFS graph traversal with V vertices, calling `pop(0)` V times degrades performance to O(V^2) quadratic time.\n\n`collections.deque` is implemented in C as a doubly-linked list of 64-element memory blocks. Calling `deque.popleft()` removes the head element in guaranteed O(1) constant time without shifting elements, keeping BFS at optimal O(V + E) time.\n\nKahn\'s algorithm detects cycles by tracking in-degrees (number of incoming dependency edges). Vertices in a directed cycle never reach an in-degree of 0 because they depend on each other. Consequently, they are never added to the queue, and the algorithm terminates with `len(processed_nodes) < total_nodes`, proving the presence of a cycle.'
      ,
      replLink: 'https://onecompiler.com/python'
    },
    scriptData: {
      prompt: 'How do you approach complex algorithmic coding problems in a senior backend engineering interview? Walk me through how you identify patterns like Sliding Window, Two Pointers, or Topological Sort, and how they apply to real backend architectures.',
      framework: [
        { time: '0-15s', point: 'Pattern Recognition: Classify problems by pattern archetype: Two Pointers for sorted arrays, Sliding Window for continuous subarrays, Topological Sort for DAGs.' },
        { time: '15-45s', point: 'Data Structure Precision: Use collections.deque for O(1) BFS queues; use sets for O(1) visited lookups; avoid O(N) operations like list.pop(0).' },
        { time: '45-60s', point: 'Backend Production Parallel: Relate topological sort to Airflow DAG scheduling and Sliding Window to Redis token bucket rate limiting.' }
      ],
      spokenScript: `"When tackling algorithmic challenges in a senior engineering interview, I avoid ad-hoc brute-force code and immediately identify the underlying algorithmic pattern. Most backend algorithmic problems map directly to four primary archetypes: Two Pointers, Sliding Window, BFS/DFS Graph Traversal, and Topological Sorting.\n\nFor example, if a problem involves continuous subarrays or time-windowed metrics, I apply the Sliding Window pattern—expanding the right boundary and contracting the left—which runs in linear O(N) time. In production, this is the exact architecture we use for sliding-window rate limiters in Redis.\n\nIf the problem involves task scheduling or order of operations, I recognize it as a Directed Acyclic Graph and apply Kahn's Topological Sorting algorithm using in-degree tracking. A critical implementation detail that interviewers watch for is data structure choice: I always use 'collections.deque' for queues because 'deque.popleft()' runs in guaranteed O(1) time, whereas a naive 'list.pop(0)' shifts pointers in memory and degrades an O(V + E) BFS into an accidental O(V^2) quadratic performance failure.\n\nThroughout the interview, I communicate time and space complexity upfront, identify edge cases like empty inputs or cyclic deadlocks, and relate the algorithmic solution to production systems like Celery workflow graphs or database query planners."`,
      buzzwords: ['Algorithmic archetypes', 'Two Pointers & Sliding Window', 'Topological Sort (Kahn\'s algorithm)', 'collections.deque O(1) popleft', 'Directed Acyclic Graph (DAG)', 'Rate-limiting & workflow scheduling'],
      juniorMistake: 'Using list.pop(0) in a BFS queue and causing an O(N^2) performance degradation, or failing to detect cycles in dependency graphs.'
    }
  }
};

