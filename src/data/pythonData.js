export const PYTHON_VIDEO_ID = 'YeupGcOW-3k';
export const PYTHON_VIDEO_BASE_URL = 'https://www.youtube.com/watch?v=YeupGcOW-3k';

export const PYTHON_DAYS = [
  { day: 1, title: 'Lists, Tuples, Decorators & Memory', questionIds: [1, 2, 3, 4, 5] },
  { day: 2, title: 'Init, Modules, Ranges & Mutability', questionIds: [6, 7, 8, 9, 10] },
  { day: 3, title: 'Ternary, OOP Inheritance & Variables', questionIds: [11, 12, 13, 14, 15] },
  { day: 4, title: 'Pickling, Data Functions & Args/Kwargs', questionIds: [16, 17, 18, 19, 20] },
  { day: 5, title: 'File I/O, Exceptions & Python Versions', questionIds: [21, 22, 23, 24, 25] },
  { day: 6, title: 'PIP, Formatting, Dictionaries & OOP', questionIds: [26, 27, 28, 29, 30] },
  { day: 7, title: 'Multiple Inheritance, Slicing & Bytecode', questionIds: [31, 32, 33, 34, 35] },
  { day: 8, title: 'Arrays vs Lists, Name Mangling & Lambdas', questionIds: [36, 37, 38, 39, 40] },
  { day: 9, title: 'Multiprocessing, GIL, Scopes & Recursion', questionIds: [41, 42, 43, 44, 45] },
  { day: 10, title: 'Unittests, Copying, Dunder & Monkey Patching', questionIds: [46, 47, 48, 49, 50, 51] },
];

