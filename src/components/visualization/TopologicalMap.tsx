import { useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType,
  useNodesState,
  useEdgesState,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { MapPin, Maximize, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TopologicalMap = () => {
  const { activeProject, updateLocationPosition, addLocationConnection } = useProjectStore();
  const { openModal } = useUIStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!activeProject) return;

    const newNodes: Node[] = activeProject.locations.map((loc, index) => {
      let position = loc.visualPosition;
      
      if (!position) {
        // Simple spiral or grid layout for unpositioned nodes
        const i = index;
        const angle = 0.5 * i;
        const r = 200 + (10 * i);
        position = {
            x: Math.cos(angle) * r + 400,
            y: Math.sin(angle) * r + 300
        };
      }

      return {
        id: loc.id,
        data: { label: loc.name, type: loc.type },
        position,
        style: {
          background: 'var(--card)',
          border: '2px solid var(--primary)',
          borderRadius: '8px',
          padding: '12px',
          minWidth: 150,
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'var(--foreground)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      };
    });

    const newEdges: Edge[] = [];
    activeProject.locations.forEach((loc) => {
      if (loc.connections) {
          loc.connections.forEach((conn) => {
            newEdges.push({
              id: conn.id,
              source: loc.id,
              target: conn.targetLocationId,
              label: `${conn.distance} (${conn.travelType})`,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: 'var(--primary)',
                strokeWidth: 2,
              },
              labelStyle: { fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'normal', background: 'var(--background)' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--primary)',
              },
            });
          });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [activeProject, setNodes, setEdges]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    updateLocationPosition(node.id, node.position);
  }, [updateLocationPosition]);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
        // Default connection creation
        addLocationConnection(params.source, {
            targetLocationId: params.target,
            distance: 'Unknown',
            travelType: 'travel'
        });
    }
  }, [addLocationConnection]);

  const autoLayout = () => {
    if (!activeProject) return;
    activeProject.locations.forEach((loc, index) => {
        const total = activeProject.locations.length;
        const angle = (index / total) * 2 * Math.PI;
        const radius = 300;
        updateLocationPosition(loc.id, {
            x: Math.cos(angle) * radius + 400,
            y: Math.sin(angle) * radius + 300
        });
    });
  };

  if (!activeProject) return <div className="p-8 text-center text-muted-foreground">No project loaded.</div>;

  return (
    <div className="flex flex-col flex-1 bg-background overflow-hidden p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="text-primary" />
            Mapa Topológico
        </h2>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={autoLayout}>
                <Maximize className="w-4 h-4 mr-2" />
                Re-ordenar
            </Button>
            <Button size="sm" onClick={() => openModal('editLocation')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Nueva Ubicación
            </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded-xl overflow-hidden shadow-inner bg-accent/20 relative">
        <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur p-3 rounded-lg border shadow-sm text-xs text-muted-foreground max-w-[200px]">
            <p className="font-bold mb-1">Guía:</p>
            <p>Arrastra nodos para organizar.</p>
            <p>Conecta nodos para crear rutas de viaje.</p>
        </div>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-right"
        >
            <Background gap={20} size={1} color="var(--border)" />
            <Controls className="!bg-background !border-border !shadow-md" />
        </ReactFlow>
      </div>
    </div>
  );
};
