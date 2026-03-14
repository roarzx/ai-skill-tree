'use client';

import { useEffect, useState } from 'react';
import { Target, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';
import { useStore } from '@/lib/store';
import { flattenSkills, skillsData } from '@/lib/skills';

const allSkills = flattenSkills(skillsData);
const totalSkills = allSkills.length;

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`glass-card p-4 md:p-5 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`p-2.5 md:p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-slate-100 text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const userSkills = useStore((state) => state.userSkills);
  const learningLogs = useStore((state) => state.learningLogs);

  const learnedCount = Object.values(userSkills).filter(
    (s) => s.level !== 'not_started'
  ).length;
  const masteredCount = Object.values(userSkills).filter(
    (s) => s.level === 'mastered' || s.level === 'expert'
  ).length;
  const progress = Math.round((learnedCount / totalSkills) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-amber-400" />}
          label="星域总数"
          value={totalSkills}
          color="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          label="探索中"
          value={learnedCount - masteredCount}
          color="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20"
          delay={100}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          label="已点亮"
          value={masteredCount}
          color="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20"
          delay={200}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          label="航行日志"
          value={learningLogs.length}
          color="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20"
          delay={300}
        />
      </div>

      <div className="glass-card p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-slate-400 text-sm">探索进度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{progress}%</span>
            <span className="text-slate-500 text-sm">已完成</span>
          </div>
        </div>
        <div className="h-2.5 md:h-3 rounded-full overflow-hidden" style={{ background: 'rgba(21, 29, 48, 0.8)' }}>
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f5a623, #fbbf24)',
              boxShadow: progress > 0 ? '0 0 10px rgba(245, 166, 35, 0.5)' : 'none',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>
        <div className="flex justify-between mt-2 md:mt-3 text-xs text-slate-600">
          <span>未探索</span>
          <span>{learnedCount} / {totalSkills} 已点亮</span>
        </div>
      </div>
    </div>
  );
}
