import { PYTHON_QUESTIONS, PYTHON_DAYS, PYTHON_VIDEO_ID, PYTHON_VIDEO_BASE_URL } from './pythonData.js';
import { DJANGO_DAYS, DJANGO_VIDEO_ID, DJANGO_VIDEO_BASE_URL } from './djangoData.js';

export { DJANGO_VIDEO_ID, DJANGO_VIDEO_BASE_URL };

// Keep legacy exports for backward compatibility
export const VIDEO_ID = DJANGO_VIDEO_ID;
export const VIDEO_BASE_URL = DJANGO_VIDEO_BASE_URL;

export const TRACKS = [
  {
    id: 'django',
    name: 'Django',
    fullName: 'Django Framework',
    badge: '54 Questions • 18 Days',
    icon: '⚡',
  },
  {
    id: 'python',
    name: 'Python',
    fullName: 'Python Core & Advanced',
    badge: '51 Questions • 17 Days',
    icon: '🐍',
  },
];

export const DAYS_ROADMAP = DJANGO_DAYS;

export const QUESTIONS_DATA = [
  {
    id: 1,
    day: 1,
    dayIndex: 1,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the command to install Django and to know about its version?',
    startTime: '01:01',
    endTime: '01:37',
    startSeconds: 61,
    endSeconds: 97,
    tags: ['CLI', 'Installation', 'pip'],
    tip: 'pip install django && python -m django --version',
    summary: 'Install Django via pip in a virtual environment. Check the version using python -m django --version or django.get_version() in Python shell.',
    articles: [
      {
        title: 'Official Django Installation Guide',
        url: 'https://docs.djangoproject.com/en/stable/intro/install/',
        source: 'Django Docs'
      },
      {
        title: 'How to check Django version and environment',
        url: 'https://docs.djangoproject.com/en/stable/faq/install/#how-do-i-know-what-version-of-django-is-installed',
        source: 'Django FAQ'
      }
    ]
  },
  {
    id: 2,
    day: 1,
    dayIndex: 2,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the command to create a project and app in Django?',
    startTime: '01:37',
    endTime: '02:10',
    startSeconds: 97,
    endSeconds: 130,
    tags: ['CLI', 'django-admin', 'startproject', 'startapp'],
    tip: 'django-admin startproject <name> & python manage.py startapp <name>',
    summary: 'A project is the overall web application configuration container. An app is an individual modular component (e.g., blog, accounts, cart) created with startapp.',
    articles: [
      {
        title: 'Writing your first Django app: Tutorial Part 1',
        url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
        source: 'Django Docs'
      },
      {
        title: 'django-admin and manage.py commands reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#startproject',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 3,
    day: 1,
    dayIndex: 3,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the command to run a project in Django?',
    startTime: '02:10',
    endTime: '02:57',
    startSeconds: 130,
    endSeconds: 177,
    tags: ['CLI', 'runserver', 'Dev Server'],
    tip: 'python manage.py runserver [optional_ip:port]',
    summary: 'Runs the lightweight development WSGI server. By default listens on 127.0.0.1:8000. For production, use Gunicorn, uWSGI, or Daphne instead.',
    articles: [
      {
        title: 'runserver Command Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#runserver',
        source: 'Django Docs'
      },
      {
        title: 'How to deploy Django in production',
        url: 'https://docs.djangoproject.com/en/stable/howto/deployment/wsgi/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 4,
    day: 2,
    dayIndex: 1,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the command for migrations in Django?',
    startTime: '02:57',
    endTime: '04:15',
    startSeconds: 177,
    endSeconds: 255,
    tags: ['Migrations', 'makemigrations', 'migrate', 'sqlmigrate'],
    tip: 'makemigrations (create migration files) and migrate (apply to DB)',
    summary: 'Migrations are Django way of propagating changes you make to your models into your database schema. makemigrations packages changes; migrate executes SQL.',
    articles: [
      {
        title: 'Django Migrations: Complete Guide',
        url: 'https://docs.djangoproject.com/en/stable/topics/migrations/',
        source: 'Django Docs'
      },
      {
        title: 'Django Migrations: A Primer',
        url: 'https://realpython.com/django-migrations-a-primer/',
        source: 'Real Python'
      }
    ]
  },
  {
    id: 5,
    day: 2,
    dayIndex: 2,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the Command To Create a Superuser in Django?',
    startTime: '04:15',
    endTime: '04:47',
    startSeconds: 255,
    endSeconds: 287,
    tags: ['Auth', 'Admin', 'createsuperuser'],
    tip: 'python manage.py createsuperuser',
    summary: 'Prompts for username, email, and password. Creates a User with is_staff=True and is_superuser=True with full admin permissions.',
    articles: [
      {
        title: 'createsuperuser Command Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#createsuperuser',
        source: 'Django Docs'
      },
      {
        title: 'Django Admin Site Quickstart',
        url: 'https://docs.djangoproject.com/en/stable/intro/tutorial02/#introducing-the-django-admin',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 6,
    day: 2,
    dayIndex: 3,
    partName: 'Part 1: QuerySet & Commands',
    title: 'What is the Django command to view a database schema of an existing (or legacy) database?',
    startTime: '04:47',
    endTime: '04:58',
    startSeconds: 287,
    endSeconds: 298,
    tags: ['Database', 'inspectdb', 'Legacy DB'],
    tip: 'python manage.py inspectdb [table_name]',
    summary: 'Introspects existing database tables and generates Django Model classes. Output can be redirected to models.py: python manage.py inspectdb > models.py.',
    articles: [
      {
        title: 'inspectdb Command Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#inspectdb',
        source: 'Django Docs'
      },
      {
        title: 'Integrating Django with a Legacy Database',
        url: 'https://docs.djangoproject.com/en/stable/howto/legacy-databases/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 7,
    day: 3,
    dayIndex: 1,
    partName: 'Part 1: QuerySet & Commands',
    title: 'How to view all items in the Model using Django QuerySet?',
    startTime: '04:58',
    endTime: '05:20',
    startSeconds: 298,
    endSeconds: 320,
    tags: ['ORM', 'QuerySet', 'all()'],
    tip: 'ModelName.objects.all()',
    summary: 'Returns a QuerySet containing all database records for that model. QuerySets are lazily evaluated when iterated or indexed.',
    articles: [
      {
        title: 'QuerySet API: all() Method',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#all',
        source: 'Django Docs'
      },
      {
        title: 'Making Queries in Django',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 8,
    day: 3,
    dayIndex: 2,
    partName: 'Part 1: QuerySet & Commands',
    title: 'How to filter items in the Model using Django QuerySet?',
    startTime: '05:20',
    endTime: '05:44',
    startSeconds: 320,
    endSeconds: 344,
    tags: ['ORM', 'filter()', 'Lookups'],
    tip: 'ModelName.objects.filter(field=value, other_field__exact=val)',
    summary: 'Returns a new QuerySet matching lookup parameters. Supports double-underscore field lookups like __contains, __exact, __gte, and __startswith.',
    articles: [
      {
        title: 'QuerySet filter() Method Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#filter',
        source: 'Django Docs'
      },
      {
        title: 'Field Lookups Reference (contains, in, gte)',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#field-lookups',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 9,
    day: 3,
    dayIndex: 3,
    partName: 'Part 1: QuerySet & Commands',
    title: 'How to get a particular item in the Model using Django QuerySet?',
    startTime: '05:44',
    endTime: '06:03',
    startSeconds: 344,
    endSeconds: 363,
    tags: ['ORM', 'get()', 'Exceptions'],
    tip: 'ModelName.objects.get(id=val)',
    summary: 'Returns exactly ONE model instance. Raises Model.DoesNotExist if not found, or Model.MultipleObjectsReturned if more than one match exists.',
    articles: [
      {
        title: 'QuerySet get() Method Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#get',
        source: 'Django Docs'
      },
      {
        title: 'get_object_or_404 shortcut',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/shortcuts/#get-object-or-404',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 10,
    day: 4,
    dayIndex: 1,
    partName: 'Part 1: QuerySet & Commands',
    title: 'How to delete/insert/update an object using QuerySet in Django?',
    startTime: '06:03',
    endTime: '07:03',
    startSeconds: 363,
    endSeconds: 423,
    tags: ['ORM', 'CRUD', 'create', 'update', 'delete'],
    tip: 'create(), save(), update(field=val), delete()',
    summary: 'Insert: Model.objects.create(..) or obj = Model(..); obj.save(). Update: QuerySet.update() runs bulk SQL. Delete: QuerySet.delete() removes objects.',
    articles: [
      {
        title: 'Creating and Updating Objects',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#creating-objects',
        source: 'Django Docs'
      },
      {
        title: 'Deleting Objects Reference',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#deleting-objects',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 11,
    day: 4,
    dayIndex: 2,
    partName: 'Part 1: QuerySet & Commands',
    title: 'How can you combine multiple QuerySets in a View?',
    startTime: '07:03',
    endTime: '09:14',
    startSeconds: 423,
    endSeconds: 554,
    tags: ['ORM', 'union()', 'itertools.chain'],
    tip: 'qs1.union(qs2), qs1 | qs2 (same model), or itertools.chain(qs1, qs2)',
    summary: 'For the same model, use bitwise OR operator (qs1 | qs2). For differing models with identical fields, use .union(). Otherwise, use itertools.chain in Python.',
    articles: [
      {
        title: 'QuerySet union() Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#union',
        source: 'Django Docs'
      },
      {
        title: 'Combining QuerySets with | Operator',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#or',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 12,
    day: 4,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Explain Django Architecture? Explain Model, Template, and Views.',
    startTime: '09:14',
    endTime: '13:29',
    startSeconds: 554,
    endSeconds: 809,
    tags: ['Architecture', 'MVT', 'Model', 'View', 'Template'],
    tip: 'Django uses MVT: Model (Data), View (Business Logic), Template (Presentation)',
    summary: 'Model handles database structure and logic. View processes requests and retrieves data. Template displays data in HTML. Django acts as Controller.',
    articles: [
      {
        title: 'Django Design Philosophies',
        url: 'https://docs.djangoproject.com/en/stable/misc/design-philosophies/',
        source: 'Django Docs'
      },
      {
        title: 'Understanding MVT Architecture in Django',
        url: 'https://www.geeksforgeeks.org/django-project-mvt-structure/',
        source: 'GeeksforGeeks'
      }
    ]
  },
  {
    id: 13,
    day: 5,
    dayIndex: 1,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Explain how a request is processed in Django?',
    startTime: '13:29',
    endTime: '18:25',
    startSeconds: 809,
    endSeconds: 1105,
    tags: ['Request Flow', 'Middleware', 'URLconf', 'WSGI'],
    tip: 'Web Server -> WSGI/ASGI -> Middleware -> URLconf -> View -> Template -> Response',
    summary: 'HTTP Request arrives at web server -> Passed through WSGI handler -> Middleware process_request -> URL dispatcher matches URL pattern -> View executes logic -> Response passes through middleware -> Sent to client.',
    articles: [
      {
        title: 'How Django Processes a Request',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/urls/#how-django-processes-a-request',
        source: 'Django Docs'
      },
      {
        title: 'Django Middleware Architecture',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 14,
    day: 5,
    dayIndex: 2,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'What is the difference between a project and an app in Django?',
    startTime: '18:25',
    endTime: '22:33',
    startSeconds: 1105,
    endSeconds: 1353,
    tags: ['Basics', 'Project vs App'],
    tip: 'Project is the website/container; an app is a reusable, modular component',
    summary: 'A project is a collection of configurations and apps for a particular website. An app is a web application that does something (e.g. polls, accounts). A project can contain many apps.',
    articles: [
      {
        title: 'Difference between Project and App',
        url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/#creating-a-project',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 15,
    day: 5,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Which is the default database in the settings file in Django?',
    startTime: '22:33',
    endTime: '22:41',
    startSeconds: 1353,
    endSeconds: 1361,
    tags: ['Database', 'SQLite', 'settings.py'],
    tip: 'SQLite3 (django.db.backends.sqlite3)',
    summary: 'Django ships with SQLite3 configured out of the box in settings.py DATABASES. It is file-based and requires zero external database server setup.',
    articles: [
      {
        title: 'DATABASES Settings Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/settings/#databases',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 16,
    day: 6,
    dayIndex: 1,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Why is Django called a loosely coupled framework?',
    startTime: '22:41',
    endTime: '22:52',
    startSeconds: 1361,
    endSeconds: 1372,
    tags: ['Design Principles', 'Loose Coupling'],
    tip: 'Components (models, templates, views) are independent and pluggable',
    summary: 'A fundamental goal is loose coupling: each layer of the framework does not know about the other layers unless absolutely necessary, making components easily interchangeable.',
    articles: [
      {
        title: 'Design Philosophies: Loose Coupling',
        url: 'https://docs.djangoproject.com/en/stable/misc/design-philosophies/#loose-coupling',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 17,
    day: 6,
    dayIndex: 2,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Which is the default port for the Django development server?',
    startTime: '22:52',
    endTime: '24:15',
    startSeconds: 1372,
    endSeconds: 1455,
    tags: ['Server', 'Port 8000'],
    tip: 'Port 8000 (127.0.0.1:8000)',
    summary: 'The runserver command defaults to IP 127.0.0.1 on port 8000. You can override it via: python manage.py runserver 8080 or 0.0.0.0:8000.',
    articles: [
      {
        title: 'Django runserver Port Options',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/#runserver',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 18,
    day: 6,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Explain the Migration in Django.',
    startTime: '24:15',
    endTime: '26:31',
    startSeconds: 1455,
    endSeconds: 1591,
    tags: ['Migrations', 'Schema', 'Version Control'],
    tip: 'Version control system for database schemas synchronized with models.py',
    summary: 'Migrations are Python files where you describe changes to your models. Django compares your current models with historical migration files to compute differences.',
    articles: [
      {
        title: 'Django Migrations Workflow',
        url: 'https://docs.djangoproject.com/en/stable/topics/migrations/#workflow',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 19,
    day: 7,
    dayIndex: 1,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'What is Django ORM?',
    startTime: '26:31',
    endTime: '28:24',
    startSeconds: 1591,
    endSeconds: 1704,
    tags: ['ORM', 'Database', 'SQL Abstraction'],
    tip: 'Object-Relational Mapper that maps Python classes to database tables',
    summary: 'Provides an abstraction over SQL databases. Allows developers to interact with PostgreSQL, MySQL, SQLite, and Oracle using pure Python objects without writing raw SQL.',
    articles: [
      {
        title: 'Django Models Overview',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/models/',
        source: 'Django Docs'
      },
      {
        title: 'Real Python: Django ORM Primer',
        url: 'https://realpython.com/django-orm-cheatsheet/',
        source: 'Real Python'
      }
    ]
  },
  {
    id: 20,
    day: 7,
    dayIndex: 2,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Explain how you can set up the Database in Django?',
    startTime: '28:24',
    endTime: '29:31',
    startSeconds: 1704,
    endSeconds: 1771,
    tags: ['Database', 'DATABASES', 'settings.py'],
    tip: 'Configure ENGINE, NAME, USER, PASSWORD, HOST, and PORT in settings.py',
    summary: 'In settings.py, configure DATABASES default dictionary with ENGINE (e.g. django.db.backends.postgresql), NAME, USER, PASSWORD, HOST, and PORT.',
    articles: [
      {
        title: 'Databases Setting & Backend Configuration',
        url: 'https://docs.djangoproject.com/en/stable/ref/databases/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 21,
    day: 7,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'What do you mean by the CSRF Token?',
    startTime: '29:31',
    endTime: '30:51',
    startSeconds: 1771,
    endSeconds: 1851,
    tags: ['Security', 'CSRF', '{% csrf_token %}'],
    tip: 'Cross-Site Request Forgery protection using unique cryptographic tokens in POST forms',
    summary: 'CSRF token is a secret, unpredictable token generated by Django and embedded into forms via {% csrf_token %}. Django validates it on incoming POST/PUT requests to verify the origin.',
    articles: [
      {
        title: 'How to use Django CSRF Protection',
        url: 'https://docs.djangoproject.com/en/stable/howto/csrf/',
        source: 'Django Docs'
      },
      {
        title: 'CSRF Protection Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/csrf/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 22,
    day: 8,
    dayIndex: 1,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'What is a QuerySet in Django?',
    startTime: '30:51',
    endTime: '31:32',
    startSeconds: 1851,
    endSeconds: 1892,
    tags: ['ORM', 'QuerySet', 'Lazy Evaluation'],
    tip: 'A collection of database queries; evaluated lazily only when accessed',
    summary: 'A QuerySet represents a collection of objects from your database. Creating a QuerySet does not hit the database until it is evaluated (iteration, slicing, len(), list()).',
    articles: [
      {
        title: 'When QuerySets Are Evaluated (Lazy Evaluation)',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#querysets-are-lazy',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 23,
    day: 8,
    dayIndex: 2,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Difference between select_related and prefetch_related in Django?',
    startTime: '31:32',
    endTime: '33:57',
    startSeconds: 1892,
    endSeconds: 2037,
    tags: ['Performance', 'N+1 Problem', 'select_related', 'prefetch_related'],
    tip: 'select_related: SQL JOIN (1:1 & ForeignKey); prefetch_related: separate queries in Python (M2M & reverse FK)',
    summary: 'Solves N+1 query problem. select_related uses SQL JOIN in a single query for single-valued relationships. prefetch_related executes a second query and joins in Python for multi-valued relations.',
    articles: [
      {
        title: 'select_related Method Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related',
        source: 'Django Docs'
      },
      {
        title: 'prefetch_related Method Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#prefetch-related',
        source: 'Django Docs'
      },
      {
        title: 'Real Python: select_related vs prefetch_related',
        url: 'https://realpython.com/django-select-related-prefetch-related/',
        source: 'Real Python'
      }
    ]
  },
  {
    id: 24,
    day: 8,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Difference between Emp.object.filter(), Emp.object.get() and Emp.objects.all() in Django Queryset?',
    startTime: '33:57',
    endTime: '36:18',
    startSeconds: 2037,
    endSeconds: 2178,
    tags: ['ORM', 'filter vs get vs all'],
    tip: 'filter() returns QuerySet; get() returns single object or raises error; all() returns all items QuerySet',
    summary: 'filter() returns QuerySet matching criteria (can be empty). get() returns exact 1 instance or raises DoesNotExist / MultipleObjectsReturned. all() returns complete QuerySet.',
    articles: [
      {
        title: 'Retrieving Objects Lookups in Django',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#retrieving-objects',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 25,
    day: 9,
    dayIndex: 1,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'Which Companies Use Django?',
    startTime: '36:18',
    endTime: '36:37',
    startSeconds: 2178,
    endSeconds: 2197,
    tags: ['Industry', 'Instagram', 'Spotify', 'Pinterest'],
    tip: 'Instagram, Spotify, Pinterest, Dropbox, YouTube, Mozilla, Bitbucket',
    summary: 'High-scale web platforms rely on Django for its rapid development, robust built-in security, scalable ORM, and mature ecosystem.',
    articles: [
      {
        title: 'Django Community & Production Case Studies',
        url: 'https://www.djangoproject.com/community/',
        source: 'Django Community'
      }
    ]
  },
  {
    id: 26,
    day: 9,
    dayIndex: 2,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'How Static Files are defined in Django? Explain its Configuration and uses.',
    startTime: '36:37',
    endTime: '39:03',
    startSeconds: 2197,
    endSeconds: 2343,
    tags: ['Static Files', 'STATIC_URL', 'STATICFILES_DIRS', 'collectstatic'],
    tip: 'STATIC_URL, STATICFILES_DIRS, STATIC_ROOT, and python manage.py collectstatic',
    summary: 'STATIC_URL is public URL prefix (/static/). STATICFILES_DIRS holds development assets. STATIC_ROOT is destination folder for collectstatic in production.',
    articles: [
      {
        title: 'Managing Static Files in Django',
        url: 'https://docs.djangoproject.com/en/stable/howto/static-files/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 27,
    day: 9,
    dayIndex: 3,
    partName: 'Part 2: Mostly Asked Questions',
    title: 'What is the difference between Flask, Pyramid, and Django?',
    startTime: '39:03',
    endTime: '40:09',
    startSeconds: 2343,
    endSeconds: 2409,
    tags: ['Comparison', 'Flask', 'Pyramid', 'Microframework'],
    tip: 'Django: full-featured batteries-included; Flask: lightweight microframework; Pyramid: modular mid-tier',
    summary: 'Django includes ORM, Admin, Auth, Migrations out of the box. Flask is minimalistic and lets you pick libraries. Pyramid offers flexible routing and configuration for enterprise.',
    articles: [
      {
        title: 'Real Python: Flask vs Django Comparison',
        url: 'https://realpython.com/flask-vs-django/',
        source: 'Real Python'
      }
    ]
  },
  {
    id: 28,
    day: 10,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'Give a brief about the Django admin.',
    startTime: '40:09',
    endTime: '43:00',
    startSeconds: 2409,
    endSeconds: 2580,
    tags: ['Admin', 'django.contrib.admin', 'ModelAdmin'],
    tip: 'Automated, production-ready admin CRUD interface generated from models',
    summary: 'django.contrib.admin reads your model metadata to provide an instant, powerful web interface for site managers to create, view, update, and delete content.',
    articles: [
      {
        title: 'The Django Admin Site Documentation',
        url: 'https://docs.djangoproject.com/en/stable/ref/contrib/admin/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 29,
    day: 10,
    dayIndex: 2,
    partName: 'Part 3: Common Questions',
    title: 'What databases are supported by Django?',
    startTime: '43:00',
    endTime: '43:33',
    startSeconds: 2580,
    endSeconds: 2613,
    tags: ['Databases', 'PostgreSQL', 'MySQL', 'SQLite', 'Oracle'],
    tip: 'Officially supported: PostgreSQL, SQLite, MySQL, MariaDB, Oracle',
    summary: 'Django provides official built-in database engines for PostgreSQL, SQLite, MySQL, MariaDB, and Oracle. Community backends exist for MSSQL, CockroachDB, and MongoDB.',
    articles: [
      {
        title: 'Officially Supported Databases Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/databases/#officially-supported-databases',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 30,
    day: 10,
    dayIndex: 3,
    partName: 'Part 3: Common Questions',
    title: 'What are the advantages/disadvantages of using Django?',
    startTime: '43:33',
    endTime: '46:17',
    startSeconds: 2613,
    endSeconds: 2777,
    tags: ['Pros & Cons', 'Batteries Included', 'Scalability'],
    tip: 'Pros: rapid development, built-in security, ORM, admin. Cons: monolithic, learning curve for simple APIs',
    summary: 'Advantages: batteries-included, built-in security, scalable ORM. Disadvantages: heavy for microservices, monolithic convention-over-configuration design.',
    articles: [
      {
        title: 'Django Design Philosophy & Architecture',
        url: 'https://docs.djangoproject.com/en/stable/misc/design-philosophies/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 31,
    day: 11,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'What is the Django shortcut method to more easily render an HTML response?',
    startTime: '46:17',
    endTime: '46:25',
    startSeconds: 2777,
    endSeconds: 2785,
    tags: ['Shortcuts', 'render', 'HttpResponse'],
    tip: 'django.shortcuts.render(request, template_name, context=None)',
    summary: 'render() combines a template with a context dictionary and returns an HttpResponse object with rendered text in one clean line of code.',
    articles: [
      {
        title: 'django.shortcuts.render Documentation',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/shortcuts/#render',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 32,
    day: 11,
    dayIndex: 2,
    partName: 'Part 3: Common Questions',
    title: 'What is the difference between Authentication and Authorization in Django?',
    startTime: '46:25',
    endTime: '48:57',
    startSeconds: 2785,
    endSeconds: 2937,
    tags: ['Security', 'Auth', 'Permissions'],
    tip: 'Authentication validates identity (who you are); Authorization validates permissions (what you can do)',
    summary: 'Authentication verifies user identity (login/passwords). Authorization verifies if an authenticated user has permission to view or modify a resource.',
    articles: [
      {
        title: 'Django Authentication System Overview',
        url: 'https://docs.djangoproject.com/en/stable/topics/auth/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 33,
    day: 11,
    dayIndex: 3,
    partName: 'Part 3: Common Questions',
    title: 'What is django.shortcuts.render function?',
    startTime: '48:57',
    endTime: '50:23',
    startSeconds: 2937,
    endSeconds: 3023,
    tags: ['Shortcuts', 'render', 'Templates'],
    tip: 'Loads template, populates context, and returns rendered HttpResponse',
    summary: 'Syntactic sugar replacing loader.get_template(..), template.render(context, request), and HttpResponse(content). Takes request, template, context, and optional status code.',
    articles: [
      {
        title: 'render Function Parameters and Behavior',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/shortcuts/#django.shortcuts.render',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 34,
    day: 12,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'Explain Q objects in Django ORM?',
    startTime: '50:23',
    endTime: '51:36',
    startSeconds: 3023,
    endSeconds: 3096,
    tags: ['ORM', 'Q Objects', 'Complex Queries', 'AND/OR/NOT'],
    tip: 'from django.db.models import Q; allows complex SQL queries using & (AND), | (OR), and ~ (NOT)',
    summary: 'A Q object encapsulates a collection of keyword arguments. It enables writing queries with OR conditions (Q(x) | Q(y)) and negation (~Q(z)) which filter() cannot do alone.',
    articles: [
      {
        title: 'Complex Lookups with Q Objects',
        url: 'https://docs.djangoproject.com/en/stable/topics/db/queries/#complex-lookups-with-q-objects',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 35,
    day: 12,
    dayIndex: 2,
    partName: 'Part 3: Common Questions',
    title: 'What is the significance of the manage.py file in Django?',
    startTime: '51:36',
    endTime: '52:23',
    startSeconds: 3096,
    endSeconds: 3143,
    tags: ['CLI', 'manage.py', 'DJANGO_SETTINGS_MODULE'],
    tip: 'Wrapper script around django-admin that automatically sets DJANGO_SETTINGS_MODULE',
    summary: 'Created automatically in each Django project. It sets your project package on sys.path and points the DJANGO_SETTINGS_MODULE environment variable to your project settings.',
    articles: [
      {
        title: 'manage.py vs django-admin Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/django-admin/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 36,
    day: 12,
    dayIndex: 3,
    partName: 'Part 3: Common Questions',
    title: 'What is the use of the include function in the urls.py file in Django?',
    startTime: '52:23',
    endTime: '54:31',
    startSeconds: 3143,
    endSeconds: 3271,
    tags: ['Routing', 'urls.py', 'include', 'Modularity'],
    tip: 'path("app/", include("app.urls")) - allows pluggable, modular app routing',
    summary: 'include() chops off whatever part of the URL matched up to that point and sends the remaining string to the included URLconf for modular app routing.',
    articles: [
      {
        title: 'Including other URLconfs with include()',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/urls/#including-other-urlconfs',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 37,
    day: 13,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'What does {% include %} do in Django?',
    startTime: '54:31',
    endTime: '55:41',
    startSeconds: 3271,
    endSeconds: 3341,
    tags: ['Templates', 'Template Tag', '{% include %}'],
    tip: 'Loads and renders a sub-template with the current template context',
    summary: 'Renders reusable template snippets (e.g. navbar.html, footer.html, card.html) inside parent templates. You can pass extra context with {% include "x.html" with var=val %}.',
    articles: [
      {
        title: 'Template Built-in Tags: include',
        url: 'https://docs.djangoproject.com/en/stable/ref/templates/builtins/#include',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 38,
    day: 13,
    dayIndex: 2,
    partName: 'Part 3: Common Questions',
    title: 'What is Django Rest Framework(DRF)?',
    startTime: '55:41',
    endTime: '56:35',
    startSeconds: 3341,
    endSeconds: 3395,
    tags: ['DRF', 'REST API', 'Serializers', 'ViewSets'],
    tip: 'Powerful, flexible toolkit for building Web APIs and microservices in Django',
    summary: 'DRF adds Web browsable APIs, serialization for ORM models, OAuth/JWT authentication policies, ViewSets, and API routing on top of Django.',
    articles: [
      {
        title: 'Django REST Framework Official Documentation',
        url: 'https://www.django-rest-framework.org/',
        source: 'DRF Docs'
      }
    ]
  },
  {
    id: 39,
    day: 13,
    dayIndex: 3,
    partName: 'Part 3: Common Questions',
    title: 'What is a Middleware in Django?',
    startTime: '56:35',
    endTime: '57:45',
    startSeconds: 3395,
    endSeconds: 3465,
    tags: ['Middleware', 'Hooks', 'Request/Response Cycle'],
    tip: 'Lightweight, low-level plugin system for globally altering request or response',
    summary: 'A chain of callable classes executing on every request and response. Used for security headers, authentication sessions, CSRF validation, and GZip compression.',
    articles: [
      {
        title: 'Django Middleware Documentation',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 40,
    day: 14,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'What is a session in Django?',
    startTime: '57:45',
    endTime: '58:19',
    startSeconds: 3465,
    endSeconds: 3499,
    tags: ['Sessions', 'Cookies', 'request.session'],
    tip: 'Mechanism to store arbitrary per-visitor data across HTTP requests via session cookies',
    summary: 'Django abstracts sessions via request.session dictionary. By default stores data in django_session database table and sends a secure sessionid cookie to the client.',
    articles: [
      {
        title: 'How to use sessions in Django',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/sessions/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 41,
    day: 14,
    dayIndex: 2,
    partName: 'Part 3: Common Questions',
    title: 'What are Django Signals?',
    startTime: '58:19',
    endTime: '59:14',
    startSeconds: 3499,
    endSeconds: 3554,
    tags: ['Signals', 'Observer Pattern', 'post_save', 'pre_delete'],
    tip: 'Decoupled event notifications (senders notify receivers when actions occur)',
    summary: 'Allows decoupled applications to get notified when actions occur elsewhere. Examples: post_save (auto-create profile when User is created) and request_finished.',
    articles: [
      {
        title: 'Django Signals Guide',
        url: 'https://docs.djangoproject.com/en/stable/topics/signals/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 42,
    day: 14,
    dayIndex: 3,
    partName: 'Part 3: Common Questions',
    title: 'What is the context in Django?',
    startTime: '59:14',
    endTime: '1:00:21',
    startSeconds: 3554,
    endSeconds: 3621,
    tags: ['Templates', 'Context', 'Views'],
    tip: 'Dictionary mapping variable names to Python objects passed into template',
    summary: 'A Python dictionary passed from view to template. Keys become template variable names accessible via {{ variable_name }}.',
    articles: [
      {
        title: 'Rendering a Context in Django',
        url: 'https://docs.djangoproject.com/en/stable/ref/templates/api/#rendering-a-context',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 43,
    day: 15,
    dayIndex: 1,
    partName: 'Part 3: Common Questions',
    title: 'What are Django exceptions?',
    startTime: '1:00:21',
    endTime: '1:02:46',
    startSeconds: 3621,
    endSeconds: 3766,
    tags: ['Exceptions', 'DoesNotExist', 'ValidationError'],
    tip: 'DoesNotExist, MultipleObjectsReturned, ValidationError, PermissionDenied, Http404',
    summary: 'Core exceptions used to handle errors gracefully. Model-level exceptions include Model.DoesNotExist and Model.MultipleObjectsReturned. HTTP level includes Http404 and PermissionDenied.',
    articles: [
      {
        title: 'Django Core Exceptions Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/exceptions/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 44,
    day: 15,
    dayIndex: 2,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'What happens if MyObject.objects.get() is called with parameters that do not match an existing item in the database?',
    startTime: '1:02:46',
    endTime: '1:04:02',
    startSeconds: 3766,
    endSeconds: 3842,
    tags: ['ORM', 'DoesNotExist', 'Exception Handling'],
    tip: 'Raises MyObject.DoesNotExist exception',
    summary: 'get() expects exactly one record. If zero records match, it raises ModelName.DoesNotExist (which inherits from django.core.exceptions.ObjectDoesNotExist).',
    articles: [
      {
        title: 'Model.DoesNotExist Exception Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/instances/#django.db.models.Model.DoesNotExist',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 45,
    day: 15,
    dayIndex: 3,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'How to make a variable available to all the templates?',
    startTime: '1:04:02',
    endTime: '1:04:25',
    startSeconds: 3842,
    endSeconds: 3865,
    tags: ['Context Processors', 'Global Variables', 'settings.py'],
    tip: 'Write a custom Context Processor and register it under TEMPLATES["OPTIONS"]["context_processors"]',
    summary: 'A context processor is a Python function that takes request as argument and returns a dictionary. The returned keys and values become globally available in all rendered templates.',
    articles: [
      {
        title: 'Writing Custom Context Processors',
        url: 'https://docs.djangoproject.com/en/stable/ref/templates/api/#writing-your-own-context-processors',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 46,
    day: 16,
    dayIndex: 1,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'Why does Django use regular expressions to define URLs? Is it necessary to use them?',
    startTime: '1:04:25',
    endTime: '1:07:19',
    startSeconds: 3865,
    endSeconds: 4039,
    tags: ['URLs', 'path vs re_path', 'Regex'],
    tip: 'No, path() uses simple converters; re_path() is only required for complex regex validation',
    summary: 'Historically Django used url(r"^...$"). Since Django 2.0, path() with path converters (<int:id>, <slug:slug>) is preferred. re_path() is only used when exact regex validation is needed.',
    articles: [
      {
        title: 'URLconf re_path() and path() Syntax',
        url: 'https://docs.djangoproject.com/en/stable/ref/urls/#re-path',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 47,
    day: 16,
    dayIndex: 2,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'Difference between Django OneToOneField and ForeignKey Field?',
    startTime: '1:07:19',
    endTime: '1:07:49',
    startSeconds: 4039,
    endSeconds: 4069,
    tags: ['Models', 'Relations', 'OneToOneField', 'ForeignKey'],
    tip: 'OneToOneField enforces unique=True on the foreign key (1:1 relation instead of 1:N)',
    summary: 'ForeignKey represents many-to-one relationship. OneToOneField is essentially a ForeignKey with unique=True, providing direct reverse object access (e.g. user.profile).',
    articles: [
      {
        title: 'One-to-one Relationships Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/fields/#onetoonefield',
        source: 'Django Docs'
      },
      {
        title: 'Many-to-one Relationships Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/fields/#foreignkey',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 48,
    day: 16,
    dayIndex: 3,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'Briefly explain Django Field Class and its types',
    startTime: '1:07:49',
    endTime: '1:08:31',
    startSeconds: 4069,
    endSeconds: 4111,
    tags: ['Models', 'Field Types', 'CharField', 'DateTimeField'],
    tip: 'CharField, IntegerField, BooleanField, DateTimeField, ForeignKey, JSONField, etc.',
    summary: 'Fields specify column database datatypes (VARCHAR, INT, TIMESTAMP), default HTML form widgets, and minimum validation requirements.',
    articles: [
      {
        title: 'Model Field Reference',
        url: 'https://docs.djangoproject.com/en/stable/ref/models/fields/#model-field-reference',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 49,
    day: 17,
    dayIndex: 1,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'Explain how you can use file-based sessions?',
    startTime: '1:08:31',
    endTime: '1:08:41',
    startSeconds: 4111,
    endSeconds: 4121,
    tags: ['Sessions', 'File Sessions', 'SESSION_ENGINE'],
    tip: 'SESSION_ENGINE = "django.contrib.sessions.backends.file" and SESSION_FILE_PATH',
    summary: 'Stores session data as flat files on the server disk instead of database tables. Useful for servers without persistent DB access or quick prototyping.',
    articles: [
      {
        title: 'Using File-based Sessions in Django',
        url: 'https://docs.djangoproject.com/en/stable/topics/http/sessions/#using-file-based-sessions',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 50,
    day: 17,
    dayIndex: 2,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'What is Jinja templating?',
    startTime: '1:08:41',
    endTime: '1:09:32',
    startSeconds: 4121,
    endSeconds: 4172,
    tags: ['Templates', 'Jinja2', 'Engine'],
    tip: 'Fast, secure Python template engine alternative to standard Django Template Language (DTL)',
    summary: 'Jinja2 provides higher performance and more expressive syntax (e.g. calling functions with arguments directly inside templates). Django natively supports Jinja2 engine.',
    articles: [
      {
        title: 'Support for Template Engines (Jinja2 Backend)',
        url: 'https://docs.djangoproject.com/en/stable/topics/templates/#support-for-template-engines',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 51,
    day: 17,
    dayIndex: 3,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'What is serialization in Django?',
    startTime: '1:09:32',
    endTime: '1:10:13',
    startSeconds: 4172,
    endSeconds: 4213,
    tags: ['Serialization', 'JSON', 'DRF', 'serializers.serialize'],
    tip: 'Translating Django model instances and QuerySets into JSON, XML, or Python datatypes',
    summary: 'Converts complex data structures into native Python data types that can be rendered into JSON or XML. Used in Django core serializers and DRF serializers.',
    articles: [
      {
        title: 'Serializing Django Objects',
        url: 'https://docs.djangoproject.com/en/stable/topics/serialization/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 52,
    day: 18,
    dayIndex: 1,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'What are generic views?',
    startTime: '1:10:13',
    endTime: '1:10:49',
    startSeconds: 4213,
    endSeconds: 4249,
    tags: ['CBV', 'ListView', 'DetailView', 'CreateView'],
    tip: 'Pre-built Class-Based Views (CBVs) providing boilerplate for common CRUD operations',
    summary: 'Generic views (ListView, DetailView, CreateView, UpdateView, DeleteView) encapsulate common web patterns to prevent writing repetitive view logic.',
    articles: [
      {
        title: 'Built-in Class-based Generic Views',
        url: 'https://docs.djangoproject.com/en/stable/topics/class-based-views/generic-display/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 53,
    day: 18,
    dayIndex: 2,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'What is mixin?',
    startTime: '1:10:49',
    endTime: '1:11:29',
    startSeconds: 4249,
    endSeconds: 4289,
    tags: ['Python OOP', 'Mixins', 'LoginRequiredMixin'],
    tip: 'Multiple-inheritance helper classes that inject reusable behavior into class-based views',
    summary: 'A mixin is a special kind of multiple inheritance in Python. Example: LoginRequiredMixin restricts view access to logged-in users without duplicating code.',
    articles: [
      {
        title: 'Using Mixins with Class-based Views',
        url: 'https://docs.djangoproject.com/en/stable/topics/class-based-views/mixins/',
        source: 'Django Docs'
      }
    ]
  },
  {
    id: 54,
    day: 18,
    dayIndex: 3,
    partName: 'Part 4: Rarely / Advanced Questions',
    title: 'Explain the caching strategies in Django?',
    startTime: '1:11:29',
    endTime: '1:13:23',
    startSeconds: 4289,
    endSeconds: 4403,
    tags: ['Caching', 'Redis', 'Memcached', 'Per-view cache'],
    tip: 'Memcached, Redis; Per-site cache, Per-view cache, Template fragment cache, Low-level cache API',
    summary: 'Django cache levels: 1) The entire site cache (middleware), 2) Per-view cache (@cache_page), 3) Template fragment cache ({% cache %}), 4) Low-level cache API (cache.set/get).',
    articles: [
      {
        title: 'Django Cache Framework Documentation',
        url: 'https://docs.djangoproject.com/en/stable/topics/cache/',
        source: 'Django Docs'
      }
    ]
  }
];

export const TRACKS_DATA = {
  django: {
    id: 'django',
    name: 'Django',
    fullName: 'Django Framework',
    icon: '⚡',
    videoId: DJANGO_VIDEO_ID,
    videoBaseUrl: DJANGO_VIDEO_BASE_URL,
    days: DJANGO_DAYS,
    questions: QUESTIONS_DATA,
    totalCount: 54,
  },
  python: {
    id: 'python',
    name: 'Python',
    fullName: 'Python Core & Advanced',
    icon: '🐍',
    videoId: PYTHON_VIDEO_ID,
    videoBaseUrl: PYTHON_VIDEO_BASE_URL,
    days: PYTHON_DAYS,
    questions: PYTHON_QUESTIONS,
    totalCount: 51,
  },
};

