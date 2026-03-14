'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Box, Compass, Map } from 'lucide-react';
import SkillTree from '@/components/SkillTree';
import SkillPanel from '@/components/SkillPanel';
import Dashboard from '@/components/Dashboard';
import SearchBar from '@/components/SearchBar';
import SkillTreeManager from '@/components/SkillTreeManager';
import AIAssistant from '@/components/AIAssistant';
import { useStore } from '@/lib/store';

const SkillTree3D = dynamic(() => import('@/components/SkillTree3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[750px] rounded-2xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1225 0%, #050810 100%)' }}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(245,166,35,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.08) 0%, transparent 40%)'
      }} />
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        <span className="text-amber-500/60">正在加载星图...</span>
      </div>
    </div>
  ),
});

// 固定的星星数据 - 避免 hydration mismatch
const STAR_DATA = [
  { w: 1.2, h: 1.5, t: 5.2, l: 12.3, d: 0.3, o: 0.6 },
  { w: 1.8, h: 1.2, t: 15.8, l: 25.1, d: 1.2, o: 0.4 },
  { w: 2.1, h: 2.4, t: 22.3, l: 8.7, d: 0.8, o: 0.7 },
  { w: 1.4, h: 1.6, t: 33.5, l: 45.2, d: 2.1, o: 0.5 },
  { w: 2.5, h: 2.2, t: 41.2, l: 62.8, d: 1.5, o: 0.6 },
  { w: 1.1, h: 1.3, t: 52.7, l: 18.4, d: 0.5, o: 0.3 },
  { w: 1.9, h: 2.1, t: 58.3, l: 78.9, d: 2.5, o: 0.7 },
  { w: 2.3, h: 1.8, t: 67.1, l: 33.6, d: 1.8, o: 0.5 },
  { w: 1.6, h: 1.9, t: 71.5, l: 55.3, d: 0.9, o: 0.6 },
  { w: 2.0, h: 2.3, t: 8.4, l: 88.2, d: 2.2, o: 0.4 },
  { w: 1.3, h: 1.4, t: 18.9, l: 42.7, d: 1.1, o: 0.5 },
  { w: 2.2, h: 2.0, t: 27.6, l: 71.3, d: 0.6, o: 0.7 },
  { w: 1.7, h: 1.5, t: 35.2, l: 15.9, d: 2.0, o: 0.4 },
  { w: 1.5, h: 1.8, t: 44.8, l: 59.1, d: 1.4, o: 0.6 },
  { w: 2.4, h: 2.6, t: 53.1, l: 82.5, d: 0.7, o: 0.5 },
  { w: 1.0, h: 1.2, t: 61.7, l: 28.4, d: 2.3, o: 0.3 },
  { w: 1.8, h: 2.0, t: 69.3, l: 48.7, d: 1.6, o: 0.6 },
  { w: 2.1, h: 1.7, t: 77.8, l: 65.2, d: 0.4, o: 0.7 },
  { w: 1.4, h: 1.6, t: 3.2, l: 91.8, d: 1.9, o: 0.5 },
  { w: 1.9, h: 2.2, t: 12.6, l: 37.1, d: 2.7, o: 0.4 },
  { w: 2.6, h: 2.4, t: 24.1, l: 53.9, d: 1.3, o: 0.6 },
  { w: 1.2, h: 1.4, t: 38.7, l: 22.6, d: 0.8, o: 0.5 },
  { w: 1.6, h: 1.9, t: 47.3, l: 68.4, d: 2.1, o: 0.7 },
  { w: 2.0, h: 2.1, t: 55.9, l: 11.2, d: 1.7, o: 0.4 },
  { w: 1.5, h: 1.7, t: 64.2, l: 85.7, d: 0.5, o: 0.6 },
  { w: 2.3, h: 2.5, t: 72.8, l: 39.5, d: 2.4, o: 0.5 },
  { w: 1.1, h: 1.3, t: 81.4, l: 57.8, d: 1.2, o: 0.3 },
  { w: 1.8, h: 2.0, t: 6.8, l: 74.3, d: 0.6, o: 0.7 },
  { w: 2.2, h: 1.8, t: 16.3, l: 31.9, d: 2.0, o: 0.4 },
  { w: 1.4, h: 1.6, t: 29.7, l: 46.1, d: 1.5, o: 0.6 },
  { w: 1.7, h: 2.3, t: 43.5, l: 79.6, d: 0.9, o: 0.5 },
  { w: 2.1, h: 1.9, t: 51.8, l: 14.8, d: 2.2, o: 0.7 },
  { w: 1.3, h: 1.5, t: 60.4, l: 63.2, d: 1.1, o: 0.4 },
  { w: 1.9, h: 2.1, t: 68.9, l: 27.5, d: 0.7, o: 0.6 },
  { w: 2.5, h: 2.3, t: 76.2, l: 51.6, d: 2.5, o: 0.5 },
  { w: 1.0, h: 1.2, t: 84.7, l: 88.1, d: 1.8, o: 0.3 },
  { w: 1.6, h: 1.8, t: 9.5, l: 43.3, d: 0.4, o: 0.7 },
  { w: 2.0, h: 2.4, t: 20.1, l: 66.9, d: 1.6, o: 0.4 },
  { w: 1.5, h: 1.4, t: 32.6, l: 19.7, d: 2.3, o: 0.6 },
  { w: 1.8, h: 2.2, t: 46.2, l: 71.4, d: 1.0, o: 0.5 },
  { w: 2.2, h: 1.6, t: 59.8, l: 35.2, d: 0.8, o: 0.7 },
  { w: 1.4, h: 1.9, t: 66.3, l: 58.6, d: 2.1, o: 0.4 },
  { w: 1.7, h: 2.0, t: 74.9, l: 82.1, d: 1.4, o: 0.6 },
  { w: 2.1, h: 2.3, t: 83.5, l: 24.8, d: 0.6, o: 0.5 },
  { w: 1.2, h: 1.4, t: 11.9, l: 49.5, d: 1.9, o: 0.3 },
  { w: 1.9, h: 1.7, t: 25.4, l: 75.2, d: 0.5, o: 0.7 },
  { w: 2.3, h: 2.5, t: 39.1, l: 16.8, d: 2.2, o: 0.4 },
  { w: 1.6, h: 1.8, t: 56.7, l: 87.4, d: 1.3, o: 0.6 },
  { w: 1.3, h: 1.5, t: 78.3, l: 38.9, d: 0.7, o: 0.5 },
  { w: 2.0, h: 2.2, t: 90.0, l: 60.0, d: 1.5, o: 0.4 },
];

