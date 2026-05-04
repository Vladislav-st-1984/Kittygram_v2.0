from cats.views import AchievementViewSet, CatViewSet
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import permissions, routers
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

router = routers.DefaultRouter()
router.register(r'cats', CatViewSet)
router.register(r'achievements', AchievementViewSet)

# OpenAPI / Swagger schema view — gated to staff users only.
#
# We accept BOTH SessionAuthentication (so a user already logged into the
# Django admin can browse Swagger UI in the same browser tab) AND
# TokenAuthentication (so curl/HTTPie can pull the raw JSON schema with a
# token header). `public=False` makes drf-yasg only emit endpoints the
# requesting user actually has access to.
schema_view = get_schema_view(
    openapi.Info(
        title='Kittygram API',
        default_version='v1',
        description=(
            'REST API for Kittygram — a community for cat owners. '
            'Includes the "Lost Cats" feature for reporting and finding '
            'lost cats and sharing sightings.\n\n'
            'These docs are only accessible to staff users — log into '
            '/admin/ first, then revisit this page.'
        ),
        contact=openapi.Contact(email='admin@kittygram.local'),
        license=openapi.License(name='MIT'),
    ),
    public=False,
    permission_classes=[permissions.IsAdminUser],
    authentication_classes=[SessionAuthentication, TokenAuthentication],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include('lost_cats.urls')),
    path('api/', include('djoser.urls')),
    path('api/', include('djoser.urls.authtoken')),

    # Interactive API docs
    re_path(
        r'^api/docs/swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(cache_timeout=0),
        name='schema-json',
    ),
    path(
        'api/docs/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui',
    ),
    path(
        'api/redoc/',
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc',
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
