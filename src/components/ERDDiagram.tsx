import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  Handle,
  Position,
  ConnectionLineType,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import { Schema, Model, Field } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import * as d3 from "d3-scale";

interface PanelProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  children: React.ReactNode;
}

// Custom Panel component since it's not exported from react-flow-renderer
const Panel = ({ position = "top-left", children, className }: PanelProps) => {
  const positionStyles = {
    "top-left": { top: 10, left: 10 },
    "top-right": { top: 10, right: 10 },
    "bottom-left": { bottom: 10, left: 10 },
    "bottom-right": { bottom: 10, right: 10 },
  }[position];

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        zIndex: 5,
        ...positionStyles,
      }}
    >
      {children}
    </div>
  );
};

// Custom node component to display model fields
const ModelNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-md w-[280px] overflow-hidden">
      <div className="bg-purple-100 p-2 border-b border-slate-200">
        <div className="font-medium text-purple-800">{data.model.name}</div>
      </div>
      <div className="p-2">
        {data.model.fields.map((field: Field, index: number) => (
          <div
            key={field.id}
            className={`text-xs py-1.5 px-2 flex justify-between items-center ${
              index !== data.model.fields.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{field.name}</span>
              <span className="text-slate-500">
                {field.type}
                {field.isList ? "[]" : ""}
                {!field.isRequired ? "?" : ""}
              </span>
            </div>
            <div className="flex gap-1">
              {field.attributes.some((attr) => attr.name === "id") && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[0.6rem] h-4">
                  PK
                </Badge>
              )}
              {field.attributes.some((attr) => attr.name === "unique") && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[0.6rem] h-4">
                  UQ
                </Badge>
              )}
              {field.attributes.some((attr) => attr.name === "relation") && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[0.6rem] h-4">
                  FK
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
    </div>
  );
};

const nodeTypes = {
  model: ModelNode,
};

interface ERDDiagramProps {
  schema: Schema;
}

const ERDDiagram = ({ schema }: ERDDiagramProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [zoomLevel, setZoomLevel] = useState(0.8);

  const generateERD = useCallback(() => {
    const modelNodes: Node[] = [];
    const relationEdges: Edge[] = [];
    const colorScale = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]; // d3 category10 colors

    // Create nodes for each model
    schema.models.forEach((model, index) => {
      modelNodes.push({
        id: model.id,
        type: "model",
        data: { model },
        position: { 
          x: 150 + (index % 3) * 350, 
          y: 100 + Math.floor(index / 3) * 350 
        },
        style: {
          borderColor: colorScale[index % colorScale.length],
        },
      });
    });

    // Create edges for each relation
    schema.models.forEach((sourceModel) => {
      sourceModel.fields.forEach((field) => {
        const relationAttr = field.attributes.find((attr) => attr.name === "relation");
        
        if (relationAttr && field.type) {
          // Find the target model by name
          const targetModel = schema.models.find((m) => m.name === field.type);
          
          if (targetModel) {
            // Get any fields/references info
            const fieldsArg = relationAttr.arguments.find(arg => arg.name === "fields");
            const referencesArg = relationAttr.arguments.find(arg => arg.name === "references");
            
            const relationName = relationAttr.arguments.find(arg => arg.name === "name")?.value || "";
            
            relationEdges.push({
              id: `${sourceModel.id}-${field.id}-${targetModel.id}`,
              source: sourceModel.id,
              target: targetModel.id,
              label: field.name,
              labelBgStyle: { fill: '#f0f0f0', color: '#333', fillOpacity: 0.7 },
              labelStyle: { fontSize: 10 },
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: '#888',
              },
              style: { stroke: '#888' },
              data: {
                relationship: field.isList ? "many" : "one",
                sourceField: field.name,
                relationName: relationName.replace(/"/g, ''),
              },
              animated: true,
            });
          }
        }
      });
    });

    setNodes(modelNodes);
    setEdges(relationEdges);
  }, [schema, setNodes, setEdges]);

  useEffect(() => {
    generateERD();
  }, [generateERD]);

  const fitView = () => {
    const flowInstance = document.querySelector(".react-flow");
    if (flowInstance) {
      // Trigger fit view - this is a workaround as we don't have direct access to the instance
      setTimeout(() => {
        const event = new CustomEvent("fitView");
        flowInstance.dispatchEvent(event);
      }, 50);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] w-full bg-slate-50 rounded-md border border-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultZoom={zoomLevel}
        minZoom={0.2}
        maxZoom={1.5}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#888" }}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#f0f0f0" gap={16} />
        <Controls />
        <Panel position="top-right" className="bg-white p-2 rounded shadow-md">
          <button
            onClick={fitView}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded"
          >
            Fit View
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ERDDiagram; 