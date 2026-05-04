from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .filters import LostCatReportFilter
from .models import LostCatReport, Sighting
from .permissions import IsOwnerOrAdmin, IsOwnerOrReadOnly
from .serializers import (
    LostCatReportListSerializer,
    LostCatReportSerializer,
    SightingSerializer,
)


class LostCatReportViewSet(viewsets.ModelViewSet):
    queryset = LostCatReport.objects.select_related(
        'cat', 'reported_by',
    ).prefetch_related('sightings')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LostCatReportFilter
    search_fields = ['description', 'last_seen_location']
    ordering_fields = ['created_at', 'date_lost']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return LostCatReportListSerializer
        return LostCatReportSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        if self.action in ('update', 'partial_update'):
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        if self.action == 'resolve':
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        """Mark a lost cat report as resolved (cat found)."""
        report = self.get_object()
        if report.is_resolved:
            return Response(
                {'detail': 'This report is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        report.is_resolved = True
        report.save(update_fields=['is_resolved', 'updated_at'])
        serializer = self.get_serializer(report)
        return Response(serializer.data)


class SightingViewSet(viewsets.ModelViewSet):
    serializer_class = SightingSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Sighting.objects.filter(
            report_id=self.kwargs['report_pk'],
        ).select_related('author')

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        report = get_object_or_404(LostCatReport, pk=self.kwargs['report_pk'])
        serializer.save(author=self.request.user, report=report)
