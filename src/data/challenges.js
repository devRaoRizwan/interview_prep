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

// Curated 60-second interview spoken answer scripts, interviewer prompts, and 3-point senior response frameworks
export function getQuestionScriptData(trackId, question) {
  if (!question) return null;

  const titleLower = (question.title || '').toLowerCase();
  const qId = question.id;

  // --- PYTHON TRACK SCRIPTS ---
  if (trackId === 'python') {
    // Q1: List vs Tuple
    if (titleLower.includes('list and tuple') || titleLower.includes('list vs tuple') || qId === 1) {
      return {
        prompt: 'Can you walk me through the key architectural differences between a Python list and a tuple? Under what circumstances in a production backend would you specifically choose a tuple over a list, and what happens at the memory allocation level?',
        framework: [
          { time: '0-15s', point: 'Core Definition & Mutability: Lists are mutable dynamic arrays; Tuples are immutable fixed-size sequences.' },
          { time: '15-45s', point: 'Under the Hood (CPython): Lists over-allocate memory with realloc for O(1) amortized appends; Tuples allocate exact memory and use small-tuple free-list caching.' },
          { time: '45-60s', point: 'Backend Production Practice: Use tuples for dictionary keys, database composite primary keys, and immutable data transfer objects. Use lists only for collections requiring mutation or sorting.' }
        ],
        spokenScript: `"In Python, the fundamental difference comes down to mutability, memory layout, and hashability. Lists are mutable dynamic arrays: CPython deliberately over-allocates memory headroom using realloc so that append operations achieve amortized O(1) time complexity. In contrast, tuples are immutable and fixed-size; Python allocates exact memory without extra buffer slots and leverages internal free-lists to cache and reuse small tuple objects, minimizing garbage collection overhead.\n\nIn backend development, I strictly use tuples for fixed data structures—such as dictionary keys, coordinate pairs, or database composite keys—because immutability guarantees hashability and thread-safe read access. I only choose lists when I need a dynamic collection that requires in-place mutation, sorting, or iterative appending."`,
        buzzwords: ['CPython PyTupleObject', 'Over-allocation buffer', 'Amortized O(1)', 'Hashability & __hash__', 'Thread-safe read access', 'Free-list caching'],
        juniorMistake: 'Just saying "tuples use parentheses () and lists use brackets []" without explaining memory overhead, realloc, or dict key hashability.'
      };
    }

    // Q2: Decorators
    if (titleLower.includes('decorator') || qId === 2) {
      return {
        prompt: 'How do decorators work in Python under the hood? Walk me through how you would implement a custom decorator for measuring API endpoint latency or enforcing authentication in a backend API, and what pitfalls you must guard against.',
        framework: [
          { time: '0-15s', point: 'Mechanism: Higher-order function closure evaluated at module import time; @syntax translates to func = dec(func).' },
          { time: '15-45s', point: 'Critical Best Practice: Always apply @functools.wraps(func) to prevent stripping __name__, __doc__, and type signatures.' },
          { time: '45-60s', point: 'Production Application: Use decorators for cross-cutting concerns (JWT authentication, Datadog/Sentry instrumentation, caching, DB retries).' }
        ],
        spokenScript: `"Under the hood, a Python decorator is syntactic sugar for a higher-order function that accepts a callable, wraps it inside an execution closure, and returns the replacement wrapper function. When Python encounters @timing_decorator, it executes 'func = timing_decorator(func)' at module import time.\n\nIn a production backend, the single most critical practice when building any custom decorator is applying '@functools.wraps(func)' on the inner wrapper function. Without wraps, the decorated function loses its identity—its __name__ becomes 'wrapper', and its docstring and signature are wiped out, breaking APM tools like Datadog, Sentry, and OpenAPI documentation generators. I accept *args and **kwargs to support any endpoint signature, execute cross-cutting concerns like measuring latency or verifying JWT headers, and let exceptions propagate cleanly."`,
        buzzwords: ['Higher-order function', 'Closure scope', '@functools.wraps', 'Introspection metadata', 'Import-time evaluation', 'Cross-cutting concerns'],
        juniorMistake: 'Forgetting @functools.wraps, which renames decorated functions to "wrapper" and breaks Swagger docs, Celery task names, and Sentry stack traces.'
      };
    }

    // Q3: List Comprehensions vs Generator Expressions
    if (titleLower.includes('comprehension') || titleLower.includes('generator') || qId === 3) {
      return {
        prompt: 'What is the architectural difference between a list comprehension and a generator expression in Python? If you have to process 500,000 database rows in a backend worker, which do you choose and why?',
        framework: [
          { time: '0-15s', point: 'Eager vs Lazy Evaluation: List comprehensions allocate all elements in heap RAM upfront (O(N) memory); Generator expressions evaluate lazily on-demand (O(1) memory).' },
          { time: '15-45s', point: 'Iterator Protocol: Generators implement __iter__ and __next__, yielding items one-by-one without holding the dataset in RAM.' },
          { time: '45-60s', point: 'Production Guidance: Always use generator pipelines or ORM chunking (iterator()) for large datasets to prevent OOM container kills; reserve comprehensions for small datasets needing random indexing.' }
        ],
        spokenScript: `"The fundamental architectural difference is eager versus lazy evaluation. A list comprehension eagerly allocates and builds the entire list in heap memory immediately, returning a populated list object with O(N) memory complexity. A generator expression evaluates lazily using parentheses: it returns a generator object conforming to Python's iterator protocol, producing items one at a time on demand via '__next__()' with O(1) constant memory.\n\nIf I'm processing 500,000 records from Postgres in a Celery worker, loading them all into a list comprehension risks triggering an Out-Of-Memory (OOM) kill by the Kubernetes container orchestrator. I stream the records using a generator or Django's .iterator() to keep resident memory minimal. I only use list comprehensions when the collection is small and I require random indexing, len() lookups, or multiple passes."`,
        buzzwords: ['Eager vs Lazy evaluation', 'Iterator protocol (__next__)', 'O(1) auxiliary space', 'OOM Container termination', 'Streaming data pipeline'],
        juniorMistake: 'Defaulting to list comprehensions for every loop, causing sudden memory spikes and container crashes under heavy production traffic.'
      };
    }
  }

  // --- DJANGO TRACK SCRIPTS ---
  if (trackId === 'django') {
    // Q1: Django Install & Version
    if (titleLower.includes('install') || titleLower.includes('version') || qId === 1) {
      return {
        prompt: 'Walk me through how you install Django in a production microservice repository. Why is executing "python -m django --version" standard practice over running the "django-admin" CLI directly?',
        framework: [
          { time: '0-15s', point: 'Environment Isolation: Always install inside a pinned virtual environment (venv, poetry, Docker) rather than global system Python.' },
          { time: '15-45s', point: 'python -m vs django-admin: "python -m django" explicitly guarantees execution using the active virtual environment interpreter on sys.path.' },
          { time: '45-60s', point: 'Production CI/CD: Prevents PATH collisions where global system binaries silently execute incorrect Python or Django versions in deployment containers.' }
        ],
        spokenScript: `"In a production backend environment, we strictly isolate Django inside a dedicated virtual environment using venv, poetry, or containerized Docker builds, locking exact dependency versions in requirements.txt or poetry.lock. We verify the installed version with 'python -m django --version'.\n\nWe prefer 'python -m' over standalone 'django-admin' because 'python -m django' explicitly invokes the Python interpreter and virtualenv currently active in the shell session. Standalone CLI binaries like 'django-admin' resolve via the system PATH and frequently point to the host OS Python version, causing insidious environment drift, missing library errors, or migration failures in CI/CD build pipelines."`,
        buzzwords: ['Virtualenv isolation', 'Deterministic CI/CD builds', 'sys.path resolution', 'Interpreter binding', 'Version pinning'],
        juniorMistake: 'Installing Django globally with sudo pip install or relying on untracked django-admin binaries that point to host OS Python.'
      };
    }

    // Q2: Project vs App Architecture
    if (titleLower.includes('project and app') || titleLower.includes('startproject') || qId === 2) {
      return {
        prompt: 'How do you explain the architectural difference between a Django Project and a Django App to an engineer joining your backend team?',
        framework: [
          { time: '0-15s', point: 'Project = Deployment Container: Holds global configuration (settings, root urls, WSGI/ASGI, middleware).' },
          { time: '15-45s', point: 'App = Modular Domain: Encapsulates models, business logic, serializers, and migrations for a single bounded context.' },
          { time: '45-60s', point: 'Architectural Hygiene: Keeps business domains decoupled and registered in INSTALLED_APPS, preventing monolithic spaghetti.' }
        ],
        spokenScript: `"In Django architecture, a Project represents the entire web application container, whereas an App represents a modular, self-contained business domain. The Project holds global infrastructure: settings.py, root urls.py, middleware chains, database connection routing, and WSGI/ASGI entrypoints. An App encapsulates a single bounded context—such as authentication, payments, or orders—containing its own models, views, serializers, and migrations.\n\nStoring all code directly in the project root creates an unmaintainable monolithic ball of mud. Breaking business logic into discrete apps follows the Single Responsibility Principle, enables parallel team ownership, and allows components to be reused or extracted into microservices cleanly."`,
        buzzwords: ['Container vs Domain module', 'Bounded context', 'Single Responsibility Principle', 'INSTALLED_APPS registry', 'Modular architecture'],
        juniorMistake: 'Treating Django like a single-script framework and dumping all models, views, and routes into the root project directory.'
      };
    }

    // Q3: Runserver vs Production WSGI
    if (titleLower.includes('runserver') || qId === 3) {
      return {
        prompt: 'Why must "python manage.py runserver" never be exposed to production traffic? Describe the complete production deployment architecture for a Django API.',
        framework: [
          { time: '0-15s', point: 'runserver Limitations: Single-threaded, unhardened against exploits, lacks process supervision, StatReloader wastes CPU.' },
          { time: '15-45s', point: 'WSGI/ASGI Layer: Deploy with Gunicorn or Uvicorn using a pre-fork worker pool scaled to CPU cores (2 * cores + 1).' },
          { time: '45-60s', point: 'Reverse Proxy: Place Nginx or CloudFront upfront for TLS termination, slow-client buffering, and static/media asset offloading.' }
        ],
        spokenScript: `"Django's runserver is strictly a development server designed for local iteration with hot file reloading via StatReloader. It is single-process, unhardened against security exploits, cannot handle concurrent socket I/O under load, and wastes CPU monitoring file changes.\n\nIn production, we deploy Django using an industrial WSGI/ASGI server like Gunicorn or Uvicorn, configuring a pre-fork worker pool sized around 2 to 4 workers per CPU core. In front of Gunicorn, we position a reverse proxy such as Nginx or AWS CloudFront. The reverse proxy handles TLS termination, buffers slow clients, enforces rate limiting, and offloads static and media files directly from disk or S3 without consuming expensive Python worker threads."`,
        buzzwords: ['Pre-fork worker model', 'StatReloader CPU overhead', 'Gunicorn / Uvicorn', 'Nginx reverse proxy', 'TLS termination & slow-client buffering'],
        juniorMistake: 'Thinking runserver --noreload is acceptable for a staging or production server.'
      };
    }
  }

  // --- GENERIC STRUCTURED SENIOR SCRIPT FOR ALL OTHER QUESTIONS ---
  const cleanedTitle = question.title.replace(/\?$/, '');
  return {
    prompt: `Imagine you are in an interview for a Senior Backend Engineer position. The interviewer asks: "Can you walk me through ${cleanedTitle}? How does it work under the hood, what edge cases have you encountered in production, and how do you optimize it for high throughput?"`,
    framework: [
      { time: '0-15s', point: `Core Definition & Purpose: Clearly define ${cleanedTitle} and what backend engineering problem it solves.` },
      { time: '15-45s', point: `Mechanism & Trade-offs: Explain the runtime execution model, memory layout, and SQL/I/O implications.` },
      { time: '45-60s', point: `Production Best Practices: Outline senior guidelines, failure modes under load, and junior pitfalls to avoid.` }
    ],
    spokenScript: `"When addressing ${cleanedTitle} in a production environment, I approach it from three angles: correctness, runtime complexity, and operational reliability.\n\nAt its core, ${question.summary || cleanedTitle}.\n\nUnder the hood, we have to consider resource utilization: how this affects CPU cycles, memory allocation, and database query latency. A common junior mistake is assuming default framework behaviors work seamlessly at scale without checking execution profiles or indexing.\n\nIn our production architecture, we ensure this is covered with unit tests, monitored via APM traces, and guarded against race conditions or resource leaks."`,
    buzzwords: ['Runtime complexity', 'Resource allocation', 'APM tracing', 'O(1) / O(N) trade-offs', 'Production resilience'],
    juniorMistake: 'Providing a superficial textbook answer without mentioning production trade-offs, concurrency, or performance under scale.'
  };
}

