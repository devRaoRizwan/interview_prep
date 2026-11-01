// Curated interview coding challenges, interviewer follow-up trap questions, and interactive practice sandbox links

export const SANDBOX_LINKS = {
  python: 'https://onecompiler.com/python',
  django: 'https://docs.djangoproject.com/en/stable/',
  postgres: 'https://onecompiler.com/postgresql',
  regex: 'https://regex101.com/',
  pythonDocs: 'https://docs.python.org/3/',
};

// Map question concepts to practical interview coding tasks and interviewer follow-up questions
export function getQuestionChallenge(trackId, question) {
  if (!question) return null;

  const titleLower = (question.title || '').toLowerCase();
  const summaryLower = (question.summary || '').toLowerCase();

  // Python Track Challenges
  if (trackId === 'python') {
    if (titleLower.includes('list and tuple') || titleLower.includes('list vs tuple')) {
      return {
        task: 'Open your terminal/REPL: 1) Try using a list as a dictionary key: `d = {[1, 2]: "val"}`. Observe the TypeError. 2) Try using a tuple: `d = {(1, 2): "val"}`. 3) What happens if the tuple contains a list: `t = (1, [2, 3])`? Can it be a dict key?',
        followUp: 'Why is a tuple with a list inside it not hashable even though tuples are immutable? (Answer: All elements inside the tuple must also be hashable for hash(t) to work).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Python REPL & Memory'
      };
    }
    if (titleLower.includes('decorator')) {
      return {
        task: 'Write a decorator `@timer` from scratch that uses `time.perf_counter()` to measure and print the execution time of any function. Apply it to a function that sums 1,000,000 numbers.',
        followUp: 'Why MUST you use `@functools.wraps(func)` inside your decorator? What happens to `func.__name__` and `func.__doc__` if you omit it?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Decorator Implementation'
      };
    }
    if (titleLower.includes('comprehension')) {
      return {
        task: 'Given a list of words `["apple", "banana", "cherry"]`, write: 1) A list comprehension of their lengths, 2) A dict comprehension mapping each word to its uppercase version, 3) Compare memory usage with a generator expression `(len(w) for w in words)`.',
        followUp: 'When would you prefer a generator expression `(...)` over a list comprehension `[...]`? (Answer: When dealing with large streams/files to avoid loading everything into RAM).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Comprehensions & Generators'
      };
    }
    if (titleLower.includes('memory management')) {
      return {
        task: 'Import `sys` and check reference counts: `a = [1, 2, 3]`; print `sys.getrefcount(a)`. Then assign `b = a` and print again. Create a circular reference: `a.append(a)` and explain how garbage collection handles it.',
        followUp: 'Why can reference counting alone fail to reclaim memory? What role does the Generational Cyclic Garbage Collector play in Python?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Memory & GC Internals'
      };
    }
    if (titleLower.includes('generator') || titleLower.includes('iterator')) {
      return {
        task: 'Write an infinite Fibonacci generator function using `yield`. In a loop, extract the first 10 Fibonacci numbers using `next()` or `itertools.islice`.',
        followUp: 'What built-in exception is raised when an iterator exhausts all its items in a for loop? (Answer: StopIteration).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Yield & Next Protocols'
      };
    }
    if (titleLower.includes('__init__') || titleLower.includes('init')) {
      return {
        task: 'Create a class `DatabaseConnection` that implements the Singleton pattern using `__new__` so only one instance is ever created, and `__init__` sets the host.',
        followUp: 'What is the exact distinction between `__new__` and `__init__` in Python object creation? Which one actually returns the instance?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'OOP Dunder Methods'
      };
    }
    if (titleLower.includes('mutable') || titleLower.includes('inbuilt data types')) {
      return {
        task: 'Write a function `def append_item(val, items=[]): items.append(val); return items`. Call it 3 times without passing the second argument. Notice the bug! Fix it using `items=None`.',
        followUp: 'Why does Python evaluate default arguments at function definition time rather than at execution time?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Mutable Default Trap'
      };
    }
    if (titleLower.includes('args') && titleLower.includes('kwargs')) {
      return {
        task: 'Write a function `debug_log(*args, prefix="[LOG]", **kwargs)` that prints the positional arguments and kwargs formatted nicely. Call it forwarding arguments from another wrapper.',
        followUp: 'How do you force a parameter to be keyword-only in Python 3? (Answer: Using a bare `*` in the signature, e.g., `def fn(a, b, *, timeout=10):`).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Signatures & Unpacking'
      };
    }
    if (titleLower.includes('pickling') || titleLower.includes('pickle')) {
      return {
        task: 'Create a custom Python class instance, serialize it to bytes with `pickle.dumps()`, and reconstruct it with `pickle.loads()`. Print the recovered object.',
        followUp: 'Why is `pickle` considered dangerous for loading untrusted API request payloads? What format should you use instead? (Answer: Arbitrary code execution via `__reduce__`; use JSON/protobuf).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Serialization Security'
      };
    }
    if (titleLower.includes('exception')) {
      return {
        task: 'Write a division function with `try`, `except ZeroDivisionError`, `else` (runs only when no exception occurs), and `finally` (always runs for cleanup).',
        followUp: 'When does the `else` block execute in Python exception handling, and why is it cleaner than putting code inside the `try` block?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Exception Handling'
      };
    }
    if (titleLower.includes('gil') || titleLower.includes('multiprocessing') || titleLower.includes('multithreading')) {
      return {
        task: 'Explain why a CPU-heavy loop running on 4 Python threads will NOT run 4x faster on a 4-core machine, but 4 threads downloading web pages (I/O bound) will show huge speedups.',
        followUp: 'How do you achieve true parallel CPU execution across multiple cores in Python? (Answer: Use `multiprocessing` or `concurrent.futures.ProcessPoolExecutor`).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Concurrency & The GIL'
      };
    }
    if (titleLower.includes('diamond') || titleLower.includes('multiple inheritance')) {
      return {
        task: 'Create classes `A`, `B(A)`, `C(A)`, and `D(B, C)`. Add a method `ping()` in each. Instantiate `D` and call `d.ping()`. Print `D.__mro__` to inspect the resolution order.',
        followUp: 'What algorithm does Python 3 use to resolve Method Resolution Order (MRO)? (Answer: C3 Linearization).',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'MRO & OOP Inheritance'
      };
    }
    if (titleLower.includes('shallow') || titleLower.includes('deep copy')) {
      return {
        task: 'Create a nested list `original = [[1, 2], [3, 4]]`. Make a shallow copy with `copy.copy(original)` and deep copy with `copy.deepcopy(original)`. Modify `original[0][0] = 99`. Observe what changed in each.',
        followUp: 'What is the performance difference between shallow copy and deep copy on a complex graph of objects?',
        replLink: 'https://onecompiler.com/python',
        practiceType: 'Object Copying'
      };
    }
  }

  // Django Track Challenges
  if (trackId === 'django') {
    if (titleLower.includes('install') || titleLower.includes('version')) {
      return {
        task: 'In your terminal, create an isolated virtual environment: `python3 -m venv venv && source venv/bin/activate`. Install Django: `pip install django`. Check version with `python -m django --version`.',
        followUp: 'Why is it critical to use `python -m django --version` instead of just running `django-admin`? (Answer: Ensures you are using the specific Python environment interpreter).',
        replLink: 'https://docs.djangoproject.com/en/stable/intro/install/',
        practiceType: 'Virtualenv & CLI Setup'
      };
    }
    if (titleLower.includes('startproject') || titleLower.includes('project and app')) {
      return {
        task: 'Explain the folder structure created by `django-admin startproject config .` vs `python manage.py startapp core`. Identify where settings, urls, and models live.',
        followUp: 'Can a single Django app be reused across multiple Django projects? What makes an app truly decoupled?',
        replLink: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
        practiceType: 'Architecture & Modularity'
      };
    }
    if (titleLower.includes('migrations') || titleLower.includes('migration')) {
      return {
        task: 'Add a new field `is_verified = models.BooleanField(default=False)` to a model. Run `makemigrations`. Inspect the generated migration file and explain how `sqlmigrate app 0002` displays raw SQL.',
        followUp: 'How does Django track which migrations have been applied? (Answer: The `django_migrations` table in your database schema).',
        replLink: 'https://docs.djangoproject.com/en/stable/topics/migrations/',
        practiceType: 'Database Schema Evolution'
      };
    }
    if (titleLower.includes('select_related') || titleLower.includes('prefetch_related')) {
      return {
        task: 'Write the QuerySet for an `Order` model that has a ForeignKey to `User` and a ManyToMany to `Product`: `Order.objects.select_related("user").prefetch_related("products").all()`.',
        followUp: 'What happens if you use `select_related` on a ManyToManyField? (Answer: Django raises an error because a single SQL JOIN would create massive duplicate row explosion).',
        replLink: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related',
        practiceType: 'QuerySet Optimization (N+1)'
      };
    }
    if (titleLower.includes('filter') || titleLower.includes('get') || titleLower.includes('all')) {
      return {
        task: 'Write a safe lookup: Compare `User.objects.get(id=999)` (raises `DoesNotExist`) with `User.objects.filter(id=999).first()` (returns `None`).',
        followUp: 'What exception is raised by `get()` if the database finds two matching records? (Answer: `MultipleObjectsReturned`).',
        replLink: 'https://docs.djangoproject.com/en/stable/topics/db/queries/',
        practiceType: 'Safe Querying & Exceptions'
      };
    }
    if (titleLower.includes('csrf')) {
      return {
        task: 'Explain the CSRF token flow: How the cookie is set, why `<form>` must contain `{% csrf_token %}`, and how JavaScript SPAs send `X-CSRFToken` in request headers.',
        followUp: 'Why are GET requests exempt from CSRF protection while POST, PUT, DELETE require validation? (Answer: Safe methods must not modify server state).',
        replLink: 'https://docs.djangoproject.com/en/stable/ref/csrf/',
        practiceType: 'Security & Web Tokens'
      };
    }
    if (titleLower.includes('q object') || titleLower.includes('q objects')) {
      return {
        task: 'Write a QuerySet that finds products where: `(price < 100 OR is_discounted=True) AND in_stock=True` using `Q` objects: `Product.objects.filter((Q(price__lt=100) | Q(is_discounted=True)) & Q(in_stock=True))`.',
        followUp: 'How do you perform a NOT condition with Q objects? (Answer: Use the tilde operator `~Q(is_active=False)`).',
        replLink: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#complex-lookups-with-q-objects',
        practiceType: 'Complex SQL Filter Logic'
      };
    }
    if (titleLower.includes('middleware')) {
      return {
        task: 'Write a custom Django middleware class `RequestTimingMiddleware` that computes how many milliseconds each HTTP request took and adds an `X-Response-Time` header to the response.',
        followUp: 'In what order are middlewares executed during the request phase vs the response phase? (Answer: Top-to-bottom on incoming requests, bottom-to-top on outgoing responses).',
        replLink: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/',
        practiceType: 'Middleware Pipeline'
      };
    }
    if (titleLower.includes('caching') || titleLower.includes('cache')) {
      return {
        task: 'Write code using the low-level cache API: `from django.core.cache import cache`. Check if a key exists with `cache.get("top_users")`, compute it if missing, and save it with `cache.set(key, data, timeout=300)`.',
        followUp: 'What is a "cache stampede" and how does setting staggered timeouts or using locks prevent it when cached data expires?',
        replLink: 'https://docs.djangoproject.com/en/stable/topics/cache/',
        practiceType: 'Caching Strategies'
      };
    }
  }

  // Fallback engaging challenge
  return {
    task: `Open your local terminal or Python environment. Write a self-contained code snippet demonstrating ${question.title}. Test edge cases with invalid or empty input.`,
    followUp: `If an interviewer asks you: "How would you optimize this under high traffic or large datasets?", what would your immediate technical response be?`,
    replLink: trackId === 'python' ? 'https://onecompiler.com/python' : 'https://docs.djangoproject.com/en/stable/',
    practiceType: 'Core Practical Exercise'
  };
}

