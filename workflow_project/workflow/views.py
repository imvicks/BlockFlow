import json
from .models import Workflow, Node
from django.http import JsonResponse
from rest_framework import serializers, viewsets
from django.views.decorators.csrf import csrf_exempt
from .defunc import *

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = '__all__'

class WorkflowSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = '__all__'

class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

# Function Mapping
NODE_FUNCTIONS = {
    "process-1": process_function_1,
    "process-2": process_function_2,
    "process-3": process_function_3,
    "process-4": process_function_4,
    "process-5": process_function_5,
    "process-6": process_function_6,
}

# API to Execute Nodes
@csrf_exempt
def execute_node(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            node_id = data.get("node_id")
            node_type = data.get("node_type")

            if node_type in NODE_FUNCTIONS:
                result = NODE_FUNCTIONS[node_type]()
                return JsonResponse({"node_id": node_id, **result}, status=200)

            return JsonResponse({"error": f"Function not found for node type: {node_type}"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)

# API to Save Workflow
@csrf_exempt
def save_workflow(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name", "Untitled Workflow")
            nodes = data.get("nodes", [])
            edges = data.get("edges", [])

            # Assign predefined function names to nodes
            for node in nodes:
                node["function"] = NODE_FUNCTIONS.get(node["nodeType"], "unknown_function").__name__

            workflow, created = Workflow.objects.update_or_create(
                name=name,
                defaults={"nodes": nodes, "edges": edges},
            )

            return JsonResponse({"message": "Workflow saved", "workflow_id": workflow.id}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)

# API to Load Workflow
@csrf_exempt
def load_workflow(request):
    if request.method == "GET":
        try:
            name = request.GET.get("name", "Untitled Workflow")
            workflow = Workflow.objects.filter(name=name).first()

            if workflow:
                return JsonResponse({
                    "name": workflow.name,
                    "nodes": workflow.nodes,
                    "edges": workflow.edges,
                }, status=200)
            else:
                return JsonResponse({"error": "Workflow not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)
