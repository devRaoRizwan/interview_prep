// Django Days 13 to 15 (Questions 37 to 45)
// Curated senior-grade technical specs, real drills, deep-dive interview Q&As, and spoken answer scripts

export const DJANGO_DAYS_13_TO_15 = {
  // Q37: What does {% include %} do in Django?
  37: {
    id: 37,
    docSpecs: {
      overview: 'The `{% include %}` template tag renders another template directly into the current template\'s rendering stream at the point of inclusion. By default, the included template inherits the entire parent template context (all view variables, context processors, and loop variables). You can pass additional parameters using the `with` keyword, or isolate the scope entirely using the `only` keyword (`{% include "card.html" with item=product only %}`) to prevent accidental context pollution.',
      table: {
        headers: ['Template Tag / Mechanism', 'Primary Purpose', 'Context Inheritance', 'Best Use Case'],
        rows: [
          ['{% include %}', 'Composes partial HTML snippets into a host template', 'Full parent context by default (isolable with "only")', 'Reusable UI partials (pagination bars, badges, navbars)'],
          ['{% extends %}', 'Base layout inheritance defining overridable {% block %}', 'Full parent/child block hierarchy evaluation', 'Master layout skeletons (base.html, dashboard_base.html)'],
          ['{% inclusion_tag %}', 'Custom tag that executes Python logic before rendering template', 'Dedicated context dictionary returned by Python function', 'Complex widgets needing independent DB queries (recent posts)']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Prevent Context Pollution with "only"',
          content: 'Always use `only` when rendering reusable component partials: `{% include "components/user_badge.html" with user=author only %}`. This prevents variable name collisions and makes partials self-contained and testable.'
        },
        {
          type: 'caution',
          title: 'Performance: Include vs Template Caching',
          content: 'Including templates inside large loops (`{% for item in items %}{% include "row.html" %}{% endfor %}`) incurs template parsing and lookup overhead on every iteration. Use `cached.Loader` in production or inline small loops to optimize rendering throughput.'
        }
      ],
      commands: [
        {
          label: 'Using {% include %} with Parameter Passing and Isolation',
          cmd: `{# In parent template: templates/shop/catalog.html #}
<div class="product-grid">
  {% for product in products %}
    {% include "partials/_product_card.html" with item=product show_discount=True only %}
  {% empty %}
    <p>No products available.</p>
  {% endfor %}
</div>`,
          lang: 'python',
          description: 'Rendering partial template with scoped context parameters using the "only" keyword.'
        }
      ],
      didYouKnow: {
        title: '💡 Django Template Caching Loader',
        content: 'In production (`DEBUG=False`), Django automatically wraps loaders in `django.template.loaders.cached.Loader`, compiling templates into memory once so subsequent `{% include %}` calls skip filesystem I/O.'
      }
    },
    challenge: {
      title: 'Template Partial Composition & Context Isolation Drill',
      steps: [
        'Understand how `{% include %}` embeds external template partials at compile time.',
        'Contrast context inheritance behavior with and without the `only` modifier.',
        'Identify when to choose `{% include %}` versus `{% extends %}` versus a custom `inclusion_tag`.',
        'Analyze the performance implications of repetitive includes in high-volume loops.'
      ],
      codeSnippet: `from django.template import Template, Context

# Parent template includes partial with explicit parameters and "only"
partial_src = "<div>Badge for: {{ name }} | Admin: {{ is_admin|default:'False' }}</div>"
parent_src = """
<h1>User List</h1>
{% include partial_name with name=user_name only %}
"""

# Context with extra variable 'is_admin' that should NOT leak into partial
ctx = Context({
    "user_name": "Alice",
    "is_admin": True,
    "partial_name": Template(partial_src)
})

# Note: Django's template engine resolves includes via engine loaders in full apps.
print("Include syntax: {% include 'partial.html' with key=value only %}")
print(f"Context variables: user_name={ctx.get('user_name')}, is_admin={ctx.get('is_admin')}")`,
      expectedOutput: `Include syntax: {% include 'partial.html' with key=value only %}
Context variables: user_name=Alice, is_admin=True`,
      interviewQuestion: 'What does the `{% include %}` tag do in Django? What is the difference between `{% include %}` and `{% extends %}`, and what does the `only` keyword achieve?',
      interviewAnswer: '`{% include %}` loads a template, renders it with the given context, and embeds the rendered output into the calling template at the exact position of the tag. It is designed for horizontal component composition (such as rendering button widgets, cards, modal dialogues, or alert bars).\n\nKey differences:\n1. `{% extends %}` implements classical layout inheritance. A child template declares a parent master template (e.g. `base.html`) and selectively overrides designated `{% block %}` sections. There can only be one `{% extends %}` per template, and it must be the very first tag.\n2. `{% include %}` can appear any number of times anywhere within a template to inject reusable partial snippets.\n3. By default, an included template inherits the entire context of the parent template. The `only` keyword (`{% include "card.html" with user=u only %}`) restricts the included template\'s context strictly to the variables passed in via the `with` clause, preventing accidental variable collisions and enforcing strict modularity.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/templates/builtins/#include'
    },
    scriptData: {
      prompt: 'Explain what {% include %} does in Django, how it differs from {% extends %}, and how context scoping works with the "only" keyword.',
      framework: [
        { time: '0-15s', point: 'Definition: {% include %} embeds reusable HTML partials directly into a template at runtime.' },
        { time: '15-45s', point: 'Comparison & Scope: Unlike {% extends %} (skeleton inheritance), {% include %} is for component composition. Uses parent context unless "only" isolates it.' },
        { time: '45-60s', point: 'Production Best Practice: Use "only" to prevent variable leakage and use inclusion tags if independent DB queries are needed.' }
      ],
      spokenScript: `"In Django, the \`{% include %}\` tag allows you to embed and render a reusable template snippet—such as a user card, a pagination bar, or an alert banner—directly within another template at the exact location of the tag.\n\nIt is fundamentally different from \`{% extends %}\`. Extends provides hierarchical skeleton inheritance, where a child template populates predefined blocks of a master layout. Include provides horizontal component composition, allowing you to stitch modular HTML fragments into any page.\n\nBy default, the included snippet inherits every variable present in the parent template's context. However, for clean architecture and to avoid variable collisions, you can pass explicit variables with \`with\` and append \`only\`, like \`{% include "card.html" with item=order only %}\`. This guarantees the partial only has access to the explicitly passed variables, making your UI components isolated, predictable, and maintainable."`
    }
  },

  // Q38: What is Django Rest Framework(DRF)?
  38: {
    id: 38,
    docSpecs: {
      overview: 'Django REST Framework (DRF) is an enterprise-grade toolkit built on top of Django for creating flexible, secure, and scalable Web APIs. It provides ModelSerializers for bidirectional Python-to-JSON translation and validation, class-based views (APIView, GenericAPIView, ModelViewSet) with granular HTTP method handlers, pluggable authentication (Session, Token, JWT via SimpleJWT), declarative permission classes, content negotiation, pagination, and automatic OpenAPI schema generation.',
      table: {
        headers: ['Feature Layer', 'Standard Django Views', 'Django REST Framework (DRF)'],
        rows: [
          ['Data Serialization', 'Manual `json.dumps()` or `django.core.serializers`', 'Powerful `Serializer` & `ModelSerializer` with field validation'],
          ['Request Handling', 'Django `HttpRequest` (`request.POST`, `request.body`)', 'DRF `Request` with parsed `request.data` for JSON, multipart, form data'],
          ['Response Format', '`HttpResponse` or `JsonResponse`', 'DRF `Response` with dynamic content negotiation (JSON, Browsable API, XML)'],
          ['Auth & Permissions', '`@login_required` or custom decorators', 'Declarative `permission_classes = [IsAuthenticated, HasObjectPermission]`'],
          ['Routing & Endpoints', 'Explicit `path()` entries per view', '`DefaultRouter` automatically mapping ModelViewSets to RESTful URI schemes']
        ]
      },
      admonitions: [
        {
          type: 'tip',
          title: 'Serializer Performance in Production',
          content: 'DRF serializers introduce significant CPU overhead when serializing large collections (e.g. 5,000+ records). For read-heavy, latency-critical listing endpoints, use `queryset.values()` or serialize directly to JSON using high-performance libraries like `orjson` or Pydantic.'
        },
        {
          type: 'caution',
          title: 'SerializerMethodField Triggers N+1 Queries',
          content: 'Be careful with `SerializerMethodField`! If your method performs a database query (e.g. `obj.comments.count()`), serializing 50 items will trigger 50 additional database queries. Always annotate or prefetch related data before serialization.'
        }
      ],
      commands: [
        {
          label: 'Production DRF ModelViewSet and Router Pattern',
          cmd: `# serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'author', 'created_at']
        read_only_fields = ['created_at']

# views.py
from rest_framework import viewsets, permissions

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('author').all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
urlpatterns = router.urls`,
          lang: 'python',
          description: 'Standard DRF production architecture with ModelSerializer, ViewSet, and Router.'
        }
      ],
      didYouKnow: {
        title: '💡 DRF Browsable API Under the Hood',
        content: 'DRF inspects the incoming HTTP `Accept` header. When requested from a web browser (`Accept: text/html`), DRF automatically renders its famous interactive HTML Browsable API; when called from cURL or frontend code (`Accept: application/json`), it returns pure raw JSON.'
      }
    },
    challenge: {
      title: 'DRF Architecture, Validation & Serialization Drill',
      steps: [
        'Understand the role of `Serializer` and `ModelSerializer` in data transformation.',
        'Inspect how DRF `request.data` parses JSON payloads regardless of HTTP verb (POST, PUT, PATCH).',
        'Analyze how declarative permissions (`permission_classes`) execute before view logic.',
        'Identify serialization bottlenecks and N+1 queries introduced by `SerializerMethodField`.'
      ],
      codeSnippet: `from rest_framework import serializers

class ProductInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be strictly positive.")
        return value

# Validating incoming payload
data = {"title": "Mechanical Keyboard", "price": "129.99"}
serializer = ProductInputSerializer(data=data)
print("Is Valid:", serializer.is_valid())
if serializer.is_valid():
    print("Validated Data:", serializer.validated_data)`,
      expectedOutput: `Is Valid: True
Validated Data: {'title': 'Mechanical Keyboard', 'price': Decimal('129.99')}`,
      interviewQuestion: 'What is Django REST Framework (DRF)? How does its architecture differ from standard Django, and what are common performance pitfalls when building REST APIs in DRF?',
      interviewAnswer: 'Django REST Framework (DRF) is the standard library for building production RESTful and hypermedia APIs in Django. It extends Django\'s request-response architecture with:\n1. Serializers: Two-way translation between Python ORM instances and native Python types convertible to JSON/XML, coupled with robust field-level and cross-field validation.\n2. Request & Response wrappers: `request.data` seamlessly handles JSON, form data, and multipart file uploads; `Response` utilizes content negotiation based on `Accept` headers.\n3. View Layer: From low-level `APIView` to high-level `ModelViewSet` combining list, retrieve, create, update, and destroy actions.\n4. Authentication & Permissions: Declarative token, session, or JWT auth classes with reusable object-level permissions (`BasePermission`).\n\nPerformance Pitfalls:\n- Serializer Overhead: DRF serializers validate and serialize row-by-row in Python, which is CPU-bound and slower than raw C-extensions for massive result sets (10k+ rows).\n- SerializerMethodField N+1 Queries: Performing relationship queries inside methods without using `select_related` or `prefetch_related` on the queryset.\n- Overfetching: Serializing entire models when the client only requires 2 fields; mitigated by field filtering or dedicated lightweight serializers.'
      ,
      replLink: 'https://www.django-rest-framework.org/'
    },
    scriptData: {
      prompt: 'What is Django REST Framework (DRF), why is it used over vanilla Django for APIs, and what are its key architectural components?',
      framework: [
        { time: '0-15s', point: 'Definition: DRF is the de-facto toolkit for building scalable, secure Web APIs on top of Django.' },
        { time: '15-45s', point: 'Core Components: ModelSerializers for serialization/validation, ViewSets for CRUD logic, Routers for automatic URLs, and declarative Auth/Permissions.' },
        { time: '45-60s', point: 'Production Considerations: Watch for SerializerMethodField N+1 queries and optimize read-heavy endpoints with queryset annotations.' }
      ],
      spokenScript: `"Django REST Framework, or DRF, is the industry-standard toolkit for building scalable, production-ready Web APIs on top of Django. While vanilla Django was originally architected for server-side HTML rendering via the MTV pattern, DRF adapts Django for API-first architectures.\n\nIts architecture is built on four core pillars: first, Serializers and ModelSerializers, which handle two-way translation between Python ORM models and JSON while running strict validation; second, ViewSets and APIViews, which wrap standard Django requests into parsed \`request.data\` objects with automatic content negotiation; third, declarative Authentication and Permission classes that secure endpoints at both view and object levels; and fourth, Routers, which automatically generate RESTful URL configurations.\n\nIn high-scale production systems, the primary performance trap with DRF is SerializerMethodField, which can inadvertently cause severe N+1 query storms if related models aren't eagerly loaded via select_related or prefetch_related."`
    }
  },

  // Q39: What is a Middleware in Django?
  39: {
    id: 39,
    docSpecs: {
      overview: 'Middleware in Django is a lightweight, low-level plugin system that hooks into Django\'s request/response processing lifecycle. Structured as an "onion" or pipeline architecture, each middleware is a callable class initialized once at server startup (`__init__`) that wraps the next handler (`get_response`). When a request enters, it traverses the `MIDDLEWARE` list sequentially from top to bottom; when the view returns a response, it travels back through the middleware list in reverse order (bottom to top). Middleware handles cross-cutting concerns such as session management, authentication, CSRF validation, gzip compression, and security headers.',
      table: null,
      admonitions: [
        {
          type: 'caution',
          title: 'Middleware Ordering is Strictly Critical',
          content: 'The order of entries in `settings.MIDDLEWARE` matters immensely! `SecurityMiddleware` should be first to reject malicious headers immediately. `SessionMiddleware` must precede `AuthenticationMiddleware` because user authentication depends on the session being populated. If you place `AuthenticationMiddleware` before `SessionMiddleware`, `request.user` will fail to resolve!'
        },
        {
          type: 'tip',
          title: 'Short-Circuiting the Pipeline',
          content: 'If any middleware returns an `HttpResponse` during its pre-view phase (e.g. rate-limiting or IP-blocking middleware), Django immediately halts downstream execution: downstream middlewares and the view are never called. The response immediately travels back up through the upstream middlewares.'
        }
      ],
      commands: [
        {
          label: 'Custom Modern Middleware Implementation with Hooks',
          cmd: `import time
import logging
from django.http import HttpResponseForbidden

logger = logging.getLogger(__name__)

class RequestLatencyAndFirewallMiddleware:
    def __init__(self, get_response):
        # One-time configuration and initialization at server start
        self.get_response = get_response
        self.blocked_ips = {"198.51.100.1", "203.0.113.42"}

    def __call__(self, request):
        # 1. PRE-VIEW HOOK: Runs before view execution (top-to-bottom)
        client_ip = request.META.get('REMOTE_ADDR')
        if client_ip in self.blocked_ips:
            return HttpResponseForbidden("Access Denied: Blocked IP.")

        start_time = time.monotonic()

        # 2. Call next middleware or view
        response = self.get_response(request)

        # 3. POST-VIEW HOOK: Runs after view execution (bottom-to-top)
        duration_ms = (time.monotonic() - start_time) * 1000
        response["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
        
        return response

    def process_exception(self, request, exception):
        # Special hook: Triggered only if a downstream view raises an unhandled exception
        logger.critical(f"Unhandled exception on {request.path}: {exception}", exc_info=True)
        return None  # Let default 500 handler take over`,
          lang: 'python',
          description: 'Production-ready custom Django middleware measuring request latency and filtering blocked IPs.'
        }
      ],
      didYouKnow: {
        title: '💡 Django 1.10+ Callable Middleware Protocol',
        content: 'Since Django 1.10, middleware does not need to inherit from `MiddlewareMixin`. It is simply a callable object accepting `get_response` in `__init__` and returning an inner function or implementing `__call__(self, request)`.'
      }
    },
    challenge: {
      title: 'Django Onion Pipeline & Middleware Execution Flow Drill',
      steps: [
        'Understand the structure of a modern Django middleware callable.',
        'Trace the request lifecycle: top-to-bottom during request, bottom-to-top during response.',
        'Demonstrate how returning an early HttpResponse short-circuits remaining middleware and view.',
        'Explain the role of special hooks: `process_view`, `process_exception`, and `process_template_response`.'
      ],
      codeSnippet: `def dummy_view(request):
    return f"View response for {request['path']}"

# Simulated middleware onion wrapper
def timing_middleware(get_response):
    def middleware(request):
        print("1. [TimingMiddleware] Inward (Pre-View)")
        res = get_response(request)
        print("4. [TimingMiddleware] Outward (Post-View)")
        return res
    return middleware

def auth_middleware(get_response):
    def middleware(request):
        print("2. [AuthMiddleware] Inward (Pre-View)")
        request['user'] = 'authenticated_user'
        res = get_response(request)
        print("3. [AuthMiddleware] Outward (Post-View)")
        return res
    return middleware

# Chain: timing -> auth -> view
pipeline = timing_middleware(auth_middleware(dummy_view))
result = pipeline({"path": "/api/v1/orders"})
print("Final Result:", result)`,
      expectedOutput: `1. [TimingMiddleware] Inward (Pre-View)
2. [AuthMiddleware] Inward (Pre-View)
3. [AuthMiddleware] Outward (Post-View)
4. [TimingMiddleware] Outward (Post-View)
Final Result: View response for /api/v1/orders`,
      interviewQuestion: 'What is a Middleware in Django? How does its execution order work, what happens when a middleware short-circuits, and why does middleware ordering matter?',
      interviewAnswer: 'Middleware in Django is a framework of hooks into Django\'s request/response processing. It is designed as an onion or pipeline architecture where each middleware component wraps the subsequent one.\n\nExecution Lifecycle:\n1. Server Startup: Each middleware class is instantiated once when the WSGI/ASGI server worker starts, caching `get_response`.\n2. Request Phase: When an HTTP request arrives, Django executes the middlewares in the order they are listed in `settings.MIDDLEWARE` (top to bottom). Code before `get_response(request)` runs here.\n3. View Execution: The URL resolver routes the request to the matching view.\n4. Response Phase: When the view returns an `HttpResponse`, execution flows back through the middlewares in reverse order (bottom to top). Code after `get_response(request)` runs here.\n\nShort-Circuiting:\nIf a middleware returns an `HttpResponse` directly during the request phase (e.g. CSRF failure, unauthorized IP block, rate limit exceeded), Django immediately breaks the chain. Downstream middlewares and the view are skipped completely, and the response immediately bubbles back up through the upstream middlewares.\n\nOrdering Importance:\nMiddleware order is critical because dependencies exist between them. For instance, `SessionMiddleware` must run before `AuthenticationMiddleware` because `AuthenticationMiddleware` reads the session data from `request.session` to authenticate `request.user`.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/'
    },
    scriptData: {
      prompt: 'What is a middleware in Django, how does the request-response onion model work, and why is middleware ordering so critical in production?',
      framework: [
        { time: '0-15s', point: 'Definition: Middleware is a pipeline of hooks wrapping request and response processing in an onion model.' },
        { time: '15-45s', point: 'Execution Flow: Top-to-bottom on request, bottom-to-top on response. Can short-circuit on unauthorized requests.' },
        { time: '45-60s', point: 'Ordering & Gotchas: Order is critical (e.g. Session before Auth). Instantiated once at boot; must remain stateless per-request.' }
      ],
      spokenScript: `"Middleware in Django is a low-level plugin system that handles cross-cutting concerns across your entire application, such as authentication, sessions, CSRF protection, CORS headers, and request timing. It operates on an 'onion' or pipeline architecture.\n\nWhen a request enters the application, it passes through each middleware in \`settings.MIDDLEWARE\` from top to bottom before reaching the view. Once the view returns an HttpResponse, that response travels back out through the middlewares in reverse order, from bottom to top.\n\nIf any middleware returns an HttpResponse during the incoming phase—for instance, rejecting an unauthorized IP or an invalid CSRF token—it short-circuits the pipeline immediately, skipping all downstream middlewares and the view entirely.\n\nMiddleware ordering is strictly critical because subsequent middlewares depend on state set up by preceding ones. For example, \`SessionMiddleware\` must always run before \`AuthenticationMiddleware\`, because Django cannot populate \`request.user\` without first resolving \`request.session\`. Additionally, because middleware instances persist across requests in a worker process, they must always be stateless with respect to individual requests."`
    }
  },

  // Q40: What is a session in Django?
  40: {
    id: 40,
    docSpecs: {
      overview: 'A session in Django provides a server-side state persistence mechanism across stateless HTTP requests for a specific client. When a user visits a site, Django issues a unique cryptographically signed session cookie named `sessionid` (HTTPOnly, Secure, SameSite). The client sends this cookie with every subsequent HTTP request. Django\'s `SessionMiddleware` reads the cookie, fetches the corresponding session data dictionary from the configured storage backend (database, cache/Redis, signed cookies, or file system), and attaches it to `request.session`.',
      table: {
        headers: ['Session Backend', 'Storage Engine', 'Speed / Latency', 'Fault Tolerance / Scalability', 'Best Production Use Case'],
        rows: [
          ['django.contrib.sessions.backends.db', 'Database table (`django_session`)', 'Moderate (requires SQL query per request)', 'High (survives worker restarts & cache flushes)', 'Default; small to medium sites with low request volume'],
          ['django.contrib.sessions.backends.cache', 'In-memory cache (Redis / Memcached)', 'Ultra-fast (sub-millisecond in-memory read)', 'Low if cache evicts or restarts without persistence', 'High-traffic apps with dedicated Redis persistent clusters'],
          ['django.contrib.sessions.backends.cached_db', 'Write-through Cache + DB persistence', 'Fast (reads from cache, writes to both)', 'High (DB fallback on cache miss)', 'Gold standard for high-throughput enterprise production'],
          ['django.contrib.sessions.backends.signed_cookies', 'Client-side signed cookie (cryptographic)', 'Instant (zero server storage I/O)', 'High (stateless horizontally)', 'Lightweight stateless apps (<4KB payload limit, no secrets)']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Database Session Bloat & Clearsessions',
          content: 'The default database session backend (`django.contrib.sessions.backends.db`) stores expired sessions forever unless pruned! In production, you must set up a cron job or Celery beat task running `python manage.py clearsessions` daily, otherwise the `django_session` table will grow to millions of dead rows, degrading DB performance.'
        },
        {
          type: 'tip',
          title: 'Session Fixation Defense: cycle_key()',
          content: 'Whenever a user logs in or elevates their privilege level, always call `request.session.cycle_key()` (Django\'s `login()` does this automatically). This rotates the `sessionid` cookie value while preserving session data, completely neutralizing Session Fixation attacks.'
        }
      ],
      commands: [
        {
          label: 'Configuring Redis Session Backend with High Security in settings.py',
          cmd: `# settings.py
# High-performance Redis session backend
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Security hardening for session cookies
SESSION_COOKIE_AGE = 1209600  # 2 weeks in seconds
SESSION_COOKIE_SECURE = True   # Transmit only over HTTPS
SESSION_COOKIE_HTTPONLY = True # Prevent client JavaScript access (XSS defense)
SESSION_COOKIE_SAMESITE = "Lax" # CSRF mitigation
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_SAVE_EVERY_REQUEST = False  # Avoid redundant writes on read-only requests`,
          lang: 'python',
          description: 'Production Redis session configuration with HTTPOnly and Secure cookie flags.'
        }
      ],
      didYouKnow: {
        title: '💡 request.session is a Lazy Dictionary Proxy',
        content: 'Django does not hit the session storage backend until your view actually accesses `request.session`. If a request only accesses static assets or public endpoints that never read `request.session`, zero session backend queries are executed.'
      }
    },
    challenge: {
      title: 'Session Manipulation, Expiration & Modification Flag Drill',
      steps: [
        'Inspect how `request.session` behaves like a standard Python dictionary.',
        'Understand the `modified` flag: why modifying mutable objects inside sessions requires `request.session.modified = True`.',
        'Demonstrate session deletion via `flush()` versus `del request.session[key]`.',
        'Compare database sessions versus Redis cached sessions under concurrent load.'
      ],
      codeSnippet: `# Simulated session dictionary behavior
session_store = {}

# Storing user cart
cart = session_store.setdefault("cart", [])
cart.append({"sku": "TECH-101", "qty": 2})

# NOTE: In Django, mutating a nested list/dict doesn't trigger the __setitem__ hook!
# You must explicitly set: request.session.modified = True
session_modified = True

print("Session Cart:", session_store.get("cart"))
print("Session Modified Flag:", session_modified)

# To completely wipe session and cookie on logout:
# request.session.flush()
session_store.clear()
print("After Flush, Keys:", list(session_store.keys()))`,
      expectedOutput: `Session Cart: [{'sku': 'TECH-101', 'qty': 2}]
Session Modified Flag: True
After Flush, Keys: []`,
      interviewQuestion: 'How does Django manage user sessions? Compare the available session backends, and explain what happens if you mutate a nested list inside `request.session` without setting `modified = True`.',
      interviewAnswer: 'Django manages sessions using a hybrid client-server model. A cryptographically signed session key (`sessionid`) is stored in an HTTPOnly, Secure browser cookie. On incoming requests, `SessionMiddleware` resolves this key against a configured storage backend (`SESSION_ENGINE`) and injects a dictionary-like session object into `request.session`.\n\nAvailable Backends:\n1. `db`: Stores session data serialized in the `django_session` database table. Reliable but adds database read/write queries to every request.\n2. `cache`: Stores sessions in Redis or Memcached. Ultra-low latency, ideal for high-traffic sites with Redis clustering.\n3. `cached_db`: Writes to both cache and database; reads from cache first. Highly recommended for enterprise applications requiring both speed and durability.\n4. `signed_cookies`: Stores the entire encrypted/signed session data payload directly inside the client cookie. Zero server storage, but payload is strictly capped at ~4KB and increases network overhead.\n\nThe Mutable Object Trap:\nDjango tracks modifications by intercepting dictionary assignments (`request.session["key"] = val`). If you retrieve a mutable object (like a nested list or dict) and append to it directly (`request.session["cart"].append(item)`), the assignment hook is not triggered, and Django will NOT save the updated cart to storage unless you explicitly set `request.session.modified = True`.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/http/sessions/'
    },
    scriptData: {
      prompt: 'What is a session in Django, how does it bridge stateless HTTP, and what are the trade-offs between database and Redis session backends?',
      framework: [
        { time: '0-15s', point: 'Definition: Sessions maintain persistent server-side state for clients across stateless HTTP requests using a sessionid cookie.' },
        { time: '15-45s', point: 'Backends & Trade-offs: Database backend is reliable but adds SQL latency; Redis cache backend provides sub-millisecond lookups.' },
        { time: '45-60s', point: 'Senior Gotcha: Mutating nested structures requires setting request.session.modified = True, and sessions must be pruned with clearsessions.' }
      ],
      spokenScript: `"A session in Django bridges the stateless nature of HTTP by maintaining persistent state across multiple requests for a specific client. When a user first connects, Django generates a random 32-character session key, sends it as an HTTPOnly, Secure cookie named \`sessionid\`, and uses that key to look up a serialized session dictionary on the server.\n\nDjango supports multiple storage backends configured via \`SESSION_ENGINE\`. The default is the database backend, which stores sessions in the \`django_session\` table. While reliable, it introduces a database query on every request that accesses the session. In high-performance production systems, we swap this for Redis using the \`cache\` or \`cached_db\` backend, which reduces session lookup latency to sub-millisecond speeds while optionally persisting writes to SQL.\n\nA classic senior interview trap is mutating nested data: if you append an item to a list inside \`request.session['cart']\`, Django's dictionary assignment hooks don't fire. You must explicitly declare \`request.session.modified = True\` so Django persists the change on response dispatch."`
    }
  },

  // Q41: What are Django Signals?
  41: {
    id: 41,
    docSpecs: {
      overview: 'Django Signals are an implementation of the Observer / Publish-Subscribe design pattern (`django.dispatch`). They allow decoupled senders to notify a set of subscribed receiver functions when specific framework actions occur. Built-in model signals include `pre_save`, `post_save`, `pre_delete`, `post_delete`, and `m2m_changed`. While useful for cross-app decoupling (e.g. creating a UserProfile when a User is created), signals execute synchronously within the same thread and transaction unless manually offloaded to a background task runner.',
      table: {
        headers: ['Mechanism', 'Coupling Level', 'Execution Flow', 'Transactional Awareness', 'Best Production Use Case'],
        rows: [
          ['Django Signals (`post_save`)', 'Completely decoupled (implicit)', 'Synchronous within same request thread', 'Requires `transaction.on_commit` for external side effects', 'Third-party app integration, cross-app notifications'],
          ['Overriding Model `save()`', 'Tight model coupling (explicit)', 'Synchronous during `instance.save()` call', 'Directly bound to caller transaction', 'Model-specific business validation, field normalization'],
          ['Celery / Asynchronous Tasks', 'Decoupled through task queue', 'Asynchronous in independent worker processes', 'Triggered via `transaction.on_commit(task.delay)`', 'Heavy operations: sending emails, generating PDFs, charging Stripe']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'Bulk Operations Bypass Signals Completely!',
          content: 'Model signals (`pre_save`, `post_save`, `pre_delete`, `post_delete`) are triggered by Python during `instance.save()` and `instance.delete()`. They are NEVER triggered by QuerySet bulk operations like `bulk_create()`, `bulk_update()`, or `filter().delete()` because these execute raw SQL directly in the database engine!'
        },
        {
          type: 'tip',
          title: 'Always Wrap External Side Effects in transaction.on_commit()',
          content: 'Never trigger an email or background job directly inside a `post_save` signal! If the database transaction later rolls back due to a downstream error, the email will have already been sent for an object that does not exist. Always use `transaction.on_commit(lambda: send_email.delay(instance.id))`.'
        }
      ],
      commands: [
        {
          label: 'Production Signal Receiver with transaction.on_commit Pattern',
          cmd: `from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
# from .models import Profile
# from .tasks import send_welcome_email_task

User = get_user_model()

@receiver(post_save, sender=User)
def handle_user_created(sender, instance, created, raw, **kwargs):
    # 1. Ignore loaddata / fixtures
    if raw:
        return

    if created:
        # Create corresponding profile
        # Profile.objects.create(user=instance)

        # 2. Safely trigger external side-effects ONLY after DB commit succeeds!
        transaction.on_commit(
            lambda: print(f"Triggering background welcome email for User ID: {instance.id}")
        )`,
          lang: 'python',
          description: 'Safe post_save signal pattern guarding against raw fixtures and using on_commit.'
        }
      ],
      didYouKnow: {
        title: '💡 Signals are Not Asynchronous!',
        content: 'A pervasive myth among junior developers is that Django signals run in the background. In reality, Django signals are 100% synchronous: the HTTP request will freeze until every connected signal receiver finishes executing.'
      }
    },
    challenge: {
      title: 'Django Dispatch & Signal Execution Drill',
      steps: [
        'Understand the anatomy of `Signal.connect()` and `@receiver` decorator.',
        'Verify that signals run synchronously within the same execution thread.',
        'Demonstrate how `instance.save()` triggers `post_save` while `bulk_create()` skips it.',
        'Implement transactional safety using `transaction.on_commit`.'
      ],
      codeSnippet: `from django.dispatch import Signal, receiver

# Define a custom signal
order_placed_signal = Signal()

execution_order = []

@receiver(order_placed_signal)
def log_audit(sender, order_id, **kwargs):
    execution_order.append(f"Audit logged for {order_id}")

@receiver(order_placed_signal)
def notify_warehouse(sender, order_id, **kwargs):
    execution_order.append(f"Warehouse alerted for {order_id}")

# Dispatching signal synchronously
print("Dispatching signal...")
order_placed_signal.send(sender=None, order_id="ORD-99881")
print("Execution Completed!")
for item in execution_order:
    print(" -", item)`,
      expectedOutput: `Dispatching signal...
Execution Completed!
 - Audit logged for ORD-99881
 - Warehouse alerted for ORD-99881`,
      interviewQuestion: 'What are Django Signals, and what architectural trade-offs do they introduce? Explain the "bulk operation trap" and how to safely trigger external tasks from a signal.',
      interviewAnswer: 'Django Signals provide an in-process Publish-Subscribe pattern that allows disparate components of an application to receive event notifications without tightly coupling the sender to the receiver. For instance, when a `User` is created, a `post_save` signal can trigger the creation of a `UserProfile` in a separate app.\n\nKey Architectural Trade-offs & Pitfalls:\n1. Obscured Control Flow ("Spooky Action at a Distance"): Because signals are implicitly connected, tracking business logic and debugging side-effects becomes difficult as codebases grow.\n2. Synchronous Execution: Signals are NOT asynchronous. Any blocking network calls (HTTP APIs, SMTP emails) inside a signal will freeze the client\'s HTTP response.\n3. The Bulk Operation Trap: Signals are triggered at the Python model instance level during `save()`. Bulk methods—`bulk_create()`, `bulk_update()`, and `QuerySet.delete()`—execute direct SQL queries and bypass signals completely. Relying on signals for critical business invariants will lead to silent data corruption during bulk imports.\n4. Transactional Inconsistency: If a signal enqueues a Celery task that reads the database immediately, a race condition occurs where the Celery worker queries the DB before the web worker\'s SQL transaction has committed. To solve this, always wrap side-effects inside `transaction.on_commit()`.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/topics/signals/'
    },
    scriptData: {
      prompt: 'What are Django signals, when should you use them, and what are their major failure modes in production systems?',
      framework: [
        { time: '0-15s', point: 'Definition: Django signals implement a synchronous pub/sub pattern for decoupled event handling across applications.' },
        { time: '15-45s', point: 'Trade-offs: Great for decoupling 3rd party apps, but obscures control flow and does NOT run asynchronously.' },
        { time: '45-60s', point: 'Production Traps: Skipped completely by bulk_create/update; external tasks must use transaction.on_commit.' }
      ],
      spokenScript: `"Django signals are an implementation of the Publish-Subscribe pattern that allow decoupled applications within a project to listen for specific framework events—like \`post_save\`, \`pre_delete\`, or \`request_started\`—without the sender having direct knowledge of the receivers.\n\nWhile they are convenient for cross-app communication, such as auto-creating a UserProfile when a User is created, they introduce several major production caveats. First, signals execute 100% synchronously in the same thread as the request; placing heavy operations like sending emails directly inside a signal will severely degrade response times.\n\nSecond, signals completely bypass bulk operations: calling \`bulk_create\` or \`QuerySet.update\` executes direct SQL, meaning no signals are fired at all. And third, if you dispatch an asynchronous task from a signal, you must wrap it in \`transaction.on_commit\` to prevent race conditions where the background worker tries to fetch a database record before the enclosing transaction has actually committed."`
    }
  },

  // Q42: What is the context in Django?
  42: {
    id: 42,
    docSpecs: {
      overview: 'In Django, the "Context" is a dictionary-like namespace (`django.template.Context` and `RequestContext`) passed to a template during rendering. It maps variable names used in template tags and filters (e.g. `{{ user_name }}`) to Python objects (strings, QuerySets, dictionaries, model instances). `RequestContext` automatically supplements this dictionary by executing all enabled `context_processors` defined in settings, injecting global variables like `request`, `user`, and `messages` into every page.',
      table: null,
      admonitions: [
        {
          type: 'tip',
          title: 'Template Method Resolution and alters_data',
          content: 'Django templates resolve variables via: dictionary lookup -> attribute lookup -> method call -> list-index lookup. If a model method mutates database records (e.g. `order.cancel()`), annotate it with `cancel.alters_data = True`. The Django template engine will refuse to execute any method marked with `alters_data = True` to prevent data mutation during rendering!'
        },
        {
          type: 'note',
          title: 'render() Automatically Uses RequestContext',
          content: 'Modern Django code uses the `render(request, "template.html", context)` shortcut. Under the hood, `render()` instantiates a `RequestContext(request, context)`, ensuring all configured global context processors are executed.'
        }
      ],
      commands: [
        {
          label: 'Passing Context via Views and Template Resolution Pattern',
          cmd: `from django.shortcuts import render
from django.views import View

# Function-based View Context
def dashboard_view(request):
    context = {
        "page_title": "Executive Dashboard",
        "active_users_count": 1420,
        "metrics": {"mrr": 45000, "churn_rate": 0.02},
    }
    return render(request, "analytics/dashboard.html", context)

# Class-based View Context
from django.views.generic import TemplateView

class AnalyticsView(TemplateView):
    template_name = "analytics/dashboard.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["server_time"] = "2026-11-04T07:00:00Z"
        return ctx`,
          lang: 'python',
          description: 'Passing explicit context dictionaries in FBVs and CBVs.'
        }
      ],
      didYouKnow: {
        title: '💡 Variable Resolution Fallback Behavior',
        content: 'When a variable does not exist in the context, Django\'s template engine does not throw a KeyError; it silently substitutes `string_if_invalid` (empty string `""` by default). In tests or development, you can set `string_if_invalid = "INVALID_VAR"` to spot template typos immediately.'
      }
    },
    challenge: {
      title: 'Django Template Context & Variable Resolution Drill',
      steps: [
        'Understand how `Context` maps string keys to Python objects.',
        'Demonstrate how dot notation resolves dictionaries, object attributes, and callable methods.',
        'Explain why `RequestContext` runs context processors to inject `user` and `request`.',
        'Verify how missing context variables are handled without raising runtime exceptions.'
      ],
      codeSnippet: `from django.template import Template, Context

class UserProfile:
    def __init__(self, username):
        self.username = username
    
    def get_role(self):
        return "Staff Member"

template_str = """Hello {{ profile.username }}!
Role: {{ profile.get_role }}
Missing Value: [{{ non_existent_key|default:"FALLBACK" }}]"""

t = Template(template_str)
c = Context({"profile": UserProfile("Alex")})
output = t.render(c)
print(output)`,
      expectedOutput: `Hello Alex!
Role: Staff Member
Missing Value: [FALLBACK]`,
      interviewQuestion: 'What is the "context" in Django? How does Django resolve dot notation in templates, and what prevents template rendering from accidentally mutating database state?',
      interviewAnswer: 'In Django, the Context is a mapping object (`django.template.Context`) passed to `Template.render(context)`. It provides the variable namespace that template tags, filters, and `{{ variable }}` expressions query during rendering.\n\nVariable Resolution Order:\nWhen a template encounters a dotted expression like `{{ order.customer.name }}`, Django evaluates each component in strict sequence:\n1. Dictionary lookup: `order["customer"]`\n2. Attribute lookup: `order.customer`\n3. Callable lookup / Method call: `order.customer()` (called with no arguments)\n4. List-index lookup: `order[int(customer)]`\n\nSecurity & State Mutation Protection:\nBecause templates automatically invoke callables with zero arguments, there is a severe risk of a template calling a model method that modifies database state (such as `user.delete()` or `order.cancel()`). To prevent accidental mutation, Django\'s template engine checks for the attribute `alters_data = True` on any callable before invocation. If `method.alters_data == True`, the template engine refuses to execute the method and resolves the expression to `string_if_invalid`.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/templates/api/#rendering-a-context'
    },
    scriptData: {
      prompt: 'What is the context in Django, how does variable resolution work, and how does Django protect against accidental state mutations during rendering?',
      framework: [
        { time: '0-15s', point: 'Definition: Context is the dictionary namespace passed from views to templates during HTML rendering.' },
        { time: '15-45s', point: 'Resolution Order: Dotted expressions resolve dict key -> object attribute -> method call -> list index.' },
        { time: '45-60s', point: 'Safety Rule: Methods with alters_data = True are blocked by the template engine to prevent accidental DB mutations.' }
      ],
      spokenScript: `"In Django, the context is a dictionary-like object passed from the view to the template engine during rendering. It maps variable keys to Python objects—such as strings, model instances, QuerySets, or nested dictionaries—making them accessible via double-curly-brace syntax.\n\nWhen you use dot notation like \`{{ user.profile.get_status }}\`, Django's template engine attempts four resolution steps in order: first, a dictionary key lookup; second, an attribute lookup; third, a method call if the attribute is callable with zero arguments; and fourth, a numeric list index lookup.\n\nBecause the engine automatically invokes zero-argument methods, there is a risk of templates inadvertently triggering side effects like \`order.cancel()\`. Django guards against this through the \`alters_data\` attribute: if any model method has \`alters_data = True\` set, the template engine will refuse to execute it during rendering, safeguarding database integrity."`
    }
  },

  // Q43: What are Django exceptions?
  43: {
    id: 43,
    docSpecs: {
      overview: 'Django exceptions are a structured hierarchy of Python exception classes defined in `django.core.exceptions` and `django.db`. They represent framework-level error states such as database lookup failures (`ObjectDoesNotExist`, `MultipleObjectsReturned`), validation errors (`ValidationError`), authorization failures (`PermissionDenied`), and security violations (`SuspiciousOperation`). In REST applications, Django REST Framework extends this with its own `APIException` hierarchy mapping directly to HTTP status codes.',
      table: {
        headers: ['Exception Class', 'Module Source', 'HTTP Equivalent / Trigger', 'Common Production Cause'],
        rows: [
          ['ObjectDoesNotExist / DoesNotExist', 'django.core.exceptions', '404 Not Found (via get_object_or_404)', 'Calling `.get()` on a QuerySet with no matching rows in the DB'],
          ['MultipleObjectsReturned', 'django.core.exceptions', '500 Server Error (if unhandled)', 'Calling `.get()` when multiple rows satisfy the lookup criteria'],
          ['ValidationError', 'django.core.exceptions', '400 Bad Request', 'Form, Model `clean()`, or Field validation failure'],
          ['PermissionDenied', 'django.core.exceptions', '403 Forbidden', 'User lacks required role or permission (triggers 403.html)'],
          ['SuspiciousOperation', 'django.core.exceptions', '400 Bad Request (logged as security alert)', 'HTTP Host header spoofing, CSRF tampering, path traversal attempts']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'MultipleObjectsReturned Masks Data Integrity Flaws',
          content: 'Never catch `MultipleObjectsReturned` and silently take `.first()` without investigating! If a `.get()` query matches multiple rows, your database schema is missing a `unique=True` constraint or `unique_together` / `UniqueConstraint` index, indicating data corruption.'
        },
        {
          type: 'tip',
          title: 'SuspiciousOperation Security Alerts',
          content: 'When Django raises `SuspiciousOperation` (e.g. `DisallowedHost`), it logs at `ERROR` or `CRITICAL` level. Ensure your logging configuration filters or alerts on these events in your APM (Sentry, Datadog) to detect active vulnerability scanning.'
        }
      ],
      commands: [
        {
          label: 'Handling Core Django Exceptions with Defensive Idioms',
          cmd: `from django.core.exceptions import ObjectDoesNotExist, ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.http import Http404
# from .models import Order

def process_order(user, order_id):
    # 1. Best practice for user-facing lookups
    # order = get_object_or_404(Order, id=order_id)

    # 2. Catching base ObjectDoesNotExist across multiple models
    try:
        # order = Order.objects.get(id=order_id)
        pass
    except ObjectDoesNotExist:
        raise Http404("Order not found.")

    # 3. Raising explicit PermissionDenied
    if not user.is_staff:
        raise PermissionDenied("Only staff members can refund orders.")`,
          lang: 'python',
          description: 'Defensive exception handling for ObjectDoesNotExist, ValidationError, and PermissionDenied.'
        }
      ],
      didYouKnow: {
        title: '💡 Model.DoesNotExist Inherits from ObjectDoesNotExist',
        content: 'Every Django model automatically generates its own `Model.DoesNotExist` class (e.g. `User.DoesNotExist`). This class inherits from `django.core.exceptions.ObjectDoesNotExist`, meaning `except ObjectDoesNotExist:` will catch lookup misses across any model in the project!'
      }
    },
    challenge: {
      title: 'Django Exception Hierarchy & Global Handling Drill',
      steps: [
        'Inspect the inheritance relationship between `ObjectDoesNotExist` and model `DoesNotExist`.',
        'Observe how `MultipleObjectsReturned` is raised when query constraints fail.',
        'Distinguish between `ValidationError` for business logic and `PermissionDenied` for authorization.',
        'Demonstrate how custom exception handling middleware can translate exceptions to JSON.'
      ],
      codeSnippet: `from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned, ValidationError

# Simulated model DoesNotExist inheritance
class SimulatedUserModel:
    class DoesNotExist(ObjectDoesNotExist):
        pass
    class MultipleObjectsReturned(MultipleObjectsReturned):
        pass

# Verify inheritance
err = SimulatedUserModel.DoesNotExist("User record matching query does not exist.")
print("Is Instance of ObjectDoesNotExist:", isinstance(err, ObjectDoesNotExist))
print("Exception message:", str(err))`,
      expectedOutput: `Is Instance of ObjectDoesNotExist: True
Exception message: User record matching query does not exist.`,
      interviewQuestion: 'What are Django exceptions? Explain the relationship between `ObjectDoesNotExist` and `Model.DoesNotExist`, and what happens when `PermissionDenied` or `SuspiciousOperation` is raised.',
      interviewAnswer: 'Django exceptions are Python exceptions organized into a domain hierarchy representing runtime errors across the ORM, forms, views, and security boundaries.\n\nKey Concepts:\n1. `ObjectDoesNotExist`: The abstract base class for all lookup misses. Every model dynamically creates its own `Model.DoesNotExist` subclass. You can catch `ObjectDoesNotExist` when handling queries that span multiple disparate models polymorphically.\n2. `MultipleObjectsReturned`: Raised when `.get()` expects exactly 1 row but receives 2 or more. Unlike a missing object, this usually flags a missing database uniqueness constraint.\n3. `PermissionDenied`: When raised inside a view, Django intercepts it and immediately returns an HTTP 403 Forbidden response, automatically rendering the `403.html` template.\n4. `SuspiciousOperation`: Indicates potential security tampering (e.g., `DisallowedHost` from an invalid Host header, session tampering, or path traversal). Django terminates the request with an HTTP 400 Bad Request and logs an explicit security alert.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/exceptions/'
    },
    scriptData: {
      prompt: 'What are Django exceptions, how is the exception hierarchy structured, and how are critical exceptions handled by the framework?',
      framework: [
        { time: '0-15s', point: 'Definition: Django exceptions are specialized error classes representing ORM, validation, and security failures.' },
        { time: '15-45s', point: 'Key Classes: ObjectDoesNotExist (base for Model.DoesNotExist), MultipleObjectsReturned, and ValidationError.' },
        { time: '45-60s', point: 'Security Exceptions: PermissionDenied triggers HTTP 403, while SuspiciousOperation triggers HTTP 400 with security audit logs.' }
      ],
      spokenScript: `"Django exceptions are a comprehensive hierarchy of error classes defined in \`django.core.exceptions\` and \`django.db\` that handle framework-level failures gracefully.\n\nOn the ORM side, the most common is \`ObjectDoesNotExist\`. Every model automatically defines its own \`DoesNotExist\` exception that subclasses \`ObjectDoesNotExist\`. Conversely, \`MultipleObjectsReturned\` is raised when \`get()\` encounters more than one record, signaling a broken database uniqueness constraint. For input validation, \`ValidationError\` is used across forms, serializers, and model clean methods to capture field-specific or general error messages.\n\nOn the security side, raising \`PermissionDenied\` halts view execution and automatically causes Django to render an HTTP 403 Forbidden page. Finally, \`SuspiciousOperation\` and its subclasses—like \`DisallowedHost\`—indicate potential attacks like Host header poisoning or cookie tampering, causing Django to abort the request with an HTTP 400 and emit security alert logs."`
    }
  },

  // Q44: What happens if MyObject.objects.get() finds 0 records?
  44: {
    id: 44,
    docSpecs: {
      overview: 'When `MyObject.objects.get()` is executed with parameters that match zero records in the database, Django raises a `MyObject.DoesNotExist` exception (which inherits from `django.core.exceptions.ObjectDoesNotExist`). If this exception is unhandled within a view, Django\'s request handler catches it as an unhandled exception, causing the application to return an HTTP 500 Internal Server Error in production. To handle missing records cleanly, developers use `try/except MyObject.DoesNotExist`, `get_object_or_404()`, or `.filter().first()`.',
      table: {
        headers: ['Lookup Method', '0 Matching Records', '> 1 Matching Records', 'Return Type on Success', 'Best Use Case'],
        rows: [
          ['Model.objects.get(...)', 'Raises `Model.DoesNotExist` (500 if unhandled)', 'Raises `MultipleObjectsReturned` (500 if unhandled)', 'Model Instance', 'Strict uniqueness invariant lookup (e.g. by Primary Key or unique slug)'],
          ['get_object_or_404(Model, ...)', 'Raises `Http404` (renders 404.html)', 'Raises `MultipleObjectsReturned` (500 if unhandled)', 'Model Instance', 'Standard user-facing web views & API retrieve endpoints'],
          ['Model.objects.filter(...).first()', 'Returns `None` (no exception raised)', 'Returns first row according to ordering (no error)', 'Model Instance or `None`', 'Optional lookups where absence is a normal, non-exceptional state'],
          ['Model.objects.get_or_create(...)', 'Inserts new row & returns `(instance, True)`', 'Raises `MultipleObjectsReturned`', 'Tuple `(instance, created)`', 'Idempotent worker jobs, caching, default record initialization']
        ]
      },
      admonitions: [
        {
          type: 'caution',
          title: 'The filter().first() Anti-Pattern',
          content: 'Do NOT blindly replace `get()` with `filter().first()` everywhere! `filter().first()` silently suppresses `MultipleObjectsReturned`. If your data model has duplicate rows due to a bug or race condition, `filter().first()` will arbitrarily select one row and hide the bug, whereas `get()` alerts you immediately to data corruption.'
        },
        {
          type: 'tip',
          title: 'Use get_object_or_404 in Views',
          content: 'In web controllers, use `get_object_or_404(Product, slug=slug)`. It catches `Model.DoesNotExist` internally and raises `django.http.Http404`, resulting in a clean 404 response instead of crashing with a 500 server error.'
        }
      ],
      commands: [
        {
          label: 'Four Patterns for Handling QuerySet Absence',
          cmd: `from django.shortcuts import get_object_or_404
from django.http import Http404
# from .models import Order

# Pattern 1: Explicit try/except block
try:
    # order = Order.objects.get(id=order_id)
    pass
except Order.DoesNotExist:
    # Handle absence gracefully (e.g. create fallback, redirect, return custom response)
    pass

# Pattern 2: User-facing view shortcut (raises Http404)
# order = get_object_or_404(Order, id=order_id, is_active=True)

# Pattern 3: Optional lookup returning None
# order = Order.objects.filter(id=order_id).first()
# if not order:
#     # do something

# Pattern 4: Atomic lookup or create
# order, created = Order.objects.get_or_create(id=order_id, defaults={"status": "draft"})`,
          lang: 'python',
          description: 'Defensive lookup patterns comparing get(), get_object_or_404, filter().first(), and get_or_create().'
        }
      ],
      didYouKnow: {
        title: '💡 DoesNotExist Exception Class Scoping',
        content: '`MyObject.DoesNotExist` is dynamically generated at runtime on every model class. If you have a base model or polymorphic query, you can safely catch `ObjectDoesNotExist` from `django.core.exceptions` to catch lookup errors across all models simultaneously.'
      }
    },
    challenge: {
      title: 'ORM Lookup Failures & Exception Control Flow Drill',
      steps: [
        'Understand why `Model.objects.get()` raises `DoesNotExist` on zero matches.',
        'Contrast `get()` with `.filter().first()` when handling non-existent records.',
        'Demonstrate how `get_object_or_404()` converts `DoesNotExist` into an `Http404`.',
        'Analyze why `MultipleObjectsReturned` is raised when query invariants are violated.'
      ],
      codeSnippet: `class MockQuerySet:
    def __init__(self, data):
        self.data = data
        
    def get(self, **kwargs):
        matches = [x for x in self.data if all(x.get(k) == v for k, v in kwargs.items())]
        if len(matches) == 0:
            raise KeyError("Object matching query does not exist in DB.")
        if len(matches) > 1:
            raise ValueError("MultipleObjectsReturned: expected 1, found " + str(len(matches)))
        return matches[0]

    def first(self):
        return self.data[0] if self.data else None

# Testing zero matches
qs = MockQuerySet([])
try:
    qs.get(id=999)
except KeyError as e:
    print("Caught expected exception:", e)

# Testing filter().first() fallback
print("first() fallback on empty QuerySet:", qs.first())`,
      expectedOutput: `Caught expected exception: 'Object matching query does not exist in DB.'
first() fallback on empty QuerySet: None`,
      interviewQuestion: 'What happens if `MyObject.objects.get()` is called with parameters that match no records? Contrast `get()`, `filter().first()`, and `get_object_or_404()`, and explain when you would choose each.',
      interviewAnswer: 'When `MyObject.objects.get()` matches 0 rows, it raises a `MyObject.DoesNotExist` exception. If unhandled within a view, Django returns an unhandled HTTP 500 Internal Server Error.\n\nComparison and Usage:\n1. `Model.objects.get()`: Use when business logic dictates that exactly one record MUST exist (such as an internal foreign key link or primary key lookup), and where zero or multiple records represents a corrupt state or programmer error.\n2. `get_object_or_404(Model, **kwargs)`: Use in HTTP controllers / views. It catches `DoesNotExist` and re-raises `django.http.Http404`, cleanly presenting the user with a 404 Not Found response instead of crashing the worker.\n3. `Model.objects.filter(**kwargs).first()`: Use when absence is a completely normal, expected operational state (e.g. checking if a user has an active promotional coupon). It returns `None` without raising an exception.\n\nArchitectural Caution:\nNever use `filter().first()` as a lazy shortcut to bypass `DoesNotExist` on primary key lookups. If database integrity is compromised and duplicate records exist, `get()` fails loudly with `MultipleObjectsReturned`, alerting you to the flaw, whereas `filter().first()` quietly hides the bug by picking an arbitrary row.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#get'
    },
    scriptData: {
      prompt: 'What happens when Model.objects.get() finds no records, and how do you choose between get(), get_object_or_404, and filter().first()?',
      framework: [
        { time: '0-15s', point: 'Immediate Outcome: Raises Model.DoesNotExist; results in an HTTP 500 server crash if unhandled in a view.' },
        { time: '15-45s', point: 'View Handling: Use get_object_or_404 for HTTP views to return a clean 404; use filter().first() when absence is normal.' },
        { time: '45-60s', point: 'Senior Caution: Avoid filter().first() on unique lookups because it hides MultipleObjectsReturned data corruption.' }
      ],
      spokenScript: `"When \`MyObject.objects.get()\` finds zero matching records in the database, it immediately raises a \`MyObject.DoesNotExist\` exception. If this is left unhandled in a web view, Django's global exception handler catches it as an unhandled error and returns an HTTP 500 Internal Server Error.\n\nTo handle this properly, we have three distinct strategies depending on the use case. For standard web views and REST endpoints, we use \`get_object_or_404()\`, which catches \`DoesNotExist\` and raises a standard \`Http404\` response. For optional lookups where absence is a completely normal business condition—such as checking if a discount code applies—we use \`.filter().first()\`, which safely returns \`None\` without raising an error.\n\nHowever, a senior best practice is never to use \`.filter().first()\` as a lazy replacement for \`get()\` on unique records. \`get()\` strictly enforces the invariant that exactly one record exists. If duplicate records ever appear due to a race condition or missing unique constraint, \`get()\` alerts you immediately by raising \`MultipleObjectsReturned\`, whereas \`filter().first()\` would silently swallow the bug."`
    }
  },

  // Q45: How to make a variable available to all the templates?
  45: {
    id: 45,
    docSpecs: {
      overview: 'To make a variable globally available across every template in a Django project without manually passing it in every view, you create a custom Context Processor. A context processor is a standard Python function that takes `request` as an argument and returns a Python dictionary. Once registered in the `TEMPLATES["OPTIONS"]["context_processors"]` setting, Django\'s `RequestContext` executes the function on every rendered template, merging its key-value pairs into the template context namespace.',
      table: null,
      admonitions: [
        {
          type: 'caution',
          title: 'Severe Performance Hazard: Database Queries in Context Processors',
          content: 'Context processors run on EVERY single template render across the entire site! If your context processor executes an unindexed database query (e.g. `SiteSettings.objects.first()`), every single page view in your entire project incurs an extra database query, drastically increasing latency and exhausting your database connection pool. Always cache database lookups inside context processors using `cache.get_or_set()`.'
        },
        {
          type: 'tip',
          title: 'Keep Context Processors Lightweight',
          content: 'Only use context processors for truly project-wide global data: brand configuration, feature flags, global notifications, or analytics tracking IDs. For modular app-specific logic, use custom template tags (`{% inclusion_tag %}`) instead.'
        }
      ],
      commands: [
        {
          label: 'Creating and Registering a High-Performance Cached Context Processor',
          cmd: `# 1. Define context processor in myapp/context_processors.py
from django.core.cache import cache
from django.conf import settings

def global_site_context(request):
    """
    Injects site configuration and environment flags into every template.
    Cached for 1 hour to prevent database and CPU thrashing.
    """
    def fetch_site_settings():
        # Simulated DB call: SiteConfig.objects.first()
        return {"brand_name": "Antigravity Cloud", "support_email": "support@example.com"}

    site_info = cache.get_or_set("global_site_settings", fetch_site_settings, timeout=3600)

    return {
        "SITE_BRAND": site_info["brand_name"],
        "SUPPORT_EMAIL": site_info["support_email"],
        "APP_ENVIRONMENT": getattr(settings, "ENVIRONMENT", "production"),
        "IS_BETA_USER": request.user.is_authenticated and getattr(request.user, "is_beta", False),
    }

# 2. Register in settings.py
# TEMPLATES = [{
#     'BACKEND': 'django.template.backends.django.DjangoTemplates',
#     'OPTIONS': {
#         'context_processors': [
#             'django.template.context_processors.request',
#             'django.contrib.auth.context_processors.auth',
#             'django.contrib.messages.context_processors.messages',
#             'myapp.context_processors.global_site_context',  # <--- Registered here
#         ],
#     },
# }]`,
          lang: 'python',
          description: 'Production context processor pattern with Redis caching and settings.py registration.'
        }
      ],
      didYouKnow: {
        title: '💡 Standard Built-in Context Processors',
        content: 'Whenever you use `{{ user }}` or `{{ request }}` inside any Django template, they are available exclusively because `django.contrib.auth.context_processors.auth` and `django.template.context_processors.request` are enabled in your `settings.py`.'
      }
    },
    challenge: {
      title: 'Context Processor Registration & Performance Optimization Drill',
      steps: [
        'Understand the function signature of a context processor: `def processor(request): return dict`.',
        'Trace how `render()` invokes `RequestContext` to merge processor dictionaries.',
        'Demonstrate the performance danger of uncached database queries in global processors.',
        'Implement caching using `cache.get_or_set()` to insulate database connection pools.'
      ],
      codeSnippet: `def custom_context_processor(request):
    # Context processor contract: must return a dictionary
    return {
        "PLATFORM_NAME": "Django Mastery Prep",
        "CURRENT_API_VERSION": "v2.4",
        "CAN_UPGRADE": request.get("user_plan") == "starter"
    }

# Simulated request context compilation
mock_request = {"user_plan": "starter"}
template_context = {"view_specific_item": "Order #4092"}

# Merge context processor into template context
merged_context = {**template_context, **custom_context_processor(mock_request)}
print("Merged Template Context:")
for k, v in merged_context.items():
    print(f"  {{{{ {k} }}}}: {v}")`,
      expectedOutput: `Merged Template Context:
  {{ view_specific_item }}: Order #4092
  {{ PLATFORM_NAME }}: Django Mastery Prep
  {{ CURRENT_API_VERSION }}: v2.4
  {{ CAN_UPGRADE }}: True`,
      interviewQuestion: 'How do you make a variable available to all templates in Django? What is the execution lifecycle of a Context Processor, and what severe performance pitfall must you safeguard against in production?',
      interviewAnswer: 'To make variables globally available to all templates, you create a custom Context Processor and register it under `TEMPLATES["OPTIONS"]["context_processors"]` in `settings.py`.\n\nExecution Lifecycle:\n1. A context processor is a standard Python function taking `request` as its sole argument and returning a dictionary.\n2. When a view calls `render(request, "template.html", context)`, Django instantiates a `RequestContext`. Before rendering, `RequestContext` executes each registered context processor sequentially, passing `request` and merging the returned dictionaries into the final template namespace.\n\nCritical Performance Pitfall:\nContext processors execute on EVERY single template render across the entire site. If a developer queries the database directly inside a context processor (e.g. `SiteConfig.objects.first()` or `Cart.objects.filter(user=request.user)`), every page view—even static FAQ pages or 404 pages—incurs additional database queries. Under traffic spikes, this causes severe database CPU spikes and connection pool starvation.\n\nRemediation:\nAlways cache global database lookups inside the processor using Redis (`cache.get_or_set()`), or use lazy object proxies (`django.utils.functional.SimpleLazyObject`) so database queries only fire if the template actually accesses the variable.'
      ,
      replLink: 'https://docs.djangoproject.com/en/stable/ref/templates/api/#using-requestcontext'
    },
    scriptData: {
      prompt: 'How do you make a variable available to all templates in Django, and what architectural precautions must you take to prevent production performance degradation?',
      framework: [
        { time: '0-15s', point: 'Solution: Create a custom Context Processor returning a dictionary and register it in settings.TEMPLATES.' },
        { time: '15-45s', point: 'Execution: Runs on every template render via RequestContext, injecting variables globally into scope.' },
        { time: '45-60s', point: 'Performance Trap: Never run raw DB queries in context processors without caching; use SimpleLazyObject or Redis.' }
      ],
      spokenScript: `"To make a variable globally available across all templates in Django, you create a custom Context Processor and register its dotted path in \`settings.py\` under \`TEMPLATES['OPTIONS']['context_processors']\`.\n\nA context processor is simply a Python function that takes the current \`request\` as its argument and returns a dictionary. Whenever a view renders a template using \`render()\` or \`RequestContext\`, Django invokes all registered processors and merges their dictionaries into the template's context namespace—which is how global objects like \`request\` and \`user\` are made available.\n\nHowever, there is a critical production pitfall to watch out for: context processors execute on every single template render across your entire site. If you query the database inside a context processor without caching—such as fetching site settings or cart totals—you add an unindexed database query to every single page request, causing severe database connection pool exhaustion. In production, always cache these lookups using Redis with \`cache.get_or_set()\`, or wrap them in a \`SimpleLazyObject\` so the query only executes if the template actually references the variable."`
    }
  }
};

