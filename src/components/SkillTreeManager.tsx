'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Download, Upload, X, Check } from 'lucide-react';
import {
  db,
  getAllSkillTrees,
  createSkillTree,
  deleteSkillTree,
  exportAllData,
  importData,
  SkillTree as SkillTreeType,
} from '@/lib/db';
import { skillsData } from '@/lib/skills';

interface SkillTreeManagerProps {
  currentTreeId: number;
  onSelectTree: (id: number) => void;
}

export default function SkillTreeManager({ currentTreeId, onSelectTree }: SkillTreeManagerProps) {
  const [trees, setTrees] = useState<SkillTreeType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');
  const [newTreeDesc, setNewTreeDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadTrees = async () => {
    const allTrees = await getAllSkillTrees();
    setTrees(allTrees);
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const handleCreateTree = async () => {
    if (!newTreeName.trim()) return;
    
    setIsCreating(true);
    try {
      await createSkillTree(
        newTreeName,
        newTreeDesc,
        JSON.stringify(skillsData)
      );
      setNewTreeName('');
      setNewTreeDesc('');
      await loadTrees();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTree = async (id: number) => {
    if (confirm('确定要删除这个技能树吗？')) {
      await deleteSkillTree(id);
      await loadTrees();
      if (currentTreeId === id) {
        onSelectTree(0);
      }
    }
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-skill-tree-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      await loadTrees();
      alert('导入成功！');
    } catch (error) {
      alert('导入失败，请检查文件格式');
    }
  };

  const currentTree = trees.find((t) => t.id === currentTreeId);

  return (
    <div className="space-y-4">
      {/* Current Tree Display */}
      <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="text-sm font-medium text-slate-200">
              {currentTree?.name || '默认技能树'}
            </h3>
            <p className="text-xs text-slate-400">
              {currentTree?.description || 'AI 学习路线'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          管理
        </button>
      </div>

      {/* Tree Manager Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-200">技能树管理</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Create New Tree */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-200 mb-3">创建新技能树</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTreeName}
                    onChange={(e) => setNewTreeName(e.target.value)}
                    placeholder="技能树名称"
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg
                               text-slate-200 placeholder-slate-500 text-sm
                               focus:outline-none focus:border-orange-500/50"
                  />
                  <input
                    type="text"
                    value={newTreeDesc}
                    onChange={(e) => setNewTreeDesc(e.target.value)}
                    placeholder="描述（可选）"
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg
                               text-slate-200 placeholder-slate-500 text-sm
                               focus:outline-none focus:border-orange-500/50"
                  />
                  <button
                    onClick={handleCreateTree}
                    disabled={!newTreeName.trim() || isCreating}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg
                               text-white text-sm font-medium disabled:opacity-50
                               hover:scale-[1.02] transition-transform"
                  >
                    {isCreating ? '创建中...' : '创建'}
                  </button>
                </div>
              </div>

              {/* Tree List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-200">我的技能树</h3>
                {trees.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">暂无技能树</p>
                ) : (
                  trees.map((tree) => (
                    <div
                      key={tree.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        currentTreeId === tree.id
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <button
                        onClick={() => onSelectTree(tree.id!)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-slate-200">{tree.name}</p>
                        <p className="text-xs text-slate-400">{tree.description}</p>
                      </button>
                      <button
                        onClick={() => handleDeleteTree(tree.id!)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Import/Export */}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 
                                  bg-slate-800/40 border border-slate-700/50 rounded-xl 
                                  text-slate-300 text-sm cursor-pointer hover:border-slate-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  导入
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 p-3 
                            bg-slate-800/40 border border-slate-700/50 rounded-xl 
                            text-slate-300 text-sm hover:border-slate-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
