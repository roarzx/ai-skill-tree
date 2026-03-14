'use client';

import { useState, useEffect } from 'react';
import { X, Star, BookOpen, Plus, Sparkles, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';
import { flattenSkills, skillsData } from '@/lib/skills';
import { SkillLevel } from '@/lib/types';

const allSkills = flattenSkills(skillsData);

const levelOptions: { value: SkillLevel; label: string; color: string; borderColor: string }[] = [
  { value: 'not_started', label: '未探索', color: 'bg-slate-700/80', borderColor: 'border-slate-500/30' },
  { value: 'learning', label: '探索中', color: 'bg-cyan-900/80', borderColor: 'border-cyan-400/50' },
  { value: 'mastered', label: '已点亮', color: 'bg-amber-900/80', borderColor: 'border-amber-400/50' },
  { value: 'expert', label: '星耀', color: 'bg-gradient-to-br from-amber-800 to-yellow-900', borderColor: 'border-amber-300/60' },
];

export default function SkillPanel() {
  const selectedSkillId = useStore((state) => state.selectedSkillId);
  const setSelectedSkill = useStore((state) => state.setSelectedSkill);
  const userSkill = useStore((state) =>
    selectedSkillId ? state.userSkills[selectedSkillId] : null
  );
  const updateSkillLevel = useStore((state) => state.updateSkillLevel);
  const addLearningLog = useStore((state) => state.addLearningLog);
  const learningLogs = useStore((state) => state.learningLogs);

  const [note, setNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const skill = allSkills.find((s) => s.id === selectedSkillId);

  useEffect(() => {
    if (selectedSkillId) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [selectedSkillId]);

  if (!skill) return null;

  const logs = learningLogs.filter((log) => log.skillId === selectedSkillId);

  const handleLevelChange = (level: SkillLevel) => {
    if (selectedSkillId) {
      updateSkillLevel(selectedSkillId, level);
    }
  };

  const handleAddNote = () => {
    if (note.trim() && selectedSkillId) {
      addLearningLog(selectedSkillId, note.trim());
      setNote('');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setSelectedSkill(null), 300);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`
          w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl
          transition-all duration-300 ease-out
          ${isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
          }
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(5, 8, 16, 0.98) 100%)',
          border: '1px solid rgba(245, 166, 35, 0.2)',
          boxShadow: isVisible
            ? '0 0 60px rgba(245, 166, 35, 0.12), 0 0 100px rgba(34, 211, 238, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 装饰性背景 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(245,166,35,0.4) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative p-4 md:p-6 border-b" style={{ borderColor: 'rgba(245, 166, 35, 0.15)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.05))',
                border: '1px solid rgba(245,166,35,0.3)'
              }}>
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-slate-100"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {skill.name}
                </h2>
                <p className="text-slate-500 text-xs">技能详情</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-all hover:rotate-90"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5 md:space-y-6 overflow-y-auto max-h-[60vh] relative">
          <div>
            <p className="text-slate-300 leading-relaxed">{skill.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-sm">难度等级</span>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < skill.difficulty
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              探索状态
            </h3>
            <div className="flex gap-2 flex-wrap">
              {levelOptions.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleLevelChange(opt.value)}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm
                    ${userSkill?.level === opt.value
                      ? `${opt.color} ${opt.borderColor} text-white shadow-lg scale-105`
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:scale-105 border border-slate-700/50'
                    }
                  `}
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              学习资源
            </h3>
            <ul className="space-y-2">
              {skill.resources.map((resource, i) => (
                <li
                  key={i}
                  className="text-slate-400 text-sm pl-4 border-l-2 border-amber-500/30 hover:border-cyan-400/50 transition-colors"
                >
                  {resource}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-slate-300 text-sm font-medium mb-3">航行日志</h3>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30 hover:border-amber-500/30 transition-colors"
                >
                  <p className="text-slate-300 text-sm">{log.content}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {new Date(log.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-slate-600 text-sm italic">暂无航行记录</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录你的探索心得..."
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #f5a623, #d97706)',
                  boxShadow: '0 4px 16px rgba(245, 166, 35, 0.3)',
                }}
              >
                <Plus className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
