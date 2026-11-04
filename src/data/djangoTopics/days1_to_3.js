// Django Days 1 to 3 (Questions 1 to 9)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const DJANGO_DAYS_1_TO_3 = {
  // Q1: Install and Version
  1: {
    id: 1,
    docSpecs: {
      overview: 'Django is distributed as a standard Python package via PyPI. In production engineering workflows, Django dependencies must be pinned and isolated within a dedicated virtual environment or Docker image to prevent environment drift, OS library contamination, and PATH resolution collisions.',
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
          title: 'python -m django vs django-admin',
          content: 'Always prefer `python -m django` over the standalone `django-admin` binary. `python -m django` explicitly invokes the Python interpreter and virtual environment currently active in your shell session, avoiding subtle PATH resolution mismatches in CI/CD environments.'
        },
        {
          type: 'tip',
          title: 'Pinning Major and Minor Releases',
          content: 'In production `requirements.txt`, pin Django using compatible release operators: `django>=5.1,<5.2`. This automatically accepts non-breaking security patch releases while blocking breaking major/minor changes.'
        }
      ],
      commands: [
        {
          label: 'Clean Environment Installation & Verification',
          cmd: `# 1. Create and activate virtual environment\npython3 -m venv .venv\nsource .venv/bin/activate\n\n# 2. Install pinned Django LTS or current release\npip install "django>=5.1,<5.2"\n\n# 3. Deterministic version verification\npython -m django --version`,
          lang: 'bash',
          description: 'Step-by-step installation in an isolated virtual environment.'
        }
      ],
      didYouKnow: {
        title: '💡 Django LTS Support Cycles',
        content: 'Django releases a Long Term Support (LTS) version every two years (e.g., Django 4.2 LTS, Django 5.2 LTS). LTS releases receive guaranteed security patches and critical data-loss fixes for 3 full years.'
      }
    },
    challenge: {
      title: 'Virtual Environment Isolation & Version Diagnostics Drill',
      steps: [
        'Verify your active Python interpreter path using `sys.executable`.',
        'Import `django` and inspect `django.get_version()`.',
        'Inspect `django.__file__` to ensure Django is resolving from your active virtual environment, not global system libraries.',
        'Demonstrate version checking in Python startup scripts.'
      ],
      codeSnippet: `import sys
import django

print("1. Active Python Interpreter:", sys.executable)
print("2. Django Version:          ", django.get_version())
print("3. Django Installation Path:", django.__file__)

# Programmatic version check
version_tuple = django.VERSION
print(f"4. Parsed Version Tuple:     Major={version_tuple[0]}, Minor={version_tuple[1]}, Patch={version_tuple[2]}")`,
      expectedOutput: `1. Active Python Interpreter: .../.venv/bin/python
2. Django Version:           5.x.x
3. Django Installation Path: .../.venv/lib/python3.x/site-packages/django/__init__.py
4. Parsed Version Tuple:     Major=5, Minor=x, Patch=x`,
      interviewQuestion: 'Why should backend engineers execute "python -m django <command>" rather than standalone "django-admin"? What failure mode does this prevent in Docker and CI/CD?',
      interviewAnswer: 'Executing `python -m django` guarantees that the command runs using the exact Python interpreter and virtual environment active in the shell session. Standalone CLI binaries like `django-admin` contain a hardcoded shebang line (e.g. `#!/usr/bin/python3`) pointing to whatever Python binary was active when the package was installed.\n\nIn Docker multi-stage builds and CI/CD environments with multiple Python runtimes, executing `django-admin` can silently invoke the host OS global Python rather than the virtual environment, leading to `ModuleNotFoundError` or running migrations against mismatched framework versions. `python -m django` completely eliminates this PATH resolution hazard.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/intro/install/'
    },
    scriptData: {
      prompt: 'Walk me through how you install Django in a production microservice repository. Why is executing "python -m django --version" standard practice over running the "django-admin" CLI directly?',
      framework: [
        { time: '0-15s', point: 'Environment Isolation: Always install inside a pinned virtual environment (venv, poetry, Docker) rather than global system Python.' },
        { time: '15-45s', point: 'python -m vs django-admin: "python -m django" explicitly guarantees execution using the active virtual environment interpreter on sys.path.' },
        { time: '45-60s', point: 'Production CI/CD: Prevents PATH collisions where global system binaries silently execute incorrect Python or Django versions in deployment containers.' }
      ],
      spokenScript: `"In a production backend environment, we strictly isolate Django inside a dedicated virtual environment using venv, poetry, or containerized Docker builds, locking exact dependency versions in requirements.txt or poetry.lock. We verify the installed version with 'python -m django --version'.\n\nWe prefer 'python -m' over standalone 'django-admin' because 'python -m django' explicitly invokes the Python interpreter and virtualenv currently active in the shell session. Standalone CLI binaries like 'django-admin' resolve via the system PATH and frequently point to the host OS Python version, causing insidious environment drift, missing library errors, or migration failures in CI/CD build pipelines."`,
      buzzwords: ['Virtualenv isolation', 'Deterministic CI/CD builds', 'sys.path resolution', 'Interpreter binding', 'Version pinning'],
      juniorMistake: 'Installing Django globally with sudo pip install or relying on untracked django-admin binaries that point to host OS Python.'
    }
  },

  // Q2: Startproject vs Startapp
  2: {
    id: 2,
    docSpecs: {
      overview: 'Django enforces modular separation between a "Project" and an "App". A Project is the overarching web application container holding global configuration (`settings.py`, `urls.py`, `wsgi.py`, `asgi.py`). An App is a self-contained, modular Python package that encapsulates models, views, business logic, serializers, and migrations for a specific domain context (e.g., `accounts`, `billing`, `inventory`).',
      table: {
        headers: ['Concept', 'CLI Command', 'Generated Files', 'Architectural Role'],
        rows: [
          ['Django Project', '`django-admin startproject <name> .`', '`manage.py`, `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`', 'Global container: DB connections, middleware pipeline, deployment entry points.'],
          ['Django App', '`python manage.py startapp <app_name>`', '`models.py`, `views.py`, `apps.py`, `admin.py`, `migrations/`', 'Modular domain module: Models, business logic, serializers, domain routes.']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'The Trailing Dot Project Pattern',
          content: 'Always run `django-admin startproject config .` with a trailing dot! The dot creates the project configuration inside the current directory, preventing Django from creating an ugly nested directory structure (`myproject/myproject/settings.py`).'
        },
        {
          type: 'caution',
          title: 'Registering Apps via AppConfig',
          content: 'Always register apps in `INSTALLED_APPS` using their full `AppConfig` class path: `\'accounts.apps.AccountsConfig\'` rather than bare `\'accounts\'`. This ensures application signal receivers and custom ready() lifecycle hooks execute on startup.'
        }
      ],
      commands: [
        {
          label: 'Initializing Clean Project Container & Modular Domain App',
          cmd: `# 1. Initialize project container in current directory (trailing dot!)\ndjango-admin startproject config .\n\n# 2. Create modular domain app\npython manage.py startapp accounts\n\n# 3. Register accounts in config/settings.py INSTALLED_APPS:\n# 'accounts.apps.AccountsConfig',`,
          lang: 'bash',
          description: 'Creating project and app with professional layout avoiding directory nesting.'
        }
      ],
      didYouKnow: {
        title: '💡 AppConfig ready() Lifecycle Hook',
        content: 'The `apps.py` file defines an `AppConfig` class with a `ready()` method. `ready()` runs once when Django initializes its app registry, making it the official place to register Django signals and background tasks.'
      }
    },
    challenge: {
      title: 'App Registry Inspection & Modular Registration Drill',
      steps: [
        'Inspect the structure of `INSTALLED_APPS` in `settings.py`.',
        'Import `django.apps.apps` and inspect the list of all registered applications in memory.',
        'Verify that custom apps expose their `models` and `verbose_name`.',
        'Explain why a project can contain multiple apps, but apps should remain decoupled.'
      ],
      codeSnippet: `import os
import django

# Configure minimal Django settings for testing
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.conf import settings
if not settings.configured:
    settings.configure(
        INSTALLED_APPS=[
            'django.contrib.auth',
            'django.contrib.contenttypes',
        ]
    )
    django.setup()

from django.apps import apps

print("Registered Django Apps in AppRegistry:")
for app in apps.get_app_configs():
    print(f"  App: {app.name:<25} Label: {app.label}")`,
      expectedOutput: `Registered Django Apps in AppRegistry:
  App: django.contrib.auth       Label: auth
  App: django.contrib.contenttypes Label: contenttypes`,
      interviewQuestion: 'What is the architectural difference between a Django Project and a Django App? How do you keep Django apps loosely coupled in an enterprise codebase?',
      interviewAnswer: 'A Django Project is the top-level deployment container that manages global infrastructure: database credentials, caching engines, middleware pipeline, security policies, and WSGI/ASGI entrypoints. A Django App is a modular, self-contained Python package representing a single bounded context (domain model) containing its own models, views, and migrations.\n\nTo keep apps loosely coupled:\n1. Follow the Single Responsibility Principle: an app should manage one domain (e.g. `billing` handles invoices, `auth` handles users).\n2. Avoid direct circular imports between apps: use Django\'s string-based model references (e.g. `ForeignKey("accounts.User")`) rather than importing the Model class directly.\n3. Communicate across apps using Django Signals or domain service layers rather than tight cross-app foreign key spaghetti.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/'
    },
    scriptData: {
      prompt: 'How do you explain the architectural difference between a Django Project and a Django App to an engineer joining your backend team?',
      framework: [
        { time: '0-15s', point: 'Project = Deployment Container: Holds global configuration (settings, root urls, WSGI/ASGI, middleware).' },
        { time: '15-45s', point: 'App = Modular Domain: Encapsulates models, business logic, serializers, and migrations for a single bounded context.' },
        { time: '45-60s', point: 'Architectural Hygiene: Keeps business domains decoupled and registered in INSTALLED_APPS, preventing monolithic spaghetti.' }
      ],
      spokenScript: `"In Django architecture, a Project represents the entire web application container, whereas an App represents a modular, self-contained business domain. The Project holds global infrastructure: settings.py, root urls.py, middleware chains, database connection routing, and WSGI/ASGI entrypoints. An App encapsulates a single bounded context—such as authentication, payments, or orders—containing its own models, views, serializers, and migrations.\n\nStoring all code directly in the project root creates an unmaintainable monolithic ball of mud. Breaking business logic into discrete apps follows the Single Responsibility Principle, enables parallel team ownership, and allows components to be reused or extracted into microservices cleanly."`,
      buzzwords: ['Container vs Domain module', 'Bounded context', 'Single Responsibility Principle', 'INSTALLED_APPS registry', 'Modular architecture'],
      juniorMistake: 'Treating Django like a single-script framework and dumping all models, views, and routes into the root project directory.'
    }
  },

  // Q3: Runserver vs WSGI
  3: {
    id: 3,
    docSpecs: {
      overview: '`python manage.py runserver` is Django\'s built-in development HTTP server, designed strictly for rapid local testing with hot code reloading (`StatReloader`). In production environments, Django must run behind a battle-tested WSGI/ASGI application server (Gunicorn, Uvicorn) reverse-proxied by Nginx or AWS CloudFront to handle multi-threaded concurrency, slow-client buffering, and TLS termination.',
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
          content: '`runserver` has not undergone security audits. Running it in production exposes your backend to Denial of Service (DoS) attacks, memory leaks, and CPU exhaustion from unoptimized socket handling.'
        },
        {
          type: 'tip',
          title: 'Production Worker Sizing Rule',
          content: 'For Gunicorn deployments, the recommended worker process formula is `(2 * CPU Cores) + 1` to ensure worker processes remain available while others wait on database I/O.'
        }
      ],
      commands: [
        {
          label: 'Local Dev Server vs Industrial Gunicorn Invocation',
          cmd: `# 1. Local development testing\npython manage.py runserver 127.0.0.1:8000\n\n# 2. Production industrial WSGI deployment\ngunicorn config.wsgi:application \\\n  --bind 0.0.0.0:8000 \\\n  --workers 4 \\\n  --timeout 60 \\\n  --access-logfile -`,
          lang: 'bash',
          description: 'Starting local development server and industrial Gunicorn production WSGI server.'
        }
      ],
      didYouKnow: {
        title: '💡 StatReloader CPU Consumption',
        content: '`runserver` continuously monitors file timestamps using `pywatchman` or polling. On large repositories with tens of thousands of files, polling can consume 100% of a developer\'s CPU unless `watchman` is installed!'
      }
    },
    challenge: {
      title: 'Dev Server Port Binding & Production WSGI Inspection Drill',
      steps: [
        'Inspect `config/wsgi.py` to identify the `get_wsgi_application()` entry point.',
        'Run `python manage.py runserver 0.0.0.0:8080 --noreload` to observe binding to a custom IP and port without file watcher overhead.',
        'Explain why Gunicorn pre-fork worker architectures handle concurrent requests where runserver blocks.'
      ],
      codeSnippet: `# config/wsgi.py inspection
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# The standard WSGI callable that Gunicorn/uWSGI invokes:
application = get_wsgi_application()
print("WSGI Application Handler successfully loaded:", type(application))`,
      expectedOutput: `WSGI Application Handler successfully loaded: <class 'django.core.handlers.wsgi.WSGIHandler'>`,
      interviewQuestion: 'Why is "python manage.py runserver" completely unsuitable for production environments? Describe the full production deployment topology for a Django web application.',
      interviewAnswer: '`runserver` is single-threaded, lacks security auditing, does not scale across multiple CPU cores, and runs `StatReloader` which wastes CPU monitoring files. A slow client (e.g. uploading a large file on a 2G mobile network) can hold the server thread hostage, blocking all other incoming HTTP requests.\n\nA production Django deployment topology uses three distinct layers:\n1. Reverse Proxy (Nginx / CloudFront): Terminates TLS/SSL, buffers slow clients, enforces rate limits, and directly serves static/media files without touching Python.\n2. WSGI/ASGI Server (Gunicorn / Uvicorn): Manages a pre-forked pool of worker processes (`2 * cores + 1`), translates HTTP into Python WSGI environments, and enforces request timeout limits.\n3. Application Layer (Django): Executes business logic, runs ORM queries against PostgreSQL, and reads/writes to Redis caches.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#runserver'
    },
    scriptData: {
      prompt: 'Why must "python manage.py runserver" never be exposed to production traffic? Describe the complete production deployment architecture for a Django API.',
      framework: [
        { time: '0-15s', point: 'runserver Limitations: Single-threaded, unhardened against exploits, lacks process supervision, StatReloader wastes CPU.' },
        { time: '15-45s', point: 'WSGI/ASGI Layer: Deploy with Gunicorn or Uvicorn using a pre-fork worker pool scaled to CPU cores (2 * cores + 1).' },
        { time: '45-60s', point: 'Reverse Proxy: Place Nginx or CloudFront upfront for TLS termination, slow-client buffering, and static/media asset offloading.' }
      ],
      spokenScript: `"Django's runserver is strictly a development server designed for local iteration with hot file reloading via StatReloader. It is single-process, unhardened against security exploits, cannot handle concurrent socket I/O under load, and wastes CPU monitoring file changes.\n\nIn production, we deploy Django using an industrial WSGI/ASGI server like Gunicorn or Uvicorn, configuring a pre-fork worker pool sized around 2 to 4 workers per CPU core. In front of Gunicorn, we position a reverse proxy such as Nginx or AWS CloudFront. The reverse proxy handles TLS termination, buffers slow clients, enforces rate limiting, and offloads static and media files directly from disk or S3 without consuming expensive Python worker threads."`,
      buzzwords: ['Pre-fork worker model', 'StatReloader CPU overhead', 'Gunicorn / Uvicorn', 'Nginx reverse proxy', 'TLS termination & slow-client buffering'],
      juniorMistake: 'Thinking runserver --noreload is acceptable for a staging or production server.'
    }
  },

  // Q4: Migration Commands
  4: {
    id: 4,
    docSpecs: {
      overview: 'Django migrations represent database version control for your ORM models. The migration lifecycle relies on four primary management commands: `makemigrations` (inspects model changes and writes declarative Python migration files), `migrate` (executes pending migrations against the database within atomic transactions), `showmigrations` (displays migration application state), and `sqlmigrate` (prints the exact raw SQL executed by a migration without applying it).',
      table: {
        headers: ['Command', 'Primary Action', 'Database Modification?', 'Production CI/CD Role'],
        rows: [
          ['`makemigrations`', 'Generates new `.py` migration files from model diffs', 'NO (local files only)', 'Executed locally by developers; NEVER run in production deployment containers!'],
          ['`migrate`', 'Executes pending migration files against DB', 'YES (runs DDL statements)', 'Executed during automated release pipelines before web traffic is routed.'],
          ['`showmigrations`', 'Lists all migrations and checked status `[X]`', 'NO (read-only query)', 'Used in deployment health checks to verify DB schema alignment.'],
          ['`sqlmigrate <app> <num>`', 'Outputs raw SQL DDL generated for migration', 'NO (dry-run output)', 'Crucial for DBA reviews before applying high-risk index or table locks.']
        ]
      },
      admonitions: [
        {
          type: 'warning',
          title: 'Never Run makemigrations in Production Docker Containers',
          content: 'Running `makemigrations` in production is a critical operational anti-pattern. Migration files must be generated locally, committed to Git, and peer-reviewed. In CI/CD, run `python manage.py makemigrations --check --dry-run` to fail the build if a developer forgot to generate migration files!'
        },
        {
          type: 'tip',
          title: 'The django_migrations Table',
          content: 'Django tracks applied migrations inside the `django_migrations` database table. If a migration fails mid-way on a non-transactional DDL database (like MySQL), inspect this table to verify state.'
        }
      ],
      commands: [
        {
          label: 'The Production Migration Workflow',
          cmd: `# 1. Generate migrations locally and commit to Git\npython manage.py makemigrations accounts\n\n# 2. Inspect raw SQL before applying to production DB\npython manage.py sqlmigrate accounts 0002\n\n# 3. Apply migrations in release stage\npython manage.py migrate\n\n# 4. CI/CD check: fail if uncommitted model changes exist\npython manage.py makemigrations --check --dry-run`,
          lang: 'bash',
          description: 'Standard safe database schema migration commands.'
        }
      ],
      didYouKnow: {
        title: '💡 Atomic DDL in PostgreSQL vs MySQL',
        content: 'In PostgreSQL, DDL statements (like `CREATE TABLE` and `ALTER TABLE`) are fully transactional! If a migration fails halfway through on Postgres, Django rolls back the entire schema change. On MySQL, DDL statements trigger an implicit commit, leaving the database in a broken half-migrated state.'
      }
    },
    challenge: {
      title: 'Migration Dependency Graph & CI/CD Dry-Run Verification Drill',
      steps: [
        'Run `python manage.py showmigrations` to inspect applied vs pending migrations.',
        'Use `python manage.py sqlmigrate` to inspect the generated DDL for a specific migration.',
        'Execute `python manage.py makemigrations --check --dry-run` in your CI pipeline to detect uncommitted model modifications.',
        'Explain how zero-downtime database migrations handle column deprecations.'
      ],
      codeSnippet: `# Simulated verification of migration tracking in Django
from django.db.migrations.recorder import MigrationRecorder
from django.db import connection

recorder = MigrationRecorder(connection)
print("Migration Recorder Table Name:", recorder.Migration._meta.db_table)

# Fetch last 3 applied migrations
applied = recorder.applied_migrations()
print("Total applied migrations recorded:", len(applied))`,
      expectedOutput: `Migration Recorder Table Name: django_migrations
Total applied migrations recorded: (integer >= 0)`,
      interviewQuestion: 'Why should "makemigrations" never be run inside a production deployment container? How do you prevent developers from committing models without generating migrations?',
      interviewAnswer: 'Running `makemigrations` in a production container is dangerous because: 1) Containers typically run on ephemeral filesystems; newly generated migration files disappear when the container restarts, 2) Concurrent web workers launching simultaneously will race to generate duplicate migration files with conflicting timestamps, corrupting the migration graph, and 3) Production code should be immutable and deterministic.\n\nTo prevent developers from forgetting migrations, our CI/CD pipeline enforces a pre-merge check: `python manage.py makemigrations --check --dry-run`. If any model has been altered without a corresponding migration file in Git, this command exits with a non-zero exit code (`1`), immediately failing the CI build and preventing deployment.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/migrations/'
    },
    scriptData: {
      prompt: 'What are the core migration commands in Django? How does Django track migrations in the database, and how do you design zero-downtime database migrations in a high-traffic production service?',
      framework: [
        { time: '0-15s', point: 'Core Commands: makemigrations writes migration files; migrate executes DDL; sqlmigrate inspects raw SQL; showmigrations displays state.' },
        { time: '15-45s', point: 'Tracking Mechanics: Django records applied files in django_migrations; resolves dependencies as a Directed Acyclic Graph (DAG).' },
        { time: '45-60s', point: 'Zero-Downtime Deployment: Multi-phase deploys for column renames/drops: add column -> deploy dual write -> backfill -> deploy read -> drop column.' }
      ],
      spokenScript: `"In Django, database schema evolution is managed through its migration framework via four primary commands: 'makemigrations' inspects model definitions and generates declarative Python migration files; 'migrate' executes those migrations against the database within atomic transactions; 'showmigrations' displays the applied state; and 'sqlmigrate' outputs the exact raw SQL generated by a migration for DBA review.\n\nUnder the hood, Django tracks schema versioning in the 'django_migrations' database table. Each migration defines 'dependencies', forming a Directed Acyclic Graph (DAG) that Django traverses in topological order.\n\nIn our production architecture, we enforce two critical rules. First, 'makemigrations' is never run in production; we run 'makemigrations --check --dry-run' in CI to block PRs with uncommitted schema changes. Second, for zero-downtime deployments on tables with millions of rows, we never drop or rename columns in a single deploy. We use a three-phase rollout: first, add the new nullable column; second, deploy application code that writes to both columns while reading from the new one; third, backfill data; and finally, drop the old column once no active workers depend on it."`,
      buzzwords: ['makemigrations vs migrate', 'sqlmigrate raw DDL review', 'django_migrations tracking table', 'Migration DAG dependency graph', 'Zero-downtime multi-phase migrations', 'CI --check --dry-run gate'],
      juniorMistake: 'Running makemigrations in a Docker container entrypoint or renaming a column directly on a live high-traffic table without a multi-phase deploy.'
    }
  },

  // Q5: Createsuperuser Command
  5: {
    id: 5,
    docSpecs: {
      overview: 'The `python manage.py createsuperuser` command creates an administrative user with `is_staff=True` and `is_superuser=True`, granting unrestricted access to the Django Admin portal and permissions system. In modern automated environments (Docker, Kubernetes, CI/CD), superuser creation can be automated non-interactively using `--noinput` and environment variables (`DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`).',
      table: null,
      admonitions: [
        {
          type: 'tip',
          title: 'Automated Headless Superuser in Docker',
          content: 'In Docker startup scripts, automate superuser creation without interactive terminal prompts:\n```bash\nDJANGO_SUPERUSER_PASSWORD="strongpassword" python manage.py createsuperuser \\\n  --username admin \\\n  --email admin@co.com \\\n  --noinput || true\n```\nThe `|| true` ensures the container boots cleanly if the user already exists.'
        },
        {
          type: 'caution',
          title: 'Custom User Model Requirements',
          content: 'If your project uses a custom user model (`AUTH_USER_MODEL`), your custom manager MUST implement `create_superuser(username, email, password, **extra_fields)` and ensure `is_staff=True` and `is_superuser=True` are set, or `createsuperuser` will raise a `TypeError`.'
        }
      ],
      commands: [
        {
          label: 'Interactive vs Headless Automated Superuser Creation',
          cmd: `# 1. Interactive terminal prompt\npython manage.py createsuperuser\n\n# 2. Automated non-interactive creation in Dockerfile/CI\nexport DJANGO_SUPERUSER_PASSWORD="SecureProductionPassword123!"\npython manage.py createsuperuser \\\n  --noinput \\\n  --username sysadmin \\\n  --email ops@company.com`,
          lang: 'bash',
          description: 'Creating superuser accounts interactively and non-interactively via environment variables.'
        }
      ],
      didYouKnow: {
        title: '💡 is_staff vs is_superuser',
        content: '`is_staff=True` allows a user to log into the Django Admin site. `is_superuser=True` bypasses all permission checks, automatically granting every permission without explicitly assigning groups.'
      }
    },
    challenge: {
      title: 'Programmatic Superuser Creation & Custom User Manager Drill',
      steps: [
        'Import `get_user_model()` from `django.contrib.auth`.',
        'Verify whether a superuser exists using `User.objects.filter(is_superuser=True).exists()`.',
        'Demonstrate programmatic superuser creation via `User.objects.create_superuser(...)`.',
        'Verify password hashing using `check_password()` to ensure the password is never stored in plain text.'
      ],
      codeSnippet: `from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

User = get_user_model()

# 1. Programmatic creation
username = "lead_dev"
password = "SuperSecretPassword123!"

if not User.objects.filter(username=username).exists():
    admin_user = User.objects.create_superuser(
        username=username,
        email="dev@company.com",
        password=password
    )
    print("Created superuser:", admin_user.username)
    print("is_staff:", admin_user.is_staff)
    print("is_superuser:", admin_user.is_superuser)
    
    # 2. Verify Argon2/PBKDF2 Password Hashing
    print("Password stored as hash?", admin_user.password.startswith("pbkdf2_") or admin_user.password.startswith("argon2"))
    print("Password verification:", check_password(password, admin_user.password))`,
      expectedOutput: `Created superuser: lead_dev
is_staff: True
is_superuser: True
Password stored as hash? True
Password verification: True`,
      interviewQuestion: 'What is the difference between is_staff and is_superuser in Django\'s auth model? How do you automate superuser creation inside a Kubernetes container boot script?',
      interviewAnswer: 'In Django\'s authentication framework:\n- `is_staff` (boolean): Controls whether the user is permitted to log in to the Django Admin portal (`/admin/`). A user with `is_staff=True` can log in, but only sees models for which they have explicit permissions.\n- `is_superuser` (boolean): Grants the user all permissions automatically. A superuser bypasses all permission checks (`user.has_perm()` always returns `True`) without requiring specific group assignments.\n\nTo automate superuser creation in a Kubernetes pod or Docker entrypoint without human interaction, we pass credentials via environment variables (`DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`) and run `python manage.py createsuperuser --noinput`. We append `|| true` to prevent the container initialization script from crashing if the user already exists in the database.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#createsuperuser'
    },
    scriptData: {
      prompt: 'How does Django\'s createsuperuser command operate, how do is_staff and is_superuser differ in authorization checks, and how do you provision admin users securely in cloud environments?',
      framework: [
        { time: '0-15s', point: 'Command Functionality: createsuperuser provisions accounts with is_staff=True and is_superuser=True using Argon2/PBKDF2 password hashing.' },
        { time: '15-45s', point: 'Authorization Distinctions: is_staff allows admin portal login; is_superuser bypasses all individual permission checks unconditionally.' },
        { time: '45-60s', point: 'Cloud Provisioning: Never commit admin passwords; use --noinput with environment variables mounted from Kubernetes Secrets or AWS Secrets Manager.' }
      ],
      spokenScript: `"In Django, 'createsuperuser' is a management command that creates an administrative user with full system privileges. The command ensures passwords are securely hashed using Django's password hasher hierarchy—typically PBKDF2 or Argon2—so plain-text credentials never touch disk or database tables.\n\nWithin Django's authorization model, there is a clear distinction between 'is_staff' and 'is_superuser'. 'is_staff' is a gatekeeper flag that dictates whether a user can authenticate into the Django Admin dashboard at all. 'is_superuser' is an authorization bypass: when 'is_superuser' is True, Django's permission backends immediately grant every permission, ignoring individual permission records or group assignments.\n\nIn our automated Kubernetes deployments, we never log into production containers interactively. Instead, we configure a post-migration Kubernetes Job that runs 'createsuperuser --noinput', injecting credentials from Kubernetes Secrets via 'DJANGO_SUPERUSER_PASSWORD'. This guarantees secure, idempotent provisioning without human intervention or exposed credentials."`,
      buzzwords: ['createsuperuser --noinput', 'is_staff vs is_superuser', 'PBKDF2 / Argon2 password hashing', 'Kubernetes Secrets provisioning', 'Custom UserManager create_superuser', 'Idempotent bootstrap scripts'],
      juniorMistake: 'Hardcoding admin passwords in migration files or Dockerfiles instead of using environment variables and secrets managers.'
    }
  },

  // Q6: inspectdb Command
  6: {
    id: 6,
    docSpecs: {
      overview: '`python manage.py inspectdb` is Django\'s database reverse-engineering command. It introspects the database schema of an existing legacy database (tables, columns, primary keys, foreign keys) and outputs auto-generated Django model classes to standard output. By default, generated models include `managed = False` in their `Meta` class, instructing Django\'s migration engine not to modify or delete existing tables.',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'The managed = False Contract',
          content: 'Models created by `inspectdb` default to `managed = False`. This guarantees that running `python manage.py migrate` will NEVER alter, create, or drop these legacy tables. Django can read, write, and query them via the ORM while leaving DDL control to the existing database administrators.'
        },
        {
          type: 'caution',
          title: 'Manual Refinement Required',
          content: '`inspectdb` is a best-effort heuristic. It often assigns `TextField` where `CharField` is appropriate, cannot infer custom choice enums, and may miss foreign keys if database-level constraints were not formally declared in the legacy schema. Always review and refine the output.'
        }
      ],
      commands: [
        {
          label: 'Generating and Directing inspectdb Models',
          cmd: `# 1. Introspect entire legacy database into a new app models.py\npython manage.py inspectdb > legacy_app/models.py\n\n# 2. Introspect only specific tables\npython manage.py inspectdb users orders payments > billing/models.py`,
          lang: 'bash',
          description: 'Reverse-engineering legacy database schemas into Django ORM model classes.'
        }
      ],
      didYouKnow: {
        title: '💡 Multi-Database inspectdb',
        content: 'If you have multiple databases configured in `settings.DATABASES`, you can target a specific legacy replica using the `--database` flag: `python manage.py inspectdb --database legacy_pg`.'
      }
    },
    challenge: {
      title: 'Legacy Schema Reverse Engineering & managed=False Drill',
      steps: [
        'Inspect how `inspectdb` maps SQL data types (e.g. `VARCHAR` -> `CharField`, `INT` -> `IntegerField`).',
        'Verify the presence of `managed = False` in model `Meta`.',
        'Demonstrate that running `makemigrations` ignores `managed = False` models.',
        'Explain how to transition an unmanaged model into a fully managed Django model.'
      ],
      codeSnippet: `# Simulated inspection of a legacy unmanaged model
from django.db import models

class LegacyCustomer(models.Model):
    customer_id = models.IntegerField(primary_key=True)
    company_name = models.CharField(max_length=255)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False  # Django migrations will NEVER touch this table!
        db_table = 'legacy_customer_tbl'

print("Model table name:", LegacyCustomer._meta.db_table)
print("Is model managed by migrations?", LegacyCustomer._meta.managed)`,
      expectedOutput: `Model table name: legacy_customer_tbl
Is model managed by migrations? False`,
      interviewQuestion: 'What does "managed = False" mean in a Django Model Meta class? How does inspectdb handle foreign keys if foreign key constraints were not enforced at the database level?',
      interviewAnswer: '`managed = False` informs Django\'s migration subsystem that the underlying database table lifecycle is managed externally. When `migrate` runs, Django will not create, alter, or drop the table. However, the model retains full ORM capabilities: you can filter, save, update, and delete rows as normal.\n\nIf a legacy database did not declare formal foreign key constraints (e.g. storing raw integer `user_id` without a foreign key constraint), `inspectdb` cannot deduce the relationship and generates a plain `IntegerField`. The backend engineer must manually update the field to `models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_id")` so the ORM can perform joins and `select_related`.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#inspectdb'
    },
    scriptData: {
      prompt: 'How does Django\'s inspectdb command work, when would you use it in an enterprise backend migration, and what is the significance of "managed = False"?',
      framework: [
        { time: '0-15s', point: 'Command Purpose: inspectdb introspects existing database tables and auto-generates Django ORM models.' },
        { time: '15-45s', point: 'managed = False Safety: Prevents Django migrations from modifying legacy tables; allows safe ORM reads/writes without DDL risks.' },
        { time: '45-60s', point: 'Enterprise Migration Strategy: Use inspectdb to adopt legacy schemas; manually refine data types and foreign keys before enabling ORM queries.' }
      ],
      spokenScript: `"Django's 'inspectdb' is a powerful reverse-engineering command designed to integrate Django with existing, legacy databases. When executed, it queries the database's information schema and catalog tables, introspecting column types, primary keys, and constraints, and outputs auto-generated Django model classes.\n\nBy default, every model generated by 'inspectdb' includes 'managed = False' in its 'Meta' class. This is a critical safety guarantee: it tells Django's migration engine that this table is maintained externally. Running 'python manage.py migrate' will never execute CREATE, ALTER, or DROP TABLE statements on it, while still allowing your application to query and manipulate records through the full power of the Django ORM.\n\nIn our enterprise data migrations, inspectdb is the standard starting point when migrating legacy PHP, Java, or Rails databases to Django. We direct the output to a models file, manually refine field types—such as converting raw foreign key integers into proper 'models.ForeignKey' relationships with 'db_column'—and verify that indexes align with production query patterns."`,
      buzzwords: ['Database introspection', 'inspectdb reverse-engineering', 'managed = False guarantee', 'Legacy database adoption', 'information_schema introspection', 'Manual foreign key refinement'],
      juniorMistake: 'Changing managed = True on a legacy model immediately and running migrate, accidentally dropping or altering existing production tables.'
    }
  },

  // Q7: QuerySet all()
  7: {
    id: 7,
    docSpecs: {
      overview: 'In Django ORM, `Model.objects.all()` returns a `QuerySet` containing all records from the model\'s underlying database table. A critical architectural concept is that QuerySets are completely LAZY: calling `Model.objects.all()` does NOT execute any database query or consume database I/O. Django only hits the database when the QuerySet is evaluated (e.g. during iteration, slicing with step, serialization, or calling `len()`/`list()`).',
      table: null,
      admonitions: [
        {
          type: 'note',
          title: 'QuerySet Laziness Under the Hood',
          content: 'You can chain filters, exclusions, and orderings indefinitely: `qs = User.objects.all().filter(is_active=True).order_by("-date_joined")`. Django builds an internal SQL AST. Zero database queries are sent until the data is actually accessed.'
        },
        {
          type: 'caution',
          title: 'Memory Exhaustion with Large Tables',
          content: 'Never call `list(Model.objects.all())` or iterate over millions of rows in a web view! It constructs Python model instances for every database row in heap RAM, causing Out-Of-Memory crashes. Use `.iterator(chunk_size=2000)` or pagination (`LIMIT/OFFSET`).'
        }
      ],
      commands: [
        {
          label: 'Inspecting QuerySet SQL without Execution',
          cmd: `# 1. Lazy QuerySet creation (Zero SQL executed!)\nall_users = User.objects.all()\n\n# 2. Inspect generated SQL string\nprint("Generated SQL:", str(all_users.query))\n\n# 3. Evaluation points (Triggers real SQL query):\n# for user in all_users: ...       # Iteration\n# count = all_users.count()        # Executes SELECT COUNT(*)\n# user_list = list(all_users)      # Materializes all rows into RAM`,
          lang: 'python',
          description: 'Showing QuerySet laziness and inspecting raw SQL query strings.'
        }
      ],
      didYouKnow: {
        title: '💡 QuerySet Internal Result Cache',
        content: 'When a QuerySet is evaluated, Django caches the fetched model instances in an internal `_result_cache` list. Iterating over the same QuerySet a second time reads from memory without hitting the database again.'
      }
    },
    challenge: {
      title: 'QuerySet Laziness & Evaluation Points Drill',
      steps: [
        'Demonstrate that calling `all()` generates a QuerySet without executing SQL.',
        'Inspect the raw SQL query generated via `qs.query`.',
        'Identify the 5 primary evaluation triggers: iteration (`for`), `list()`, `len()`, `bool()`, and slicing with step.',
        'Demonstrate memory streaming using `iterator()`.'
      ],
      codeSnippet: `from django.contrib.auth import get_user_model
User = get_user_model()

# 1. Laziness demonstration
qs = User.objects.all()
print("1. Is QuerySet evaluated yet?", qs._result_cache is not None)

# 2. Inspect generated SQL
print("2. Raw SQL generated by ORM:")
print("  ", qs.query)

# 3. Evaluation trigger
print("\\nEvaluating QuerySet via count()...")
print("Total records found:", qs.count())`,
      expectedOutput: `1. Is QuerySet evaluated yet? False
2. Raw SQL generated by ORM:
   SELECT "auth_user"."id", ... FROM "auth_user"
Evaluating QuerySet via count()...
Total records found: (integer >= 0)`,
      interviewQuestion: 'What does it mean that Django QuerySets are lazy? What exact operations trigger QuerySet evaluation?',
      interviewAnswer: 'A QuerySet is lazy because creating it does not involve any database activity. You can construct, chain, slice, and pass QuerySets around your entire codebase without executing a single SQL query.\n\nEvaluation occurs only when data is explicitly requested. The exact evaluation triggers are:\n1. Iteration: `for obj in qs:`\n2. Slicing with a step parameter: `qs[::2]`\n3. Sizing with `len()`: calls `SELECT *` and measures materialized objects (use `.count()` instead for `SELECT COUNT(*)`)\n4. Type casting: `list(qs)`, `tuple(qs)`\n5. Boolean checks: `bool(qs)` or `if qs:` (use `.exists()` instead to avoid loading rows)\n6. Serialization: passing to serializers or pickling.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/'
    },
    scriptData: {
      prompt: 'How does Model.objects.all() work in Django? Explain QuerySet laziness, how the internal result cache operates, and common performance mistakes junior developers make with evaluation triggers.',
      framework: [
        { time: '0-15s', point: 'Laziness: Model.objects.all() constructs a QuerySet AST; zero SQL is executed until data is evaluated.' },
        { time: '15-45s', point: 'Evaluation & Result Cache: Evaluated upon iteration, list(), or bool(); results are cached in _result_cache for reuse.' },
        { time: '45-60s', point: 'Junior Pitfalls: Using len(qs) instead of qs.count(), or if qs: instead of qs.exists(), causing unnecessary full table loads.' }
      ],
      spokenScript: `"In Django, calling 'Model.objects.all()' returns a QuerySet representing a collection of objects from the database. The most critical architectural concept behind QuerySets is that they are entirely lazy. Invoking '.all()' or chaining multiple filters does not execute a database query; it simply constructs an internal Abstract Syntax Tree of the SQL query.\n\nDjango only hits the database when the QuerySet is evaluated—such as during a 'for' loop, casting with 'list()', or checking truthiness with 'if qs:'. Once evaluated, Django caches the resulting model instances in memory inside '_result_cache', ensuring subsequent iterations reuse the in-memory cache.\n\nA classic junior mistake is writing 'if len(users) > 0:' or 'if users:'. Both triggers evaluate the full QuerySet, loading every single record into application RAM. In production code reviews, we enforce two best practices: use 'qs.exists()' for boolean existence checks, which generates a lightweight 'SELECT 1 ... LIMIT 1', and use 'qs.count()' for sizing, which executes an optimized 'SELECT COUNT(*)' directly in PostgreSQL."`,
      buzzwords: ['Lazy evaluation', 'QuerySet AST construction', 'Evaluation triggers', '_result_cache in-memory buffer', 'qs.exists() vs bool(qs)', 'qs.count() vs len(qs)'],
      juniorMistake: 'Checking "if len(qs) > 0" or "if qs:" on tables with millions of rows, loading the entire table into memory just to check if it is not empty.'
    }
  },

  // Q8: QuerySet filter()
  8: {
    id: 8,
    docSpecs: {
      overview: '`Model.objects.filter(**kwargs)` returns a new lazy `QuerySet` containing objects that match the specified lookup parameters. Filters translate to SQL `WHERE` clauses. Multiple filter arguments passed in a single call or chained consecutively (`.filter(a=1).filter(b=2)`) are joined by SQL `AND` operators. Django provides powerful field lookups (`__exact`, `__iexact`, `__contains`, `__icontains`, `__in`, `__gt`, `__lte`, `__range`) using double-underscore syntax.',
      table: {
        headers: ['Field Lookup', 'Generated SQL Equivalent', 'Case-Sensitive?', 'Index Performance Note'],
        rows: [
          ['`name__exact="Alice"`', '`WHERE name = \'Alice\'`', 'YES', 'Utilizes standard B-Tree index with peak speed.'],
          ['`name__iexact="Alice"`', '`WHERE UPPER(name) = UPPER(\'Alice\')`', 'NO', 'Bypasses standard B-Tree index unless an expression/functional index exists.'],
          ['`name__contains="lic"`', '`WHERE name LIKE \'%lic%\'`', 'YES', 'Full table scan (leading wildcard `%` cannot use standard B-Tree indexes; requires Trigram/GIN index).'],
          ['`status__in=["A", "P"]`', '`WHERE status IN (\'A\', \'P\')`', 'N/A', 'Optimized index range lookup in PostgreSQL.'],
          ['`created_at__range=(d1, d2)`', '`WHERE created_at BETWEEN d1 AND d2`', 'N/A', 'Highly efficient index range scan for time-series logs.']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The Leading Wildcard __icontains Performance Trap',
          content: 'Avoid using `__icontains` or `__contains` on large production tables without specialized indexing! `LIKE \'%keyword%\'` cannot use standard B-Tree database indexes, forcing PostgreSQL to perform a sequential table scan across all disk pages. Use PostgreSQL Full-Text Search or Trigram indexes (`pg_trgm`).'
        },
        {
          type: 'tip',
          title: 'Chaining vs Multiple Arguments in M2M Filtering',
          content: 'Be careful when filtering Many-to-Many relationships! `Book.objects.filter(authors__first="A", authors__last="B")` requires the SAME author to match both conditions. Chaining `Book.objects.filter(authors__first="A").filter(authors__last="B")` allows DIFFERENT authors to satisfy the conditions independently!'
        }
      ],
      commands: [
        {
          label: 'Filter Lookups & Chained AND Expressions',
          cmd: `# 1. Exact vs Case-insensitive lookup\nusers_exact = User.objects.filter(username__exact="john_doe")\nusers_case = User.objects.filter(email__iexact="JOHN@CO.COM")\n\n# 2. Range and IN lookups\nactive_admins = User.objects.filter(\n    is_active=True,\n    is_staff=True,\n    id__in=[1, 2, 3]\n)\n\n# 3. Inspect generated SQL WHERE clause\nprint(active_admins.query)`,
          lang: 'python',
          description: 'Constructing standard SQL WHERE clauses using Django field lookups.'
        }
      ],
      didYouKnow: {
        title: '💡 Double-Underscore Relationship Traversal',
        content: 'Django uses double-underscore `__` not just for lookups, but to traverse database relationships across tables: `Order.objects.filter(customer__address__city="New York")` automatically joins the customer and address tables!'
      }
    },
    challenge: {
      title: 'Field Lookups & Relationship Traversal Drill',
      steps: [
        'Construct a filter with `__gte` and `__lte` numeric bounds.',
        'Use double-underscore `__` to filter across a related foreign key model.',
        'Inspect the generated SQL query to verify the `WHERE` clause and table `JOIN`.',
        'Compare `filter()` behavior when 0 records match (returns empty QuerySet) vs `get()`.'
      ],
      codeSnippet: `from django.contrib.auth import get_user_model
User = get_user_model()

# 1. Numeric and Boolean Filtering
active_users = User.objects.filter(is_active=True, id__gte=1)
print("1. SQL with WHERE clause:")
print("  ", active_users.query)

# 2. Safe empty result behavior
missing_users = User.objects.filter(username="non_existent_user_99999")
print("\\n2. Does filter raise error when 0 match?", missing_users.exists())
print("   Returned type:", type(missing_users))`,
      expectedOutput: `1. SQL with WHERE clause:
   SELECT ... FROM "auth_user" WHERE ("auth_user"."is_active" AND "auth_user"."id" >= 1)
2. Does filter raise error when 0 match? False
   Returned type: <class 'django.db.models.query.QuerySet'>`,
      interviewQuestion: 'How does Django translate filter() lookups to SQL? What is the difference between passing multiple arguments to filter() versus chaining multiple filter() calls when querying Many-to-Many fields?',
      interviewAnswer: 'Django translates `.filter(**kwargs)` into SQL `WHERE` clauses. In single-table queries, passing multiple arguments `.filter(a=1, b=2)` and chaining `.filter(a=1).filter(b=2)` generate identical SQL with an `AND` operator.\n\nHowever, in Many-to-Many or reverse ForeignKey relationships, they behave fundamentally differently:\n- Single filter `.filter(tags__name="urgent", tags__priority=1)` requires that a SINGLE related tag record satisfies BOTH conditions simultaneously.\n- Chained filters `.filter(tags__name="urgent").filter(tags__priority=1)` generate two separate SQL `JOIN` statements on the related table. This allows the conditions to be satisfied by DIFFERENT related tags (e.g. one tag is "urgent" and a completely different tag has priority 1). This is a frequent source of insidious query bugs.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#filter'
    },
    scriptData: {
      prompt: 'How does Model.objects.filter() work in Django ORM? Explain how field lookups generate SQL WHERE clauses, the indexing hazard of __icontains, and the difference between chained filters on Many-to-Many relations.',
      framework: [
        { time: '0-15s', point: 'Filter Semantics: filter(**kwargs) returns a lazy QuerySet translating field lookups into SQL WHERE conditions joined by AND.' },
        { time: '15-45s', point: 'Lookups & Indexing: Lookups like __exact use B-Tree indexes; __icontains uses leading wildcards, forcing slow full table scans.' },
        { time: '45-60s', point: 'M2M Nuance: Single filter evaluates conditions against the same related row; chained filters allow matching across different related rows.' }
      ],
      spokenScript: `"In Django, 'Model.objects.filter()' is the primary method for querying subsets of data from the database. Like all QuerySet methods, it is lazy and compiles down to SQL 'WHERE' clauses joined by 'AND' operators.\n\nDjango uses double-underscore syntax for field lookups and cross-table joins. For example, '__exact' generates an equality check, while '__in' generates a SQL 'IN' clause. A vital performance concern in high-scale backends is the use of '__icontains'. Because '__icontains' compiles to a case-insensitive 'LIKE %term%' query, the leading wildcard prevents PostgreSQL from using standard B-Tree indexes, triggering an expensive full-table sequential scan. For search functionality, we mandate PostgreSQL Trigram or Full-Text search instead.\n\nAnother advanced nuance involves Many-to-Many filtering. If you write '.filter(skills__name=\"Python\", skills__level=\"Senior\")' in a single call, Django requires that the same skill record satisfies both conditions. However, if you chain them—'.filter(skills__name=\"Python\").filter(skills__level=\"Senior\")'—Django joins the related table twice, matching candidates who have any Python skill and any other senior-level skill."`,
      buzzwords: ['SQL WHERE clause generation', 'Double-underscore lookups', 'B-Tree vs Sequential scan', '__icontains leading wildcard trap', 'Many-to-Many single vs chained filter joins', 'PostgreSQL Trigram indexing'],
      juniorMistake: 'Using __icontains on production tables with millions of rows without realizing it forces a full database table scan.'
    }
  },

  // Q9: QuerySet get()
  9: {
    id: 9,
    docSpecs: {
      overview: 'Unlike `filter()`, which returns a lazy collection, `Model.objects.get(**kwargs)` eagerly executes a database query and returns a single model instance matching the lookup. `get()` enforces a strict contract: it expects exactly ONE matching record. If zero records match, it raises `Model.DoesNotExist`. If more than one record matches, it raises `Model.MultipleObjectsReturned`.',
      table: {
        headers: ['Method', 'Returns on 1 Match', 'Returns on 0 Matches', 'Returns on >1 Matches', 'Evaluation Behavior'],
        rows: [
          ['`Model.objects.get()`', 'Single Model instance', 'Raises `Model.DoesNotExist`', 'Raises `Model.MultipleObjectsReturned`', 'Eager: immediately queries DB with `LIMIT 21`'],
          ['`Model.objects.filter().first()`', 'Single Model instance', 'Returns `None` (safe fallback)', 'Returns the 1st match (ignoring extras)', 'Lazy until `.first()` is evaluated; never throws'],
          ['`get_object_or_404(Model, ...)`', 'Single Model instance', 'Raises `django.http.Http404`', 'Raises `Model.MultipleObjectsReturned`', 'Eager: standard shortcut for web view endpoints']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Always Handle DoesNotExist and MultipleObjectsReturned',
          content: 'Whenever calling `.get()` on fields that do not have a unique database constraint (`unique=True`), always wrap the call in a `try/except (Model.DoesNotExist, Model.MultipleObjectsReturned):` block to prevent unhandled 500 internal server errors.'
        },
        {
          type: 'tip',
          title: 'The LIMIT 21 Optimization',
          content: 'Why does Django generate `LIMIT 21` when you call `.get()`? Because Django needs to know if MORE than one object exists! Limiting to 21 rows in SQL prevents fetching thousands of rows while allowing Django to detect if multiple objects returned.'
        }
      ],
      commands: [
        {
          label: 'Safe get() Execution with Try-Except & get_object_or_404',
          cmd: `from django.shortcuts import get_object_or_404\nfrom django.core.exceptions import ObjectDoesNotExist\n\n# 1. Standard pattern handling both exceptions\ntry:\n    user = User.objects.get(id=user_id)\nexcept User.DoesNotExist:\n    user = None\nexcept User.MultipleObjectsReturned:\n    logger.error("Data corruption: duplicate user ID found!")\n    user = User.objects.filter(id=user_id).first()\n\n# 2. Idiomatic View Shortcut (returns 404 response on missing)\n# user = get_object_or_404(User, id=user_id, is_active=True)`,
          lang: 'python',
          description: 'Handling DoesNotExist, MultipleObjectsReturned, and get_object_or_404.'
        }
      ],
      didYouKnow: {
        title: '💡 DoesNotExist Exception Inheritance',
        content: '`MyModel.DoesNotExist` inherits from `django.core.exceptions.ObjectDoesNotExist`. If you write a generic utility function handling multiple models, you can catch `ObjectDoesNotExist` to intercept missing records across all Django models.'
      }
    },
    challenge: {
      title: 'get() Exception Handling & .filter().first() Drill',
      steps: [
        'Attempt to fetch a non-existent record using `User.objects.get(username="missing")` and catch `User.DoesNotExist`.',
        'Compare this with `User.objects.filter(username="missing").first()`, observing that it returns `None` safely.',
        'Demonstrate that `User.DoesNotExist` is an instance of `ObjectDoesNotExist`.',
        'Explain why `.get()` is preferred over `.first()` when data uniqueness is a business requirement.'
      ],
      codeSnippet: `from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

# 1. Catching DoesNotExist
try:
    User.objects.get(username="definitely_does_not_exist_9999")
except User.DoesNotExist as err:
    print("Caught expected DoesNotExist:", type(err).__name__)
    print("Is instance of ObjectDoesNotExist?", isinstance(err, ObjectDoesNotExist))

# 2. Safe fallback via filter().first()
user_or_none = User.objects.filter(username="definitely_does_not_exist_9999").first()
print("\\nfilter().first() result for missing record:", user_or_none)`,
      expectedOutput: `Caught expected DoesNotExist: DoesNotExist
Is instance of ObjectDoesNotExist? True

filter().first() result for missing record: None`,
      interviewQuestion: 'What are the two specific exceptions that Model.objects.get() can raise? When would you use Model.objects.get() versus Model.objects.filter().first() in a production API?',
      interviewAnswer: '`Model.objects.get()` can raise two exceptions:\n1. `Model.DoesNotExist`: Raised when zero records match the query.\n2. `Model.MultipleObjectsReturned`: Raised when two or more records match the query.\n\nIn production API design:\n- Use `get()` when business logic strictly requires that exactly one entity exists (such as fetching a user by unique `id` or primary key). If duplicate records exist, `MultipleObjectsReturned` immediately surfaces data corruption in your database rather than silently masking it.\n- Use `.filter().first()` when an entity is optional or when retrieving the latest record from a non-unique collection (e.g. `user.orders.order_by("-created_at").first()`). `.first()` returns `None` safely without throwing an exception.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#get'
    },
    scriptData: {
      prompt: 'What happens when Model.objects.get() is called in Django? Compare its behavior and exception contract with filter().first() and explain how to handle missing entities gracefully in REST APIs.',
      framework: [
        { time: '0-15s', point: 'Contract: get() eagerly retrieves exactly one record; raises DoesNotExist if 0 match, or MultipleObjectsReturned if >1 match.' },
        { time: '15-45s', point: 'get() vs filter().first(): filter().first() safely returns None without throwing; get() enforces data integrity and uniqueness.' },
        { time: '45-60s', point: 'API Integration: In Django REST Framework / views, use get_object_or_404() or handle DoesNotExist to return clean 404 HTTP responses.' }
      ],
      spokenScript: `"In Django, 'Model.objects.get()' is used to retrieve a single specific model instance from the database. Unlike 'filter()', which returns a lazy QuerySet collection, 'get()' evaluates immediately and enforces a strict contract: it expects exactly one matching record.\n\nIf no records match, it raises 'Model.DoesNotExist'; if more than one record matches, it raises 'Model.MultipleObjectsReturned'. Both exceptions are subclasses of 'django.core.exceptions.ObjectDoesNotExist'.\n\nWhen designing REST APIs, choosing between '.get()' and '.filter().first()' depends on our business invariants. If we are retrieving a resource by a unique primary key—such as '/api/orders/{id}'—we use 'get()' or 'get_object_or_404()'. If a bug causes duplicate keys, 'get()' immediately alerts us via 'MultipleObjectsReturned', preventing silent data corruption. Conversely, if an item is optional—such as checking for an active discount code—we use '.filter().first()', which gracefully returns 'None' without raising an exception."`,
      buzzwords: ['Model.DoesNotExist exception', 'Model.MultipleObjectsReturned exception', 'get_object_or_404 shortcut', 'Data integrity enforcement', '.filter().first() safe fallback', 'LIMIT 21 database query'],
      juniorMistake: 'Using .get() without a try-except block on non-unique fields, causing unhandled 500 errors whenever multiple records exist.'
    }
  }
};
