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

// Developer documentation specifications, commands, parameter tables, and admonitions matching https://developers.facia.ai/mobile/sdks/
export function getQuestionDocSpecs(trackId, question) {
  if (!question) return null;

  const titleLower = (question.title || '').toLowerCase();
  const qId = question.id;

  // --- PYTHON TRACK DOC SPECS ---
  if (trackId === 'python') {
    // Q1: List vs Tuple
    if (titleLower.includes('list and tuple') || titleLower.includes('list vs tuple') || qId === 1) {
      return {
        overview: 'In Python, lists and tuples are fundamental sequence data structures with distinctly different mutability guarantees, internal CPython memory allocations, and dictionary key hashability. Lists are mutable dynamic arrays designed for runtime modifications, whereas tuples are immutable fixed-length records optimized for data safety and garbage collection efficiency.',
        commands: [
          {
            label: 'Test Mutability Semantics',
            cmd: `a = [1, 2]\nb = (1, 2)\n\n# Lists allow in-place mutations\na.append(3)   # Succeeds -> [1, 2, 3]\n\n# Tuples forbid mutation (AttributeError)\n# b.append(3) -> AttributeError: 'tuple' object has no attribute 'append'`,
            lang: 'python',
            description: 'Demonstrating mutability: lists allocate extra memory to allow in-place append operations, while tuples enforce read-only integrity.'
          },
          {
            label: 'Dictionary Key Hashability Test',
            cmd: `# Tuple as Dict Key (Valid)\ncache = {(10.5, 20.3): "GPS_COORDINATES"}\nprint("Tuple Key Success:", cache[(10.5, 20.3)])\n\n# List as Dict Key (Fails with TypeError)\ntry:\n    invalid = {[1, 2]: "ITEM"}\nexcept TypeError as err:\n    print("List Key Error:", err) # unhashable type: 'list'`,
            lang: 'python',
            description: 'Hashability verification: Dictionary keys in Python require a permanent __hash__() value. Only immutable types like tuples can be hashed.'
          }
        ],
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
            content: "While tuples are immutable containers, a tuple containing a mutable object (e.g. `t = (1, [2, 3])`) is NOT hashable! Running `hash(t)` raises `TypeError: unhashable type: 'list'` because tuple hashing recursively evaluates the hash of every inner element."
          }
        ]
      };
    }

    // Q2: Decorators
    if (titleLower.includes('decorator') || qId === 2) {
      return {
        overview: 'A decorator in Python is a design pattern and language syntactic construct that allows you to dynamically inject cross-cutting behavior (such as request latency metrics, JWT authentication, caching, or database transaction retries) around a function without altering its core source code. Under the hood, decorators are higher-order functions evaluated at module import time.',
        commands: [
          {
            label: 'Production Performance Decorator',
            cmd: `import time\nfrom functools import wraps\n\ndef track_latency(func):\n    @wraps(func)  # Critical: preserves __name__, __doc__, and type signatures\n    def wrapper(*args, **kwargs):\n        start_time = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed_ms = (time.perf_counter() - start_time) * 1000\n        print(f"[METRIC] {func.__name__} executed in {elapsed_ms:.2f}ms")\n        return result\n    return wrapper\n\n@track_latency\ndef process_payment(amount: float):\n    """Simulates payment gateway call."""\n    time.sleep(0.05)\n    return {"status": "success", "amount": amount}`,
            lang: 'python',
            description: 'Standard production wrapper pattern with @functools.wraps for APM tracing and introspection preservation.'
          }
        ],
        table: {
          headers: ['Decorator Component', 'Type', 'Execution Timing', 'Architectural Purpose'],
          rows: [
            ['`@decorator` Syntax', 'Syntactic Sugar', 'Module Import Time', 'Translates literally to `func = decorator(func)` when the file is imported by Python.'],
            ['`@functools.wraps`', 'Introspection Helper', 'Wrapper Definition Time', 'Copies `__name__`, `__doc__`, and function annotations to prevent wrapper masking.'],
            ['`*args, **kwargs`', 'Variadic Arguments', 'Invocation Time', 'Ensures the wrapper accepts any number of positional or keyword arguments dynamically.'],
            ['`return result`', 'Return Pass-Through', 'Invocation Time', 'Ensures the decorated function return payload passes seamlessly to the caller.']
          ]
        },
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
        ]
      };
    }

    // Q3: Comprehensions vs Generators
    if (titleLower.includes('comprehension') || titleLower.includes('generator') || qId === 3) {
      return {
        overview: 'List comprehensions provide a concise syntax for eagerly constructing and materializing collections into memory. Generator expressions use an identical syntax enclosed in parentheses to evaluate items lazily on demand using the Python iterator protocol (`__iter__` and `__next__`), maintaining constant O(1) memory overhead regardless of stream size.',
        commands: [
          {
            label: 'Memory Footprint Comparison',
            cmd: `import sys\n\n# Eager List Comprehension: Materializes 1,000,000 items in RAM immediately\neager_list = [x ** 2 for x in range(1_000_000)]\nprint(f"List Memory: {sys.getsizeof(eager_list):,} bytes (~8.4 MB)")\n\n# Lazy Generator Expression: Yields items on demand with constant RAM\nlazy_gen = (x ** 2 for x in range(1_000_000))\nprint(f"Generator Memory: {sys.getsizeof(lazy_gen):,} bytes (~192 bytes)")`,
            lang: 'python',
            description: 'Measuring RAM consumption between eager heap allocation and lazy generator streaming.'
          }
        ],
        table: {
          headers: ['Metric', 'List Comprehension `[...]`', 'Generator Expression `(...)`', 'Backend Production Decision'],
          rows: [
            ['Evaluation Strategy', 'Eager: creates entire collection in RAM upfront', 'Lazy: computes items one at a time on demand', 'Use generators for database streaming and large file I/O.'],
            ['Memory Complexity', 'O(N) heap memory allocation', 'O(1) constant memory (~192 bytes)', 'Generators prevent Out-Of-Memory (OOM) Kubernetes container kills.'],
            ['Pass Characteristics', 'Multi-pass: can iterate repeatedly; supports len()', 'Single-pass: exhausted once consumed', 'Convert to list only if multiple passes or random indexing are required.'],
            ['Random Access', 'Supports indexing `lst[100]` and slicing `lst[10:20]`', 'No indexing: must advance sequentially via next()', 'Use comprehensions for small lookup tables and finite sets.']
          ]
        },
        admonitions: [
          {
            type: 'note',
            title: 'Django ORM Cursor Streaming (.iterator())',
            content: 'In Django backends, chaining large QuerySets into a list comprehension evaluates all database rows into Python objects at once. Use `queryset.iterator(chunk_size=2000)` to stream records as a generator pipeline.'
          },
          {
            type: 'warning',
            title: 'Generator Exhaustion Warning',
            content: 'Generators can only be read once. Once the stream finishes, subsequent loops will silently yield 0 items without throwing an error.'
          }
        ]
      };
    }
  }

  // --- DJANGO TRACK DOC SPECS ---
  if (trackId === 'django') {
    // Q1: Django Install & Version
    if (titleLower.includes('install') || titleLower.includes('version') || qId === 1) {
      return {
        overview: 'Django is distributed as a standard Python package via PyPI. In production engineering workflows, Django dependencies must be pinned and isolated within a dedicated virtual environment or Docker image to prevent environment drift, OS library contamination, and PATH resolution collisions.',
        commands: [
          {
            label: 'Clean Environment Installation',
            cmd: `# 1. Initialize isolated virtual environment\npython3 -m venv .venv\n\n# 2. Activate environment\nsource .venv/bin/activate  # On Linux/macOS\n# .venv\\Scripts\\activate   # On Windows\n\n# 3. Install pinned Django release\npip install "django>=5.1,<5.2"`,
            lang: 'bash',
            description: 'Step-by-step setup in a clean virtual environment.'
          },
          {
            label: 'Deterministic Version Check',
            cmd: `python -m django --version`,
            lang: 'bash',
            description: 'Verifies the Django version bound directly to the active Python interpreter on sys.path.'
          }
        ],
        table: {
          headers: ['Command / Method', 'Target Environment', 'Execution Binding', 'Why It Matters'],
          rows: [
            ['`python -m django --version`', 'Active Virtualenv', 'Explicitly binds to current Python `sys.path`', 'Guarantees execution using the active virtual environment, avoiding PATH collisions.'],
            ['`django-admin --version`', 'System PATH binary', 'Resolves to first executable in PATH', 'Can silently invoke host OS Python version in CI/CD build scripts.'],
            ['`django.get_version()`', 'Python Interactive Shell', 'Programmatic import inspection', 'Allows version gating inside startup checks and settings.py.']
          ]
        },
        admonitions: [
          {
            type: 'note',
            title: 'Virtual Environment Isolation Rule',
            content: 'Never run `pip install` with global sudo permissions. Always verify your virtualenv is active by checking `which python`, which should output a path inside `.venv/bin/python`.'
          },
          {
            type: 'tip',
            title: 'Deterministic Dependency Manifests',
            content: 'Lock exact package versions using `pip freeze > requirements.txt` or `poetry.lock` to guarantee identical builds between development machines and production Kubernetes pods.'
          }
        ]
      };
    }

    // Q2: Project vs App Architecture
    if (titleLower.includes('project and app') || titleLower.includes('startproject') || qId === 2) {
      return {
        overview: 'Django enforces a modular, domain-driven container architecture. A Django "Project" represents the entire web application container (configuration, settings, database routing, middleware), whereas an "App" is a decoupled, reusable Python package that handles a single business domain (such as accounts, orders, or billing).',
        commands: [
          {
            label: 'Initialize Project & App Scaffolding',
            cmd: `# 1. Create root project container\ndjango-admin startproject config .\n\n# 2. Generate decoupled domain app\npython manage.py startapp accounts`,
            lang: 'bash',
            description: 'Scaffolding the deployment container and modular business app.'
          },
          {
            label: 'Register App in settings.py',
            cmd: `# config/settings.py\nINSTALLED_APPS = [\n    'django.contrib.admin',\n    'django.contrib.auth',\n    'django.contrib.contenttypes',\n    'django.contrib.sessions',\n    'django.contrib.messages',\n    'django.contrib.staticfiles',\n    \n    # Modular Domain Apps\n    'accounts.apps.AccountsConfig',\n]`,
            lang: 'python',
            description: 'Registering the app with Django app registry so models and migrations are discovered.'
          }
        ],
        table: {
          headers: ['Architectural Entity', 'Scope & Role', 'Key Files Included', 'Responsibility'],
          rows: [
            ['Django Project', 'Global Deployment Container', '`settings.py`, `urls.py`, `wsgi.py`, `asgi.py`', 'Houses database credentials, middleware chains, root URLconf, and WSGI deployment hooks.'],
            ['Django App', 'Domain Business Module', '`models.py`, `views.py`, `serializers.py`, `migrations/`', 'Encapsulates a bounded context following the Single Responsibility Principle.'],
            ['`INSTALLED_APPS`', 'Django App Registry', '`config/settings.py`', 'Determines which modules are scanned by the ORM, migration engine, and template loaders.']
          ]
        },
        admonitions: [
          {
            type: 'tip',
            title: 'Single Responsibility Principle',
            content: 'Keep apps focused on a single business domain. If your `accounts` app handles both user profiles and Stripe payments, split billing out into a separate `billing` app.'
          },
          {
            type: 'caution',
            title: 'Avoid Monolithic Root Code',
            content: 'Never place model classes or domain business logic directly in the project configuration folder (`config/`). Models must reside within registered apps to generate database migrations properly.'
          }
        ]
      };
    }

    // Q3: Runserver vs Production WSGI
    if (titleLower.includes('runserver') || qId === 3) {
      return {
        overview: 'The `manage.py runserver` command starts a lightweight development server designed specifically for local testing and debugging with automatic file reloading (`StatReloader`). It is single-process and unhardened against security vulnerabilities, making it entirely unsuitable for staging or production traffic.',
        commands: [
          {
            label: 'Local Development Server',
            cmd: `python manage.py runserver 127.0.0.1:8000`,
            lang: 'bash',
            description: 'Starts local testing server with hot reloading.'
          },
          {
            label: 'Production WSGI Invocation (Gunicorn)',
            cmd: `# Launch production application server with pre-forked workers\ngunicorn config.wsgi:application \\\n  --bind 0.0.0.0:8000 \\\n  --workers 4 \\\n  --timeout 60 \\\n  --access-logfile -`,
            lang: 'bash',
            description: 'Industrial application server configured for multi-core concurrency.'
          }
        ],
        table: {
          headers: ['Architecture Layer', 'Technology', 'Concurrency Model', 'Key Production Responsibility'],
          rows: [
            ['Development Server', '`manage.py runserver`', 'Single-threaded with StatReloader', 'Local developer testing only; auto-reloads on source code changes.'],
            ['WSGI / ASGI Server', 'Gunicorn / Uvicorn', 'Pre-fork worker pool (`(2 * CPU cores) + 1`)', 'Manages concurrent Python worker processes, handles request timeouts, and restarts dead workers.'],
            ['Reverse Proxy', 'Nginx / CloudFront', 'Asynchronous event-driven socket I/O', 'Terminates TLS/SSL, buffers slow clients, and serves static/media files directly from disk or S3.']
          ]
        },
        admonitions: [
          {
            type: 'warning',
            title: 'Security & Concurrency Warning',
            content: '`runserver` has not undergone security audits. Running it in production exposes your backend to Denial of Service (DoS) attacks, memory leaks, and CPU exhaustion.'
          },
          {
            type: 'tip',
            title: 'Production Worker Sizing Rule',
            content: 'For Gunicorn deployments, the recommended worker process formula is `(2 * CPU Cores) + 1` to ensure worker processes remain available while others wait on database I/O.'
          }
        ]
      };
    }
  }

  // --- GENERIC STRUCTURED DOC SPECS FOR ALL OTHER QUESTIONS ---
  const cleanedTitle = question.title.replace(/\?$/, '');
  return {
    overview: `In backend engineering, ${cleanedTitle} is a critical concept for building reliable, performant services. ${question.summary || 'Review its implementation, complexity trade-offs, and runtime behavior in a clean environment.'}`,
    commands: [
      {
        label: 'Verification & Execution Snippet',
        cmd: question.tip ? question.tip : `# Testing: ${cleanedTitle}\nprint("Verifying ${cleanedTitle}")`,
        lang: trackId === 'python' ? 'python' : 'bash',
        description: `Run this snippet in an interactive shell or REPL to observe standard runtime behavior.`
      }
    ],
    table: {
      headers: ['Concept / Attribute', 'Technical Specification', 'Runtime Impact', 'Senior Recommendation'],
      rows: [
        ['Core Mechanism', question.title, 'Determines memory and CPU resource utilization', 'Profile behavior under simulated production load.'],
        ['Execution Scope', trackId === 'python' ? 'Python Runtime / CPython Memory' : 'Django Framework & ORM Execution', 'Directly influences API response latency and query count', 'Keep operations deterministic and guard against race conditions.'],
        ['Production Best Practice', 'Unit Testing & APM Monitoring', 'Prevents regressions and memory leaks', 'Write automated tests and monitor execution traces in APM dashboards.']
      ]
    },
    admonitions: [
      {
        type: 'tip',
        title: 'Senior Interview Strategy',
        content: `When asked about "${cleanedTitle}", always articulate: 1) What problem it solves, 2) The underlying runtime mechanism, 3) Edge cases and failure modes under high load, and 4) How to optimize or cache it in production.`
      },
      {
        type: 'note',
        title: 'Clean Environment Setup',
        content: `Always run code tests in an isolated virtual environment (` + (trackId === 'python' ? 'python3 -m venv .venv' : 'poetry or venv') + `) with pinned package versions.`
      }
    ]
  };
}


