from rest_framework import serializers

from cats.models import Cat
from .models import LostCatReport, Sighting


class CatBriefSerializer(serializers.ModelSerializer):
    """Read-only nested cat info for report detail views."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Cat
        fields = ('id', 'name', 'color', 'birth_year', 'image_url')
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class SightingSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Sighting
        fields = (
            'id', 'report', 'author', 'message',
            'sighting_location', 'created_at',
        )
        read_only_fields = ('id', 'report', 'author', 'created_at')

    def validate_message(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                'This field must be at least 10 characters long.'
            )
        return value


class LostCatReportSerializer(serializers.ModelSerializer):
    """Full serializer for retrieve / create / update."""
    reported_by = serializers.ReadOnlyField(source='reported_by.username')
    cat_detail = CatBriefSerializer(source='cat', read_only=True)
    sightings = SightingSerializer(many=True, read_only=True)

    class Meta:
        model = LostCatReport
        fields = (
            'id', 'cat', 'cat_detail', 'reported_by', 'description',
            'last_seen_location', 'date_lost', 'is_resolved',
            'created_at', 'updated_at', 'sightings',
        )
        read_only_fields = (
            'id', 'reported_by',
            'created_at', 'updated_at',
        )

    def validate_description(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                'This field must be at least 20 characters long.'
            )
        return value

    def validate(self, attrs):
        cat = attrs.get('cat')
        if cat is None and self.instance:
            cat = self.instance.cat

        if self.instance is None and cat:
            active_exists = LostCatReport.objects.filter(
                cat=cat, is_resolved=False
            ).exists()
            if active_exists:
                raise serializers.ValidationError({
                    'cat': 'This cat already has an active (unresolved) lost report.'
                })
        return attrs


class LostCatReportListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    reported_by = serializers.ReadOnlyField(source='reported_by.username')
    cat_name = serializers.ReadOnlyField(source='cat.name')

    class Meta:
        model = LostCatReport
        fields = (
            'id', 'cat_name', 'last_seen_location',
            'date_lost', 'is_resolved', 'reported_by',
        )
