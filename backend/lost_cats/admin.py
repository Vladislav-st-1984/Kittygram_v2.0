from django.contrib import admin

from .models import LostCatReport, Sighting


@admin.register(LostCatReport)
class LostCatReportAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'cat', 'reported_by', 'last_seen_location',
        'date_lost', 'is_resolved', 'created_at',
    )
    list_filter = ('is_resolved', 'date_lost')
    search_fields = ('description', 'last_seen_location')
    raw_id_fields = ('cat', 'reported_by')


@admin.register(Sighting)
class SightingAdmin(admin.ModelAdmin):
    list_display = ('id', 'report', 'author', 'sighting_location', 'created_at')
    raw_id_fields = ('report', 'author')