export const PYTHON_QUESTIONS = [
  // DAY 1
  {
    id: 1,
    day: 1,
    dayIndex: 1,
    title: 'Difference Between List and Tuple in Python',
    startTime: '1:40',
    endTime: '3:19',
    startSeconds: 100,
    endSeconds: 199,
    summary: 'Lists are mutable (can modify elements), defined with brackets [], and use more memory. Tuples are immutable (cannot change after creation), defined with parentheses (), and are faster and memory efficient.',
    tip: 'Lists = mutable []; Tuples = immutable () and can be dict keys',
    articles: [
      { title: 'Python Docs: Data Structures (Lists & Tuples)', url: 'https://docs.python.org/3/tutorial/datastructures.html', source: 'Python Docs' },
      { title: 'Real Python: Lists and Tuples in Python', url: 'https://realpython.com/python-lists-tuples/', source: 'Real Python' }
    ]
  },
  {
    id: 2,
    day: 1,
    dayIndex: 2,
    title: 'What is a Decorator in Python?',
    startTime: '3:19',
    endTime: '6:41',
    startSeconds: 199,
    endSeconds: 401,
    summary: 'A decorator is a function that takes another function as an argument, extends or alters its behavior without modifying it directly, and returns a callable. Used with the @decorator syntax for logging, authentication, and caching.',
    tip: 'A wrapper function taking a function and returning a modified function (@syntax)',
    articles: [
      { title: 'Primer on Python Decorators', url: 'https://realpython.com/primer-on-python-decorators/', source: 'Real Python' },
      { title: 'Python Docs: Defining Functions & Decorators', url: 'https://docs.python.org/3/glossary.html#term-decorator', source: 'Python Docs' }
    ]
  },
  {
    id: 3,
    day: 1,
    dayIndex: 3,
    title: 'Difference Between List and Dict Comprehension',
    startTime: '6:41',
    endTime: '8:12',
    startSeconds: 401,
    endSeconds: 492,
    summary: 'List comprehension constructs a list using [x for x in iterable]. Dict comprehension constructs a dictionary using {key: value for x in iterable}. Both provide concise and readable loops.',
    tip: '[x for x in data] vs {k: v for k, v in data}',
    articles: [
      { title: 'Python List & Dict Comprehensions Explained', url: 'https://realpython.com/list-comprehension-python/', source: 'Real Python' }
    ]
  },
  {
    id: 4,
    day: 1,
    dayIndex: 4,
    title: 'Memory Management in Python',
    startTime: '8:12',
    endTime: '9:38',
    startSeconds: 492,
    endSeconds: 578,
    summary: 'Python manages memory via a private heap containing all objects and data structures. It uses Reference Counting as the primary mechanism, supplemented by a Generational Cyclic Garbage Collector to clean up circular references.',
    tip: 'Private heap + Reference Counting + Generational Cyclic Garbage Collector',
    articles: [
      { title: 'Memory Management in Python', url: 'https://realpython.com/python-memory-management/', source: 'Real Python' },
      { title: 'Python Docs: Memory Management API', url: 'https://docs.python.org/3/c-api/memory.html', source: 'Python Docs' }
    ]
  },
  {
    id: 5,
    day: 1,
    dayIndex: 5,
    title: 'Difference Between Generators and Iterators',
    startTime: '9:38',
    endTime: '11:18',
    startSeconds: 578,
    endSeconds: 678,
    summary: 'All generators are iterators. An iterator is any object implementing __iter__() and __next__(). A generator is a function that uses the yield keyword to produce values lazily on demand without storing the whole sequence in memory.',
    tip: 'Iterators implement __iter__/__next__; Generators use yield to produce values lazily',
    articles: [
      { title: 'How to Use Generators and yield in Python', url: 'https://realpython.com/introduction-to-python-generators/', source: 'Real Python' }
    ]
  },

  // DAY 2
  {
    id: 6,
    day: 2,
    dayIndex: 1,
    title: "What is the '__init__' keyword?",
    startTime: '11:18',
    endTime: '13:01',
    startSeconds: 678,
    endSeconds: 781,
    summary: '__init__ is a reserved constructor/initializer method in Python classes. It is called automatically when a new instance of a class is created to initialize instance attributes.',
    tip: 'Constructor method called automatically when creating an object instance',
    articles: [
      { title: 'Python __init__ Method Explained', url: 'https://docs.python.org/3/reference/datamodel.html#object.__init__', source: 'Python Docs' }
    ]
  },
  {
    id: 7,
    day: 2,
    dayIndex: 2,
    title: 'Difference Between Modules and Packages',
    startTime: '13:01',
    endTime: '14:28',
    startSeconds: 781,
    endSeconds: 868,
    summary: 'A module is a single Python file (.py) containing code. A package is a directory containing multiple modules and an __init__.py file (optional in modern namespace packages) to organize modules hierarchically.',
    tip: 'Module = single .py file; Package = folder of modules containing __init__.py',
    articles: [
      { title: 'Python Modules and Packages Guide', url: 'https://realpython.com/python-modules-packages/', source: 'Real Python' }
    ]
  },
  {
    id: 8,
    day: 2,
    dayIndex: 3,
    title: 'Difference Between Range and Xrange',
    startTime: '14:28',
    endTime: '16:21',
    startSeconds: 868,
    endSeconds: 981,
    summary: 'In Python 2, range() created an entire list in memory, whereas xrange() returned a lazy generator-like sequence object. In Python 3, xrange() was removed and range() implements lazy evaluation by default.',
    tip: 'Python 2 had both; Python 3 range() is lazy (xrange was removed)',
    articles: [
      { title: 'The range() Type in Python', url: 'https://docs.python.org/3/library/stdtypes.html#range', source: 'Python Docs' }
    ]
  },
  {
    id: 9,
    day: 2,
    dayIndex: 4,
    title: 'Generators Explained with Example',
    startTime: '16:21',
    endTime: '16:48',
    startSeconds: 981,
    endSeconds: 1008,
    summary: 'Generators are defined using regular def syntax but use yield instead of return. When called, they return a generator object without executing the body until __next__() or a loop requests the next value.',
    tip: 'yield pauses function execution and maintains local state until resumed',
    articles: [
      { title: 'Python Generator Functions and Expressions', url: 'https://docs.python.org/3/howto/functional.html#generators', source: 'Python Docs' }
    ]
  },
  {
    id: 10,
    day: 2,
    dayIndex: 5,
    title: 'Inbuilt Data Types / Mutable and Immutable',
    startTime: '16:48',
    endTime: '18:43',
    startSeconds: 1008,
    endSeconds: 1123,
    summary: 'Immutable types cannot be modified in place: int, float, bool, str, tuple, frozenset. Mutable types can be altered in place: list, dict, set, bytearray. Modifying an immutable type creates a new object in memory.',
    tip: 'Mutable: list, dict, set. Immutable: int, float, str, tuple, bool, frozenset',
    articles: [
      { title: 'Built-in Types in Python', url: 'https://docs.python.org/3/library/stdtypes.html', source: 'Python Docs' }
    ]
  },

  // DAY 3
  {
    id: 11,
    day: 3,
    dayIndex: 1,
    title: 'Ternary Operator in Python',
    startTime: '18:43',
    endTime: '19:42',
    startSeconds: 1123,
    endSeconds: 1182,
    summary: 'Python conditional expression syntax: [value_if_true] if [condition] else [value_if_false]. Provides a compact one-liner alternative to multi-line if-else blocks.',
    tip: 'result = "Pass" if score >= 50 else "Fail"',
    articles: [
      { title: 'Python Ternary Operator', url: 'https://docs.python.org/3/reference/expressions.html#conditional-expressions', source: 'Python Docs' }
    ]
  },
  {
    id: 12,
    day: 3,
    dayIndex: 2,
    title: 'Inheritance in Python',
    startTime: '19:42',
    endTime: '21:46',
    startSeconds: 1182,
    endSeconds: 1306,
    summary: 'Allows a class (child/subclass) to inherit attributes and methods from another class (parent/base class). Supports single, multiple, multilevel, and hierarchical inheritance using super() for method resolution.',
    tip: 'class Child(Parent): allows code reuse and polymorphism',
    articles: [
      { title: 'Inheritance and super() in Python', url: 'https://realpython.com/python-super/', source: 'Real Python' }
    ]
  },
  {
    id: 13,
    day: 3,
    dayIndex: 3,
    title: 'Local Variable vs Global Variable',
    startTime: '21:46',
    endTime: '23:31',
    startSeconds: 1306,
    endSeconds: 1411,
    summary: 'Local variables are defined inside a function and accessible only within that function scope. Global variables are declared at the module level. Modifying a global variable inside a function requires the global keyword.',
    tip: 'Local exists inside function; Global exists across module (use global keyword to modify)',
    articles: [
      { title: 'Python Scope & the LEGB Rule', url: 'https://realpython.com/python-scope-legb-rule/', source: 'Real Python' }
    ]
  },
  {
    id: 14,
    day: 3,
    dayIndex: 4,
    title: 'Break, Continue and Pass Statements',
    startTime: '23:31',
    endTime: '25:51',
    startSeconds: 1411,
    endSeconds: 1551,
    summary: 'break terminates the enclosing loop entirely. continue skips the rest of the current iteration and advances to the next loop cycle. pass is a null statement / placeholder that does nothing.',
    tip: 'break: exits loop; continue: jumps to next iteration; pass: placeholder no-op',
    articles: [
      { title: 'break, continue and pass Documentation', url: 'https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements-and-else-clauses-on-loops', source: 'Python Docs' }
    ]
  },
  {
    id: 15,
    day: 3,
    dayIndex: 5,
    title: "What is the 'self' keyword?",
    startTime: '25:51',
    endTime: '27:27',
    startSeconds: 1551,
    endSeconds: 1647,
    summary: 'self represents the instance of the class. By passing self as the first parameter of an instance method, Python binds the method call to the specific instance, allowing access to instance attributes and methods.',
    tip: 'Explicit reference to the current object instance inside class methods',
    articles: [
      { title: 'Classes in Python Documentation', url: 'https://docs.python.org/3/tutorial/classes.html', source: 'Python Docs' }
    ]
  },

  // DAY 4
  {
    id: 16,
    day: 4,
    dayIndex: 1,
    title: 'Pickling and Unpickling in Python',
    startTime: '27:27',
    endTime: '28:38',
    startSeconds: 1647,
    endSeconds: 1718,
    summary: 'Pickling is the process of serializing Python object hierarchies into byte streams using the pickle module. Unpickling is the inverse operation, converting a byte stream back into a live Python object hierarchy.',
    tip: 'pickle.dump/dumps (serialize to bytes) and pickle.load/loads (deserialize)',
    articles: [
      { title: 'Python pickle Module Documentation', url: 'https://docs.python.org/3/library/pickle.html', source: 'Python Docs' }
    ]
  },
  {
    id: 17,
    day: 4,
    dayIndex: 2,
    title: 'Builtin Functions of List, Set, Tuple and Dictionary',
    startTime: '28:38',
    endTime: '31:09',
    startSeconds: 1718,
    endSeconds: 1869,
    summary: 'Common builtin functions across collections: len(), min(), max(), sum(), sorted(), any(), all(). Type specific methods: append/pop (lists), add/union (sets), get/keys/values/items (dicts).',
    tip: 'len(), sorted(), enumerate(), zip(), dict.get(), set.intersection()',
    articles: [
      { title: 'Python Built-in Functions Reference', url: 'https://docs.python.org/3/library/functions.html', source: 'Python Docs' }
    ]
  },
  {
    id: 18,
    day: 4,
    dayIndex: 3,
    title: 'What are Python Iterators?',
    startTime: '31:09',
    endTime: '31:32',
    startSeconds: 1869,
    endSeconds: 1892,
    summary: 'An iterator is an object representing a stream of data. Implements the iterator protocol: __iter__() (returns self) and __next__() (returns next element or raises StopIteration when exhausted).',
    tip: 'Iterators implement __iter__() and __next__() and remember state between calls',
    articles: [
      { title: 'The Iterator Protocol in Python', url: 'https://docs.python.org/3/c-api/iter.html', source: 'Python Docs' }
    ]
  },
  {
    id: 19,
    day: 4,
    dayIndex: 4,
    title: 'Type Conversion in Python (Implicit vs Explicit)',
    startTime: '31:32',
    endTime: '34:14',
    startSeconds: 1892,
    endSeconds: 2054,
    summary: 'Implicit type conversion (coercion) is done automatically by Python (e.g. adding int + float yields float). Explicit type conversion (type casting) is done manually using constructors like int(), str(), list(), float().',
    tip: 'Implicit: automatic (int + float -> float); Explicit: int("42"), list(tuple)',
    articles: [
      { title: 'Type Casting in Python Guide', url: 'https://docs.python.org/3/library/stdtypes.html#type-conversion', source: 'Python Docs' }
    ]
  },
  {
    id: 20,
    day: 4,
    dayIndex: 5,
    title: '*args and **kwargs Explained',
    startTime: '34:14',
    endTime: '36:45',
    startSeconds: 2054,
    endSeconds: 2205,
    summary: '*args allows a function to accept any number of positional arguments unpacked as a tuple. **kwargs allows accepting any number of keyword arguments unpacked as a dictionary.',
    tip: '*args = variable positional args (tuple); **kwargs = variable keyword args (dict)',
    articles: [
      { title: 'Python *args and **kwargs Demystified', url: 'https://realpython.com/python-kwargs-and-args/', source: 'Real Python' }
    ]
  },

  // DAY 5
  {
    id: 21,
    day: 5,
    dayIndex: 1,
    title: 'Open and With Statements (Context Managers)',
    startTime: '36:45',
    endTime: '38:41',
    startSeconds: 2205,
    endSeconds: 2321,
    summary: 'The with statement creates a runtime context and automatically manages resources via __enter__() and __exit__() methods. It guarantees files and database connections are closed even if an exception occurs.',
    tip: 'with open("file.txt") as f: automatically closes the file on exit',
    articles: [
      { title: 'Context Managers and the with Statement', url: 'https://realpython.com/python-with-statement/', source: 'Real Python' }
    ]
  },
  {
    id: 22,
    day: 5,
    dayIndex: 2,
    title: 'File Read and Write Operations in Python',
    startTime: '38:41',
    endTime: '40:35',
    startSeconds: 2321,
    endSeconds: 2435,
    summary: 'Modes: "r" (read), "w" (write, truncates), "a" (append), "r+" (read/write), "b" (binary). Reading: read(), readline(), readlines(). Writing: write(), writelines().',
    tip: 'read() reads all, readline() reads one line, readlines() returns list of lines',
    articles: [
      { title: 'Reading and Writing Files in Python', url: 'https://realpython.com/read-write-files-python/', source: 'Real Python' }
    ]
  },
  {
    id: 23,
    day: 5,
    dayIndex: 3,
    title: 'What is PYTHONPATH?',
    startTime: '40:35',
    endTime: '41:15',
    startSeconds: 2435,
    endSeconds: 2475,
    summary: 'PYTHONPATH is an environment variable containing a list of directory paths that Python searches when importing modules, prepended to sys.path before default standard libraries.',
    tip: 'Environment variable specifying search directories for imported modules',
    articles: [
      { title: 'Python Setup & Usage: PYTHONPATH', url: 'https://docs.python.org/3/using/cmdline.html#envvar-PYTHONPATH', source: 'Python Docs' }
    ]
  },
  {
    id: 24,
    day: 5,
    dayIndex: 4,
    title: 'Exception Handling (Try, Except, Else, Finally)',
    startTime: '41:15',
    endTime: '43:28',
    startSeconds: 2475,
    endSeconds: 2608,
    summary: 'try runs risky code. except catches specific exceptions. else executes if no exceptions were raised. finally always executes regardless of whether an exception occurred (ideal for cleanup).',
    tip: 'try (code) -> except (error) -> else (if no error) -> finally (always runs)',
    articles: [
      { title: 'Errors and Exceptions Documentation', url: 'https://docs.python.org/3/tutorial/errors.html', source: 'Python Docs' }
    ]
  },
  {
    id: 25,
    day: 5,
    dayIndex: 5,
    title: 'Difference Between Python 2.0 & 3.0',
    startTime: '43:28',
    endTime: '44:52',
    startSeconds: 2608,
    endSeconds: 2692,
    summary: 'Python 3 print is a function (print()), integer division returns float (5/2=2.5), strings are Unicode by default, xrange was replaced by range, and Python 2 is end-of-life.',
    tip: 'print() function, unicode strings by default, float division / vs //, xrange removed',
    articles: [
      { title: 'What is New in Python 3.0', url: 'https://docs.python.org/3/whatsnew/3.0.html', source: 'Python Docs' }
    ]
  },

  // DAY 6
  {
    id: 26,
    day: 6,
    dayIndex: 1,
    title: 'What is PIP in Python?',
    startTime: '44:52',
    endTime: '45:46',
    startSeconds: 2692,
    endSeconds: 2746,
    summary: 'PIP (Pip Installs Packages) is the official standard package manager for Python used to install, update, and manage third-party libraries and dependencies from the Python Package Index (PyPI).',
    tip: 'Standard package installer for Python libraries from PyPI',
    articles: [
      { title: 'Installing Python Modules with pip', url: 'https://docs.python.org/3/installing/index.html', source: 'Python Docs' }
    ]
  },
  {
    id: 27,
    day: 6,
    dayIndex: 2,
    title: 'Common Uses and Applications of Python',
    startTime: '45:46',
    endTime: '46:11',
    startSeconds: 2746,
    endSeconds: 2771,
    summary: 'Web Development (Django, FastAPI, Flask), Data Science & Machine Learning (Pandas, PyTorch, Scikit-learn), Scripting & DevOps automation, Web Scraping (BeautifulSoup, Scrapy), and Cybersecurity.',
    tip: 'Backend Web APIs, AI/ML, Data Engineering, Automation scripts, Cloud/DevOps',
    articles: [
      { title: 'Python Applications and Success Stories', url: 'https://www.python.org/about/apps/', source: 'Python.org' }
    ]
  },
  {
    id: 28,
    day: 6,
    dayIndex: 3,
    title: 'F-strings and String Formatting in Python',
    startTime: '46:11',
    endTime: '47:36',
    startSeconds: 2771,
    endSeconds: 2856,
    summary: 'Introduced in Python 3.6, formatted string literals (f-strings) prefix strings with "f" and evaluate embedded expressions in braces {expr}. Faster, more concise, and readable compared to % formatting or str.format().',
    tip: 'f"User: {name}, Age: {age + 1}" - fastest and cleanest string interpolation',
    articles: [
      { title: 'Python 3 F-Strings: An Improved String Formatting Syntax', url: 'https://realpython.com/python-f-strings/', source: 'Real Python' }
    ]
  },
  {
    id: 29,
    day: 6,
    dayIndex: 4,
    title: 'How to Get All Keys from a Dictionary',
    startTime: '47:36',
    endTime: '49:18',
    startSeconds: 2856,
    endSeconds: 2958,
    summary: 'Use dict.keys() to return a dynamic dict_keys view object. Convert to a list with list(dict.keys()) or list(my_dict). You can also iterate directly over a dictionary for keys.',
    tip: 'dict.keys() returns view object; list(my_dict) returns list of keys',
    articles: [
      { title: 'Dictionary Views in Python', url: 'https://docs.python.org/3/library/stdtypes.html#dict-views', source: 'Python Docs' }
    ]
  },
  {
    id: 30,
    day: 6,
    dayIndex: 5,
    title: 'Abstraction vs Encapsulation in Python',
    startTime: '49:18',
    endTime: '50:12',
    startSeconds: 2958,
    endSeconds: 3012,
    summary: 'Encapsulation bundles data and methods into a single class and restricts direct access (using private attributes like _var or __var). Abstraction hides complex internal implementation details and exposes only essential interfaces (using abc.ABC).',
    tip: 'Encapsulation = bundling data & hiding internals; Abstraction = exposing simple interface',
    articles: [
      { title: 'Object-Oriented Programming in Python', url: 'https://realpython.com/python3-object-oriented-programming/', source: 'Real Python' }
    ]
  },

  // DAY 7
  {
    id: 31,
    day: 7,
    dayIndex: 1,
    title: 'Multiple Inheritance & The Diamond Problem',
    startTime: '50:12',
    endTime: '52:12',
    startSeconds: 3012,
    endSeconds: 3132,
    summary: 'Occurs when class D inherits from B and C, both inheriting from A. Python resolves ambiguity using C3 Linearization to produce the Method Resolution Order (MRO), accessible via ClassName.mro() or ClassName.__mro__.',
    tip: 'Python uses C3 Linearization (MRO) to predictably resolve the Diamond Problem',
    articles: [
      { title: 'Method Resolution Order (MRO) in Python', url: 'https://docs.python.org/3/glossary.html#term-method-resolution-order', source: 'Python Docs' }
    ]
  },
  {
    id: 32,
    day: 7,
    dayIndex: 2,
    title: 'Initialize Empty List, Tuple, Dict or Set',
    startTime: '52:12',
    endTime: '53:11',
    startSeconds: 3132,
    endSeconds: 3191,
    summary: 'Empty List: [] or list(). Empty Tuple: () or tuple(). Empty Dict: {} or dict(). Empty Set: set() (notice {} creates an empty dict, not a set!).',
    tip: 'Important: set() creates an empty set; {} creates an empty dict!',
    articles: [
      { title: 'Set Types in Python', url: 'https://docs.python.org/3/library/stdtypes.html#set', source: 'Python Docs' }
    ]
  },
  {
    id: 33,
    day: 7,
    dayIndex: 3,
    title: 'Difference Between .py and .pyc Files',
    startTime: '53:11',
    endTime: '54:08',
    startSeconds: 3191,
    endSeconds: 3248,
    summary: '.py files are human-readable Python source code files. .pyc files are compiled bytecode files generated by Python and stored in __pycache__ to speed up future loading times.',
    tip: '.py = source code; .pyc = pre-compiled bytecode executed by Python virtual machine',
    articles: [
      { title: 'Compiled Python Files Documentation', url: 'https://docs.python.org/3/tutorial/modules.html#compiled-python-files', source: 'Python Docs' }
    ]
  },
  {
    id: 34,
    day: 7,
    dayIndex: 4,
    title: 'Slicing and [::-1] in Python',
    startTime: '54:08',
    endTime: '59:34',
    startSeconds: 3248,
    endSeconds: 3574,
    summary: 'Syntax: sequence[start:stop:step]. A negative step like [::-1] traverses the sequence backwards from right to left, commonly used to reverse strings or lists.',
    tip: 'seq[start:stop:step]; [::-1] reverses the sequence cleanly',
    articles: [
      { title: 'Python Sequence Slicing', url: 'https://docs.python.org/3/reference/expressions.html#slicings', source: 'Python Docs' }
    ]
  },
  {
    id: 35,
    day: 7,
    dayIndex: 5,
    title: 'Concatenating Tuples in Python',
    startTime: '59:34',
    endTime: '1:04:21',
    startSeconds: 3574,
    endSeconds: 3861,
    summary: 'Because tuples are immutable, concatenating using the + operator (t1 + t2) creates a brand new tuple containing elements of both, leaving the originals untouched.',
    tip: 't3 = t1 + t2 creates a new tuple without modifying t1 or t2',
    articles: [
      { title: 'Common Sequence Operations in Python', url: 'https://docs.python.org/3/library/stdtypes.html#common-sequence-operations', source: 'Python Docs' }
    ]
  },

  // DAY 8
  {
    id: 36,
    day: 8,
    dayIndex: 1,
    title: 'Arrays vs Lists in Python',
    startTime: '1:04:21',
    endTime: '1:05:25',
    startSeconds: 3861,
    endSeconds: 3925,
    summary: 'Lists are built-in and can hold heterogeneous elements of different data types. Arrays (from the array module or NumPy) require homogeneous elements of fixed C data types and are far more memory efficient for mathematical computations.',
    tip: 'Lists: heterogeneous, general-purpose; Arrays (NumPy/array): homogeneous, fast math',
    articles: [
      { title: 'Python array Module Documentation', url: 'https://docs.python.org/3/library/array.html', source: 'Python Docs' }
    ]
  },
  {
    id: 37,
    day: 8,
    dayIndex: 2,
    title: 'Difference Between _a, __a and __a__ in Python',
    startTime: '1:05:25',
    endTime: '1:07:07',
    startSeconds: 3925,
    endSeconds: 4027,
    summary: '_a: Weak internal/private convention. __a: Triggers Name Mangling (renamed to _ClassName__a to avoid subclass conflicts). __a__: Special magic/dunder method reserved by Python language (e.g. __init__, __str__).',
    tip: '_var = protected convention; __var = name mangling; __var__ = Python magic methods',
    articles: [
      { title: 'Underscores in Python: _single, __double, and __dunder__', url: 'https://dbader.org/blog/meaning-of-underscores-in-python', source: 'Real Python' }
    ]
  },
  {
    id: 38,
    day: 8,
    dayIndex: 3,
    title: 'Reading Multiple Values from Input (split)',
    startTime: '1:07:07',
    endTime: '1:08:14',
    startSeconds: 4027,
    endSeconds: 4094,
    summary: 'Use input().split() to read whitespace-separated values into a list of strings. To parse integers, combine with map: a, b = map(int, input().split()).',
    tip: 'x, y = map(int, input().split())',
    articles: [
      { title: 'Python input() and str.split()', url: 'https://docs.python.org/3/library/stdtypes.html#str.split', source: 'Python Docs' }
    ]
  },
  {
    id: 39,
    day: 8,
    dayIndex: 4,
    title: 'How to Copy and Delete a Dictionary in Python',
    startTime: '1:08:14',
    endTime: '1:11:12',
    startSeconds: 4094,
    endSeconds: 4272,
    summary: 'Copy: d.copy() (shallow copy) or copy.deepcopy(d). Delete: del d["key"], d.pop("key"), d.clear() (removes all items), or del d (deletes the entire dictionary variable).',
    tip: 'Copy: dict.copy(); Delete: del d["k"], d.pop("k"), d.clear()',
    articles: [
      { title: 'Python Dictionary Methods', url: 'https://docs.python.org/3/library/stdtypes.html#dict', source: 'Python Docs' }
    ]
  },
  {
    id: 40,
    day: 8,
    dayIndex: 5,
    title: 'Anonymous and Lambda Functions in Python',
    startTime: '1:11:12',
    endTime: '1:14:04',
    startSeconds: 4272,
    endSeconds: 4444,
    summary: 'A lambda function is a small, inline, anonymous function restricted to a single expression: lambda arg1, arg2: expression. Commonly passed as key functions to sorted(), map(), or filter().',
    tip: 'square = lambda x: x * x (single-expression inline anonymous function)',
    articles: [
      { title: 'How to Use Python Lambda Functions', url: 'https://realpython.com/python-lambda/', source: 'Real Python' }
    ]
  },

  // DAY 9
  {
    id: 41,
    day: 9,
    dayIndex: 1,
    title: 'Multiprocessing vs Multithreading in Python',
    startTime: '1:14:04',
    endTime: '1:15:52',
    startSeconds: 4444,
    endSeconds: 4552,
    summary: 'Multithreading runs threads within a single process sharing memory, but is limited by the GIL for CPU-bound tasks (ideal for I/O-bound tasks). Multiprocessing runs separate processes with separate memory spaces and GILs, utilizing multiple CPU cores for CPU-bound tasks.',
    tip: 'I/O-bound = threading/asyncio; CPU-bound = multiprocessing (bypasses GIL)',
    articles: [
      { title: 'Speed Up Python: Threading vs Multiprocessing', url: 'https://realpython.com/python-concurrency/', source: 'Real Python' }
    ]
  },
  {
    id: 42,
    day: 9,
    dayIndex: 2,
    title: 'What is the GIL (Global Interpreter Lock)?',
    startTime: '1:15:52',
    endTime: '1:17:01',
    startSeconds: 4552,
    endSeconds: 4621,
    summary: 'A mutex/lock in CPython that ensures only one native thread executes Python bytecode at a time. It prevents memory corruption and race conditions in CPython reference count management, but limits CPU parallelism in multi-threaded programs.',
    tip: 'Mutex in CPython preventing true multi-core parallel execution in threads',
    articles: [
      { title: 'What Is the Python Global Interpreter Lock (GIL)?', url: 'https://realpython.com/python-gil/', source: 'Real Python' }
    ]
  },
  {
    id: 43,
    day: 9,
    dayIndex: 3,
    title: 'Class and Object Creation in Python',
    startTime: '1:17:01',
    endTime: '1:17:54',
    startSeconds: 4621,
    endSeconds: 4674,
    summary: 'When creating an object obj = ClassName(), Python calls __new__() to allocate the memory and create the instance, then calls __init__() to initialize instance attributes.',
    tip: '__new__() creates and returns the object instance; __init__() initializes it',
    articles: [
      { title: 'Python __new__ vs __init__', url: 'https://docs.python.org/3/reference/datamodel.html#object.__new__', source: 'Python Docs' }
    ]
  },
  {
    id: 44,
    day: 9,
    dayIndex: 4,
    title: 'Namespace and Scope Resolution (LEGB Rule)',
    startTime: '1:17:54',
    endTime: '1:20:01',
    startSeconds: 4674,
    endSeconds: 4801,
    summary: 'A namespace is a mapping from variable names to objects. Python resolves variable names using the LEGB rule: Local -> Enclosing (nested functions) -> Global (module) -> Built-in.',
    tip: 'LEGB: Local -> Enclosing -> Global -> Built-in',
    articles: [
      { title: 'Namespaces and Scopes in Python', url: 'https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces', source: 'Python Docs' }
    ]
  },
  {
    id: 45,
    day: 9,
    dayIndex: 5,
    title: 'Recursion in Python (Reversing a List)',
    startTime: '1:20:01',
    endTime: '1:21:13',
    startSeconds: 4801,
    endSeconds: 4873,
    summary: 'A function that calls itself until reaching a base condition. Python has a default recursion limit (usually 1000) accessible via sys.getrecursionlimit() to prevent stack overflow.',
    tip: 'Must have a base case to terminate; check sys.getrecursionlimit()',
    articles: [
      { title: 'Thinking Recursively in Python', url: 'https://realpython.com/python-thinking-recursively/', source: 'Real Python' }
    ]
  },

  // DAY 10
  {
    id: 46,
    day: 10,
    dayIndex: 1,
    title: 'Unittests in Python (unittest Module)',
    startTime: '1:21:13',
    endTime: '1:22:28',
    startSeconds: 4873,
    endSeconds: 4948,
    summary: 'Python built-in unittest framework supports test automation, setup/teardown fixtures (setUp(), tearDown()), and assertion methods (assertEqual, assertTrue, assertRaises).',
    tip: 'Inherit from unittest.TestCase; use setUp(), tearDown(), and assertEqual()',
    articles: [
      { title: 'unittest — Unit testing framework', url: 'https://docs.python.org/3/library/unittest.html', source: 'Python Docs' }
    ]
  },
  {
    id: 47,
    day: 10,
    dayIndex: 2,
    title: 'Map, Filter and Reduce in Python',
    startTime: '1:22:28',
    endTime: '1:23:16',
    startSeconds: 4948,
    endSeconds: 4996,
    summary: 'map(func, iter) applies func to every item. filter(func, iter) keeps items where func returns True. reduce(func, iter) (from functools) accumulates elements pairwise to a single final value.',
    tip: 'map: transform; filter: select; functools.reduce: aggregate to single value',
    articles: [
      { title: 'Functional Programming HOWTO', url: 'https://docs.python.org/3/howto/functional.html', source: 'Python Docs' }
    ]
  },
  {
    id: 48,
    day: 10,
    dayIndex: 3,
    title: 'Shallow Copy vs Deep Copy in Python',
    startTime: '1:23:16',
    endTime: '1:24:28',
    startSeconds: 4996,
    endSeconds: 5068,
    summary: 'Shallow copy (copy.copy()) constructs a new collection object but inserts references to the child objects within the original. Deep copy (copy.deepcopy()) recursively copies all nested objects.',
    tip: 'Shallow: copies outer container only; Deep: recursively duplicates all nested objects',
    articles: [
      { title: 'Shallow and Deep Copy Operations', url: 'https://docs.python.org/3/library/copy.html', source: 'Python Docs' }
    ]
  },
  {
    id: 49,
    day: 10,
    dayIndex: 4,
    title: 'Object Copying and Monkey Patching',
    startTime: '1:24:28',
    endTime: '1:25:04',
    startSeconds: 5068,
    endSeconds: 5104,
    summary: 'Monkey patching is dynamically modifying a class, module, or function at runtime without altering the original source code. Commonly used in unit testing for mocking network or DB calls.',
    tip: 'Dynamically replacing or extending functions or classes at runtime',
    articles: [
      { title: 'Monkey Patching in Python Explained', url: 'https://realpython.com/python-mock-library/', source: 'Real Python' }
    ]
  },
  {
    id: 50,
    day: 10,
    dayIndex: 5,
    title: 'Operator Overloading & Dunder Methods in Python',
    startTime: '1:25:04',
    endTime: '1:26:35',
    startSeconds: 5104,
    endSeconds: 5195,
    summary: 'Defining magic/dunder methods allows custom classes to overload built-in operators: __add__ (+), __sub__ (-), __mul__ (*), __eq__ (==), __str__ (string representation), and __len__.',
    tip: 'Implement __add__, __sub__, __str__, __len__ to define behavior for standard operators',
    articles: [
      { title: 'Python Dunder Methods and Operator Overloading', url: 'https://docs.python.org/3/reference/datamodel.html#special-method-names', source: 'Python Docs' }
    ]
  },
  {
    id: 51,
    day: 10,
    dayIndex: 6,
    title: 'Bonus Tip: Coding Patterns & Graph Algorithms',
    startTime: '1:24:44',
    endTime: '1:26:35',
    startSeconds: 5084,
    endSeconds: 5195,
    summary: 'Master core interview patterns: Two Pointers, Sliding Window, DFS/BFS Graph traversals, and dynamic programming memoization in Python.',
    tip: 'Focus on BFS/DFS traversals, sliding window, and space-time complexity analysis',
    articles: [
      { title: 'Python Data Structures & Algorithms Guide', url: 'https://realpython.com/python-data-structures/', source: 'Real Python' }
    ]
  }
];

