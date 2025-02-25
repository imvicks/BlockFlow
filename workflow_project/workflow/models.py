from django.db import models

class Workflow(models.Model):
    name = models.CharField(max_length=255, unique=True)
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

class Node(models.Model):
    workflow = models.ForeignKey(
        Workflow, 
        on_delete=models.CASCADE, 
        related_name="workflow_nodes"
    )
    node_type = models.CharField(max_length=100)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    data = models.JSONField(default=dict)
