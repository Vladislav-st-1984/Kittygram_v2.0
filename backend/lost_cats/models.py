from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator
from django.db import models

from cats.models import Cat

User = get_user_model()


class LostCatReport(models.Model):
    cat = models.ForeignKey(
        Cat,
        on_delete=models.CASCADE,
        related_name='lost_reports',
    )
    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lost_cat_reports',
    )
    description = models.TextField(
        validators=[MinLengthValidator(20)],
    )
    last_seen_location = models.CharField(max_length=255)
    date_lost = models.DateField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['cat'],
                condition=models.Q(is_resolved=False),
                name='unique_active_lost_report_per_cat',
            ),
        ]

    def __str__(self):
        status = 'RESOLVED' if self.is_resolved else 'ACTIVE'
        return f'[{status}] {self.cat.name} — {self.last_seen_location}'


class Sighting(models.Model):
    report = models.ForeignKey(
        LostCatReport,
        on_delete=models.CASCADE,
        related_name='sightings',
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sightings',
    )
    message = models.TextField(
        validators=[MinLengthValidator(10)],
    )
    sighting_location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Sighting by {self.author.username} on report #{self.report_id}'
