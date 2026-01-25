import { useEffect, useMemo, useCallback } from 'react';
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
import {
  List,
  ArrowRight,
  History,
  Sparkles,
  Maximize,
  Layout,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Constants & Helpers ---

const RELATION_COLORS: Record<string, string> = {
  'friend': '#4CAF50',
  'family': '#FF9800',
  'love': '#E91E63',
  'enemy': '#F44336',
  'mentor': '#2196F3',
  'acquaintance': '#9E9E9E',
  'colleague': '#607D8B',
  'ally': '#8BC34A',
  'rival': '#FFC107',
  'archenemy': '#F44336',
  'romantic': '#E91E63',
  'neutral': '#9E9E9E'
};

const getRelationColor = (type: string) => RELATION_COLORS[type] || '#BDBDBD';

export const RelationsDiagram = () => {
  const { activeProject, updateCharacterPosition } = useProjectStore();
  const { openModal } = useUIStore();
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Unified list of all relationships
  const allRelationships = useMemo(() => {
    if (!activeProject) return [];
    const rels: any[] = [];
    activeProject.characters.forEach(char => {
      char.relationships.forEach(rel => {
        rels.push({
          ...rel,
          ownerId: char.id,
          ownerName: char.name
        });
      });
    });
    return rels;
  }, [activeProject]);

  // Sync Nodes from Project Data
  useEffect(() => {
    if (!activeProject) return;

    const newNodes: Node[] = activeProject.characters.map((char, index) => {
      // Use saved position or calculate default circular position
      let position = char.visualPosition;
      
      if (!position) {
        const totalChars = activeProject.characters.length;
        const angle = (index / totalChars) * 2 * Math.PI - Math.PI / 2;
        const radius = 200;
        position = {
          x: Math.cos(angle) * radius + 300,
          y: Math.sin(angle) * radius + 250
        };
      }

      return {
        id: char.id,
        data: { label: char.name },
        position,
        style: {
          background: 'var(--card)',
          border: '2px solid var(--primary)',
          borderRadius: '12px',
          padding: '10px',
          width: 120,
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'var(--foreground)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'grab'
        },
      };
    });

    const newEdges: Edge[] = [];
    activeProject.characters.forEach((char) => {
      char.relationships.forEach((rel) => {
        newEdges.push({
          id: `${char.id}-${rel.characterId}`,
          source: char.id,
          target: rel.characterId,
          label: rel.currentType,
          type: 'smoothstep',
          animated: rel.currentStatus === 'active',
          style: { 
            stroke: getRelationColor(rel.currentType),
            strokeWidth: 2,
            strokeDasharray: rel.isSecret ? '5,5' : 'none'
          },
          labelStyle: { fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 'bold' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: getRelationColor(rel.currentType),
          },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [activeProject, setNodes, setEdges]);

  // Handle Drag End to persist position
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    updateCharacterPosition(node.id, node.position);
  }, [updateCharacterPosition]);

  // Handle manual connection (creating a new relationship via diagram)
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      openModal('editRelationship', { 
        ownerId: params.source, 
        characterId: params.target 
      });
    }
  }, [openModal]);

  const autoLayout = () => {
    if (!activeProject) return;
    activeProject.characters.forEach((char, index) => {
      const totalChars = activeProject.characters.length;
      const angle = (index / totalChars) * 2 * Math.PI - Math.PI / 2;
      const radius = 250;
      updateCharacterPosition(char.id, {
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300
      });
    });
  };

  if (!activeProject) return <div className="p-8 text-center text-muted-foreground">No project loaded.</div>;

  return (
    <div className="flex flex-col flex-1 bg-background overflow-hidden">
      
      {/* 2. Main Split Content */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">
        
        {/* LEFT: Relationships List */}
        <div className="w-1/3 flex flex-col gap-4 min-w-[320px]">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <List size={14} className="text-primary" />
              Cronología de Vínculos
            </h3>
            <Badge variant="outline" className="text-[9px] font-bold">{allRelationships.length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-6">
            {allRelationships.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed rounded-2xl opacity-30 flex flex-col items-center gap-3">
                <Heart size={32} />
                <p className="text-[10px] uppercase font-bold tracking-wider">Sin relaciones</p>
              </div>
            ) : (
              allRelationships.map((rel) => {
                const target = activeProject.characters.find(c => c.id === rel.characterId);
                return (
                  <div 
                    key={rel.id}
                    onClick={() => openModal('editRelationship', rel)}
                    className="p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div 
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: getRelationColor(rel.currentType) }}
                    />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-black tracking-tight">
                        <span>{rel.ownerName}</span>
                        <ArrowRight size={14} className="text-primary/40" />
                        <span>{target?.name}</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2 mb-3 bg-muted/30 p-2 rounded-lg">
                      "{rel.currentDescription || 'Sin descripción'}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span 
                          className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-primary/10 bg-primary/5 text-primary"
                        >
                          {rel.currentType}
                        </span>
                        {rel.isSecret && <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] h-4">SECRETO</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold">
                        <History size={10} />
                        <span>{rel.history.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Visual Diagram */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden relative shadow-2xl shadow-black/10">
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
            <div className="bg-background/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
              <h4 className="text-[9px] font-black mb-3 uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Layout size={10} /> Leyenda
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(RELATION_COLORS).slice(0, 10).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 group cursor-default">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-[10px] capitalize font-bold text-foreground/70 group-hover:text-foreground transition-colors">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="h-8 rounded-xl gap-2 text-[10px] font-bold shadow-lg" onClick={autoLayout}>
                <Maximize size={12} /> RE-ORDENAR
              </Button>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-10">
             <div className="bg-primary/10 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-full text-[10px] font-black text-primary flex items-center gap-2">
                <Sparkles size={12} /> ARRASTRA PARA CONECTAR
             </div>
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
            <Background gap={24} size={1} color="var(--border)" />
            <Controls className="!bg-background/80 !backdrop-blur-md !border-border !rounded-xl !shadow-2xl" />
          </ReactFlow>
        </div>

      </div>
    </div>
  );
};
