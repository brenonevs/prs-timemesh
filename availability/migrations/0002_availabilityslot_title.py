# Generated by Django 5.2 on 2025-05-05 02:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('availability', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='availabilityslot',
            name='title',
            field=models.CharField(default='', max_length=100),
        ),
    ]
