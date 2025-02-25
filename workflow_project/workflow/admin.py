from django.contrib import admin
from .models import Workflow, Node

class NodeInline(admin.TabularInline):
    model = Node
    extra = 1

@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    inlines = [NodeInline]

@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ("id", "workflow", "node_type", "position_x", "position_y")
    list_filter = ("node_type", "workflow")
    search_fields = ("node_type",)
