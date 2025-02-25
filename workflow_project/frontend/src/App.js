import React, { useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

const WORKFLOW_NAME = "MyWorkflow"; // Name used for saving/loading

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  // Function to Load Workflow from DB
  const loadWorkflow = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/load_workflow/?name=${WORKFLOW_NAME}`);
      if (response.data.nodes && response.data.edges) {
        const loadedNodes = response.data.nodes.map((node) => ({
          ...node,
          style: { backgroundColor: "lightgray" },
        }));
        setNodes(loadedNodes);
        setEdges(response.data.edges);

        // Find the highest nodeId from existing nodes and update state
        const maxNodeId = loadedNodes
          .map((node) => parseInt(node.id.split("-")[1])) // Extract number from id
          .filter((id) => !isNaN(id)) // Remove invalid IDs
          .reduce((max, id) => Math.max(max, id), 0); // Get highest ID

        setNodeId(maxNodeId + 1);
      }
    } catch (error) {
      console.error("Error loading workflow:", error.response?.data?.error);
    }
  };

  // Function to Save Workflow to DB
  const saveWorkflow = async () => {
    try {
      const nodesToSave = nodes.map((node) => ({
        id: node.id,
        data: node.data,
        position: node.position,
        nodeType: node.nodeType,
      }));

      await axios.post("http://localhost:8000/api/save_workflow/", {
        name: WORKFLOW_NAME,
        nodes: nodesToSave,
        edges,
      });

      alert("Workflow saved!");
    } catch (error) {
      console.error("Error saving workflow:", error.response?.data?.error);
    }
  };

  // Function to Add a New Process Node (Ensuring Unique Node ID)
  const addProcessNode = (processType) => {
    const newNode = {
      id: `process-${nodeId}`,
      data: { label: `${processType}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      nodeType: processType,
      function: `execute_${processType}`,
      style: { backgroundColor: "lightgray" },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId(nodeId + 1); // Increment nodeId to ensure uniqueness
  };

  // Function to Highlight Running Node
  const highlightNode = async (nodeId, color) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, style: { backgroundColor: color } } : node
      )
    );
  };

  // Function to Execute Workflow with Color Visualization
  const executeWorkflow = async () => {
    console.log("Starting workflow execution...");

    if (nodes.length === 0) {
      alert("No nodes in the workflow!");
      return;
    }

    const nodeIdsWithIncomingEdges = new Set(edges.map((edge) => edge.target));
    let currentNode = nodes.find((node) => !nodeIdsWithIncomingEdges.has(node.id));

    if (!currentNode) {
      alert("No valid starting node found!");
      return;
    }

    while (currentNode) {
      console.log(`Executing node: ${currentNode.id}`);

      // Highlight the running node in yellow
      await highlightNode(currentNode.id, "yellow");

      await axios.post("http://localhost:8000/api/execute_node/", {
        node_id: currentNode.id,
        node_type: currentNode.nodeType,
        task_data: "Test Input", // Example input
      }).then(response => {
        console.log("Execution Result:", response.data.result);
      }).catch(error => {
        console.error("Execution Error:", error);
      });

      // Reset color to default after execution
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait briefly for visualization
      await highlightNode(currentNode.id, "lightgray");

      let nextEdge = edges.find((edge) => edge.source === currentNode.id);
      if (nextEdge) {
        currentNode = nodes.find((node) => node.id === nextEdge.target);
      } else {
        currentNode = null;
      }
    }

    alert("Workflow execution completed!");
  };

  useEffect(() => {
    loadWorkflow();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <button onClick={() => addProcessNode("process-1")} style={{ margin: "5px" }}>Process 1</button>
      <button onClick={() => addProcessNode("process-2")} style={{ margin: "5px" }}>Process 2</button>
      <button onClick={() => addProcessNode("process-3")} style={{ margin: "5px" }}>Process 3</button>
      <button onClick={() => addProcessNode("process-4")} style={{ margin: "5px" }}>Process 4</button>
      <button onClick={() => addProcessNode("process-5")} style={{ margin: "5px" }}>Process 5</button>

      <button onClick={saveWorkflow} style={{ margin: "5px", background: "orange" }}>Save Workflow</button>
      <button onClick={executeWorkflow} style={{ margin: "5px", background: "lightgreen" }}>Run Workflow</button>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={(params) => setEdges((eds) => addEdge(params, eds))} fitView>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default WorkflowEditor;
