# Generated by Django 5.1.3 on 2025-02-21 06:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workflow', '0002_remove_workflow_description_workflow_nodes_data_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workflow',
            name='nodes_data',
        ),
        migrations.AddField(
            model_name='workflow',
            name='edges',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='workflow',
            name='nodes',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='node',
            name='workflow',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_nodes', to='workflow.workflow'),
        ),
    ]
