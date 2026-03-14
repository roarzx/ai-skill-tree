'use client';

import { memo } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useStore } from '@/lib/store';
import { SkillLevel } from '@/lib/types';

const levelColors: Record<SkillLevel, string> = {
  not_started: '#475569',
  learning: '#22d3ee',
  mastered: '#f5a623',
  expert: '#fbbf24',
};

function GlowingEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const userSkills = useStore((state) => state.userSkills);

  const sourceSkill = userSkills[data?.source as string];
  const targetSkill = userSkills[data?.target as string];

  const sourceLevel = sourceSkill?.level || 'not_started';
  const targetLevel = targetSkill?.level || 'not_started';

  const hasConnection = sourceLevel !== 'not_started' || targetLevel !== 'not_started';
  const color = levelColors[targetLevel];

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <>
      <defs>
        <linearGradient id={`edge-gradient-${data?.source}-${data?.target}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={levelColors[sourceLevel]} />
          <stop offset="100%" stopColor={levelColors[targetLevel]} />
        </linearGradient>
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: hasConnection
            ? `url(#edge-gradient-${data?.source}-${data?.target})`
            : '#475569',
          strokeWidth: hasConnection ? 2 : 1,
          filter: hasConnection ? 'url(#star-glow)' : 'none',
        }}
      />
      {hasConnection && (
        <circle r="2.5" fill={color} filter="url(#star-glow)">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
}

export default memo(GlowingEdge);
