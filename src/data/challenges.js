// Curated interview coding challenges, starter code, expected output, and interviewer deep-dive questions

export const SANDBOX_LINKS = {
  python: 'https://onecompiler.com/python',
  django: 'https://docs.djangoproject.com/en/stable/',
  postgres: 'https://onecompiler.com/postgresql',
  pythonDocs: 'https://docs.python.org/3/',
};

export function getQuestionChallenge(trackId, question) {
  if (!question) return null;

  const titleLower = (question.title || '').toLowerCase();
  const qId = question.id;

  // --- PYTHON TRACK CHALLENGES ---
  if (trackId === 'python') {
    // Q1: List vs Tuple
    if (titleLower.includes('list and tuple') || titleLower.includes('list vs tuple') || qId === 1) {
      return {
        title: 'Memory Overhead & Dict Key Hashability',
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
        interviewQuestion: 'Why is a tuple with a list inside it not hashable even though tuples are immutable?',
        interviewAnswer: 'In Python, an object is hashable only if its hash value never changes during its lifetime and all of its items are also hashable. While the outer tuple container is immutable, it recursively computes its hash from its elements. Because the inner list is mutable and lacks a valid __hash__() method, the tuple fails the hash() check and raises TypeError: unhashable type: "list".',
        replLink: 'https://onecompiler.com/python'
      };
    }

    // Q2: Decorators
    if (titleLower.includes('decorator') || qId === 2) {
      return {
        title: 'Building a Production Performance Timing Decorator',
        steps: [
          'Import `time` and `functools.wraps`.',
          'Write a decorator function `@timing_decorator` that records `time.perf_counter()` before and after calling `func(*args, **kwargs)`.',
          'Print the execution time in milliseconds and return the original function output.',
          'Apply the decorator to a heavy mathematical computation (e.g. summing 10,000,000 numbers).',
          'Inspect `heavy_calc.__name__` and `heavy_calc.__doc__` to verify metadata preservation.'
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
print("Function Name Preserved:", compute_sum.__name__)`,
        expectedOutput: `[METRIC] compute_sum executed in ~150.00ms
Result: 12499997500000
Function Name Preserved: compute_sum`,
        interviewQuestion: 'What happens if you omit @functools.wraps(func) inside your custom decorator?',
        interviewAnswer: 'Without @functools.wraps(func), the decorated function loses its identity. Its __name__ attribute becomes "wrapper" instead of the original function name, and its docstring (__doc__) and signature are replaced by wrapper metadata. This breaks introspection, logging frameworks, documentation generators (Sphinx), and debugging tools.',
        replLink: 'https://onecompiler.com/python'
      };
    }

    // Q3: List vs Dict Comprehension
    if (titleLower.includes('comprehension') || qId === 3) {
      return {
        title: 'Transforming Collections & Memory Benchmark',
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
        interviewQuestion: 'When would you deliberately choose a generator expression over a list comprehension in a backend API?',
        interviewAnswer: 'When streaming or processing massive datasets (such as parsing gigabyte database query results, reading multi-megabyte log files, or streaming CSVs). A list comprehension allocates all objects in memory immediately, causing Out-Of-Memory (OOM) crashes. A generator computes items lazily on demand one by one with constant O(1) memory overhead.',
        replLink: 'https://onecompiler.com/python'
      };
    }

    // Q4: Memory Management
    if (titleLower.includes('memory') || qId === 4) {
      return {
        title: 'Reference Counting & Circular Reference Garbage Collection',
        steps: [
          'Import `sys` and `gc`.',
          'Create an object `a = [1, 2, 3]` and inspect its initial reference count with `sys.getrefcount(a)`.',
          'Create a second alias `b = a` and observe the reference count increase.',
          'Create a circular reference `a.append(a)` and `del a, b`. Explain why reference counting fails and cyclic GC is required.'
        ],
        codeSnippet: `import sys
import gc

# 1. Reference Counting
x = ["backend", "data"]
print("Initial ref count:", sys.getrefcount(x)) # Note: getrefcount adds 1 temporary ref

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
print("Uncollected cyclic objects before gc.collect():", gc.collect())`,
        expectedOutput: `Initial ref count: 2
After second reference: 3
After deleting y: 2
Uncollected cyclic objects before gc.collect(): 2 (or more)`,
        interviewQuestion: 'How does Python garbage collection handle memory when reference counting drops to zero vs when circular references occur?',
        interviewAnswer: 'Reference counting is Python primary deallocation mechanism: the instant an object reference count drops to 0, its memory is freed immediately. However, circular references prevent reference counts from ever reaching 0. To fix this, Python runs a secondary Generational Cyclic Garbage Collector (Generations 0, 1, 2) that detects isolated cycles of unreachable objects using pointer traversal and cleans them up.',
        replLink: 'https://onecompiler.com/python'
      };
    }

    // Q5: Generators & Iterators
    if (titleLower.includes('generator') || titleLower.includes('iterator') || qId === 5) {
      return {
        title: 'Building an Iterator Protocol vs Generator Function',
        steps: [
          'Implement a custom Iterator class with `__iter__()` and `__next__()` that raises `StopIteration`.',
          'Implement the exact same logic using a Generator function with `yield`.',
          'Compare the number of lines of code and explain state preservation across `yield` statements.'
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
print("Generator Yield:", list(count_up_to_gen(3)))`,
        expectedOutput: `Iterator Class: [1, 2, 3]
Generator Yield: [1, 2, 3]`,
        interviewQuestion: 'What happens under the hood when a function contains the yield keyword?',
        interviewAnswer: 'When a function contains "yield", Python compiles it into a generator factory function rather than a standard function. Calling it does not execute the code; instead, it returns a generator iterator object. When next() is invoked on it, execution runs until the "yield" statement, pauses its stack frame and local variables in memory, and returns the yielded value.',
        replLink: 'https://onecompiler.com/python'
      };
    }
  }

  // --- DJANGO TRACK CHALLENGES ---
  if (trackId === 'django') {
    // Q1: Install & Version
    if (titleLower.includes('install') || qId === 1) {
      return {
        title: 'Virtual Environment Isolation & CLI Diagnostics',
        steps: [
          'In your terminal, verify the Python interpreter path: `which python3` or `where python`.',
          'Create an isolated environment: `python3 -m venv venv && source venv/bin/activate`.',
          'Install Django: `pip install django`.',
          'Check version using both CLI flags and Python runtime: `python -m django --version` vs `django.get_version()`.'
        ],
        codeSnippet: `# Python Runtime Version Check
import django

print("Django Version:", django.get_version())
print("Django Path:", django.__file__)`,
        expectedOutput: `Django Version: 5.x.x (or current installed)
Django Path: .../site-packages/django/__init__.py`,
        interviewQuestion: 'Why should you always run "python -m django <command>" rather than standalone "django-admin"?',
        interviewAnswer: 'Running "python -m django" guarantees that the command executes using the exact Python interpreter and virtual environment currently activated in your shell. The standalone "django-admin" executable might point to a global system-level Python installation on your PATH with mismatched library versions.',
        replLink: 'https://docs.djangoproject.com/en/stable/intro/install/'
      };
    }

    // Q2: Startproject vs Startapp
    if (titleLower.includes('project and app') || titleLower.includes('startproject') || qId === 2) {
      return {
        title: 'Project vs App Container Architecture',
        steps: [
          'Run `django-admin startproject config .` to initialize the project container.',
          'Run `python manage.py startapp accounts` to create a domain app.',
          'Identify what files belong to the project container (`settings.py`, `wsgi.py`, `asgi.py`) vs the app (`models.py`, `views.py`, `apps.py`).',
          'Register the app inside `INSTALLED_APPS` in `settings.py`.'
        ],
        codeSnippet: `# settings.py (Registering your modular app)
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Custom Apps
    'accounts.apps.AccountsConfig',
]`,
        expectedOutput: `App 'accounts' successfully loaded by Django app registry.`,
        interviewQuestion: 'What is the architectural difference between a Django project and a Django app?',
        interviewAnswer: 'A Django project is the overall web application container configuration (database settings, middleware pipeline, root URLconf, deployment WSGI entry point). A Django app is a self-contained, modular Python package that handles a specific business domain (e.g. users, billing, blog). A project can contain multiple apps, and an app can be reused across multiple projects.',
        replLink: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/'
      };
    }

    // Q3: Runserver
    if (titleLower.includes('runserver') || qId === 3) {
      return {
        title: 'Development Server vs Production WSGI Application',
        steps: [
          'Run development server on custom port: `python manage.py runserver 0.0.0.0:8080`.',
          'Explain why `runserver` must NEVER be used in production.',
          'Explain the role of Gunicorn/uWSGI and Nginx in a production backend architecture.'
        ],
        codeSnippet: `# Command to run dev server on specific port
python manage.py runserver 8000

# Production WSGI Invocation (via Gunicorn)
# gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4`,
        expectedOutput: `Watching for file changes with StatReloader
Performing system checks...
Django version 5.x.x, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.`,
        interviewQuestion: 'Why is Django "runserver" unsuitable for production environments?',
        interviewAnswer: 'runserver is a single-process development server built strictly for local testing. It lacks security hardening, cannot handle concurrency under heavy loads, lacks process monitoring/restarting, and does not serve static assets efficiently. In production, Django WSGI/ASGI applications must run behind production servers like Gunicorn or Daphne, reverse-proxied by Nginx.',
        replLink: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#runserver'
      };
    }
  }

  // --- GENERIC STRUCTURED FALLBACK FOR OTHER QUESTIONS ---
  return {
    title: `Practical Verification: ${question.title}`,
    steps: [
      `Review the core concept for "${question.title}".`,
      `Open your terminal or interactive Python/Django environment.`,
      `Write a runnable snippet testing edge cases and verifying how the runtime behaves.`,
      `Explain the trade-offs (CPU, memory, database query count) out loud.`
    ],
    codeSnippet: question.tip ? `# Syntax & Test Snippet\n${question.tip}` : `# Verification snippet for: ${question.title}\nprint("Testing ${question.title}")`,
    expectedOutput: `Verified behavior matching Django/Python documentation specifications.`,
    interviewQuestion: `How would you explain the trade-offs of ${question.title} if an interviewer asks you to scale this system?`,
    interviewAnswer: `Break down: 1) What problem it solves, 2) The underlying mechanism (runtime memory or SQL execution), 3) The potential failure mode under high load, and 4) How to optimize or cache it in production.`,
    replLink: trackId === 'python' ? 'https://onecompiler.com/python' : 'https://docs.djangoproject.com/en/stable/'
  };
}
