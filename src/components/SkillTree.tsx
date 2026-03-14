'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { skillsData, flattenSkills } from '@/lib/skills';
import { useStore } from '@/lib/store';
import { Skill } from '@/lib/types';
import SkillNode from './SkillNode';
import GlowingEdge from './GlowingEdge';
import ParticleBackground from './ParticleBackground';

const nodeTypes = {
  skill: SkillNode,
};

const edgeTypes = {
  glowing: GlowingEdge,
};

function buildTreeNodes(skills: Skill[], searchQuery: string = ''): { nodes: Node[]; edges: Edge[] } {
  const flatSkills = flattenSkills(skills);
  
  // Filter by search query
  let filteredSkills = flatSkills;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredSkills = flatSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query)
    );
    
    // Also include parent nodes of matched skills
    const parentIds = new Set<string>();
    filteredSkills.forEach((skill) => {
      let current = skill;
      while (current.parentId) {
        parentIds.add(current.parentId);
        const parent = flatSkills.find((s) => s.id === current.parentId);
        if (!parent) break;
        current = parent;
      }
    });
    
    const finalFiltered = flatSkills.filter(
      (skill) => filteredSkills.some((s) => s.id === skill.id) || parentIds.has(skill.id)
    );
    filteredSkills = finalFiltered;
  }
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const levelMap: Record<string, number> = {};
  const parentMap: Record<string, string> = {};

  function calculateLevels(skill: Skill, level: number) {
    levelMap[skill.id] = level;
    skill.children?.forEach((child) => {
      parentMap[child.id] = skill.id;
      calculateLevels(child, level + 1);
    });
  }
  calculateLevels(skillsData[0], 0);

  const groupedByLevel: Record<number, Skill[]> = {};
  filteredSkills.forEach((skill) => {
    const level = levelMap[skill.id];
    if (!groupedByLevel[level]) groupedByLevel[level] = [];
    groupedByLevel[level].push(skill);
  });

  const xOffset = 200;
  const yOffset = 120;

  Object.entries(groupedByLevel).forEach(([level, skillsAtLevel]) => {
    const levelNum = parseInt(level);
    const totalWidth = (skillsAtLevel.length - 1) * xOffset;
    const startX = -totalWidth / 2;

    skillsAtLevel.forEach((skill, index) => {
      const isMatched = searchQuery && (
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      nodes.push({
        id: skill.id,
        type: 'skill',
        position: {
          x: startX + index * xOffset,
          y: levelNum * yOffset,
        },
        data: { skill, highlight: isMatched },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        hidden: searchQuery ? !filteredSkills.some((s) => s.id === skill.id) : undefined,
      });

      if (parentMap[skill.id] && filteredSkills.some((s) => s.id === parentMap[skill.id])) {
        edges.push({
          id: `e-${parentMap[skill.id]}-${skill.id}`,
          source: parentMap[skill.id],
          target: skill.id,
          type: 'glowing',
          data: { source: parentMap[skill.id], target: skill.id },
          hidden: searchQuery ? (!filteredSkills.some((s) => s.id === parentMap[skill.id]) || !filteredSkills.some((s) => s.id === skill.id)) : undefined,
        });
      }
    });
  });

  return { nodes, edges };
}

function SkillTreeInner({ searchQuery = '' }: { searchQuery?: string }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildTreeNodes(skillsData, searchQuery),
    [searchQuery]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const setSelectedSkill = useStore((state) => state.setSelectedSkill);

  // Update nodes when search changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [searchQuery, initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedSkill(node.id);
    },
    [setSelectedSkill]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      attributionPosition="bottom-left"
      proOptions={{ hideAttribution: true }}
      minZoom={0.5}
      maxZoom={2}
    >
      <Background color="#1e293b" gap={30} size={1} />
      <Controls
        className="!bg-slate-800/80 !border-slate-700/50 !fill-slate-300"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(245, 166, 35, 0.15)',
          borderRadius: '8px',
        }}
      />
      <MiniMap
        nodeColor={(node) => {
          if (node.data?.highlight) return '#f59e0b';
          return '#3b82f6';
        }}
        maskColor="rgba(0, 0, 0, 0.3)"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(245, 166, 35, 0.15)',
          borderRadius: '8px',
        }}
      />
    </ReactFlow>
  );
}

export default function SkillTree({ searchQuery = '' }: { searchQuery?: string }) {
  return (
    <ReactFlowProvider>
      <SkillTreeInner searchQuery={searchQuery} />
    </ReactFlowProvider>
  );
}
