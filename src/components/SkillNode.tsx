'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '@/lib/store';
import { Skill, SkillLevel } from '@/lib/types';
import { Brain, Network, Cpu, Database, Sparkles, Hexagon } from 'lucide-react';

interface SkillNodeData {
  skill: Skill;
}

const categoryIcons: Record<string, React.ReactNode> = {
  root: <Brain className="w-4 h-4" />,
  foundation: <Network className="w-4 h-4" />,
  ml: <Network className="w-4 h-4" />,
  dl: <Cpu className="w-4 h-4" />,
  llm: <Sparkles className="w-4 h-4" />,
  application: <Sparkles className="w-4 h-4" />,
  infrastructure: <Database className="w-4 h-4" />,
  infra: <Database className="w-4 h-4" />,
};

const levelStyles: Record<SkillLevel, { bg: string; border: string; glow: string; label: string; iconColor: string }> = {
  not_started: {
    bg: 'bg-slate-800/60',
    border: 'border-slate-600/30',
    glow: '',
    label: '',
    iconColor: 'text-slate-500',
  },
  learning: {
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3),0_0_30px_rgba(34,211,238,0.15)]',
    label: '探索中',
    iconColor: 'text-cyan-400',
  },
  mastered: {
    bg: 'bg-amber-950/60',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_15px_rgba(245,166,35,0.3),0_0_30px_rgba(245,166,35,0.15)]',
    label: '已点亮',
    iconColor: 'text-amber-400',
  },
  expert: {
    bg: 'bg-gradient-to-br from-amber-950/80 to-yellow-950/60',
    border: 'border-amber-400/50',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4),0_0_40px_rgba(251,191,36,0.2)]',
    label: '星耀',
    iconColor: 'text-amber-300',
  },
};

function SkillNode({ data }: { data: SkillNodeData }) {
  const { skill } = data;
  const userSkill = useStore((state) => state.userSkills[skill.id]);
  const level = userSkill?.level || 'not_started';
  const icon = categoryIcons[skill.category] || <Sparkles className="w-4 h-4" />;
  const style = levelStyles[level];

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2 !h-2 !border ${level === 'not_started' ? '!bg-slate-500/50 !border-slate-400' : '!bg-cyan-400/50 !border-cyan-300'}`}
      />
      <div
        className={`
          relative px-5 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
          min-w-[140px] text-center backdrop-blur-sm
          ${style.bg} ${style.border} ${style.glow}
          hover:scale-105 hover:-translate-y-1
          ${level === 'expert' ? 'animate-star-glow' : ''}
        `}
      >
        {/* 六角星光背景 */}
        <div className={`absolute inset-0 opacity-15 pointer-events-none ${level === 'not_started' ? 'hidden' : ''}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className={level === 'learning' ? 'text-cyan-400/50' : level === 'mastered' ? 'text-amber-400/50' : 'text-yellow-300/50'}
            />
          </svg>
        </div>

        {/* 光泽效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={style.iconColor}>{icon}</span>
          </div>
          <div className="text-white font-semibold text-sm tracking-wide drop-shadow-md">{skill.name}</div>

          {level !== 'not_started' && (
            <div className={`text-xs mt-2 font-medium rounded-full px-2 py-0.5 inline-block border ${
              level === 'learning' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30' :
              level === 'mastered' ? 'bg-amber-900/50 text-amber-300 border-amber-500/30' :
              'bg-yellow-900/50 text-yellow-300 border-yellow-500/30'
            }`}>
              {style.label}
            </div>
          )}
        </div>

        {/* 装饰角标 - 简化 */}
        {level !== 'not_started' && (
          <>
            <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              level === 'learning' ? 'bg-cyan-400' : level === 'mastered' ? 'bg-amber-400' : 'bg-yellow-300'
            }`} />
            <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full ${
              level === 'learning' ? 'bg-cyan-400/60' : level === 'mastered' ? 'bg-amber-400/60' : 'bg-yellow-300/60'
            }`} />
          </>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-2 !h-2 !border ${level === 'not_started' ? '!bg-slate-500/50 !border-slate-400' : '!bg-cyan-400/50 !border-cyan-300'}`}
      />
    </div>
  );
}

export default memo(SkillNode);
