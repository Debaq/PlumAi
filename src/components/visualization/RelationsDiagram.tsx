import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjectStore } from '@/stores/useProjectStore';

export const RelationsDiagram = () => {
  const { activeProject } = useProjectStore();

  const { nodes, edges } = useMemo(() => {
    if (!activeProject) return { nodes: [], edges: [] };

    const nodes: Node[] = activeProject.characters.map((char, index) => ({
      id: char.id,
      data: { label: char.name },
      position: { x: (index % 5) * 200 + 50, y: Math.floor(index / 5) * 150 + 50 },
      type: 'default',
    }));

    const edges: Edge[] = [];
    activeProject.characters.forEach((char) => {
      if (char.relationships) {
        char.relationships.forEach((rel) => {
          edges.push({
            id: rel.id,
            source: char.id,
            target: rel.characterId2,
            label: rel.type,
            type: 'straight',
            animated: true,
          });
        });
      }
    });

    return { nodes, edges };
  }, [activeProject]);

  if (!activeProject) return <div>No project loaded.</div>;

  return (
    <div style={{ height: '100%', minHeight: '500px' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
