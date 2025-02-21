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
  // Default Start and End Nodes
  const defaultNodes = [
    { id: "start", type: "input", data: { label: "Start" }, position: { x: 200, y: 50 }, nodeType: "start", style: { backgroundColor: "lightgray" } },
    { id: "end", type: "output", data: { label: "End" }, position: { x: 200, y: 400 }, nodeType: "end", style: { backgroundColor: "lightgray" } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  // Function to Load Workflow from DB
  const loadWorkflow = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/load_workflow/?name=${WORKFLOW_NAME}`);
      if (response.data.nodes && response.data.edges) {
        // Ensure Start & End nodes are always present
        const loadedNodes = response.data.nodes.map((node) => ({
          ...node,
          style: { backgroundColor: "lightgray" }, // Default color
        }));
        setNodes([...defaultNodes, ...loadedNodes]);
        setEdges(response.data.edges);
        console.log("Workflow loaded!");
      }
    } catch (error) {
      console.error("Error loading workflow:", error.response?.data?.error);
    }
  };

  // Function to Save Workflow to DB
  const saveWorkflow = async () => {
    try {
      // Save all nodes (including Start & End) with positions
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

  // Function to Add a Process Node
  const addProcessNode = () => {
    const newNode = {
      id: `process-${nodeId}`,
      data: { label: `Process ${nodeId}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      nodeType: "process",
      function: `execute_process_${nodeId}`,
      style: { backgroundColor: "lightgray" }, // Default color
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId(nodeId + 1);
  };

  // Function to Highlight Running Node
  const highlightNode = (nodeId, color) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, style: { backgroundColor: color } } : node
      )
    );
  };

  // Function to Execute Workflow Sequentially
  const executeWorkflow = async () => {
    console.log("Starting workflow execution...");

    if (nodes.length === 0) {
      alert("No nodes in the workflow!");
      return;
    }

    // Find the first node (Start Node)
    let currentNode = nodes.find((node) => node.nodeType === "start");

    if (!currentNode) {
      alert("No valid starting node found!");
      return;
    }

    while (currentNode) {
      console.log(`Executing node: ${currentNode.id}`);

      // Highlight the running node in yellow
      highlightNode(currentNode.id, "yellow");

      await axios.post("http://localhost:8000/api/execute_node/", {
        node_id: currentNode.id,
        node_type: currentNode.nodeType,
      });

      // Reset color to default after execution
      highlightNode(currentNode.id, "lightgray");

      let nextEdge = edges.find((edge) => edge.source === currentNode.id);
      if (nextEdge) {
        currentNode = nodes.find((node) => node.id === nextEdge.target);
      } else {
        currentNode = null;
      }
    }

    alert("Workflow execution completed!");
  };

  // Load workflow when the component mounts
  useEffect(() => {
    loadWorkflow();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <button onClick={addProcessNode} style={{ margin: "5px" }}>Add Process Node</button>
      <button onClick={saveWorkflow} style={{ margin: "5px", background: "orange" }}>Save Workflow</button>
      <button onClick={executeWorkflow} style={{ margin: "5px", background: "lightgreen" }}>Run Workflow</button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default WorkflowEditor;
