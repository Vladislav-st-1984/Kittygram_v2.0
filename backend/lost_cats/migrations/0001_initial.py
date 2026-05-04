from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cats', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LostCatReport',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID',
                )),
                ('description', models.TextField(
                    validators=[django.core.validators.MinLengthValidator(20)],
                )),
                ('last_seen_location', models.CharField(max_length=255)),
                ('date_lost', models.DateField()),
                ('is_resolved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cat', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='lost_reports',
                    to='cats.cat',
                )),
                ('reported_by', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='lost_cat_reports',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Sighting',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID',
                )),
                ('message', models.TextField(
                    validators=[django.core.validators.MinLengthValidator(10)],
                )),
                ('sighting_location', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='sightings',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('report', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='sightings',
                    to='lost_cats.lostcatreport',
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='lostcatreport',
            constraint=models.UniqueConstraint(
                condition=models.Q(('is_resolved', False)),
                fields=('cat',),
                name='unique_active_lost_report_per_cat',
            ),
        ),
    ]