export default function Home() {
  const selectedSkillId = useStore((state) => state.selectedSkillId);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTreeId, setCurrentTreeId] = useState(0);

  const handleSelectTree = (id: number) => {
    setCurrentTreeId(id);
  };

  return (
    <div className="min-h-screen relative">
      {/* 星空背景 */}
      <div className="starry-background" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 静态星星 - 使用固定数据避免 hydration mismatch */}
        {STAR_DATA.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: star.w + 'px',
              height: star.h + 'px',
              top: star.t + '%',
              left: star.l + '%',
              animationDelay: star.d + 's',
              opacity: star.o,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                <Compass className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 opacity-20 blur-md" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-glow-gold text-amber-400">星际</span>
                <span className="text-slate-200">技能图谱</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Map className="w-3.5 h-3.5" />
                探索你的AI学习星域
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="w-full md:w-64">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Skill Tree Manager */}
            <div className="w-full md:w-auto">
              <SkillTreeManager currentTreeId={currentTreeId} onSelectTree={handleSelectTree} />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(21, 29, 48, 0.8)', border: '1px solid rgba(245, 166, 35, 0.15)' }}>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === '2d'
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="text-sm font-medium">星图</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Box className="w-4 h-4" />
                <span className="text-sm font-medium">星域</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
              <h2 className="text-lg font-semibold text-slate-200">星域概览</h2>
            </div>
            <Dashboard />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-200">技能星图</h2>
              {searchQuery && (
                <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                  搜索: {searchQuery}
                </span>
              )}
            </div>
            {viewMode === '2d' ? (
              <div className="w-full h-[750px] rounded-2xl overflow-hidden">
                <SkillTree searchQuery={searchQuery} />
              </div>
            ) : <SkillTree3D />}
          </section>
        </div>
      </div>

      {selectedSkillId && <SkillPanel />}
      
      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
