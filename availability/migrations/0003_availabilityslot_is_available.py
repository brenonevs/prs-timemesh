# Generated by Django 5.2.1 on 2025-05-16 00:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('availability', '0002_availabilityslot_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='availabilityslot',
            name='is_available',
            field=models.BooleanField(default=True),
        ),
    ]
