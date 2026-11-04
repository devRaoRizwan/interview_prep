// Django Days 16 to 18 (Questions 46 to 54)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const DJANGO_DAYS_16_TO_18 = {
  // Q46: Why does Django use regular expressions for URLs?
  46: {
    id: 46,
    docSpecs: {
      overview: 'Historically (prior to Django 2.0), Django relied exclusively on Regular Expressions (`django.conf.urls.url`) to route URLs because regex provided complete flexibility for capturing arbitrary string patterns. Since Django 2.0, standard URL routing uses the simplified `path()` syntax with built-in typed path converters (e.g. `<int:id>`, `<slug:slug>`, `<uuid:pk>`). Regex routing is preserved via `re_path()` but is strictly optional and reserved for complex matching requirements like non-standard date formats or regex lookaheads.',
      table: {
        headers: ['Routing Method', 'Syntax & Pattern Matching', 'Type Conversion', 'Maintainability & Safety', 'Best Production Use Case'],
        rows: [
          ['path()', 'Clean human-readable syntax: `<converter:name>`', 'Automatic type casting (int, uuid, slug)', 'High; self-documenting, less prone to ReDoS bugs', '95%+ of standard web and API routes'],
          ['re_path()', 'Raw regex: `r"^articles/(?P<year>[0-9]{4})/$"`', 'None by default (returns raw strings)', 'Requires strict regex auditing; risk of backtracking', 'Legacy routes, optional groups, fine-grained regex matching'],
          ['Custom Converter', '`register_converter(CustomConverter, "name")`', 'Custom Python type conversion + regex matching', 'High; encapsulates complex regex in a reusable class', 'Domain-specific identifiers (e.g. `<order_no:code>`)']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Custom Path Converters Over re_path',
          content: 'Instead of scattering unreadable regular expressions across `urls.py`, encapsulate complex regex into a custom Path Converter using `register_converter()`. This provides strong type checking and clean URL patterns throughout your project.'
        },
        {
          type: 'caution',
          title: 'ReDoS: Regular Expression Denial of Service',
          content: 'When writing `re_path()`, never use unanchored, deeply nested quantifier expressions (e.g. `r"^(a+)+$"`). Malicious clients can send strings that trigger catastrophic regex backtracking, causing the Python worker thread to spike CPU to 100% and hang indefinitely.'
        }
      ],
      commands: [
        {
          label: 'Modern URL Routing: path(), Custom Converters, and re_path()',
          cmd: `from django.urls import path, re_path, register_converter

# 1. Custom Path Converter for 4-digit fiscal years
class FourDigitYearConverter:
    regex = '[0-9]{4}'
    def to_python(self, value):
        return int(value)
    def to_url(self, value):
        return f"{value:04d}"

register_converter(FourDigitYearConverter, 'yyyy')

urlpatterns = [
    # Modern clean path with custom converter
    path('reports/<yyyy:fiscal_year>/', lambda r, fiscal_year: None, name='report_year'),
    
    # Modern clean path with built-in converter
    path('users/<int:pk>/profile/', lambda r, pk: None, name='user_profile'),

    # re_path for legacy regex backward compatibility
    re_path(r'^archive/(?P<slug>[a-z0-9-]+)/(?:page-(?P<page>\\d+)/)?$', lambda r, slug, page=1: None, name='archive'),
]`,
          lang: 'python',
          description: 'Production routing comparing path(), custom path converters, and re_path().'
        }
      ],
      didYouKnow: {
        title: '💡 Built-in Path Converters',
        content: 'Django provides 5 built-in path converters out of the box: `str` (non-empty string excluding `/`), `int` (positive integers), `slug` (ASCII letters, numbers, hyphens, underscores), `uuid` (standard UUID format), and `path` (any non-empty string including `/`).'
      }
    },
    challenge: {
      title: 'Django URL Resolution & Path Converter Drill',
      steps: [
        'Understand the historical evolution from `url()` to `path()` and `re_path()`.',
        'Demonstrate how built-in path converters like `<int:id>` perform automatic type casting.',
        'Implement a custom path converter class with `to_python` and `to_url` methods.',
        'Analyze catastrophic backtracking risks when writing complex regular expressions in `re_path`.'
      ],
      codeSnippet: `import re

# Custom converter implementation contract
class HexColorConverter:
    regex = '[A-Fa-f0-9]{6}'
    def to_python(self, value):
        return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))
    def to_url(self, value):
        return '%02x%02x%02x' % value

converter = HexColorConverter()
match = re.match(converter.regex, "3b82f6")
if match:
    rgb = converter.to_python(match.group(0))
    print("Matched Hex String:", match.group(0))
    print("Converted to RGB Python Tuple:", rgb)
    print("Re-encoded to URL String:", converter.to_url(rgb))`,
      expectedOutput: `Matched Hex String: 3b82f6
Converted to RGB Python Tuple: (59, 130, 246)
Re-encoded to URL String: 3b82f6`,
      interviewQuestion: 'Why did Django originally use regular expressions for URL routing, and is it still necessary today? Contrast `path()` with `re_path()` and explain how Custom Path Converters work.',
      interviewAnswer: 'Historically, Django used regular expressions (`django.conf.urls.url`) because they offered unparalleled flexibility for parsing non-trivial URL patterns, capturing named positional groups, and extracting URL query parameters in early web applications.\n\nToday, it is completely unnecessary to use regular expressions for standard routing. In Django 2.0+, Django introduced `django.urls.path()`, which utilizes intuitive typed angle-bracket syntax like `path("articles/<int:year>/", views.year_archive)`. This syntax provides two major advantages over regex:\n1. Readability: Eliminates messy regex tokens and escaping (`^`, `(?P<name>...)`, `\\d+`, `$`).\n2. Automatic Type Conversion: Built-in converters (`int`, `slug`, `uuid`) automatically cast captured string tokens into native Python data types before passing them as kwargs to the view.\n\n`re_path()` is only used today when regex features—such as lookaheads or optional match groups—are strictly required. Furthermore, instead of using raw regex, Django allows developers to register custom `PathConverter` classes implementing `regex`, `to_python()`, and `to_url()`, combining clean syntax with robust regex validation.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/http/urls/#how-django-processes-a-request'
    },
    scriptData: {
      prompt: 'Why did Django use regular expressions for URLs, is it still required today, and how do modern path converters improve API routing?',
      framework: [
        { time: '0-15s', point: 'Historical Context: Django originally used regex for flexible URL parsing, but it is NO LONGER required since Django 2.0.' },
        { time: '15-45s', point: 'Modern Approach: path() uses typed path converters (int, slug, uuid) that cast values into native Python types automatically.' },
        { time: '45-60s', point: 'When to use re_path: Only for optional groups or legacy patterns; custom converters are preferred for complex validation.' }
      ],
      spokenScript: `"Historically, Django relied on regular expressions for URL routing because regex provided complete flexibility for extracting and validating named parameters from URLs. However, using regular expressions is no longer necessary in modern Django.\n\nSince Django 2.0, the framework standardizes on \`path()\`, which uses intuitive typed path converters like \`<int:id>\` or \`<slug:slug>\`. This not only makes URL configuration readable and maintainable, but it also handles automatic type casting—for example, automatically converting an integer ID string into a Python \`int\` before delivering it to your view.\n\nRegex routing is still available via \`re_path()\` for edge cases like optional matching groups or complex regex assertions. However, in modern enterprise architectures, whenever we have custom URL formats, the best practice is to write a custom Path Converter class with \`to_python\` and \`to_url\` methods and register it via \`register_converter\`. This encapsulates regex logic into a reusable, testable class while keeping route definitions clean."`
    }
  },

  // Q47: Difference between Django OneToOneField and ForeignKey Field?
  47: {
    id: 47,
    docSpecs: {
      overview: 'In Django ORM, `ForeignKey` establishes a Many-to-One relationship where multiple records in the source model can point to a single record in the target model. `OneToOneField` is conceptually identical to a `ForeignKey(..., unique=True)` with one critical architectural difference: reverse attribute resolution. In a `ForeignKey`, the reverse relationship returns a `RelatedManager` (e.g. `user.order_set.all()`). In a `OneToOneField`, the reverse relationship returns a single model instance directly (e.g. `user.profile`), and raises `RelatedObjectDoesNotExist` if no corresponding record exists.',
      table: {
        headers: ['Feature / Dimension', 'ForeignKey Field', 'OneToOneField'],
        rows: [
          ['Cardinality', 'Many-to-One (N:1)', 'One-to-One (1:1)'],
          ['Database Constraint', 'Standard Foreign Key constraint + foreign key index', 'Foreign Key constraint with `UNIQUE` constraint on the column'],
          ['Reverse Accessor Type', '`RelatedManager` returning a QuerySet (`user.orders.all()`)', 'Single Model Instance directly (`user.profile`)'],
          ['Reverse Lookup Miss', 'Returns an empty QuerySet (`user.orders.all()` is `[]`)', 'Raises `RelatedObjectDoesNotExist` exception'],
          ['Django Internal Use', 'Parent-child models (Author -> Books, Category -> Products)', 'Multi-table model inheritance (creates implicit parent_ptr) and User Profiles']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Reverse OneToOne Lookup Trap',
          content: 'When querying a reverse `OneToOneField` (e.g. `user.profile`), if the profile row has not been created yet, Django raises `user.__class__.profile.RelatedObjectDoesNotExist`! To prevent unhandled 500 exceptions, always use `getattr(user, "profile", None)` or wrap the lookup in a defensive `try/except` block.'
        },
        {
          type: 'tip',
          title: 'Model Inheritance Under the Hood',
          content: 'When you create a standard multi-table model inheritance in Django (`class Restaurant(Place)`), Django does not merge them into one table; it automatically creates a hidden `OneToOneField(Place, parent_link=True)` column named `place_ptr`.'
        }
      ],
      commands: [
        {
          label: 'Comparing ForeignKey vs OneToOneField in Django Models',
          cmd: `from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. ForeignKey (Many-to-One): A user can have many orders
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # Reverse access: user.orders.all() -> QuerySet

# 2. OneToOneField (One-to-One): A user has exactly one profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    # Reverse access: user.profile -> Profile instance (or raises RelatedObjectDoesNotExist)`,
          lang: 'python',
          description: 'Model definitions contrasting ForeignKey and OneToOneField with related_name.'
        }
      ],
      didYouKnow: {
        title: '💡 ForeignKey with unique=True vs OneToOneField',
        content: 'At the SQL level, `models.ForeignKey(..., unique=True)` creates the exact same SQL column schema as `models.OneToOneField(...)`. The only difference is Django ORM\'s reverse accessor semantics: `OneToOneField` resolves to an object, whereas `ForeignKey(unique=True)` returns a manager.'
      }
    },
    challenge: {
      title: 'Relational Descriptors: ForeignKey vs OneToOneField Drill',
      steps: [
        'Understand the database schema difference: `UNIQUE` constraint on OneToOneField.',
        'Contrast reverse relationship descriptors: `RelatedManager` vs direct instance accessor.',
        'Handle the `RelatedObjectDoesNotExist` exception when reverse OneToOne records are absent.',
        'Examine how Django\'s multi-table model inheritance relies on implicit OneToOneField pointers.'
      ],
      codeSnippet: `class MockUser:
    def __init__(self, name):
        self.name = name

# Simulating reverse lookup behavior
user = MockUser("Sarah")

# ForeignKey reverse accessor returns a collection manager
class MockOrderManager:
    def all(self):
        return ["Order #101", "Order #102"]

user.orders = MockOrderManager()
print("ForeignKey Reverse Accessor:", user.orders.all())

# OneToOneField reverse accessor returns the object directly
class MockProfile:
    bio = "Senior Backend Engineer"

user.profile = MockProfile()
print("OneToOneField Reverse Accessor:", user.profile.bio)`,
      expectedOutput: `ForeignKey Reverse Accessor: ['Order #101', 'Order #102']
OneToOneField Reverse Accessor: Senior Backend Engineer`,
      interviewQuestion: 'What is the exact technical difference between `OneToOneField` and `ForeignKey` in Django? What happens at the SQL database layer, and what happens when accessing a reverse OneToOne relationship that does not exist?',
      interviewAnswer: 'Technically and architecturally, the differences between `OneToOneField` and `ForeignKey` are:\n\n1. Database Schema Layer:\nA `ForeignKey` generates a column with a database foreign key constraint and index. A `OneToOneField` generates the exact same foreign key column, but additionally enforces a `UNIQUE` index constraint at the SQL level, ensuring no two rows can ever reference the same foreign record.\n\n2. Reverse Accessor Behavior:\n- In a `ForeignKey(User, related_name="orders")`, accessing `user.orders` returns a `RelatedManager` that yields a QuerySet (`user.orders.all()`). If no orders exist, it returns an empty QuerySet without raising an error.\n- In a `OneToOneField(User, related_name="profile")`, accessing `user.profile` returns the related model instance directly. If the related profile does not exist in the database, Django raises a `RelatedObjectDoesNotExist` exception (a subclass of `ObjectDoesNotExist`).\n\n3. Framework Internals:\n`OneToOneField` is also the foundational primitive used by Django for multi-table model inheritance, where the child table maintains an automatic `parent_ptr` OneToOneField linking to the parent table.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/fields/#onetoonefield'
    },
    scriptData: {
      prompt: 'What is the difference between OneToOneField and ForeignKey in Django, both at the SQL level and in Python ORM behavior?',
      framework: [
        { time: '0-15s', point: 'SQL Difference: OneToOneField enforces a UNIQUE constraint on the foreign key column; ForeignKey does not.' },
        { time: '15-45s', point: 'ORM Reverse Resolution: ForeignKey returns a RelatedManager QuerySet; OneToOneField returns the model instance directly.' },
        { time: '45-60s', point: 'Production Pitfall: Accessing a missing reverse OneToOneField raises RelatedObjectDoesNotExist; handle with getattr or try/except.' }
      ],
      spokenScript: `"The difference between \`ForeignKey\` and \`OneToOneField\` in Django spans both the database engine and the Python ORM layer.\n\nAt the database level, a \`ForeignKey\` represents a Many-to-One relationship. A \`OneToOneField\` is essentially a \`ForeignKey\` with an additional \`UNIQUE\` constraint on the column, guaranteeing that only a single row can ever reference a target record.\n\nIn the Python ORM, the primary difference is how the reverse relationship behaves. With a \`ForeignKey\`, accessing the reverse relationship—like \`user.orders.all()\`—returns a \`RelatedManager\` that resolves to a QuerySet. With a \`OneToOneField\`, accessing the reverse relationship—like \`user.profile\`—returns the single model instance directly.\n\nA common production pitfall with \`OneToOneField\` is that if the related row does not exist in the database, accessing \`user.profile\` raises a \`RelatedObjectDoesNotExist\` exception rather than returning \`None\`. Therefore, in defensive code, you should always check with \`hasattr(user, 'profile')\` or use \`getattr(user, 'profile', None)\`."`
    }
  },

  // Q48: Briefly explain Django Field Class and its types
  48: {
    id: 48,
    docSpecs: {
      overview: 'In Django ORM, the `Field` class (`django.db.models.Field`) is the foundational abstraction that maps a Python class attribute to a database table column. It encapsulates database column type definition, SQL constraint generation (e.g. `NOT NULL`, `UNIQUE`, `CHECK`), data serialization/deserialization between Python objects and SQL raw values, form widget generation, and data validation rules. Common field types include string fields (`CharField`, `TextField`), numerical fields (`IntegerField`, `DecimalField`), date/time fields (`DateTimeField`), relational fields (`ForeignKey`, `ManyToManyField`), and structured data fields (`JSONField`).',
      table: {
        headers: ['Django Field Class', 'PostgreSQL Column Type', 'Python Data Type', 'Key Parameters & Production Best Practice'],
        rows: [
          ['CharField', '`varchar(max_length)`', '`str`', 'Requires `max_length`. Never use `null=True` on string fields!'],
          ['TextField', '`text`', '`str`', 'Arbitrary length strings. Avoid for indexed search columns without full-text search.'],
          ['IntegerField / BigIntegerField', '`integer` / `bigint`', '`int`', 'Use `BigIntegerField` for auto-incrementing IDs and high-cardinality counters.'],
          ['DecimalField', '`numeric(max_digits, decimal_places)`', '`decimal.Decimal`', 'Always use for financial/monetary values. Avoid `FloatField` to prevent rounding errors.'],
          ['DateTimeField', '`timestamp with time zone`', '`datetime.datetime`', 'Use `auto_now_add=True` for creation timestamp, `auto_now=True` for update timestamp.'],
          ['JSONField', '`jsonb`', '`dict` / `list`', 'Supports GIN indexing and native SQL key lookups (`metadata__plan="pro"`).'],
          ['BooleanField', '`boolean`', '`bool`', 'Use `default=False` to prevent ambiguous null states in boolean logic.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The String Field null=True Anti-Pattern',
          content: 'Never set `null=True` on `CharField` or `TextField` unless you have a `unique=True` constraint! If you set `null=True`, Django allows two distinct representations for "empty": `NULL` and empty string `""`. Standard Django convention is to use `blank=True, null=False` with `default=""` so empty data is always stored consistently as an empty string.'
        },
        {
          type: 'tip',
          title: 'Currency: Always Use DecimalField, Never FloatField',
          content: 'Python floats and SQL `float` use IEEE 754 binary floating-point representation, causing precision truncation (e.g. `0.1 + 0.2 = 0.30000000000000004`). For all monetary or pricing calculations, strictly enforce `DecimalField(max_digits=12, decimal_places=2)`.'
        }
      ],
      commands: [
        {
          label: 'Production Model Schema Showcasing Diverse Field Types',
          cmd: `import uuid
from django.db import models
from django.utils import timezone

class PaymentTransaction(models.Model):
    # UUID primary key prevents ID enumeration attacks
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # String fields: null=False, default empty or required
    transaction_ref = models.CharField(max_length=64, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")

    # Financial precision: DecimalField
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    # State flag
    is_settled = models.BooleanField(default=False)

    # Native JSONB column with indexing capabilities
    metadata = models.JSONField(default=dict, blank=True)

    # Timezone-aware audit timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)`,
          lang: 'python',
          description: 'Production Django model schema highlighting best practices across core field classes.'
        }
      ],
      didYouKnow: {
        title: '💡 Field.deconstruct() Powers Migrations',
        content: 'Django\'s migration system works entirely through the `deconstruct()` method implemented on every `Field` class. It serializes any field into a 4-tuple: `(name, path, args, kwargs)`, allowing Django to detect model changes by comparing serialized states.'
      }
    },
    challenge: {
      title: 'Django Model Field Architecture & Type Casting Drill',
      steps: [
        'Understand the core methods of `models.Field`: `to_python()`, `from_db_value()`, and `get_prep_value()`.',
        'Analyze why `DecimalField` is mandatory over `FloatField` for currency.',
        'Demonstrate the architectural pitfall of using `null=True` on `CharField`.',
        'Query nested JSON keys using Django\'s native `JSONField` lookups.'
      ],
      codeSnippet: `from decimal import Decimal

# Demonstrating why DecimalField is mandatory for financial fields
float_total = 0.1 + 0.1 + 0.1
decimal_total = Decimal('0.1') + Decimal('0.1') + Decimal('0.1')

print("Float Calculation Result:  ", float_total)
print("Decimal Calculation Result:", decimal_total)
print("Are Floats Exact?", float_total == 0.3)
print("Are Decimals Exact?", decimal_total == Decimal('0.3'))`,
      expectedOutput: `Float Calculation Result:   0.30000000000000004
Decimal Calculation Result: 0.3
Are Floats Exact? False
Are Decimals Exact? True`,
      interviewQuestion: 'Briefly explain the Django Field class and its types. What is the difference between `null=True` and `blank=True`, and why should you avoid `null=True` on string fields?',
      interviewAnswer: 'In Django ORM, `models.Field` is the abstract base class that bridges Python object attributes to relational database table columns. It governs four critical layers:\n1. SQL Schema Generation: Defines column data type, constraints (`NOT NULL`, `CHECK`), and indexes.\n2. Data Conversion: Implements `to_python()` (translating raw DB values into Python types) and `get_prep_value()` (preparing Python types for database queries).\n3. Form & API Generation: Generates default form fields, widgets, and validation rules.\n4. Migration Serialization: Implements `deconstruct()` for migrations.\n\nDifference Between `null=True` and `blank=True`:\n- `null=True`: Purely database-related. It configures the column in SQL to accept `NULL` values (`NULL` vs `NOT NULL`).\n- `blank=True`: Purely validation-related. It determines whether the field is required in HTML forms, serializers, and `model.clean()` validation.\n\nWhy Avoid `null=True` on CharField/TextField:\nIf you configure `null=True, blank=True` on a string field, you introduce two distinct representations of missing data into your database: SQL `NULL` and the empty string `""`. This leads to subtle query bugs (e.g. `filter(bio="")` will miss `NULL` rows). The standard Django convention is to use `blank=True, null=False` with `default=""`, ensuring missing strings are always stored as empty strings.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/fields/'
    },
    scriptData: {
      prompt: 'Explain the Django Field class, its core types, and the crucial distinction between null=True and blank=True.',
      framework: [
        { time: '0-15s', point: 'Definition: Field classes map Python attributes to SQL columns, handling data conversion, constraints, and validation.' },
        { time: '15-45s', point: 'Core Types: CharField, TextField, DecimalField for money, DateTimeField, and native JSONField for semi-structured data.' },
        { time: '45-60s', point: 'Production Rule: null=True is database-level; blank=True is validation-level. Never use null=True on string fields.' }
      ],
      spokenScript: `"In Django, the \`Field\` class is the foundational abstraction that maps Python model attributes to underlying database columns. It dictates the SQL column type, handles bidirectional data type conversion between Python and the database driver, generates migration schemas via \`deconstruct()\`, and provides validation logic for forms and serializers.\n\nCommon field types include \`CharField\` and \`TextField\` for strings, \`DecimalField\` for exact financial arithmetic, \`DateTimeField\` for timezone-aware timestamps, and \`JSONField\` for querying semi-structured JSONB data natively in PostgreSQL.\n\nA fundamental interview topic is the distinction between \`null=True\` and \`blank=True\`. \`null=True\` is purely database-level, allowing the database column to store SQL \`NULL\`. \`blank=True\` is purely validation-level, determining whether a form or serializer accepts an empty input.\n\nAs a production rule, you should never set \`null=True\` on string fields like \`CharField\` or \`TextField\`. Doing so creates two competing representations for 'no data'—\`NULL\` and empty string \`""\`—which leads to inconsistent queries. Instead, leave \`null=False\` and use \`blank=True\` with an empty string default."`
    }
  },

  // Q49: Explain how you can use file-based sessions?
  49: {
    id: 49,
    docSpecs: {
      overview: 'File-based sessions in Django store serialized session data as individual files directly on the server\'s local filesystem rather than in a relational database or in-memory cache. Enabled by setting `SESSION_ENGINE = "django.contrib.sessions.backends.file"`, each session is written to a flat file named with the session key inside the directory specified by `SESSION_FILE_PATH`. While simple for single-server testing without database setup, file-based sessions are strongly discouraged in modern clustered production environments due to horizontal scaling limitations and disk I/O bottlenecks.',
      table: null,
      admonitions: [
        {
          type: 'caution',
          title: 'Horizontal Scaling Failure in Multi-Server Deployments',
          content: 'File-based sessions store files on local server disk! If your application runs across multiple containers, Kubernetes pods, or load-balanced EC2 instances, a user whose session was created on Server A will receive an unauthorized 401/logout when their next request hits Server B. Never use file sessions in horizontally scaled architectures!'
        },
        {
          type: 'caution',
          title: 'File System Inode Exhaustion',
          content: 'High-traffic applications generate hundreds of thousands of sessions. Storing each session as a separate file can exhaust the operating system filesystem inodes, causing the server to reject all disk writes even if gigabytes of free disk space remain.'
        }
      ],
      commands: [
        {
          label: 'Configuring File-Based Sessions in settings.py',
          cmd: `# settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Enable file-based session backend
SESSION_ENGINE = "django.contrib.sessions.backends.file"

# Specify directory where session files will be stored
SESSION_FILE_PATH = os.path.join(BASE_DIR, "var", "sessions")

# Ensure the directory exists with appropriate permissions (chmod 700)
# os.makedirs(SESSION_FILE_PATH, mode=0o700, exist_ok=True)`,
          lang: 'python',
          description: 'Settings configuration for file-based session storage.'
        }
      ],
      didYouKnow: {
        title: '💡 Permissions Requirement for SESSION_FILE_PATH',
        content: 'If the directory specified by `SESSION_FILE_PATH` is not writable by the user running the WSGI/ASGI worker process (e.g. `www-data`), Django will raise a `PermissionDenied` or `IOError` on the very first incoming request.'
      }
    },
    challenge: {
      title: 'File-Based Session Mechanics & File Descriptor Drill',
      steps: [
        'Understand how `SESSION_ENGINE = "django.contrib.sessions.backends.file"` operates.',
        'Inspect how session keys map to files on disk in `SESSION_FILE_PATH`.',
        'Analyze why shared storage (NFS) or distributed caches (Redis) replace file sessions in production.',
        'Explain the inode exhaustion failure mode when session cleanup is neglected.'
      ],
      codeSnippet: `import os
import tempfile

# Simulating file session write/read mechanics
session_dir = tempfile.mkdtemp()
session_key = "sess_09a8f7c6e5d4b3a2"
session_file = os.path.join(session_dir, session_key)

# Writing serialized session payload
with open(session_file, "w") as f:
    f.write('{"user_id": 42, "authenticated": true}')

print("Session Directory:", session_dir)
print("Session File Exists:", os.path.exists(session_file))
with open(session_file, "r") as f:
    print("Session Content Read:", f.read())

# Cleanup simulated directory
os.remove(session_file)
os.rmdir(session_dir)`,
      expectedOutput: `Session Directory: /tmp/...
Session File Exists: True
Session Content Read: {"user_id": 42, "authenticated": true}`,
      interviewQuestion: 'How do you configure file-based sessions in Django, and what are their severe architectural limitations in enterprise production environments?',
      interviewAnswer: 'To configure file-based sessions in Django, you set `SESSION_ENGINE = "django.contrib.sessions.backends.file"` in `settings.py` and specify an absolute directory path via `SESSION_FILE_PATH` that is readable and writable by the web server process.\n\nArchitectural Limitations & Production Hazards:\n1. Horizontal Scaling Breakdown: Modern web systems deploy multiple stateless application instances behind a load balancer (Docker containers, Kubernetes pods, AWS Auto Scaling). Because files are stored on local disks, requests routed to any server other than the one that originated the session will fail to authenticate.\n2. Inode Starvation: Operating systems have a fixed limit on filesystem inodes (data structures representing files). Storing millions of small session files on disk can completely exhaust inodes, crashing the operating system even when plenty of storage capacity remains.\n3. Disk I/O Latency: Reading and writing flat files incurs filesystem lock contention and disk I/O latency compared to sub-millisecond in-memory RAM lookups in Redis or Memcached.\n\nConclusion: File sessions are acceptable solely for quick local development or small, single-server hobby projects without a database. Production systems must always use Redis or database-backed sessions.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/http/sessions/#using-file-based-sessions'
    },
    scriptData: {
      prompt: 'Explain how file-based sessions work in Django and why they are unsuitable for modern scalable production backends.',
      framework: [
        { time: '0-15s', point: 'Configuration: Set SESSION_ENGINE to backends.file and define SESSION_FILE_PATH on the server filesystem.' },
        { time: '15-45s', point: 'Failure in Production: Fails in horizontal scaling across containers/pods because local disk state is not shared.' },
        { time: '45-60s', point: 'Resource Risk: Disk I/O bottlenecks and filesystem inode exhaustion; production demands Redis or cached_db.' }
      ],
      spokenScript: `"To use file-based sessions in Django, you configure \`SESSION_ENGINE = 'django.contrib.sessions.backends.file'\` and set \`SESSION_FILE_PATH\` to a secure directory on disk where the web server process has read and write permissions. Django will then serialize and store each client session as an individual flat file named after the session key.\n\nWhile this backend avoids the overhead of database queries without requiring an external cache service, it is fundamentally unsuitable for modern production systems for two main reasons.\n\nFirst and foremost, it breaks horizontal scalability. In any modern cloud deployment with multiple Docker containers, Kubernetes pods, or load-balanced virtual machines, local disk storage is not shared. A user whose session file is written on Server A will be logged out as soon as the load balancer routes their next request to Server B.\n\nSecond, high traffic generates hundreds of thousands of session files, leading to severe disk I/O bottlenecks and filesystem inode exhaustion, which can crash the entire host. In production, we always utilize Redis via the \`cache\` or \`cached_db\` backend instead."`
    }
  },

  // Q50: What is Jinja templating?
  50: {
    id: 50,
    docSpecs: {
      overview: 'Jinja (specifically Jinja2) is a modern, high-performance, Pythonic templating engine designed by the Pallets project (creators of Flask). Unlike the Django Template Language (DTL), which strictly limits logic in templates by design, Jinja2 allows direct Python expression evaluation (e.g. passing arbitrary arguments to functions like `{{ get_discount(product.price, rate=0.15) }}`), loop scoping, template inheritance with `super()`, and explicit whitespace stripping. Django has included native, first-class support for Jinja2 since version 1.8 via `django.template.backends.jinja2.Jinja2`.',
      table: {
        headers: ['Feature / Dimension', 'Django Template Language (DTL)', 'Jinja2 Templating Engine'],
        rows: [
          ['Rendering Speed', 'Standard Python parsing; moderate speed', 'Compiled directly to Python bytecode; 2x - 4x faster rendering'],
          ['Expression Evaluation', 'Restricted; no function arguments allowed (`{{ func }}` only)', 'Full Python expressions allowed (`{{ func(arg1, kw=val) }}`)'],
          ['Filter Syntax', 'Limited chaining: `{{ val|filter:"arg" }}`', 'Flexible chaining & arguments: `{{ val|filter(arg1, arg2) }}`'],
          ['Template Architecture', 'Custom tags require complex Node classes', 'Simple Python functions registered as filters or global environment variables'],
          ['Django Built-in Tags', 'Natively supports `{% csrf_token %}`, `{% url %}`, `{% static %}`', 'Requires manual bridging in custom `environment.py`']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Configuring Jinja2 Environment in Django',
          content: 'To use Jinja2 in Django, you must specify an `environment` callable in `TEMPLATES` settings (e.g. `"myproject.jinja2.environment"`). In this function, you manually bind Django\'s `reverse`, `static`, and CSRF helpers into the Jinja2 global namespace.'
        },
        {
          type: 'caution',
          title: 'Separation of Concerns Risk',
          content: 'Because Jinja2 permits arbitrary Python code execution in templates, developers can easily slip into the anti-pattern of embedding business logic, database queries, and complex calculations directly inside presentation templates.'
        }
      ],
      commands: [
        {
          label: 'Configuring Jinja2 in Django settings.py and environment.py',
          cmd: `# 1. In myproject/jinja2.py
from django.templatetags.static import static
from django.urls import reverse
from jinja2 import Environment

def environment(**options):
    env = Environment(**options)
    env.globals.update({
        'static': static,
        'url': reverse,
    })
    return env

# 2. In settings.py
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.jinja2.Jinja2',
#         'DIRS': [BASE_DIR / 'jinja2_templates'],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'environment': 'myproject.jinja2.environment',
#         },
#     },
#     # Keep DTL backend for Django Admin and 3rd party apps!
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'APP_DIRS': True,
#     },
# ]`,
          lang: 'python',
          description: 'Production configuration for dual Jinja2 and DTL template backends.'
        }
      ],
      didYouKnow: {
        title: '💡 Why Django Admin Stays on DTL',
        content: 'Even if your primary user-facing site runs on Jinja2, you must retain the `DjangoTemplates` backend in `settings.TEMPLATES`. The built-in Django Admin and popular third-party apps (e.g. `django-allauth`) rely strictly on DTL template tags and will crash if DTL is removed.'
      }
    },
    challenge: {
      title: 'Jinja2 vs Django Template Language (DTL) Drill',
      steps: [
        'Understand the philosophical difference: DTL separation of concerns vs Jinja2 expression flexibility.',
        'Observe Jinja2\'s ability to execute functions with arbitrary arguments inside expressions.',
        'Demonstrate how Jinja2 compiles templates into Python bytecode for superior rendering throughput.',
        'Configure the dual-backend architecture in Django to support Jinja2 alongside DTL for Django Admin.'
      ],
      codeSnippet: `import jinja2

# Jinja2 template allowing arguments in callables
template_str = """
Calculated Discount: {{ calculate_discount(price, rate=0.20) }}
Uppercase User: {{ user_name | upper }}
Whitespace Stripping: {{- "   trimmed   " -}}
"""

def calc_discount(price, rate=0.10):
    return price * (1 - rate)

env = jinja2.Environment()
env.globals["calculate_discount"] = calc_discount

template = env.from_string(template_str)
rendered = template.render(price=100.0, user_name="alice")
print(rendered)`,
      expectedOutput: `Calculated Discount: 80.0
Uppercase User: ALICE
Whitespace Stripping: trimmed`,
      interviewQuestion: 'What is Jinja templating? How does it differ from the Django Template Language (DTL), and how can you integrate Jinja2 into a Django project?',
      interviewAnswer: 'Jinja2 is a fast, expressive, full-featured Python templating engine created by the Pallets team. While inspired by Django\'s original templating system, Jinja2 was built with fewer intentional limitations on expression evaluation and is compiled directly into Python bytecode, making it significantly faster than DTL.\n\nKey Differences:\n1. Expression Power: DTL intentionally forbids passing arguments to functions in templates (`{{ obj.method }}` only). Jinja2 permits full Python expressions, arbitrary arguments, and keyword arguments (`{{ obj.method(arg1, kw=val) }}`).\n2. Performance: Jinja2 compiles templates directly into executable Python bytecode, delivering 2x to 4x higher rendering throughput under load.\n3. Tags and Filters: Writing custom template tags in DTL requires implementing custom Parser and Node subclasses. In Jinja2, any standard Python function can be registered directly into `env.globals` or `env.filters`.\n\nDjango Integration:\nDjango supports Jinja2 natively via `django.template.backends.jinja2.Jinja2`. In `settings.TEMPLATES`, you configure the backend pointing to an `environment` function that binds Django helpers (like `reverse`, `static`, and CSRF tokens) into Jinja2\'s global namespace. Production projects typically maintain both backends so Django Admin continues to render via DTL while client-facing views use Jinja2.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/templates/#django.template.backends.jinja2.Jinja2'
    },
    scriptData: {
      prompt: 'What is Jinja2 templating, how does it compare to the Django Template Language, and when should you adopt it in Django?',
      framework: [
        { time: '0-15s', point: 'Definition: Jinja2 is a fast, Pythonic templating engine that compiles templates directly to Python bytecode.' },
        { time: '15-45s', point: 'DTL vs Jinja2: Jinja2 allows function arguments, flexible filters, and offers 2x-4x faster rendering performance.' },
        { time: '45-60s', point: 'Integration Pattern: Use Jinja2 backend for high-throughput public views while keeping DTL active for Django Admin.' }
      ],
      spokenScript: `"Jinja2 is a modern, high-performance templating engine for Python originally inspired by Django's template syntax, but re-architected for speed and expressive power. Django provides native first-class support for Jinja2 through the \`django.template.backends.jinja2.Jinja2\` backend.\n\nThe fundamental difference between Jinja2 and the Django Template Language lies in execution philosophy and performance. DTL enforces a strict separation of concerns, intentionally forbidding function arguments in templates. In contrast, Jinja2 allows full Python expressions, meaning you can call methods with positional and keyword arguments, chain flexible filters, and utilize fine-grained whitespace control. Furthermore, Jinja2 compiles templates directly into Python bytecode, often rendering pages two to four times faster than DTL.\n\nIn enterprise Django projects, teams often adopt Jinja2 for high-throughput, latency-sensitive public websites or email rendering pipelines. When integrating Jinja2, the standard architecture is a dual-backend setup in \`settings.TEMPLATES\`: Jinja2 handles the user-facing views, while DTL remains enabled to ensure the Django Admin and third-party packages continue working seamlessly."`
    }
  },

  // Q51: What is serialization in Django?
  51: {
    id: 51,
    docSpecs: {
      overview: 'Serialization in Django is the process of translating complex data structures—such as Django ORM model instances and QuerySets—into native Python data types (lists, dictionaries, primitives) that can be easily formatted into transportable representations like JSON, XML, or YAML. Deserialization is the inverse process: parsing incoming serialized payloads, validating data against business constraints, and converting them back into model instances or database writes.',
      table: {
        headers: ['Serialization Tool', 'Built-in / Package', 'Validation Support', 'Performance / Throughput', 'Best Use Case'],
        rows: [
          ['django.core.serializers', 'Built-in Django core', 'None (pure data dumper/loader)', 'Fast for ORM fixtures; rigid output format', 'Data fixtures (`dumpdata` / `loaddata`) and schema migrations'],
          ['DRF ModelSerializer', 'Django REST Framework', 'Extensive (field validation, unique checks, clean)', 'Moderate (CPU-bound Python validation)', 'Standard REST APIs, mobile backends, webhook ingestion'],
          ['queryset.values() + orjson', 'Django ORM + Third-party C-lib', 'None (read-only export)', 'Blazing fast (bypasses ORM instance creation & DRF overhead)', 'High-volume read-only endpoints, large data exports (CSV/JSON)'],
          ['Pydantic / Django-Ninja', 'Third-party (FastAPI-style)', 'High-speed Rust/Cython type validation', '2x - 5x faster than DRF serializers', 'Modern async microservices and high-throughput APIs']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'DRF Serializer CPU Overhead in Large Listings',
          content: 'DRF `ModelSerializer` instantiates Python objects for every single field of every single model instance. Serializing 10,000 records through a nested DRF serializer can take seconds of pure CPU time! For large exports or public search feeds, use `values()` or `values_list()` serialized directly via `orjson.dumps()`.'
        },
        {
          type: 'tip',
          title: 'Prevent Circular Serialization Deadlocks',
          content: 'When serializing bi-directional relationships (e.g. Author -> Books and Book -> Author), nested serializers can trigger infinite recursion. Always break cycles by using depth limits, explicit primary key fields, or separate read/write serializer schemas.'
        }
      ],
      commands: [
        {
          label: 'Comparing django.core.serializers with High-Speed Values Export',
          cmd: `# 1. Core Django Serializer (Fixtures format)
from django.core import serializers
# json_data = serializers.serialize("json", Product.objects.filter(is_active=True))

# 2. High-Performance Read-Only Serialization with orjson
import orjson
from django.http import HttpResponse
# from .models import Product

def fast_product_export(request):
    # .values() bypasses ORM model instance instantiation entirely
    # data = list(Product.objects.filter(is_active=True).values("id", "title", "price", "sku"))
    data = [{"id": 1, "title": "Desk Lamp", "price": "29.99"}]
    return HttpResponse(orjson.dumps(data), content_type="application/json")`,
          lang: 'python',
          description: 'Serialization techniques comparing standard serializers and high-speed orjson exports.'
        }
      ],
      didYouKnow: {
        title: '💡 dumpdata Uses django.core.serializers',
        content: 'Whenever you run `python manage.py dumpdata myapp > backup.json`, Django internally invokes `django.core.serializers.serialize("json", ...)` to produce deterministic database backups.'
      }
    },
    challenge: {
      title: 'Django Serialization & Validation Mechanics Drill',
      steps: [
        'Understand how serialization translates model instances into JSON primitives.',
        'Trace the role of deserialization: payload parsing -> validation -> ORM saving.',
        'Compare `django.core.serializers` fixture format with DRF RESTful serializer output.',
        'Optimize read-only serialization using `queryset.values()` to eliminate ORM instantiation overhead.'
      ],
      codeSnippet: `import json
from decimal import Decimal

# Demonstrating serialization transformation and decimal handling
raw_orm_record = {
    "id": 1042,
    "sku": "KEY-PRO-RGB",
    "price": Decimal("149.99"),
    "in_stock": True
}

# Custom JSON encoder to handle non-primitive types like Decimal
class SafeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

serialized_json = json.dumps(raw_orm_record, cls=SafeEncoder)
print("Serialized JSON Payload:")
print(serialized_json)

# Deserialization and validation
deserialized = json.loads(serialized_json)
print("Deserialized SKU:", deserialized["sku"])`,
      expectedOutput: `Serialized JSON Payload:
{"id": 1042, "sku": "KEY-PRO-RGB", "price": 149.99, "in_stock": true}
Deserialized SKU: KEY-PRO-RGB`,
      interviewQuestion: 'What is serialization in Django? Compare `django.core.serializers` with Django REST Framework serializers, and explain how you optimize serialization for large datasets.',
      interviewAnswer: 'Serialization in Django is the two-way transformation between complex Python ORM instances and standardized, portable data formats like JSON, XML, or YAML.\n\nComparison:\n1. `django.core.serializers`: Built into Django core. It is primarily designed for database fixtures, backups (`dumpdata`), and migrations (`loaddata`). Its JSON output includes fixed internal metadata fields (`pk`, `model`, `fields`), making it rigid and awkward for public client-facing REST APIs.\n2. Django REST Framework (`serializers.Serializer` / `ModelSerializer`): Designed specifically for Web APIs. It provides flexible output mapping, field-level renaming, hyperlinked relationships, nested object representations, and crucial deserialization validation (`is_valid()`, `validate_<field>()`).\n\nOptimizing for Large Datasets:\nDRF serializers are CPU-intensive because they instantiate field objects and run Python validation logic per row. For large datasets (e.g. 10,000+ items in a reporting export or public feed):\n- Bypass model instance creation by querying with `QuerySet.values()` or `values_list()`.\n- Serialize directly using compiled C/Rust JSON libraries like `orjson` or `ujson` rather than passing rows through DRF.\n- Implement pagination (`CursorPagination` or `LimitOffsetPagination`) to prevent unbounded memory allocation.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/serialization/'
    },
    scriptData: {
      prompt: 'What is serialization in Django, how does DRF serialization differ from core serializers, and how do you optimize it for high throughput?',
      framework: [
        { time: '0-15s', point: 'Definition: Serialization converts complex ORM instances into format-agnostic primitives (JSON/XML); deserialization validates and saves.' },
        { time: '15-45s', point: 'Tooling: django.core.serializers powers fixtures (dumpdata); DRF ModelSerializer powers Web APIs with validation and nesting.' },
        { time: '45-60s', point: 'Optimization: DRF serializers are CPU-heavy; optimize bulk reads using queryset.values() and compiled orjson.' }
      ],
      spokenScript: `"Serialization in Django is the process of translating complex Python ORM model instances and QuerySets into standard, serializable data structures like dictionaries and lists that can be rendered into JSON, XML, or YAML. Deserialization is the reverse process, where incoming request payloads are parsed, validated against schema rules, and converted back into database models.\n\nDjango includes a built-in serialization module in \`django.core.serializers\`, but it is primarily intended for fixtures and database backups using \`dumpdata\` and \`loaddata\`. Because its output structure is rigid, modern API development relies on Django REST Framework's \`ModelSerializer\`. DRF serializers provide flexible field declarations, nested relationship handling, and robust field and cross-field validation via \`is_valid()\`.\n\nHowever, a senior engineering consideration is serialization overhead. In DRF, validating and serializing thousands of model instances in Python is CPU-bound. In performance-critical listings or large exports, we bypass the serializer layer altogether by fetching raw dictionaries with \`queryset.values()\` and streaming the response using a high-performance C-based JSON encoder like \`orjson\`."`
    }
  },

  // Q52: What are generic views?
  52: {
    id: 52,
    docSpecs: {
      overview: 'Generic Class-Based Views (CBVs) in Django (`django.views.generic`) are pre-built, reusable view classes that encapsulate standard web development workflows—such as displaying model lists (`ListView`), viewing detail records (`DetailView`), handling form submissions (`FormView`), and executing CRUD operations (`CreateView`, `UpdateView`, `DeleteView`). By decomposing common request-handling logic into modular, overridable methods (like `get_queryset()`, `get_context_data()`, and `form_valid()`), generic views enforce DRY code and reduce repetitive boilerplate.',
      table: {
        headers: ['Generic View Class', 'HTTP Methods Handled', 'Primary Responsibility', 'Key Methods to Override'],
        rows: [
          ['ListView', 'GET', 'Display paginated list of model objects', '`get_queryset()`, `get_context_data()`, `paginate_by`'],
          ['DetailView', 'GET', 'Display a single model instance based on PK/Slug', '`get_object()`, `get_context_data()`'],
          ['CreateView', 'GET (render form), POST (validate & save)', 'Instantiate and save a new model instance', '`form_valid()`, `get_form_class()`, `get_success_url()`'],
          ['UpdateView', 'GET (render pre-filled form), POST (update)', 'Edit and persist an existing model instance', '`get_object()`, `form_valid()`, `get_success_url()`'],
          ['DeleteView', 'GET (confirm delete), POST (execute delete)', 'Safely delete a record and redirect', '`get_object()`, `get_success_url()`']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Static queryset Attribute Pitfall',
          content: 'Never define dynamic query filtering directly on the class attribute `queryset = Order.objects.filter(created_at__gte=timezone.now())`! In some WSGI worker lifecycles, class attributes are evaluated once at module load time, freezing the timestamp! Always override the method `def get_queryset(self):` to guarantee fresh evaluation per HTTP request.'
        },
        {
          type: 'tip',
          title: 'Scoping DetailView Queries to Prevent IDOR',
          content: 'In `DetailView` or `UpdateView`, override `get_queryset()` to scope objects to the authenticated user (`return Order.objects.filter(customer=self.request.user)`). This automatically prevents Insecure Direct Object Reference (IDOR) attacks!'
        }
      ],
      commands: [
        {
          label: 'Production Class-Based Generic Views with Scoped Security',
          cmd: `from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
# from .models import Project

class ProjectListView(LoginRequiredMixin, ListView):
    # model = Project
    template_name = "projects/project_list.html"
    context_object_name = "projects"
    paginate_by = 25

    def get_queryset(self):
        # Dynamic query evaluated per-request; scoped to current user!
        return Project.objects.filter(owner=self.request.user).order_by("-updated_at")

class ProjectDetailView(LoginRequiredMixin, DetailView):
    # model = Project
    template_name = "projects/project_detail.html"
    context_object_name = "project"

    def get_queryset(self):
        # Prevents IDOR: Users can only view their own projects
        return Project.objects.filter(owner=self.request.user)`,
          lang: 'python',
          description: 'Secure, production-grade generic CBV pattern using LoginRequiredMixin and dynamic get_queryset().'
        }
      ],
      didYouKnow: {
        title: '💡 as_view() Converts CBVs to Functions',
        content: 'Django\'s URL resolver only understands callable functions. When you declare `path("...", MyView.as_view())`, the class method `as_view()` returns an inner closure that instantiates the class, assigns `self.request`, and calls `self.dispatch()` for each incoming request.'
      }
    },
    challenge: {
      title: 'Generic Class-Based Views Lifecycle & Method Override Drill',
      steps: [
        'Understand the role of `as_view()` and `dispatch()` in the CBV request lifecycle.',
        'Override `get_queryset()` to provide dynamic, request-scoped filtering.',
        'Use `get_context_data()` to inject auxiliary metrics into the template context.',
        'Demonstrate how `form_valid()` intercepts form data before database persistence.'
      ],
      codeSnippet: `class MockBaseView:
    def __init__(self, request):
        self.request = request
        
    def dispatch(self):
        handler = getattr(self, self.request["method"].lower(), None)
        return handler()

class MockListView(MockBaseView):
    def get_queryset(self):
        # Dynamic query filtering by user
        all_items = [
            {"id": 1, "owner": "alice", "title": "Alpha Project"},
            {"id": 2, "owner": "bob", "title": "Beta Project"}
        ]
        return [x for x in all_items if x["owner"] == self.request["user"]]

    def get(self):
        qs = self.get_queryset()
        return f"Rendering list of {len(qs)} projects for {self.request['user']}"

view = MockListView({"method": "GET", "user": "alice"})
print(view.dispatch())`,
      expectedOutput: `Rendering list of 1 projects for alice`,
      interviewQuestion: 'What are Generic Views in Django? Trace the execution flow through `as_view()` and `dispatch()`, and explain why you should override `get_queryset()` instead of setting the `queryset` attribute.',
      interviewAnswer: 'Generic Views in Django (`django.views.generic`) are pre-constructed Class-Based Views that provide reusable, object-oriented implementations of common web UI patterns—such as listing objects (`ListView`), inspecting object details (`DetailView`), and editing data (`CreateView`, `UpdateView`, `DeleteView`).\n\nExecution Flow:\n1. URL Routing: The URL configuration references `MyView.as_view()`. `as_view()` is a class method that returns a callable wrapper function.\n2. Instantiation: For every HTTP request, `as_view()` creates a fresh instance of `MyView` and assigns `self.request`, `self.args`, and `self.kwargs`.\n3. Dispatch: The view calls `self.dispatch(request, *args, **kwargs)`, which inspects the HTTP method (GET, POST, PUT) and delegates to the corresponding lowercase method (`self.get()` or `self.post()`).\n\nWhy Override `get_queryset()` over setting `queryset`:\n1. Dynamic per-request scoping: The class-level `queryset` attribute is static. If your query depends on `self.request.user`, session state, or URL parameters (`self.kwargs["category_id"]`), you cannot use a static attribute. Overriding `get_queryset()` guarantees dynamic evaluation.\n2. Security (IDOR Defense): Overriding `get_queryset()` to filter by `owner=self.request.user` guarantees that even if an attacker guesses another user\'s PK in a URL, Django raises a 404 Not Found rather than leaking private data.\n3. Datetime Evaluation: Static queries like `filter(published_at__lte=timezone.now())` freeze `timezone.now()` at worker startup; `get_queryset()` evaluates `timezone.now()` fresh on every request.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/class-based-views/generic-display/'
    },
    scriptData: {
      prompt: 'What are generic views in Django, how does the CBV lifecycle operate, and why should you override get_queryset() in production?',
      framework: [
        { time: '0-15s', point: 'Definition: Generic views are pre-built CBVs encapsulating standard web workflows (ListView, DetailView, CreateView).' },
        { time: '15-45s', point: 'Lifecycle: as_view() wraps the class into a closure, dispatch() routes HTTP verbs to lowercase handler methods.' },
        { time: '45-60s', point: 'Production Rule: Always override get_queryset() for dynamic user scoping to prevent IDOR vulnerabilities.' }
      ],
      spokenScript: `"Generic views in Django are pre-built Class-Based Views that encapsulate standard web development workflows—such as listing records with \`ListView\`, viewing single objects with \`DetailView\`, and executing CRUD operations with \`CreateView\`, \`UpdateView\`, and \`DeleteView\`.\n\nUnder the hood, their lifecycle begins in \`urls.py\` with \`as_view()\`. \`as_view()\` acts as a factory closure that instantiates a fresh instance of the class for each incoming HTTP request, binds \`self.request\`, and invokes \`self.dispatch()\`. \`dispatch()\` inspects the HTTP method and routes execution to handler methods like \`get()\` or \`post()\`.\n\nA fundamental production best practice is to override the \`get_queryset()\` method rather than declaring a static \`queryset\` class attribute. Overriding \`get_queryset()\` allows dynamic filtering based on \`self.request.user\` or URL kwargs. This is crucial for multi-tenant security because scoping the queryset to the authenticated user automatically prevents Insecure Direct Object Reference (IDOR) vulnerabilities."`
    }
  },

  // Q53: What is mixin?
  53: {
    id: 53,
    docSpecs: {
      overview: 'A mixin in Python and Django is an abstract utility class designed to add specific behaviors and methods to other classes through multiple inheritance. Mixins are not meant to be instantiated on their own; instead, they encapsulate reusable, cross-cutting functionality (such as authentication checks, permission enforcement, or JSON serialization) that can be plugged into multiple Class-Based Views. Examples include Django\'s built-in `LoginRequiredMixin`, `PermissionRequiredMixin`, and `UserPassesTestMixin`.',
      table: null,
      admonitions: [
        {
          type: 'caution',
          title: 'MRO Ordering Rule: Mixins Must Come First!',
          content: 'In Python\'s Method Resolution Order (C3 Linearization), mixins MUST be placed to the LEFT of the generic base view: `class OrderDetail(LoginRequiredMixin, DetailView)`. If you place `DetailView` first (`class OrderDetail(DetailView, LoginRequiredMixin)`), `DetailView.dispatch()` will execute first, completely bypassing `LoginRequiredMixin.dispatch()` and exposing your view to unauthenticated users!'
        },
        {
          type: 'tip',
          title: 'Always Call super() in Mixin Methods',
          content: 'Whenever you override lifecycle methods like `dispatch()`, `get_context_data()`, or `get_queryset()` in a mixin, always invoke `super().dispatch(request, *args, **kwargs)`. This ensures Python\'s MRO continues down the cooperative multiple inheritance chain.'
        }
      ],
      commands: [
        {
          label: 'Writing and Composing Custom Security Mixins in Django',
          cmd: `from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import UpdateView
from django.core.exceptions import PermissionDenied
# from .models import Organization

class OrganizationAdminRequiredMixin(UserPassesTestMixin):
    """Custom mixin verifying the user is an admin of the requested organization."""
    def test_func(self):
        user = self.request.user
        org_id = self.kwargs.get("org_id")
        return user.is_authenticated and user.memberships.filter(organization_id=org_id, role="admin").exists()

    def handle_no_permission(self):
        raise PermissionDenied("You must be an Organization Admin to access this resource.")

# Correct MRO order: Mixins from left to right, Base View LAST!
class OrganizationSettingsView(LoginRequiredMixin, OrganizationAdminRequiredMixin, UpdateView):
    # model = Organization
    template_name = "orgs/settings.html"
    fields = ["name", "billing_email"]`,
          lang: 'python',
          description: 'Production multiple inheritance pattern showing correct MRO order with mixins.'
        }
      ],
      didYouKnow: {
        title: '💡 C3 Linearization Algorithm',
        content: 'Python uses the C3 Linearization algorithm to determine Method Resolution Order (MRO). You can inspect the exact method resolution order of any Class-Based View by printing `MyView.__mro__` in your Python REPL.'
      }
    },
    challenge: {
      title: 'Python Mixins & Method Resolution Order (MRO) Drill',
      steps: [
        'Understand how mixins provide modular composition via multiple inheritance.',
        'Demonstrate why mixins must be positioned to the left of base views in class definitions.',
        'Inspect the `__mro__` attribute to trace method execution order.',
        'Implement a custom mixin overriding `dispatch()` with cooperative `super()` chaining.'
      ],
      codeSnippet: `class BaseView:
    def dispatch(self):
        return "BaseView: Dispatching request to view handler."

class AuthMixin:
    def dispatch(self):
        print("[AuthMixin] Verifying user credentials...")
        return super().dispatch()

class LoggingMixin:
    def dispatch(self):
        print("[LoggingMixin] Logging request incoming...")
        return super().dispatch()

# Proper MRO: AuthMixin -> LoggingMixin -> BaseView
class ProtectedView(AuthMixin, LoggingMixin, BaseView):
    pass

view = ProtectedView()
res = view.dispatch()
print("Final Result:", res)
print("MRO Resolution Order:")
for cls in ProtectedView.__mro__:
    print(f"  -> {cls.__name__}")`,
      expectedOutput: `[AuthMixin] Verifying user credentials...
[LoggingMixin] Logging request incoming...
Final Result: BaseView: Dispatching request to view handler.
MRO Resolution Order:
  -> ProtectedView
  -> AuthMixin
  -> LoggingMixin
  -> BaseView
  -> object`,
      interviewQuestion: 'What is a mixin in Django? How does Python\'s Method Resolution Order (MRO) affect mixin behavior, and what critical security vulnerability occurs if mixins are ordered incorrectly?',
      interviewAnswer: 'A mixin is a specialized class designed to provide reusable methods and behaviors to other classes using multiple inheritance. In Django Class-Based Views, mixins encapsulate common behaviors such as authentication (`LoginRequiredMixin`), permission checks (`PermissionRequiredMixin`), and context injection.\n\nMethod Resolution Order (MRO) & The Security Trap:\nPython resolves attribute and method lookups using the C3 Linearization algorithm, evaluating parent classes from left to right as specified in the class definition header.\n\nIn Django CBVs, mixin classes intercept the request lifecycle by overriding `dispatch()`. Therefore, mixins MUST be placed to the left of the base view:\n```python\n# SECURE:\nclass MyView(LoginRequiredMixin, DetailView): ...\n```\nHere, when `as_view()` calls `dispatch()`, `LoginRequiredMixin.dispatch()` executes first, verifying authentication. If authenticated, it calls `super().dispatch()`, passing control down to `DetailView.dispatch()`.\n\nCRITICAL SECURITY BUG:\nIf a developer places the base view first:\n```python\n# DANGEROUS SECURITY HOLE:\nclass MyView(DetailView, LoginRequiredMixin): ...\n```\nPython finds `DetailView.dispatch()` first. Because `DetailView.dispatch()` renders the view and terminates the response without calling `super()`, `LoginRequiredMixin` is NEVER reached! An unauthenticated anonymous user can access protected sensitive data, causing a critical security vulnerability.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/class-based-views/mixins/'
    },
    scriptData: {
      prompt: 'What is a mixin in Django, how does Python MRO govern its execution, and why is class inheritance ordering a critical security concern?',
      framework: [
        { time: '0-15s', point: 'Definition: Mixins are modular classes that inject reusable behavior into CBVs via multiple inheritance.' },
        { time: '15-45s', point: 'MRO Mechanics: Python evaluates classes left-to-right using C3 Linearization; mixins override dispatch() using super().' },
        { time: '45-60s', point: 'Security Pitfall: Mixins MUST precede the base view; placing the base view first bypasses authentication entirely.' }
      ],
      spokenScript: `"A mixin in Django is a specialized class designed to provide reusable behavior to Class-Based Views through multiple inheritance. Mixins are not meant to be instantiated independently; instead, they encapsulate cross-cutting concerns like authentication checks in \`LoginRequiredMixin\`, permission checks in \`PermissionRequiredMixin\`, or custom context injection.\n\nThe most important concept regarding mixins is Python's Method Resolution Order, or MRO, which uses the C3 Linearization algorithm to evaluate classes from left to right. Because mixins hook into the view lifecycle by overriding \`dispatch()\`, they must always be listed to the left of the base view class—for example, \`class OrderView(LoginRequiredMixin, DetailView)\`.\n\nGetting this order wrong introduces a severe security vulnerability. If you declare \`class OrderView(DetailView, LoginRequiredMixin)\`, Python executes \`DetailView.dispatch()\` first. Because \`DetailView\` renders the response without invoking cooperative \`super()\` up the chain, the \`LoginRequiredMixin\` is completely skipped, exposing protected data to unauthenticated users."`
    }
  },

  // Q54: Explain the caching strategies in Django?
  54: {
    id: 54,
    docSpecs: {
      overview: 'Django features a robust, multi-tiered caching framework that allows developers to cache dynamically computed web pages, fragments, or database queries to reduce database load and achieve sub-millisecond response latencies. The architecture spans five levels of granularity: 1) Per-site cache, 2) Per-view cache (`@cache_page`), 3) Template fragment cache (`{% cache %}`), 4) Low-level cache API (`cache.get/set/get_or_set`), and 5) Database query caching. Common production storage backends include Redis (`django.core.cache.backends.redis.RedisCache`) and Memcached.',
      table: {
        headers: ['Caching Strategy / Level', 'Granularity', 'Implementation Tool', 'Invalidation Complexity', 'Best Production Use Case'],
        rows: [
          ['Per-Site Cache', 'Entire HTTP responses for whole domain', '`UpdateCacheMiddleware` & `FetchFromCacheMiddleware`', 'High (all-or-nothing invalidation)', 'Read-only public content sites (blogs, news portals, doc sites)'],
          ['Per-View Cache', 'Individual view endpoints', '`@cache_page(timeout=600)` decorator', 'Moderate (keyed on URL + Vary headers)', 'Public marketing pages, static catalog listings, public API feeds'],
          ['Template Fragment Cache', 'Specific HTML blocks inside a template', '`{% cache timeout key_name ... %}`', 'Low to Moderate', 'Heavy navigational menus, product recommendation grids, sidebars'],
          ['Low-Level Cache API', 'Arbitrary Python objects, QuerySets, dicts', '`django.core.cache.cache` (`get`, `set`, `get_or_set`)', 'Precise and granular invalidation', 'Expensive aggregation queries, third-party API responses, session tokens']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Thundering Herd (Cache Stampede) Hazard',
          content: 'When an ultra-popular cache key expires under high concurrent load (e.g. 5,000 requests/sec), hundreds of requests simultaneously encounter a cache miss and execute the expensive underlying database query at the exact same time, crashing the database! Mitigate this using probabilistic early expiration, background warming, or distributed locks (`redis-lock`).'
        },
        {
          type: 'tip',
          title: 'Always Set Appropriate Vary Headers',
          content: 'When caching views that return different responses based on language, cookie, or user-agent, decorate the view with `@vary_on_headers("Accept-Language")` or `@vary_on_cookie`. Failing to do so can result in serving one user\'s cached private dashboard to another user!'
        }
      ],
      commands: [
        {
          label: 'Implementing Caching Strategies Across Granularities in Django',
          cmd: `# 1. Redis Cache Backend in settings.py (Django 4.0+)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# 2. Per-View Cache with Vary Header
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

@cache_page(60 * 15)  # Cache for 15 minutes
@vary_on_cookie
def catalog_view(request):
    return render(request, "catalog.html")

# 3. Low-Level Cache API with cache.get_or_set()
from django.core.cache import cache

def get_platform_metrics():
    # Automatically returns cached value or executes callback and stores it!
    return cache.get_or_set(
        "global_platform_metrics",
        lambda: {"active_nodes": 128, "throughput": 98200},
        timeout=3600
    )`,
          lang: 'python',
          description: 'Production caching patterns: Redis backend, per-view cache, and low-level cache.get_or_set.'
        }
      ],
      didYouKnow: {
        title: '💡 Native Redis Backend in Django 4.0+',
        content: 'Since Django 4.0, you no longer need third-party packages like `django-redis` for standard Redis caching. Django ships with built-in `django.core.cache.backends.redis.RedisCache`.'
      }
    },
    challenge: {
      title: 'Django Caching Architecture & Low-Level API Drill',
      steps: [
        'Understand the multi-level caching hierarchy: Per-site, Per-view, Template fragment, and Low-level API.',
        'Contrast Redis and Memcached backends for production workloads.',
        'Demonstrate `cache.get_or_set()` to eliminate redundant database computation.',
        'Explain cache stampede prevention and why `Vary` headers are required for user-specific views.'
      ],
      codeSnippet: `class MockCacheBackend:
    def __init__(self):
        self._store = {}
        
    def get(self, key):
        return self._store.get(key)
        
    def set(self, key, value, timeout=None):
        self._store[key] = value
        
    def get_or_set(self, key, default_callable, timeout=None):
        val = self.get(key)
        if val is None:
            val = default_callable()
            self.set(key, val, timeout)
        return val

cache = MockCacheBackend()

# Simulate expensive DB aggregation query
db_call_count = 0
def expensive_calculation():
    global db_call_count
    db_call_count += 1
    return {"total_revenue": 1450200.50}

# First call: executes calculation
val1 = cache.get_or_set("kpi_revenue", expensive_calculation)
# Second call: served instantly from cache
val2 = cache.get_or_set("kpi_revenue", expensive_calculation)

print("Cached Value:", val2)
print("Expensive DB Calculation Invocations:", db_call_count)`,
      expectedOutput: `Cached Value: {'total_revenue': 1450200.5}
Expensive DB Calculation Invocations: 1`,
      interviewQuestion: 'Explain the different caching strategies available in Django. How do you choose between them, and what is the "Cache Stampede" (Thundering Herd) problem?',
      interviewAnswer: 'Django provides a flexible, multi-tiered caching architecture categorized by granularity:\n\n1. Per-Site Cache: Configured via `UpdateCacheMiddleware` (top of middleware) and `FetchFromCacheMiddleware` (bottom). It caches the entire rendered HTTP response for every page. Best for entirely static or read-heavy public sites.\n2. Per-View Cache: Configured via the `@cache_page(timeout)` decorator on FBVs or `cache_page` mixins on CBVs. Caches responses for individual endpoints. Must be paired with `@vary_on_cookie` or `@vary_on_headers` if the response depends on user state or headers.\n3. Template Fragment Cache: Implemented with `{% load cache %}` and `{% cache 500 fragment_name user.id %}`. Allows caching specific expensive UI fragments (e.g. sidebars, category menus) while keeping the surrounding page dynamic.\n4. Low-Level Cache API: Direct programmatic access using `from django.core.cache import cache`. Provides `cache.get()`, `cache.set()`, `cache.get_or_set()`, and `cache.delete()`. Best for caching query results, API responses, or computational aggregates.\n\nThe Cache Stampede (Thundering Herd) Problem:\nA cache stampede occurs when a heavily requested cache key expires under massive concurrent traffic. Hundreds or thousands of worker processes simultaneously experience a cache miss and all rush to recalculate the same expensive database query at the same instant, leading to database CPU spikes and cascading connection timeouts. Solutions include: using `cache.get_or_set()` with probabilistic early expiration (XFetch algorithm), asynchronous cache background warming using Celery, or acquiring a distributed Redis mutex lock before recomputing the value.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/cache/'
    },
    scriptData: {
      prompt: 'Explain the caching strategies in Django, when to use each tier, and how to defend against cache stampedes.',
      framework: [
        { time: '0-15s', point: 'Overview: Django provides a 4-tier caching architecture: Per-Site, Per-View, Template Fragment, and Low-Level Cache API.' },
        { time: '15-45s', point: 'Selection: Per-view for static endpoints, template fragments for heavy UI sections, low-level API for expensive queries.' },
        { time: '45-60s', point: 'Production Pitfalls: Use Vary headers to prevent leaking private data; defend against Cache Stampedes with distributed locks or background warming.' }
      ],
      spokenScript: `"Django provides a robust, multi-tiered caching framework that operates at four distinct levels of granularity.\n\nAt the broadest level is the Per-Site Cache, managed via middleware to cache entire pages across an entire domain. Next is the Per-View Cache, applied using the \`@cache_page\` decorator to cache specific view responses for a fixed duration. For mixed dynamic pages, the Template Fragment Cache allows caching specific expensive HTML components—like navigation bars or product carousels—using the \`{% cache %}\` template tag. Finally, the Low-Level Cache API allows developers to cache arbitrary Python data, querysets, or external API responses directly using \`cache.get_or_set()\`, backed by Redis or Memcached.\n\nIn high-scale production systems, two considerations are critical: first, when caching views with dynamic user content, you must declare \`@vary_on_cookie\` to avoid accidentally serving one user's cached private data to another user. Second, you must guard against Cache Stampedes—or the thundering herd problem—where an expiring popular key causes hundreds of concurrent requests to hammer the database simultaneously. We mitigate this using distributed Redis mutexes or asynchronous Celery tasks that warm the cache before it expires."`
    }
  }
};

