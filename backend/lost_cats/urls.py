from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LostCatReportViewSet, SightingViewSet

router = DefaultRouter()
router.register(r'lost-cats', LostCatReportViewSet, basename='lostcatreport')

# Nested sightings routes under /lost-cats/{report_pk}/sightings/
sighting_list = SightingViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
sighting_detail = SightingViewSet.as_view({
    'delete': 'destroy',
})

urlpatterns = [
    path('', include(router.urls)),
    path(
        'lost-cats/<int:report_pk>/sightings/',
        sighting_list,
        name='sighting-list',
    ),
    path(
        'lost-cats/<int:report_pk>/sightings/<int:pk>/',
        sighting_detail,
        name='sighting-detail',
    ),
]
