from django_filters import rest_framework as filters

from .models import LostCatReport


class LostCatReportFilter(filters.FilterSet):
    date_lost = filters.DateFilter(field_name='date_lost')
    date_lost_gte = filters.DateFilter(
        field_name='date_lost', lookup_expr='gte',
    )
    date_lost_lte = filters.DateFilter(
        field_name='date_lost', lookup_expr='lte',
    )

    class Meta:
        model = LostCatReport
        fields = ['is_resolved', 'date_lost']
