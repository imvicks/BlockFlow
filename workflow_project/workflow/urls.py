from django.urls import path, include
from rest_framework.routers import DefaultRouter
from workflow.views import WorkflowViewSet, NodeViewSet
from workflow.views import execute_node, load_workflow, save_workflow

router = DefaultRouter()
router.register(r'workflows', WorkflowViewSet)
router.register(r'nodes', NodeViewSet)

urlpatterns = [
    path("execute_node/", execute_node, name="execute_node"),
    path("save_workflow/", save_workflow, name="save_workflow"),
    path("load_workflow/", load_workflow, name="load_workflow"),
]
